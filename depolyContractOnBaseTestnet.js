const { ethers } = require("ethers");

async function deployContract(privateKey) {
    // Connect to the Ethereum network
    const provider = new ethers.providers.JsonRpcProvider("https://goerli.base.org");
    const wallet = new ethers.Wallet(privateKey, provider);

    // Define the contract ABI and bytecode
    const abi = ["constructor()"];
    const bytecode = "0x608060405234801561001057600080fd5b50610153806100206000396000f3fe6080604052600080fdfea2646970667358221220d764aa7d8f3b3c7df05f83f290e7d91d2e30ca5515e5a5b5a5a5f5bb34a88c1f64736f6c63430007060033";

    // Create a factory object for the contract
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    // Deploy the contract and wait for confirmation
    const contract = await factory.deploy();
    await contract.deployTransaction.wait();

    // Log the contract address
    console.log("Contract deployed at address:", contract.address);
}

// Replace this with your private key
const privateKey = "98b05edb1a99312202a8c2629e4bef2570d764a59791a60a32d654c95eadefa6";

deployContract(privateKey);
