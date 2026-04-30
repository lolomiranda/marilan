CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cracha VARCHAR(100) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maquinas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  localizacao VARCHAR(255) NOT NULL,
  descricao TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ordens_servico (
  id INT AUTO_INCREMENT PRIMARY KEY,
  maquina_id INT NOT NULL,
  linha_lote VARCHAR(255) DEFAULT NULL,
  descricao_problema TEXT NOT NULL,
  operador_id INT NOT NULL,
  manutentor_id INT DEFAULT NULL,
  status ENUM('aberta', 'atribuida', 'em_andamento', 'concluida') NOT NULL DEFAULT 'aberta',
  prioridade ENUM('baixa', 'normal', 'alta') NOT NULL DEFAULT 'normal',
  motivo ENUM('Quebra', 'Set-up', 'Troca fer.', 'Produção', 'Pequenas paradas', 'Velocidade', 'Defeito', 'Programada', 'Gestão', 'Movimento operacionais', 'Organização', 'Logística', 'Medições e ajuste') NOT NULL,
  data_abertura DATETIME NOT NULL,
  data_atribuicao DATETIME DEFAULT NULL,
  data_inicio DATETIME DEFAULT NULL,
  data_conclusao DATETIME DEFAULT NULL,
  acao_realizada TEXT DEFAULT NULL,
  observacoes TEXT DEFAULT NULL,
  FOREIGN KEY (maquina_id) REFERENCES maquinas(id),
  FOREIGN KEY (operador_id) REFERENCES usuarios(id),
  FOREIGN KEY (manutentor_id) REFERENCES usuarios(id)
);
