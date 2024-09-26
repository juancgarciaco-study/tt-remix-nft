const {expect} = require('chai')
const {ethers} = require('hardhat')

describe('ArtGallery-Flow', function () {
    let Foo, foo, owner

    before(async function () {
        console.log('--- before ----------------------------------------')
        const [
            contr_owner,
            proj_owner,
            acc_art_1,
            acc_art_2,
            acc_gall_1,
            acc_gall_2,
            buyer_1,
            buyer_2,
        ] = await ethers.getSigners()
        owner = proj_owner

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
            contr_owner
        )

        //*** deploying ***/
        // starting and assigning owner
        console.log('Foo.deploy -> owner.address: ' + owner.address)
        foo = await Foo.deploy(owner.address)
        await foo.deployed()

        console.log('foo contract Address: ' + foo.address)
        console.log('foo contract owner: ' + (await foo.owner()))
        console.log('--- before ----------------------------------------')
    })

    it('minting NFT', async function () {
        console.log('--- minting NFT ----------------------------------------')
        const [
            contr_owner,
            proj_owner,
            acc_art_1,
            acc_art_2,
            acc_gall_1,
            acc_gall_2,
            buyer_1,
            buyer_2,
        ] = await ethers.getSigners()

        //*** minting ***/
        // connect with a specific wallet
        const fooTx = foo.connect(owner)
        const mintTx = await fooTx.mintArtwork(
            acc_art_1.address,
            10,
            acc_gall_1.address,
            5,
            'https://bronze-magnificent-crocodile-218.mypinata.cloud/ipfs/QmcvS3atcfaCrPSNVa8RvrpnVGV4teKQHE4YoTmUVf3DgS',
            'TTJK1'
        )
        await mintTx.wait()

        let tokenId = await fooTx.curToken()

        console.log('tokenId> ->', ethers.utils.formatUnits(tokenId), 0)

        //expect(tokenId).to.equal(1)
        console.log('getTokenName(1): ', await fooTx.getTokenName(tokenId))

        console.log('--- minting NFT ----------------------------------------')
    })

    it('selling NFT', async function () {
        console.log('--- selling NFT ----------------------------------------')
        //*** buying-1 ***/
        const [
            contr_owner,
            proj_owner,
            acc_art_1,
            acc_art_2,
            acc_gall_1,
            acc_gall_2,
            buyer_1,
            buyer_2,
        ] = await ethers.getSigners()

        let tokenId = 0
        console.log('tokenId> ->', tokenId)
        tokenId = await foo.curToken()
        console.log('tokenId> ->', tokenId)
        const fooTx = foo.connect(owner)
        const sellTx = await fooTx.buyArtwork(tokenId, {
            value: ethers.utils.parseEther('1'), // Sending ETH
        })
        await sellTx.wait()

        console.log('--- selling NFT ----------------------------------------')
    })
})
