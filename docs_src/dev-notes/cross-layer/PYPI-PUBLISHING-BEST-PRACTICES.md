# PyPI Publishing Best Practices

**Last Updated**: February 12, 2026  
**Version**: 0.2.4.12

## 🚨 CRITICAL RULES

### ✅ DO: Use sage-pypi-publisher CLI Tool

**ALWAYS use the CLI tool for each package individually (manual, one-by-one):**

```bash
# ✅ CORRECT
cd /path/to/package
sage-pypi-publisher build . --upload -r testpypi --no-dry-run
sage-pypi-publisher build . --upload -r pypi --no-dry-run
```

### ❌ DON'T: Use Bash Scripts

**NEVER use bash scripts for automated publishing:**

```bash
# ❌ WRONG - Don't do this
./publish.sh sage-common        # Use CLI directly
for pkg in ...; do              # Don't loop
    sage-pypi-publisher ...
done

# ❌ WRONG - Don't use old tools
python -m build                 # Use sage-pypi-publisher
twine upload dist/*.whl         # Use sage-pypi-publisher
```

## Why Manual One-by-One?

✅ **Advantages:**
- Clear visibility of each package's upload status
- Easy to handle individual failures
- Simple error recovery (re-run failed package)
- No complex bash script logic to debug
- Each step is explicit and traceable

❌ **Disadvantages of Scripts:**
- Silent failures hidden in script output
- Partial uploads hard to recover from
- Complex error handling logic
- Debugging is difficult
- All-or-nothing semantics

## Publishing Workflow

### Phase 1: Update Version Numbers

Update all affected `_version.py` files with the new version (4-digit semantic: `MAJOR.MINOR.PATCH.BUILD`):

```python
"""Version information for sage-common."""
__version__ = "0.2.4.12"    # ← Increment BUILD digit
__author__ = "IntelliStream Team"
```

### Phase 2: Commit and Tag

```bash
# Stage version updates
git add packages/*/src/sage/*/_version.py

# Commit with clear message
git commit -m "chore: bump all packages to version 0.2.4.12"

# Create annotated tag with release notes
git tag -a v0.2.4.12 -m "Release SAGE 0.2.4.12

✅ Bug Fixes:
- Fixed installation progress display
- Enhanced mirror detection

📦 8 Packages released:
- isage-common 0.2.4.12
- isage-platform 0.2.4.12
- isage-kernel 0.2.4.12
- isage-libs 0.2.4.12
- isage-middleware 0.2.4.12
- isage-cli 0.2.4.12
- isage-tools 0.2.4.12
- isage 0.2.4.12"

# Push
git push origin main-dev
git push origin v0.2.4.12
```

### Phase 3: Publish to TestPyPI

**Publish each package individually:**

```bash
# 1. sage-common
cd /home/shuhao/SAGE/packages/sage-common
sage-pypi-publisher build . --upload -r testpypi --no-dry-run
# Output: ✅ Uploading to https://test.pypi.org/legacy/

# 2. sage-platform
cd /home/shuhao/SAGE/packages/sage-platform
sage-pypi-publisher build . --upload -r testpypi --no-dry-run

# 3. sage-kernel
cd /home/shuhao/SAGE/packages/sage-kernel
sage-pypi-publisher build . --upload -r testpypi --no-dry-run

# 4-8. Repeat for remaining packages:
# sage-libs, sage-middleware, sage-cli, sage-tools, sage (meta)
```

**Each command:**
- Detects build system (pure Python or C++ extensions)
- Compiles files as needed
- Builds wheel package
- Uploads to TestPyPI with progress feedback
- Shows upload URL

### Phase 4: Verify on TestPyPI

```bash
# Test installation from TestPyPI
pip install -i https://test.pypi.org/simple/ isage-common==0.2.4.12 --dry-run

# Check package page
# https://test.pypi.org/project/isage-common/0.2.4.12/
```

### Phase 5: Publish to Production PyPI

**Same commands, but change repository to `pypi`:**

```bash
# 1. sage-common
cd /home/shuhao/SAGE/packages/sage-common
sage-pypi-publisher build . --upload -r pypi --no-dry-run

# 2. sage-platform
cd /home/shuhao/SAGE/packages/sage-platform
sage-pypi-publisher build . --upload -r pypi --no-dry-run

# Continue for all 8 packages...
```

