import React, { Component, type ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  InterwovenKitProvider,
  TESTNET,
  injectStyles,
} from '@initia/interwovenkit-react'
import InterwovenKitStyles from '@initia/interwovenkit-react/styles.js'
import '@initia/interwovenkit-react/styles.css'

import App from './App'
import './index.css'
import {
  INITIA_CHAIN_ID,
  INITIA_CHAIN_NAME,
  INITIA_BECH32_PREFIX,
  INITIA_RPC_URL,
  INITIA_REST_URL,
  INITIA_INDEXER_URL,
  INITIA_JSON_RPC_URL,
  INITIA_GAS_DENOM,
  INITIA_NATIVE_ASSET,
} from '@/utils/constants'

injectStyles(InterwovenKitStyles)

const wagmiConfig = createConfig({
  chains: [
    {
      id: 1,
      name: 'ethereum',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://cloudflare-eth.com'] } },
    },
  ],
  transports: { 1: http() },
})

const queryClient = new QueryClient()

const contagionChain = {
  chain_id: INITIA_CHAIN_ID,
  chain_name: INITIA_CHAIN_NAME,
  network_type: 'testnet',
  bech32_prefix: INITIA_BECH32_PREFIX,
  apis: {
    rpc: [{ address: INITIA_RPC_URL }],
    rest: [{ address: INITIA_REST_URL }],
    indexer: [{ address: INITIA_INDEXER_URL }],
    'json-rpc': [{ address: INITIA_JSON_RPC_URL }],
  },
  fees: {
    fee_tokens: [
      {
        denom: INITIA_GAS_DENOM,
        fixed_min_gas_price: 0,
        low_gas_price: 0,
        average_gas_price: 0,
        high_gas_price: 0,
      },
    ],
  },
  staking: { staking_tokens: [{ denom: INITIA_GAS_DENOM }] },
  native_assets: [INITIA_NATIVE_ASSET],
  metadata: { is_l1: false, minitia: { type: 'minimove' } },
}

class RootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(err: Error) { return { error: err } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, background: '#1a1a2e', color: '#fff', minHeight: '100vh', fontFamily: '"Press Start 2P", monospace' }}>
          <h2 style={{ color: '#c8463b' }}>App failed to load</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, marginTop: 12, color: '#a0a0a0' }}>
            {this.state.error.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <InterwovenKitProvider
            {...TESTNET}
            defaultChainId={INITIA_CHAIN_ID}
            customChain={contagionChain}
          >
            <HashRouter>
              <App />
            </HashRouter>
          </InterwovenKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </RootErrorBoundary>
  </React.StrictMode>,
)
