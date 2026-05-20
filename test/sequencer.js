const TestSequencer = require('@jest/test-sequencer').default

class CustomSequencer extends TestSequencer {
    sort(tests) {
        const copyTests = Array.from(tests)
        return copyTests.sort((a, b) => {
            const order = ['test.test.js', 'client.test.js']
            return order.indexOf(a.path) - order.indexOf(b.path)
        })
    }
}

module.exports = CustomSequencer
