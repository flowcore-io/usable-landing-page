#!/bin/bash
# Image Optimization Script
# Converts PNG/JPG images to WebP format for better compression

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp not found. Install with: brew install webp (macOS) or apt-get install webp (Linux)"
    exit 1
fi

echo "🖼️  Optimizing images to WebP format..."
echo ""

# Counter for converted images
converted=0
skipped=0

# Function to convert image
convert_to_webp() {
    local input="$1"
    local output="${input%.*}.webp"
    
    # Skip if WebP already exists
    if [ -f "$output" ]; then
        echo "⏭️  Skipping $input (WebP already exists)"
        ((skipped++))
        return
    fi
    
    # Convert to WebP with quality 85 (good balance)
    if cwebp -q 85 "$input" -o "$output" &> /dev/null; then
        local original_size=$(stat -f%z "$input" 2>/dev/null || stat -c%s "$input" 2>/dev/null)
        local webp_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output" 2>/dev/null)
        local savings=$((original_size - webp_size))
        local savings_percent=$((savings * 100 / original_size))
        
        echo "✅ Converted: $input → $output"
        echo "   Savings: $(numfmt --to=iec-i --suffix=B $savings 2>/dev/null || echo "${savings} bytes") (${savings_percent}%)"
        ((converted++))
    else
        echo "❌ Failed to convert: $input"
    fi
}

# Find and convert all PNG and JPG images
find assets/images -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | while read -r file; do
    convert_to_webp "$file"
done

echo ""
echo "✨ Optimization complete!"
echo "   Converted: $converted images"
echo "   Skipped: $skipped images (WebP already exists)"
echo ""
echo "💡 Tip: Update HTML to use WebP with PNG fallback:"
echo '   <picture>'
echo '     <source srcset="image.webp" type="image/webp">'
echo '     <img src="image.png" alt="Description">'
echo '   </picture>'

