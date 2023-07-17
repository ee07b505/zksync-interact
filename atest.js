const  ethers = require("ethers");
const fs = require('fs');
const zksync = require('zksync-web3');
const erc20Abi = JSON.parse(fs.readFileSync("./ABIs/Erc20ABI.json", "utf-8"));
const zk_provider = new zksync.Provider("https://zksync-era.rpc.thirdweb.com/");


async function check_NFT_owner(address){

  const contractAddress = ethers.utils.getAddress('D07180c423F9B8CF84012aA28cC174F3c433EE29')
  const contract = new zksync.Contract(contractAddress,erc20Abi,zk_provider)
  const balance = await contract.balanceOf(address)
  if (balance.toString() === "0"){
    
    return false
  }else{
    console.log(`${address} have zksync NFT`)
    return true
  }
}

async function main(){
  //read file from address.txt
  let resultArray = []
  const address = fs.readFileSync('./address.txt','utf-8').split('\n')
  for (let i = 0; i < address.length; i++) {
    const element =  ethers.utils.getAddress(address[i]);
    const result = await check_NFT_owner(element)
    if (result){
      resultArray.push(element)
    }
  }
  //show the resultArray length,tell you how many address have NFT
  console.log("resultArray length is ",resultArray.length)
  console.log(resultArray)

}
main()