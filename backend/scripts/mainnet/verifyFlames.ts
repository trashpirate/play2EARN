import * as hre from "hardhat";
import {ethers} from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// run this script with hardhat: npx hardhat run ./scripts/mainnet/verifyFlames.ts --network ETH_MAINNET
const TOKEN_ADDRESS = "0x0b61C4f33BCdEF83359ab97673Cb5961c6435F4E";

const constructorArguments = [process.env.OWNER_ADDRESS_MAINNET, process.env.FEE_ADDRESS_MAINNET, TOKEN_ADDRESS];
const contractAddress = "0x12A961E8cC6c94Ffd0ac08deB9cde798739cF775";

async function main() {

    // verify contract
    console.log("Verifying contract on Etherscan...");
    if (constructorArguments != null) {
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: constructorArguments,
            contract: "contracts/Flames.sol:Flames"
        });
    } else {
        await hre.run("verify:verify", {
            address: contractAddress,
            contract: "contracts/Flames.sol:Flames"
        });
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});