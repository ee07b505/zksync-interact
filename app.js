const fs = require("fs");
//parse args in command line    ,like   node app.js -a csvFile
const { parseArgs } = require("node:util") ;
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const path = require('path');


//const config = JSON.parse(fs.readFileSync("configTestnet.json", "utf-8"));
const config = JSON.parse(fs.readFileSync("configMainnet.json", "utf-8"));

const {
    VERSION,csvFile
} = config;


const { ProjectManager } = require("./ProjectManager");
const {ethAccount} =require("./account/encrypto")
const { eth_provider, zk_provider}=require("./ZKSYNC")



const {
    values: { file_name,numsProcess },
  } = parseArgs({
    options: {
      /** 执行动作 */
      file_name: {
        type: "string",
        short: "f",
        default: '',
      },
      numsProcess: {
        type: "string",
        short: "c",
        default: "1",
      }

    },
  });

const fileName = file_name?file_name:csvFile;
const numProcess = numsProcess?+numsProcess:numCPUs;


async function main(){



    if (cluster.isMaster) {
      // 主进程
      console.log("Now is ",VERSION," verison")
      console.log("Now is ",VERSION," verison")
      console.log("Now is ",VERSION," verison")
      const cachePath = path.join(process.cwd(), 'cache');
      if (!fs.existsSync(cachePath)) {
          fs.mkdirSync(folderPath);
          console.log('创建cache文件夹创建！');
      }
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

      console.log("Now is ",fileName," file")
      const accounts =  await  ethAccount(fileName);
      // 创建子进程
      for (let i = 0; i < numProcess; i++) {
        const worker = cluster.fork();
        worker.send({ accounts }); // 通过IPC将变量传递给子进程

      }
    
      // 监听子进程完成任务事件
      cluster.on('exit', (worker, code, signal) => {
        console.log(`子进程 ${worker.process.pid} 已退出`);
        // 可以根据需要进行重启子进程的操作
      });
    } else {
      // 子进程
      process.on('message', (message) => {
        const accounts = message.accounts;
        const workerId = cluster.worker.id;
        const chunkSize  = Math.ceil(accounts.length / numProcess); // 每个子进程应执行的任务数
        console.log(`  切片成 ${numProcess} 个子进程，每个子进程执行 ${chunkSize} 个任务`);
        const splitArray = [];
        for (let i = 0; i < accounts.length; i += chunkSize) {
          const chunk = accounts.slice(i, i + chunkSize); // 切割原数组，获取子数组
          splitArray.push(chunk); // 将子数组添加到结果数组中
        }
        // 执行任务的函数
        const executeTask = async () => {
          // 这里是具体的任务逻辑
          // 你可以根据需求将任务根据子进程数量进行切片
          console.log(`子进程 ${workerId} 执行任务`);
          const projectManager = new ProjectManager(splitArray[workerId - 1]);
          await projectManager.start();
          console.log(`${ splitArray[workerId-1][0].Num}-${ splitArray[workerId - 1][splitArray[workerId - 1].length - 1].Num} 的任务执行完毕`)
          process.exit()
        };
      
        // 执行任务
        executeTask();




      });


    }






}
main();
