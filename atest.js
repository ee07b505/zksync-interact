const ethers = require("ethers");
const utils = require("./utils/zklite");
const zksync = require("zksync");

(async () => {
  const token = "ETH";
  const networkName = "mainnet";
  const eth_rpc_url = process.env.ETH_RPC_URL;
  const zkSyncProvider = await utils.getZkSyncProvider(networkName);

  const ethersProvider = new ethers.providers.JsonRpcProvider(eth_rpc_url)
  console.log("Creating a new Rinkeby wallet for Alice");
  const aliceRinkebyWallet = new ethers.Wallet(
    process.env.ALICE_PRIVATE_KEY,
    ethersProvider
  );
  console.log(`Alice's Rinkeby address is: ${aliceRinkebyWallet.address}`);
  const aliceInitialRinkebyBalance = await aliceRinkebyWallet.getBalance();
  console.log(
    `Alice's initial balance on Rinkeby is: ${ethers.utils.formatEther(
      aliceInitialRinkebyBalance
    )}`
  );

  console.log("Creating a zkSync wallet for Alice");
  const aliceZkSyncWallet = await utils.initAccount(
    aliceRinkebyWallet,
    zkSyncProvider
  );

  //await utils.depositToZkSync(aliceZkSyncWallet, token, amountToDeposit);
  try {
    await utils.displayZkSyncBalance(aliceZkSyncWallet);
    await utils.registerAccount(aliceZkSyncWallet);

    ///////////////////////////

    console.log("Minting NFT...");
    await utils.displayZkSyncBalance(aliceZkSyncWallet);
    await utils.Mint_NFT(aliceZkSyncWallet);
        ///////////////////////////

    console.log("Transferring...");
    const transferFee = await utils.getFee(
      "Transfer",
      process.env.BOB_ADDRESS,
      token,
      zkSyncProvider
    );
    console.log("transferFee is: ", transferFee.toString());
    const balance = await aliceZkSyncWallet.getBalance('ETH');
    const raw_amount = zksync.utils.closestPackableTransactionAmount(
        balance
    );
    const fullFee = await zkSyncProvider.getTransactionFee('Transfer', process.env.BOB_ADDRESS, token);
    console.log("fullFee total is ",fullFee.totalFee.toString());
    console.log(raw_amount.toString());
    // let feeonline= await utils.getTotalFeeOnline(process.env.BOB_ADDRESS)
    // feeonline=zksync.utils.closestPackableTransactionAmount(feeonline);
    // console.log("feeonline is: ", feeonline.toString());
    const amount = zksync.utils.closestPackableTransactionAmount(
        raw_amount.sub(fullFee.totalFee) // 这个地方一倍不够 2倍还行 最终账上还剩下1块钱RMB左右
    );

    console.log("amount is: ", amount.toString());

    const response = await utils.transfer(
      aliceZkSyncWallet,
      process.env.BOB_ADDRESS,
      amount.toString(),
      fullFee.totalFee.toString(),
      token
    );
    await utils.displayZkSyncBalance(aliceZkSyncWallet);
    return response;

  } catch (error) {
    console.log("Error while awaiting confirmation from the zkSync operators.");
    console.log(error);
    }




})();





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
//    const progressBar = '��'.repeat(barLength) + '-'.repeat(50 - barLength);
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


// const { ethers } = require("ethers");

// const defaultAbiCoder = ethers.utils.defaultAbiCoder;

// const swapData = defaultAbiCoder.encode(
//     ["bytes calldata", "address", "address","bytes calldata"],
//     ["0x","0x0B5072519901F2C8c708Ba00fD75d0B39E424CF0","0x0000000000000000000000000000000000000000","0x"]
// );

// const swapData2 = defaultAbiCoder.encode(
//     ["address"],
//     ["0x0B5072519901F2C8c708Ba00fD75d0B39E424CF0"]
// );

// console.log(swapData);
// console.log(swapData2);