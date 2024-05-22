"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useCapabilities, useWriteContracts } from "wagmi/experimental";
import { useMemo, useState } from "react";
import { CallStatus } from "../components/CallStatus";
import { myNFTABI, myNFTAddress } from "../myNFT";

export default function Page() {
  const { address, chainId, isConnected } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [id, setId] = useState<string | undefined>(undefined);
  const { writeContracts } = useWriteContracts({
    mutation: { onSuccess: (id) => setId(id) },
  });
  const { data: availableCapabilities } = useCapabilities({
    account: address,
  });
  const capabilities = useMemo(() => {
    if (!availableCapabilities || !chainId) return {};
    console;
    const capabilitiesForChain = availableCapabilities[chainId];
    console.log(capabilitiesForChain);
    if (
      capabilitiesForChain["paymasterService"] &&
      capabilitiesForChain["paymasterService"].supported
    ) {
      return {
        paymasterService: {
          url: `https://rpc.zerodev.app/api/v3-alpha/paymaster/2b7f65cc-ad39-4c36-a12c-799ff9e6556a`,
        },
      };
    }
    return {};
  }, [availableCapabilities]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Transact With Paymaster</h2>
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Capabilities</h3>
          <ul className="list-disc list-inside">
            {Object.entries(capabilities).map(([key, value]) => (
              <li key={key} className="mb-1">
                <span className="font-medium">{key}:</span>{" "}
                {JSON.stringify(value)}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Connect</h2>
            <div className="space-y-2">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  type="button"
                  className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {connector.name}
                </button>
              ))}
            </div>
            <div className="mt-2 text-red-500">{status}</div>
            <div className="mt-2 text-red-500">{error?.message}</div>
          </div>
          {isConnected && address && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-2 font-mono">{address}</div>
              <button
                onClick={() => disconnect()}
                className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Disconnect
              </button>
            </div>
          )}
          <button
            onClick={() => {
              writeContracts({
                contracts: [
                  {
                    address: myNFTAddress,
                    abi: myNFTABI,
                    functionName: "safeMint",
                    args: [address],
                  },
                ],
                capabilities,
              });
            }}
            className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Mint
          </button>
          {id && <CallStatus id={id} />}
        </div>
      </div>
    </div>
  );
}
