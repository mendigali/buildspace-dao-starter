import sdk from "./1-initialize-sdk.js";

const appModule = sdk.getAppModule(
  "0xD84F9e3e9387c2aC66373AFc70117f10319cc307",
);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      name: "DauysDAO's Proposals",

      votingTokenAddress: "0xeafd32E20fB354603e75a19B41AE2005379e05FB",

      proposalStartWaitTimeInSeconds: 0,

      proposalVotingTimeInSeconds: 24 * 60 * 60,

      votingQuorumFraction: 0,

      minimumNumberOfTokensNeededToPropose: "0",
    });

    console.log(
      "Successfully deployed vote module, address:",
      voteModule.address,
    );
  } catch (err) {
    console.error("Failed to deploy vote module", err);
  }
})();