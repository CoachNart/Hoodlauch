// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HoodLaunchToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    address public immutable creator;
    string public metadataURI;
    string public description;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory n,string memory s,address c,uint256 supply,string memory uri,string memory desc) {
        name=n; symbol=s; creator=c; metadataURI=uri; description=desc; totalSupply=supply;
        balanceOf[msg.sender]=supply;
        emit Transfer(address(0),msg.sender,supply);
    }
    function transfer(address to,uint256 amount) external returns(bool){_transfer(msg.sender,to,amount);return true;}
    function approve(address spender,uint256 amount) external returns(bool){allowance[msg.sender][spender]=amount;emit Approval(msg.sender,spender,amount);return true;}
    function transferFrom(address from,address to,uint256 amount) external returns(bool){
        uint256 allowed=allowance[from][msg.sender]; require(allowed>=amount,"allowance");
        if(allowed!=type(uint256).max) allowance[from][msg.sender]=allowed-amount;
        _transfer(from,to,amount); return true;
    }
    function _transfer(address from,address to,uint256 amount) internal {
        require(to!=address(0),"zero"); require(balanceOf[from]>=amount,"balance");
        balanceOf[from]-=amount; balanceOf[to]+=amount; emit Transfer(from,to,amount);
    }
}

contract HoodLaunchFactory {
    uint256 public constant CREATOR_FEE_BPS=100;
    uint256 public constant TOKEN_SUPPLY=1_000_000_000 ether;
    uint256 public constant INITIAL_TOKEN_RESERVE=1_000_000_000 ether;
    uint256 public constant GRADUATION_ETH=50 ether;
    address public owner;
    uint256 private _locked=1;
    address[] public allTokens;
    mapping(address=>address[]) public creatorTokens;
    mapping(address=>uint256) public claimableFees;
    mapping(address=>uint256) public ethReserve;
    mapping(address=>uint256) public tokenReserve;
    mapping(address=>bool) public graduated;

    event TokenCreated(address indexed token,address indexed creator,string name,string symbol,string metadataURI,string description,uint256 initialEth);
    event Trade(address indexed token,address indexed trader,bool indexed buy,uint256 ethAmount,uint256 tokenAmount,uint256 fee);
    event CreatorFeeAccrued(address indexed creator,uint256 amount);
    event CreatorFeeClaimed(address indexed creator,uint256 amount);
    event Graduated(address indexed token,uint256 reserve);

    modifier onlyOwner(){require(msg.sender==owner,"owner");_;}
    modifier nonReentrant(){require(_locked==1,"reentrant");_locked=2;_;_locked=1;}

    constructor(){owner=msg.sender;}

    function createToken(string calldata n,string calldata s,string calldata uri,string calldata desc) external payable returns(address token){
        require(bytes(n).length>0&&bytes(s).length>0,"invalid");
        require(bytes(s).length<=12,"symbol too long");
        require(msg.value>0,"initial ETH required");
        HoodLaunchToken t=new HoodLaunchToken(n,s,msg.sender,TOKEN_SUPPLY,uri,desc);
        token=address(t);
        allTokens.push(token); creatorTokens[msg.sender].push(token);
        ethReserve[token]=msg.value; tokenReserve[token]=INITIAL_TOKEN_RESERVE;
        emit TokenCreated(token,msg.sender,n,s,uri,desc,msg.value);
    }

    function quoteBuy(address token,uint256 ethIn) public view returns(uint256 out,uint256 fee){
        require(ethIn>0&&tokenReserve[token]>0,"inactive");
        fee=(ethIn*CREATOR_FEE_BPS)/10000;
        uint256 net=ethIn-fee; uint256 tr=tokenReserve[token]; uint256 er=ethReserve[token];
        out=(tr*net)/(er+net); require(out>0&&out<tr,"insufficient output");
    }

    function quoteSell(address token,uint256 amount) public view returns(uint256 out,uint256 fee){
        require(amount>0&&tokenReserve[token]>0,"inactive");
        uint256 tr=tokenReserve[token]; uint256 er=ethReserve[token];
        uint256 gross=(er*amount)/(tr+amount); fee=(gross*CREATOR_FEE_BPS)/10000; out=gross-fee;
        require(out>0&&gross<er,"insufficient output");
    }

    function buyToken(address token,uint256 minTokensOut) external payable nonReentrant returns(uint256 out){
        uint256 fee; (out,fee)=quoteBuy(token,msg.value);
        address creator=HoodLaunchToken(token).creator(); uint256 net=msg.value-fee;
        ethReserve[token]+=net; tokenReserve[token]-=out; claimableFees[creator]+=fee;
        require(HoodLaunchToken(token).transfer(msg.sender,out),"transfer");
        require(out>=minTokensOut,"slippage");
        emit Trade(token,msg.sender,true,msg.value,out,fee); emit CreatorFeeAccrued(creator,fee); _graduateIfReady(token);
    }

    function sellToken(address token,uint256 amount,uint256 minEthOut) external nonReentrant returns(uint256 out){
        uint256 fee; (out,fee)=quoteSell(token,amount);
        address creator=HoodLaunchToken(token).creator(); uint256 tr=tokenReserve[token]; uint256 er=ethReserve[token];
        uint256 gross=out+fee;
        require(HoodLaunchToken(token).transferFrom(msg.sender,address(this),amount),"transfer");
        require(out>=minEthOut,"slippage");
        tokenReserve[token]=tr+amount; ethReserve[token]=er-gross; claimableFees[creator]+=fee;
        emit Trade(token,msg.sender,false,gross,amount,fee); emit CreatorFeeAccrued(creator,fee);
        (bool ok,)=msg.sender.call{value:out}(""); require(ok,"ETH transfer");
    }

    function claimCreatorFees() external nonReentrant {
        uint256 amount=claimableFees[msg.sender]; require(amount>0,"nothing"); claimableFees[msg.sender]=0;
        (bool ok,)=msg.sender.call{value:amount}(""); require(ok,"transfer"); emit CreatorFeeClaimed(msg.sender,amount);
    }
    function tokenCount() external view returns(uint256){return allTokens.length;}
    function setOwner(address next) external onlyOwner{require(next!=address(0),"zero");owner=next;}
    function _graduateIfReady(address token) internal {if(!graduated[token]&&ethReserve[token]>=GRADUATION_ETH){graduated[token]=true;emit Graduated(token,ethReserve[token]);}}
    receive() external payable{revert("use factory functions");}
}
