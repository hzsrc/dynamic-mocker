//var opn = require('opn');
var fs = require('fs')
var path = require('path')

module.exports = function createServer(isHttps, port, onHandle) {
    port = parseInt(port, 10)
    var server;
    if (!isHttps) {
        var http = require('http');
        server = http.createServer(onHandle).listen(port);
    } else {
        if (port == '80') port = 443;
        http = require('https');
        var options = {
            key: fs.readFileSync(path.resolve(__dirname, '../ssl/server.key')),
            ca: [fs.readFileSync(path.resolve(__dirname, '../ssl/ca.crt'))],
            cert: fs.readFileSync(path.resolve(__dirname, '../ssl/server.crt'))
        };
        server = http.createServer(options, onHandle).listen(port);
    }
    var url = 'http' + (isHttps ? 's' : '') + '://localhost:' + port;
    console.log('dynamic-mocker running at  => ' + url + '/\n   ' + '\nCTRL + C to shutdown');
    //opn(url)
    return server
}
