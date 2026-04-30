FROM node:18-alpine

# Instalar MySQL server e client
RUN apk add --no-cache mysql mysql-client supervisor

# Copiar arquivos do projeto
COPY . /app
WORKDIR /app

# Instalar dependências do backend
WORKDIR /app/marilan-back
RUN npm install

# Instalar dependências do frontend
WORKDIR /app/marilan-front
RUN npm install

# Voltar para raiz
WORKDIR /app

# Criar diretório para MySQL
RUN mkdir -p /var/lib/mysql /var/run/mysqld && \
    chown -R mysql:mysql /var/lib/mysql /var/run/mysqld

# Inicializar MySQL
RUN mysql_install_db --user=mysql --datadir=/var/lib/mysql

# Copiar schema para init
COPY marilan-back/db/schema.sql /docker-entrypoint-initdb.d/

# Expor portas
EXPOSE 3000 3001 3306

# Comando para iniciar MySQL e serviços
CMD ["sh", "-c", "mysqld --user=mysql --datadir=/var/lib/mysql --socket=/var/run/mysqld/mysqld.sock --port=3306 --bind-address=0.0.0.0 & sleep 10 && node start.js"]