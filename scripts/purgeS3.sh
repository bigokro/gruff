#!/bin/bash

DATE=`date -d '63 days ago' +%Y%m`

echo deleting backups wih prefix $DATE
/opt/s3sync/s3cmd.rb list gruff_backup:$DATE
/opt/s3sync/s3cmd.rb deleteall gruff_backup:$DATE
