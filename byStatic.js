var fs = require('fs');
var getConfig = require('./getConfig.js')
var config, proxy;
var mime = require('mime')//引入mime模块


function byStatic(req, res, next) {
    config = getConfig()
    var urlPart = url.parse(req.url);
    if (config.static) {
        var pathname = urlPart.pathname;
        // if (config.mapFile) {
        //     pathname = config.mapFile(pathname, req)
        // }
        var staticFile = path.join(config.static.path, pathname + '.js');
        if (fs.existsSync(staticFile)) {
            staticByFile(req, res, staticFile);
        }
        else {
            next()
        }
    }

}

function staticByFile(req, res, staticFile) {
    fs.readFile(staticFile, (err, data) => {
        if (err) {
            throw err                                                                              //阻止程序继续往下运行
        }

        res.writeHead(200, {
            'Content-type': mime.getType(staticFile) //通过后缀名指定mime类型
        });
        res.end(data);
    })
}

module.exports = byStatic