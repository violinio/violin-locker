const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("Locker testing", function () {
  var Locker;
  var TestToken;

  before("Should deploy Locker", async function () {
    [owner, walletWithdraw, walletTo] = await ethers.getSigners();
    const TestTokenFactory = await ethers.getContractFactory("TestToken", owner);
    const LockerFactory = await ethers.getContractFactory("Locker");
    const HoldingContractFactory = await ethers.getContractFactory("HoldingContract", owner);
    Locker = await LockerFactory.deploy(owner.address);
    TestToken = await TestTokenFactory.deploy("TestToken", "TST");
    HoldingContract = await HoldingContractFactory.deploy();

    //TestToken should approve the locker to send funds
    await TestToken.approve(Locker.address, 100000000);
    await TestToken.connect(owner).transfer(walletWithdraw.address, 1000000);

    expect(await Locker.address).to.not.undefined;
    expect(await HoldingContract.address).to.not.undefined;
    expect(await TestToken.address).to.not.undefined;
  });

  it("It should create lock without holding contract", async function () {
    const aWeek = new Date();
    aWeek.setDate(aWeek.getDate() + 7);
    expect(await Locker.connect(owner).createLock(TestToken.address, 1000000, parseInt(aWeek.getTime() / 1000), false))
      .to.emit(Locker, "LockCreated")
      .withArgs(1, TestToken.address, owner.address, 1000000);

      expect(await TestToken.balanceOf(owner.address)).to.be.equals(99000000 - 1000000);
      expect(await TestToken.balanceOf((await Locker.getLock(1))[6])).to.be.equals(1000000);
  
      //check minted and owner of minted
      expect(await Locker.balanceOf(owner.address)).to.be.equals(1);
      expect(await Locker.ownerOf(1)).to.be.equals(owner.address);
  
      await expect(Locker.getLock(1)).to.not.be.reverted;
  });

  it("It should revert due to time passed", async function () {
    const aWeek = new Date();
    aWeek.setDate(aWeek.getDate() - 1);
    await expect(
      Locker.connect(owner).createLock(TestToken.address, 1000000, parseInt(aWeek.getTime() / 1000), false)
    ).to.be.revertedWith("time passed");
  });

  it("It should revert due to too far away", async function () {
    const aWeek = new Date();
    aWeek.setDate(aWeek.getDate() + 700000);
    await expect(
      Locker.connect(owner).createLock(TestToken.address, 1000000, parseInt(aWeek.getTime() / 1000), false)
    ).to.be.revertedWith("too far away");
  });

  it("It should revert due to too far away", async function () {
    const aWeek = new Date();
    aWeek.setDate(aWeek.getDate() + 700000);
    await expect(
      Locker.connect(owner).createLock(TestToken.address, 1000000, parseInt(aWeek.getTime() / 1000), false)
    ).to.be.revertedWith("too far away");
  });

  it("It reverts at withdrawal due to invalid lock", async function () {
    await expect(Locker.connect(owner).withdraw(3)).to.be.revertedWith("invalid lock id");
  });

  it("It withdraws and checks the balances accordingly", async function () {
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;

    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 1]);
    await network.provider.send("evm_mine");

    const startBal = await TestToken.balanceOf(owner.address);

    expect(await Locker.connect(owner).createLock(TestToken.address, 1000000, timestampBefore + 3, true))
      .to.emit(Locker, "LockCreated")
      .withArgs(2, TestToken.address, owner.address, 1000000);
    //check minted and owner of minted
    expect(await Locker.balanceOf(owner.address)).to.be.equals(2);
    expect(await Locker.ownerOf(2)).to.be.equals(owner.address);

    //decreased the initial supply 4 times
    expect(await TestToken.balanceOf(owner.address)).to.be.equals(startBal.sub(1000000));

    expect(await Locker.connect(owner).withdraw(2))
      .to.emit(Locker, "Withdraw")
      .withArgs(2, TestToken.address, owner.address, 1000000);

    // it's increasing 1 time due to the fact that we withdrew the ammount
    expect(await TestToken.balanceOf(owner.address)).to.be.equals(startBal);
    //check if burned, so the owner should have -1 at balance
    expect(await Locker.balanceOf(owner.address)).to.be.equals(1);
    await expect(Locker.ownerOf(2)).to.be.revertedWith("ERC721: owner query for nonexistent token");
  });

  it("It checks for already claimed", async function () {
    const aWeek = new Date();
    await expect(Locker.connect(owner).withdraw(2)).to.be.revertedWith("already claimed");
  });
  it("It should revert due to invalid lock", async function () {
    const aWeek = new Date();
    await expect(Locker.connect(owner).withdraw(3)).to.be.revertedWith("invalid lock id");
  });

  it("It should revert due to not the owner of the lock", async function () {
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;

    await network.provider.send("evm_setNextBlockTimestamp", [timestampBefore + 1]);
    await network.provider.send("evm_mine");

    expect(
      await Locker.connect(owner).createLock(TestToken.address, 1000000, timestampBefore + 3, true)
    )
      .to.emit(Locker, "LockCreated")
      .withArgs(3, TestToken.address, owner.address, 1000000);

    await expect(Locker.connect(walletWithdraw).withdraw(3)).to.be.revertedWith("not owner of lock share token");
  });
});
