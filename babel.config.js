const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID

module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                corejs: 3,
                useBuiltIns: 'usage',
                modules: isTest ? 'auto' : false,
                debug: process.env.NODE_ENV === 'development',
                targets: isTest
                    ? { node: 'current' }
                    : { ie: 10 },
            }
        ],
    ],
    plugins: [
    ],
    comments: false,
}
