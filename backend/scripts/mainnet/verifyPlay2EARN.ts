import * as hre from "hardhat";
import {ethers} from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/mainnet/verifyPlay2EARN.ts --network ETH_MAINNET
const TOKEN_ADDRESS = "0x0b61C4f33BCdEF83359ab97673Cb5961c6435F4E";
const BASE_URI = "ipfs://bafybeigjenvitrwsrknmvatdtt3rxv4rgswamwl63souemwq5cuktyzrgq/";

const constructorArguments = [process.env.OWNER_ADDRESS_MAINNET, process.env.FEE_ADDRESS_MAINNET, TOKEN_ADDRESS, BASE_URI];
const contractAddress = "0x3287d32Dc9917b0daA39874541AE5269A7C6fCaE";

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