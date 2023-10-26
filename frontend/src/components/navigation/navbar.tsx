import Image from "next/image";

type Props = {};

export default function Navbar({}: Props) {
  return (
    <nav className="mx-auto mb-8 mt-3 flex justify-between gap-5 align-middle md:w-full">
      <div className="my-auto h-fit w-fit flex-row rounded-md border-2 border-white bg-white font-bold text-black hover:bg-slate-400 sm:w-36 sm:justify-between">
        <a
          className="pointer-events-auto mx-auto flex items-center text-right align-middle text-lg uppercase sm:gap-4 lg:p-0"
          href="https://buyholdearn.com"
          rel="noopener noreferrer"
        >
          <Image
            src="/featured_image.jpg"
            alt="EARN logo"
            className="ml-0 h-10 w-auto overflow-hidden rounded-md"
            width={40}
            height={40}
            priority
          />
          <div className="w-0 scale-0 sm:w-fit sm:scale-100">Home</div>
        </a>
      </div>

      <div className="my-auto h-fit w-fit flex-row rounded-md border-2 border-white bg-white font-bold text-black hover:bg-slate-400 sm:w-40 sm:justify-between">
        <a
          className="pointer-events-auto mx-auto flex h-10 items-center align-middle text-lg uppercase sm:gap-1 sm:text-center lg:p-0 "
          href="https://rarible.com/collection/0x12a961e8cc6c94ffd0ac08deb9cde798739cf775/items"
          rel="noopener noreferrer"
        >
          <Image
            src="/rarible.png"
            alt="Rarible logo"
            className="mx-1 h-8 w-auto overflow-hidden rounded-md"
            width={40}
            height={40}
            priority
          />
          <div className="w-0 scale-0 sm:w-fit sm:scale-100">Rarible</div>
        </a>
      </div>
      <div className="my-auto h-fit w-fit flex-row rounded-md border-2 border-white bg-white font-bold text-black hover:bg-slate-400 sm:w-44 sm:justify-between">
        <a
          className="pointer-events-auto mx-auto flex h-10 items-center align-middle text-lg uppercase sm:gap-1 sm:text-center lg:p-0 "
          href="https://app.uniswap.org/swap?outputCurrency=0x0b61C4f33BCdEF83359ab97673Cb5961c6435F4E"
          rel="noopener noreferrer"
        >
          <Image
            src="/uniswap.png"
            alt="Uniswap logo"
            className="mx-1 h-8 w-auto overflow-hidden rounded-md"
            width={40}
            height={40}
            priority
          />
          <div className="w-0 scale-0 sm:w-fit sm:scale-100">BUY $EARN</div>
        </a>
      </div>
    </nav>
  );
}
