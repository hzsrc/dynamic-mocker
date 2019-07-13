import mockXhr from './xhr'

export default {
    setUpXHR(config) {
        window.XMLHttpRequest = mockXhr
    }
}
