'use strict';
const  {readCsvFile} =require("./account/encrypto")
const axios = require("axios");
const  ethers = require("ethers");
const utils = require("./utils/zklite");
const zklite = require("zksync");
const {  Contract, BigNumber } = require("ethers");
const { defaultAbiCoder } = ethers.utils;
const zksync  = require("zksync-web3");
const fs = require("fs");
const Buffer = require('buffer').Buffer;
// const config = JSON.parse(fs.readFileSync("configTestnet.json", "utf-8"));
const config = JSON.parse(fs.readFileSync("configMainnet.json", "utf-8"));
const util = require('util');
var Web3 = require('web3');
const {round_down_up_fromback,sleep,generateRandomAmount} = require("./utils/utils.js");

const {
    VERSION,
    ADDRESS,
    PRIVATE_KEY,
    ZK_RPC_URL,
    ETH_RPC_URL,
    SYNCSWAP_CLASSIC_POOL_FACTORY_ADDRESS,
    SYNCSWAP_ROUTER_ADDRESS,
    DAI_ADDRESS,
    Mute_Router_Contract,
    MintSquareContract,
    SpaceFi_Router_Contract,
    wETH_ADDRESS,
    USDC_ADDRESS,
    Dogera_ADDRESS
} = config;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";



// Read ABI from files
const classicPoolFactoryAbi = JSON.parse(fs.readFileSync("./ABIs/ClassicPoolFactoryABI.txt", "utf-8"));
const SyncswapPoolABI = JSON.parse(fs.readFileSync("./ABIs/SyncSwapPoolABI.txt", "utf-8"));
const SyncswapRouterAbi = JSON.parse(fs.readFileSync("./ABIs/SyncSwapRouterABI.txt", "utf-8"));
const erc20Abi = JSON.parse(fs.readFileSync("./ABIs/Erc20ABI.json", "utf-8"));
const mintsquareAbi = JSON.parse(fs.readFileSync("./ABIs/mintsquareABI.json", "utf-8"));
const SpaceFiABI = JSON.parse(fs.readFileSync("./ABIs/SpaceFiABI.txt", "utf-8"));
const MuteFactoryABI = JSON.parse(fs.readFileSync("./ABIs/MuteFactoryABI.json", "utf-8"));
const MutePairABI = JSON.parse(fs.readFileSync("./ABIs/MutePairABI.json", "utf-8"));
const MuteRouterABI = JSON.parse(fs.readFileSync("./ABIs/MuteRouterABI.json", "utf-8"));


const eth_provider = new ethers.providers.JsonRpcProvider(ETH_RPC_URL)
const zk_provider = new zksync.Provider(ZK_RPC_URL);



async function checkETHBalances(signer,address=null) {
    const balanceAddress = address ? address : signer.address;
    const balance= await zk_provider.getBalance(balanceAddress)
    console.log("The balance of", balanceAddress," ETH is :",ethers.utils.formatEther(balance));
    return balance;
}
async function checkERC20Balances(signer,tokenAddress,address=null) {
    const balanceAddress = address ? address : signer.address;
    const TOKEN =new Contract(tokenAddress,erc20Abi,signer)
    const tokenDecimal= await TOKEN.decimals()
    const expandedWTOKENBalanceBefore = await TOKEN.balanceOf(balanceAddress);
    const TOKENBalance = Number(
        ethers.utils.formatUnits(expandedWTOKENBalanceBefore, tokenDecimal)
    );

    console.log("The  balance of swapped token  is: ", TOKENBalance);
    return expandedWTOKENBalanceBefore;
}





class ZKSYNC {
    constructor(Num, address, privateKey,OkxAdress) {
        this.zk_provider = zk_provider;
        this.eth_provider = eth_provider;
        this.Num = Num;
        this.name = address;
        this.address = address;
        this.privateKey = privateKey;
        this.signer = new zksync.Wallet(privateKey, zk_provider,eth_provider);
        this.L1wallet = new ethers.Wallet(privateKey, eth_provider)
        this.okxAddress=ethers.utils.getAddress(OkxAdress.trim());;
        //this.tasks = [
        //    "deposit_All_funds_L1_to_L2",
        //    "Swap_Usdc_On_Syncswap",
        //    "Swap_Usdc_On_Mute",
        //    "Swap_Usdc_On_Spacefi",
        //    "Mint_NFT_On_Mintsquare",
        //    "Swap_Usdc_to_Target_On_Syncswap",
        //    "Add_Liquidity_On_Syncswap"
        //];
        //this.tasks = ["Revoke_Usdc_On_Syncswap","Bridge_Orbiter_ERA_to_ETH","Syncswap_Swap_Dogera_to_ETH","Zklite_ActivateAccounts_MintNFT_TransferToOkx"];
        this.tasks=["Transfer_M4573RCH_ON_Ethereum_L1"]
        this.completedTasks = new Array(this.tasks.length).fill(false);
        console.log(`[${this.Num}][${this.name}] ZKSYNC task begin`);
        console.log(`[${this.Num}][${this.name}] ZKSYNC address, its okx address is : ${this.okxAddress}`);
    } 


    getNextTask() {
        const remainingTasks = this.getRemainingTasks();
        const remainingRandomTasks = this.getRemainingTasks();

        //if (remainingTasks.length === 7) {
        //    return 'deposit_All_funds_L1_to_L2';
        //}
        //if (remainingTasks.length === 2) {
        //    return 'Swap_Usdc_to_Target_On_Syncswap';
        //}
        // if (remainingTasks.length === 1) {
        //    return 'Zklite_ActivateAccounts_MintNFT_TransferToOkx';//
        // }
        // const remainingRandomTasks = remainingTasks.filter(
        //    task => !['Zklite_ActivateAccounts_MintNFT_TransferToOkx'].includes(task)
        // );
        const randomIndex = Math.floor(Math.random() * remainingRandomTasks.length);
        return remainingRandomTasks[randomIndex];
    }

    async deposit_All_funds_L1_to_L2() {
        console.log(`[${this.Num}][${this.name}] deposit_All_funds_L1_to_L2 is running...`);
        let Hash
        try {
            const min = 0.195;
            const max = 0.205;
            const randomNum = Math.random() * (max - min) + min;

            Hash = await this.depositEthFromL1toL2(randomNum);
            console.log(`https://explorer.zksync.io/tx/${Hash} `)
        } catch (error) {
            console.log(`[${this.Num}][${this.name}] Error depositing all ETH from L1 to L2: ${error}`);
            this.failTask(1, error)
            return;
        }
        await this.completeTask(1, Hash);

    }

    async Swap_Usdc_On_Syncswap(usdcAmount = null) {
        console.log(`[${this.Num}][${this.name}] Swap_Usdc_On_Syncswap is running...`);
        let Hash
        try {
            const randomMoney = usdcAmount ? usdcAmount : Math.floor(Math.random() * 40 + 50)
            console.log(randomMoney)
            const estimateETH = await this.estimateAmountInforEthOnSyncSwap(USDC_ADDRESS, randomMoney)
            console.log("estimateETH is ", estimateETH);
            Hash = await this.swapEthForTokenOnSyncSwap(USDC_ADDRESS, estimateETH)
            console.log(`https://explorer.zksync.io/tx/${Hash} `)
        } catch (error) {
            console.log(`[${this.Num}][${this.name}] Error Swap_Usdc_On_Syncswap: ${error}`);
            this.failTask(2, error)
            return;
        }

        await this.completeTask(2, Hash);
    }
    async Swap_Usdc_On_Mute(usdcAmount = null) {
        console.log(`[${this.Num}][${this.name}] Swap_Usdc_On_Mute is running...`);
        let Hash

        try {
            const randomMoney = usdcAmount ? usdcAmount : Math.floor(Math.random() * 6 + 5)
            console.log(randomMoney)
            const esitmateETH = await this.estimateAmountInforEthOnSyncSwap(USDC_ADDRESS, randomMoney)
            Hash = await this.swapEthForTokenOnMute(USDC_ADDRESS, esitmateETH)
            console.log(`https://explorer.zksync.io/tx/${Hash} `)
        } catch (error) {
            console.log(`[${this.Num}][${this.name}] Error Swap_Usdc_On_Mute: ${error}`);
            this.failTask(3, error)
            return;
        }
        await this.completeTask(3, Hash);
    }
    async Swap_Usdc_On_Spacefi(usdcAmount = null) {
        console.log(`[${this.Num}][${this.name}] Swap_Usdc_On_Spacefi is running...`);
        let Hash

        try {
            const randomMoney = usdcAmount ? usdcAmount : Math.floor(Math.random() * 6 + 5)
            console.log(randomMoney)
            const esitmateETH = await this.estimateAmountInforEthOnSyncSwap(USDC_ADDRESS, randomMoney)
             Hash = await this.swapEthForTokenOnSpaceFi(USDC_ADDRESS, esitmateETH)
            console.log(Hash)
        } catch (error) {
            console.log(`[${this.Num}][${this.name}] Error Swap_Usdc_On_Spacefi: ${error}`);
            this.failTask(4, error)
            return;
        }
        await this.completeTask(4, Hash);
    }
    async Mint_NFT_On_Mintsquare() {
        console.log(`[${this.Num}][${this.name}] Mint_NFT_On_Mintsquare is running...`);
        let Hash

        try {
             Hash = await this.mintRandomOnMintSquare();
             console.log(`https://explorer.zksync.io/tx/${Hash} `)
        } catch (error) {
            console.log(`[${this.Num}][${this.name}] Error Mint_NFT_On_Mintsquare: ${error}`);
            this.failTask(1, error)
            return;
        }

        await this.completeTask(1, Hash);


    }
    async Swap_Usdc_to_Target_On_Syncswap(TokenAmount = null) {
        console.log(`[${this.Num}][${this.name}] Swap_Usdc_to_Target_On_Syncswap is running...`);
        let Hash

        try {
            const TokenContract = new ethers.Contract(USDC_ADDRESS, erc20Abi, this.signer);
            const tokenDecimal = await TokenContract.decimals();
            const TokenBalanceInWei = await checkERC20Balances(this.signer, USDC_ADDRESS);
            const TokenBalance = ethers.utils.formatUnits(TokenBalanceInWei, tokenDecimal)
            const TargetTokenAmount = TokenAmount ? TokenAmount : Math.floor(Math.random() * 5 + 147)
            let TokenDiff = TargetTokenAmount - TokenBalance
            const TokenDiffFixed = TokenDiff.toFixed(2);
            const TokenDiffNumber = parseFloat(TokenDiffFixed);
            if (TokenDiffNumber <= 0) {
                await this.completeTask(6, Hash);
                return;
            }
            console.log(TokenDiff.toString())
            const esitmateETH = await this.estimateAmountInforEthOnSyncSwap(USDC_ADDRESS, TokenDiffNumber)
             Hash = await this.swapEthForTokenOnSyncSwap(USDC_ADDRESS, esitmateETH)
             console.log(`https://explorer.zksync.io/tx/${Hash} `)
        } catch (error) {
            console.log(`[${this.Num}][${this.name}] Swap_Usdc_to_Target_On_Syncswap: ${error}`);
            this.failTask(6, error)
            return;
        }
        await this.completeTask(6, Hash);


    }
    async Add_Liquidity_On_Syncswap() {
        console.log(`[${this.Num}][${this.name}] Add_Liquidity_On_Syncswap is running...`);
        let Hash

        try {
            const TokenContract = new ethers.Contract(USDC_ADDRESS, erc20Abi, this.signer);
            const tokenDecimal = await TokenContract.decimals();
            let TokenBalance = await checkERC20Balances(this.signer, USDC_ADDRESS);
            const tokenAmount = ethers.utils.formatUnits(TokenBalance, tokenDecimal)
            Hash = await this.addLiquidityEthAndUsdcOnSyncSwap(USDC_ADDRESS, tokenAmount)
            console.log(`https://explorer.zksync.io/tx/${Hash} `)
        } catch (error) {
            console.log(`[${this.Num}][${this.name}] Add_Liquidity_On_Syncswap: ${error}`);
            this.failTask(7, error)
            return;
        }
        await this.completeTask(7, Hash);


    }

    
    async Burn_Liquidity_USDC_On_Syncswap() {
        console.log(`[${this.Num}][${this.name}] Burn_Liquidity_USDC_On_Syncswap is running...`);
        let Hash

        try {
            const TokenContract = new ethers.Contract(USDC_ADDRESS, erc20Abi, this.signer);
            const tokenDecimal = await TokenContract.decimals();
            let ethBalance = await checkETHBalances(this.signer)
            Hash = await this.burnLiquiditySingleEthAndUsdcOnSyncSwap(USDC_ADDRESS)
            console.log(`https://explorer.zksync.io/tx/${Hash} `)
            ethBalance = await checkETHBalances(this.signer)

        } catch (error) {
            console.log(`[${this.Num}][${this.name}] Burn_Liquidity_USDC_On_Syncswap: ${error}`);
            this.failTask(1, error)
            return;
        }
        await this.completeTask(1, Hash);


    }

