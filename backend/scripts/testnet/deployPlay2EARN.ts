import {ethers} from "ethers";
import {Play2EARN__factory} from "../../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

const TOKEN_ADDRESS = "0xb6347F2A99CB1a431729e9D4F7e946f58E7C35C7";
const BASE_URI = "ipfs://bafybeigjdddb36jqff7ekfmcrinb7dlybsssvwik6dwnrx3wjexwbzpqoa/";

async function main() {

    // define provider and deployer
    const provider = new ethers.JsonRpcProvider(
        process.env.RPC_ENDPOINT_URL_TESTNET ?? ""
    );
    const wallet = new ethers.Wallet(
        process.env.PRIVATE_KEY ?? "",
        provider
    );

    // get wallet information
    console.log(`Using address ${ wallet.address }`);
    const balanceBN = await provider.getBalance(wallet.address);
    const balance = Number(ethers.formatUnits(balanceBN));
    console.log(`Wallet balance ${ balance }`);
    if (balance < 0.01) {
        throw new Error("Not enough ether");
    }

    // deploy contract
    const owner = process.env.OWNER_ADDRESS_TESTNET as string;
    const receiver = process.env.FEE_ADDRESS_TESTNET as string;
    const tokenAdress = TOKEN_ADDRESS;

    const contractFactory = new Play2EARN__factory(wallet);
    const contract = await contractFactory.deploy(owner, receiver, tokenAdress, BASE_URI);
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log(`Token contract deployed at ${ contractAddress }`);

    // wait for confirmations
    console.log(`Waiting for confirmations...`);
    const WAIT_BLOCK_CONFIRMATIONS = 5;
    const deploymentReceipt = await contract
        .deploymentTransaction()
        ?.wait(WAIT_BLOCK_CONFIRMATIONS);
    console.log(
        `Contract confirmed with ${ WAIT_BLOCK_CONFIRMATIONS } confirmations.`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});