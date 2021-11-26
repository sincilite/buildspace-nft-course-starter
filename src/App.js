import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from './utils/MyEpicNft.json';

// Constants
const TWITTER_HANDLE = 'vanrooyen_m';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-f3lby047iq';
const TOTAL_MINT_COUNT = 10;
const CONTRACT_ADDRESS = "0x10f7cb1fEc36ced8a38F5763f34Cbc1b32d7C23A";

const App = () => {

  const [currentAccount, setCurrentAccount] = useState('');
  const [receipt, setReceipt] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [mintCount, setMintCount] = useState(0);
  const { ethereum } = window;

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have metamask!');
      return;
    } else {
      console.log('We have the ethereum object', ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorised account: ', account);
      setCurrentAccount(account);
      getNftCount();
      //setupEventListener();
    } else {
      console.log('No accounts found');
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      //setupEventListener();
    } catch (error) {
      console.log(error);
    }
  }

  // const setupEventListener = () => {
  //   try {
  //     const { ethereum } = window;

  //     if (ethereum) {
  //       const provider = new ethers.providers.Web3Provider(ethereum);
  //       const signer = provider.getSigner();
  //       const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

  //       connectedContract.on("NewEpicNFT", (from, tokenId) => {
  //         console.log(from, tokenId.toNumber());
  //         setReceipt(tokenId.toNumber());
  //       });

  //       console.log('Setup event listener');
  //     } else {
  //       console.log('No ethereum object');
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // const tearDownEventListener = async () => {
  //   try {
  //     const { ethereum } = window;

  //     if (ethereum) {
  //       const provider = new ethers.providers.Web3Provider(ethereum);
  //       const signer = provider.getSigner();
  //       const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

  //       connectedContract.off("NewEpicNFT", (from, tokenId) => {
  //         console.log("Removed");
  //         //alert(`Hey there! We've minted your NFT and send it to your wallet.  It may be blank right now.  It can take a max of 10 min to show up on OpenSea.  Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
  //       });

  //       console.log('Removed event listener');
  //     } else {
  //       console.log('No ethereum object');
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  const askContractToMintNft = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setIsMinting(true);
        console.log("Mining... please wait");
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        getNftCount();
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getNftCount = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        const nftCount = await connectedContract.tokenCount();
        setMintCount(nftCount.toNumber());
        console.log(nftCount.toNumber());
      }
    } catch (error) {
      console.log(error);
    }
  }

  const remainingNfts = () => {
    return TOTAL_MINT_COUNT - mintCount;
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

    connectedContract.on("NewEpicNFT", (from, tokenId) => {
      console.log(from, tokenId.toNumber());
      setReceipt(tokenId.toNumber());
      setIsMinting(false);
    });
  }, [ethereum]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          { remainingNfts() > 0 ? (
            currentAccount === "" ? (
              renderNotConnectedContainer()
            ): (
              <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                {isMinting === false ?
                  "Mint NFT"
                : "Minting..."}
              </button>
            )
          ) : (
            <p className="sub-text">You've missed out!</p>
          )}
        </div>
        {receipt !== "" ? (
          <div className="receipt-container">
            <p className="sub-text">
              <a
                href={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${receipt}`}
                target="_blank"
                rel="noreferrer"
              >
                Your new NFT is here!
              </a>
              </p>
          </div>
        ) : ''}
        {mintCount ? (
          <div className="receipt-container">
            <p className="sub-text">
              {`${mintCount} NFTs of this collection have been minted.`}
            </p>
            <p className="sub-text">
              There are only {remainingNfts()} left
            </p>
          </div>
        ) : ''}
        <section className="body">
          <p>Checkout the full collection on <a href={OPENSEA_LINK} target="_blank" rel="noreferrer" className="opensea-button">OpenSea</a></p>
        </section>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
