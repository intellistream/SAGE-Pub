# Node.js Path Priority Issue (nvm vs conda)

## Problem

When both nvm and conda Node.js are installed, the system may use the wrong version due to PATH priority.

**Symptom**:
```bash
$ conda install -y nodejs=22 -c conda-forge  # Install Node.js 22
$ node --version                              # Still shows v18.x (from nvm)
v18.20.8
```

## Root Cause

nvm modifies PATH in `~/.bashrc` or `~/.zshrc`, often placing its binaries **before** conda:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This prepends nvm to PATH
```

This causes:
```
PATH = /home/user/.nvm/versions/node/v18.20.8/bin:...:/home/user/miniconda3/envs/sage/bin
       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
       nvm (priority)                           conda (ignored)
```

## Solutions

### Solution 1: Use conda Node.js (Recommended for SAGE)

**Temporarily** (current terminal session):
```bash
export PATH="/home/shuhao/miniconda3/envs/sage/bin:$PATH"
node --version  # Now shows v22.x
```

**Permanently** (modify shell config):

Edit `~/.bashrc` or `~/.zshrc`, move conda initialization **after** nvm:

```bash
# BAD: nvm after conda (nvm wins)
# >>> conda initialize >>>
# ...conda init code...
# >>> conda initialize <<<
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# GOOD: conda after nvm (conda wins when activated)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
# >>> conda initialize >>>
# ...conda init code...
# >>> conda initialize <<<
```

Then reload:
```bash
source ~/.bashrc  # or ~/.zshrc
conda activate sage
node --version  # Should show v22.x
```

### Solution 2: Use nvm Node.js (Alternative)

If you prefer nvm:
```bash
nvm install 22
nvm use 22
nvm alias default 22
```

### Solution 3: Uninstall One Version (Clean)

**Remove nvm** (if using conda):
```bash
rm -rf ~/.nvm
# Remove nvm lines from ~/.bashrc or ~/.zshrc
```

**Remove conda Node.js** (if using nvm):
```bash
conda remove nodejs
```

## Verification

After applying a solution:
```bash
which node       # Should point to desired Node.js
node --version   # Should show v22.x (for Vite 7.x)
npm --version    # Should match Node.js version
```

## SAGE Requirements

- **Minimum**: Node.js 20.19.0 (for Vite 7.x)
- **Recommended**: Node.js 22.x (latest LTS)
- Install via conda: `conda install -y nodejs=22 -c conda-forge`

## See Also

- [SAGE Studio README](../../l6-studio/README.md)
- [Vite 7.x Migration Guide](https://vite.dev/guide/migration.html)
