import fs from 'fs';
import path from 'path';

const CONTRACT_NAME = 'LensAdCampaignMarketplace';
const CONTRACT_ADDRESS = '0x0AA71328BA4BA1D3Ff904202Da4fF9fBa72Ce95D';

const abiPath = path.join(__dirname, `../artifacts-zk/contracts/${CONTRACT_NAME}.sol/${CONTRACT_NAME}.json`);
const abiJson = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));

const frontendAbiDir = path.join(__dirname, '../../src/constants');

// Ensure directory exists
if (!fs.existsSync(frontendAbiDir)) {
  fs.mkdirSync(frontendAbiDir, { recursive: true });
}

// Export ABI
fs.writeFileSync(
  path.join(frontendAbiDir, 'abi.ts'),
  `export const abi = ${JSON.stringify(abiJson.abi, null, 2)};`
);

// Export Address
fs.writeFileSync(
  path.join(frontendAbiDir, 'addresses.ts'),
  `export const contractAddress = "${CONTRACT_ADDRESS}";`
);

console.log('✅ ABI and address exported to frontend/constants');