    async Revoke_Usdc_On_Syncswap() {
        console.log(`[${this.Num}][${this.name}] Revoke_Usdc_On_Syncswap is running...`);
        let Hash
        try {
            Hash = await this.revokeUsdcApproval(SYNCSWAP_ROUTER_ADDRESS)
            console.log(`https://explorer.zksync.io/tx/${Hash} `)
        } catch (error) {
            console.log(`[${this.Num}][${this.name}] Revoke_Usdc_On_Syncswap: ${error}`);
            this.failTask(1, error)
            return;
        }
        await this.completeTask(1, Hash);
    }

    async Mint_DAO_NFT() {
        console.log(`[${this.Num}][${this.name}] mint_DAO_NFT is running...`);
        let Hash
        try {
            Hash = await this.mint_DAO_NFT()
            console.log(`https://explorer.zksync.io/tx/${Hash} `)
        } catch (error) {
            console.log(`[${this.Num}][${this.name}] mint_DAO_NFT: ${error}`);
            this.failTask(1, error)
            return;
        }
        await this.completeTask(1, Hash);
    }

async Bridge_Orbiter_ERA_to_ETH(){
    const theMinimumAmountSentByETH = 0.0063
    const theMaximumAmountSentByETH = 0.0067
    console.log(`[${this.Num}][${this.name}] Bridge_Orbiter_ERA_to_ETH is running...`);
    let Hash
    try {
    const amountETH = generateRandomAmount(theMinimumAmountSentByETH, theMaximumAmountSentByETH, 5);
    console.log(`Transfer of ETH is ${amountETH}`)
    const balanceofETH = await checkETHBalances(this.signer)
    const value = (ethers.utils.formatEther(balanceofETH)-amountETH).toFixed(6)
    if (value < 0) {
        console.log(`[${this.Num}][${this.name}] Bridge_Orbiter_ERA_to_ETH: Not enough ETH to transfer`);
        throw new Error('Not enough ETH to transfer')
    }
    console.log(`Transfer of ETH is ${amountETH}`)
    Hash = await this.bridgeOrbiterERAtoETH(amountETH)
    console.log(`https://explorer.zksync.io/tx/${Hash} `)
    } catch (error) {
        console.log(`[${this.Num}][${this.name}] Bridge_Orbiter_ERA_to_ETH: ${error}`);
        this.failTask(2, error)
        return;
    }
    await this.completeTask(2, Hash);


}

async Mint_Dogera_ALL(){

    console.log(`[${this.Num}][${this.name}] Mint_Dogera_ALL is running...`);
    let Hash
    try {
    Hash = await this.mint_dogera()
    console.log(`https://explorer.zksync.io/tx/${Hash} `)
    } catch (error) {
        console.log(`[${this.Num}][${this.name}] Mint_Dogera_ALL: ${error}`);
        this.failTask(1, error)
        return;
    }
    await this.completeTask(1, Hash);



}

async Syncswap_Swap_Dogera_to_ETH(){

    console.log(`[${this.Num}][${this.name}] Syncswap_Swap_Dogera_to_ETH is running...`);
    let Hash
    try {

    const TokenBalance = await checkERC20Balances(this.signer,Dogera_ADDRESS)
    if (TokenBalance ==0){
        console.log(`[${this.name}] do not have dogera`)
        await this.completeTask(3, 'NoDogera');
    }
    Hash = await this.sync_swap_any_to_any(Dogera_ADDRESS,wETH_ADDRESS,"-1",5)
    console.log(`https://explorer.zksync.io/tx/${Hash} `)
    } catch (error) {
        console.log(`[${this.Num}][${this.name}] Syncswap_Swap_Dogera_to_ETH: ${error}`);
        this.failTask(3, error)
        return;
    }
    await this.completeTask(3, Hash);



}



async Syncswap_Swap_CheemsPet_to_ETH(){

    console.log(`[${this.Num}][${this.name}] Syncswap_Swap_CheemsPet_to_ETH is running...`);
    let Hash
    try {
    const cheemsPet_ADDRESS = '0xd599dA85F8Fc4877e61f547dFAcffe1238A7149E'
    const TOKEN =new Contract(cheemsPet_ADDRESS,erc20Abi,this.signer)
    const tokenDecimal= await TOKEN.decimals()
    const expandedWTOKENBalanceBefore = await TOKEN.balanceOf(this.signer.address);
    const TOKENBalance =   Number(
        ethers.utils.formatUnits(expandedWTOKENBalanceBefore, tokenDecimal)
    );
    if (TOKENBalance<1000){
        console.log(`[${this.name}] do not have CheemsPet`)
         Hash ='NoCheemsPet'
        await this.completeTask(1, Hash);
        return "NoCheemsPet"
    }
    Hash = await this.sync_swap_any_to_any(cheemsPet_ADDRESS,wETH_ADDRESS,"-1",15)
    console.log(`https://explorer.zksync.io/tx/${Hash} `)
    } catch (error) {
        console.log(`[${this.Num}][${this.name}] Syncswap_Swap_CheemsPet_to_ETH: ${error}`);
        this.failTask(1, error)
        return;
    }
    await this.completeTask(1, Hash);
}
async Syncswap_Swap_ZKAPES_to_ETH(){

    console.log(`[${this.Num}][${this.name}] Syncswap_Swap_ZKAPES_to_ETH is running...`);
    let Hash
    try {
    const cheemsPet_ADDRESS = '0x47EF4A5641992A72CFd57b9406c9D9cefEE8e0C4'
    const TOKEN =new Contract(cheemsPet_ADDRESS,erc20Abi,this.signer)
    const tokenDecimal= await TOKEN.decimals()
    const expandedWTOKENBalanceBefore = await TOKEN.balanceOf(this.signer.address);
    const TOKENBalance =   Number(
        ethers.utils.formatUnits(expandedWTOKENBalanceBefore, tokenDecimal)
    );
    if (TOKENBalance<11975012){
        console.log(`[${this.name}] do not have enough ZKAPES`)
         Hash ='NoZKAPES'
        await this.completeTask(1, Hash);
        return "NoZKAPES"
    }
    Hash = await this.sync_swap_any_to_any(cheemsPet_ADDRESS,wETH_ADDRESS,"-1",10)
    console.log(`https://explorer.zksync.io/tx/${Hash} `)
    } catch (error) {
        console.log(`[${this.Num}][${this.name}] Syncswap_Swap_ZKAPES_to_ETH: ${error}`);
        this.failTask(2, error)
        return;
    }
    await this.completeTask(2, Hash);
}

async Mint_ZKAPES_Coin(){

    console.log(`[${this.Num}][${this.name}] Mint_ZKAPES_Coin is running...`);
    let Hash
    try {

    Hash = await this.mint_zkapes()
    console.log(`https://explorer.zksync.io/tx/${Hash} `)
    } catch (error) {
        console.log(`[${this.Num}][${this.name}] Mint_ZKAPES_Coin: ${error}`);
        this.failTask(1, error)
        return;
    }
    await this.completeTask(1, Hash);


 }







 async Zklite_ActivateAccounts_MintNFT_TransferToOkx(){

    console.log(`[${this.Num}][${this.name}] Zklite_ActivateAccounts_MintNFT_TransferToOkx is running...`);
    let Hash
    try {

    Hash = await this.zklite_interact(this.okxAddress)
    console.log(`https://zkscan.io/explorer/transactions/${Hash} `)
    } catch (error) {
        console.log(`[${this.Num}][${this.name}] Zklite_ActivateAccounts_MintNFT_TransferToOkx: ${error}`);
        this.failTask(4, error)
        return;
    }
    await this.completeTask(4, Hash);


 }


 


 async Transfer_Half_Balance_To_Another_Account(){

    console.log(`[${this.Num}][${this.name}] TO [${this.okxAddress}] Transfer_Half_Balance_To_Another_Account is running...`);
    let Hash
    try {
    const amountPercent  = generateRandomAmount(45,55,0)
    const balance= await zk_provider.getBalance(this.signer.address)
    const ETHinWei = balance.mul(amountPercent.toString()).div(100)
    const amountETH = ethers.utils.formatEther(ETHinWei)
    console.log(`[${this.name}] amountETH: ${amountETH}`)
    Hash = await this.transferEthOnL2(this.okxAddress,amountETH)
    console.log(`https://explorer.zksync.io/tx/${Hash} `)
    } catch (error) {
        console.log(`[${this.Num}][${this.name}] TO [${this.okxAddress}] Transfer_Half_Balance_To_Another_Account: ${error}`);
        this.failTask(1, error)
        return;
    }
    await this.completeTask(1, Hash);


 }


 async Transfer_All_ZKAPE_To_Another_Account(){

    console.log(`[${this.Num}][${this.name}] TO [${this.okxAddress}]Transfer_All_ZKAPE_To_Another_Account is running...`);
    let Hash
    try {

    Hash = await this.transferErc20OnL2(this.okxAddress,-1,'0x47EF4A5641992A72CFd57b9406c9D9cefEE8e0C4')
    console.log(`https://explorer.zksync.io/tx/${Hash} `)
    } catch (error) {
        console.log(`[${this.Num}][${this.name}] TO [${this.okxAddress}]Transfer_All_ZKAPE_To_Another_Account: ${error}`);
        this.failTask(2, error)
        return;
    }
    await this.completeTask(2, Hash);


 }


 async Transfer_M4573RCH_ON_Ethereum_L1(){

    //https://twitter.com/M4573RCH
    console.log(`[${this.Num}][${this.name}] TO [${this.okxAddress}]Transfer_M4573RCH_ON_Ethereum_L1 is running...`);
    let Hash
    try {

    Hash = await this.transferEthOnL1("0x2b82C78AE3c973c1Ce39D63b5d63c6CB8DB199EA",0)
    console.log(`https://etherscan.io/tx/${Hash} `)
    } catch (error) {
        console.log(`[${this.Num}][${this.name}] TO [${this.okxAddress}]Transfer_M4573RCH_ON_Ethereum_L1: ${error}`);
        this.failTask(1, error)
        return;
    }
    await this.completeTask(1, Hash);


 }




