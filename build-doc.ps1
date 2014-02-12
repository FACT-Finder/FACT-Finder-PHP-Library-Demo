# You'll need node.js and docco to build the documentation. If you don't have
# docco yet, you can install it via
#
# npm install -g docco

# Make the project root directory the working directory (regardless of where the
# script has been called from).

$scriptPath = $MyInvocation.MyCommand.Path
$dir = Split-Path $scriptPath
Push-Location $dir

# Build doc

docco -o docs .\demo\index.php .\demo\suggest.php .\demo\tracking.php `
              .\demo\userdata\initialization.php

# Move back to original directory

Pop-Location
