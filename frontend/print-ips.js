const os = require('os');
const interfaces = os.networkInterfaces();

console.log('\x1b[36m%s\x1b[0m', '\n🚀 Available Network Addresses:');
console.log('----------------------------');

for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      console.log(`  ➜  Network: \x1b[32mhttp://${iface.address}:7001\x1b[0m`);
    }
  }
}
console.log('\x1b[36m%s\x1b[0m', '----------------------------\n');
