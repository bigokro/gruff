#!/bin/bash

DATE=`date -d yesterday +%Y%m`

/opt/s3sync/s3cmd.rb deleteall gruff_backup:$DATE
