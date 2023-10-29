"use client";
import React, { useEffect } from "react";
import { useAccount } from "wagmi";

import { Alchemy, AssetTransfersCategory, Network } from "alchemy-sdk";
const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network:
    process.env.NEXT_PUBLIC_TESTNET == "true"
      ? Network.ETH_GOERLI
      : Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

type Props = {};

export default function Wins({}: Props) {
  // get account address
  const { address, isConnecting, isDisconnected, isConnected } = useAccount({});

  useEffect(() => {
    async function getTxHistory() {
      const data = await alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        toAddress: process.env.NEXT_PUBLIC_FEE_ADDRESS_MAINNET,
        contractAddresses: [NFT_CONTRACT],
        withMetadata: false,
        excludeZeroValue: true,
        category: ["erc721"] as AssetTransfersCategory[],
      });
      console.log(data);
    }

    getTxHistory();
  }, []);

  return <div>Wins</div>;
}
