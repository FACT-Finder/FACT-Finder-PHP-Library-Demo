# This script assumes that the 'master' branch is up-to-date and does not have
# uncommitted changes. Note that it will immediately commit the new doc into
# both the 'master' and the 'gh-pages' branch but will not push the branches.
# You'll need node.js and docco to build the documentation. If you don't have
# docco yet, you can install it via
#
# npm install -g docco

# Make the project root directory the working directory (regardless of where the
# script has been called from).

$scriptPath = $MyInvocation.MyCommand.Path
$dir = Split-Path $scriptPath
Push-Location $dir

# Read current branch

$branch = git status | Select-String -Pattern "On branch (.*)" -List `
    | %{$_.matches[0].groups[1].value}

git checkout master

# Build and commit documentation

docco -o docs .\demo\index.php .\demo\suggest.php .\demo\tracking.php `
              .\demo\userdata\initialization.php .\demo\helper\HtmlGenerator.php

git add --all docs
git commit -m "Update documentation"

# Merge new doc into GitHub pages branch

git checkout gh-pages
git cherry-pick master

# Move back to original branch

git checkout $branch

Pop-Location
