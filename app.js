const fs = require("fs");
const config = JSON.parse(fs.readFileSync("configTestnet.json", "utf-8"));
const {
    VERSION,
} = config;

const { ProjectManager } = require("./ProjectManager");
const {ethAccount} =require("./account/encrypto")
const { eth_provider, zk_provider}=require("./ZKSYNC")
// 读取csv文件并解析数据

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
    const accounts =  await ethAccount();
    const projectManager = new ProjectManager(accounts);
    // 开始运行任务
    projectManager.start();
}
main();
