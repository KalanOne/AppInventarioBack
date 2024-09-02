FROM postgres:16.4

# Configura la zona horaria
ENV TZ=America/Mexico_City

# Crea el directorio para los respaldos
RUN mkdir -p /var/lib/postgresql/backup