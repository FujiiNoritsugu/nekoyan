#!/usr/bin/env bash
# stop script on error
set -e

# run pub/sub sample app using certificates downloaded in package
printf "\nRunning pub/sub sample application...\n"
python ./basicPubSub.py -e a1fupjg4bu1m3q-ats.iot.us-east-1.amazonaws.com -r berginia/AmazonRootCA1.pem -c berginia/unitv2.pem.crt -k berginia/unitv2-private.pem.key
