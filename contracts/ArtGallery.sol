// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/*
A brief explanation of the Solidity code:

This is a smart contract for an art gallery, allowing artists to mint and sell their artwork. The contract uses OpenZeppelin's ERC721 and Ownable contracts for token management and access control.

The contract has two structs: `Artist` and `Gallery`, which represent the artist and gallery wallets, royalty percentage, and token name.

The contract has three main functions:

1. `mintArtwork`: allows the owner to mint a new artwork, setting the artist, gallery, and token name.
2. `buyArtwork`: allows anyone to buy an artwork, transferring the ownership and paying the artist, gallery, and project creators their respective royalties.
*/

contract ArtGallery is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Artist {
        address payable wallet;
        uint256 royaltyPercentage;
        string tokenName;
    }

    struct Gallery {
        address payable wallet;
        uint256 royaltyPercentage;
    }

    mapping(uint256 => Artist) public artists;
    mapping(uint256 => Gallery) public galleries;

    uint256 public projectCommissionPercentage = 2; // Project creators' commission
    uint256 public curToken = 0; // Project creators' commission

    constructor(address initialOwner)
        ERC721("ArtGallery", "ART")
        Ownable(initialOwner)
    {
        // console.log("ArtGallery.ctor -> initialOwner", initialOwner);
    }

    /*
     * @notice Mint a new artwork.
     * @param artistWallet The wallet of the artist.
     * @param artistRoyaltyPercentage The royalty percentage of the artist.
     * @param galleryWallet The wallet of the gallery.
     * @param galleyRoyaltyPercentage The royalty percentage of the gallery.
     * @param tokenURI The URI of the artwork.
     * @param tokenName The name of the artwork.
     * @return The ID of the minted artwork.
     */
    function mintArtwork(
        address artistWallet,
        uint256 artistRoyaltyPercentage,
        address galleryWallet,
        uint256 galleyRoyaltyPercentage,
        string memory tokenURI,
        string memory tokenName
    ) public onlyOwner returns (uint256) {
        // console.log("ArtGallery.mintArtwork -> msg.sender", msg.sender);
        require(
            artistRoyaltyPercentage + galleyRoyaltyPercentage + projectCommissionPercentage <=
                50,
            "Total percentage exceeds 50 percent"
        );

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        artists[newItemId] = Artist(
            payable(artistWallet),
            artistRoyaltyPercentage,
            tokenName
        );
        galleries[newItemId] = Gallery(payable(galleryWallet), galleyRoyaltyPercentage);

        _transfer(ownerOf(newItemId), artistWallet, newItemId);

        return curToken = newItemId;
    }

    /*
     * @notice Buy an artwork.
     * @param tokenId The ID of the artwork to buy.
     */
    function buyArtwork(uint256 tokenId) public payable {
        require(_exists(tokenId), "Artwork does not exist");
        require(msg.value > 0, "Payment must be greater than 0");

        uint256 salePrice = msg.value;
        Artist memory artist = artists[tokenId];
        Gallery memory gallery = galleries[tokenId];

        uint256 artistEarnings = (salePrice * artist.royaltyPercentage) / 100;
        uint256 galleryEarnings = (salePrice * gallery.royaltyPercentage) / 100;
        uint256 projectEarnings = (salePrice * projectCommissionPercentage) /
            100;
        uint256 sellerEarnings = salePrice -
            artistEarnings -
            galleryEarnings -
            projectEarnings;

        artist.wallet.transfer(artistEarnings);
        gallery.wallet.transfer(galleryEarnings);
        payable(owner()).transfer(projectEarnings);
        payable(ownerOf(tokenId)).transfer(sellerEarnings);

        _transfer(ownerOf(tokenId), msg.sender, tokenId);
    }

    /*
     * @notice Get the token name of an artwork.
     * @param tokenId The ID of the artwork.
     * @return The token name of the artwork.
     */
    function getTokenName(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return artists[tokenId].tokenName;
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
