/* global BigInt */
import React, { useState, useEffect } from "react";
import { createPublicClient, createWalletClient, http, custom, encodeFunctionData } from "viem";
import { hardhat } from "viem/chains";
import abi from "../abi/CoursePass1155.json";

const CONTRACT = process.env.REACT_APP_CONTRACT_ADDRESS;
const COURSE_ID = Number(process.env.REACT_APP_COURSE_ID);
const IPFS_CID = process.env.REACT_APP_IPFS_CID;
const RPC_URL = process.env.REACT_APP_RPC_URL || "http://127.0.0.1:8545";

export default function Course101() {
  const [address, setAddress] = useState();
  const [priceWei, setPriceWei] = useState(0n);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pub = createPublicClient({ chain: hardhat, transport: http(RPC_URL) });

  // 连接钱包
  async function connectWallet() {
    setError("");
    try {
      const provider = window.ethereum;
      if (!provider) throw new Error("请先安装 MetaMask");
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      setAddress(accounts[0]);
    } catch (e) {
      setError(e.message || "连接钱包失败");
    }
  }

  // 读取价格和访问权
  async function refreshStatus(addr) {
    setError("");
    try {
      const p = await pub.readContract({
        address: CONTRACT,
        abi,
        functionName: "priceOf",
        args: [BigInt(COURSE_ID)],
      });
      setPriceWei(p);

      if (addr) {
        const h = await pub.readContract({
          address: CONTRACT,
          abi,
          functionName: "hasAccess",
          args: [addr, BigInt(COURSE_ID)],
        });
        setHasAccess(Boolean(h));
      }
    } catch (e) {
      setError("读取链上数据失败：" + (e.message || e));
    }
  }

  // 购买
  async function buy() {
    setError("");
    setLoading(true);
    try {
      const provider = window.ethereum;
      if (!provider) throw new Error("请先安装 MetaMask");
      const wallet = createWalletClient({ chain: hardhat, transport: custom(provider) });
      const data = encodeFunctionData({
        abi,
        functionName: "buy",
        args: [BigInt(COURSE_ID), 1n],
      });
      const tx = await wallet.sendTransaction({
        to: CONTRACT,
        data,
        value: priceWei,
        account: address,
      });
      // 等待确认
      await pub.waitForTransactionReceipt({ hash: tx });
      await refreshStatus(address);
    } catch (e) {
      if (e.message?.includes("insufficient funds")) setError("余额不足");
      else if (e.code === 4001) setError("用户拒绝了交易");
      else setError("购买失败：" + (e.message || e));
    }
    setLoading(false);
  }

  useEffect(() => {
    if (address) refreshStatus(address);
    // eslint-disable-next-line
  }, [address]);

  return (
    <div style={{ padding: 32, maxWidth: 480, margin: "0 auto" }}>
      <h2>智能棋课 #101</h2>
      {!address ? (
        <button onClick={connectWallet}>连接钱包</button>
      ) : (
        <>
          <div>钱包地址：{address}</div>
          <div>课程价格：{priceWei ? `${Number(priceWei) / 1e18} ETH` : "读取中..."}</div>
          <div>
            {hasAccess ? (
              <div style={{ marginTop: 24 }}>
                <h3>🎉 已解锁内容</h3>
                <iframe
                  src={`https://ipfs.io/ipfs/${IPFS_CID}`}
                  style={{ width: "100%", height: 400, border: "1px solid #ccc" }}
                  title="IPFS内容"
                />
              </div>
            ) : (
              <div style={{ marginTop: 24, position: "relative" }}>
                <div style={{
                  background: "#eee", padding: 24, borderRadius: 8, opacity: 0.7
                }}>
                  <b>未解锁</b>，请购买后访问
                </div>
                <button
                  onClick={buy}
                  disabled={loading}
                  style={{ marginTop: 16, width: "100%" }}
                >
                  {loading ? "购买中..." : "购买课程"}
                </button>
              </div>
            )}
          </div>
        </>
      )}
      {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
    </div>
  );
}