# You'll need node.js and docco to build the documentation. If you don't have
# docco yet, you can install it via
#
# sudo npm install -g docco

docco -o doc ./demo/index.php ./demo/suggest.php ./demo/tracking.php \
             ./demo/userdata/initialization.php ./demo/helper/HtmlGenerator.php
