const fs = require('fs');
const os = require('os');
const path = require('path');

function getBrowserExecutablePath() {
  // 1. Se foi explicitado no .env, usa ele
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const platform = os.platform();

  // 2. Busca o Chrome instalado nativamente no Windows
  if (platform === 'win32') {
    const winPaths = [
      path.join(process.env['PROGRAMFILES'] || 'C:\\Program Files', 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(process.env['LOCALAPPDATA'] || '', 'Google\\Chrome\\Application\\chrome.exe'),
      // Fallback para o Microsoft Edge (já vem nativo em todo Windows 10/11 e usa motor Chromium)
      path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Microsoft\\Edge\\Application\\msedge.exe'),
      path.join(process.env['PROGRAMFILES'] || 'C:\\Program Files', 'Microsoft\\Edge\\Application\\msedge.exe')
    ];

    for (const p of winPaths) {
      if (p && fs.existsSync(p)) return p;
    }
  }

  // 3. Busca no Linux (Debian, Ubuntu, Alpine, Docker)
  if (platform === 'linux') {
    const linuxPaths = [
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/snap/bin/chromium'
    ];

    for (const p of linuxPaths) {
      if (fs.existsSync(p)) return p;
    }
  }

  // 4. Busca no macOS
  if (platform === 'darwin') {
    const macPaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
    ];

    for (const p of macPaths) {
      if (fs.existsSync(p)) return p;
    }
  }

  // Se não encontrar nenhum localmente, retorna undefined para o Puppeteer tentar o cache padrão
  return undefined;
}

module.exports = { getBrowserExecutablePath };