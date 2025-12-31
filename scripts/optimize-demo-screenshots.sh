#!/bin/bash
# Optimize Demo Screenshots Script
# Converts PNG screenshots to WebP format and creates smaller versions

# Check if required tools are installed
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp not found. Install with: brew install webp (macOS) or apt-get install webp (Linux)"
    exit 1
fi

if ! command -v sips &> /dev/null && ! command -v convert &> /dev/null; then
    echo "⚠️  Warning: Image resizing tools not found. Will only convert to WebP."
    echo "   Install ImageMagick: brew install imagemagick (macOS) or apt-get install imagemagick (Linux)"
fi

DEMO_DIR="assets/demo"
QUALITY=80  # WebP quality (good balance between size and quality)

echo "🖼️  Optimizing demo screenshots..."
echo ""

# Counter
converted=0
resized=0
skipped=0

# Function to convert to WebP
convert_to_webp() {
    local input="$1"
    local output="${input%.*}.webp"
    
    if [ -f "$output" ]; then
        echo "⏭️  Skipping $input (WebP already exists)"
        ((skipped++))
        return
    fi
    
    if cwebp -q $QUALITY "$input" -o "$output" 2>/dev/null; then
        local original_size=$(stat -f%z "$input" 2>/dev/null || stat -c%s "$input" 2>/dev/null)
        local webp_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output" 2>/dev/null)
        local savings=$((original_size - webp_size))
        local savings_percent=$((savings * 100 / original_size))
        
        echo "✅ Converted: $(basename "$input") → $(basename "$output")"
        echo "   Savings: ~${savings_percent}% ($(numfmt --to=iec-i --suffix=B $savings 2>/dev/null || echo "${savings} bytes"))"
        ((converted++))
    else
        echo "❌ Failed to convert: $input"
    fi
}

# Function to create smaller version (50% size)
create_small_version() {
    local input="$1"
    local basename=$(basename "$input" .png)
    local dir=$(dirname "$input")
    local output="${dir}/${basename}-small.webp"
    
    if [ -f "$output" ]; then
        return
    fi
    
    # Try sips (macOS) first
    if command -v sips &> /dev/null; then
        # Create temporary resized PNG first
        local temp_png="${dir}/${basename}-temp.png"
        sips -Z 50 "$input" --out "$temp_png" &>/dev/null
        if [ -f "$temp_png" ]; then
            cwebp -q $QUALITY "$temp_png" -o "$output" 2>/dev/null
            rm -f "$temp_png"
            if [ -f "$output" ]; then
                ((resized++))
            fi
        fi
    # Try ImageMagick
    elif command -v convert &> /dev/null; then
        convert "$input" -resize 50% -quality $QUALITY "$output" 2>/dev/null
        if [ -f "$output" ]; then
            ((resized++))
        fi
    fi
}

# Process all PNG files in demo directory
if [ ! -d "$DEMO_DIR" ]; then
    echo "❌ Directory not found: $DEMO_DIR"
    exit 1
fi

find "$DEMO_DIR" -type f -name "*.png" | while read -r file; do
    echo "Processing: $(basename "$file")"
    convert_to_webp "$file"
    create_small_version "$file"
    echo ""
done

echo "✨ Optimization complete!"
echo "   WebP conversions: $converted"
echo "   Small versions created: $resized"
echo "   Skipped: $skipped"
echo ""
echo "💡 Next steps:"
echo "   1. Update HTML to use WebP with PNG fallback"
echo "   2. Use small versions for thumbnails/previews"
echo "   3. Load full-size images on demand (lightbox)"

