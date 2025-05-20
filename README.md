# Lentlify – Decentralized Ad Campaigns on Lens Protocol

<img width="1437" alt="Screenshot 2025-05-20 at 19 03 00" src="https://github.com/user-attachments/assets/abff9a9c-27fb-45f9-9736-21cffbc1ffa8" />


**Lentlify** is a decentralized advertising platform built on the Lens Protocol that lets advertisers create on-chain ad campaigns and influencers earn rewards for promoting content. It leverages smart contracts to ensure campaign creation is transparent, trustless, and composable within the Lens ecosystem.

---

## 🚀 Project Purpose

**Lentlify’s** mission is to make digital advertising open and user-driven. Using Lentlify, advertisers (content creators or brands) can launch ad campaign groups and specific promotional campaigns on Lens in a decentralized manner:  
  
- Campaign Groups & Promotions: Advertisers organize their promotions by first creating a Campaign Group, which emits a CampaignGroupCreated event on-chain  
  
- Within each group, individual ad promotions are launched as campaigns, each emitting a CampaignCreated event
   
- These events make it easy for anyone (or any service) to track new campaigns in real time.     
    
- Transparent & Composable: All campaign data (budgets, rewards, participants, etc.) lives on smart contracts, making the process transparent. Because campaigns are on-chain, other dApps or analytics (e.g. a Lens feed or a subgraph) can permissionlessly plug into Lentlify’s data. This composability means the advertising campaigns can be extended or integrated into other platforms seamlessly.  
   
- Empowering Users: Advertisers gain a trustless way to boost their content (no centralized platform controls the campaign), and influencers (Lens content creators) can directly earn rewards by sharing or engaging with promoted content. The use of smart contracts guarantees that once conditions are met, rewards can be claimed without middlemen.  


- **Campaign Groups & Promotions**:

  - `CampaignGroupCreated` – Emitted when a new campaign group is created.
  - `CampaignCreated` – Emitted when individual promotions inside the group are launched.

- **Why it matters**:
  - Trustless and composable.
  - Incentivizes user engagement via on-chain rewards.
  - Fits seamlessly into the Lens ecosystem.

---

## 🧠 Contract Documentation

### ✳️ Core Features

- **Advertisers** can:
  - Create grouped campaigns with budgets, rewards, durations, and participant rules.
  - Extend, update, or cancel campaigns on-chain.
- **Influencers** can:

  - Participate using actions like _Mirror_, _Comment_, or _Quote_ on Lens posts.
  - Claim automatic on-chain rewards based on participation.

- **Platform**:
  - Collects a small configurable fee (e.g., 5%) per campaign.
  - Admins can update fee settings and withdraw collected fees.

---

### 🔔 Key Events

| Event                    | Description                              |
| ------------------------ | ---------------------------------------- |
| `CampaignGroupCreated`   | A new ad group has been initiated        |
| `CampaignCreated`        | A new promotion is created under a group |
| `InfluencerParticipated` | A user has participated via Lens action  |
| `RewardPaid`             | Rewards distributed to influencer        |
| `FeesCollected`          | Platform fee withdrawn                   |
| `PlatformFeeUpdated`     | Admin updated platform fee               |
| `DepositsRefunded`       | Campaign cancelled and refund triggered  |

---

### 🛠️ Lens Protocol Integration

- **Lens Modules**:

  - Uses `BaseAction` for Lens ActionHub integration.
  - Hooks into Lens posts and profile actions for campaign verification.

- **Lens SDK/API**:
  - Fetches user profiles, post IDs, follower counts, etc.
  - Ensures influencer eligibility via Lens Graph contract.

---

## 🧰 Tech Stack

| Layer            | Tools / Libraries                               |
| ---------------- | ----------------------------------------------- |
| Smart Contract   | Solidity, Hardhat, OpenZeppelin                 |
| Lens Integration | Lens SDK, ActionHub, Social Graph               |
| Frontend         | React, TypeScript, Vite, Tailwind CSS           |
| Blockchain Tools | Wagmi, Viem, ethers.js, ConnectKit              |
| Testing & Deploy | Hardhat, Sepolia (testnet), ERC20 token (GRASS) |

---

## ⚙️ Getting Started

```bash
# Clone the repository
git clone https://github.com/Nester-xyz/lentlify.git
cd lentlify

# Install frontend dependencies
yarn install

# Install contract dependencies
cd server
yarn install
cd ..
```

## 🔑 Environment Setup
Rename .env.example to .env and add:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

## ▶️ Run Frontend

```bash
yarn dev
```
## 📸 Demo Screenshots

<img width="1434" alt="Screenshot 2025-05-20 at 19 08 25" src="https://github.com/user-attachments/assets/314cb85c-1aeb-4f08-8eb1-7ceb196cc610" />

## 🏆 Hackathon Submission

This project was built for the LensPool Hackathon 2025.

### 👨‍💻 Team
-whoisanku  
-alexcommoner  
-yoges  







