import {expect} from "chai";
import {ethers} from "hardhat";
import {Play2EARN, Token__factory, HoldEarn} from "../typechain-types";
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";
import {AddressLike} from "ethers";
import {describe} from "mocha";

let deployer: HardhatEthersSigner;
let owner: HardhatEthersSigner;
let receiver: HardhatEthersSigner;
let account: HardhatEthersSigner;
let others: HardhatEthersSigner[];

const nftName = "Play2EARN";
const nftSymbol = "EARNY";
const mintCost = ethers.parseUnits("100000");
const baseUri =
  "ipfs://bafybeieokkbwo2hp3eqkfa5chypmevxjii275icwxnuc7dmuexi3qsuvu4/";

// function to deploy token contract
async function deployTokenContract(ownerAddress: AddressLike) {
  const contractFactory = await ethers.getContractFactory("HoldEarn");
  const contract = await contractFactory.deploy(ownerAddress);
  await contract.waitForDeployment();
  return contract;
}

// function to deploy betting contract
async function deployNFTContract(
  ownerAddress: AddressLike,
  receiverAddress: AddressLike,
  contractAddress: AddressLike
) {
  const contractFactory = await ethers.getContractFactory("Play2EARN");
  const contract = await contractFactory.deploy(
    ownerAddress,
    receiverAddress,
    contractAddress,
    baseUri
  );
  await contract.waitForDeployment();
  return contract;
}

