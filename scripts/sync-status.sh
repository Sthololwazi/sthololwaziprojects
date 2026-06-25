#!/bin/bash
# Check if static and SSR sites are in sync

echo "🔍 Checking synchronization status..."

# Check Lovable site
LOVABLE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")
echo "Lovable SSR: HTTP $LOVABLE_RESPONSE"

# Check GitHub Pages site
GH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$GH_PAGES_URL")
echo "GitHub Pages: HTTP $GH_RESPONSE"

# Check both return same content (or redirects properly)
LOVABLE_CONTENT=$(curl -s "$SITE_URL" | head -100)
GH_CONTENT=$(curl -s "$GH_PAGES_URL" | head -100)

# Compare key elements
if echo "$LOVABLE_CONTENT" | grep -q "sthololwazi" && echo "$GH_CONTENT" | grep -q "sthololwazi"; then
    echo "✅ Sites appear to be in sync"
else
    echo "⚠️ Sites may be out of sync - check manually"
fi

# Check sitemaps
for SITEMAP in sitemap.xml sitemap-pages.xml sitemap-projects.xml; do
    LOVABLE_SITEMAP=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/$SITEMAP")
    GH_SITEMAP=$(curl -s -o /dev/null -w "%{http_code}" "$GH_PAGES_URL/$SITEMAP")
    
    if [ "$LOVABLE_SITEMAP" = "200" ] && [ "$GH_SITEMAP" = "200" ]; then
        echo "✅ $SITEMAP available on both"
    else
        echo "⚠️ $SITEMAP mismatch: Lovable=$LOVABLE_SITEMAP, GH=$GH_SITEMAP"
    fi
done
