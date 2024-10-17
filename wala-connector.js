export async function fetchMetadataFromWala(identifier) {
    if (!identifier) {
        throw new Error('tokenURI is required');
    }

    const baseUrl = 'wala url goes here';
    const url = `${baseUrl}/${identifier}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch metadata from Wala: ${response.status} - ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching metadata:', error);
        throw new Error('Failed to fetch metadata from Wala');
    }
}