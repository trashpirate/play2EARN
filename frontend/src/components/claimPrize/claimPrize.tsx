import CopyToClipboard from "../copyToClipboard";
const CLAIM_ADDRESS = "0xb75D371Fad387ebc95F80D278208E442CAa4a2E3";

type Props = {};

export default function ClaimPrize({}: Props) {
  return (
    <div className="mx-auto w-full">
      <div className="mx-auto max-w-sm rounded-md bg-black p-8  shadow-inner-sym md:max-w-none">
        <h2 className="mb-4 border-b-2 border-yellow-500 pb-2 text-xl uppercase">
          Claim your prize
        </h2>
        <div className="pb-4 text-sm text-slate-600">
          <p>Prize Claim Address:</p>
          <CopyToClipboard text={CLAIM_ADDRESS} copyText={CLAIM_ADDRESS} />
        </div>
        <div>
          To claim your prize, send your winning NFT Cards to the address above
          and you will receive your prize within 24hrs.
        </div>
      </div>
    </div>
  );
}
