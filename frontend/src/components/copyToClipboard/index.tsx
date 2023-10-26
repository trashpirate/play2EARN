"use client";
import styles from "./copytoclipboard.module.css";
import { BiCopy } from "react-icons/bi";
import { useState } from "react";

export default function CopyToClipboard(props: { text: string; copyText: string }) {
  const [copied, setCopied] = useState<boolean>(false);

  const copylink = async (e: any) => {
    try {
      navigator.clipboard.writeText(props.copyText);
      setCopied(true);
      console.log("copied: " + props.copyText);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className={styles.container}>
      <h3>{props.text}</h3>
      <div onClick={copylink} className={styles.copy}>
        <div className={styles.copy_icon}>
          <BiCopy />
        </div>

        {copied && <div className={styles.notification}>Copied!</div>}
      </div>
    </div>
  );
}
