import {expect} from 'chai';
import {ethers} from 'hardhat';
import {HoldEarn, HoldEarn__factory, Token__factory} from '../typechain-types';
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";

describe("Contract", () => {

    let contract: HoldEarn;
    let deployer: HardhatEthersSigner;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner, addr2: HardhatEthersSigner;
    let ammpair: HardhatEthersSigner;

    // variables for contract creation: adjust as needed
    const name = "HOLD";
    const symbol = "EARN";
    const decimals = 18;
    const taxFee = "200";
    const initialSupply = "1000000000";
    const contractOwner = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    beforeEach(async () => {
        // Fetch conract from blockchain
        const MyContract = await ethers.getContractFactory("HoldEarn");
        contract = await MyContract.deploy(contractOwner);
        [deployer, owner, addr1, addr2, ammpair] = await ethers.getSigners();

    });

    describe("Deployment", () => {
        describe("Success", () => {
            it("has correct name", async () => {
                expect(await contract.name()).to.equal(name);
                console.log(`\tName: ${ await contract.name() }`);
            });

            it("has correct symbol", async () => {
                expect(await contract.symbol()).to.equal(symbol);
                console.log(`\tSymbol: ${ await contract.symbol() }`);
            });

            it("has correct decimals", async () => {
                expect(await contract.decimals()).to.equal(decimals);
                console.log(`\tDecimals: ${ await contract.decimals() }`);
            });

            it("has correct total supply", async () => {
                expect(await contract.totalSupply()).to.equal(ethers.parseUnits(initialSupply));
                console.log(`\tTotal Supply: ${ ethers.formatEther(await contract.totalSupply()) }`);
            });

            it("has correct fee", async () => {
                expect(await contract.taxFee()).to.equal(taxFee);
                console.log(`\tTotal Supply: ${ ethers.formatEther(await contract.totalSupply()) }`);
            });

            it("verify contract ownership", async () => {
                expect(await contract.owner()).to.equal(
                    owner.address
                );
                console.log(`\tOwner at: ${ await contract.owner() }`);
            });

            it("assigns total supply to supply address", async () => {
                expect(await contract.balanceOf(owner.address)).to.equal(
                    ethers.parseUnits(initialSupply)
                );
                console.log(`\tSupply at: ${ owner.address }`);
            });

        });


    });

    describe("Sending Tokens without fees", () => {
        let amount: bigint, transferAmount: bigint, prevBalance: bigint;
        beforeEach(async () => {

            amount = ethers.parseUnits("4000");
            transferAmount = amount - amount * BigInt(taxFee) / BigInt("10000");
            prevBalance = await contract.balanceOf(owner.address);
            const transaction = await contract
                .connect(owner)
                .transfer(addr1.address, amount);
            const receipt = await transaction.wait();
        });
        describe("Success", async () => {
            it("transfers token balances when excluded", async () => {
                // Ensure tokens were transferred (balance change)
                expect(await contract.balanceOf(owner.address)).to.equal(
                    prevBalance - amount
                );
                expect(await contract.balanceOf(addr1.address)).to.equal(amount);
            });

            it("emits a transfer event", async () => {
                // Check for event
                const filter = contract.filters.Transfer;
                const events = await contract.queryFilter(filter, -1);
                const event = events[1];
                expect(event.fragment.name).to.equal('Transfer');

                // Check for event arguments
                const args = event.args;
                expect(args.from).to.equal(owner.address);
                expect(args.to).to.equal(addr1.address);
                expect(args.value).to.equal(amount);
            });
        });

        describe("Failure", () => {
            it("rejects invalid recipient", async () => {
                const amount = ethers.parseUnits("100");
                await expect(
                    contract.connect(owner).transfer(ethers.ZeroAddress, amount)
                ).to.be.reverted;
            });

            it("rejects insufficient balances", async () => {
                // Transfer more tokens than deployer has
                const invalidAmount = ethers.parseUnits("420690000000000");
                await expect(
                    contract.connect(owner).transfer(addr1.address, invalidAmount)
                ).to.be.reverted;
            });

        });
    });
    describe("Sending Tokens with reflections", () => {
        let amount: bigint, transferAmount: bigint, prevBalance: bigint;
        beforeEach(async () => {

            amount = ethers.parseUnits("100000000");
            prevBalance = await contract.balanceOf(owner.address);

            // no tax because from supplier wallet
            const tx1 = await contract
                .connect(owner)
                .transfer(addr1.address, amount);
            // no tax because from supplier wallet
            const tx2 = await contract
                .connect(owner)
                .transfer(addr2.address, amount);
        });
        describe("Success", async () => {
            it("transfers token balances when excluded", async () => {
                // Ensure tokens were transferred (balance change)
                expect(await contract.balanceOf(owner.address)).to.equal(
                    prevBalance - amount - amount
                );
                expect(await contract.balanceOf(addr1.address)).to.equal(amount);
                expect(await contract.balanceOf(addr2.address)).to.equal(amount);
            });

            it("correct amount received with taxes", async () => {
                // amount sent
                amount = ethers.parseUnits("50000000"); // transfer 50M

                // amount after fees - 45M
                transferAmount = amount - amount * BigInt(taxFee) / BigInt("10000");

                // balance of supplier
                const supplyBalance = await contract.balanceOf(owner.address);
                console.log('Supplier:' + ethers.formatEther(supplyBalance.toString()));

                // balances in before sending
                const prevBalanceAddr1 = await contract.balanceOf(addr1.address);
                const prevBalanceAddr2 = await contract.balanceOf(addr2.address);

                // balance in addr1 after sending
                const balanceAddr1 = prevBalanceAddr1 - amount;

                // transfer - addr2 receives 45M
                const tx_taxed = await contract
                    .connect(addr1)
                    .transfer(addr2.address, amount);

                // balance in addr2 after transfer
                const balanceAddr2 = prevBalanceAddr2 + transferAmount;

                // calc reflections
                const totalSupply = ethers.parseUnits(initialSupply) as bigint;
                // console.log('TotalSupply:' + ethers.formatEther(totalSupply.toString()));

                const totalReflections = amount - transferAmount;
                // console.log('Reflections Total:' + ethers.formatEther(totalReflections.toString()));

                const reflectionSupply = totalSupply - totalReflections;
                const reflectAddr1 = balanceAddr1 * totalReflections / reflectionSupply;
                // console.log('Reflections Addr1:' + ethers.formatEther(reflectAddr1.toString()));
                const reflectAddr2 = balanceAddr2 * totalReflections / reflectionSupply;
                console.log('Reflections Addr2:' + ethers.formatEther(reflectAddr2.toString()));

                // check amount sender
                expect(await contract.balanceOf(addr1.address)).to.equal(
                    balanceAddr1 + reflectAddr1
                );
                // check amount receiver
                expect(await contract.balanceOf(addr2.address)).to.equal(
                    balanceAddr2 + reflectAddr2
                );
            });


        });

        describe("Failure", () => {

            it("rejects insufficient balances", async () => {
                // Transfer more tokens than deployer has
                const invalidAmount = ethers.parseUnits("200000000");
                await expect(
                    contract.connect(addr1).transfer(addr2.address, invalidAmount)
                ).to.be.reverted;
            });

        });
    });

    describe("Approving Tokens", () => {
        let amount: bigint;

        beforeEach(async () => {
            amount = ethers.parseUnits("100");

            // transfer tokens
            const transaction = await contract
                .connect(owner)
                .approve(ammpair.address, amount);
            const receipt = await transaction.wait();
        });

        describe("Success", () => {
            it("allocates an allowance for delegated token spending", async () => {
                expect(
                    await contract.allowance(owner.address, ammpair.address)
                ).to.equal(amount);
            });

            it("emits an approval event", async () => {
                // Check for event
                const filter = contract.filters.Approval;
                const events = await contract.queryFilter(filter, -1);
                const event = events[0];
                expect(event.fragment.name).to.equal('Approval');

                // Check for event arguments
                const args = event.args;
                expect(args.owner).to.equal(owner.address);
                expect(args.spender).to.equal(ammpair.address);
                expect(args.value).to.equal(amount);
            });
        });
        describe("Failure", () => {
            it("rejects invalid spenders", async () => {
                await expect(
                    contract.connect(owner).approve(ethers.ZeroAddress, amount)
                ).to.be.reverted;
            });
        });
    });

    

    describe("Delegated Token Transfer", () => {
        let amount: bigint, prevBalance: bigint;

        beforeEach(async () => {
            amount = ethers.parseUnits("100");
            // approve ammpair
            const transaction = await contract
                .connect(owner)
                .approve(ammpair.address, amount);
            const receipt = await transaction.wait();
        });
        describe("Success", async () => {
            beforeEach(async () => {
                prevBalance = await contract.balanceOf(owner.address);
                const transaction = await contract
                    .connect(ammpair)
                    .transferFrom(owner.address, addr1.address, amount);
                const receipt = await transaction.wait();
            });

            it("transfers token balances", async () => {
                expect(await contract.balanceOf(owner.address)).to.equal(
                    prevBalance - amount
                );
                expect(await contract.balanceOf(addr1.address)).to.equal(amount);
            });

            it("resets the allowance", async () => {
                expect(
                    await contract.allowance(owner.address, ammpair.address)
                ).to.be.equal(0);
            });

            it("emits an approval event", async () => {
                // Check for event
                const filter = contract.filters.Approval;
                const events = await contract.queryFilter(filter, -1);
                const event = events[0];
                expect(event.fragment.name).to.equal('Approval');

                // Check for event arguments
                const args = event.args;
                expect(args.owner).to.equal(owner.address);
                expect(args.spender).to.equal(ammpair.address);
                expect(args.value).to.equal(amount);
            });

            it("emits a transfer event", async () => {
                // Check for event
                const filter = contract.filters.Transfer;
                const events = await contract.queryFilter(filter, -1);
                const event = events[0];
                expect(event.fragment.name).to.equal('Transfer');

                // Check for event arguments
                const args = event.args;
                expect(args.from).to.equal(owner.address);
                expect(args.to).to.equal(addr1.address);
                expect(args.value).to.equal(amount);
            });
        });

        describe("Failure", async () => {
            it('rejects invalid spenders', async () => {
                await expect(contract.connect(owner).transferFrom(ethers.ZeroAddress, ammpair.address, amount)).to.be.reverted;
            });

            it("rejects insufficient balances", async () => {
                // Transfer more tokens than deployer has - 100M
                const invalidAmount = ethers.parseUnits("420690000000000");
                await expect(
                    contract
                        .connect(ammpair)
                        .transferFrom(owner.address, addr1.address, invalidAmount)
                ).to.be.reverted;
            });

        });
    });


    describe("Excluding wallets from fee", () => {
        beforeEach(async () => {
            const txExcluded = await contract.connect(owner).excludeFromFee(addr1.address);
            await txExcluded.wait();
        });
        describe("Success", async () => {
            it("wallets are excluded correctly", async () => {

                expect(await contract.isExcludedFromFee(addr1.address)).to.equal(
                    true
                );
                expect(await contract.isExcludedFromFee(addr2.address)).to.equal(
                    false
                );
            });
            it("supplier is excluded correctly", async () => {
                expect(await contract.isExcludedFromFee(owner.address)).to.equal(
                    true
                );
            });
        });

        describe("Failure", () => {

            it("reverts if not owner wants to exclude", async () => {
                await expect(contract.connect(addr1).excludeFromFee(addr2.address)).to.be.reverted;
                await expect(contract.connect(addr1).includeInFee(addr2.address)).to.be.reverted;
            });
        });
    });
    describe("Excluding wallets from reward", () => {
        beforeEach(async () => {
            const txExcluded = await contract.connect(owner).excludeFromReward(addr1.address);
            await txExcluded.wait();
        });
        describe("Success", async () => {
            it("wallets are excluded correctly", async () => {

                expect(await contract.isExcludedFromReward(addr1.address)).to.equal(
                    true
                );
                expect(await contract.isExcludedFromReward(addr2.address)).to.equal(
                    false
                );
            });

        });

        describe("Failure", () => {

            it("reverts if not owner wants to exclude", async () => {
                await expect(contract.connect(addr1).excludeFromReward(addr2.address)).to.be.reverted;
                await expect(contract.connect(addr2).includeInReward(addr1.address)).to.be.reverted;
            });
        });
    });
    describe("Set transaction fee", () => {
        describe("Success", async () => {
            it("fee is set correctly", async () => {
                const newFee = "200";
                const taxFee = await contract.connect(owner).setFee(newFee);
                expect(await contract.taxFee()).to.equal(
                    newFee
                );
            });

            it("emits a setfee event", async () => {
                const newFee = "200";
                const taxFee = await contract.connect(owner).setFee(newFee);

                // Check for event
                const filter = contract.filters.SetFee;
                const events = await contract.queryFilter(filter, -1);
                const event = events[0];
                expect(event.fragment.name).to.equal('SetFee');

                // Check for event arguments
                const args = event.args;
                expect(args.value).to.equal(newFee);
            });

        });

        describe("Failure", () => {

            it("reverts if not owner wants to set fee", async () => {
                await expect(contract.connect(addr1).setFee("300")).to.be.reverted;
            });
        });
    });

    describe("Withrdraw tokens from contract", () => {
        describe("Success", async () => {
            it("owner can withdraw reflection tokens", async () => {

                const sentTokenAmount = ethers.parseUnits("200000");
                const fundtx = await contract
                    .connect(owner)
                    .transfer(addr1.address, ethers.parseUnits("5000000"));
                await fundtx.wait();

                const contractAddress = await contract.getAddress();
                const tx = await contract
                    .connect(addr1)
                    .transfer(contractAddress, sentTokenAmount);
                await tx.wait();
                let contractBalance = await contract.balanceOf(contractAddress);
                expect(contractBalance).to.be.greaterThan(0n);

                const withdrawTx = await contract.connect(owner).withdrawTokens(contractAddress, addr2.address);
                await withdrawTx.wait();
                expect(await contract.balanceOf(contractAddress)).to.eq(0n);
                expect(await contract.balanceOf(addr2.address)).to.eq(contractBalance);
            });

            it("owner can withdraw ANY tokens from contract", async () => {
                const anyTokenFactory = new Token__factory(deployer);
                const anyToken = await anyTokenFactory.deploy(deployer);
                await anyToken.waitForDeployment();
                const anyTokenAddress = await anyToken.getAddress();

                const sentTokenAmount = ethers.parseUnits("200000");
                const fundtx = await anyToken
                    .connect(deployer)
                    .transfer(addr1.address, ethers.parseUnits("5000000"));
                await fundtx.wait();

                const contractAddress = await contract.getAddress();
                const tx = await anyToken
                    .connect(addr1)
                    .transfer(contractAddress, sentTokenAmount);
                await tx.wait();
                let contractBalance = await anyToken.balanceOf(contractAddress);
                expect(contractBalance).to.be.greaterThan(0n);

                const withdrawTx = await contract.connect(owner).withdrawTokens(anyTokenAddress, addr1.address);
                await withdrawTx.wait();
                contractBalance = await anyToken.balanceOf(contractAddress);
                expect(contractBalance).to.eq(0n);
            });


        });

        describe("Failure", () => {

            it("reverts if not owner wants to withdraw", async () => {
                const contractAddress = await contract.getAddress();
                await expect(contract.connect(owner).withdrawTokens(contractAddress, addr1.address)).to.be.reverted;
            });
        });
    });

});
