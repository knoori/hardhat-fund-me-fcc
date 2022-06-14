const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// // With explicit name function
// function deployFunc() {
//     console.log("Hi")
// }
// module.exports.default = deployFunc

// With anonymous function
// module.exports = async (hre) => {
// const {getNameAccounts, deployments} = hre
// }
module.exports = async ({ getNamedAccounts, deployments } = hre) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // When using localhost or hardhat networks we need to use a mock
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log(network.config.blockConfirmations) // db
        await verify(fundMe.address, args)
    }
    log("Contract(s) deployed.")
    log("==================================================")
}

module.exports.tags = ["all", "fundme"]