describe("Tests for NFT contract", async () => {
  let nftContract: Play2EARN;
  let tokenContract: HoldEarn;
  let tokenAddress: AddressLike;
  let nftContractAddress: AddressLike;

  describe("when nft contract is deployed", async () => {
    beforeEach(async () => {
      [deployer, owner, receiver, account, ...others] =
        await ethers.getSigners();

      tokenContract = await deployTokenContract(owner.address);
      tokenAddress = await tokenContract.getAddress();
      nftContract = await deployNFTContract(
        owner.address,
        receiver.address,
        tokenAddress
      );
      nftContractAddress = await nftContract.getAddress();

      await tokenContract.connect(owner).excludeFromFee(receiver.address);
    });

    describe("Success", () => {
      it("returns correct token address", async () => {
        const paymentToken = await nftContract.paymentToken();
        expect(paymentToken).to.eq(tokenAddress);
      });
      it("returns correct token name", async () => {
        const name = await nftContract.name();
        expect(name).to.eq(nftName);
      });
      it("returns correct token symbol", async () => {
        const symbol = await nftContract.symbol();
        expect(symbol).to.eq(nftSymbol);
      });
      it("returns correct nft rate", async () => {
        const nftRate = await nftContract.fee();
        expect(nftRate).to.eq(mintCost);
      });
      it("returns correct receiver", async () => {
        const receiverAddress = await nftContract.feeAddress();
        expect(receiverAddress).to.eq(receiver.address);
      });
      it("returns correct owner", async () => {
        const ownerAddress = await nftContract.owner();
        expect(ownerAddress).to.eq(owner.address);
      });
    });
  });

  describe("when owner interacts with contract", async () => {
    beforeEach(async () => {
      [deployer, owner, receiver, account] = await ethers.getSigners();

      tokenContract = await deployTokenContract(owner.address);
      tokenAddress = await tokenContract.getAddress();
      nftContract = await deployNFTContract(
        owner.address,
        receiver.address,
        tokenAddress
      );
      nftContractAddress = await nftContract.getAddress();

      await tokenContract.connect(owner).excludeFromFee(receiver.address);
    });

    describe("Success", () => {
      it("owner can set new fee", async () => {
        const newFee = ethers.parseUnits("2000");
        await nftContract.connect(owner).setFee(newFee);
        const fee = await nftContract.fee();
        expect(fee).to.eq(newFee);
      });
      it("owner can set new fee address", async () => {
        await nftContract.connect(owner).setFeeAddress(owner.address);
        const feeAddress = await nftContract.feeAddress();
        expect(feeAddress).to.eq(owner.address);
      });
      it("owner can set max mint per wallet", async () => {
        const newMax = 3n;
        await nftContract.connect(owner).setMaxPerWallet(newMax);
        const max = await nftContract.maxPerWallet();
        expect(max).to.eq(newMax);
      });
      it("owner can set batch limit", async () => {
        const newLimit = 3n;
        await nftContract.connect(owner).setMaxPerWallet(newLimit);
        await nftContract.connect(owner).setBatchLimit(newLimit);
        const limit = await nftContract.batchLimit();
        expect(limit).to.eq(newLimit);
      });

      it("owner can withdraw EARN tokens from contract", async () => {
        const sentTokenAmount = ethers.parseUnits("200000");
        const fundtx = await tokenContract
          .connect(owner)
          .transfer(account.address, ethers.parseUnits("5000000"));
        await fundtx.wait();
        const tx = await tokenContract
          .connect(account)
          .transfer(nftContractAddress, sentTokenAmount);
        await tx.wait();
        let contractBalance = await tokenContract.balanceOf(nftContractAddress);
        expect(contractBalance).to.be.greaterThan(0n);

        const withdrawTx = await nftContract
          .connect(owner)
          .withdrawTokens(tokenAddress, account.address);
        await withdrawTx.wait();
        contractBalance = await tokenContract.balanceOf(nftContractAddress);
        expect(contractBalance).to.eq(0n);
      });

      it("owner can withdraw ANY tokens from contract", async () => {
        const anyTokenFactory = new Token__factory(deployer);
        const anyToken = await anyTokenFactory.deploy(deployer);
        await anyToken.waitForDeployment();
        const anyTokenAddress = await anyToken.getAddress();

        const sentTokenAmount = ethers.parseUnits("200000");
        const fundtx = await anyToken
          .connect(deployer)
          .transfer(account.address, ethers.parseUnits("5000000"));
        await fundtx.wait();
        const tx = await anyToken
          .connect(account)
          .transfer(nftContractAddress, sentTokenAmount);
        await tx.wait();
        let contractBalance = await anyToken.balanceOf(nftContractAddress);
        expect(contractBalance).to.eq(sentTokenAmount);

        const withdrawTx = await nftContract
          .connect(owner)
          .withdrawTokens(anyTokenAddress, account.address);
        await withdrawTx.wait();
        contractBalance = await anyToken.balanceOf(nftContractAddress);
        expect(contractBalance).to.eq(0n);
      });

      // it("owner can withdraw ether from contract", async () => {
      //   const tx = {
      //     to: nftContractAddress,
      //     value: ethers.parseEther('2')
      //   };
      //   const transaction = await account.sendTransaction(tx);
      //   const contractBalance = await ethers.provider.getBalance(nftContractAddress);
      //   expect(contractBalance).to.eq(ethers.parseEther('2'));
      // });
    });
  });

  describe("when user interacts with contract", async () => {
    beforeEach(async () => {
      [deployer, owner, receiver, account] = await ethers.getSigners();

      tokenContract = await deployTokenContract(owner.address);
      tokenAddress = await tokenContract.getAddress();
      nftContract = await deployNFTContract(
        owner.address,
        receiver.address,
        tokenAddress
      );
      nftContractAddress = await nftContract.getAddress();

      await tokenContract.connect(owner).excludeFromFee(receiver.address);

      const tx = await tokenContract
        .connect(owner)
        .transfer(account.address, ethers.parseUnits("5000000"));
      await tx.wait();

      for (let index = 0; index < others.length; index++) {
        const tx = await tokenContract
          .connect(owner)
          .transfer(others[index].address, ethers.parseUnits("3000000"));
        await tx.wait();
      }
    });

    describe("Success", () => {
      it("mints single token to account", async () => {
        const nftRate = await nftContract.fee();
        await tokenContract
          .connect(account)
          .approve(nftContractAddress, nftRate);
        const mintTx = await nftContract.connect(account).mint("1");
        await mintTx.wait();
        const balance = await nftContract
          .connect(account)
          .balanceOf(account.address);
        expect(balance).to.eq(1n);
      });

      it("mints multiple token to account", async () => {
        const quantity = 2n;
        const nftRate = await nftContract.fee();
        const paymentAmount = nftRate * quantity;
        await tokenContract
          .connect(account)
          .approve(nftContractAddress, paymentAmount);
        const mintTx = await nftContract
          .connect(account)
          .mint(quantity.toString());
        await mintTx.wait();
        const balance = await nftContract
          .connect(account)
          .balanceOf(account.address);
        expect(balance).to.eq(quantity);
      });

      it("charges correct amount", async () => {
        const quantity = 2n;
        const nftRate = await nftContract.fee();
        const paymentAmount = nftRate * quantity;
        const prevBalance = await tokenContract.balanceOf(account.address);

        await tokenContract
          .connect(account)
          .approve(nftContractAddress, paymentAmount);
        const mintTx = await nftContract
          .connect(account)
          .mint(quantity.toString());
        await mintTx.wait();
        const balance = await tokenContract.balanceOf(account.address);
        expect(balance).to.eq(prevBalance - paymentAmount);
      });

      it("sets correct token owner", async () => {
        const quantity = 2n;
        const nftRate = await nftContract.fee();
        const paymentAmount = nftRate * quantity;
        await tokenContract
          .connect(account)
          .approve(nftContractAddress, paymentAmount);
        const mintTx = await nftContract
          .connect(account)
          .mint(quantity.toString());
        await mintTx.wait();
        expect(await nftContract.ownerOf(0n)).to.eq(account.address);
        expect(await nftContract.ownerOf(1n)).to.eq(account.address);
      });
      it("returns correct number minted", async () => {
        const quantity = 2n;
        const nftRate = await nftContract.fee();
        const paymentAmount = nftRate * quantity;
        await tokenContract
          .connect(account)
          .approve(nftContractAddress, paymentAmount);
        const mintTx = await nftContract
          .connect(account)
          .mint(quantity.toString());
        await mintTx.wait();
        expect(await nftContract.totalSupply()).to.eq(2n);
      });
      it("nft is transferred by owner", async () => {
        const quantity = 2n;
        const nftRate = await nftContract.fee();
        const paymentAmount = nftRate * quantity;
        await tokenContract
          .connect(account)
          .approve(nftContractAddress, paymentAmount);
        const mintTx = await nftContract
          .connect(account)
          .mint(quantity.toString());
        await mintTx.wait();
        const tx = await nftContract
          .connect(account)
          .transferFrom(account.address, others[0].address, 0n);

        const ownerNFT = await nftContract.ownerOf(0n);
        expect(ownerNFT).to.eq(others[0].address);
      });
      it("nft is transferred by approved spender", async () => {
        const quantity = 2n;
        const nftRate = await nftContract.fee();
        const paymentAmount = nftRate * quantity;
        await tokenContract
          .connect(account)
          .approve(nftContractAddress, paymentAmount);
        const mintTx = await nftContract
          .connect(account)
          .mint(quantity.toString());
        await mintTx.wait();
        const tx1 = await nftContract
          .connect(account)
          .approve(others[0].address, 0n);
        const tx2 = await nftContract
          .connect(others[0])
          .transferFrom(account.address, others[1].address, 0n);

        const ownerNFT = await nftContract.ownerOf(0n);
        expect(ownerNFT).to.eq(others[1].address);
      });
    });

    describe("Failure", () => {
      it("reverts if exceeding maxBatchSize", async () => {
        const quantity = 3n;
        const nftRate = await nftContract.fee();
        const paymentAmount = nftRate * quantity;
        await tokenContract
          .connect(account)
          .approve(nftContractAddress, paymentAmount);

        await expect(nftContract.connect(account).mint(quantity.toString())).to
          .be.reverted;
      });

      it("reverts when maximum number of nfts exceeded", async () => {
        const quantity = 20n;
        const nftRate = await nftContract.fee();
        const paymentAmount = nftRate * quantity;
        await nftContract.connect(owner).setMaxPerWallet(quantity);
        await nftContract.connect(owner).setBatchLimit(quantity);

        for (let index = 0; index < 5; index++) {
          await tokenContract
            .connect(owner)
            .transfer(others[index].address, paymentAmount);
          await tokenContract
            .connect(others[index])
            .approve(nftContractAddress, paymentAmount);

          const mintTx = await nftContract
            .connect(others[index])
            .mint(quantity.toString());
          await mintTx.wait();
        }
        await expect(nftContract.connect(others[6]).mint(quantity.toString()))
          .to.be.reverted;
      });

      it("reverts when maximum per wallet exceeded", async () => {
        const quantity = 2n;
        const nftRate = await nftContract.fee();
        const paymentAmount = nftRate * quantity;
        await tokenContract
          .connect(owner)
          .transfer(account.address, paymentAmount);
        await tokenContract
          .connect(account)
          .approve(nftContractAddress, paymentAmount);

        const mintTx = await nftContract
          .connect(account)
          .mint(quantity.toString());
        await mintTx.wait();

        await expect(nftContract.connect(account).mint(quantity.toString())).to
          .be.reverted;
      });

      it("reverts when transferred without approval", async () => {
        const quantity = 2n;
        const nftRate = await nftContract.fee();
        const paymentAmount = nftRate * quantity;
        await tokenContract
          .connect(account)
          .approve(nftContractAddress, paymentAmount);
        const mintTx = await nftContract
          .connect(account)
          .mint(quantity.toString());
        await mintTx.wait();

        await expect(nftContract
          .connect(others[0])
          .transferFrom(account.address, others[1].address, 0n)).to.be.reverted;
      });

      it("reverts if setting fee", async () => {
        const newFee = ethers.parseUnits("2000");
        await expect(nftContract.connect(account).setFee(newFee)).to.be
          .reverted;
      });

      it("reverts if setting fee address", async () => {
        await expect(
          nftContract.connect(account).setFeeAddress(account.address)
        ).to.be.reverted;
      });
    });
  });
});
