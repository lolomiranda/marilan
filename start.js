const { spawn } = require('child_process');

// Função para executar comando em sequência
function runCommand(command, args, cwd, callback) {
  const child = spawn(command, args, {
    cwd: cwd,
    stdio: 'inherit',
    shell: true
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.error(`Command failed: ${command} ${args.join(' ')} in ${cwd}`);
      process.exit(1);
    }
    callback();
  });
}

// Primeiro, rodar seed no backend
runCommand('npm', ['run', 'seed'], './marilan-back', () => {
  // Depois iniciar backend
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
});