#!/bin/bash -x

#
# This script uploads files to the igornadj.io photos s3 bucket.
# 
# Setup:
#  - Install s3cmd (`brew install s3cmd`)
#  - Configure s3cmd (`s3cmd --configure`)
#
# Run: call this script

find ~/Pictures/igornadj.io.photos -name '.DS_Store' -delete

s3cmd sync --recursive --delete-removed ~/Pictures/igornadj.io.photos s3://igornadj-photos/

