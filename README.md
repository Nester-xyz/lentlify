
<img width="1437" alt="Screenshot 2025-05-20 at 19 03 00" src="https://github.com/user-attachments/assets/abff9a9c-27fb-45f9-9736-21cffbc1ffa8" />

# Lentlify – Decentralized Ad Campaigns on Lens Protocol

<img width="1437" alt="Screenshot 2025-05-20 at 19 03 00" src="https:///user-attachments/assets/abff9a9c-27fb-45f9-9736-21cffbc1ffa8" />


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

### Contract Documentation

**Core Smart Contract Features** : The Lentlify smart contract (LensAdCampaignMarketplace) implements a full marketplace for ad campaigns on Lens. Key capabilities include:  
- Advertiser Tools: Advertisers can create ad campaigns tied to specific Lens posts and set detailed parameters – budget allocation, reward amounts for influencers, campaign duration, minimum follower requirements for participants, and available “slots” for different action types (e.g. number of mirrors or comments allowed)

- Multiple campaigns can be grouped under a campaign group for better organization

- Advertisers may also extend an active campaign’s duration, update the campaign content, or cancel a campaign to refund unused funds.
Influencer Participation: Influencers join campaigns by performing Lens social actions such as Mirror, Comment, or Quote on the advertiser’s post. These actions are recorded on-chain (each participation triggers an InfluencerParticipated event with the details) and count toward the campaign’s goals. After the campaign period, influencers can claim rewards from the contract proportional to their contributions

- All reward logic is handled by the smart contract, ensuring influencers are paid fairly and trustlessly once the campaign ends.

- Platform & Fees: The platform is self-sustaining through a small fee on campaigns. A platform fee (configurable, default 5%) is collected from campaign budgets and can be adjusted by administrators

- The contract tracks fees and allows an admin (owner) to withdraw collected fees (FeesCollected event) for the hackathon’s “Lentlify” or any designated pool. Admins can also update the fee percentage (PlatformFeeUpdated) or the fee collector address as needed, providing flexibility in governance.


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
| Testing & Deploy | Hardhat, Lens Mainnet, ERC20 token (GRASS) |

---

## ⚙️ Getting Started

```bash
# Clone the repository
git clone https:///Nester-xyz/lentlify.git
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
VITE_WALLETCONNECT_PROJECT_ID=""
VITE_LENS_APP_ID=""
```

## ▶️ Run Frontend

```bash
yarn dev
```
## 📸 Demo Screenshots

<img width="1434" alt="Screenshot 2025-05-20 at 19 08 25" src="https:///user-attachments/assets/314cb85c-1aeb-4f08-8eb1-7ceb196cc610" />

<img width="1434" alt="Screenshot 2025-05-20 at 19 08 25" src="https://github.com/user-attachments/assets/314cb85c-1aeb-4f08-8eb1-7ceb196cc610" />

<img width="1439" alt="Screenshot 2025-05-20 at 19 36 35" src="https://github.com/user-attachments/assets/1da47cad-ae29-4775-89a6-f937933daeea" />

<img width="1108" alt="Screenshot 2025-05-20 at 19 36 49" src="https://github.com/user-attachments/assets/cf0a6080-b9d4-4fdc-a400-ed2c8f40a565" />

<img width="1118" alt="Screenshot 2025-05-20 at 19 37 01" src="https://github.com/user-attachments/assets/366fbd91-887f-4e48-a173-f8fef0ede5d5" />

## 🏆 Hackathon Submission

This project was built for the Lens Spring Hackathon 2025.


### 👨‍💻 Team
- [whoisanku](https://www.github.com/whoisanku)
- [adarshkunwar](https://www.github.com/adarshkunwar)
- [yoges](https://www.github.com/Aryog)







