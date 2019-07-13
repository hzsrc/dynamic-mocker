import mockXhr from './xhr'

export default {
    setUpXHR(config) {
        window.XMLHttpRequest = mockXhr
        mockXhr.Mock = {
            _mocked: {

            },
            mock: function () {

            }
        }
    }
}
