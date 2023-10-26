import {expect} from 'chai';
import {ethers} from 'hardhat';
import {Token, Token__factory} from '../typechain-types';
import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/signers";

describe("Contract", () => {

    let contract: Token;
    let deployer: HardhatEthersSigner;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner, addr2: HardhatEthersSigner;
    let ammpair: HardhatEthersSigner;

    // variables for contract creation: adjust as needed
    const name = "Token";
    const symbol = "TOKEN";
    const decimals = 18;
    const initialSupply = "1000000000";
    const contractOwner = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    beforeEach(async () => {
        // Fetch conract from blockchain
        const MyContract = await ethers.getContractFactory("Token");
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

    describe("Sending Tokens", () => {
        let amount: bigint, prevBalance: bigint;
        beforeEach(async () => {

            amount = ethers.parseUnits("4000");
            prevBalance = await contract.balanceOf(owner.address);
            const transaction = await contract
                .connect(owner)
                .transfer(addr1.address, amount);
            const receipt = await transaction.wait();
        });
        describe("Success", async () => {
            it("transfers token balances", async () => {

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

            // it("rejects blacklisted wallets", async () => {
            //     contract.addToBlacklist(addr1.address);
            //     const amount = ethers.parseUnits("100");
            //     contract.connect(addr1).transfer(addr2.address, amount);
            //     await expect(
            //         contract.connect(addr1).transfer(addr2.address, amount)
            //     ).to.be.reverted;
            // });
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


});
