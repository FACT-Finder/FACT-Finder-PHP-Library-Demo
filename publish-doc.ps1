# This script assumes that the 'master' branch has the latest documentation.
# Note that it will not push any branches.

# Make the project root directory the working directory (regardless of where the
# script has been called from).

$scriptPath = $MyInvocation.MyCommand.Path
$dir = Split-Path $scriptPath
Push-Location $dir

# Read current branch and stash changes

$branch = git status | Select-String -Pattern "On branch (.*)" -List `
    | %{$_.matches[0].groups[1].value}

git stash

# Load new docs from master into GitHub pages branch

git checkout gh-pages
git checkout master ./docs
git add --all ./docs
git commit -m "Update documentation"

# Move back to original branch

git checkout $branch

git stash pop

Pop-Location
