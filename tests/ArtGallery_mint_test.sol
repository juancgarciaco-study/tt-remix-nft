// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.4.22 <0.9.0;

// This import is automatically injected by Remix
import "remix_tests.sol";

// This import is required to use custom transaction context
// Although it may fail compilation in 'Solidity Compiler' plugin
// But it will work fine in 'Solidity Unit Testing' plugin
import "remix_accounts.sol";
import "hardhat/console.sol";

import "../contracts/ArtGallery.sol";

// File name has to end with '_test.sol', this file can contain more than one testSuite contracts
contract testSuite {
    ArtGallery foo;
    uint256 Token;

    address acc_owner_0; // app site owner
    address acc_owner_1; // app site owner
    address acc_art_1; // artist owner 1
    address acc_gall_1; // gallery owner 1
    address acc_buy_1; // buyer 1
    address acc_buy_2; // buyer 2
    address acc_buy_3; // buyer 3

    /// 'beforeAll' runs before all other tests
    /// More special functions are: 'beforeEach', 'beforeAll', 'afterEach' & 'afterAll'
    function beforeAll() public {
        acc_owner_0 = TestsAccounts.getAccount(0);
        acc_owner_1 = TestsAccounts.getAccount(1);
        acc_art_1 = TestsAccounts.getAccount(5);
        acc_gall_1 = TestsAccounts.getAccount(6);
        acc_buy_1 = TestsAccounts.getAccount(7);
        acc_buy_2 = TestsAccounts.getAccount(8);
        acc_buy_3 = TestsAccounts.getAccount(9);
        // <instantiate contract>
        foo = new ArtGallery(acc_owner_0);
        console.log("<--------------------------------------->");
        console.log("acc_owner_0", acc_owner_0);
        console.log("msg.sender", msg.sender);
        console.log("acc_art_1", acc_art_1);
        console.log("acc_gall_1", acc_gall_1);

        Assert.equal(uint256(1), uint256(1), "1 should be equal to 1");
    }

    /// Custom Transaction Context
    /// #sender: account-0
    function testMindToken() public {
        console.log("<--------------------------------------->");
        console.log("acc_owner_0", acc_owner_0);
        console.log("msg.sender", msg.sender);
        Assert.equal(msg.sender, TestsAccounts.getAccount(0), "wrong sender in testMindToken");
        try
            foo.mintArtwork(
                acc_art_1,
                1,
                acc_gall_1,
                1,
                "https://bronze-magnificent-crocodile-218.mypinata.cloud/ipfs/QmcvS3atcfaCrPSNVa8RvrpnVGV4teKQHE4YoTmUVf3DgS",
                "TTJK1"
            )
        returns (uint256 v) {
            Token = v;
            console.log("Token created ...");
        } catch Error(string memory reason) {
            console.log("reason", reason);
        }

        console.log("Token", Token);

        Assert.ok(2 == 2, "should be true");
    }

    /*
    /// Custom Transaction Context
    /// See more: https://remix-ide.readthedocs.io/en/latest/unittesting.html#customization
    /// #sender: account-1
    /// #value: 100
    function checkSenderAndValue() public payable {
        // account index varies 0-9, value is in wei
        Assert.equal(msg.sender, TestsAccounts.getAccount(1), "Invalid sender");
        Assert.equal(msg.value, 100, "Invalid value");
    }

    function checkSuccess() public {
        // Use 'Assert' methods: https://remix-ide.readthedocs.io/en/latest/assert_library.html
        Assert.ok(2 == 2, "should be true");
        Assert.greaterThan(
            uint256(2),
            uint256(1),
            "2 should be greater than to 1"
        );
        Assert.lesserThan(
            uint256(2),
            uint256(3),
            "2 should be lesser than to 3"
        );
    }

    function checkSuccess2() public pure returns (bool) {
        // Use the return value (true or false) to test the contract
        return true;
    }

    function checkFailure() public {
        Assert.notEqual(uint256(1), uint256(1), "1 should not be equal to 1");
    }

    /// Custom Transaction Context: https://remix-ide.readthedocs.io/en/latest/unittesting.html#customization
    /// #sender: account-1
    /// #value: 100
    function checkSenderAndValue() public payable {
        // account index varies 0-9, value is in wei
        Assert.equal(msg.sender, TestsAccounts.getAccount(1), "Invalid sender");
        Assert.equal(msg.value, 100, "Invalid value");
    }
    */
}
