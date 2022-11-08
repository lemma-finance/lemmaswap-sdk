require('dotenv').config();

const ethers = require('ethers');
const { getMaxTokenIn, getMaxTokenOut, getAmountsOut } = require("../src");

const optimismProvider = process.env.PROVIDER;
const provider = ethers.getDefaultProvider(optimismProvider);

const { addresses } = require("../src/constants");

const lemmaswapAddress = addresses.lemmaSwap;
const WBTCAddress = addresses.tokens[1];
const WETHAddress = addresses.tokens[0];

describe("lemmaswap-sdk", () => {
    beforeAll(async () => {
    });
    describe("getAmountsOut", () => {
        it("returns correctly", async () => {
            const amountIn = ethers.utils.parseUnits("0.001", 8);
            const amountsOut = await getAmountsOut(provider, lemmaswapAddress, amountIn, [WBTCAddress, WETHAddress]);
            expect(amountsOut[0]).toStrictEqual(amountIn);
        });
    });
    describe("getMaxTokenIn", () => {
        it("returns correctly", async () => {
            const maxTokenIn = await getMaxTokenIn(provider, WETHAddress);
            expect(maxTokenIn).toBeInstanceOf(ethers.BigNumber);
        });
    });

    describe("getMaxTokenOut", () => {
        it("returns correctly", async () => {
            const maxTokenOut = await getMaxTokenOut(provider, WETHAddress);
            expect(maxTokenOut).toBeInstanceOf(ethers.BigNumber);
        });
    });
})

