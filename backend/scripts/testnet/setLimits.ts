import {ethers} from "ethers";
import {Flames, Flames__factory, HoldEarn, HoldEarn__factory} from "../../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();



async function main() {

  const nftContractAddress = "0xb76428F222ec59418AdFFEE08D37F3D3C0a3025D";
  const tokenContractAddress = "0xb6347F2A99CB1a431729e9D4F7e946f58E7C35C7";

  // define provider and deployer
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL_TESTNET ?? ""
  );

  const ownerWallet = new ethers.Wallet(
    process.env.OWNER_PRIVATE_KEY_TESTNET ?? "",
    provider
  );
  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEYS?.split(",")[3] ?? "",
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

  // get token contract
  const tokenFactory = new HoldEarn__factory(ownerWallet);
  const tokenContract = await tokenFactory.attach(tokenContractAddress) as HoldEarn;
  const tokenAddress = await tokenContract.getAddress();
  console.log(`Token contract deployed at ${ tokenAddress }`);

  // mint single nft
  const setTx = await nftContract.connect(ownerWallet).setBatchLimit(2n);
  const receipt1 = await setTx.wait();
  console.log(receipt1?.hash);
  const newBatchLimit = await nftContract.batchLimit();
  console.log(`Batch limit: ${newBatchLimit}`)

  // approve tokens
  const approveTx = await tokenContract.connect(wallet).approve(contractAddress, ethers.parseUnits("400000"));
  await approveTx.wait();
  
  // mint single nft
  const mintTx2 = await nftContract.connect(wallet).mint(1n);
  const receipt2 = await mintTx2.wait();
  console.log(receipt2?.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