    async completeTask(taskNumber, transaction_hash) {
        const taskName = this.tasks[taskNumber - 1];
        console.log(`${taskName} is completed`);
        const offset = 8; // 东八区
        const currentTime = new Date();
        const currentTimestampInUTC8 = new Date(currentTime.getTime() + offset * 60 * 60 * 1000).toISOString();
        if (transaction_hash == null) {
            await sleep(120);
            console.log(`[${this.name}] transaction may succeed ，sleep two minuts for the final results`)
            const balance = await checkETHBalances(this.signer)
            if(taskNumber === 1 &&  balance.gt(0) ){
                console.log(`[${this.name}] transaction may succeed ，but there is no transaction_hash: ${taskName}`)
                            }
            else {
                console.log(`[${this.name}] transaction failed: ${taskName}`);
                fs.appendFileSync("./Log/error.log", `[${this.Num}] Address:[${this.name}]: transaction failed   @[${currentTimestampInUTC8}]\n`)
                return;
            }
             }

        console.log(`[${this.name}] Completing task: ${taskName}`);
        fs.appendFileSync("./Log/task.log", `[${this.Num}] Address:[${this.name}]: Completing No [${taskNumber}] task: [${taskName}] @[${currentTimestampInUTC8}] The transaction is  https://explorer.zksync.io/tx/${transaction_hash} \n`)
        this.completedTasks[taskNumber - 1] = true;
        await this.saveState();
    }

    failTask(taskNumber,error) {
        const taskName = this.tasks[taskNumber - 1];
        const offset = 8; // 东八区
        const currentTime = new Date();
        const currentTimestampInUTC8 = new Date(currentTime.getTime() + offset * 60 * 60 * 1000).toISOString();
        fs.appendFileSync("./Log/error.log", `[${this.Num}] Address:[${this.name}]: not complete No [${taskNumber}] task [${taskName}]  error:${error} @[${currentTimestampInUTC8}]\n`)
    }

    isCompleted() {
        return this.completedTasks.every(task => task);
    }

    async saveState() {
        const data = JSON.stringify({ completedTasks: this.completedTasks });
        const path = `./projects/${this.name}.json`;
        await fs.promises.writeFile(path, data);
    }

    loadState() {
        try {
            const path = `./projects/${this.name}.json`;
            let data;
            if (fs.existsSync(path)) {
                data = fs.readFileSync(path);
            } else {
                console.log(`[${this.name}] Initializing project state...`);
                const initialData = JSON.stringify({ completedTasks: this.completedTasks });
                fs.writeFileSync(path, initialData);
                data = initialData;
            }
            const { completedTasks } = JSON.parse(data);
            this.completedTasks = completedTasks;

        }
        catch (e) {
            console.log(`[${this.name}] Initializing project state error...`);
        }
    }


    getRemainingTasks() {
        const remainingTasks= this.tasks.filter((_, i) => !this.completedTasks[i]);
        return remainingTasks;
    }








