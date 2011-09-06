#
# Downloads and installs mongodb
# 

bash "install mongodb" do
  cwd "/usr/local/src"
  user "root"
  code <<-EOH
    mkdir -p mongodb && \
    cd mongodb
    curl -L http://fastdl.mongodb.org/linux/mongodb-linux-i686-1.8.3.tgz | tar xzf - --strip-components=1
    sudo mkdir -p /data/db/
    sudo chown `id -u` /data/db
  EOH
end
