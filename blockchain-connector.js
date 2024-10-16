const { ethers } = require('ethers');
// ERC721 ABI
const ERC721_ABI = [
    "function tokenURI(uint256 tokenId) external view returns (string memory)",
    "function name() view returns (string memory)",
    "function symbol() view returns (string memory)"
];

export async function fetchTokenURI(contractAddress, NFTId, rpcUrl) {
    if (!contractAddress || !NFTId || !rpcUrl) {
        throw new Error('Contract address, NFTId , and RPC URL are required');
    }

    try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);

    
      
        const tokenURI = await contract.tokenURI(NFTId);


        
        const name = await contract.name();
        const symbol = await contract.symbol();
        

        return { tokenURI, name, symbol, NFTId };
    } catch (error) {
        console.error('Error fetching tokenURI:', error);
        throw new Error('Failed to fetch tokenURI from the smart contract: ' + error.message);
    }
}