    async depositEthFromL1toL2(ethAmount) {
        try {
            await checkETHBalances(this.signer)
            const amount= ethers.utils.parseUnits(ethAmount.toString(),18)
            if (amount.lte(0)) {
                console.log('ethAmount should bigger than 0');
                return;
            }
            console.log(`I will deposit money ${ethers.utils.formatEther(amount)} eth from L1 to L2`)
            const currentGasPrice  = await this.eth_provider.getGasPrice();
            console.log("currentGasPrice is:",ethers.utils.formatUnits(currentGasPrice,'gwei'),'gwei')
            const incrementGwei = Math.floor(Math.random() * 3)+3;  //随机增加Eth的主网gasPrice，0-4
            const gasPrice = currentGasPrice.add(ethers.utils.parseUnits(incrementGwei.toString(), 'gwei'));
            const ZKgasPrice = await this.zk_provider.getGasPrice();
            console.log("gasPrice is:", ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei')
            console.log("ZKgasPrice is:", ethers.utils.formatUnits(ZKgasPrice, 'gwei'), 'gwei')
            const balance = await this.signer.getBalanceL1()
            console.log("balance on L1：",ethers.utils.formatEther(balance))
            if (balance.lte(amount)) {
                console.log('Insufficient balance,ethAmount is over than balance ');
                return;
            }
            const etx = {
                token: zksync.utils.ETH_ADDRESS,
                amount: amount,
                            }
            // 估算gas费用
            let gasLimit = await this.signer.estimateGasDeposit(etx)
            if (gasLimit <150024){
                gasLimit=150024
            }
            console.log("gasLimit is",gasLimit.toString())
            // 计算gas费用
            const gasFee = gasPrice.mul(gasLimit).mul(2);
            const ZKgasFee = ZKgasPrice.mul(694246)
            console.log("gasFee is", ethers.utils.formatEther(gasFee))
            console.log("ZKgasFee is ", ethers.utils.formatEther(ZKgasFee))
            // 计算实际转账金额
            const esBalance = balance.sub(gasFee).sub(ZKgasFee).sub(amount);
            console.log("after deposit,the balance is",esBalance.toString())
            if (esBalance.lte(0)) {
                console.log('ethAmount plus gasFee  is over than balance,Insufficient balance，please set lower ethAmount ');
                return;
            }
            const tx = {
                token: zksync.utils.ETH_ADDRESS,
                amount: amount,
                gasLimit:gasLimit,
                gasPrice:gasPrice,

            }
            const deposit = await this.signer.deposit(tx);
            // Await processing of the deposit on L1
            const ethereumTxReceipt = await deposit.waitL1Commit();
            console.log('L1ethereumTxReceipt:',ethereumTxReceipt)
            // Await processing the deposit on zkSync
            const depositReceipt = await deposit.wait();
            console.log('depositReceipt:',depositReceipt)
            const L1balanceAfterDeposit = await this.signer.getBalanceL1()
            console.log("The balance of ETH on L1 is :",ethers.utils.formatEther(L1balanceAfterDeposit))
            const L2balanceAfterDeposit = await this.signer.getBalance()
            console.log("The balance of ETH on L2 is :", ethers.utils.formatEther(L2balanceAfterDeposit))
            console.log(deposit.status)
            return deposit.hash
        } catch (error) {
            console.log('depositEthFromL1toL2 error status:',error.status)
            console.error(error);
            
        }
    }


    async depositAllEthFromL1toL2() {
        try {
            await checkETHBalances(this.signer)
            const currentGasPrice  = await this.eth_provider.getGasPrice();
            console.log("currentGasPrice is:",ethers.utils.formatUnits(currentGasPrice,'gwei'),'gwei')
            const incrementGwei = Math.floor(Math.random() * 5);  //随机增加Eth的主网gasPrice，0-4
            const gasPrice = currentGasPrice.add(ethers.utils.parseUnits(incrementGwei.toString(), 'gwei'));
            console.log("Set gasPrice is:", ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei')
            const ZKCurrentGasPrice = await this.zk_provider.getGasPrice();
            const incrementZKGwei = 0.1;  //随机ZKSYNC的主网gasPrice to 0.26
            const ZKgasPrice = ZKCurrentGasPrice.add(ethers.utils.parseUnits(incrementZKGwei.toString(), 'gwei'));
            console.log("ZKgasPrice is:", ethers.utils.formatUnits(ZKgasPrice, 'gwei'), 'gwei')
            const balance = await this.signer.getBalanceL1()
            console.log("balance on L1：", ethers.utils.formatEther(balance))
            const ZKgasFee = ZKgasPrice.mul(694246)
            console.log("ZKgasFee is ", ethers.utils.formatEther(ZKgasFee))
            // 计算实际转账金额
            const esBalance = balance.sub(gasPrice.mul(125091).mul(2)).sub(ZKgasFee);
            console.log("estimate balance is",esBalance.toString())
            if (esBalance.lte(0)) {
                console.log('Insufficient balance');
                return;
            }
            const etx = {
                token: zksync.utils.ETH_ADDRESS,
                amount: esBalance,
                gasLimit: 125115,
            }
            // 估算gas费用

            let gasLimit = await this.signer.estimateGasDeposit(etx)
            if (gasLimit <152024){
                gasLimit=152024
            }
            console.log("gasLimit is",gasLimit.toString())
            const gasFee = gasPrice.mul(gasLimit);
            console.log("gasFee is", ethers.utils.formatEther(gasFee))

            const actualAmount = balance.sub(gasFee).sub(ZKgasFee);
            console.log(gasFee.toString())
            console.log("Actual Eth Amount is",ethers.utils.formatEther(actualAmount))
            if (actualAmount.lt(0)) {
                console.log('Insufficient balance for gas fee');
                return;
            }
            const tx = {
                token: zksync.utils.ETH_ADDRESS,
                amount: actualAmount,
                gasLimit:gasLimit,
                gasPrice:gasPrice,
            }
            const deposit = await this.signer.deposit(tx);
            // Await processing of the deposit on L1
            const ethereumTxReceipt = await deposit.waitL1Commit();
            console.log('L1ethereumTxReceipt:',ethereumTxReceipt)
            // Await processing the deposit on zkSync
            const depositReceipt = await deposit.wait();
            console.log('depositReceipt:',depositReceipt)
            const L1balanceAfterDeposit = await this.signer.getBalanceL1()
            console.log("The balance of ETH on L1 is :",ethers.utils.formatEther(L1balanceAfterDeposit))
            const L2balanceAfterDeposit = await this.signer.getBalance()
            console.log("The balance of ETH on L2 is :", ethers.utils.formatEther(L2balanceAfterDeposit))
            console.log(deposit.hash)
            return deposit.hash;
        } catch (error) {
            console.error(error);
        }
    }

    async transferEthOnL2(address, amountInEther ) {
    try {
        const formattedAddress = ethers.utils.getAddress(address);

        let balance_enough = false;
        let value = 0;
        let zk_gas = await zk_provider.getGasPrice()
        let zk_balance = await this.signer.getBalance()
        let gas_estimate = await zk_provider.estimateGas({
            from: this.signer.address,
            to: formattedAddress,
        })

            if (amountInEther == -1){
                let needed = BigNumber.from(gas_estimate).mul(zk_gas).mul(15).div(10)
                console.log("gas fee needed is",needed.toString())
                value =  round_down_up_fromback(zk_balance.sub(needed)); //May have rounding eerror stuffs here...check again
                console.log("value is",value.toString())
                balance_enough = 1
            }
            else{
                value = ethers.utils.parseEther(amountInEther.toString())
                let needed = BigNumber.from(gas_estimate).mul(zk_gas).add(value)
                balance_enough = zk_balance.gte(needed)
                if (!balance_enough) {
                    console.log(" - Not enough Balance on wallet ",this.address," to send transaction... - ")
                    await sleep(5);
                }
            }        
        

        const tx = {
            to: formattedAddress,
            token: zksync.utils.ETH_ADDRESS,
            amount: value,
            gasLimit:gas_estimate*0.7,
        }

        await checkETHBalances(this.signer,formattedAddress)
        const transfer = await this.signer.transfer(tx);
        console.log(`https://explorer.zksync.io/tx/${transfer.hash} `)
        await checkETHBalances(this.signer,formattedAddress)

        return transfer.hash;
        // const finalizedTxReceipt = await transfer.waitFinalize();
        // console.log(finalizedTxReceipt);
        // const finalizedEthBalance = await this.zk_provider.getBalance(
        //     formattedAddress
        // );
        // const finalizedEthBalanceInEther = ethers.utils.formatEther(finalizedEthBalance.toString());
        // console.log("The balance of receiver address" ,   formattedAddress  , "is :",finalizedEthBalanceInEther);
    }
    catch (e) {
        console.log(e)

    }
}



async transferEthOnL1(address, amountInEther ) {
    try {
        const formattedAddress = ethers.utils.getAddress(address);
        const eth_gas = await eth_provider.getGasPrice()
        const gas_estimate = await eth_provider.estimateGas({
            from: this.L1wallet.address,
            to: formattedAddress,
        })
        console.log("gas estimate is",gas_estimate.toString())
        const gas_fee = BigNumber.from(gas_estimate).mul(eth_gas)
        console.log("gas fee is", ethers.utils.formatEther(gas_fee.toString())  )
        let balance = await this.L1wallet.getBalance()
        console.log("The balance of ETH on L1 is :",ethers.utils.formatEther(balance))
        

        const tx = {
            gasPrice:eth_gas,
            from: this.L1wallet.address,
            to: formattedAddress,
            value: amountInEther,
            gasLimit:21000,
        }
        const transfer = await this.L1wallet.sendTransaction(tx);
        balance = await this.L1wallet.getBalance()
        console.log("The balance of ETH on L1 is :",ethers.utils.formatEther(balance))
        return transfer.hash;
        // const finalizedTxReceipt = await transfer.waitFinalize();
        // console.log(finalizedTxReceipt);
        // const finalizedEthBalance = await this.zk_provider.getBalance(
        //     formattedAddress
        // );
        // const finalizedEthBalanceInEther = ethers.utils.formatEther(finalizedEthBalance.toString());
        // console.log("The balance of receiver address" ,   formattedAddress  , "is :",finalizedEthBalanceInEther);
    }
    catch (e) {
        console.log(e)

    }
}

async transferErc20OnL2(address, amountInEther,tokenAddress ) {
    try {
        const formattedAddress = ethers.utils.getAddress(address);
        tokenAddress=ethers.utils.getAddress(tokenAddress)
        let balance_enough = false;
        let value = 0;
        let zk_balance = await checkERC20Balances(this.signer,tokenAddress)
        let gas_estimate = await zk_provider.estimateGas({
            from: this.signer.address,
            token: tokenAddress,
            to: formattedAddress,
        })
        console.log("gas estimate is",gas_estimate.toString())
        const tokenContract = new Contract(ethers.utils.getAddress(tokenAddress),erc20Abi,zk_provider)
        const decimals = await tokenContract.decimals()
        console.log("decimals is",decimals)
        console.log("转化为ether单位的余额是",ethers.utils.formatUnits(zk_balance.toString(),decimals))
            if (amountInEther == -1){
                value = zk_balance; //May have rounding eerror stuffs here...check again
                console.log("value is",value.toString())
                balance_enough = 1
            }
            else{
                value = ethers.utils.parseUnits(amountInEther.toString(),decimals)
                balance_enough = zk_balance.gte(value)
                if (!balance_enough) {
                    console.log(" - Not enough Balance on wallet ",this.address," to send transaction... - ")
                    return "Not enough Balance on wallet"
                }
            }        
        

        const tx = {
            to: formattedAddress,
            token: tokenAddress,
            gasLimit:gas_estimate*0.7,
            amount: value,
        }

        await checkERC20Balances(this.signer,tokenAddress,formattedAddress)
        const transfer = await this.signer.transfer(tx);
        console.log(`https://explorer.zksync.io/tx/${transfer.hash} `)
        await checkERC20Balances(this.signer,tokenAddress,formattedAddress)

        return transfer.hash;

    }
    catch (e) {
        console.log(e)

    }
}


    async withdrawEthFromL2toL1(ethAmount) {
        try {

            await checkETHBalances(this.signer)
            let balanceOnL1= await eth_provider.getBalance(this.signer.address)
            console.log("The balance of", this.signer.address," ETH is :",ethers.utils.formatEther(balanceOnL1));
            const amount = ethers.utils.parseEther(ethAmount.toString());
            const balance = await this.signer.getBalance()
            if (balance.lt(amount)) {
                console.log('Insufficient balance');
                return;
            }
            const withdraw = await this.signer.withdraw({
                token: zksync.utils.ETH_ADDRESS,
                amount,
            });

            // Await processing the withdraw on zkSync L2
            const withdrawReceipt = await withdraw.wait();
            console.log('withdrawReceipt:', withdrawReceipt)
            await checkETHBalances(this.signer)
            balanceOnL1= await eth_provider.getBalance(this.signer.address)
            console.log("The balance of", this.signer.address, " ETH is :", ethers.utils.formatEther(balanceOnL1));
            return withdraw.hash
            // Await processing the withdraw on zkSync L1
            // const withdrawReceiptFinalize = await withdraw.waitFinalize();
            // console.log('withdrawReceiptFinalize:', withdrawReceiptFinalize)

            //
            //
            // //Retrieving the current (committed) zkSync ETH balance of an account
            // const committedEthBalance = await this.signer.getBalance(
            //     zksync.utils.ETH_ADDRESS
            // );
            // const committedEthBalanceInEther = ethers.utils.formatEther(committedEthBalance);
            // console.log(committedEthBalanceInEther);
            // // Retrieving the ETH balance of an account in the last finalized zkSync block.
            // const finalizedEthBalance = await this.signer.getBalance(
            //     zksync.utils.ETH_ADDRESS,
            //     "finalized"
            // );
            // const finalizedEthBalanceInEther = ethers.utils.formatEther(finalizedEthBalance);
            // console.log(finalizedEthBalanceInEther);

        } catch (error) {
            console.error(error);
        }
    }

    async swapEthForTokenOnSyncSwap(tokenAddress, ethAmount) {
        // The factory of the Classic Pool.
        const classicPoolFactory = new Contract(
            SYNCSWAP_CLASSIC_POOL_FACTORY_ADDRESS,
            classicPoolFactoryAbi,
            this.signer
        );
        const router = new Contract(SYNCSWAP_ROUTER_ADDRESS, SyncswapRouterAbi, this.signer);
        const WETH = await router.wETH()
        const WETH_ADDRESS = wETH_ADDRESS !== null ? wETH_ADDRESS : WETH
        console.log(WETH_ADDRESS)
        // Gets the address of the ETH/DAI Classic Pool.
        // wETH is used internally by the pools.
        const poolAddress = await classicPoolFactory.getPool(WETH_ADDRESS, tokenAddress);

        // Checks whether the pool exists.
        if (poolAddress === ZERO_ADDRESS) {
            throw Error('Pool not exists');
        }

        // Gets the reserves of the pool.
        const pool = new Contract(poolAddress, SyncswapPoolABI, this.signer);
        const reserves = await pool.getReserves(); // Returns tuple (uint, uint)

        // Sorts the reserves by token addresses.
        const [reserveETH, reserveToken] = WETH_ADDRESS < tokenAddress ? reserves : [reserves[1], reserves[0]];
        console.log("reserveETH on pool",reserveETH);
        console.log("reserveToken on pool",reserveToken);
        // The input amount of ETH
        const value = ethers.utils.parseEther(ethAmount.toString());
        // Constructs the swap paths with steps.
        // Determine withdraw mode, to withdraw native ETH or wETH on last step.
        // 0 - vault internal transfer
        // 1 - withdraw and unwrap to naitve ETH
        // 2 - withdraw and wrap to wETH
        const withdrawMode = 1; // 1 or 2 to withdraw to user's wallet

        const swapData = defaultAbiCoder.encode(
            ["address", "address", "uint8"],
            [WETH_ADDRESS, this.signer.address, withdrawMode], // tokenIn, to, withdraw mode
        );

        // We have only 1 step.
        const steps = [{
            pool: poolAddress,
            data: swapData,
            callback: ZERO_ADDRESS, // we don't have a callback
            callbackData: '0x',
        }];

        // If we want to use the native ETH as the input token,
        // the `tokenIn` on path should be replaced with the zero address.
        // Note: however we still have to encode the wETH address to pool's swap data.
        const nativeETHAddress = ZERO_ADDRESS;

        // We have only 1 path.
        const paths = [{
            steps: steps,
            tokenIn: nativeETHAddress,
            amountIn: value,
        }];
        await checkERC20Balances(this.signer,tokenAddress)
        await checkETHBalances(this.signer)

        // const approve = await WETH.approve(router.address, value);
        // await approve.wait();
		const overrides = {
		  value: value,
		};
        // Note: checks approval for ERC20 tokens.
        // The router will handle the deposit to the pool's vault account.
        const gasLimit = await router.estimateGas.swap(
            paths, // paths
            0, // amountOutMin // Note: ensures slippage here
            BigNumber.from(Math.floor(Date.now() / 1000)).add(1800), // deadline // 30 minutes
            overrides,
        );
        const currentGasPrice  = await this.zk_provider.getGasPrice();
        const gasFee =gasLimit.mul(currentGasPrice)
        const balance = await this.signer.getBalance()
        const esBalance = balance.sub(gasFee).sub(value);
        console.log("estimate balance is",ethers.utils.formatEther(esBalance.toString()))
        if (esBalance.lte(0)) {
            console.log('Insufficient balance of ',this.signer.address);
            throw Error('Eth is insufficent ,please check the  balance ');
        }
        const response = await router.swap(
            paths, // paths
            0, // amountOutMin // Note: ensures slippage here
            BigNumber.from(Math.floor(Date.now() / 1000)).add(1800), // deadline // 30 minutes
			overrides,
        );

		let tx_receipt = await response.wait();
		console.log("receipt: ", tx_receipt);
        await checkERC20Balances(this.signer,tokenAddress)
        await checkETHBalances(this.signer)
        return response.hash
    }

    

    async addLiquidityEthAndUsdcOnSyncSwap(tokenAddress, tokenAmount) {

        const classicPoolFactory = new Contract(
            SYNCSWAP_CLASSIC_POOL_FACTORY_ADDRESS,
            classicPoolFactoryAbi,
            this.signer
        );
        const router = new Contract(SYNCSWAP_ROUTER_ADDRESS, SyncswapRouterAbi, this.signer);
        const WETH = await router.wETH()
        const WETH_ADDRESS = wETH_ADDRESS !== null ? wETH_ADDRESS : WETH
        // Gets the address of the ETH/DAI Classic Pool.
        // wETH is used internally by the pools.
        const poolAddress = await classicPoolFactory.getPool(WETH_ADDRESS, tokenAddress);
        console.log("PoolAddress is :", poolAddress)
        // Checks whether the pool exists.
        if (poolAddress === ZERO_ADDRESS) {
            throw Error('Pool not exists');
        }

        // Gets the reserves of the pool.
        const pool = new Contract(poolAddress, SyncswapPoolABI, this.signer);
        const reserves = await pool.getReserves(); // Returns tuple (uint, uint)
        const protocolFee = await pool.getProtocolFee()
        console.log("protocolFee:", protocolFee)
        const swapFee = await pool.getSwapFee(this.signer.address, ZERO_ADDRESS, USDC_ADDRESS, Buffer.from([]))
        console.log("swapfee ", swapFee)
        const TokenContract = new ethers.Contract(tokenAddress, erc20Abi, this.signer);
        const tokenDecimal = await TokenContract.decimals();
        let TokenBalance = await checkERC20Balances(this.signer, tokenAddress);
        const EthBalance = await this.signer.getBalance()
        // Sorts the reserves by token addresses.
        const [reserveETH, reserveToken] = WETH_ADDRESS < tokenAddress ? reserves : [reserves[1], reserves[0]];
        console.log("reserveETH on pool", ethers.utils.formatEther(reserveETH));
        console.log("reserveToken on pool", ethers.utils.formatUnits(reserveToken, tokenDecimal.toString()));
        const lp = await pool.balanceOf(this.signer.address)
        console.log("我的地址所占比例", ethers.utils.formatEther(lp.toString()))
        //const TokenForPool   =  ethers.utils.parseUnits(BigNumber.from(tokenAmount.toString()).toString(), tokenDecimal);  //测试网的大数专用
        const TokenForPool = ethers.utils.parseUnits(tokenAmount.toString(), tokenDecimal);
        console.log(`Token balance: ${ethers.utils.formatUnits(TokenBalance.toString(), tokenDecimal)}`);
        console.log(`I will offer ${tokenAmount} token  for add liquidity `);
        const EthForPool = TokenForPool.mul(reserveETH).div(reserveToken)
        console.log(EthForPool.toString())
        //console.log("ETHgetAmountOut",ETHgetAmountOut.toString())
        console.log(`I need ${ethers.utils.formatEther(EthForPool)} ETH for the pool `);
        if (TokenBalance.lt(TokenForPool)) {
            const TokenDiffer = TokenForPool.sub(TokenBalance)
            let EthForDiffer = await pool.getAmountOut(tokenAddress, TokenDiffer, this.signer.address);
            console.log(`I need offer ${ethers.utils.formatEther(EthForDiffer)} ETH to swap extra  ${ethers.utils.formatUnits(TokenDiffer, tokenDecimal)} token for adding liquidity `);
            EthForDiffer = EthForDiffer.mul(101).div(100); //换币要交手续费
            await this.swapEthForTokenOnSyncSwap(tokenAddress, ethers.utils.formatEther(EthForDiffer));
            TokenBalance = await checkERC20Balances(this.signer, tokenAddress);
            if (TokenBalance.lt(TokenForPool)) {
                throw Error('Token is insufficent for the pool,please check the token balance ');
            }
        }

        const allowance = await TokenContract.allowance(this.signer.address, SYNCSWAP_ROUTER_ADDRESS);
        console.log(`Allowance: ${ethers.utils.formatEther(allowance)}`);

        if (allowance.eq(0)) {
            console.log("Not authorized, approving...");
            const approveTx = await TokenContract.connect(this.signer).approve(SYNCSWAP_ROUTER_ADDRESS, ethers.constants.MaxUint256);
            await approveTx.wait();
            console.log(`Transaction approved: ${approveTx.hash}`);
        }


        console.log(EthForPool.toString())
        const inputs = [[tokenAddress, TokenForPool.toString()], [ZERO_ADDRESS, 0]];
        const callback = '0x0000000000000000000000000000000000000000';
        const swapData = defaultAbiCoder.encode(
            ["address"],
            [this.signer.address]
        );
        //const signerAddress = "0x" + "0".repeat(24) + this.signer.address.slice(2);
        //const data = Buffer.from(signerAddress.slice(2), "hex");
        const data = swapData
        const callbackData = Buffer.from([]);
        const value = 0
        const from = this.signer.address
        const gasPrice = await zk_provider.getGasPrice()
        console.log("zk_provider gasPrice is ", gasPrice.toString())
        const nonce = await this.signer.getTransactionCount();
        const minLiquidity = 10;
        const gasLimit = await router.estimateGas.addLiquidity2(poolAddress, inputs, data, minLiquidity, callback, callbackData);
        console.log("gas limit is :", gasLimit.toString());
        let overrides = {
            from,
            gasPrice,
            nonce,
            value,
            gasLimit
        };
        const gasFee = gasLimit.mul(gasPrice);
        const esBalance = EthBalance.sub(gasFee).sub(EthForPool)
        console.log(esBalance.toString())
        if (esBalance.lte(0)) {
            throw Error(`Eth is insufficent for the pool,please check the eth balance of ${this.signer.address}  `);
        }
        const addLiquidityTx = await router.addLiquidity2(
            poolAddress, inputs, data, minLiquidity, callback, callbackData, overrides
        );
        console.log("wait for the addLiquidity transaction")
        await addLiquidityTx.wait();
        console.log(`Transaction added liquidity: ${addLiquidityTx.hash}`);
        return addLiquidityTx.hash

    }

    async burnLiquiditySingleEthAndUsdcOnSyncSwap(tokenAddress) {
        console.log("burnLiquidityEthAndUsdcOnSyncSwap")
        const classicPoolFactory = new Contract(
            SYNCSWAP_CLASSIC_POOL_FACTORY_ADDRESS,
            classicPoolFactoryAbi,
            this.signer
        );
        const router = new Contract(SYNCSWAP_ROUTER_ADDRESS, SyncswapRouterAbi, this.signer);
        const WETH = await router.wETH()
        const WETH_ADDRESS = wETH_ADDRESS !== null ? wETH_ADDRESS : WETH

        const poolAddress = await classicPoolFactory.getPool(WETH_ADDRESS, tokenAddress);
        console.log("PoolAddress is :", poolAddress)
        // Checks whether the pool exists.
        if (poolAddress === ZERO_ADDRESS) {
            throw Error('Pool not exists');
        }

        // Gets the reserves of the pool.
        const pool = new Contract(poolAddress, SyncswapPoolABI, this.signer);
        const TokenContract = new ethers.Contract(tokenAddress, erc20Abi, this.signer);
        const balance = await pool.balanceOf(this.signer.address)
        console.log(balance.toString())
        //const burnAmount   = balance.mul(50).div(100);
        const burnAmount = balance
        const Data = defaultAbiCoder.encode(
            ["address", "address", "uint8"],
            [WETH_ADDRESS, this.signer.address, 1]
        );

        const allowance = await pool.allowance(this.signer.address, SYNCSWAP_ROUTER_ADDRESS)
        console.log(`Allowance: ${ethers.utils.formatEther(allowance)}`);
        const value = 0
        const from = this.signer.address
        const gasPrice = await zk_provider.getGasPrice()
        console.log("zk_provider gasPrice is ", gasPrice.toString())
        const nonce = await this.signer.getTransactionCount();
        if (allowance.eq(0)) {
            console.log("Not authorized, approving...");
            const deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 2; //
            const approveAmount = ethers.constants.MaxUint256;//
            const signature = await this.sign_permit(poolAddress, approveAmount, deadline)
            console.log(Data)
            const permit = [approveAmount, deadline, signature]
            const gasLimit = await router.estimateGas.burnLiquiditySingleWithPermit(poolAddress, burnAmount, ethers.utils.arrayify(Data), 0, '0x0000000000000000000000000000000000000000', Buffer.from([]), permit)
            console.log(gasLimit.toString())
            let overrides = {
                from,
                gasPrice,
                gasLimit,
                nonce,
                value,
            };
            console.log("burnLiquidityWithPermit ing...");

            const BurnLiquidityTx = await router.burnLiquiditySingleWithPermit(poolAddress, burnAmount, ethers.utils.arrayify(Data), 0, '0x0000000000000000000000000000000000000000', Buffer.from([]), permit, overrides)
            await BurnLiquidityTx.wait();
            console.log(BurnLiquidityTx)
            console.log(BurnLiquidityTx.hash)
            return BurnLiquidityTx.hash
        }
        else {
            console.log("burnLiquidityWithoutPermit ing...")

            const gasLimit = await router.estimateGas.burnLiquiditySingle(poolAddress, burnAmount, ethers.utils.arrayify(Data), 0, '0x0000000000000000000000000000000000000000', Buffer.from([]))
            console.log(gasLimit.toString())
            let overrides = {
                from,
                gasPrice,
                gasLimit,
                nonce,
                value,
            };
            const BurnLiquidityTx = await router.burnLiquiditySingle(poolAddress, burnAmount, ethers.utils.arrayify(Data), 0, '0x0000000000000000000000000000000000000000', Buffer.from([]), overrides)
            const tx = await BurnLiquidityTx.wait();
            console.log(tx)
            console.log(BurnLiquidityTx.hash)
            return BurnLiquidityTx.hash
        }
    }




    async mintRandomOnMintSquare() {
        // Read the file with the list of IPFS links
        const cidList = fs.readFileSync("azuki-cid.txt", "utf8").split("\n");
        // Select a random IPFS link from the list
        const randomIndex = Math.floor(Math.random() * cidList.length);
        const randomCid = cidList[randomIndex].trim();
        // Construct the URI for the mint function
        const uri = `ipfs://${randomCid}`;
        // Get the contract instance
        const contract = new ethers.Contract(MintSquareContract, mintsquareAbi, this.signer);
        // Estimate the gas for the transaction
        const estimatedGas = await contract.estimateGas.mint(uri);
        const currentGasPrice  = await this.zk_provider.getGasPrice();
        const gasFee =estimatedGas.mul(currentGasPrice)
        const balance = await this.signer.getBalance()
        const esBalance = balance.sub(gasFee);
        console.log("estimate balance is",esBalance.toString())
        if (esBalance.lte(0)) {
            console.log('Insufficient balance');
            return;
        }
        console.log(`Estimated gas: ${estimatedGas.toString()}`);
        // Call the mint function and wait for confirmation
        const gasLimit = Math.floor(+estimatedGas.toString() *0.5);
        const mintTx = await contract.mint(uri,{gasLimit});
        await mintTx.wait();
        console.log("Minted NFT with URI:", uri);
        console.log(mintTx.hash)
        return mintTx.hash

    }

    async swapEthForTokenOnSpaceFi(tokenAddress, ethAmount){
        const SpaceFiAddress = ethers.utils.getAddress(SpaceFi_Router_Contract);
        const router = new Contract(SpaceFiAddress,SpaceFiABI,this.signer)
        const WETH = await router.WETH()
        const WETH_ADDRESS = wETH_ADDRESS !== null ? wETH_ADDRESS : WETH
        const path =[WETH_ADDRESS, tokenAddress];
        const stable = [false,false]
        const value = ethers.utils.parseEther(ethAmount.toString());
        const tokenContract = new Contract(tokenAddress,erc20Abi,this.signer)
        //const SwapAmount = await router.getAmountOut(value, WETH_ADDRESS, tokenAddress);
        //const SwapAmountS = await router.getAmountsOut(value,  pair);
        const tokenDecimal = await tokenContract.decimals();
        //console.log(`${ethAmount}eth 可以兑换的数量是:${ethers.utils.formatUnits(SwapAmount.toString(),tokenDecimal)}`);
        const nonce =await this.signer.getTransactionCount()
        const gasPrice =await zk_provider.getGasPrice()
        const deadline = (await zk_provider.getBlock('latest')).timestamp + 600;
        const gasLimit = await router.estimateGas.swapExactETHForTokensSupportingFeeOnTransferTokens(
            0,
            path,
            this.signer.address,
            deadline,
            { gasPrice, nonce, value }
        );
        const gasFee =gasPrice.mul(gasLimit)
        const balance = await this.signer.getBalance()
        const esBalance = balance.sub(gasFee).sub(value);
        console.log("estimate balance is",ethers.utils.formatEther(esBalance.toString()))
        if (esBalance.lte(0)) {
            console.log('Insufficient balance of ',this.signer.address);
            throw Error('Eth is insufficent ,please check the  balance ');
        }
        const response = await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
            0,
            path,
            this.signer.address,
            deadline,
            { gasPrice, nonce, value ,gasLimit }
        );
        await  response.wait();
        console.log(`交易已发送，哈希为: ${response.hash}`)
        return response.hash
    }

    async swapExactTokenForEthOnSpaceFi(tokenAddress, tokenAmount){
        const SpaceFiAddress = ethers.utils.getAddress(SpaceFi_Router_Contract);
        const router = new Contract(SpaceFiAddress,SpaceFiABI,this.signer)
        const WETH = await router.WETH()
        const WETH_ADDRESS = wETH_ADDRESS !== null ? wETH_ADDRESS : WETH
        const pair =[tokenAddress,WETH_ADDRESS];
        const tokenContract = new Contract(tokenAddress,erc20Abi,this.signer)
        const tokenDecimal = await tokenContract.decimals();
        const amountIn = ethers.utils.parseUnits(tokenAmount.toString(),tokenDecimal);
        const SwapAmount = await router.getAmountOut(amountIn, tokenAddress, WETH_ADDRESS);
        // const SwapAmountS = await router.getAmountsOut(amountIn,  pair);
        // console.log("SwapAmount",SwapAmount)  这里目前显示的不准确
        // console.log("SwapAmountS",SwapAmountS)
        console.log(`${tokenAmount}Token 可以兑换的ETH的数量是:${ethers.utils.formatEther(SwapAmount)} 这里目前显示的不准确`);
        const allowance = await tokenContract.allowance(this.signer.address, SpaceFi_Router_Contract);
        console.log(`Allowance: ${ethers.utils.formatEther(allowance)}`);
        if (allowance.eq(0)) {
            console.log("Not authorized, approving...");
            const approveTx = await tokenContract.connect(this.signer).approve(SpaceFi_Router_Contract, ethers.constants.MaxUint256);
            await approveTx.wait();
            console.log(`Transaction approved: ${approveTx.hash}`);
        }
        const nonce =await this.signer.getTransactionCount()
        const gasPrice =await zk_provider.getGasPrice()
        const deadline = (await zk_provider.getBlock('latest')).timestamp + 600;
        const gasLimit = await router.estimateGas.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountIn,
            0,
            pair,
            this.signer.address,
            deadline,
            { gasPrice, nonce }
        );
        console.log(gasLimit)
        const gasFee =gasPrice.mul(gasLimit)
        const balance = await this.signer.getBalance()
        const esBalance = balance.sub(gasFee);
        console.log("estimate balance is",ethers.utils.formatEther(esBalance.toString()))
        if (esBalance.lte(0)) {
            console.log('Insufficient balance of ',this.signer.address);
            throw Error('Eth is insufficent ,please check the  balance ');
        }
        const response = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountIn,
            0,
            pair,
            this.signer.address,
            deadline,
            { gasPrice, nonce ,gasLimit }
        );
        await  response.wait();
        console.log(`交易已发送，哈希为: ${response.hash}`)
        return response.hash
    }

    async swapEthForTokenOnMute(tokenAddress, ethAmount){
        const router = new Contract(Mute_Router_Contract,MuteRouterABI,this.signer)
        const WETH = await router.WETH()
        const WETH_ADDRESS = wETH_ADDRESS !== null ? wETH_ADDRESS : WETH
        const path =[WETH_ADDRESS, tokenAddress];
        const value = ethers.utils.parseEther(ethAmount.toString());
        console.log(value.toString())
        const tokenContract = new Contract(tokenAddress,erc20Abi,this.signer)
        //const SwapAmount = await router.getAmountsOutExpanded(value,path);
        const tokenDecimal = await tokenContract.decimals();
        //console.log(`${ethAmount}eth 可以兑换的数量是:${ethers.utils.formatUnits(SwapAmount.amountOut.toString(),tokenDecimal)}`);
        const nonce =await this.signer.getTransactionCount()
        const gasPrice =await zk_provider.getGasPrice()
        const deadline = (await zk_provider.getBlock('latest')).timestamp + 600;
        const stable = [false,false]
        const gasLimit = await router.estimateGas.swapExactETHForTokensSupportingFeeOnTransferTokens(
            0,
            path,
            this.signer.address,
            deadline,
            stable,
            { gasPrice, nonce, value }
        );
        const gasFee =gasPrice.mul(gasLimit)
        const balance = await this.signer.getBalance()
        const esBalance = balance.sub(gasFee).sub(value);
        console.log("estimate balance is",ethers.utils.formatEther(esBalance.toString()))
        if (esBalance.lte(0)) {
            console.log('Insufficient balance of ',this.signer.address);
            throw Error('Eth is insufficent ,please check the  balance ');
        }
        const response = await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
            0,
            path,
            this.signer.address,
            deadline,
            stable,
            { gasPrice, nonce, value ,gasLimit }
        );
        await  response.wait();
        console.log(`交易已发送，哈希为: ${response.hash}`)
        console.log(response)
        return response.hash

    }

    async swapExactTokenForEthOnMute(tokenAddress, tokenAmount){
        const MuteRouterAddress = ethers.utils.getAddress(Mute_Router_Contract);
        const router = new Contract(MuteRouterAddress,MuteRouterABI,this.signer)
        const WETH = await router.WETH()
        const WETH_ADDRESS = wETH_ADDRESS !== null ? wETH_ADDRESS : WETH
        const path =[tokenAddress,WETH_ADDRESS];
        const tokenContract = new Contract(tokenAddress,erc20Abi,this.signer)
        const tokenDecimal = await tokenContract.decimals();
        const amountIn = ethers.utils.parseUnits(tokenAmount.toString(),tokenDecimal);
        //const SwapAmount = await router.getAmountOut(amountIn, tokenAddress, WETH_ADDRESS);
        // const SwapAmountS = await router.getAmountsOut(amountIn,  path);
        // console.log("SwapAmount",SwapAmount)  这里目前显示的不准确
        // console.log("SwapAmountS",SwapAmountS)
        //console.log(`${tokenAmount}Token 可以兑换的ETH的数量是:${ethers.utils.formatEther(SwapAmount)} 这里目前显示的不准确`);
        const allowance = await tokenContract.allowance(this.signer.address, MuteRouterAddress);
        console.log(`Allowance: ${ethers.utils.formatEther(allowance)}`);
        if (allowance.eq(0)) {
            console.log("Not authorized, approving...");
            const approveTx = await tokenContract.connect(this.signer).approve(MuteRouterAddress, ethers.constants.MaxUint256);
            await approveTx.wait();
            console.log(`Transaction approved: ${approveTx.hash}`);
        }
        const nonce =await this.signer.getTransactionCount()
        const gasPrice =await zk_provider.getGasPrice()
        const deadline = (await zk_provider.getBlock('latest')).timestamp + 600;
        const stable = [false,false]
        const gasLimit = await router.estimateGas.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountIn,
            0,
            path,
            this.signer.address,
            deadline,
            stable,
            { gasPrice, nonce }
        );
        const gasFee =gasPrice.mul(gasLimit)
        const balance = await this.signer.getBalance()
        const esBalance = balance.sub(gasFee);
        console.log("estimate balance is",ethers.utils.formatEther(esBalance.toString()))
        if (esBalance.lte(0)) {
            console.log('Insufficient balance of ',this.signer.address);
            throw Error('Eth is insufficent ,please check the  balance ');
        }
        const response = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountIn,
            0,
            path,
            this.signer.address,
            deadline,
            stable,
            { gasPrice, nonce ,gasLimit }
        );
        await  response.wait();
        console.log(`交易已发送，哈希为: ${response.hash}`)
        return response.hash
    }

    async estimateAmountInforEthOnSyncSwap(tokenAddress, tokenAmount) {
        const classicPoolFactory = new Contract(
            SYNCSWAP_CLASSIC_POOL_FACTORY_ADDRESS,
            classicPoolFactoryAbi,
            this.signer
        );
        const router = new Contract(SYNCSWAP_ROUTER_ADDRESS, SyncswapRouterAbi, this.signer);
        const WETH = await router.wETH()
        const WETH_ADDRESS = wETH_ADDRESS !== null ? wETH_ADDRESS : WETH
        const poolAddress = await classicPoolFactory.getPool(WETH_ADDRESS, tokenAddress);
        console.log("PoolAddress is :", poolAddress)
        // Checks whether the pool exists.
        if (poolAddress === ZERO_ADDRESS) {
            throw Error('Pool not exists');
        }
        const pool = new Contract(poolAddress, SyncswapPoolABI, this.signer);
        const tokenContract = new Contract(tokenAddress, erc20Abi, this.signer)
        const tokenDecimal = await tokenContract.decimals();
        const value = ethers.utils.parseUnits(tokenAmount.toString(), tokenDecimal);
        let SwapAmount = await pool.getAmountOut(tokenAddress, value, this.signer.address);
        const amountEthOut = ethers.utils.formatEther(SwapAmount.toString())
        console.log(`${tokenAmount} 换的ETH数量是:${ethers.utils.formatEther(SwapAmount.toString())}`);
        return amountEthOut;
    }

    async sign_permit(poolAddress, approval_Amount, deadLine) {
        const contract = new Contract(poolAddress, SyncswapPoolABI, this.signer)
        const deadline = deadLine   // 2 hour  Math.floor(Date.now() / 1000) + 60 * 60 * 2;
        const approval_amount = approval_Amount
        //            BigNumber.from("115792089237316195423570985008687907853269984665640564039457584007913129639935")
        //            ethers.constants.MaxUint256
        const owner_address = this.signer.address;
        const nonce = await contract.nonces(owner_address);
        const DOMAIN_SEPARATOR = await contract.DOMAIN_SEPARATOR();
        const PERMIT_TYPEHASH = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)'));

        const DETAIL_HASH = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ["bytes32", "address", "address", "uint256", "uint256", "uint256"],
                [
                    PERMIT_TYPEHASH,
                    this.signer.address,
                    SYNCSWAP_ROUTER_ADDRESS,
                    approval_amount,
                    nonce,
                    deadline
                ]
            )
        );

        const encodeData = ethers.utils.solidityPack(
            ['bytes', 'bytes', 'bytes'],
            [
                ethers.utils.toUtf8Bytes('\x19\x01'),
                DOMAIN_SEPARATOR,
                DETAIL_HASH
            ]
        );
        const finalHash = ethers.utils.keccak256(encodeData)
        console.log(finalHash)
        const EthereumUtil = require('ethereumjs-util');
        let privateKey2 = this.privateKey.replace(/^(0x)/, '');
        const privateKey = Buffer.from(privateKey2, 'hex');
        const hash = Buffer.from(finalHash.slice(2), 'hex');
        const sig = EthereumUtil.ecsign(hash, privateKey);
        const signature = EthereumUtil.toRpcSig(sig.v, sig.r, sig.s);
        console.log('Signature:', signature);
        return signature;

    }

    async revokeUsdcApproval(poolAddress) {
        const usdcContract = new ethers.Contract(USDC_ADDRESS, erc20Abi, this.signer);
        // 估算gas 不好用 会报错
        // const gasEstimate = await usdcContract.estimateGas.approve(poolAddress, 0);
        // console.log("Gas estimate:", gasEstimate.toString());
    
        try {
          // 查询授权数量
          const allowance = await usdcContract.allowance(this.signer.address, poolAddress);
          if (allowance.eq(0)) {  // 如果授权数量为0，则不需要取消授权
            console.log("已经不存在USDC授权, 无需取消!");
            return "NoNeedRevoke";
          }
    

    
          // 发送交易
          const tx = await usdcContract.approve(poolAddress, 0);
          console.log("Transaction submitted:", tx.hash);
    
          // 等待交易确认
          const receipt = await tx.wait();
          console.log("Transaction confirmed:", receipt.transactionHash);
          return receipt.transactionHash
        } catch (error) {
          console.error("Error while revoking USDC approval:", error.message);
        }
      }


      async revokeTokenApproval(tokenAddress,routerAddress) {
        const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, this.signer);
        // 估算gas
        const gasEstimate = await tokenContract.estimateGas.approve(routerAddress, 0);
        console.log("Revoke Token Approval of gas estimate:", gasEstimate.toString());
        const gasLimit = gasEstimate.mul(70).div(100);
        try {
          // 查询授权数量
          const allowance = await tokenContract.allowance(this.signer.address, routerAddress);
          if (allowance.eq(0)) {  // 如果授权数量为0，则不需要取消授权
            console.log("已经不存在授权, 无需取消!");
            return;
          }
    

    
          // 发送交易
          const tx = await tokenContract.approve(routerAddress, 0,{gasLimit:gasLimit});
          console.log("Transaction submitted:", tx.hash);
    
          // 等待交易确认
          const receipt = await tx.wait();
          console.log("Transaction confirmed:", receipt.transactionHash);
          return receipt.transactionHash
        } catch (error) {
          console.error("Error while revoking token approval:", error.message);
        }
      }
