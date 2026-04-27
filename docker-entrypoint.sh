#!/bin/sh
set -e

# Valeurs par défaut si non définies
NAS_HOST=${NAS_HOST:-"nas.local"}
CHECK_INTERVAL=${CHECK_INTERVAL:-"30000"}
FETCH_TIMEOUT=${FETCH_TIMEOUT:-"3000"}

# Génération du fichier config.js final
cat <<EOF > /usr/share/nginx/html/config.js
/**
 * NAS Portal - Configuration (Générée par Docker)
 */
const CONFIG = {
  NAS_HOST: '${NAS_HOST}',
  CHECK_INTERVAL: ${CHECK_INTERVAL},
  FETCH_TIMEOUT: ${FETCH_TIMEOUT},
  ICON_BASE_URL: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/'
};
EOF

echo "Config.js généré avec NAS_HOST=${NAS_HOST}"

exec "$@"
