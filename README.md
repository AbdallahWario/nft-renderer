
# NFT Renderer App

## Overview
This is a generic web-based NFT renderer that utilizes XSLT/XML+SVG for the transformation of NFT metadata into a visual representation. The app fetches metadata from the blockchain, processes it, and retrieves additional content from the Wala service using a SHA256 hash.

### Key Features
- XSLT/XML-based rendering pipeline.
- Fetches metadata using ethers.js via a blockchain connector.
- Retrieves additional metadata from Wala, an HTTP service based on SHA256 digest paths.
- Designed for modularity and supports URL parameters to dynamically load different NFTs.

## Prerequisites
To run this app, ensure you have the following:
- A modern web browser (Chrome, Firefox, etc.).
- Python (for running a simple local server).

## Running the App

### Using Python HTTP Server:
To serve the app locally, follow these steps:

1. Clone the repository and navigate into the project folder.

    ```bash
      git clone https://github.com/yourusername/nft-renderer.git
      cd nft-renderer

    ```
2. Run a Python server using:

    ```bash
    python3 -m http.server 8000
    ```

3. Access the app in your web browser at:

    ```
    http://localhost:8000/?NFTId=<TOKEN_ID>&NFTAddress=<CONTRACT_ADDRESS>
    ```

### Config Parameters in URL:
- `NFTId`: The ID of the NFT to render.
- `NFTAddress`: The contract address of the NFT.

### Example:
```url
http://localhost:8000/?NFTId=123&NFTAddress=0x45929352A7CE71c3E00B827af789126966795fC9
```

## Metadata Retrieval
The app uses the **Wala HTTP service** to retrieve metadata for the NFT. Wala makes uploaded content available at the path of its digest (SHA256 supported).

**More info about Wala**: [Wala documentation](https://defalsify.org/git/wala-rust/index.html)

The app first checks the token URI from the blockchain:
- If the token URI starts with `sha256:`, it fetches the metadata using the SHA256 hash.


## Technologies Used
- **XSLT/XML + SVG**: For rendering the NFT metadata into HTML format.
- **ethers.js**: For fetching token URI from the blockchain.
- **Wala HTTP service**: For retrieving metadata from a SHA256 digest path.



## Files Structure
- `main.js`: Handles initialization, fetching metadata, and rendering the NFT.
- `nft-renderer.xslt`: XSLT file for transforming XML metadata into an HTML view.
- `blockchain-connector.js`: Connects to the blockchain and fetches the token URI.
- `wala-connector.js`: Handles metadata fetching from Wala.
- `renderer.js`: Manages rendering the fetched metadata using XSLT/XML.

