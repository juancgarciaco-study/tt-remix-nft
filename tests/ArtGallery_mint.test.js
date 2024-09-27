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
        await foo.deployed()
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

    /*
    it('Basic test', async function () {
        console.error('--- Basic test >>')

        expect(w_web_owner.address).to.not.equal(await foo.owner())
        expect(w_contract_owner.address).to.equal(await foo.owner())

        console.warn('balances after')
        await getBalanceConsole('w_web_owner', w_web_owner.address)
        await getBalanceConsole('w_contract_owner', w_contract_owner.address)

        // console.log(ethers.utils.parseUnits('100'))
        // console.log(await getBalance(foo.owner()))
        // console.log(ethers.BigNumber.from('100'))
        // console.log(ethers.utils.formatUnits(ethers.BigNumber.from('100')))
        // console.log(ethers.utils.formatUnits(100))
        // console.log(ethers.utils.formatUnits(await getBalance(foo.owner())))

        expect(ethers.utils.parseUnits('100')).to.equal(await getBalance(foo.owner()))
        expect('100.0').to.equal(await getBalanceFormat(foo.owner()))

        console.error('--- Basic test <<')
        console.log(' ')
        console.log(' ')
    })
    */

    ///*
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
    //*/

    ///*
    const tx_sell_1 = 'sell-1 NFT'
    it(tx_sell_1, async function () {
        console.error(`--- ${tx_sell_1} >>`)

        // await showBalances('balances before sale')
        let tokenId = 1
        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))

        // connect with w_buyer_1 wallet
        const fooTx = foo.connect(w_buyer_1)

        // run sell 1
        const sellTx = await fooTx.buyArtwork(tokenId, {
            value: ethers.utils.parseEther('0.66'),
        })
        await sellTx.wait()

        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))
        console.log('fooTx.tokenOwner> ->', await fooTx.ownerOf(tokenId))

        await showBalances('balances after sale')

        console.error(`--- ${tx_sell_1} <<`)
        console.log(' ')
        console.log(' ')
    })
    //*/

    ///*
    const tx_sell_2 = 'sell-2 NFT'
    it(tx_sell_1, async function () {
        console.error(`--- ${tx_sell_2} >>`)

        // await showBalances('balances before sale')
        let tokenId = 1
        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))

        // connect with w_buyer_2 wallet
        const fooTx = foo.connect(w_buyer_2)

        // run sell 2
        const sellTx = await fooTx.buyArtwork(tokenId, {
            value: ethers.utils.parseEther('1.98'),
        })
        await sellTx.wait()

        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))
        console.log('fooTx.tokenOwner> ->', await fooTx.ownerOf(tokenId))

        await showBalances('balances after sale')

        console.error(`--- ${tx_sell_2} <<`)
        console.log(' ')
        console.log(' ')
    })
    //*/

    ///*
    const tx_sell_3 = 'sell-3 NFT'
    it(tx_sell_3, async function () {
        console.error(`--- ${tx_sell_3} >>`)

        // await showBalances('balances before sale')
        let tokenId = 1
        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))

        // connect with w_buyer_3 wallet
        const fooTx = foo.connect(w_buyer_3)
        // run sell 3
        const sellTx = await fooTx.buyArtwork(tokenId, {
            value: ethers.utils.parseEther('4.44'),
        })
        await sellTx.wait()

        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))
        console.log('fooTx.tokenOwner> ->', await fooTx.ownerOf(tokenId))

        await showBalances('balances after sale')

        console.error(`--- ${tx_sell_3} <<`)
        console.log(' ')
        console.log(' ')
    })
    //*/

    ///*
    const tx_mint_2 = 'minting NFT 2 '
    it(tx_mint_2, async function () {
        console.error(`--- ${tx_mint_2} >>`)

        //--- minting ---/
        // await showBalances('balances before')

        // connect with w_contract_owner wallet
        const fooTx = foo.connect(w_contract_owner)

        // run mint ArtWork
        const mintTx = await fooTx.mintArtwork(
            w_art_1.address,
            6,
            w_gall_1.address,
            2,
            'https://bronze-magnificent-crocodile-218.mypinata.cloud/ipfs/QmcvS3atcfaCrPSNVa8RvrpnVGV4teKQHE4YoTmUVf3DgS',
            'TTJK2'
        )
        await mintTx.wait()

        let tokenId = await fooTx.curToken()

        expect(tokenId).to.equal(ethers.utils.formatUnits(tokenId, 0))
        console.log('tokenId> ->', ethers.utils.formatUnits(tokenId, 0))
        console.log('foo.getTokenName(1): ', await fooTx.getTokenName(tokenId))
        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))
        console.log('fooTx.tokenOwner> ->', await fooTx.ownerOf(tokenId))

        await showBalances('balances after')
        console.error(`--- ${tx_mint_2} <<`)
        console.log(' ')
        console.log(' ')
    })
    //*/

    ///*
    const tx_sell_4 = 'sell-1 NFT'
    it(tx_sell_4, async function () {
        console.error(`--- ${tx_sell_4} >>`)

        // await showBalances('balances before sale')
        let tokenId = 2
        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))

        // connect with w_buyer_1 wallet
        const fooTx = foo.connect(w_buyer_1)

        // run sell 1
        const sellTx = await fooTx.buyArtwork(tokenId, {
            value: ethers.utils.parseEther('2.43'),
        })
        await sellTx.wait()

        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))
        console.log('fooTx.tokenOwner> ->', await fooTx.ownerOf(tokenId))

        await showBalances('balances after sale')

        console.error(`--- ${tx_sell_4} <<`)
        console.log(' ')
        console.log(' ')
    })
    //*/

    ///*
    const tx_sell_5 = 'sell-2 NFT'
    it(tx_sell_5, async function () {
        console.error(`--- ${tx_sell_5} >>`)

        // await showBalances('balances before sale')
        let tokenId = 2
        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))

        // connect with w_buyer_3 wallet
        const fooTx = foo.connect(w_buyer_3)

        // run sell 2
        const sellTx = await fooTx.buyArtwork(tokenId, {
            value: ethers.utils.parseEther('3.51'),
        })
        await sellTx.wait()

        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))
        console.log('fooTx.tokenOwner> ->', await fooTx.ownerOf(tokenId))

        await showBalances('balances after sale')

        console.error(`--- ${tx_sell_5} <<`)
        console.log(' ')
        console.log(' ')
    })
    //*/

    ///*
    const tx_sell_6 = 'sell-3 NFT'
    it(tx_sell_6, async function () {
        console.error(`--- ${tx_sell_6} >>`)

        // await showBalances('balances before sale')
        let tokenId = 2
        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))

        // connect with w_buyer_2 wallet
        const fooTx = foo.connect(w_buyer_2)

        // run sell 3
        const sellTx = await fooTx.buyArtwork(tokenId, {
            value: ethers.utils.parseEther('2.79'),
        })
        await sellTx.wait()

        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))
        console.log('fooTx.tokenOwner> ->', await fooTx.ownerOf(tokenId))

        await showBalances('balances after sale')

        console.error(`--- ${tx_sell_6} <<`)
        console.log(' ')
        console.log(' ')
    })
    //*/

    ///*
    const tx_sell_7 = 'sell-4 NFT'
    it(tx_sell_7, async function () {
        console.error(`--- ${tx_sell_7} >>`)

        // await showBalances('balances before sale')
        let tokenId = 2
        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))

        // connect with w_buyer_1 wallet
        const fooTx = foo.connect(w_buyer_1)

        // run sell 4
        const sellTx = await fooTx.buyArtwork(tokenId, {
            value: ethers.utils.parseEther('6.66'),
        })
        await sellTx.wait()

        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))
        console.log('fooTx.tokenOwner> ->', await fooTx.ownerOf(tokenId))

        await showBalances('balances after sale')

        console.error(`--- ${tx_sell_7} <<`)
        console.log(' ')
        console.log(' ')
    })
    //*/
})
