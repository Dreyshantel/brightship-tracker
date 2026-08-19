#!/bin/bash
set -e

# Rollback script: checkout last good deploy SHA and restart compose
DIR="/home/ubuntu/brightship"
cd "$DIR"

if [ ! -f last_good_deploy ]; then
  echo "No last_good_deploy file found in $DIR" >&2
  exit 1
fi

GOOD_IMG=$(cat last_good_deploy)
if [ -z "$GOOD_IMG" ]; then
  echo "last_good_deploy is empty" >&2
  exit 1
fi

echo "Rolling back to $GOOD_IMG"
echo "APP_IMAGE=$GOOD_IMG" > .env
docker-compose pull app || true
docker-compose up -d --no-build app || docker-compose up -d
echo "Rollback complete to $GOOD_IMG"
