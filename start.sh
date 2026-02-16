#!/bin/bash
set -e

echo "🚀 Démarrage de unoserver..."
# On lance unoserver en background
python3 -m unoserver.server --port 2003 --interface 0.0.0.0 &
UNOSERVER_PID=$!

echo "⏳ Attente que unoserver soit prêt (max 60s)..."
ATTEMPTS=0
# On boucle tant que le port 2003 ne répond pas
until nc -z 127.0.0.1 2003 2>/dev/null; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ $ATTEMPTS -ge 30 ]; then
        echo "❌ ERREUR: Timeout unoserver (60s)"
        kill $UNOSERVER_PID 2>/dev/null
        exit 1
    fi
    # Vérifie si le processus est mort entre temps
    if ! kill -0 $UNOSERVER_PID 2>/dev/null; then
        echo "❌ ERREUR: Le processus unoserver a crashé prématurément !"
        exit 1
    fi
    echo "   ... en attente ($ATTEMPTS/30)"
    sleep 2
done

echo "✅ unoserver est prêt ! Démarrage de Node.js..."
node dist/index.js