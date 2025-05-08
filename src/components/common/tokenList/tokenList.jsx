import { useEffect, useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

const API_KEY = "<API_KEY>";
const API_URLS = {
  [1]: "https://eth-mainnet.g.alchemy.com/v2/",
  [42161]: "https://arb-mainnet.g.alchemy.com/v2/",
  [8453]: "https://base-mainnet.g.alchemy.com/v2/",
  [137]: "https://polygon-mainnet.g.alchemy.com/v2/",
}
const TokenList = () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const { address, chain, isConnected } = useAccount();
  const [balance, setBalance] = useState(0);
  const [tokenList, setTokenList] = useState([]);

  const tokenListFormatted = useMemo(() => {
    return tokenList.map((token) => {
      return {
        ...token,
        balance: ethers.formatEther(token.balance),
      }
    });
  }, [tokenList]);

  useEffect(() => {
    if (!address) return;

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
  }, [address, chain]);
  return (
    <div>
      {isConnected ? <div
        className="pt-[14px] xl:pt-[85px] pb-[46px] leading-tight tracking-widest text-[#EEEEEE] text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] font-light font-[RobotoMonoLight]"
        style={{ color: '#FFFFFF' }}>
        <h3 className="text-[26px] sm:text-[35px] md:text-[35px] text-white leading-10 font-[VioletSans]">
          Address: {address}
        </h3>
        <p className="bg-gradient-to-r from-[#5AB0FF] to-[#01FFC2] inline-block text-transparent bg-clip-text  font-medium md:mb-[16px] text-[16px] sm:text-[16px] md:text-[24px] font-[RobotoMono]">
          {chain && `Chain: ${chain.name}`}
        </p>
        <br />
        <p className="bg-gradient-to-r from-[#5AB0FF] to-[#01FFC2] inline-block text-transparent bg-clip-text  font-medium md:mb-[16px] text-[16px] sm:text-[16px] md:text-[24px] font-[RobotoMono]">
          {balance && `Balance: ${balance} ${chain?.nativeCurrency?.symbol}`}
        </p>
        <br />
        <p className="text-white md:text-[18px] mt-[16px] mb-[28px] sm:text-[15px] font-[RobotoMono]">
          Tokens List:
          <br />
          <br />
          {tokenListFormatted.map((token) => {
            return <div className="flex flex-col gap-[16px]" key={token.address}>
              <p className="text-white md:text-[18px] sm:text-[15px] font-[RobotoMono]">
                <b>Address:</b> {token.address}
              </p>
              <p className="text-white md:text-[18px] sm:text-[15px] font-[RobotoMono]">
                <b>Balance:</b> {token.balance}
              </p>
              <br />
            </div>
          })}
        </p>
      </div> : <div>
        <h3 className="text-[26px] sm:text-[35px] md:text-[35px] text-white leading-10 font-[VioletSans]">
          Connect your wallet to see your token list
        </h3>
      </div>}
    </div>
  )
}

export default TokenList;