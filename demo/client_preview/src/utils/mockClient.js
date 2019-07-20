/* eslint-disable */

import mockClient from 'dynamic-mocker/lib/client'
import config from './../../../mock_proxy/config.js'

mockClient.setup(config, pathname => import('./../../../mock_proxy/root' + pathname + '.js'))
