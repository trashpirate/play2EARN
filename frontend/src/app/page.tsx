import AccountInfo from "@/components/accountInfo/accountInfo";
import ClaimPrize from "@/components/claimPrize/claimPrize";
import CollectionInfo from "@/components/collectionInfo/collectionInfo";
import Minter from "@/components/minter/minter";
import Navbar from "@/components/navigation/navbar";
import Nfts from "@/components/nfts/nfts";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-hero-pattern bg-scroll p-8 text-white bg-blend-darken justify-items-stretch">
      <div className="mx-auto w-full flex-col items-center justify-between xl:w-4/5 2xl:w-3/4 h-full">
        <Navbar></Navbar>
        <div className="grid w-full grid-cols-1 justify-between gap-4 md:grid-cols-[25%_30%_40%] justify-items-stretch mt-4rem">
          <div className="w-full h-full flex flex-col justify-stretch">
            <CollectionInfo></CollectionInfo>
            <AccountInfo></AccountInfo>
          </div>

          <Minter></Minter>
          <div className="w-full h-full flex flex-col justify-stretch">
            <Nfts></Nfts>
            <ClaimPrize></ClaimPrize>
          </div>
        </div>
      </div>
    </main>
  );
}

