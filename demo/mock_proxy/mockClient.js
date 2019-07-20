/* eslint-disable */

/* IFTRUE_isPreview */

import mockClient from 'dynamic-mocker/lib/client'
import config from './config.js'

mockClient.setup(config, pathname => import('./root' + pathname + '.js'))

/* FITRUE_isPreview */
