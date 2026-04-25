import { useCallback, useMemo } from 'react';
import { useInterwovenKit } from '@initia/interwovenkit-react';
import { INITIA_CHAIN_ID } from '@/utils/constants';

/**
 * Thin adapter over InterwovenKit. Preserves the shape the game
 * already consumed (`publicKey`, `isConnected`, `connectWallet`,
 * `disconnect`) while exposing the Initia-native bits the UI needs
 * for auto-signing and bridge flows.
 */
export function useWallet() {
  const {
    address,
    initiaAddress,
    username,
    openConnect,
    openWallet,
    openBridge,
    requestTxSync,
    requestTxBlock,
    autoSign,
  } = useInterwovenKit();

  const publicKey = initiaAddress || null;
  const hexAddress = address || null;
  const isConnected = Boolean(initiaAddress);

  const connectWallet = useCallback(async () => {
    openConnect();
  }, [openConnect]);

  const disconnect = useCallback(async () => {
    openWallet();
  }, [openWallet]);

  const bridge = useCallback(() => {
    openBridge({ srcChainId: 'initiation-2', srcDenom: 'uinit' });
  }, [openBridge]);

  return useMemo(
    () => ({
      publicKey,
      hexAddress,
      username: username || null,
      chainId: INITIA_CHAIN_ID,
      isConnected,
      isConnecting: false,
      error: null as string | null,
      connectWallet,
      openWallet,
      openConnect,
      disconnect,
      openBridge: bridge,
      requestTxSync,
      requestTxBlock,
      autoSign,
    }),
    [publicKey, hexAddress, username, isConnected, connectWallet, openWallet, openConnect, disconnect, bridge, requestTxSync, requestTxBlock, autoSign],
  );
}
