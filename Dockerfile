FROM nginx:alpine

# Copiar la configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos de la aplicación
COPY . /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"] 