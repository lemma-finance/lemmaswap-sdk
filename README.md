# lemmaswap-Sdk
- estimate amountsOut for lemmaswap

## How to use - Example

```
require('dotenv').config();

const ethers = require("ethers");
const { getAmountsOut } = require("@lemma-finance/lemmaswap-sdk");

const { BigNumber, constants, utils } = ethers;
const { MaxUint256, AddressZero } = constants;
const { parseUnits } = utils;

const LemmaSwapArtifacts = require("../../abis/LemmaSwap.json");// ABI for LemmaSwap (get it here: https://optimistic.etherscan.io/address/0x6b283cbcd24fdf67e1c4e23d28815c2607eefe29#code)
const ERC20Artifacts = require("../../abis/ERC20.json"); // ABI for an ERC20 

const optimismProvider = process.env.PROVIDER; //If for Infura Provider it does not work , try with alchemy provider. 
const provider = ethers.getDefaultProvider(optimismProvider);
signer = new ethers.Wallet(process.env.PRIV_KEY, provider);

const lemmaSwap = new ethers.Contract("0x6b283cbcd24fdf67e1c4e23d28815c2607eefe29", LemmaSwapArtifacts.abi, signer);
const erc20 = new ethers.Contract(AddressZero, ERC20Artifacts.abi, signer);
const tokenIn = "0x68f180fcce6836688e9084f035309e29bf0a2095"; //WBTC
const tokenOut = "0x4200000000000000000000000000000000000006"; //WETH

const swapTokensForTokens = async (fromAmount, fromToken, toToken) => {
    const path = [fromToken, toToken];
    const fromTokenERC20 = erc20.attach(fromToken);
    const allowanceFromSignerToLemmaSwap = await fromTokenERC20.allowance(signer.address, lemmaSwap.address);
    if (allowanceFromSignerToLemmaSwap.lt(fromAmount)) {
        let tx = await fromTokenERC20.approve(lemmaSwap.address, MaxUint256);
        await tx.wait();
    }
    const to = signer.address;
    const deadline = Math.floor(Date.now() / 1000) + 3600; //hour from now (your deadline preference)

    const amountsOut = await getAmountsOut(lemmaSwap.provider, lemmaSwap.address, fromAmount, path);
    const slippage = BigNumber.from("10");
    const slippageDiv = BigNumber.from("10000");
    const minAmountOut = amountsOut[1].mul(slippage).div(slippageDiv);//your slippage preference

    let tx = await lemmaSwap.swapExactTokensForTokens(fromAmount, minAmountOut, path, to, deadline);
    await tx.wait();
};

swapTokensForTokens(parseUnits("0.001", 8), tokenIn, tokenOut);
```
