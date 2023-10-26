import * as hre from "hardhat";
import {ethers} from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/testnet/verifyHoldEarn.ts --network ETH_GOERLI
const constructorArguments = [process.env.OWNER_ADDRESS_TESTNET];
const contractAddress = "0xb6347F2A99CB1a431729e9D4F7e946f58E7C35C7";

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