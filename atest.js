// const axios = require("axios");

// const apiUrl = "https://api.cheems.pet/api/claim";
// const walletAddress = "0x63DA7BBf9d2AB539d61FD4e5D49B2DB05e713F43";

// async function makeRequest() {
//   try {

// const apiUrl = "https://api.cheems.pet/api/claim";
// const walletAddress = "0x63DA7BBf9d2AB539d61FD4e5D49B2DB05e713F43";
//     const response = await axios({
//       method: "POST",
//       url: apiUrl,
//       headers: {
//         accept: "*/*",
//         "accept-language": "zh-CN,zh;q=0.9",
//         "sec-fetch-dest": "empty",
//         "sec-fetch-mode": "cors",
//         "sec-fetch-site": "same-site",
//         addr: walletAddress,
//       },
//       referrer: "https://cheems.pet/",
//       referrerPolicy: "strict-origin-when-cross-origin",
//     });

//     if (response.data.data === null) {
//       // 如果 data 返回为 null，则输出 "has claimed"
//       console.log("has claimed");
//     } else {
//       // 如果 data 返回有值，则分别输出 signature 和 timestamp
//       let signature = response.data.data.signature;
//       let timestamp = response.data.data.timestamp;
//       console.log("signature:", signature);
//       console.log("timestamp:", timestamp);
//     }
//   } catch (error) {
//     console.error("Error in making request:", error);
//   }
// }

// makeRequest();

const {ethAccount} =require("./account/encrypto")
const {ethers,Contract} = require('ethers');
const {ZKSYNC} = require('./ZKSYNC');
const fs = require("fs");
const { sleep } = require("zksync/build/utils");
const { Console } = require("console");
const erc20Abi = JSON.parse(fs.readFileSync("./ABIs/Erc20ABI.json", "utf-8"));

async function main(){
  const accounts =  await ethAccount();


  const { Num, OkxAdress,address, privateKey } = accounts[34];
  const project = new ZKSYNC( Num, address, privateKey,OkxAdress);
  const cheemsPet_ADDRESS = '0xd599dA85F8Fc4877e61f547dFAcffe1238A7149E'
  const TOKEN =new Contract(cheemsPet_ADDRESS,erc20Abi,project.signer)
  const tokenDecimal= await TOKEN.decimals()
  const expandedWTOKENBalanceBefore = await TOKEN.balanceOf(project.signer.address);
  console.log(ethers.utils.formatUnits(expandedWTOKENBalanceBefore,tokenDecimal))
   if (expandedWTOKENBalanceBefore.gt("1000483484000000172377")){
      console.log(`[${project.name}]  have CheemsPet`)
  }
}

main()