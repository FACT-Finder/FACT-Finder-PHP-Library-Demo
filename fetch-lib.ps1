# This script fetches the most recent state of the library repo's src-only
# branch and merges into the /lib directory of the current branch.

git fetch ffphplib src-only
git subtree pull --prefix=lib ffphplib src-only --squash

# TODO: Possibly clean up the git log a bit.
