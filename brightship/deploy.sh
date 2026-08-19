#!/bin/bash
# BrightShip deploy script
# Run this from your laptop when you want to push to prod
# You need the PEM file — ask Emeka if you don't have it
# Update the SERVER ip if it changes (it changes sometimes after restarts)
# - Kofi

SERVER="54.72.xxx.xxx"
PEM="~/.ssh/brightship-prod.pem"

echo "Deploying to production..."
echo "Make sure you tested this locally first!"
echo ""

ssh -i $PEM ubuntu@$SERVER << 'EOF'
  cd /home/ubuntu/brightship
  # prefer image-based deploy when DEPLOY_IMAGE and DEPLOY_TAG provided
  if [ -n "$DEPLOY_IMAGE" ] && [ -n "$DEPLOY_TAG" ]; then
    IMG="$DEPLOY_IMAGE:$DEPLOY_TAG"
    echo "APP_IMAGE=$IMG" > .env
    chmod +x deploy.sh rollback.sh || true
    docker-compose pull app || true
    docker-compose up -d --no-build app || docker-compose up -d
  else
    if [ -n "$DEPLOY_SHA" ]; then
      git fetch origin
      git checkout "$DEPLOY_SHA"
    else
      git pull origin main
    fi
    chmod +x deploy.sh rollback.sh || true
    docker-compose down
    docker-compose up -d
  fi
  echo "Done. Check http://$SERVER:3000/health to see if it worked"
EOF

echo ""
echo "Deploy complete (probably)."
echo "Watch it for 10 mins."
echo "If something breaks, SSH in and check: docker-compose logs -f"
