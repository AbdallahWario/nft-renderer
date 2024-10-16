// Function to render NFT using XSLT or fallback to direct HTML rendering
async function renderNFT(metadata) {
    const parser = new DOMParser();
    const serializer = new XMLSerializer();

    // Convert JSON metadata to XML
    const xmlDoc = parser.parseFromString('<nft></nft>', 'application/xml');
    const nftElement = xmlDoc.documentElement;

    function createValidElementName(key) {
        if (/^[0-9]/.test(key)) {
            return '_' + key;
        }
        return key.replace(/[^a-zA-Z0-9\-_\.]/g, '_');
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
                element.textContent = value !== null && value !== undefined ? value.toString() : '';
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
        const xsltText = `
        <?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" encoding="UTF-8" />

    <xsl:template match="/nft">
        <div class="nft-content">
            <h2><xsl:value-of select="name"/></h2>
            <p><strong>Symbol:</strong> <xsl:value-of select="symbol"/></p>
            <p><strong>Token ID:</strong> <xsl:value-of select="NFTId"/></p>
            <h3><xsl:value-of select="title"/></h3>
            <p><xsl:value-of select="description"/></p>
            <h3>Image:</h3>
            <xsl:choose>
                <xsl:when test="starts-with(image, 'http')">
                    <img src="{image}" alt="NFT Image" style="max-width: 100%;" />
                </xsl:when>
                <xsl:when test="starts-with(image, 'data:image/svg+xml')">
                    <xsl:value-of select="image" disable-output-escaping="yes" />
                </xsl:when>
                <xsl:otherwise>
                    <p>No image available.</p>
                </xsl:otherwise>
            </xsl:choose>
            <h3>Properties:</h3>
            <dl>
                <xsl:for-each select="attributes/*">
                    <dt class="property {name()}"><xsl:value-of select="trait_type"/></dt>
                    <dd class="property-value"><xsl:value-of select="value"/></dd>
                </xsl:for-each>
            </dl>
        </div>
    </xsl:template>
</xsl:stylesheet>

        `;
        

        const xsltDoc = parser.parseFromString(xsltText, 'application/xml');
        console.log('Parsed XSLT document:', serializer.serializeToString(xsltDoc));

        if (xsltDoc.documentElement.tagName === "parsererror") {
            console.error('XSLT parse error:', xsltDoc.documentElement.textContent);
            throw new Error("XSLT parse error: " + xsltDoc.documentElement.textContent);
        }

        if (xsltDoc.documentElement.tagName !== "stylesheet" && xsltDoc.documentElement.tagName !== "transform") {
            console.error('Invalid XSLT root element:', xsltDoc.documentElement.tagName);
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
        
        if (element.childNodes.length === 0 || (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3)) {
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

export { renderNFT };