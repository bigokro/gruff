#
# Downloads and installs npm modules required for this project
# 

bash "install npm - package manager for node" do
  cwd "/usr/local/src"
  user "root"
  code <<-EOH
    npm install express
    npm install socket.io
    npm install mongodb
  EOH
end
