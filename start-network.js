const { exec } = require('child_process');
const os = require('os');

// Get local IP
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const ip = getLocalIP();
console.log(`🚀 Starting React app on network...`);
console.log(`📍 Local: http://localhost:3000`);
console.log(`📍 Network: http://${ip}:3000`);
console.log(`\n📱 For mobile: http://${ip}:3000`);

// Start the app
exec('set HOST=0.0.0.0&& set PORT=3000&& npm start', (error, stdout, stderr) => {
  if (error) {
    console.log(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`Stderr: ${stderr}`);
    return;
  }
  console.log(stdout);
});