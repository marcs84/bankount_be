const Web3 = require('web3');
const solc = require('solc');
const fs = require('fs');

// Load environment variables
const rpcUrl = process.env.RPC_URL;
const privateKey = process.env.PRIVATE_API_KEY;

if (!rpcUrl || !privateKey) {
  throw new Error('RPC_URL or PRIVATE_KEY is not defined in the environment variables');
}

const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

// Configure the deployer account using the private key
const deployer = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(deployer);
web3.eth.defaultAccount = deployer.address;

/**
 * Compile the smart contract using solc
 */
function compileContract() {
  const source = fs.readFileSync('src/contracts/Token.sol', 'utf8');
  const input = {
    language: 'Solidity',
    sources: {
      'Token.sol': { content: source },
    },
    settings: {
      outputSelection: {
        '*': { '*': ['abi', 'evm.bytecode'] },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const contract = output.contracts['Token.sol']['Token'];

  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
  };
}

/**
 * Deploy the smart contract
 */
const deploySmartContract = async (req, res) => {
  const { name, symbol, initialSupply } = req.body;

  try {
    const { abi, bytecode } = compileContract();
    const contract = new web3.eth.Contract(abi);
    const tx = contract.deploy({
      data: bytecode,
      arguments: [name, symbol, initialSupply],
    });
    console.log("tx", tx)
    const gas = await tx.estimateGas();

    const txObject = {
      from: deployer.address,
      gas,
      data: tx.encodeABI(),
    };

    const receipt = await web3.eth.sendTransaction(txObject);
    console.log('Contract deployed at:', receipt.contractAddress);

    res.json({ success: true, contractAddress: receipt.contractAddress });
  } catch (error) {
    console.error('Deployment failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  deploySmartContract,
};
