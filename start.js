const { spawn } = require('child_process');

// Iniciar backend
const backend = spawn('npm', ['run', 'dev'], {
  cwd: './marilan-back',
  stdio: 'inherit',
  shell: true
});

// Iniciar frontend
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: './marilan-front',
  stdio: 'inherit',
  shell: true
});

// Manter o processo rodando
process.on('SIGINT', () => {
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exit(0);
});