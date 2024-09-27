const {expect} = require('chai')
const {ethers} = require('hardhat')

describe('ArtGallery-Flow', function () {
    let Foo, foo, owner

    /*
    const getBalance = async (address) => {
        return ethers.utils.formatUnits(
            await ethers.provider.getBalance(address)
        )
    }
    */
    const getBalance = async (address) =>
        await ethers.provider.getBalance(address)

    const getBalanceFormat = async (address) =>
        ethers.utils.formatUnits(await getBalance(address))

    const getBalanceConsole = async (title, address) => {
        console.info(`* Balance->${title}`, await getBalanceFormat(address))
    }

    const showBalances = async (title, filter) => {
        const [
            web_owner,
            contract_owner,
            acc_art_1,
            acc_art_2,
            acc_gall_1,
            acc_gall_2,
            buyer_1,
            buyer_2,
            buyer_3,
        ] = await ethers.getSigners()

        if (title) {
            console.warn(title)
        }
        await getBalanceConsole('web_owner', web_owner.address)
        await getBalanceConsole('contract_owner', contract_owner.address)
        await getBalanceConsole('acc_art_1', acc_art_1.address)
        // await getBalanceConsole('acc_art_2', acc_art_2.address)
        await getBalanceConsole('acc_gall_1', acc_gall_1.address)
        // await getBalanceConsole('acc_gall_2', acc_gall_2.address)
        await getBalanceConsole('buyer_1', buyer_1.address)
        await getBalanceConsole('buyer_2', buyer_2.address)
        await getBalanceConsole('buyer_23', buyer_3.address)
    }

    before(async function () {
        console.error('--- before-function >>')
        const [
            web_owner,
            contract_owner,
            acc_art_1,
            acc_art_2,
            acc_gall_1,
            acc_gall_2,
            buyer_1,
            buyer_2,
        ] = await ethers.getSigners()
        owner = contract_owner

        /*
        const signer = new ethers.providers.Web3Provider(
            web3Provider
        ).getSigner()
        */

        // const signer_add = await signer.getAddress()
        // console.log('signer_add: ' + signer_add)
        // console.log('owner: ' + owner.address)
        // console.log('acc_art_1: ' + acc_art_1.address)
        // console.log('acc_gall_1: ' + acc_gall_1.address)

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
            web_owner
        )

        await showBalances('balances before')
        // console.warn('balances before')
        // await getBalanceConsole('web_owner', web_owner.address)
        // await getBalanceConsole('contract_owner', contract_owner.address)

        //--- deploying ---/
        // starting and assigning owner
        foo = await Foo.deploy(owner.address)
        await foo.deployed()

        console.log('foo -> contract Address: ' + foo.address)
        console.log('foo -> contract owner: ' + (await foo.owner()))

        await showBalances('balances after')
        console.error('--- before-function <<')
        console.log(' ')
        console.log(' ')
    })

    /*
    it('Basic test', async function () {
        console.error('--- Basic test >>')
        const [
            web_owner,
            contract_owner,
            acc_art_1,
            acc_art_2,
            acc_gall_1,
            acc_gall_2,
            buyer_1,
            buyer_2,
        ] = await ethers.getSigners()

        expect(web_owner.address).to.not.equal(await foo.owner())
        expect(contract_owner.address).to.equal(await foo.owner())

        console.warn('balances after')
        await getBalanceConsole('web_owner', web_owner.address)
        await getBalanceConsole('contract_owner', contract_owner.address)

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

    const tx_mint_1 = 'minting NFT 1 '
    it(tx_mint_1, async function () {
        console.error(`--- ${tx_mint_1} >>`)
        const [
            web_owner,
            contract_owner,
            acc_art_1,
            acc_art_2,
            acc_gall_1,
            acc_gall_2,
            buyer_1,
            buyer_2,
        ] = await ethers.getSigners()

        //--- minting ---/
        // connect with a specific wallet
        await showBalances('balances before')
        const fooTx = foo.connect(owner)
        const mintTx = await fooTx.mintArtwork(
            acc_art_1.address,
            4,
            acc_gall_1.address,
            1,
            'https://bronze-magnificent-crocodile-218.mypinata.cloud/ipfs/QmcvS3atcfaCrPSNVa8RvrpnVGV4teKQHE4YoTmUVf3DgS',
            'TTJK1'
        )
        await mintTx.wait()

        let tokenId = await fooTx.curToken()

        console.log('tokenId> ->', ethers.utils.formatUnits(tokenId), 0)

        //expect(tokenId).to.equal(1)
        console.log('getTokenName(1): ', await fooTx.getTokenName(tokenId))
        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))
        console.log('foo.tokenOwner> ->', await fooTx.ownerOf(tokenId))

        await showBalances('balances after')
        console.error(`--- ${tx_mint_1} <<`)
        console.log(' ')
        console.log(' ')
    })

    ///*
    const tx_sell_1 = 'sell-1 NFT'
    it(tx_sell_1, async function () {
        console.error(`--- ${tx_sell_1} >>`)

        const [
            web_owner,
            contract_owner,
            acc_art_1,
            acc_art_2,
            acc_gall_1,
            acc_gall_2,
            buyer_1,
            buyer_2,
        ] = await ethers.getSigners()

        await showBalances('balances before sale')
        let tokenId = 1
        console.log('tokenId> ->', tokenId)
        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))

        const fooTx = foo.connect(buyer_1)
        const sellTx = await fooTx.buyArtwork(tokenId, {
            value: ethers.utils.parseEther('1'), // Sending ETH
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
    it(tx_sell_2, async function () {
        console.error(`--- ${tx_sell_2} >>`)

        const [
            web_owner,
            contract_owner,
            acc_art_1,
            acc_art_2,
            acc_gall_1,
            acc_gall_2,
            buyer_1,
            buyer_2,
        ] = await ethers.getSigners()

        await showBalances('balances before sale')
        let tokenId = 1
        console.log('tokenId> ->', tokenId)
        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))

        const fooTx = foo.connect(buyer_2)
        const sellTx = await fooTx.buyArtwork(tokenId, {
            value: ethers.utils.parseEther('2'), // Sending ETH
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

        const [
            web_owner,
            contract_owner,
            acc_art_1,
            acc_art_2,
            acc_gall_1,
            acc_gall_2,
            buyer_1,
            buyer_2,
            buyer_3,
        ] = await ethers.getSigners()

        await showBalances('balances before sale')
        let tokenId = 1
        console.log('tokenId> ->', tokenId)
        console.log('foo.tokenOwner> ->', await foo.ownerOf(tokenId))

        const fooTx = foo.connect(buyer_3)
        const sellTx = await fooTx.buyArtwork(tokenId, {
            value: ethers.utils.parseEther('3.5'), // Sending ETH
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
})
