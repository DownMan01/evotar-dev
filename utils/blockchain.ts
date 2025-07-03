import { ethers } from "ethers"

// BSC Testnet configuration
const BSC_TESTNET_RPC = "https://data-seed-prebsc-1-s1.binance.org:8545/"

// Create a provider for BSC Testnet
export const getProvider = () => {
  return new ethers.providers.JsonRpcProvider(BSC_TESTNET_RPC)
}