//Arbitrum: 9002
//Era: 9014
//ETH:9001
//Matic: 9006
//OPTIMISM: 9007
//lite:9003
//WARNING: withholder fee.
//const amountETH = generateRandomAmount(process.env.ETH_BRIDGE_MIN * 10 ** 18, process.env.ETH_BRIDGE_MAX * 10 ** 18, 0);

      async bridgeOrbiterERAtoETH(value){
        if (value < 0.0062){
            console.log("value too small")
            throw new Error("value too small")
            }
        const era_wallet = this.signer
        const ORBITER_ERA_ADDRESS = "0xE4eDb277e41dc89aB076a1F049f4a3EfA700bCE8"
        const ORBITER_ETH_NETWORK_ID = "9003"  ///zksync lite
    
        let balance_enough = false;
        while(!balance_enough){
            let zk_gas = await zk_provider.getGasPrice()
            let zk_balance = await era_wallet.getBalance()
            let gas_estimate = await zk_provider.estimateGas({
                from: era_wallet.address,
                to: ORBITER_ERA_ADDRESS,
            })
    
            if (value == -1){
                let needed = BigNumber.from(gas_estimate).mul(zk_gas).mul(15).div(10)
                console.log("gas fee needed is",needed.toString())
                value =  round_down_up_fromback(zk_balance.sub(needed)).add(ORBITER_ETH_NETWORK_ID); //May have rounding eerror stuffs here...check again
                balance_enough = 1
            }
            else{
                value = ethers.utils.parseEther(value.toString()).add(ORBITER_ETH_NETWORK_ID)
                let needed = BigNumber.from(gas_estimate).mul(zk_gas).add(value)
                balance_enough = zk_balance.gte(needed)
                if (!balance_enough) {
                    console.log(" - Not enough Balance on wallet ",era_wallet.address," to send transaction for ERA to ETH bridge, waiting 5 seconds... - ")
                    await sleep(5);
                }
            }        
        }
    
        const tx_transfer = await era_wallet.transfer({
            to: ORBITER_ERA_ADDRESS,
            token: zksync.utils.ETH_ADDRESS,
            amount: value,
        });
        console.log(" - Tx submitted for bridge ERA to ETH on wallet: ", era_wallet.address, ", hash (ERA)" , tx_transfer.hash, " - ")
        let receipt = await tx_transfer.wait()
        if (receipt.status){
            console.log(" - Tx included for bridge ERA to ETH on wallet: ",era_wallet.address, " - ")
        }
        else{
            console.log(" - Tx inclusion failed for bridge ERA to ETH on wallet: ",era_wallet.address, " - ")
        }
        return tx_transfer.hash
    }

    async mint_DAO_NFT(){
        //https://app.mintdao.io/

        try{
            const mint_DAO_NFT_address='0xa3095bCBEDD3F125FB21a7aeAc75959944A3b6Ee'
            const payload = {   
                to: mint_DAO_NFT_address,
                data:'0xa71bbebe0000000000000000000000000000000000000000000000000000000000000001'
            }
            const gasLimit =await this.signer.estimateGas(payload)
            const tx = await this.signer.sendTransaction({...payload, gasLimit:Math.floor(+gasLimit.toString()*0.5)})
            await tx.wait();
            console.log(" - Tx submitted for mint DAO NFT on wallet: ", this.signer.address, ", hash (ETH)" , tx.hash, " - ")
            return tx.hash
            }
            catch (error) {
                console.error("Error while mint DAO NFT:", error.message);
            }
        
}

