import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
    "0x73dd804Ad20a052fB0ee921D446d6b579a4E9b80",
);

(async () => {
    try {
        await bundleDrop.createBatch([
            {
                name: "Dauys token",
                description: "This NFT will give you access to DauysDAO!",
                image: readFileSync("scripts/assets/dauys-logo.png"),
            },
        ]);
        console.log("Successfully created a new NFT in the drop!");
    } catch (error) {
        console.error("Failed to create the new NFT", error);
    }
})()