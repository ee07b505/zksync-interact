const fs = require("fs");
//parse args in command line    ,like   node app.js -a csvFile
const { parseArgs } = require("node:util") ;


//const config = JSON.parse(fs.readFileSync("configTestnet.json", "utf-8"));
const config = JSON.parse(fs.readFileSync("configMainnet.json", "utf-8"));

const {
    VERSION,csvFile
} = config;


const { ProjectManager } = require("./ProjectManager");
const {ethAccount} =require("./account/encrypto")
const { eth_provider, zk_provider}=require("./ZKSYNC")



const {
    values: { file_name },
  } = parseArgs({
    options: {
      /** 执行动作 */
      file_name: {
        type: "string",
        short: "f",
        default: '',
      },

    },
  });

async function main(){
    console.log("Now is ",VERSION," verison")
    console.log("Now is ",VERSION," verison")
    console.log("Now is ",VERSION," verison")
    eth_provider.getNetwork().then(network => {
        console.log("Connected to ETH Mainnet:", network);
    }).catch(error => {
        console.log("Error connecting to ETH Mainnet:", error);
    });
    zk_provider.getNetwork().then(network => {
        console.log("Connected to Zksync :", network);
    }).catch(error => {
        console.log("Error connecting to Zksync:", error);
    });
    const fileName = file_name?file_name:csvFile;
    console.log("Now is ",fileName," file")
    const accounts =  await ethAccount(fileName);
    const projectManager = new ProjectManager(accounts);
    projectManager.start();
}
main();
