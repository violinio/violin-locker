

const delay = ms => new Promise(res => setTimeout(res, ms));
const etherscanChains = ["poly", "bsc", "poly_mumbai"];
const sourcifyChains = ["xdai", "celo", "avax", "avax_fuji", "arbitrum"];

const main = async function (hre) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    // We get the contract to deploy
    const locker = await deploy("Locker", { from: deployer, log: true, args: [] });
    console.log("Locker deployed to:", locker.address);

    const chain = hre.network.name;
    await verify(hre, chain, locker.address);
}

async function verify(hre, chain, contract) {
    const isEtherscanAPI = etherscanChains.includes(chain);
    const isSourcify = sourcifyChains.includes(chain);
    if(!isEtherscanAPI && !isSourcify)
        return;

    console.log('verifying...');
    await delay(5000);
    if (isEtherscanAPI) {
        await hre.run("verify:verify", {
            address: contract,
            network: chain,
            constructorArguments: []
        });
    } else if (isSourcify) {
        try {
            await hre.run("sourcify", {
                address: contract,
                network: chain,
                constructorArguments: []
            });
        } catch (error) {
            console.log("verification failed: sourcify not supported?");
        }
    }
}

module.exports = main;