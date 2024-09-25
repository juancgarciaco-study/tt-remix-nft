// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

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
        uint256 commissionPercentage;
    }

    mapping(uint256 => Artist) public artists;
    mapping(uint256 => Gallery) public galleries;

    uint256 public projectCommissionPercentage = 5; // Project creators' commission

    constructor(address initialOwner) 
    ERC721("ArtGallery", "ART")
    Ownable(initialOwner)
    {
        console.log("ArtGallery.ctor -> initialOwner", initialOwner);
    }

    function mintArtwork(
        address artistWallet,
        uint256 royaltyPercentage,
        address galleryWallet,
        uint256 commissionPercentage,
        string memory tokenURI,
        string memory tokenName
    ) public 
    onlyOwner 
    returns (uint256) {
        console.log("ArtGallery.mintArtwork -> msg.sender", msg.sender);
        require(
            royaltyPercentage +
                commissionPercentage +
                projectCommissionPercentage <=
                100,
            "Total percentage exceeds 100"
        );

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        artists[newItemId] = Artist(
            payable(artistWallet),
            royaltyPercentage,
            tokenName
        );
        galleries[newItemId] = Gallery(
            payable(galleryWallet),
            commissionPercentage
        );

        return newItemId;
    }

    function buyArtwork(uint256 tokenId) public payable {
        console.log("ArtGallery.buyArtwork -> msg.sender", msg.sender);
        console.log("ArtGallery.buyArtwork -> msg.value", msg.value);
        require(_exists(tokenId), "Artwork does not exist");
        require(msg.value > 0, "Payment must be greater than 0");

        uint256 salePrice = msg.value;
        Artist memory artist = artists[tokenId];
        Gallery memory gallery = galleries[tokenId];

        uint256 artistEarnings = (salePrice * artist.royaltyPercentage) / 100;
        uint256 galleryEarnings = (salePrice * gallery.commissionPercentage) /
            100;
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

    function getTokenName(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return artists[tokenId].tokenName;
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
