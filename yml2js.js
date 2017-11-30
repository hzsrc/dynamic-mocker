var path = require('path'), fs = require('fs');
var yaml = require('js-yaml');

var root = path.resolve('./mock/root');
readDir(root, yml2js);

function readDir(dir, callback) {
    for (var file of fs.readdirSync(dir)) {
        var fn = path.resolve(dir, file);
        if (fs.statSync(fn).isDirectory()) {
            readDir(fn, callback)
        }
        else {
            callback(fn);
        }
    }
}


function yml2js(file) {
    if (path.extname(file) == '.yml') {
        try {
            var ymlData = yaml.load(fs.readFileSync(file)) || {};
            Object.keys(ymlData).forEach(prop => {
                ymlData [prop] = tryParse(ymlData[prop]);
            })
        }
        catch (e) {
            console.error("yaml error: " + file + '\n' + e.message);
            return
        }
        var json = toJSON(ymlData);
        json = 'module.exports = ' + json.replace(/"(\w+)":/g, '$1:');
        var fn = file.slice(0, file.length - 4) + '.js';
        if (fs.existsSync(fn)) fs.unlinkSync(fn);
        svnMove(file, fn);
        fs.writeFileSync(fn, json)

    }
}

function svnMove(src, dest, callback) {
    var cmd = 'svn move "' + src + '" "' + dest + '"';
    var execSync = require('child_process').execSync;
    execSync(cmd);
}

function tryParse(str) {
    try {
        return eval('(' + str + ')')
    } catch (e) {
        return str;
    }
}

function toJSON(obj) {
    var s = '{\n';
    Object.keys(obj).forEach(prop => {
        if (s.length > 2) {
            s += ',\n'
        }
        s += '    "' + prop + '": ';
        var val = tryParse(obj[prop]);
        if (typeof val == 'function') {
            s += val.toString().replace(/\n/g, '\n    ');
        }
        else
            s += JSON.stringify(val, null, 4).replace(/\n/g, '\n    ');
    })
    return s + '\n}\n'
}