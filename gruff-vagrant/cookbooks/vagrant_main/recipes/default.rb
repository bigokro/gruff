# vagrant_main cookbook
# This cookbook includes all the other cookbooks we'll need
#
require_recipe "build-essential"
require_recipe "nodejs"
require_recipe "nodejs::npm"
require_recipe "npm-modules"
require_recipe "mongodb"


