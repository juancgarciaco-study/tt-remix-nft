const {expect} = require('chai')
const {ethers} = require('hardhat')

describe('ArtGallery-Flow', function () {
    let Foo, foo
    let w_web_owner // app site owner
    let w_contract_owner // app contract owner
    let w_art_1 // artist owner 1
    let w_art_2 // artist owner 2
    let w_gall_1 // gallery owner 1
    let w_gall_2 // gallery owner 2
    let w_buyer_1 // buyer 1
    let w_buyer_2 // buyer 2
    let w_buyer_3 // buyer 3

    const assignWallets = async () => {
        const [w_0, w_1, w_2, w_3, w_4, w_5, w_6, w_7, w_8, w_9] =
            await ethers.getSigners()

        w_web_owner = w_9
        w_contract_owner = w_1
        w_art_1 = w_2
        w_art_2 = w_3
        w_gall_1 = w_4
        w_gall_2 = w_5
        w_buyer_1 = w_6
        w_buyer_2 = w_7
        w_buyer_3 = w_8
    }

    const getBalance = async (address) =>
        await ethers.provider.getBalance(address)

    const getBalanceFormat = async (address) =>
        ethers.utils.formatUnits(await getBalance(address))

    const getBalanceConsole = async (title, address) => {
        console.info(`* Balance->${title}`, await getBalanceFormat(address))
    }

    const showBalances = async (title) => {
        if (title) {
            console.warn(title)
        }
        await getBalanceConsole('w_web_owner', w_web_owner.address)
        await getBalanceConsole('w_contract_owner', w_contract_owner.address)
        await getBalanceConsole('w_art_1', w_art_1.address)
        // await getBalanceConsole('w_art_2', w_art_2.address)
        await getBalanceConsole('w_gall_1', w_gall_1.address)
        // await getBalanceConsole('w_gall_2', w_gall_2.address)
        await getBalanceConsole('w_buyer_1', w_buyer_1.address)
        await getBalanceConsole('w_buyer_2', w_buyer_2.address)
        await getBalanceConsole('w_buyer_3', w_buyer_3.address)
    }

    before(async function () {
        await assignWallets()

        console.error('--- before-method >>')

        // Make sure contract is compiled and artifacts are generated
        const metadata = JSON.parse(
            await remix.call(
                'fileManager',
                'getFile',
                'contracts/artifacts/ArtGallery.json'
            )
        )

        Foo = new ethers.ContractFactory(
            metadata.abi,
            metadata.data.bytecode.object,
            w_web_owner
        )

        // await showBalances('balances before')
        // starting and assigning owner
        foo = await Foo.deploy(w_contract_owner.address)
        let deploy = await foo.deployed()
        await deploy.deployTransaction.wait()
        console.log('deploy> ->', deploy.deployTransaction)
        console.log('tokenId> ->', ethers.utils.formatUnits(deploy.deployTransaction.gasPrice, 18))
        // await showBalances('balances after')

        console.error('--- before-method <<')
        console.log(' ')
        console.log(' ')
    })

    it('zero test', async function () {
        console.log('foo -> contract Address: ' + foo.address)
        console.log('foo -> contract owner: ' + (await foo.owner()))

        expect(w_web_owner.address).to.not.equal(await foo.owner())
        expect(w_contract_owner.address).to.equal(await foo.owner())
    })

    return;
    const tx_mint_1 = 'minting NFT 1 '
    it(tx_mint_1, async function () {
        console.error(`--- ${tx_mint_1} >>`)

        //--- minting ---/
        // await showBalances('balances before')

        // connect with w_contract_owner wallet
        const fooTx = foo.connect(w_contract_owner)

        // run mint ArtWork
        const mintTx = await fooTx.mintArtwork(
            w_art_1.address,
            4,
            w_gall_1.address,
            1,
            'https://bronze-magnificent-crocodile-218.mypinata.cloud/ipfs/QmcvS3atcfaCrPSNVa8RvrpnVGV4teKQHE4YoTmUVf3DgS',
            'TTJK1'
        )
        await mintTx.wait()

        console.log('mintTx> ->', mintTx)
        console.log('tokenId> ->', ethers.utils.formatUnits(mintTx.gasPrice, mintTx.nonce))

        let tokenId = await fooTx.curToken()

        expect(tokenId).to.equal(ethers.utils.formatUnits(tokenId, 0))
        console.log('tokenId> ->', ethers.utils.formatUnits(tokenId, 0))
        console.log('foo.getTokenName(1): ', await fooTx.getTokenName(tokenId))
        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))
        console.log('fooTx.tokenOwner> ->', await fooTx.ownerOf(tokenId))

        await showBalances('balances after')
        console.error(`--- ${tx_mint_1} <<`)
        console.log(' ')
        console.log(' ')
    })

})
