//本文件模拟根目录的响应数据（类似index.html的作用）

module.exports = {
    disabled: 0,
    headers: {
        'Content-Type': 'text/html'
    },
    body: function (query, post) {
        return `
<html>
<body>
    <h5>Mock</h5>
    <table>
        <tr>
            <td><button onclick="ajax('get', '/api/_func')">mock: get</button></td>
            <td>HTTP GET</td>
        </tr>
        <tr>
            <td><button onclick="ajax('post', '/api/_json', {type:'test'})">mock: post, delay</button></td>
            <td>HTTP POST with delayed</td>
        </tr>
        <tr>
            <td><button onclick="ajax('post', '/api/delete/' + Math.random())">mock: delete, pattern url</button></td>
            <td>HTTP DELETE with pattern url: '/api/delete/:id'</td>
        </tr>
        <tr>
            <td><img src="/api/img"/></td>
            <td>Image</td>
        </tr>
        <tr>
            <td><a href="api/attachment">download</a></td>
            <td>Attachment</td>
        </tr>
    </table>
    
    
    <hr/>
    <h5>Proxy</h5>
    <table>
        <tr>
            <td><button onclick="ajax('get', '/s?wd=dynamic-mocker', '', 'text')">proxy to baidu search</button></td>
            <td>Proxy to https://www.baidu.com</td>
        </tr>
        <tr>
            <td><button onclick="ajax('get', '/users/hzsrc/starred')">proxy to github</button></td>
            <td>Proxy to https://api.github.com</td>
        </tr>
    </table>
    <hr/>
    <textarea id="ret" rows="26" style="width: 100%"></textarea>
    <script>
        function ajax(method, url, data, type){
            var ret = document.getElementById('ret')
            ret.value = 'loading...'
            if(data) {
                data = JSON.stringify(data)
            }
            return fetch(url, {method, data}).then(res=> {
                  return res[type || 'json']()
            }).then(json => {
                ret.value = typeof json === 'string' ? json : JSON.stringify(json, null, 4)
            }).catch(t => {
                ret.value = t
            })
        }
    </script>
</body>
</html>`
    }
}
