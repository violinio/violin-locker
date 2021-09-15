const { expect } = require("chai");
const { ethers } = require("hardhat");
const { FakeContract, smock } = require("@defi-wonderland/smock");

describe("Locker testing", function () {
  var Locker;
  var TestToken;

  before("Should deploy Locker", async function () {
    [owner, walletWithdraw, walletTo] = await ethers.getSigners();
    const TestTokenFactory = await ethers.getContractFactory("TestToken", owner);
    const LockerFactory = await ethers.getContractFactory("Locker");
    const HoldingContractFactory = await ethers.getContractFactory("HoldingContract", owner);
    Locker = await LockerFactory.deploy();
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
    expect(await Locker.connect(owner).createLock(TestToken.address, 1000000, parseInt(aWeek.getTime() / 1000), false, false))
      .to.emit(Locker, "LockCreated")
      .withArgs(1, TestToken.address, owner.address, 1000000);

    expect(await TestToken.balanceOf(owner.address)).to.be.equals(99000000 - 1000000);
    expect(await TestToken.balanceOf(Locker.address)).to.be.equals(1000000);
    await expect(Locker.getLock(1)).to.not.be.reverted;
  });

  it("It should revert due to time passed", async function () {
    const aWeek = new Date();
    aWeek.setDate(aWeek.getDate() - 1);
    await expect(
      Locker.connect(owner).createLock(TestToken.address, 1000000, parseInt(aWeek.getTime() / 1000), false, false)
    ).to.be.revertedWith("time passed");
  });

  it("It should revert due to too far away", async function () {
    const aWeek = new Date();
    aWeek.setDate(aWeek.getDate() + 700000);
    await expect(
      Locker.connect(owner).createLock(TestToken.address, 1000000, parseInt(aWeek.getTime() / 1000), false, false)
    ).to.be.revertedWith("too far away");
  });

  it("It should revert due to too far away", async function () {
    const aWeek = new Date();
    aWeek.setDate(aWeek.getDate() + 700000);
    await expect(
      Locker.connect(owner).createLock(TestToken.address, 1000000, parseInt(aWeek.getTime() / 1000), false, false)
    ).to.be.revertedWith("too far away");
  });

  it("It should create lock with holding contract", async function () {
    const aWeek = new Date();
    aWeek.setDate(aWeek.getDate() + 7);
    expect(await Locker.connect(owner).createLock(TestToken.address, 1000000, parseInt(aWeek.getTime() / 1000), true, true))
      .to.emit(Locker, "LockCreated")
      .withArgs(2, TestToken.address, owner.address, 1000000);

    expect(await TestToken.balanceOf(owner.address)).to.be.equals(98000000 - 1000000);

    //getting the holding contract and checking the balance
    lock = await Locker.getLock(2);
    holdingContract = lock.holdingContract;
    expect(await TestToken.balanceOf(holdingContract)).to.be.equals(1000000);
    expect(lock.amount).to.be.equals(1000000);
    expect(lock.unlockableByGovernance).to.be.equals(true);
    expect(lock.unlockedByGovernance).to.be.equals(false);
  });

  it("It reverts at withdrawal due to invalid lock", async function () {
    await expect(Locker.connect(owner).withdraw(3)).be.revertedWith("invalid lock id");
  });

  it("It withdraws and checks the balances accordingly", async function () {
    const aWeek = new Date();
    aWeek.setDate(aWeek.getDate() + 7);
    //at some point if it gives you time has passed then try one more time, sometimes we don't match the exact seconds between block and current date
    expect(
      await Locker.connect(owner).createLock(TestToken.address, 1000000, parseInt(new Date().getTime() / 1000 + 12), true, true)
    )
      .to.emit(Locker, "LockCreated")
      .withArgs(3, TestToken.address, owner.address, 1000000);

    //decreased the initial supply 4 times
    expect(await TestToken.balanceOf(owner.address)).to.be.equals(96000000);

    expect(await Locker.connect(owner).withdraw(3))
      .to.emit(Locker, "Withdraw")
      .withArgs(3, TestToken.address, owner.address, 1000000);

    // it's increasing 1 time due to the fact that we withdrew the ammount
    expect(await TestToken.balanceOf(owner.address)).to.be.equals(97000000);
  });

  it("It checks for already claimed", async function () {
    const aWeek = new Date();
    await expect(Locker.connect(owner).withdraw(3)).to.be.revertedWith("already claimed");
  });
  it("It should revert due to invalid lock", async function () {
    const aWeek = new Date();
    await expect(Locker.connect(owner).withdraw(4)).to.be.revertedWith("invalid lock id");
  });

  it("It should revert due to not the owner of the lock", async function () {
    const aWeek = new Date();
    aWeek.setDate(aWeek.getDate() + 7);
    //at some point if it gives you time has passed then try one more time, sometimes we don't match the exact seconds between block and current date
    expect(
      await Locker.connect(owner).createLock(TestToken.address, 1000000, parseInt(new Date().getTime() / 1000 + 16), true, true)
    )
      .to.emit(Locker, "LockCreated")
      .withArgs(4, TestToken.address, owner.address, 1000000);

    await expect(Locker.connect(walletWithdraw).withdraw(4)).to.be.revertedWith("not owner of lock share token");
  });
});
