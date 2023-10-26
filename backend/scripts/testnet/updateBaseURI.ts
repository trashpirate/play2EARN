import {ethers} from "ethers";
import {Flames, Flames__factory} from "../../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();



async function main() {

  const nftContractAddress = "0x80b0976f7C260E8F26681f0302B530B70db7d92a";
  const newURI = "ipfs://bafybeieokkbwo2hp3eqkfa5chypmevxjii275icwxnuc7dmuexi3qsuvu4/";

  // define provider and deployer
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );

  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEYS?.split(",")[0] ?? "",
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

  // get nft contract
  const contractFactory = new Flames__factory(wallet);
  const nftContract = await contractFactory.attach(nftContractAddress) as Flames;
  const contractAddress = await nftContract.getAddress();
  console.log(`NFT contract deployed at ${ contractAddress }`);

  // update uri
  const updateTx = await nftContract.setBaseURI(newURI);
  await updateTx.wait();

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
