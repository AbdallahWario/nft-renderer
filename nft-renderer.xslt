<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="/nft">
        <div class="nft-content">
            <h2><xsl:value-of select="name"/></h2>
            <p><strong>Symbol:</strong> <xsl:value-of select="symbol"/></p>
            <p><strong>Token ID:</strong> <xsl:value-of select="tokenId"/></p>
            <h3><xsl:value-of select="title"/></h3>
            <p><xsl:value-of select="description"/></p>
            <xsl:if test="image">
                <img src="{image}" alt="NFT Image" style="max-width: 100%;" />
            </xsl:if>
            <h3>Properties:</h3>
            <dl>
                <xsl:for-each select="properties/*">
                    <dt class="property {name()}"><xsl:value-of select="name()"/></dt>
                    <dd class="property-value"><xsl:value-of select="."/></dd>
                </xsl:for-each>
            </dl>
        </div>
    </xsl:template>
</xsl:stylesheet>