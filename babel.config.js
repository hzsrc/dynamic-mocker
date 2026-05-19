module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                corejs: '3',
                useBuiltIns: 'usage',
                modules: false,
                targets: (function () {
                    if (process.env.JEST_WORKER_ID) {
                        return { node: 'current', } //针对当前node版本进行编译，删除该行导致报错
                    } else {
                        return {
                            ie: 10,
                        }
                    }
                })(),
            }
        ]
    ],
    plugins: [],
    comments: false,
}
