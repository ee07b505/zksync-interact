const ethers = require("ethers");
const zksync = require("zksync");
const fs = require("fs");
const { CID } = require('multiformats');
const axios = require('axios');



require("dotenv").config();


async function getTotalFeeOnline(address) {
    const data = {
      txType: 'Transfer',
      address: address,
      tokenLike: 1
    };
  
    const response = await axios.post('https://api.zksync.io/api/v0.2/fee', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(response.data.result);
    const fee =ethers.BigNumber.from(response.data.result.totalFee);
    console.log(ethers.utils.formatEther(fee));
    return fee;
  }


async function convertCIDToBytes32(cidString) {
    const cidBytes = CID.parse(cidString).bytes;
  
    // 将字节数组转换为Uint8Array
    const cidUint8Array = new Uint8Array(cidBytes.buffer, cidBytes.byteOffset, cidBytes.byteLength);
  

  
    // 如果长度超过 32 字节，则进行截取操作
    if (cidUint8Array.length > 32) {
      return ethers.utils.arrayify(cidUint8Array.slice(2));
    }
  
    // 如果长度等于 32 字节，则直接转换为 ethers.BytesLike
    return ethers.utils.arrayify(cidUint8Array);
  }

async function getZkSyncProvider(networkName) {
  let zkSyncProvider;
  try {
    zkSyncProvider = await zksync.getDefaultProvider(networkName);
  } catch (error) {
    console.log("Unable to connect to zkSync.");
    console.log(error);
  }
  return zkSyncProvider;
}

async function getEthereumProvider(networkName) {
  let ethersProvider;
  try {
    ethersProvider = new ethers.getDefaultProvider(networkName);
  } catch (error) {
    console.log("Could not connect to Rinkeby");
    console.log(error);
  }
  return ethersProvider;
}
async function initAccount(rinkebyWallet, zkSyncProvider) {
  const zkSyncWallet = await zksync.Wallet.fromEthSigner(
    rinkebyWallet,
    zkSyncProvider
  );
  return zkSyncWallet;
}

async function registerAccount(wallet) {
  console.log(`Registering the ${wallet.address()} account on zkSync`);
  if (!(await wallet.isSigningKeySet())) {
    if ((await wallet.getAccountId()) === undefined) {
      throw new Error("Unknown account");
    }
    const changePubkey = await wallet.setSigningKey({
      feeToken: "ETH",
      ethAuthType: "ECDSA",
    });
    await changePubkey.awaitReceipt();
  }
  console.log("The account is ready to work on zkSync!");
}

async function depositToZkSync(zkSyncWallet, token, amountToDeposit) {
  const deposit = await zkSyncWallet.depositToSyncFromEthereum({
    depositTo: zkSyncWallet.address(),
    token: token,
    amount: ethers.utils.parseEther(amountToDeposit),
  });
  try {
    await deposit.awaitReceipt();
  } catch (error) {
    console.log("Error while awaiting confirmation from the zkSync operators.");
    console.log(error);
  }
}

async function transfer(from, toAddress, amountToTransfer, transferFee, token) {
  const closestPackableAmount = zksync.utils.closestPackableTransactionAmount(  
    ethers.utils.parseEther(amountToTransfer)

  );
  const closestPackableFee = zksync.utils.closestPackableTransactionFee(
    ethers.utils.parseEther(transferFee)
  );
  console.log("closestPackableAmount is " + closestPackableAmount)
  console.log("closestPackableFee is " + closestPackableFee)
  const transfer = await from.syncTransfer({
    to: toAddress,
    token: token,
    amount: closestPackableAmount,
    //fee: closestPackableFee,
  });
  const transferReceipt = await transfer.awaitReceipt();
  console.log("Got transfer receipt.");
  console.log(transferReceipt);
  return transferReceipt.block.blockNumber;
}

async function getFee(transactionType, address, token, zkSyncProvider) {
  const feeInWei = await zkSyncProvider.getTransactionFee(
    transactionType,
    address,
    token
  );
  return ethers.utils.formatEther(feeInWei.totalFee.toString());
}

async function withdrawToEthereum(
  wallet,
  amountToWithdraw,
  withdrawalFee,
  token
) {
  const closestPackableAmount = zksync.utils.closestPackableTransactionAmount(
    ethers.utils.parseEther(amountToWithdraw)
  );
  const closestPackableFee = zksync.utils.closestPackableTransactionFee(
    ethers.utils.parseEther(withdrawalFee)
  );
  const withdraw = await wallet.withdrawFromSyncToEthereum({
    ethAddress: wallet.address(),
    token: token,
    amount: closestPackableAmount,
    // fee: closestPackableFee,
  });
  await withdraw.awaitVerifyReceipt();
  console.log("ZKP verification is complete");
}

async function displayZkSyncBalance(wallet) {
  const state = await wallet.getAccountState();
  if (state.committed.balances.ETH) {
    console.log(
      `Commited ETH balance for ${wallet.address()}: ${ethers.utils.formatEther(
        state.committed.balances.ETH
      )}`
    );
  } else {
    console.log(`Commited ETH balance for ${wallet.address()}: 0`);
  }
  if (state.verified.balances.ETH) {
    console.log(
      `Verified ETH balance for ${wallet.address()}: ${ethers.utils.formatEther(
        state.verified.balances.ETH
      )}`
    );
  } else {
    console.log(`Verified ETH balance for ${wallet.address()}: 0`);
  }
}

async function Mint_NFT(syncWallet) {

    // Read the file with the list of IPFS links
    const cidList = fs.readFileSync("azuki-cid.txt", "utf8").split("\n");
    // Select a random IPFS link from the list
    const randomIndex = Math.floor(Math.random() * cidList.length);
    const randomCid = cidList[randomIndex].trim();
    // Construct the URI for the mint function
    const hash = await convertCIDToBytes32(randomCid);
    console.log("Content hash:", hash);
    if (hash.length !== 32) {
        throw new Error("Content hash must be 32 bytes long");
      }
    const nft = await syncWallet.mintNFT({
        recipient: syncWallet.address(),
        contentHash: hash,
        feeToken: 'ETH',
      });
    console.log("Minting NFT...",nft.txHash);  
    return nft.txHash

}


module.exports = {
  getZkSyncProvider,
  getEthereumProvider,
  depositToZkSync,
  registerAccount,
  displayZkSyncBalance,
  transfer,
  withdrawToEthereum,
  getFee,
  initAccount,
  Mint_NFT,
  getTotalFeeOnline
};