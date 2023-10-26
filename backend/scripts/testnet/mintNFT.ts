import {ethers} from "ethers";
import {Play2EARN, Play2EARN__factory, HoldEarn, HoldEarn__factory} from "../../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();



async function main() {

  const nftContractAddress = "0xa84517F6E1448B7d6Cb50c8Af1579F8bEB6092C7";
  const tokenContractAddress = "0xb6347F2A99CB1a431729e9D4F7e946f58E7C35C7";

  // define provider and deployer
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL_TESTNET ?? ""
  );

  const ownerWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY ?? "",
    provider
  );
  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEYS?.split(",")[2] ?? "",
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
  const contractFactory = new Play2EARN__factory(ownerWallet);
  const nftContract = await contractFactory.attach(nftContractAddress) as Play2EARN;
  const contractAddress = await nftContract.getAddress();
  console.log(`NFT contract deployed at ${ contractAddress }`);

  // get token contract
  const tokenFactory = new HoldEarn__factory(ownerWallet);
  const tokenContract = await tokenFactory.attach(tokenContractAddress) as HoldEarn;
  const tokenAddress = await tokenContract.getAddress();
  console.log(`Token contract deployed at ${ tokenAddress }`);


  // approve tokens
  const approveTx = await tokenContract.connect(wallet).approve(contractAddress, ethers.parseUnits("400000"));
  await approveTx.wait();

  // mint single nft
  const mintTx = await nftContract.connect(wallet).mint(1n);
  const receipt = await mintTx.wait();
  console.log(receipt?.hash);

  // mint single nft
  const mintTx2 = await nftContract.connect(wallet).mint(2n);
  const receipt2 = await mintTx2.wait();
  console.log(receipt2?.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
