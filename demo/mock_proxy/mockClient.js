/* eslint-disable */

import mockClient from 'dynamic-mocker/lib/client'
import config from './config.js'

mockClient.setup(config, pathname => import('./root' + pathname + '.js'))
