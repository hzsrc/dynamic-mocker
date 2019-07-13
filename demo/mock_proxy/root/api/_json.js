module.exports = {
    disabled: 0,
    delay: 2000,
    status: 200,
    headers: {
        server: 'dynamic-mocker',
        'set-cookie': 'foo=bar; path=/',
        'cache-control': 'no-cache'
    },
    body: {
        status: 0,
        delayed: '2 seconds',
        obj: {
            cfg: {
                o: {
                    buttons: [
                        {
                            id: 1,
                            title: '按钮1'
                        },
                        {
                            id: 2,
                            title: '按钮2'
                        }
                    ]
                }
            }
        },
        msg: ''
    }
}
