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