# lemmaswap-Sdk

## How to use - Example

```
    require('dotenv').config();
    const ethers = require("ethers");
    const { getAmountsOut } = require("@lemma-finance/lemmaswap-sdk");
    const { BigNumber, constants } = ethers;

    const swapExactTokensForETH = async (exchangeName, fromAmount, fromToken, toToken) => {
        console.log('\nNew getAmountsOut: ', exchangeName);
        const path = [fromToken, toToken];
        const results = await getAmountsOut(
            lemmaSwap.provider, lemmaSwap.address, fromAmount, path
        );
        const slippage = BigNumber.from("10");
        const slippageDiv = BigNumber.from("10000");
        const minAmountOut = results[1].mul(slippage).div(slippageDiv);
        console.log("amountsIn", results[0].toString());
        console.log("amountsOut after slippage", minAmountOut.toString());
    };

    async function callAllGetAmountsOut() {
        await swapExactTokensForETH("WBTC-WETH", parseUnits("0.0001", 8), WBTCAddress, WETHAddress);
        await swapExactTokensForETH("WETH-WBTC", parseUnits("0.01", 18), WETHAddress, WBTCAddress);
        await swapExactTokensForETH("LINK-WETH", parseUnits("1", 18), LINKAddress, WETHAddress, LINK_WHALE_WALLET);
        await swapExactTokensForETH("AAVE-WETH", parseUnits("0.1", 18), AAVEAddress, WETHAddress, AAVE_WHALE_WALLET);
        await swapExactTokensForETH("CRV-WETH", parseUnits("0.1", 18), CRVAddress, WETHAddress, CRV_WHALE_WALLET);
        await swapExactTokensForETH("PERP-WETH", parseUnits("0.1", 18), PERPAddress, WETHAddress, PERP_WHALE_WALLET);
    }

    callAllGetAmountsOut()

```
