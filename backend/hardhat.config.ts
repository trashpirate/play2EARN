import {HardhatUserConfig, task} from "hardhat/config";

import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      accounts: {
        count: 70,
      },
    },
    ARB_MAINNET: {
      accounts: [`0x${ process.env.PRIVATE_KEY }`],
      url: `https://arb-mainnet.g.alchemy.com/v2/${ process.env.ALCHEMY_API_KEY }`,
    },
    ARB_GOERLI: {
      accounts: [`0x${ process.env.PRIVATE_KEY }`],
      url: `https://arb-goerli.g.alchemy.com/v2/${ process.env.ALCHEMY_API_KEY }`,
    },
    ETH_MAINNET: {
      accounts: [`0x${ process.env.PRIVATE_KEY }`],
      url: `https://eth-mainnet.g.alchemy.com/v2/${ process.env.ALCHEMY_API_KEY }`,
    },
    ETH_GOERLI: {
      accounts: [`0x${ process.env.PRIVATE_KEY }`],
      url: `https://eth-goerli.g.alchemy.com/v2/${ process.env.ALCHEMY_API_KEY }`,
    },
  },
  gasReporter: {
    outputFile: "gas-report.txt",
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
    token: "ETH",
  },
  etherscan: {
    apiKey: `${ process.env.ETHERSCAN_API_KEY }`,
  },
  paths: {tests: "tests"},
};

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

export default config;
