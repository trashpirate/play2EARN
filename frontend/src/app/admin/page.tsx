"use client";
import Navbar from "@/components/navigation/navbar";
import React from "react";
import AdminPanel from "./adminPanel";
import Win from "./wins";
import { ConnectButton } from "@rainbow-me/rainbowkit";

type Props = {};

export default function Admin({}: Props) {
  return (
    <main className="flex min-h-screen flex-col bg-black bg-scroll p-8 text-white bg-blend-darken">
      <section className="w-full flex-col items-center justify-between">
        <ConnectButton
          accountStatus="address"
          showBalance={true}
          chainStatus="icon"
        />
        <AdminPanel></AdminPanel>
        <Win></Win>
      </section>
    </main>
  );
}
