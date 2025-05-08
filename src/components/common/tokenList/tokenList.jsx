import { useEffect, useState, useMemo } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { ethers } from "ethers";
import { erc20Abi, formatUnits } from "viem";

// Token detail list by chain id
const TOKENS = {
  [1]: [
    {
      name: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
    },
    {
      name: "Ether fi",
      address: "0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB",
      decimals: 18,
    },
    {
      name: "NXCPR",
      address: "0x96665680f4889891f3209713cb9a8205Dce7278D",
      decimals: 18,
    }
  ],
  [8453]: [
    {
      name: "USDC",
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6,
    },
    {
      name: "Kendu Inu",
      address: "0xef73611F98DA6E57e0776317957af61B59E09Ed7",
      decimals: 18,
    },
    {
      name: "NXCPR",
      address: "0x35A280A5858b37b35627E75bDa600741ABa39E30",
      decimals: 18,
    }
  ],

  // TO DO: Add more chains and tokens
};

const TokenList = () => {
  const { address, chain, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [balance, setBalance] = useState(0);
  const [tokenList, setTokenList] = useState([]);

  const tokenListFormatted = useMemo(() => {
    return tokenList.map((token) => {
      return {
        ...token,
        balance: formatUnits(token.balance, token.decimals),
      }
    });
  }, [tokenList]);

  useEffect(() => {
    if (!address) return;

    const fetchBalance = async () => {

      const balance = ethers.formatEther(await publicClient.getBalance({address}));
      setBalance(balance);
      if (!address || !publicClient) return;

      const results = await Promise.all(
        TOKENS[chain?.id].map(async (token) => {
          try {
            const raw = await publicClient.readContract({
              address: token.address,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [address],
            });
            return {
              name: token.name,
              address: token.address,
              balance: raw,
              owner: address,
              decimals: token.decimals,
            };
          } catch (err) {
            console.error(`Error getting balance of ${token.name}:`, err);
            return null;
          }
        })
      );

      const filtered = results.filter(
        (token) => token && parseFloat(token.balance) > 0
      );
      setTokenList(filtered);
    };

    fetchBalance();
  }, [address, chain]);
  return (
    <div>
      {isConnected ? <div
        className="pt-[14px] xl:pt-[85px] pb-[46px] leading-tight tracking-widest text-[#EEEEEE] text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] font-light font-[RobotoMonoLight]"
        style={{ color: "#FFFFFF" }}>
        <h3 className="text-[26px] sm:text-[35px] md:text-[35px] mb-[16px] text-white leading-10 font-[VioletSans]">
          Address: {address.slice(0, 6)}...{address.slice(-4)}
        </h3>
        <p className="bg-gradient-to-r from-[#5AB0FF] to-[#01FFC2] inline-block text-transparent bg-clip-text  font-medium md:mb-[16px] text-[16px] sm:text-[16px] md:text-[24px] font-[RobotoMono]">
          {chain && `Chain: ${chain.name}`}
        </p>
        <br />
        <p className="bg-gradient-to-r from-[#5AB0FF] to-[#01FFC2] inline-block text-transparent bg-clip-text  font-medium md:mb-[16px] text-[16px] sm:text-[16px] md:text-[24px] font-[RobotoMono]">
          {balance && `Balance: ${balance} ${chain?.nativeCurrency ? chain?.nativeCurrency?.symbol : ""}`}
        </p>
        <br />
        {tokenListFormatted?.length > 0 && <p className="text-white md:text-[18px] mt-[16px] mb-[28px] sm:text-[15px] font-[RobotoMono]">
          Tokens List:
          <br />
          <br />
          {tokenListFormatted.map((token) => {
            return <div className="flex flex-col gap-[16px]" key={token.address}>
              {token && <>
                <p className="text-white md:text-[18px] sm:text-[15px] font-[RobotoMono]">
                  <b>Address:</b> {token.address}
                </p>
                <p className="text-white md:text-[18px] sm:text-[15px] font-[RobotoMono]">
                  <b>Balance:</b> {token.balance}
                </p>
                <br />
              </>}
            </div>
          })}
        </p>}
      </div> : <div>
        <h3 className="text-[26px] sm:text-[35px] md:text-[35px] text-white leading-10 font-[VioletSans]">
          Connect your wallet to see your token list
        </h3>
      </div>}
    </div>
  )
}

export default TokenList;

/**
  // This is other version to get the token list with Alchemy API
  // This don't need the TOKENS array

  const API_KEY = "<API_KEY>";
  const API_URLS = {
    [1]: "https://eth-mainnet.g.alchemy.com/v2/",
    [8453]: "https://base-mainnet.g.alchemy.com/v2/",
    [42161]: "https://arb-mainnet.g.alchemy.com/v2/",
    [137]: "https://polygon-mainnet.g.alchemy.com/v2/",
    [11155111]: "https://eth-sepolia.g.alchemy.com/v2/",
    [10]: "https://opt-mainnet.g.alchemy.com/v2/",
  }
  const fetchBalance = async () => {

      const balance = ethers.formatEther(await provider.getBalance(address));
      setBalance(balance);

      const raw = JSON.stringify({
        "jsonrpc": "2.0",
        "method": "alchemy_getTokenBalances",
        "params": [
          address
        ],
        "id": 1
      });
      const requestOptions = {
        method: "POST",
        body: raw,
      };

      fetch(`${API_URLS[chain?.id]}${API_KEY}`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
          const data = JSON.parse(result);
          const tokenList = data.result.tokenBalances.map((token) => ({
            address: token.contractAddress,
            balance: token.tokenBalance,
          }));
          setTokenList(tokenList);
        })
        .catch((error) => console.error(error));
    };

    fetchBalance();
    ....
  }
  
  // The disadvantage of this version is that response doesn't have the symbol or the name of the token
  // we can get that info from the contract:
  
  const name = await publicClient.readContract({ address: token.address, abi: erc20Abi, functionName: "name" });
  const symbol = await publicClient.readContract({ address: token.address, abi: erc20Abi, functionName: "symbol" });
  
  // but if the wallet have a lot of tokens the rpc started to fail (CORS errors)

 */