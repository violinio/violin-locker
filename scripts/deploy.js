const delay = ms => new Promise(res => setTimeout(res, ms));
const verifiable_chains = ["poly", "bsc", "poly_mumbai"]

async function main() {
    // We get the contract to deploy
    const Locker = await ethers.getContractFactory("Locker");
    const locker = await Locker.deploy();
    console.log("Locker deployed to:", locker.address);

    const chain = process.env['HARDHAT_NETWORK'];
    if (verifiable_chains.includes(chain))
        await verify(chain, locker.address);
}

async function verify(chain, contract) {
    console.log('verifying...')
    await delay(5000);
    await hre.run("verify:verify", {
        address: contract,
        network: chain,
        constructorArguments: []
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
