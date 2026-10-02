export const factoryAbi=[
{type:'function',name:'createToken',stateMutability:'payable',inputs:[{name:'name',type:'string'},{name:'symbol',type:'string'},{name:'metadataURI',type:'string'},{name:'description',type:'string'}],outputs:[{name:'token',type:'address'}]},
{type:'function',name:'buyToken',stateMutability:'payable',inputs:[{name:'token',type:'address'},{name:'minTokensOut',type:'uint256'}],outputs:[{name:'out',type:'uint256'}]},
{type:'function',name:'sellToken',stateMutability:'nonpayable',inputs:[{name:'token',type:'address'},{name:'amount',type:'uint256'},{name:'minEthOut',type:'uint256'}],outputs:[{name:'out',type:'uint256'}]},
{type:'function',name:'claimCreatorFees',stateMutability:'nonpayable',inputs:[],outputs:[]},
{type:'function',name:'claimableFees',stateMutability:'view',inputs:[{name:'creator',type:'address'}],outputs:[{name:'amount',type:'uint256'}]},
{type:'function',name:'ethReserve',stateMutability:'view',inputs:[{name:'token',type:'address'}],outputs:[{name:'amount',type:'uint256'}]},
{type:'function',name:'tokenReserve',stateMutability:'view',inputs:[{name:'token',type:'address'}],outputs:[{name:'amount',type:'uint256'}]},
{type:'event',name:'TokenCreated',anonymous:false,inputs:[{indexed:true,name:'token',type:'address'},{indexed:true,name:'creator',type:'address'},{indexed:false,name:'name',type:'string'},{indexed:false,name:'symbol',type:'string'},{indexed:false,name:'metadataURI',type:'string'},{indexed:false,name:'initialEth',type:'uint256'}]},
{type:'event',name:'Trade',anonymous:false,inputs:[{indexed:true,name:'token',type:'address'},{indexed:true,name:'trader',type:'address'},{indexed:true,name:'buy',type:'bool'},{indexed:false,name:'ethAmount',type:'uint256'},{indexed:false,name:'tokenAmount',type:'uint256'},{indexed:false,name:'fee',type:'uint256'}]}] as const;
