import sdk from "./1-initialize-sdk.js";

const app = sdk.getAppModule("0xD84F9e3e9387c2aC66373AFc70117f10319cc307");

(async () => {
    try {
        const tokenModule = await app.deployTokenModule({
            name: "DauysDAO Token",
            symbol: "DAU",
        });
        console.log(
            "Successfully deployed token module, address:",
            tokenModule.address,
        );
    } catch (error) {
        console.error("Failed to deploy token module", error);
    }
})();