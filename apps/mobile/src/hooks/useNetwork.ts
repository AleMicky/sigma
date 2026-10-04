import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

type NetworkState = {
  isConnected: boolean;
  isInternetReachable: boolean;
};

export function useNetwork(): NetworkState {
  const [state, setState] =
    useState<NetworkState>({
      isConnected: true,
      isInternetReachable: true,
    });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(
      (networkState) => {
        setState({
          isConnected:
            networkState.isConnected ?? false,

          isInternetReachable:
            networkState.isInternetReachable ??
            networkState.isConnected ??
            false,
        });
      }
    );

    return unsubscribe;
  }, []);

  return state;
}