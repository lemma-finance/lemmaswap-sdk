const { getAmountsOut } = require("@lemma-finance/lemmaswap-sdk");
const ethers = require('ethers');

const optimismProvider = "https://mainnet.optimism.io";
const provider = ethers.getDefaultProvider(optimismProvider);

const lemmaswapAddress = "0x6b283cbcd24fdf67e1c4e23d28815c2607eefe29";
const WBTCAddress = "0x68f180fcce6836688e9084f035309e29bf0a2095";
const WETHAddress = "0x4200000000000000000000000000000000000006";
describe("lemmaswap-sdk", () => {
    beforeAll(async () => {
    });
    describe("getAmountsOut", () => {
        it("returns correctly", async () => {
            const amountIn = ethers.utils.parseUnits("0.0001", 8);
            const amountsOut = await getAmountsOut(provider, lemmaswapAddress, amountIn, [WBTCAddress, WETHAddress]);
            expect(amountsOut[0]).toStrictEqual(amountIn);
        });
    });
})

