FROM nginx:alpine

# Installation de gettext pour avoir envsubst
RUN apk add --no-cache gettext

# Dossier de travail Nginx
WORKDIR /usr/share/nginx/html

# Copie des fichiers de l'app
COPY index.html style.css app.js ./

# Script d'entrée pour injecter les variables d'env
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Port exposé
EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
