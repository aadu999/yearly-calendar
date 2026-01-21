const serverless = require('serverless-http');
const app = require('../../src/server');

module.exports.handler = serverless(app, {
    binary: ['image/png', 'image/jpeg', 'font/ttf']
});
