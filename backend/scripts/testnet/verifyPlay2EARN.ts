import * as hre from "hardhat";
import {ethers} from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/testnet/verifyPlay2EARN.ts --network ETH_GOERLI
const TOKEN_ADDRESS = "0xb6347F2A99CB1a431729e9D4F7e946f58E7C35C7";
const BASE_URI = "ipfs://bafybeigjenvitrwsrknmvatdtt3rxv4rgswamwl63souemwq5cuktyzrgq/";


const constructorArguments = [process.env.OWNER_ADDRESS_TESTNET, process.env.FEE_ADDRESS_TESTNET, TOKEN_ADDRESS, BASE_URI];
const contractAddress = "0xa84517F6E1448B7d6Cb50c8Af1579F8bEB6092C7";

async function main() {

    // verify contract
    console.log("Verifying contract on Etherscan...");
    if (constructorArguments != null) {
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: constructorArguments,
            contract: "contracts/Play2EARN.sol:Play2EARN"
        });
    } else {
        await hre.run("verify:verify", {
            address: contractAddress,
            contract: "contracts/Play2EARN.sol:Play2EARN"
        });
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});