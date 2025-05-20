# Lentlify – Decentralized Ad Campaigns on Lens Protocol

<img width="1437" alt="Screenshot 2025-05-20 at 19 03 00" src="https://github.com/user-attachments/assets/dde6486f-7f11-4ef2-b3bc-55fb88f2be3c" />

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

Lentlify is built to deeply integrate with Lens Protocol’s social graph and on-chain modules:
The smart contract inherits Lens’s BaseAction module to hook into the Lens ActionHub system

- This means the contract can act as a Lens “action module” – whenever a user mirrors/comments on a promoted Lens post, the Lens protocol can trigger Lentlify’s contract logic. Through the ActionHub integration, campaign participation can be recorded automatically as Lens actions occur.
-  The contract constructor accepts a Graph address (Lens Social Graph contract) and an ActionHub address, which are provided on deployment
- The Graph contract is used to verify follower counts (e.g., enforcing that an influencer meets the minimum follower requirement before their action counts) in a decentralized way. The ActionHub address connects Lentlify to the Lens platform so that user actions and campaign logic are linked on-chain.
- Lens API Usage: On the frontend, Lentlify uses the Lens Protocol API and client libraries for seamless user experience. For example, it fetches Lens profile data by wallet address using the official Lens SDK
- This allows the dApp to display user profiles, posts, and other Lens data. The Lens SDK also handles posting content or collecting content if needed (e.g., if an influencer needs to perform a mirror, it can be done via Lens APIs or transactions through the smart contract if configured as an action module).

### Tech Stack
Lentlify is built with a modern web3 stack, combining smart contracts, Lens tools, and a robust frontend:
Blockchain & Contracts: Solidity smart contracts (development with Hardhat). The project uses OpenZeppelin libraries for security (Ownable, ReentrancyGuard) and Lens-specific contracts for integration

- Contracts are deployed on the Lens Mainnet for this hackathon demo, using an ERC20 token (GHO TOKEN) as the native token.
- Lens Protocol: Lens API & SDK – Lentlify integrates with Lens Protocol via the Lens SDK (@lens-protocol/client) for interacting with profiles and content, and uses Lens on-chain modules (ActionHub, social graph) for tying campaigns to Lens actions. This allows Lentlify to naturally plug into the Lens ecosystem of profiles and posts.
- Frontend: React + TypeScript single-page application, bundled with Vite. The app uses Wagmi hooks and viem (ETH SDK) for blockchain interactions, and ConnectKit for wallet connectivity. Styling is done with Tailwind CSS (dark mode supported), giving the UI a clean, responsive design. The UI provides pages for creating campaigns, viewing wallet details, and browsing ongoing campaigns. 
- Backend/Server: No traditional centralized backend is needed – the dApp is fully decentralized. However, the repository includes a Hardhat setup (in the server/ folder) for contract compilation, testing, and deployment scripts. All state and logic live on-chain in the smart contracts, and the app reads and writes data directly from the blockchain or via the Lens API and Lens Smart Wallet.
- Libraries & Tools: Additional tools include OpenZeppelin for secure contract patterns, viem for contract calls, react-router for frontend routing, and TanStack React Query for caching queries. The project structure was bootstrapped with a React + Vite + TypeScript template.

## 🧰 Tech Stack

| Layer            | Tools / Libraries                               |
| ---------------- | ----------------------------------------------- |
| Smart Contract   | Solidity, Hardhat, OpenZeppelin                 |
| Lens Integration | Lens SDK, ActionHub, Social Graph               |
| Frontend         | React, TypeScript, Vite, Tailwind CSS           |
| Blockchain Tools | Wagmi, Viem, ethers.js, ConnectKit              |
| Testing & Deploy | Hardhat, Lens Mainnet, ERC20 token () |

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


<img width="1108" alt="Screenshot 2025-05-20 at 19 36 49" src="https://github.com/user-attachments/assets/bddfa1f8-7930-4846-8987-65ee1e7fd50c" />

<img width="1118" alt="Screenshot 2025-05-20 at 19 37 01" src="https://github.com/user-attachments/assets/74a570b9-2b3d-40c5-b67f-286d10b6ceff" />

<img width="1439" alt="Screenshot 2025-05-20 at 19 36 35" src="https://github.com/user-attachments/assets/cd262066-d24a-4127-8289-fd823606faca" />


## 🏆 Hackathon Submission

This project was built for the Lens Spring Hackathon 2025.


### 👨‍💻 Team
- [whoisanku](https://hey.xyz/u/whoisanku)
- adarshkunwar
- [yoges](https://hey.xyz/u/yoges)







