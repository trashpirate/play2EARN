import * as hre from "hardhat";
import {ethers} from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/mainnet/verifyPlay2EARN.ts --network ETH_MAINNET
const TOKEN_ADDRESS = "0x0b61C4f33BCdEF83359ab97673Cb5961c6435F4E";
const BASE_URI = "ipfs://bafybeigjdddb36jqff7ekfmcrinb7dlybsssvwik6dwnrx3wjexwbzpqoa/";

const constructorArguments = [process.env.OWNER_ADDRESS_MAINNET, process.env.FEE_ADDRESS_MAINNET, TOKEN_ADDRESS, BASE_URI];
const contractAddress = "0xEEb56f062E2284E6e212172966e6B9a79372e790";

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