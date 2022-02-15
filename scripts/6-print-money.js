import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule(
    "0xeafd32E20fB354603e75a19B41AE2005379e05FB",
);

(async () => {
    try {
        const amount = 100_000;
        const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);
        await tokenModule.mint(amountWith18Decimals);
        const totalSupply = await tokenModule.totalSupply();

        console.log(
            "There now is",
            ethers.utils.formatUnits(totalSupply, 18),
            "$DAU in circulation",
        );
    } catch (error) {
        console.error("Failed to print money", error);
    }
})();