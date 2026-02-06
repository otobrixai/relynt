#!/usr/bin/env python3
"""
VALIDATES MONOREPO STRUCTURE
Run this after Phase 1 to catch AI mistakes
"""
import os
import sys
import json
from pathlib import Path

def check_node_modules():
    """Ensure no rogue node_modules folders"""
    root = Path.cwd()
    violations = []
    
    # Check for node_modules in wrong places
    for path in root.rglob('node_modules'):
        if path == root / 'node_modules':
            continue  # Root is OK
        if '.tmp' in str(path) or '.cache' in str(path):
            continue  # Ignore temp folders
        
        # Get relative path
        rel_path = path.relative_to(root)
        violations.append(str(rel_path))
    
    return violations

def check_package_json():
    """Validate package.json structure"""
    root = Path.cwd()
    root_pkg = root / 'package.json'
    
    if not root_pkg.exists():
        return ["Missing root package.json"]
    
    with open(root_pkg) as f:
        data = json.load(f)
    
    errors = []
    
    # Root should use workspaces
    if 'workspaces' not in data:
        errors.append("Root package.json missing 'workspaces' field")
    
    # Root should not have app dependencies
    app_deps = ['react', 'next', 'express', 'prisma', 'typeorm']
    if 'dependencies' in data:
        for dep in app_deps:
            if dep in data['dependencies']:
                errors.append(f"Root package.json has app dependency: {dep}")
    
    return errors

def main():
    print("🔍 Validating monorepo structure...")
    
    node_module_violations = check_node_modules()
    package_errors = check_package_json()
    
    if node_module_violations:
        print("❌ Rogue node_modules folders found:")
        for violation in node_module_violations:
            print(f"   - {violation}")
        print("\n   Run: find . -name 'node_modules' -not -path './node_modules' -exec rm -rf {} +")
    
    if package_errors:
        print("❌ Package.json issues:")
        for error in package_errors:
            print(f"   - {error}")
    
    if not node_module_violations and not package_errors:
        print("✅ Monorepo structure is correct!")
        return 0
    
    return 1

if __name__ == '__main__':
    sys.exit(main())