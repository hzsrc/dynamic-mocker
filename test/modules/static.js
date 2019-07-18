const http = require('../http')


test('static html', () => {
  return http('get', 'http://localhost/').then(res => {
    expect(res).toMatch(/<img src="a\.gif">/)
  })
})

test('static js', () => {
  return http('get', 'http://localhost/app.js', { type: 'test' }).then(res => {
    expect(res).toMatch(/alert\('hello~'\)/)
  })
})
