#!/bin/bash

# Script to set up the correct import structure for Lens V3 contracts
echo "Setting up import structure for Lens V3 contracts..."

# Create the contracts directory structure if it doesn't exist
mkdir -p contracts/core/types
mkdir -p contracts/core/interfaces
mkdir -p contracts/core/libraries
mkdir -p contracts/core/base
mkdir -p contracts/core/primitives
mkdir -p contracts/core/access
mkdir -p contracts/core/upgradeability
mkdir -p contracts/extensions/actions
mkdir -p contracts/extensions/factories
mkdir -p contracts/actions/base
mkdir -p contracts/actions/collect
mkdir -p contracts/actions/follow
mkdir -p contracts/actions/reference
mkdir -p contracts/misc
mkdir -p contracts/rules
mkdir -p contracts/rules/feed

# Copy all lens-v3 contracts to the contracts directory
echo "Copying all Lens V3 files to match import structure..."
cp -r lens-v3/contracts/* contracts/

# Ensure all subdirectories exist
find lens-v3/contracts -type d | while read dir; do
  target_dir=${dir/lens-v3\//}
  mkdir -p "$target_dir"
done

# Copy all files
find lens-v3/contracts -type f | while read file; do
  target_file=${file/lens-v3\//}
  cp "$file" "$target_file"
done

echo "Import structure setup complete!"
