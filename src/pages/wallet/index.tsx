import React from "react";

const WalletPage: React.FC = () => {
  // Placeholder wallet data
  const balance = "0.00";
  const address = "0x1234...abcd";

  return (
    <div className="wallet-page" style={{ maxWidth: 480, margin: "0 auto", padding: 32 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Wallet</h1>
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #eee", padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <strong>Balance:</strong>
          <div style={{ fontSize: 24, color: "#16a34a", fontWeight: 600 }}>{balance} ETH</div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <strong>Address:</strong>
          <div style={{ fontFamily: "monospace", fontSize: 16 }}>{address}</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ padding: "8px 20px", borderRadius: 8, background: "#2563eb", color: "#fff", border: "none", fontWeight: 600 }}>
            Deposit
          </button>
          <button style={{ padding: "8px 20px", borderRadius: 8, background: "#f59e42", color: "#fff", border: "none", fontWeight: 600 }}>
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
