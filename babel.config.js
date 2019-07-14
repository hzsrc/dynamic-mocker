module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                corejs: '3',
                useBuiltIns: 'usage',
                modules: false,
                targets: {
                    node: 'current', //针对当前node版本进行编译，删除该行可能导致报错
                },
            }
        ]
    ],
    plugins: [
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-transform-runtime',
    ],
    comments: false,
}