### Phase 6: Verify Production Release

```bash
# Test installation from PyPI (official)
pip install isage-common==0.2.4.12

# Verify version
python -c "import sage.common; print(sage.common.__version__)"
```

## Command Reference

### sage-pypi-publisher CLI

```bash
# Main usage pattern
cd /path/to/package
sage-pypi-publisher build . --upload -r <REPO> --no-dry-run

# Options
-r testpypi     # Upload to TestPyPI (default)
-r pypi         # Upload to production PyPI
--no-dry-run    # Actually upload (default is --dry-run)
--dry-run       # Preview mode (default)
```

### Example: Full Publishing Sequence

```bash
# TestPyPI
cd ~/SAGE/packages/sage-common && sage-pypi-publisher build . --upload -r testpypi --no-dry-run

# Verify on TestPyPI
pip install -i https://test.pypi.org/simple/ isage-common==0.2.4.12 --dry-run

# Production PyPI
cd ~/SAGE/packages/sage-common && sage-pypi-publisher build . --upload -r pypi --no-dry-run

# Verify from PyPI
pip install isage-common==0.2.4.12
```

## Configuration

### PyPI Credentials

Credentials should be stored in `~/.pypirc`:

```ini
[distutils]
index-servers =
    pypi
    testpypi

[pypi]
username = __token__
password = pypi-your-token-here

[testpypi]
repository = https://test.pypi.org/legacy/
username = __token__
password = pypi-your-testpypi-token-here
```

### Obtaining Tokens

1. **PyPI**: https://pypi.org/manage/account/
2. **TestPyPI**: https://test.pypi.org/manage/account/

**Create "API token" (not "account token")** for better security.

## Success Indicators

### What to Look For

✅ **Good signs:**
- `🔗 Uploading distributions to https://test.pypi.org/legacy/`
- `🔗 View at: https://test.pypi.org/project/isage-common/X.Y.Z.W/`
- Each package publishes independently
- No errors in output

❌ **Bad signs:**
- `❌ 401 Unauthorized` → Check credentials in ~/.pypirc
- `❌ Filename already exists` → Version already published (check version bump)
- Silent failures → Script hid errors
- Mixed status (some pass, some fail) → Hard to debug

## Troubleshooting

### Issue: "401 Unauthorized"

**Solution**: Verify credentials in `~/.pypirc`:
```bash
# Check file exists
cat ~/.pypirc

# Regenerate token if needed
# Visit: https://pypi.org/manage/account/tokens/
```

### Issue: "Filename already exists"

**Solution**: Version already published

```bash
# 1. Verify version in _version.py was updated
grep "__version__" packages/sage-common/src/sage/common/_version.py

# 2. If needed, increment version and recommit:
git tag -d v0.2.4.12             # Remove local tag
git push origin :v0.2.4.12       # Remove remote tag
# Update version, commit, and retry
```

### Issue: "Module not found" after installation

**Solution**: Might be installation caching

```bash
# Clear pip cache
pip cache purge

# Reinstall explicit version
pip install --force-reinstall isage-common==0.2.4.12
```

## Historical Publishing Example

**Release 0.2.4.12 (February 12, 2026):**

```
# All 8 packages published successfully to both TestPyPI and PyPI:
✅ isage-common
✅ isage-platform
✅ isage-kernel
✅ isage-libs
✅ isage-middleware
✅ isage-cli
✅ isage-tools
✅ isage (meta-package)

# Tag created
v0.2.4.12 → Github release

# Total time: ~10 minutes manual publishing
# Error recovery: 0 (all packages first-try success)
```

## For Copilot/Agent Automation

**DO:**
- Remind user: "Use sage-pypi-publisher CLI tool directly"
- Provide individual commands for each package
- Show expected output and success indicators
- Create git tags with release notes

**DON'T:**
- Suggest bash scripts or loops
- Use old `./publish.sh` syntax
- Suggest `python -m build` or `twine` directly
- Hide publishing in automation (make it visible)

## Links

- **sage-pypi-publisher**: https://github.com/intellistream/sage-pypi-publisher
- **PyPI**: https://pypi.org/
- **TestPyPI**: https://test.pypi.org/

---

**Last Updated**: February 12, 2026  
**Version**: 0.2.4.12  
**Author**: SAGE Development Team
