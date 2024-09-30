const {expect} = require('chai')
const {ethers} = require('hardhat')

describe('ArtGallery-Flow', function () {
    let Foo, foo
    let _tokenOwner
    let w_web_owner // app site owner
    let w_deploy_owner // app contract owner
    let w_art_1 // artist owner 1
    let w_art_2 // artist owner 2
    let w_gall_1 // gallery owner 1
    let w_gall_2 // gallery owner 2
    let w_buyer_1 // buyer 1
    let w_buyer_2 // buyer 2
    let w_buyer_3 // buyer 3
    ///----

    const assignWallets = async () => {
        const [
            w_0,
            w_1,
            w_2,
            w_3,
            w_4,
            w_5,
            w_6,
            w_7,
            w_8,
            w_9,
            w_10,
            w_11,
            w_12,
        ] = await ethers.getSigners()

        w_web_owner = w_11
        w_deploy_owner = w_12
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
        console.info(`${title}-> ${await getBalanceFormat(address)}`)
    }

    const showBalances = async (title) => {
        if (title) {
            console.warn(`wallets balance ${title}`)
        }
        //await getBalanceConsole('w_deploy_owner', w_deploy_owner.address)
        await getBalanceConsole('w_web_owner', w_web_owner.address)
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
            w_deploy_owner
        )

        // await showBalances('fn-before')
        // starting and assigning owner
        foo = await Foo.deploy(w_web_owner.address)
        await foo.deployed()
        // await showBalances('fn-after')

        console.error('--- before-method <<')
        console.log(' ')
    })

    it('zero test', async function () {
        console.log('foo -> contract Address: ' + foo.address)
        console.log('foo -> contract owner: ' + (await foo.owner()))

        expect(w_web_owner.address).to.equal(await foo.owner())
        expect(w_deploy_owner.address).to.not.equal(await foo.owner())
    })

    const tx_mint_1 = 'minting NFT-1 '
    it(tx_mint_1, async function () {
        console.error(`starting ${tx_mint_1} >>`)

        // connect with w_web_owner wallet
        const fooTx = foo.connect(w_web_owner)
        // await showBalances(`before ${tx_mint_1}`)

        // run mint ArtWork
        const mintTx = await fooTx.mintArtwork(
            w_art_1.address,
            3,
            w_gall_1.address,
            1,
            'https://bronze-magnificent-crocodile-218.mypinata.cloud/ipfs/QmcvS3atcfaCrPSNVa8RvrpnVGV4teKQHE4YoTmUVf3DgS',
            'TTJK1'
        )
        const receipt = await mintTx.wait()

        const _tokenId = receipt.events[0].args.tokenId // Assuming it's the first event
        const _tokenIdStr = ethers.utils.formatUnits(_tokenId, 0)
        const _tokenName = await fooTx.getTokenName(_tokenId)
        _tokenOwner = await foo.ownerOf(_tokenId)

        expect(_tokenId).to.equal(_tokenIdStr)
        console.log(`TokenId -> ${_tokenIdStr}`)
        console.log(`TokenName -> ${_tokenName}`)
        console.log(`TokenOwner -> ${_tokenOwner}`)

        await showBalances(`after ${tx_mint_1}`)
        console.error(`exiting ${tx_mint_1} >>`)
        console.log(' ')
    })

    const tx_sell_1_1 = 'NFT-1 sell-1 ...'
    it(tx_sell_1_1, async function () {
        console.error(`starting ${tx_sell_1_1} >>`)

        // await showBalances(`before ${tx_sell_1_1}`)
        let _tokenId = 1
        _tokenOwner = await foo.ownerOf(_tokenId)
        console.log(`TokenOwner (before) -> ${_tokenOwner}`)

        // connect with w_buyer_1 wallet
        const fooTx = foo.connect(w_buyer_1)

        // run sell 1
        const sellTx = await fooTx.buyArtwork(_tokenId, {
            value: ethers.utils.parseEther('1'),
        })
        await sellTx.wait()
        console.log('Sell done!')

        _tokenOwner = await foo.ownerOf(_tokenId)
        console.log(`TokenOwner (after) -> ${_tokenOwner}`)

        await showBalances(`after ${tx_sell_1_1}`)

        console.error(`exiting ${tx_sell_1_1} >>`)
        console.log(' ')
    })

    ///*
    const tx_sell_1_2 = 'NFT-1 sell-2 ...'
    it(tx_sell_1_2, async function () {
        console.error(`starting ${tx_sell_1_2} >>`)

        // await showBalances(`before ${tx_sell_1_2}`)
        let _tokenId = 1
        _tokenOwner = await foo.ownerOf(_tokenId)
        console.log(`TokenOwner (before) -> ${_tokenOwner}`)

        // connect with w_buyer_2 wallet
        const fooTx = foo.connect(w_buyer_2)

        // run sell 2
        const sellTx = await fooTx.buyArtwork(_tokenId, {
            value: ethers.utils.parseEther('1.15'),
        })
        await sellTx.wait()
        console.log('Sell done!')

        _tokenOwner = await foo.ownerOf(_tokenId)
        console.log(`TokenOwner (after) -> ${_tokenOwner}`)

        await showBalances(`after ${tx_sell_1_2}`)

        console.error(`exiting ${tx_sell_1_2} >>`)
        console.log(' ')
    })
    //*/

    ///*
    const tx_sell_1_3 = 'NFT-1 sell-3 ...'
    it(tx_sell_1_3, async function () {
        console.error(`starting ${tx_sell_1_3} >>`)

        // await showBalances(`before ${tx_sell_1_3}`)
        let _tokenId = 1
        _tokenOwner = await foo.ownerOf(_tokenId)
        console.log(`TokenOwner (before) -> ${_tokenOwner}`)

        // connect with w_buyer_3 wallet
        const fooTx = foo.connect(w_buyer_3)

        // run sell 3
        const sellTx = await fooTx.buyArtwork(_tokenId, {
            value: ethers.utils.parseEther('3.85'),
        })
        await sellTx.wait()
        console.log('Sell done!')

        _tokenOwner = await foo.ownerOf(_tokenId)
        console.log(`TokenOwner (after) -> ${_tokenOwner}`)

        await showBalances(`after ${tx_sell_1_3}`)

        console.error(`exiting ${tx_sell_1_3} >>`)
        console.log(' ')
    })
    //*/

    ///*
    const tx_sell_1_4 = 'NFT-1 sell-4 ...'
    it(tx_sell_1_4, async function () {
        console.error(`starting ${tx_sell_1_4} >>`)

        // await showBalances(`before ${tx_sell_1_4}`)
        let _tokenId = 1
        _tokenOwner = await foo.ownerOf(_tokenId)
        console.log(`TokenOwner (before) -> ${_tokenOwner}`)

        // connect with w_art_1 wallet
        const fooTx = foo.connect(w_art_1)

        // run sell 4
        const sellTx = await fooTx.buyArtwork(_tokenId, {
            value: ethers.utils.parseEther('4'),
        })
        await sellTx.wait()
        console.log('Sell done!')

        _tokenOwner = await foo.ownerOf(_tokenId)
        console.log(`TokenOwner (after) -> ${_tokenOwner}`)

        await showBalances(`after ${tx_sell_1_4}`)

        console.error(`exiting ${tx_sell_1_4} >>`)
        console.log(' ')
    })
    //*/

    /// ---------------------------------- ///

    const tx_mint_2 = 'minting NFT-2 '
    it(tx_mint_2, async function () {
        console.error(`starting ${tx_mint_2} >>`)

        // connect with w_web_owner wallet
        const fooTx = foo.connect(w_web_owner)
        // await showBalances(`before ${tx_mint_2}`)

        // run mint ArtWork
        const mintTx = await fooTx.mintArtwork(
            w_art_1.address,
            7,
            w_gall_1.address,
            3,
            'https://bronze-magnificent-crocodile-218.mypinata.cloud/ipfs/QmcvS3atcfaCrPSNVa8RvrpnVGV4teKQHE4YoTmUVf3DgS',
            'TTJK2'
        )
        const receipt = await mintTx.wait()

        const _tokenId = receipt.events[0].args.tokenId // Assuming it's the first event
        const _tokenIdStr = ethers.utils.formatUnits(_tokenId, 0)
        const _tokenName = await fooTx.getTokenName(_tokenId)
        _tokenOwner = await foo.ownerOf(_tokenId)

        expect(_tokenId).to.equal(_tokenIdStr)
        console.log(`TokenId -> ${_tokenIdStr}`)
        console.log(`TokenName -> ${_tokenName}`)
        console.log(`TokenOwner -> ${_tokenOwner}`)

        await showBalances(`after ${tx_mint_2}`)
        console.error(`exiting ${tx_mint_2} >>`)
        console.log(' ')
    })

    const tx_sell_2_1 = 'NFT-2 sell-1 ...'
    it(tx_sell_2_1, async function () {
        console.error(`starting ${tx_sell_2_1} >>`)

        // await showBalances(`before ${tx_sell_2_1}`)
        let _tokenId = 2
        _tokenOwner = await foo.ownerOf(_tokenId)
        console.log(`TokenOwner (before) -> ${_tokenOwner}`)

        // connect with w_buyer_3 wallet
        const fooTx = foo.connect(w_buyer_3)

        // run sell 1
        const sellTx = await fooTx.buyArtwork(_tokenId, {
            value: ethers.utils.parseEther('2.25'),
        })
        await sellTx.wait()
        console.log('Sell done!')

        _tokenOwner = await foo.ownerOf(_tokenId)
        console.log(`TokenOwner (after) -> ${_tokenOwner}`)

        await showBalances(`after ${tx_sell_2_1}`)

        console.error(`exiting ${tx_sell_2_1} >>`)
        console.log(' ')
    })

    ///*
    const tx_sell_2_2 = 'NFT-2 sell-2 ...'
    it(tx_sell_2_2, async function () {
        console.error(`starting ${tx_sell_2_2} >>`)

        // await showBalances(`before ${tx_sell_2_2}`)
        let _tokenId = 2
        _tokenOwner = await foo.ownerOf(_tokenId)
        console.log(`TokenOwner (before) -> ${_tokenOwner}`)

        // connect with w_buyer_2 wallet
        const fooTx = foo.connect(w_buyer_2)

        // run sell 2
        const sellTx = await fooTx.buyArtwork(_tokenId, {
            value: ethers.utils.parseEther('3.69'),
        })
        await sellTx.wait()
        console.log('Sell done!')

        _tokenOwner = await foo.ownerOf(_tokenId)
        console.log(`TokenOwner (after) -> ${_tokenOwner}`)

        await showBalances(`after ${tx_sell_2_2}`)

        console.error(`exiting ${tx_sell_2_2} >>`)
        console.log(' ')
    })
    //*/

    ///*
    const tx_sell_2_3 = 'NFT-2 sell-3 ...'
    it(tx_sell_2_3, async function () {
        console.error(`starting ${tx_sell_2_3} >>`)

        // await showBalances(`before ${tx_sell_2_3}`)
        let _tokenId = 2
        _tokenOwner = await foo.ownerOf(_tokenId)
        console.log(`TokenOwner (before) -> ${_tokenOwner}`)

        // connect with w_buyer_3 wallet
        const fooTx = foo.connect(w_buyer_3)

        // run sell 3
        const sellTx = await fooTx.buyArtwork(_tokenId, {
            value: ethers.utils.parseEther('3.9'),
        })
        await sellTx.wait()
        console.log('Sell done!')

        _tokenOwner = await foo.ownerOf(_tokenId)
        console.log(`TokenOwner (after) -> ${_tokenOwner}`)

        await showBalances(`after ${tx_sell_2_3}`)

        console.error(`exiting ${tx_sell_2_3} >>`)
        console.log(' ')
    })
    //*/

    ///*
    const tx_sell_2_4 = 'NFT-2 sell-4 ...'
    it(tx_sell_2_4, async function () {
        console.error(`starting ${tx_sell_2_4} >>`)

        // await showBalances(`before ${tx_sell_2_4}`)
        let _tokenId = 2
        _tokenOwner = await foo.ownerOf(_tokenId)
        console.log(`TokenOwner (before) -> ${_tokenOwner}`)

        // connect with w_buyer_1 wallet
        const fooTx = foo.connect(w_buyer_1)

        // run sell 4
        const sellTx = await fooTx.buyArtwork(_tokenId, {
            value: ethers.utils.parseEther('5.94'),
        })
        await sellTx.wait()
        console.log('Sell done!')

        _tokenOwner = await foo.ownerOf(_tokenId)
        console.log(`TokenOwner (after) -> ${_tokenOwner}`)

        await showBalances(`after ${tx_sell_2_4}`)

        console.error(`exiting ${tx_sell_2_4} >>`)
        console.log(' ')
    })
    //*/
})
