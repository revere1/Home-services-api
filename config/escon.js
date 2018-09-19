var elasticsearch = require('C:/Users/Somesh/node_modules/elasticsearch');

var auth = 'YOUR_USERNAME:YOUR_PASSWORD';
var port = 9200;
var protocol = 'http';
var hostUrls = [
    'localhost'
];

var hosts = hostUrls.map(function(host) {
    return {
        protocol: protocol,
        host: host,
        port: port,
        auth: auth
    };
});

var client = new elasticsearch.Client({
    hosts: hosts
});

client.ping({
    requestTimeout: 30000
}, function(error) {
    if (error) {
        console.trace('Error:', error);
    } else {
        console.log('Elastic Server Connected!');
    }
    
});
module.exports = client;