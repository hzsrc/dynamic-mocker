var fs = require('fs');
var getConfig = require('./getConfig.js')
var config;
var mime = require('mime')//引入mime模块
var url = require('url')
var path = require('path')

function byStatic(req, res, next) {
    config = getConfig()
    var urlPart = url.parse(req.url);
    if (config.static) {
        var pathname = urlPart.pathname;
        var staticFile = path.join(config.static.path, pathname);
        if (fs.existsSync(staticFile)) {
            if (fs.statSync(staticFile).isDirectory()) {
                staticFile = path.join(staticFile, urlPart.index || 'index.html');
            }
            staticByFile(req, res, staticFile);
        } else {
            next()
        }
    } else {
        next()
    }
}

function staticByFile(req, res, staticFile) {
    fs.readFile(staticFile, (err, data) => {
        if (err) {
            console.error(err)
            res.writeHead(500, {});
            res.end('Internal error');
        } else {
            res.writeHead(200, {
                'Content-type': mime.getType(staticFile) //通过后缀名指定mime类型
            });
            res.end(data);
        }
    })
}

module.exports = byStatic
