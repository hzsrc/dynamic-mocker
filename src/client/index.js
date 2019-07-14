import mockXhr from './xhr'

export default {
    setUp(config) {
        window.XMLHttpRequest = mockXhr
        mockXhr.Mock = {
            _mocked: {

            },
            mock: function () {

            }
        }
    }
}
