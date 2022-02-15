import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

// 0xD84F9e3e9387c2aC66373AFc70117f10319cc307
const app = sdk.getAppModule("0xD84F9e3e9387c2aC66373AFc70117f10319cc307");

(async () => {
    try {
        const bundleDropModule = await app.deployBundleDropModule({
            name: "Dauys token",
            description: "Membership token for DauysDAO.",
            image: readFileSync("scripts/assets/dauys-logo.png"),
            primarySaleRecipientAddress: ethers.constants.AddressZero
        });
        console.log("Successfully deployed bundleDrop module, address:", bundleDropModule.address);
        console.log("budleDrop metadata:", await bundleDropModule.getMetadata());
    } catch (error) {
        console.error("failed to deploy bundleDrop module", error);
    }
})()
