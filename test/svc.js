const spawn = require('child_process').spawn
var cps = []

exports.start = function start(callback) {
    console.log('start services..')
    var npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

    var hasRun = 0
    getRun('mock')
    getRun('proxy80')
    getRun('static')

    function getRun(name) {
        cps.push(spawnExec(npm, ['run', name], {
            onData(str) {
                console.log(str.toString())
                if (str.indexOf('running at') > -1) {
                    hasRun++
                    if (hasRun >= cps.length) {
                        callback()
                    }
                }
            },
            onErr(str) {
                callback(new Error(str))
            }
        }))
    }
}
exports.close = function (callback) {
    console.log('kill services..')
    var exited = 0
    cps.forEach(childProcess => {
        childProcess.on('close', (code, signal) => {
            exited++
            if (exited === cps.length) {
                callback()
            }
        });
        // childProcess.kill('SIGKILL')
        childProcess.stdin.write('closeServer')
    })
}

function spawnExec(cmd, args, { onData, onErr }) {
    var cp = spawn(cmd, args)
    cp.stdout.on('data', onData);

    cp.stderr.on('data', onErr);
    cp.on('error', onErr)

    return cp
}

// exports.start(t => {
// })
// exports.close(t => {
// })