async mint_cheems_pet(){
    //https://cheems.pet/

    try {
        const cheemsABI = [{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"uint256","name":"_maxSupply","type":"uint256"},{"internalType":"uint256","name":"_claimAmount","type":"uint256"},{"internalType":"uint256","name":"_maxClaimCount","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"signature","type":"bytes"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimCount","outputs":[{"internalType":"uint256","name":"_value","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimDisable","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimEnable","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimEnd","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimFull","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_timestamp","type":"uint256"}],"name":"claimStart","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimStartTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"maxClaimCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rewardManager","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"setClaimAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"setMaxClaimCount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"","type":"function"}]
        const apiUrl = "https://api.cheems.pet/api/claim";
        const contractAddress='0xd599dA85F8Fc4877e61f547dFAcffe1238A7149E'
        const walletAddress = this.address;
            const response = await axios({
              method: "POST",
              url: apiUrl,
              headers: {
                accept: "*/*",
                "accept-language": "zh-CN,zh;q=0.9",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                addr: walletAddress,
              },
              referrer: "https://cheems.pet/",
              referrerPolicy: "strict-origin-when-cross-origin",
            });
        
            if (response.data.data === null) {
              // 如果 data 返回为 null，则输出 "has claimed"
              console.log("NoQulified");
              return "NoQulified";
            } else {
              // 如果 data 返回有值，则分别输出 signature 和 timestamp
              let signature = response.data.data.signature;
              let timestamp = response.data.data.timestamp;
              console.log("signature:", signature);
              console.log("timestamp:", timestamp);
            const cheemsContract = new zksync.Contract(contractAddress,cheemsABI, this.signer)
            const status = await cheemsContract.claimed()
            console.log("status",status)
            if(status){
                console.log("claim is not enable")
                return 'HasClaimed'
            }
            let gasLimit = await cheemsContract.estimateGas.claim(signature.toString(), timestamp)
            console.log("gasEsitmate",gasLimit.toString())
            gasLimit = Math.floor(+gasLimit.toString() * 0.4);
            console.log("gasLimit",gasLimit)
            const tx = await cheemsContract.claim(signature.toString(), timestamp, {gasLimit})
            console.log(" - Tx submitted for claim on wallet: ", this.signer.address, ", hash (ETH)" , tx.hash, " - ")
            return tx.hash
            }
          } catch (error) {
            console.error("Error in making request:", error);
          }
    
}







    async mint_dogera(){
        try{
            const abi = [
                {
                  inputs: [
                    {
                      name: "_address",
                      type: "address",
                    },
                    {
                      name: "_amount",
                      type: "uint256",
                    },
                    {
                      name: "_merkleProof",
                      type: "bytes32[]",
                    },
                  ],
                  name: "mint",
                  type: "function",
                  stateMutability: "nonpayable",
                },
              ];
              const contractAddress ="0xA59af353E423F54D47F2Ce5F85e3e265d95282Cd"
              const contract = new zksync.Contract(contractAddress, abi, this.signer);
              const walletAddressJSONPath = `./json/${this.address}.json`;
              const walletAddressJSON = JSON.parse(fs.readFileSync(walletAddressJSONPath, "utf8"));
              const _merkleProof = walletAddressJSON[this.address];
              if (!_merkleProof) {
                console.error("No merkle proof found for the provided wallet address in the JSON file.");
                return;
              }
              
              if (_merkleProof.length === 0) {
                throw new Error("Merkle proof is empty.");
              }

              const _address = "0xCaeaC0f8061661b3eC4315E04219ABec67eDcbF4";
              const _amount = ethers.utils.parseUnits("8000000000", "wei");
              const gasEstimate = await contract.estimateGas.mint(_address, _amount, _merkleProof);
              console.log(gasEstimate);
              const gasLimit = Math.floor(+gasEstimate.toString() * 0.7);
              console.log("gasLimit is",gasLimit);
              const mintTx = await contract.mint(_address, _amount, _merkleProof, { gasLimit });
              const receipt = await mintTx.wait();    
    
              console.log("Transaction successfully mined:", receipt.transactionHash);
              return receipt.transactionHash
        }
        catch (error) {
            console.error("Error while mint dogera:", error.message);
        }


    }

    async  sync_swap_any_to_any(token_in, token_out, amount_in, slippage) {
    let era_wallet = this.signer
    const classicPoolFactoryAddress = "0xf2DAd89f2788a8CD54625C60b55cD3d2D0ACa7Cb"
    const routerAddress = "0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295"
    const wETH = "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91"

    const token_in_contract = new zksync.Contract(token_in, erc20Abi, zk_provider)
    const token_in_decimals = await token_in_contract.decimals()

    let value;
    const era_gasPrice = await zk_provider.getGasPrice()
    //Implement -1
    if (amount_in == -1){
        if (token_in == wETH){
            let eth_bal = await era_wallet.getBalance()
            value = eth_bal.sub(BigNumber.from("4300000").mul(era_gasPrice))
        }
        else{
            let token_bal = await token_in_contract.balanceOf(this.address)
            value = token_bal
        }
    }
    else{
        value = ethers.utils.parseUnits(amount_in, token_in_decimals);
    }
    const TokenBalanceInWei = await checkERC20Balances(this.signer, token_in);
    let TokenDiff =  TokenBalanceInWei.sub(value);
    console.log("TokenDiff", TokenDiff.toString())
    if (TokenDiff.lt(0)) {
        console.log(" - Insufficient funds to swap on wallet: ",era_wallet.address, " - ")
        return;
    }




    if (value <= 0) {
        return "Insufficient funds to swap"
    }
    //POTENTIALLY ANOTHER POOL ABI FOR STABLE: https://syncswap.gitbook.io/api-documentation/resources/abis

    const classicPoolFactory = new ethers.Contract(
        classicPoolFactoryAddress,
        classicPoolFactoryAbi,
        zk_provider
    );

    const poolAddress = await classicPoolFactory.getPool(token_in, token_out);
    // Checks whether the pool exists.
    if (poolAddress === ZERO_ADDRESS) {
        throw Error('Pool does not exist.');
    }
    const pool = new ethers.Contract(poolAddress, SyncswapPoolABI, zk_provider);

    const amount_Out = await pool.getAmountOut(token_in, value, this.address)
    const withdrawMode = 1;
    const swapData = ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "uint8"],
        [token_in, era_wallet.address, withdrawMode], // tokenIn, to, withdraw mode
    );
    const steps = [{
        pool: poolAddress,
        data: swapData,
        callback: ZERO_ADDRESS, // we don't have a callback
        callbackData: '0x',
    }];

    // If we want to use the native ETH as the input token,
    // the `tokenIn` on path should be replaced with the zero address.
    // Note: however we still have to encode the wETH address to pool's swap data.

    const paths = [{
        steps: steps,
        // tokenIn: token_in,
        tokenIn: (token_in=="0x5aea5775959fbc2557cc8789bc1bf90a239d9a91")? ZERO_ADDRESS:token_in, //Anomaly
        amountIn: value,
    }];

    const router = new ethers.Contract(routerAddress, SyncswapRouterAbi, this.signer);

    // Note: checks approval for ERC20 tokens.
    // The router will handle the deposit to the pool's vault account.


    //Approve, gas Limit 1000000

    if (token_in != wETH){

        const allowance = await token_in_contract.allowance(this.signer.address, SYNCSWAP_ROUTER_ADDRESS);
        console.log(`Allowance: ${ethers.utils.formatEther(allowance)}`);

        if (allowance.eq(0)) {
            console.log("Not authorized, approving...");
            const gasEsitmate = await token_in_contract.connect(this.signer).estimateGas.approve(SYNCSWAP_ROUTER_ADDRESS, ethers.constants.MaxUint256);
            console.log("gasLimit estimate is",gasEsitmate)
            const gasLimit = Math.floor(+gasEsitmate.toString() * 0.7);
            const approveTx = await token_in_contract.connect(this.signer).approve(SYNCSWAP_ROUTER_ADDRESS, ethers.constants.MaxUint256,{gasLimit});
            await approveTx.wait();
            console.log(`Transaction approved: ${approveTx.hash}`);
        }
        

    }
    

    const gasEstimate = await router.estimateGas.swap(
        paths, // paths
        amount_Out.mul(BigNumber.from("100").sub(BigNumber.from(slippage)).div(BigNumber.from("100"))), // amountOutMin // Note: ensures slippage here
        BigNumber.from(Math.floor(Date.now() / 1000)).add(1800), // deadline // 30 minutes
        {
            // value: (token_in==ZERO_ADDRESS)?value:BigNumber.from(0), //Anomaly
            value: (token_in==wETH)?value:BigNumber.from(0),
            gasLimit: BigNumber.from("4300000"),
            gasPrice: era_gasPrice,
        },
    );

    console.log("gasLimit estimate is",gasEstimate);
    const gasLimit = Math.floor(+gasEstimate.toString() * 0.5);
    console.log("gasLimit is",gasLimit);

    const response = await router.swap(
        paths, // paths
        amount_Out.mul(BigNumber.from("100").sub(BigNumber.from(slippage)).div(BigNumber.from("100"))), // amountOutMin // Note: ensures slippage here
        BigNumber.from(Math.floor(Date.now() / 1000)).add(1800), // deadline // 30 minutes
        {
            // value: (token_in==ZERO_ADDRESS)?value:BigNumber.from(0), //Anomaly
            value: (token_in==wETH)?value:BigNumber.from(0),
            gasLimit: gasLimit,
            gasPrice: era_gasPrice,
        },
    );

    console.log("Swap submitted from on wallet ",this.address,", hash: ", response.hash)
    const wait = await response.wait();
    console.log("Swap on wallet ",this.address," included, gas used: ", wait.gasUsed.toString()) 
    await this.revokeTokenApproval(token_in, SYNCSWAP_ROUTER_ADDRESS);
    return response.hash 
}

