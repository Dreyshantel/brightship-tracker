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
  git pull origin main
  docker-compose down
  docker-compose up -d
  echo "Done. Check http://$SERVER:3000/health to see if it worked"
EOF

echo ""
echo "Deploy complete (probably)."
echo "Watch it for 10 mins."
echo "If something breaks, SSH in and check: docker-compose logs -f"
echo "There is no rollback. Sorry. - Kofi"
