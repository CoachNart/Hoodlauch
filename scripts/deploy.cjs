const hre=require('hardhat');
async function main(){const f=await hre.ethers.deployContract('HoodLaunchFactory');await f.waitForDeployment();console.log('HoodLaunchFactory:',await f.getAddress());}
main().catch(e=>{console.error(e);process.exit(1)});
