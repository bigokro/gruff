#
# Author:: Tim High
# Cookbook Name:: nodejs
# Recipe:: npm-custom
#
# I had to abandon the npm recipe provided by this plugin, because it was failing.
# Instead, I am working off of the instructions provided here:
# https://github.com/joyent/node/wiki/Installation
#

include_recipe "nodejs"

package "curl"

bash "install npm - package manager for node" do
  cwd "/usr/local/src"
  user "root"
  code <<-EOH
    curl http://npmjs.org/install.sh | sh
  EOH
  not_if "#{node[:nodejs][:dir]}/bin/npm -v 2>&1 | grep '#{node[:nodejs][:npm]}'"
end

