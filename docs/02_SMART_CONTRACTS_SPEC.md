# TrustTag Smart Contracts Specification (ERC-721 + AccessControl)
## Solidity 0.8.20 Implementation with Role-Based Custody & Emergency Recalls

---

### 1. `TrustTagRegistry.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title TrustTagRegistry
 * @dev ERC-721 contract with batch minting, role-based supply chain custody,
 *      hash-based integrity checks, and emergency recall mechanisms.
 */
contract TrustTagRegistry is ERC721URIStorage, AccessControl {
    using ECDSA for bytes32;

    bytes32 public constant BRAND_ROLE = keccak256("BRAND_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    enum TokenStatus { Active, Recalled, Expired, Retired }

    struct ProductMetadata {
        string gtin;             // Global Trade Item Number (GS1 standard)
        bytes32 batchHash;       // SHA-256 hash of normalized batch number
        bytes32 expiryHash;      // SHA-256 hash of expiry date string
        uint256 manufacturedAt;  // Epoch timestamp
        string ipfsReferenceCID; // IPFS hash containing canonical reference photos & embeddings
        TokenStatus status;      // Current lifecycle status
        address currentCustodian; // Current entity holding physical custody
        uint32 scanCount;        // Public aggregate scan counter
    }

    // Mapping from Token ID => Product Metadata
    mapping(uint256 => ProductMetadata) public products;

    // Scan Event Log structure
    struct ScanLog {
        uint256 timestamp;
        bytes32 locationHash; // City / Region coarse hash
        address scannedBy;
    }
    mapping(uint256 => ScanLog[]) private _scanHistories;

    // Events for off-chain indexing
    event ProductMinted(uint256 indexed tokenId, string gtin, bytes32 batchHash, string ipfsCID);
    event CustodyTransferred(uint256 indexed tokenId, address indexed from, address indexed to, string stage);
    event ScanRecorded(uint256 indexed tokenId, uint256 timestamp, bytes32 locationHash);
    event ProductRecalled(uint256 indexed tokenId, string reason);
    event BatchRecalled(bytes32 indexed batchHash, string reason);

    constructor() ERC721("TrustTag Product Ledger", "TRUST") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BRAND_ROLE, msg.sender);
    }

    /**
     * @dev Mint a single verified product token.
     */
    function mintProduct(
        uint256 tokenId,
        string calldata gtin,
        bytes32 batchHash,
        bytes32 expiryHash,
        string calldata ipfsCID,
        string calldata tokenUri
    ) external onlyRole(BRAND_ROLE) {
        require(!_exists(tokenId), "Token already minted");
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenUri);

        products[tokenId] = ProductMetadata({
            gtin: gtin,
            batchHash: batchHash,
            expiryHash: expiryHash,
            manufacturedAt: block.timestamp,
            ipfsReferenceCID: ipfsCID,
            status: TokenStatus.Active,
            currentCustodian: msg.sender,
            scanCount: 0
        });

        emit ProductMinted(tokenId, gtin, batchHash, ipfsCID);
    }

    /**
     * @dev Gas-optimized batch minting for high-volume manufacturing lines.
     */
    function batchMint(
        uint256[] calldata tokenIds,
        string calldata gtin,
        bytes32 batchHash,
        bytes32 expiryHash,
        string calldata ipfsCID
    ) external onlyRole(BRAND_ROLE) {
        uint256 count = tokenIds.length;
        require(count <= 250, "Batch limit 250 units");

        for (uint256 i = 0; i < count; i++) {
            uint256 id = tokenIds[i];
            require(!_exists(id), "Token already exists in batch");
            _safeMint(msg.sender, id);

            products[id] = ProductMetadata({
                gtin: gtin,
                batchHash: batchHash,
                expiryHash: expiryHash,
                manufacturedAt: block.timestamp,
                ipfsReferenceCID: ipfsCID,
                status: TokenStatus.Active,
                currentCustodian: msg.sender,
                scanCount: 0
            });

            emit ProductMinted(id, gtin, batchHash, ipfsCID);
        }
    }

    /**
     * @dev Transfer custody across the supply chain: Factory -> Distributor -> Retailer
     */
    function transferCustody(
        uint256 tokenId,
        address nextCustodian,
        string calldata stage
    ) external {
        require(_exists(tokenId), "Token does not exist");
        ProductMetadata storage product = products[tokenId];
        require(product.status == TokenStatus.Active, "Product not in active status");
        require(
            msg.sender == product.currentCustodian || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized custodian"
        );

        address prevCustodian = product.currentCustodian;
        product.currentCustodian = nextCustodian;

        emit CustodyTransferred(tokenId, prevCustodian, nextCustodian, stage);
    }

    /**
     * @dev Log an anonymous consumer scan on-chain (via gasless relayer).
     */
    function recordScan(uint256 tokenId, bytes32 locationHash) external {
        require(_exists(tokenId), "Token does not exist");
        require(
            hasRole(RELAYER_ROLE, msg.sender) || hasRole(BRAND_ROLE, msg.sender),
            "Only authorized relayer"
        );

        ProductMetadata storage product = products[tokenId];
        product.scanCount += 1;

        _scanHistories[tokenId].push(ScanLog({
            timestamp: block.timestamp,
            locationHash: locationHash,
            scannedBy: msg.sender
        }));

        emit ScanRecorded(tokenId, block.timestamp, locationHash);
    }

    /**
     * @dev Emergency recall of a single item or an entire defective batch.
     */
    function recallProduct(uint256 tokenId, string calldata reason) external onlyRole(BRAND_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        products[tokenId].status = TokenStatus.Recalled;
        emit ProductRecalled(tokenId, reason);
    }

    function recallBatch(bytes32 batchHash, uint256[] calldata tokenIds, string calldata reason) external onlyRole(BRAND_ROLE) {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (products[tokenIds[i]].batchHash == batchHash) {
                products[tokenIds[i]].status = TokenStatus.Recalled;
                emit ProductRecalled(tokenIds[i], reason);
            }
        }
        emit BatchRecalled(batchHash, reason);
    }

    function getScanHistory(uint256 tokenId) external view returns (ScanLog[] memory) {
        return _scanHistories[tokenId];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
```

---

### 2. Hardhat Test Suite (`test/TrustTag.test.ts`)

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("TrustTagRegistry Contract", function () {
  let registry: any;
  let owner: any, distributor: any, retailer: any, relayer: any, attacker: any;

  const TOKEN_ID = 1042;
  const GTIN = "08901234567890";
  const BATCH_HASH = ethers.keccak256(ethers.toUtf8Bytes("BATCH_OCT_2026"));
  const EXPIRY_HASH = ethers.keccak256(ethers.toUtf8Bytes("2028-12"));
  const IPFS_CID = "ipfs://QmXYZShoesCanonicalReferenceEmbedding123456";

  beforeEach(async function () {
    [owner, distributor, retailer, relayer, attacker] = await ethers.getSigners();
    const TrustTagFactory = await ethers.getContractFactory("TrustTagRegistry");
    registry = await TrustTagFactory.deploy();
    await registry.waitForDeployment();

    // Grant roles
    const DISTRIBUTOR_ROLE = await registry.DISTRIBUTOR_ROLE();
    const RETAILER_ROLE = await registry.RETAILER_ROLE();
    const RELAYER_ROLE = await registry.RELAYER_ROLE();

    await registry.grantRole(DISTRIBUTOR_ROLE, distributor.address);
    await registry.grantRole(RETAILER_ROLE, retailer.address);
    await registry.grantRole(RELAYER_ROLE, relayer.address);
  });

  it("Should allow BRAND_ROLE to mint token and store on-chain hashes", async function () {
    await registry.mintProduct(TOKEN_ID, GTIN, BATCH_HASH, EXPIRY_HASH, IPFS_CID, "uri://xyz-shoe-1042");
    const product = await registry.products(TOKEN_ID);
    expect(product.gtin).to.equal(GTIN);
    expect(product.batchHash).to.equal(BATCH_HASH);
    expect(product.status).to.equal(0); // Active
  });

  it("Should reject unauthorized minting attempts by attackers", async function () {
    await expect(
      registry.connect(attacker).mintProduct(9999, GTIN, BATCH_HASH, EXPIRY_HASH, IPFS_CID, "uri://fake")
    ).to.be.reverted;
  });

  it("Should record custody progression: Brand -> Distributor -> Retailer", async function () {
    await registry.mintProduct(TOKEN_ID, GTIN, BATCH_HASH, EXPIRY_HASH, IPFS_CID, "uri://xyz-shoe-1042");
    
    // Custody to Distributor
    await registry.transferCustody(TOKEN_ID, distributor.address, "Factory_Outbound");
    let product = await registry.products(TOKEN_ID);
    expect(product.currentCustodian).to.equal(distributor.address);

    // Custody to Retailer
    await registry.connect(distributor).transferCustody(TOKEN_ID, retailer.address, "Retailer_Inbound");
    product = await registry.products(TOKEN_ID);
    expect(product.currentCustodian).to.equal(retailer.address);
  });

  it("Should execute emergency recall and reflect status", async function () {
    await registry.mintProduct(TOKEN_ID, GTIN, BATCH_HASH, EXPIRY_HASH, IPFS_CID, "uri://xyz-shoe-1042");
    await registry.recallProduct(TOKEN_ID, "Defective sole material");
    const product = await registry.products(TOKEN_ID);
    expect(product.status).to.equal(1); // Recalled
  });
});
```

---

### 3. Gasless Scanning Architecture Trade-Offs

#### Option A: Polygon ERC-2771 / ERC-4337 Relayer (Implemented)
- **Mechanism**: The mobile client creates an unsigned or ephemeral-signed scan packet. The backend relayer signs an on-chain transaction calling `recordScan()` and pays Mumbai/Amoy MATIC gas.
- **Advantage**: Zero wallet interaction or crypto literacy needed for consumers. 100% familiar mobile web experience.
- **Cost**: ~$0.0002 per scan on Polygon PoS.

#### Option B: VeChain VIP-191 Fee Delegation (Enterprise Alternative)
- **Mechanism**: VeChain native dual-signature protocol where User signs intent and Sponsor Account signs gas fee at consensus level.
- **Advantage**: Native protocol support without intermediate smart contract relayer.
