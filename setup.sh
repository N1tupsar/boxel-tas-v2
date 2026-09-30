#!/usr/bin/env bash
# Installs the two JS dependencies. Falls back to the bundled copies in vendor/ if npm is unavailable.
cd "$(dirname "$0")/sim"
if npm install --no-audit --no-fund --silent 2>/dev/null && node -e "require('matter-js');require('lodash')" 2>/dev/null; then
  echo "npm install OK"
else
  echo "npm unavailable - using bundled vendor/ copies"
  mkdir -p node_modules/matter-js node_modules/lodash
  echo "module.exports = require('../../../vendor/matter.js');" > node_modules/matter-js/index.js
  echo "module.exports = require('../../../vendor/lodash.js');" > node_modules/lodash/index.js
fi
node -e "console.log('matter-js', require('matter-js').version)"
