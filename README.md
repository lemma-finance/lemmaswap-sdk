# lemmaswap-Sdk

## How to use

```
    require('dotenv').config();
    const ethers = require("ethers");
    const { getAmountsOut } = require("@lemma-finance/lemmaswap-sdk");
    const { BigNumber, constants } = ethers;

    const swapExactTokensForETH = async (fromAmount, fromToken) => {
        const lemmaSwap = new ethers.Contract(addresses.LemmaSwap.address, LemmaSwapArtifacts.abi, signer);
        const path = [fromToken, toToken];
        const results = await getAmountsOut(lemmaSwap.provider, lemmaSwap.address, fromAmount, path);
        const slippage = BigNumber.from("10");
        const slippageDiv = BigNumber.from("10000");
        const minAmountOut = results[1].mul(slippage).div(slippageDiv);
        console.log("amountsIn", results[0].toString());
        console.log("amountsOut after slippage", minAmountOut.toString());
    };

    swapExactTokensForETH(parseUnits("0.0001", 8), WBTCAddress);

```
