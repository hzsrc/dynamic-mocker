module.exports = {
    transform: {
        '^.+\\.(js|jsx|mjs)$': ['babel-jest', { configFile: './babel.config.js', envName: 'test' }],
    },
    moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'mjs'],
    testEnvironment: 'node',
    transformIgnorePatterns: [],
    testMatch: ['**/test/**/*.test.js'],
    testSequencer: '<rootDir>/test/sequencer.js',
}
