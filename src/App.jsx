import { ThirdwebSDK } from "@3rdweb/sdk";
import { useWeb3 } from "@3rdweb/hooks";
import { UnsupportedChainIdError } from "@web3-react/core";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS === "") {
  console.log("Wallet address not found.");
}

const sdk = new ThirdwebSDK("rinkeby");

const tokenModule = sdk.getTokenModule(
  "0xeafd32E20fB354603e75a19B41AE2005379e05FB"
);

const bundleDropModule = sdk.getBundleDropModule(
  "0x73dd804Ad20a052fB0ee921D446d6b579a4E9b80",
);

const voteModule = sdk.getVoteModule(
  "0xf24a531E5f0D09F5B08B675ACb6dCFDf6D16F334",
);

const App = () => {
  const { connectWallet, address, error, provider } = useWeb3();
  const signer = provider ? provider.getSigner() : undefined;
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  const [memberAddresses, setMemberAddresses] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [page, setPage] = useState("menu");
  const [proposalMessage, setProposalMessage] = useState("");

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    voteModule
      .getAll()
      .then((proposals) => {
        setProposals(proposals);
        console.log("Proposals:", proposals)
      })
      .catch((err) => {
        console.error("Failed to get proposals", err);
      });
  }, [hasClaimedNFT]);

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    if (!proposals.length) {
      return;
    }

    voteModule
      .hasVoted(proposals[0].proposalId, address)
      .then((hasVoted) => {
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log("User has already voted");
        } else {
          console.log("User has not voted yet");
        }
      })
      .catch((err) => {
        console.error("Failed to check if wallet has voted", err);
      });
  }, [hasClaimedNFT, proposals, address]);

  console.log("Address:", address);

  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    bundleDropModule
      .getAllClaimerAddresses("0")
      .then((addresses) => {
        console.log("Members addresses", addresses)
        setMemberAddresses(addresses);
      })
      .catch((err) => {
        console.error("Failed to get member list", err);
      });
  }, [hasClaimedNFT]);

  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    tokenModule
      .getAllHolderBalances()
      .then((amounts) => {
        console.log("Amounts", amounts)
        setMemberTokenAmounts(amounts);
      })
      .catch((err) => {
        console.error("Failed to get token amounts", err);
      });
  }, [hasClaimedNFT]);

  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          memberTokenAmounts[address] || 0,
          18,
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  useEffect(() => {
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    if (!address) {
      return;
    }

    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("This user has a membership NFT!")
        } else {
          setHasClaimedNFT(false);
          console.log("This user doesn't have a membership NFT.")
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("Failed to NFT balance", error);
      });
  }, [address]);

  if (error instanceof UnsupportedChainIdError) {
    return (
      <div className="unsupported-network">
        <h2>Please connect to Rinkeby</h2>
        <p>
          This dapp only works on the Rinkeby network, please switch networks
          in your connected wallet.
        </p>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to DauysDAO</h1>
        <p>Blockchain based voting platform</p>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    );
  }

  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>DauysDAO voting</h1>
        <div>
          {page === "menu" && <div>
            <br />
            <button onClick={() => setPage("members")}>Member List</button>
            <button onClick={() => setPage("proposals")}>Active Proposals</button>
            <button onClick={() => setPage("new")}>Create New Proposal</button>
          </div>}
          {page ==+ "members" && <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <br />
            <button onClick={() => setPage("menu")}>Back</button>
          </div>}
          {page === "proposals" && <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                setIsVoting(true);

                const votes = proposals.map((proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                try {
                  const delegation = await tokenModule.getDelegationOf(address);
                  if (delegation === ethers.constants.AddressZero) {
                    await tokenModule.delegateTo(address);
                  }
                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        const proposal = await voteModule.get(vote.proposalId);
                        if (proposal.state === 1) {
                          return voteModule.vote(vote.proposalId, vote.vote);
                        }
                        return;
                      })
                    );
                    try {
                      await Promise.all(
                        votes.map(async (vote) => {
                          const proposal = await voteModule.get(
                            vote.proposalId
                          );

                          if (proposal.state === 4) {
                            return voteModule.execute(vote.proposalId);
                          }
                        })
                      );
                      setHasVoted(true);
                      console.log("Successfully voted");
                    } catch (err) {
                      console.error("Failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("Failed to vote", err);
                  }
                } catch (err) {
                  console.error("Failed to delegate tokens");
                } finally {
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                    ? "You Already Voted"
                    : "Submit Votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
              <button onClick={() => setPage("menu")}>Back</button>
              <br />
            </form>
          </div>}
          {page === "new" && <div>
            <h2>New Proposal</h2>
            <form
              onSubmit={async (e) => {
                const proposal_description = document.getElementById("proposal_description").value;
                e.preventDefault();
                e.stopPropagation();
                if (proposal_description.length < 1) {
                  return setProposalMessage("Proposal description is required!");
                }
                console.log(proposal_description);
                try {
                  setProposalMessage("Wait while proposal is being created...");
                  const amount = 1;
                  await voteModule.propose(proposal_description,
                    [
                      {
                        nativeTokenValue: 0,
                        transactionData: tokenModule.contract.interface.encodeFunctionData(
                          "transfer",
                          [
                            address,
                            ethers.utils.parseUnits(amount.toString(), 18),
                          ]
                        ),

                        toAddress: tokenModule.address,
                      },
                    ]
                  );
                  // const newProposal = await voteModule.get(newProposalId);
                  // setProposals([...proposals, newProposal]);
                  setPage("menu");
                } catch (error) {
                  console.error("Failed to create a new proposal", error);
                }
              }}
            >
              <input type="text" placeholder="Proposal Description" id="proposal_description" className="card" />
              {proposalMessage.length > 0 && <small>{proposalMessage}</small>}
              <button type="submit" id="proposal_btn">Submit</button>
              <br />
              <button onClick={() => setPage("menu")}>Back</button>
            </form>
          </div>}
        </div>
      </div>
    );
  };

  const mintNft = () => {
    setIsClaiming(true);
    bundleDropModule
      .claim("0", 1)
      .then(() => {
        setHasClaimedNFT(true);
        console.log(
          `Successfully Minted! Check it our on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address.toLowerCase()}/0`
        );
      })
      .catch((err) => {
        console.error("Failed to claim", err);
      })
      .finally(() => {
        setIsClaiming(false);
      });
  }

  return (
    <div className="mint-nft">
      <h1>Mint your free DauysDAO Membership NFT</h1>
      <button
        disabled={isClaiming}
        onClick={() => mintNft()}
      >
        {isClaiming ? "Minting..." : "Mint your NFT (FREE)"}
      </button>
    </div>
  );
};

export default App;