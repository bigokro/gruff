#!/bin/bash

export NODE_HOME=/home/ec2-user/gruff/gruff-web
cd $NODE_HOME
NODE_ENV=production node app.js&