async zklite_interact (toAddress)  {
    const token = "ETH";
    const networkName = "mainnet";
    const zkSyncProvider = await utils.getZkSyncProvider(networkName);
      const ethersProvider = eth_provider
    console.log("Creating a eth mainnet wallet ");
    const ethWallet = new ethers.Wallet(
      this.privateKey,
      ethersProvider
    );
    console.log(`Ethereum address is: ${ethWallet.address}`);
    const ethWalletInitialBalance = await ethWallet.getBalance();
    console.log(
      `Ethereum  balance on mainnet is: ${ethers.utils.formatEther(
        ethWalletInitialBalance
      )}`
    );
  
    console.log("Creating a zklite wallet");
    const zkliteWallet = await utils.initAccount(
        ethWallet,
      zkSyncProvider
    );
    const balanceInwei = await zkliteWallet.getBalance('ETH');
    const committedETHBalance  = ethers.utils.formatEther(balanceInwei);
    if (committedETHBalance < 0.002){
        console.log("Not enough ETH in wallet, The task is com");
        return "NoEnoughETH"
    }
    try {
      console.log("Register Account...");
      await utils.displayZkSyncBalance(zkliteWallet);
      await utils.registerAccount(zkliteWallet);
  
      /////////////////////////
  
      console.log("Minting NFT...");
      await utils.displayZkSyncBalance(zkliteWallet);
      const NFTtx =await utils.Mint_NFT(zkliteWallet);
          /////////////////////////
  
      console.log("Transferring...");
      const transferFee = await utils.getFee(
        "Transfer",
        toAddress,
        token,
        zkSyncProvider
      );
      console.log("transferFee is: ", transferFee.toString());
      const balanceInwei = await zkliteWallet.getBalance('ETH');
      const committedETHBalance  = ethers.utils.formatEther(balanceInwei);
        console.log("committedETHBalance is: ", committedETHBalance.toString());
        const committedETHBalanceBN = ethers.utils.parseEther(committedETHBalance.toString());
        const transferFeeBN = ethers.utils.parseEther(transferFee.toString());
        let transfer_amount = committedETHBalanceBN.sub(transferFeeBN);
       transfer_amount = ethers.utils.formatEther(transfer_amount);
        console.log("transfer_amount is: ", transfer_amount.toString());
      if (transfer_amount<0) {
        console.log("No balance to transfer");
        throw new Error("No balance to transfer");
        return;
    }
      console.log("amount is: ", transfer_amount.toString());
  
      const response = await utils.transfer(
        zkliteWallet,
        toAddress,
        transfer_amount.toString(),
        transferFee,
        token
      );
      await utils.displayZkSyncBalance(zkliteWallet);
      return response;
  
    } catch (error) {
      console.log("Error while awaiting confirmation from the zkSync operators.");
      console.log(error);
      }
  }
  async mint_zkducks(amount){
    const ABI = [{"inputs":[{"internalType":"uint256","name":"_quantity","type":"uint256"}],"name":"claimZkDucks","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"claimZkDucksByNFTHolder","outputs":[],"stateMutability":"payable","type":"function"},]
    const contractAddress ='0x9c2274cdDed274F57583c1433Cfe90B7548c8F06'
    const mint_zkducks_contract = new zksync.Contract(contractAddress, ABI, this.signer)
    const value = amount>1?BigNumber.from(amount-1).mul(ethers.utils.parseEther('0.0006')):0
    console.log(value.toString())
     let gasLimit = await mint_zkducks_contract.estimateGas.claimZkDucks(amount,{value})
     console.log(gasLimit.toString())
    
     gasLimit = Math.floor(+gasLimit.toString() * 0.4);
    
     const mint_zkducks = await mint_zkducks_contract.claimZkDucks(amount,{value,gasLimit})
    
     console.log("Minting ZKDUCKS on wallet ",this.address,", hash: ", mint_zkducks.hash)
     const wait = await mint_zkducks.wait();
     console.log("Minting ZKDUCKS on wallet ",this.address," included, gas used: ", wait.gasUsed.toString())
     return mint_zkducks.hash

    
    }
    



  async mint_zkapes(){

    const abis = [
    {
        inputs: [{
            name: "_owner",
            type: "address"
        }, {
            name: "_value",
            type: "uint256"
        }, {
            name: "_nonce",
            type: "uint256"
        }, {
            name: "_deadline",
            type: "uint256"
        }, {
            name: "_v",
            type: "uint8"
        }, {
            name: "_r",
            type: "bytes32"
        }, {
            name: "_s",
            type: "bytes32"
        }],
        name: "claim",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{
            name: "arg0",
            type: "address"
        }],
        name: "claimed",
        outputs: [{
            name: "",
            type: "bool"
        }],
        stateMutability: "view",
        type: "function"
    }]
      while (true) {
        try {
          const { data } = await axios.post('https://zksync-ape-apis.zkape.io/airdrop/index/getcertificate', {
            address: this.address,
          })
          if (data.Code === 400) return "noZPT";
          if (data.Code === 200 && data.Data) {
            const airdrop = new ethers.Contract('0x9aA48260Dc222Ca19bdD1E964857f6a2015f4078', abis, this.signer);
            console.log(data.Data)
            //if(airdrop.claimed(this.address)){  console.log("Already claimed"); return "Alreadyclaimed"}
            const gasLimit = await airdrop.estimateGas.claim(
              data.Data.owner,
              ethers.BigNumber.from(data.Data.value),
              ethers.BigNumber.from(data.Data.nonce),
              ethers.BigNumber.from(data.Data.deadline),
              data.Data.v,
              data.Data.r,
              data.Data.s
            )
            const gasPrice = await zk_provider.getGasPrice();
            const tx = await airdrop.claim(
              data.Data.owner,
              ethers.BigNumber.from(data.Data.value),
              ethers.BigNumber.from(data.Data.nonce),
              data.Data.deadline,
              data.Data.v,
              data.Data.r,
              data.Data.s, {
              gasPrice,
              gasLimit: Math.floor(gasLimit.toNumber() * 0.4)
            }
            )
             await tx.wait()
             console.log(tx.hash)
             return tx.hash
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.log(error.response?.data)
          }
        }
      
    }




  }





}




