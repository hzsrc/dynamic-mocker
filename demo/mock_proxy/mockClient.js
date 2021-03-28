/* eslint-disable */

import mockClient from 'dynamic-mocker/lib/client.js'

var config = require('./config.js')

mockClient.setup(config, {
  '/api/_func': require('./root/api/_func.js'),
  '/api/_json': require('./root/api/_json.js'),
  '/api/attachment': require('./root/api/attachment.js'),
  '/api/delete/__DEFAULT': require('./root/api/delete/__DEFAULT.js'),
  '/api/img': require('./root/api/img.js'),
  '/api/token': require('./root/api/token.js')
})
