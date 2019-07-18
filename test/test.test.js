const svc = require('./svc')


beforeAll(svc.start)
afterAll(svc.close)

//require('./modules/mock')()
// require('./modules/proxy')
// require('./modules/static')
require('./modules/client')
