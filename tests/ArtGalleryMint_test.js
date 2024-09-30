const {expect} = require('chai')
const {ethers} = require('hardhat')

describe('ArtGallery Contract', function () {
    let artGallery
    let deployer, owner, artist, gallery, buyer

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
        await getBalanceConsole('w_art_1', artist.address)
        await getBalanceConsole('w_gall_1', gallery.address)
        await getBalanceConsole('w_buyer_1', buyer.address)
        await getBalanceConsole('w_owner', owner.address)
        await getBalanceConsole('w_web', deployer.address)
    }

    beforeEach(async function () {
        // Deploy contract before each test
        ;[deployer, owner, artist, gallery, buyer] = await ethers.getSigners()
        // const ArtGallery = await ethers.getContractFactory('ArtGallery', deployer)
        const metadata = JSON.parse(
            await remix.call(
                'fileManager',
                'getFile',
                'contracts/artifacts/ArtGallery.json'
            )
        )
        const ArtGallery = new ethers.ContractFactory(
            metadata.abi,
            metadata.data.bytecode.object,
            deployer
        )
        artGallery = await ArtGallery.deploy(owner.address)
        await artGallery.deployed()
    })

    describe('Minting Artwork', function () {
        it('should successfully mint artwork', async function () {
            const tx = await artGallery
                .connect(owner)
                .mintArtwork(
                    artist.address,
                    10,
                    gallery.address,
                    5,
                    'https://example.com/art.json',
                    'Artwork 1'
                )

            const receipt = await tx.wait()
            const newTokenId = receipt.events[0].args.tokenId // Assuming it's the first event
            console.info(newTokenId)

            expect(await artGallery.ownerOf(newTokenId)).to.equal(
                artist.address
            )
            expect(await artGallery.getTokenName(newTokenId)).to.equal(
                'Artwork 1'
            )
        })

        it('should fail when total royalties exceed 50%', async function () {
            await expect(
                artGallery
                    .connect(owner)
                    .mintArtwork(
                        artist.address,
                        30,
                        gallery.address,
                        25,
                        'https://example.com/art.json',
                        'Artwork 2'
                    )
            ).to.be.revertedWith('Total percentage exceeds 50 percent')
        })
    })

    describe('Buying Artwork', function () {
        beforeEach(async function () {
            // Mint an artwork for testing buy functionality
            await artGallery
                .connect(owner)
                .mintArtwork(
                    artist.address,
                    10,
                    gallery.address,
                    5,
                    'https://example.com/art.json',
                    'Artwork 1'
                )
        })

        it('should successfully buy artwork', async function () {
            const initialArtistBalance = await ethers.provider.getBalance(
                artist.address
            )
            const initialGalleryBalance = await ethers.provider.getBalance(
                gallery.address
            )
            const initialOwnerBalance = await ethers.provider.getBalance(
                owner.address
            )
            //await showBalances()

            const tx = await artGallery
                .connect(buyer)
                .buyArtwork(1, {value: ethers.utils.parseEther('1')})
            await await tx.wait()

            const newArtistBalance = await ethers.provider.getBalance(
                artist.address
            )
            const newGalleryBalance = await ethers.provider.getBalance(
                gallery.address
            )
            const newOwnerBalance = await ethers.provider.getBalance(
                owner.address
            )
            //showBalances()
            let earning = ethers.utils.parseEther(
                (Math.round((1.0 - 0.02 - 0.05) * 100) / 100).toString()
            )
            // console.log(ethers.utils.formatUnits(newArtistBalance))
            // console.log(ethers.utils.formatUnits(earning))
            expect(newArtistBalance).to.equal(initialArtistBalance.add(earning))
            expect(newGalleryBalance).to.equal(
                initialGalleryBalance.add(ethers.utils.parseEther('0.05'))
            )
            expect(newOwnerBalance).to.equal(
                initialOwnerBalance.add(ethers.utils.parseEther('0.02'))
            )
        })
        it('should fail buying artwork that does not exist', async function () {
            await expect(
                artGallery.connect(buyer).buyArtwork(999) // Non-existent token ID
            ).to.be.revertedWith('Artwork does not exist')
        })

        it('should fail buying artwork with zero payment', async function () {
            await expect(
                artGallery.connect(buyer).buyArtwork(1, {value: 0})
            ).to.be.revertedWith('Payment must be greater than 0')
        })
    })
    // return true

    describe('Get Token Name', function () {
        beforeEach(async function () {
            await artGallery
                .connect(owner)
                .mintArtwork(
                    artist.address,
                    10,
                    gallery.address,
                    5,
                    'https://example.com/art.json',
                    'Artwork 1'
                )
        })

        it('should successfully retrieve token name', async function () {
            const tokenName = await artGallery.connect(owner).getTokenName(1)
            expect(tokenName).to.equal('Artwork 1')
        })

        it('should fail retrieving token name for a non-existent token', async function () {
            await expect(
                artGallery.connect(owner).getTokenName(999)
            ).to.be.revertedWith('Token does not exist')
        })
    })

    describe('Event Emissions', function () {
        it('should emit ArtworkMinted event on successful minting', async function () {
            await expect(
                artGallery
                    .connect(owner)
                    .mintArtwork(
                        artist.address,
                        10,
                        gallery.address,
                        5,
                        'https://example.com/art.json',
                        'Artwork 1'
                    )
            )
                .to.emit(artGallery, 'ArtworkMinted')
                .withArgs(1, artist.address, gallery.address)
        })

        it('should emit ArtworkPurchased event on successful purchase', async function () {
            await artGallery
                .connect(owner)
                .mintArtwork(
                    artist.address,
                    10,
                    gallery.address,
                    5,
                    'https://example.com/art.json',
                    'Artwork 1'
                )

            await expect(
                artGallery
                    .connect(buyer)
                    .buyArtwork(1, {value: ethers.utils.parseEther('1')})
            )
                .to.emit(artGallery, 'ArtworkPurchased')
                .withArgs(1, buyer.address)
        })
    })
})
