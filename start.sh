#!/bin/bash
set -e

echo "🚀 Démarrage de unoserver..."
python3 -m unoserver.server --port 2003 --interface 0.0.0.0 &
UNOSERVER_PID=$!

echo "⏳ Attente que unoserver soit prêt (max 60s)..."
ATTEMPTS=0

until nc -z 127.0.0.1 2003 2>/dev/null; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ $ATTEMPTS -ge 30 ]; then
    echo "❌ ERREUR: Timeout unoserver (60s)"
    kill $UNOSERVER_PID 2>/dev/null
    exit 1
  fi
  if ! kill -0 $UNOSERVER_PID 2>/dev/null; then
    echo "❌ ERREUR: Le processus unoserver a crashé prématurément !"
    exit 1
  fi
  echo "   ... en attente ($ATTEMPTS/30)"
  sleep 2
done

echo "✅ unoserver est prêt ! Démarrage de Node.js..."

# Keep-alive : ping toutes les 4 minutes pour éviter le freeze BTP Trial
while true; do
  sleep 240
  curl -s http://127.0.0.1:4004/ > /dev/null || true
done &

node dist/index.js