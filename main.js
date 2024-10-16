import { fetchTokenURI} from './blockchain-connector.js'
import { fetchMetadataFromWala } from './wala-connector.js'
import { renderNFT } from './renderer.js'
// Config variables
let NFTId = '';
let NFTAddress = '0x45929352A7CE71c3E00B827af789126966795fC9';
const RPCURL = 'https://celo-mainnet.infura.io/v3/fc943bf6283f48688421c272f476e534'; 

// Function to get URL parameters
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    NFTId = urlParams.get('NFTId') || NFTId;
    NFTAddress = urlParams.get('NFTAddress') || NFTAddress;
}

async function checkXSLTFile() {
    try {
        const response = await fetch('nft-renderer.xslt');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const content = await response.text();
        console.log('XSLT file content:', content);
    } catch (error) {
        console.error('Error fetching XSLT file:', error);
    }
}

async function initRenderer() {
    await checkXSLTFile()
    getUrlParams();
    try {
        if (!NFTId || !NFTAddress) {
            throw new Error('NFTId and NFTAddress are required');
        }

        console.log('Fetching contract info for NFT:', NFTId, 'at address:', NFTAddress);
        const contractInfo = await fetchTokenURI(NFTAddress, NFTId, RPCURL);
        console.log('Contract Info:', contractInfo);

        let metadata;
        if (contractInfo.tokenURI.startsWith('sha256:')) {
            const sha256Hash = contractInfo.tokenURI.split(':')[1];
            console.log('Fetching metadata from Wala using sha256:', sha256Hash);
            metadata = await fetchMetadataFromWala(sha256Hash);
        } else {
            console.log('Fetching metadata from Wala using NFTId:', NFTId);
            metadata = await fetchMetadataFromWala(NFTId);
        }
        console.log('Metadata:', metadata);

        const combinedMetadata = {
            ...contractInfo,
            ...metadata
        };
        console.log('Combined Metadata:', combinedMetadata);

        await renderNFT(combinedMetadata);
    } catch (error) {
        console.error('Error in initRenderer:', error);
        const container = document.getElementById('nft-container');
        if (container) {
            container.innerHTML = `<p>Error initializing renderer: ${error.message}</p>`;
        } else {
            console.error("Container 'nft-container' not found for error display");
        }
    }
}

// Initializes the renderer when the page loads
window.addEventListener('load', initRenderer);