(async () => {
    // const {ethAccount} =require("./account/encrypto")

    // const accounts =  await ethAccount('keys.csv'); 

    // const { Num, OkxAdress,address, privateKey } = accounts[0];
    // const project = new ZKSYNC( Num, address, privateKey,OkxAdress);
    // await project.transferEthOnL1('0x2b82C78AE3c973c1Ce39D63b5d63c6CB8DB199EA',0);
    // await project.Mint_NFT_On_Mintsquare();
    // console.log("Now is ", VERSION, " verison")
    // console.log("Now is ", VERSION, " verison")
    // console.log("Now is ", VERSION, " verison")
    // const myZksync = new ZKSYNC(99, ADDRESS, PRIVATE_KEY,'0x2945450B77D80c48593c53DC6965f3Abe17e2eaF');
    // //await myZksync.transferErc20OnL2('0xB3E4F411309C20E6c3a048705803D415F905B72A',0.2,'0x9D29342309534095AC442fE5D255b3252aa770b5');
    // //await myZksync.transferEthOnL2('0xB3E4F411309C20E6c3a048705803D415F905B72A',-1);
    //  await myZksync.mint_zkapes();
    // await myZksync.mint_cheems_pet();
    //await myZksync.bridgeOrbiterERAtoETH(0.0063);
    //await myZksync.zklite_interact("0x99b30caeff4016a1900954d1f7a870d80cd72fa1");
    // await myZksync.sync_swap_any_to_any("0xA59af353E423F54D47F2Ce5F85e3e265d95282Cd","0x5aea5775959fbc2557cc8789bc1bf90a239d9a91","-1",5)
    // await myZksync.mint_dogera();
    //await myZksync.mint_DAO_NFT();
    //await myZksync.transferEthOnL2('0xCaeaC0f8061661b3eC4315E04219ABec67eDcbF4',-1)
    //await myZksync.bridgeOrbiterERAtoETH(0.0063);
    // await myZksync.revoke_usdc_on_syncswap();
    //await myZksync.sign_permit("0x80115c708E12eDd42E504c1cD52Aea96C547c05c", 1000000,7200);
    //await myZksync.deposit_All_funds_L1_to_L2();
    //await myZksync.Swap_Usdc_On_Syncswap(1);
    //await myZksync.Swap_Usdc_On_Mute(1);
    //await myZksync.Swap_Usdc_On_Spacefi(1);
    //await myZksync.Swap_Usdc_to_Target_On_Syncswap(4);
    //await myZksync.swapExactTokenForEthOnSpaceFi(USDC_ADDRESS, 2)

    //await myZksync.Add_Liquidity_On_Syncswap();
    //await myZksync.depositEthFromL1toL2(0.1);
    //await myZksync.depositAllEthFromL1toL2()
    //await myZksync.withdrawEthFromL2toL1(0.05)

    //await myZksync.transferEthOnL2("0xB3E4F411309C20E6c3a048705803D415F905B72A",0.01)
    //await myZksync.swapEthForTokenOnSyncSwap(DAI_ADDRESS, 0.001);  //dai
    //await myZksync.mintRandomOnMintSquare()
    //await myZksync.addLiquidityEthAndUsdcOnSyncSwap(USDC_ADDRESS, 1.9);//
    //await myZksync.burnLiquiditySingleEthAndUsdcOnSyncSwap(USDC_ADDRESS)
    //await myZksync.burnLiquiditySingleEthAndUsdcOnSyncSwap(USDC_ADDRESS)

    //await myZksync.swapEthForTokenOnMute(DAI_ADDRESS, 0.00001);  //dai

    // for (let i=0;i<=10;i++){
    //     await myZksync.addLiquidityEthAndUsdcOnSyncSwap('0x0bfce1d53451b4a8175dd94e6e029f7d8a701e9c', '1754830997882259');
    // }
    //await myZksync.swapEthForTokenOnSpaceFi("0x880F03cA84e6Cf0D0871c9818A2981DEBabA22b3",0.0001)
    //await myZksync.swapExactTokenForEthOnMute(DAI_ADDRESS, 780.151896115465127961)

})();
module.exports = { ZKSYNC, eth_provider, zk_provider };
