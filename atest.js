//const fs = require("fs");
//const zksync = require("zksync-web3");
//const { ethers, Contract, BigNumber } = require("ethers");
//const { defaultAbiCoder } = ethers.utils;
//const classicPoolFactoryAbi = JSON.parse(fs.readFileSync("./ABIs/ClassicPoolFactoryABI.txt", "utf-8"));
//const SyncswapPoolABI = JSON.parse(fs.readFileSync("./ABIs/SyncSwapPoolABI.txt", "utf-8"));
//const SyncswapRouterAbi = JSON.parse(fs.readFileSync("./ABIs/SyncSwapRouterABI.txt", "utf-8"));
//const erc20Abi = JSON.parse(fs.readFileSync("./ABIs/Erc20ABI.json", "utf-8"));
//const mintsquareAbi = JSON.parse(fs.readFileSync("./ABIs/mintsquareABI.json", "utf-8"));
//const SpaceFiABI = JSON.parse(fs.readFileSync("./ABIs/SpaceFiABI.txt", "utf-8"));
//const MuteFactoryABI = JSON.parse(fs.readFileSync("./ABIs/MuteFactoryABI.json", "utf-8"));
//const MutePairABI = JSON.parse(fs.readFileSync("./ABIs/MutePairABI.json", "utf-8"));
//const MuteRouterABI = JSON.parse(fs.readFileSync("./ABIs/MuteRouterABI.json", "utf-8"));




//const config = JSON.parse(fs.readFileSync("configMainnet.json", "utf-8"));
//const util = require('util');

//const {
//    VERSION,
//    ADDRESS,
//    PRIVATE_KEY,
//    ZK_RPC_URL,
//    ETH_RPC_URL,
//    SYNCSWAP_CLASSIC_POOL_FACTORY_ADDRESS,
//    SYNCSWAP_ROUTER_ADDRESS,
//    DAI_ADDRESS,
//    Mute_Router_Contract,
//    MintSquareContract,
//    SpaceFi_Router_Contract,
//    wETH_ADDRESS,
//    USDC_ADDRESS
//} = config;
//const eth_provider = new ethers.providers.JsonRpcProvider(ETH_RPC_URL)
//const zk_provider = new zksync.Provider(ZK_RPC_URL);
//(async () =>
//{
//    const owner_address = "0xCaeaC0f8061661b3eC4315E04219ABec67eDcbF4"
//    const pool = new Contract("0x80115c708E12eDd42E504c1cD52Aea96C547c05c", SyncswapPoolABI, zk_provider)
//    const Name = await pool.name()
//	//const WETH_ADDRESS = wETH_ADDRESS !== null ? wETH_ADDRESS : WETH
//    console.log(Name)
//    const Nonce = await pool.nonces("0xCaeaC0f8061661b3eC4315E04219ABec67eDcbF4")
//    console.log(Nonce)
//    console.log((await pool.address.toLowerCase()))

//})();

//function printProgress(current, total) {
//    const percentage = ((current / total) * 100).toFixed(2);
//    const barLength = Math.floor(percentage / 2);
//    const progressBar = '¨€'.repeat(barLength) + '-'.repeat(50 - barLength);
//    const output = `\r[${progressBar}] ${percentage}%`;
//    process.stdout.write(output);
//}

//const totalSeconds = 100;
//let currentSecond = 0;
//const timer = setInterval(() => {
//    currentSecond += 1;
//    printProgress(currentSecond, totalSeconds);
//    if (currentSecond === totalSeconds) {
//        clearInterval(timer);
//        console.log('\nDone!');
//    }
//}, 1000);


const { ethers } = require("ethers");

const defaultAbiCoder = ethers.utils.defaultAbiCoder;

const swapData = defaultAbiCoder.encode(
    ["bytes calldata", "address", "address","bytes calldata"],
    ["0x","0x0B5072519901F2C8c708Ba00fD75d0B39E424CF0","0x0000000000000000000000000000000000000000","0x"]
);

const swapData2 = defaultAbiCoder.encode(
    ["address"],
    ["0x0B5072519901F2C8c708Ba00fD75d0B39E424CF0"]
);

console.log(swapData);
console.log(swapData2);