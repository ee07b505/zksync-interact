const ethers = require('ethers');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const crypto = require('crypto-js');
const readline = require('readline-sync');
const fs = require('fs');

// 加密私钥
function encryptPrivateKey(privateKey, password) {
  const encrypted = crypto.AES.encrypt(privateKey, password).toString();
  return encrypted;
}

// 解密私钥
function decryptPrivateKey(encryptedPrivateKey, password) {
  const bytes = crypto.AES.decrypt(encryptedPrivateKey, password);
  const privateKey = bytes.toString(crypto.enc.Utf8);
  return privateKey;
}

// 解锁加密的私钥
function unlockPrivateKey(encryptedPrivateKey, password) {
  const privateKey = decryptPrivateKey(encryptedPrivateKey, password);
  const wallet = new ethers.Wallet(privateKey);
  return { address: wallet.address, privateKey: wallet.privateKey };
}

// 读取CSV文件
async function readCsvFile(fileName) {
  const contents = await fs.promises.readFile(fileName, 'utf-8');
  const records = contents.split('\n').map(record => {
    const [address, encryptedPrivateKey, okxAddress] = record.split(',');
    return { address, encryptedPrivateKey, okxAddress};
  });
  return records.slice(1, records.length - 1);
}

// 解锁所有钱包的私钥
async function ethAccount(fileName="keys.csv") {
	const password = readline.question('Please enter password: ', { hideEchoBack: true });
	const records = await readCsvFile(fileName, { skipLines: 1 });
	const unlockedKeys = [];
	for (let Num = 0; Num < records.length; Num++) {
	  const record = records[Num];
	  const unlockedKey = unlockPrivateKey(record.encryptedPrivateKey, password);
    const OkxAdress = record.okxAddress.trim();
	  unlockedKeys.push({ Num, OkxAdress, ...unlockedKey });

	}

	return unlockedKeys
  


}


async function ethAccount2(fileName = 'keys.csv', accountFileName = 'accounts.csv') {
const password = readline.question('Please enter password: ', { hideEchoBack: true });
const records = await readCsvFile(fileName);
const unlockedKeys = [];
for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const unlockedKey = unlockPrivateKey(record.encryptedPrivateKey, password);
    unlockedKeys.push(unlockedKey);
    }
await writeToCsvFile(accountFileName, unlockedKeys);
}

// 生成钱包并加密私钥
async function generateKeysAndEncrypt(num, password) {
  let wallet = {};
  for (let i = 0; i < num; i++) {
    const newWallet = await ethers.Wallet.createRandom();
    const encryptedPrivateKey = encryptPrivateKey(newWallet.privateKey, password);
    wallet[i] = {
      address: newWallet.address,
      encryptedPrivateKey: encryptedPrivateKey
    };
  }
  return wallet;
}

// 将生成的钱包写入CSV文件
async function writeEncryptedToCsvFile(fileName, data) {
  const csvWriter = createCsvWriter({
    path: fileName,
    header: [
      { id: 'address', title: 'Address' },
      { id: 'encryptedPrivateKey', title: 'Encrypted Private Key' },
      { id: 'okxAddress', title: 'OKX Address' }

    ]
  });
  await csvWriter.writeRecords(Object.values(data));
  console.log('Keys written to CSV file.');
}


async function writeToCsvFile(fileName, data) {
    const csvWriter = createCsvWriter({
        path: fileName,
        header: [
            { id: 'address', title: 'Address' },
            { id: 'privateKey', title: 'Private Key' }
        ]
    });
    await csvWriter.writeRecords(Object.values(data));
    console.log('Keys written to CSV file.');
}

async function encryptEthPrivateKeyToCSV(fileName, encryptedFileName = 'encrypted_keys.csv') {
  const password = readline.question('Please enter password: ', { hideEchoBack: true });

  // 读取未加密的 CSV 文件
  const records= await readCsvFile(fileName);

  console.log(records);
  // 加密所有私钥并构造新的数据结构
  const encryptedRecords = records.map((record) => {
    const encryptedPrivateKey = encryptPrivateKey(record.encryptedPrivateKey, password);
    return { address: record.address, encryptedPrivateKey, okxAddress: record.okxAddress };
  });

  // 将加密后的数据写入新的 CSV 文件
  await writeEncryptedToCsvFile(encryptedFileName, encryptedRecords);

}






// 生成钱包和加密私钥的主函数
async function main() {
  const password = readline.question('Please enter password: ', { hideEchoBack: true });
  const numKeys = 100;

  // 生成钱包并加密私钥
  const encryptedKeys = await generateKeysAndEncrypt(numKeys, password);

  // 写入CSV文件
   await writeEncryptedToCsvFile('keys2.csv', encryptedKeys);

  console.log('Keys generated and written to CSV file.');
}

if (require.main === module) {
    //console.log(ethAccount2('keys.csv', 'account.csv'));
    //ethAccount2('keys2.csv', 'account2.csv');
    encryptEthPrivateKeyToCSV('baseaccounts.csv', 'encrypted_keys.csv');
    //main();
}
module.exports = { ethAccount,readCsvFile };