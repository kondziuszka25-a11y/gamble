// Entrypoint for shared web hosting environments (cPanel, DirectAdmin, CloudLinux Passenger)
// It boots the compiled Express server
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
require('./server/dist/index.js');
