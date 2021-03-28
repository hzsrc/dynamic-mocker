const svc = require('./svc')


beforeAll(svc.start)
afterAll(svc.close)

require('./modules/mock-http').default()
require('./modules/proxy-https')
require('./modules/static')
