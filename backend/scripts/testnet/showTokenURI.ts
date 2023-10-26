import {ethers} from "ethers";
import {Flames, Flames__factory, HoldEarn, HoldEarn__factory} from "../../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();



async function main() {

  const nftContractAddress = "0x9A62b60294833DE1D011adD9817e3fB0fD2985Ee";
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
  const contractFactory = new Flames__factory(ownerWallet);
  const nftContract = await contractFactory.attach(nftContractAddress) as Flames;
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
  const mintTx2 = await nftContract.connect(wallet).mint(3n);
  const receipt2 = await mintTx2.wait();
  console.log(receipt2?.hash);

  const tokenURI = await nftContract.tokenURI(0n);
  console.log(tokenURI);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
