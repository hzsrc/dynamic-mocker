/* eslint-disable */

import mockClient from '../../../../src/client'
import config from './../../../mock_proxy/config.js'

mockClient.setup(config, {
  '/api/_func': require('../../../mock_proxy/root/api/_func.js'),
  '/api/_json': require('../../../mock_proxy/root/api/_json.js'),
  '/api/attachment': require('../../../mock_proxy/root/api/attachment.js'),
  '/api/delete/__DEFAULT': require('../../../mock_proxy/root/api/delete/__DEFAULT.js'),
  '/api/img': require('../../../mock_proxy/root/api/img.js'),
  '/api/token': require('../../../mock_proxy/root/api/token.js')
})
