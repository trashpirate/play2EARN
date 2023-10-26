"use client";
import React, { useEffect, useState } from "react";
import { useAccount, useContractRead, useNetwork } from "wagmi";

import { Alchemy, Network } from "alchemy-sdk";
import { tokenABI } from "@/assets/tokenABI";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { nftABI } from "@/assets/nftABI";

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

interface NFTMeta {
  name: string;
  description: string;
  url: string;
  id: number;
}

type Props = {};

export default function AccountInfo({}: Props) {
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [nftBalance, setNftBalance] = useState<number | null>(null);
  const [nftsOwned, setNftsOwned] = useState<NFTMeta[] | null>(null);

  const contractAddresses = [NFT_CONTRACT];

  // get account address
  const { address, isConnecting, isDisconnected, isConnected } = useAccount({});

  // get chain
  const { chain } = useNetwork();

  // define token contract config
  const tokenContract = {
    address: TOKEN_CONTRACT,
    abi: tokenABI,
    chainId: chain?.id,
  };

  // define token contract config
  const nftContract = {
    address: NFT_CONTRACT,
    abi: nftABI,
    chainId: chain?.id,
  };

  // check balance
  const { isLoading, isSuccess, isError } = useContractRead({
    ...tokenContract,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    enabled: isConnected && address != null,
    watch: true,
    cacheTime: 2000,
    onSuccess(data: bigint) {
      setTokenBalance(Number(formatEther(data)));
    },
  });

  // read nft balance
  const {
    isError: isNftError,
    isLoading: isNftLoading,
    isSuccess: isNftSuccess,
  } = useContractRead({
    ...nftContract,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    enabled: isConnected && address != null,
    watch: true,
    cacheTime: 1000,
    onSuccess(data) {
      setNftBalance(Number(data));
    },
  });

  function getBalanceString() {
    let text: string = "---";
    if (isLoading) {
      text = "Loading...";
    } else if (isSuccess && tokenBalance != null) {
      text = `${tokenBalance.toFixed(0)} EARN`;
    } else {
      text = "---";
    }
    return text;
  }

  function getNftBalanceString() {
    let text: string = "---";
    if (isNftLoading) {
      text = "Loading...";
    } else if (isNftSuccess && nftBalance != null) {
      text = `${nftBalance}`;
    } else {
      text = "---";
    }
    return text;
  }

  return (
    <div className="w-full ">
      <div className="mx-auto max-w-sm rounded-md  bg-black p-8 md:ml-0">
        <h2 className="mb-4 border-b-2 border-yellow-500 pb-2 text-xl">
          ACCOUNT INFO
        </h2>
        <div className="py-2">
          <ConnectButton
            accountStatus="address"
            showBalance={true}
            chainStatus="icon"
          />
        </div>

        <div className="flex justify-between">
          <h3>Balance: </h3>
          <p>{getBalanceString()}</p>
        </div>
        <div className="flex justify-between">
          <h3>NFTs: </h3>
          <p>{getNftBalanceString()}</p>
        </div>
      </div>
    </div>
  );
}
