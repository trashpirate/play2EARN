import * as hre from "hardhat";
import {ethers} from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/mainnet/verifyERC20Reflections.ts --network ETH_MAINNET
const constructorArguments = [process.env.OWNER_ADDRESS_MAINNET];
const contractAddress = "0x0b61C4f33BCdEF83359ab97673Cb5961c6435F4E";

async function main() {

    // verify contract
    console.log("Verifying contract on Etherscan...");
    if (constructorArguments != null) {
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: constructorArguments,
            contract: "contracts/HoldEarn.sol:HoldEarn"
        });
    } else {
        await hre.run("verify:verify", {
            address: contractAddress,
            contract: "contracts/HoldEarn.sol:HoldEarn"
        });
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});