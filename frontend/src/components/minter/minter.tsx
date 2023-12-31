"use client";
import { nftABI } from "@/assets/nftABI";
import { tokenABI } from "@/assets/tokenABI";
import React, { useEffect, useState } from "react";
import Image from "next/image";

import { parseUnits } from "viem";
import {
  useAccount,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

import { Alchemy, Network } from "alchemy-sdk";
import Confetti from "react-confetti";

const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}`;
const TOKEN_CONTRACT = process.env.NEXT_PUBLIC_TOKEN_CONTRACT as `0x${string}`;
const NFT_FEE = 100000;

const contractAddresses = [NFT_CONTRACT];

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
  path: string;
  id: number;
}

type Props = {};

export default function Minter({}: Props) {
  const [quantity, setQuantity] = useState<string>("1");
  const [transferAmount, setTransferAmount] = useState<bigint>(
    parseUnits(NFT_FEE.toString(), 18),
  );
  const [approvedAmount, setApprovedAmount] = useState<bigint | undefined>(
    undefined,
  );
  const [tokenBalance, setTokenBalance] = useState<bigint | undefined>(
    undefined,
  );
  const [nftBalance, setNftBalance] = useState<number | undefined>(undefined);
  const [maxPerWallet, setMaxPerWallet] = useState<number>(2);
  const [batchLimit, setBatchLimit] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [buttonText, setButtonText] = useState<string>("MINT");

  const [imagePath, setImagePath] = useState<string>("/logo.jpg");
  const [message, setMessage] = useState<string>(
    "Draw a card and win up to 600K $EARN!",
  );
  const [explode, setExplode] = useState<boolean>(false);

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

  // read token info
  const {
    data: accountData,
    isError: isAccountError,
    isLoading: isAccountLoading,
  } = useContractReads({
    contracts: [
      {
        ...tokenContract,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      },
      {
        ...tokenContract,
        functionName: "allowance",
        args: [address as `0x${string}`, NFT_CONTRACT],
      },
    ],
    enabled: isConnected && address != null,
    watch: true,
  });

  // read nft balance
  const {
    data: nftData,
    isError: isNftError,
    isLoading: isNftLoading,
  } = useContractReads({
    contracts: [
      {
        ...nftContract,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      },
      {
        ...nftContract,
        functionName: "batchLimit",
      },
      {
        ...nftContract,
        functionName: "maxPerWallet",
      },
      {
        ...nftContract,
        functionName: "totalSupply",
      },
    ],
    enabled: isConnected && address != null,
    watch: true,
  });

  useEffect(() => {
    if (nftData != undefined) {
      setNftBalance(Number(nftData?.[0].result));
      setBatchLimit(Number(nftData?.[1].result));
      setMaxPerWallet(Number(nftData?.[2].result));
      setTotalSupply(Number(nftData?.[3].result));
    }
  }, [nftData]);

  // approving funds
  const { config: approvalConfig } = usePrepareContractWrite({
    address: TOKEN_CONTRACT as `0x${string}`,
    abi: tokenABI,
    functionName: "approve",
    args: [NFT_CONTRACT, transferAmount],
    enabled: (Number(quantity) > 0 &&
      isConnected &&
      approvedAmount != undefined &&
      approvedAmount < transferAmount) as boolean,
  });

  const { data: approvedData, write: approve } =
    useContractWrite(approvalConfig);

  const { isLoading: approvalLoading, isSuccess: approvalSuccess } =
    useWaitForTransaction({
      confirmations: 1,
      hash: approvedData?.hash,
    });

  useEffect(() => {
    if (accountData != undefined) {
      setTokenBalance(accountData[0].result);
      setApprovedAmount(accountData[1].result);
    }
  }, [accountData]);

  // mint nfts
  const { config: mintConfig } = usePrepareContractWrite({
    ...nftContract,
    functionName: "mint",
    args: [BigInt(quantity)],
    enabled:
      Number(quantity) > 0 &&
      isConnected &&
      nftBalance != undefined &&
      nftBalance + Number(quantity) <= maxPerWallet &&
      approvedAmount != undefined &&
      approvedAmount >= transferAmount,
  });
  const {
    data: mintData,
    error: mintError,
    isError: isMintError,
    write: mint,
  } = useContractWrite(mintConfig);

  const { isLoading: isMintLoading, isSuccess: isMintSuccess } =
    useWaitForTransaction({
      confirmations: 1,
      hash: mintData?.hash,
    });

  useEffect(() => {
    if (
      approvedAmount != undefined &&
      approvedAmount >= transferAmount &&
      nftBalance != undefined &&
      nftBalance + Number(quantity) < maxPerWallet
    )
      mint?.();
  }, [approvalSuccess]);

  // update transfer amount
  useEffect(() => {
    if (Number(quantity) > 0)
      setTransferAmount(parseUnits(`${Number(quantity) * NFT_FEE}`, 18));
  }, [quantity]);

  // ============================================================================
  // display elements

  // set image path
  useEffect(() => {
    async function checkWin() {
      const nfts = await alchemy.nft.getNftsForOwner(address as string, {
        contractAddresses,
      });
      let totalWin: number = 0;
      for (const nft of nfts["ownedNfts"].slice(-quantity)) {
        const id = nft.tokenId;
        console.log(id);
        const meta = await alchemy.nft.getNftMetadata(NFT_CONTRACT, id, {});
        const trait = meta.rawMetadata?.attributes?.[0]["value"].slice(0, 3);
        const win = trait == "ZER" ? 0 : Number(trait);
        totalWin += win;
      }
      return totalWin;
    }

    if (isMintLoading && isConnected) {
      setImagePath("/nftAnimation.gif");
      setExplode(false);
    } else if (!isMintLoading && isMintSuccess && isConnected) {
      setImagePath("/play.jpg");
      setMessage("Drawing completed. Check your wins!");
      checkWin().then((win) => {
        win > 0 ? setExplode(true) : setExplode(false);
      });
    } else {
      setImagePath("/play.jpg");
      setExplode(false);
    }
    // let timer1 = setTimeout(() => setExplode(false), 5 * 1000);
    // return () => {
    //   clearTimeout(timer1);
    // };
  }, [isMintLoading, isMintSuccess]);

  useEffect(() => {
    if (isMintLoading) setButtonText("Minting...");
    else if (approvalLoading) setButtonText("Approving Funds...");
    else if (
      Number(quantity) > 0 &&
      approvedAmount != undefined &&
      approvedAmount >= transferAmount
    )
      setButtonText("DRAW NOW");
    else setButtonText("DRAW");
  }, [
    isMintLoading,
    approvalLoading,
    approvedAmount,
    transferAmount,
    quantity,
  ]);

  function mintButton() {
    if (isDisconnected && batchLimit) {
      return <div>Connect your wallet to draw a card</div>;
    } else if (batchLimit) {
      // mint is enabled
      // =====================================================
      if (tokenBalance != undefined && tokenBalance < transferAmount) {
        // insufficient balance - inactive
        return (
          <button
            className="rounded-xl bg-slate-500 px-5 py-3 text-slate-300"
            disabled={true}
            onClick={(e) => {}}
          >
            Insufficient Balance
          </button>
        );
      } else if (
        nftBalance != undefined &&
        nftBalance + Number(quantity) > maxPerWallet
      ) {
        // max per wallet exceeded
        return (
          <button
            className="rounded-xl bg-slate-500 px-5 py-3 text-slate-300"
            disabled={true}
            onClick={(e) => {}}
          >
            {`Max. ${maxPerWallet} Cards/Wallet`}
          </button>
        );
        // TODO: no more nfts to mint
        // SOLD OUT
      } else {
        // minting enabled
        return (
          <button
            className="rounded-xl bg-white px-5 py-3 font-bold text-black hover:bg-slate-300"
            disabled={
              isMintLoading ||
              approvalLoading ||
              approvedAmount == undefined ||
              (approvedAmount >= transferAmount && !mint) ||
              ((approvedAmount == undefined ||
                approvedAmount < transferAmount) &&
                !approve)
            }
            onClick={(e) => {
              if (
                approvedAmount == undefined ||
                approvedAmount < transferAmount
              ) {
                approve?.();
              } else {
                mint?.();
              }
            }}
          >
            {buttonText}
          </button>
        );
      }
    }
  }

  function mintPanel(canMint: number) {
    if (canMint) {
      return (
        <div className="pt-2">
          <div className="flex h-14 justify-center">
            <h1 className="my-auto text-center align-middle text-amber-600">
              {message}
            </h1>
          </div>
          <div className="my-4 justify-center text-center">
            <form>
              <label>
                Enter number of Cards:
                <input
                  className="mx-auto ml-2 rounded bg-gray-800 p-1 text-right"
                  type="number"
                  value={quantity}
                  max={batchLimit}
                  min="1"
                  placeholder="1"
                  onChange={(e) => {
                    setQuantity(e.target.value);
                  }}
                />
              </label>
            </form>
          </div>
          <div className="flex justify-center">{mintButton()}</div>
        </div>
      );
    } else {
      return (
        <div className="flex-col justify-center gap-4 pt-4 text-center">
          <p className="mb-4">GAME IS LIVE!</p>
          <div className="mx-auto my-2 h-10 w-fit rounded-md bg-white px-4 py-2 font-bold text-black hover:bg-slate-400">
            <a
              className="mx-auto"
              href="https://app.uniswap.org/swap?outputCurrency=0x0b61C4f33BCdEF83359ab97673Cb5961c6435F4E"
              target={"_blank"}
            >
              <p>BUY $EARN</p>
            </a>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="mx-auto h-full w-full max-w-sm flex-col justify-between rounded-lg bg-black p-8 shadow-inner-sym md:max-w-none">
      {explode && (
        <Confetti
          colors={[
            "#fbbf24",
            "#d97706",
            "#fef08a",
            "#fefce8",
            "#b45309",
            "#fde68a",
          ]}
          recycle={false}
          numberOfPieces={1000}
        />
      )}
      <div className="mx-auto mb-4 w-full max-w-xs overflow-hidden rounded border-2 border-white bg-white">
        <Image
          src={imagePath}
          width={250}
          height={250}
          alt="Play-2-EARN Cards"
          style={{
            width: "100%",
            height: "auto",
          }}
          priority
        />
        <div className="m-4">
          <div className="m-1 font-bold text-black">{"PLAY-2-EARN GAME"}</div>
          <div className="m-1 text-black">{"100,000 $EARN PER DRAW"}</div>
        </div>
      </div>
      {mintPanel(batchLimit)}
    </div>
  );
}
