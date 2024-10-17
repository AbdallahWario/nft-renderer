export async function renderNFT(metadata) {
    const parser = new DOMParser();
    const serializer = new XMLSerializer();

    // Pre-process the metadata to handle SVG in image field
    if (metadata.image) {
        metadata.image = await processSVGImage(metadata.image);
    }

    // Convert JSON metadata to XML
    const xmlDoc = parser.parseFromString('<nft></nft>', 'application/xml');
    const nftElement = xmlDoc.documentElement;

    function createValidElementName(key) {
        if (/^[0-9]/.test(key)) {
            return '_' + key;
        }
        return key.replace(/[^a-zA-Z0-9\-_\.]/g, '_');
    }

    // Function to process SVG image content
    async function processSVGImage(imageContent) {
        if (!imageContent) return imageContent;

        // Handle base64 encoded SVG
        if (imageContent.startsWith('data:image/svg+xml;base64,')) {
            try {
                const base64Content = imageContent.split(',')[1];
                const decodedContent = atob(base64Content);
                if (decodedContent.toLowerCase().includes('<svg')) {
                    return decodedContent;
                }
            } catch (error) {
                console.error('Error decoding base64 SVG:', error);
            }
        }

        // Handle direct SVG content
        if (typeof imageContent === 'string' && imageContent.toLowerCase().includes('<svg')) {
            return imageContent;
        }

        // Handle SVG URL
        if (typeof imageContent === 'string' && imageContent.match(/\.svg$/i)) {
            try {
                const response = await fetch(imageContent);
                if (response.ok) {
                    const svgText = await response.text();
                    if (svgText.toLowerCase().includes('<svg')) {
                        return svgText;
                    }
                }
            } catch (error) {
                console.error('Error fetching SVG from URL:', error);
            }
        }

        return imageContent;
    }

    function addMetadataToElement(obj, parentElement) {
        for (const [key, value] of Object.entries(obj)) {
            const validKey = createValidElementName(key);
            if (typeof value === 'object' && value !== null) {
                const subElement = xmlDoc.createElement(validKey);
                addMetadataToElement(value, subElement);
                parentElement.appendChild(subElement);
            } else {
                const element = xmlDoc.createElement(validKey);
                
                // Special handling for SVG content
                if (typeof value === 'string' && value.toLowerCase().includes('<svg')) {
                    try {
                        const svgDoc = parser.parseFromString(value, 'image/svg+xml');
                        if (!svgDoc.querySelector('parsererror')) {
                            // For image field, add wrapper to control SVG size
                            if (key === 'image') {
                                const wrapper = document.createElement('div');
                                wrapper.style.maxWidth = '100%';
                                wrapper.style.margin = '0 auto';
                                wrapper.appendChild(svgDoc.documentElement.cloneNode(true));
                                element.appendChild(wrapper);
                            } else {
                                element.appendChild(svgDoc.documentElement.cloneNode(true));
                            }
                        } else {
                            element.textContent = value;
                        }
                    } catch (error) {
                        console.error('Error parsing SVG:', error);
                        element.textContent = value;
                    }
                } else {
                    element.textContent = value !== null && value !== undefined ? value.toString() : '';
                }
                parentElement.appendChild(element);
            }
        }
    }

    addMetadataToElement(metadata, nftElement);

    console.log('XML Document:', serializer.serializeToString(xmlDoc));

    try {
        // Attempt XSLT transformation
        const xsltResponse = await fetch('nft-renderer.xslt');
        
        if (!xsltResponse.ok) {
            throw new Error(`Failed to fetch XSLT: ${xsltResponse.status} ${xsltResponse.statusText}`);
        }
        const xsltText = await xsltResponse.text();
        
        if (!xsltText.includes('<xsl:stylesheet') && !xsltText.includes('<xsl:transform')) {
            throw new Error('The fetched file does not appear to be a valid XSLT document');
        }

        const xsltDoc = parser.parseFromString(xsltText, 'application/xml');
        if (xsltDoc.documentElement.tagName === "parsererror") {
            throw new Error("XSLT parse error: " + xsltDoc.documentElement.textContent);
        }

        const isValidXSLT = xsltDoc.documentElement.tagName === "stylesheet" ||
                           xsltDoc.documentElement.tagName === "transform" ||
                           xsltDoc.documentElement.tagName === "xsl:stylesheet" ||
                           xsltDoc.documentElement.tagName === "xsl:transform";

        if (!isValidXSLT) {
            throw new Error("Invalid XSLT document: Root element should be 'stylesheet' or 'transform'");
        }

        const xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(xsltDoc);
        const resultDoc = xsltProcessor.transformToDocument(xmlDoc);

        if (!resultDoc || !resultDoc.documentElement) {
            throw new Error("XSLT transformation resulted in an empty document");
        }

        console.log('Transformed Document:', serializer.serializeToString(resultDoc));
        renderResult(resultDoc.documentElement);
    } catch (error) {
        console.error('Error in XSLT transformation:', error);
        console.log('Falling back to direct HTML rendering');
        renderFallback(xmlDoc.documentElement);
    }
}

function renderResult(element) {
    const container = document.getElementById('nft-container');
    if (!container) {
        console.error("Container 'nft-container' not found");
        return;
    }
    container.innerHTML = '';
    container.appendChild(element);
}

function renderFallback(nftElement) {
    const container = document.getElementById('nft-container');
    if (!container) {
        console.error("Container 'nft-container' not found");
        return;
    }

    const result = document.createElement('div');
    result.className = 'nft-fallback';

    function renderElement(element, parent) {
        const div = document.createElement('div');
        div.className = `nft-${element.tagName.toLowerCase()}`;
        
        // Special handling for image element containing SVG
        if (element.tagName.toLowerCase() === 'image' && element.querySelector('svg')) {
            const wrapper = document.createElement('div');
            wrapper.style.maxWidth = '100%';
            wrapper.style.margin = '0 auto';
            wrapper.appendChild(element.querySelector('svg').cloneNode(true));
            div.appendChild(wrapper);
        } else if (element.querySelector('svg')) {
            // For other elements containing SVG
            div.appendChild(element.querySelector('svg').cloneNode(true));
        } else if (element.childNodes.length === 0 || (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3)) {
            // Text content or empty element
            const label = document.createElement('strong');
            label.textContent = element.tagName + ': ';
            div.appendChild(label);
            div.appendChild(document.createTextNode(element.textContent));
        } else {
            // Element with child elements
            const label = document.createElement('strong');
            label.textContent = element.tagName + ':';
            div.appendChild(label);
            for (const child of element.children) {
                renderElement(child, div);
            }
        }
        
        parent.appendChild(div);
    }

    renderElement(nftElement, result);
    container.innerHTML = '';
    container.appendChild(result);
}