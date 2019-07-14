// import mockClient from '../../../lib/client'
import mockClient from '../../../src/client'
import config from '../../mock_proxy/config'

mockClient.setUp(config, function importJs(path) {
    return import('../../mock_proxy/root' + path + '.js')
})
