import {ethers} from "ethers";
import {Flames, Flames__factory, HoldEarn, HoldEarn__factory} from "../../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();



async function main() {

  const nftContractAddress = "0x12A961E8cC6c94Ffd0ac08deB9cde798739cF775";
  const tokenContractAddress = "0x0b61C4f33BCdEF83359ab97673Cb5961c6435F4E";

  // define provider and deployer
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL_MAINNET ?? ""
  );

  const ownerWallet = new ethers.Wallet(
    process.env.OWNER_PRIVATE_KEY_MAINNET ?? "",
    provider
  );

  // get wallet information
  console.log(`Using address ${ ownerWallet.address }`);
  const balanceBN = await provider.getBalance(ownerWallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${ balance }`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  // get nft contract
  const contractFactory = new Flames__factory(ownerWallet);
  const nftContract = await contractFactory.attach(nftContractAddress) as Flames;
  const contractAddress = await nftContract.getAddress();
  console.log(`NFT contract deployed at ${ contractAddress }`);

  // set batch limit
  const setTx = await nftContract.connect(ownerWallet).setBatchLimit(0n);
  const receipt1 = await setTx.wait();
  console.log(receipt1?.hash);
  const newBatchLimit = await nftContract.batchLimit();
  console.log(`Batch limit: ${newBatchLimit}`)

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
