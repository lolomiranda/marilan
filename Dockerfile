FROM node:18-alpine

# Instalar dependências globais se necessário
RUN apk add --no-cache mysql-client

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

# Expor portas
EXPOSE 3000 3001

# Comando para iniciar (usar um script ou supervisord)
CMD ["sh", "-c", "cd marilan-back && npm run dev & cd marilan-front && npm run dev & wait"]