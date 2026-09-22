// Entrypoint for hosting environments (Waifly / Pterodactyl / cPanel)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const serverDist = path.join(__dirname, 'server', 'dist', 'index.js');
const clientDist = path.join(__dirname, 'dist', 'index.html');

// If project is not built yet (e.g. fresh clone on Waifly/Pterodactyl), build it automatically
if (!fs.existsSync(serverDist) || !fs.existsSync(clientDist)) {
  console.log('⚡ First run detected: Building client and server on hosting...');
  try {
    execSync('npm run build:all', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Build completed successfully!');
  } catch (err) {
    console.error('❌ Build failed during startup:', err);
    process.exit(1);
  }
}

// Start the production server
require('./server/dist/index.js');
