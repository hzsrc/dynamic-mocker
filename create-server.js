//var opn = require('opn');

module.exports = function createServer(isHttps, port, onHandle){
    port = parseInt(port, 10)
    if(!isHttps){
        var http = require('http');
        http.createServer(onHandle).listen(port);
    }
    else{
        if(port=='80') port = 443;
        var http = require('https');
        var options = {
            key: fs.readFileSync('./ssl/server-key.pem'),
            ca: [fs.readFileSync('./ssl/ca-cert.pem')],
            cert: fs.readFileSync('./ssl/server-cert.pem')
        };
        http.createServer(options, onHandle).listen(port);
    }
    var url = "http"+(isHttps ? "s" : "")+"://localhost:" + port;
    console.log("Http server running at\n  => " + url + "/\n   " + "\nCTRL + C to shutdown");
    //opn(url)
}
