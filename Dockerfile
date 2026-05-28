# ETAPA 1: Construcción (Build)
# Usamos Node para compilar los archivos de Vue/Quasar
FROM node:18-alpine as build-stage

WORKDIR /app

# Copiamos package.json primero para aprovechar la caché de Docker
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Compilamos la aplicación para producción
RUN npx quasar build

# ETAPA 2: Producción (Nginx)
# Usamos un servidor web ligero para servir los archivos HTML/JS generados
FROM nginx:stable-alpine as production-stage

# Copiamos los archivos compilados de la etapa anterior a la carpeta de Nginx
# NOTA: Quasar por defecto compila en /dist/spa. 
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html

# Exponemos el puerto 80
EXPOSE 80

# Iniciamos Nginx
CMD ["nginx", "-g", "daemon off;"]