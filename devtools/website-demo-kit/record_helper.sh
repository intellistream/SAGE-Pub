#!/bin/bash
# Helper script to record clean demos for SAGE
# Usage: ./record_helper.sh <output_filename>

OUTPUT_FILE="${1:-demo.cast}"

if ! command -v asciinema &> /dev/null; then
    echo "Error: asciinema is not installed."
    echo "Install it via: pip install asciinema"
    exit 1
fi

echo "🎥 Starting recording session..."
echo "----------------------------------------"
echo "Tips for a good demo:"
echo "1. Resize your terminal to a standard size (e.g. 100x24) BEFORE recording."
echo "2. Type slowly and clearly."
echo "3. Don't worry about long pauses (player will skip them)."
echo "4. Press Ctrl-D or type 'exit' to finish."
echo "----------------------------------------"
echo "Saving to: $OUTPUT_FILE"
echo "Press Enter to start..."
read

# Start recording
# -i 2: Set idle time limit to 2 seconds in the raw file (optional, player handles it too)
asciinema rec -i 2 "$OUTPUT_FILE"

echo "✅ Recording saved to $OUTPUT_FILE"
echo "To preview: asciinema play $OUTPUT_FILE"
