# dynamic-mocker
A dynamic "mock + proxy" server for front-end development.
Please see the [sample project](https://github.com/hzsrc/dynamic-mocker-sample) in source code.

![image](https://raw.githubusercontent.com/hzsrc/dynamic-mocker-sample/master/dynamic-mocker.png)
![image](https://raw.githubusercontent.com/hzsrc/dynamic-mocker-sample/master/dynamic-mocker-en.png)

# Live demos

````bash
git clone https://github.com/hzsrc/dynamic-mocker.git
cd dynamic-mocker
npm install

# mock & proxy
npm run mock

#proxy
npm run proxy80

#static
npm run static

````
# Usage

## 1. install
	npm i dynamic-mocker -D
#### or
	yarn add dynamic-mocker --dev

## 2. configuration
	Make a mock directory, and copy the mock-config.js into it.
	Make a root directory as the root of mock files.
	--mock
	----root
	----mock-config.js
	--package.json

## 3. configuration
### sample:
	const config = {
		mockEnabled: true,
		mockPath: ['mock/root', 'mock/root-old'], //模拟文件根目录
		proxyTarget: 'http://your-backend-server.com', //后台接口服务地址（代理目标），为空表示不代理。可以是个函数：function(urlPart){} 
		isHttps: false, //是否https
		port: 8085, //端口
		checkPath: function (urlPath) { //urlPath校验函数，返回true表示需要进行mock处理，为false直接走代理
			return true
		},
		beforeResponse: function (respData, req) { //数据返回前的回调钩子，respData包含status、headers、body属性
			respData.headers['Access-Control-Allow-Origin'] = req.headers['origin'] || req.headers['Origin'];
			respData.headers['Access-Control-Allow-Credentials'] = 'true';
			respData.headers['Access-Control-Max-Age'] = '600';
			respData.headers['Access-Control-Allow-Headers'] = 'Content-Type,Content-Length,Authorization,Access,X-Requested-With,yxt-token';
			//respData.headers["Access-Control-Allow-Methods"] = "PUT,POST,GET,DELETE,PATCH,OPTIONS";
	
			respData.headers['P3P'] = 'CP="CAO PSA OUR"';
		}
	}
	module.exports = config;
###

Edit the mock-config.js options:
### mockEnabled
	[true] to enable it
### mockPath
	the root path[s] of mock files. String or array of string.
### proxyTarget
	If there is no mock data file for a url request, the http pipe will be reversely proxied to this target server. If this is empty, then won't proxy.
### isHttps
	[true] for https
### port
	Port of the mock server
### checkPath
	A function to check a url which needs to mock or not. eg:
	function (urlPath) {
	    return urlPath.match(/\/api\//);
	}
### beforeResponse
	A function to do customized job before responding.respData contains [status、headers、body] properties. eg:
	function (respData, req) {
	    respData.headers["Access-Control-Allow-Origin"] = req.headers["origin"] || req.headers["Origin"];
	    respData.headers["Access-Control-Allow-Credentials"] = "true";
	    respData.headers["Access-Control-Allow-Headers"] = "Content-Type,Content-Length,Authorization,Access,X-Requested-With,yxt_token";
	    //respData.headers["Access-Control-Allow-Methods"] = "PUT,POST,GET,DELETE,PATCH,OPTIONS";
	}

## 4. Add script to package.json
	"scripts": {
		...
	    "mock": node -e "require('dynamic-mocker').checkStart('./mock/mock-config.js')"
	}
## 5. Start mock server
	npm run mock

## 6. Create js files for dynamic-mocker in the mock/root directory
### Simple js file:
	// dynamic-mocker use json eval mode, but not JSON.parse
	module.exports = {
		disabled: 0,
        delay: 1000, // delay ms to response
		status: 200,
		"headers": {
			"server": "dynamic-mocker",
			"set-cookie": "foo=bar; path=/",
			"cache-control": "no-cache"
		},
		"body": {
			"status": 0,
			"obj": {
				"cfg": {
					"o": {
						"buttons": [
							{
								"id": 1,
								"title": "按钮1"
							},
							{
								"id": 2,
								"title": "按钮2"
							}
						]
					}
				}
			},
			"msg": ""
		}
	}
### Js file with functions:
    module.exports = {
        disabled: 0,
        body: function (query, post, header, request) {
            //output log in the node console
            console.log('post data: ' + post)

            //use queryString in url
            //use key word 'this', which point to the yaml root object
            if (query.id == '1') return ok(this.case_1);

            //use http postData
            if (post && post.type == 'test') return ok(this.case_2);

            //use http headers
            if (header["content-type"] == "text/txt") return ok("Hello,txt")

            //use request info
            return ok({default: 'no data', url: request.url})

            function ok(d) {
                return {status: 0, data: d}
            }
        },
        case_1: {
            id: 1,
            b: 2
        },
        case_2: {
            a: 3,
            b: "test"
        }
    }


### Another js:
    module.exports = {
        disabled: 0,
        status: 200,
        headers: function (query, post, header, request) {
            var r = {}
            if (post.rememberPwd && this.checkFn(post, header)) {
                process._cookiev = 'a=b' + (+new Date);
                r['set-cookie'] = process._cookiev + '; Max-Age=30000; path=/';
            }
            else {
                process._cookiev = '';
                r['set-cookie'] = process._cookiev + '; Max-Age=0; path=/';
            }
            return r;
        },
        body: function (query, post, header, request) {
            return {
                status: this.checkFn(post, header) ? 0 : 1,
                data: '', returnValue: 'token-xxxxxxx',
                msg: '用户名密码错误'
            }
        },
        checkFn: function (post, header) {
            if (post.password == '123456' || post.password == '') return true;

            if (post.useRemembered && post.password == '_fakepwd') {
                var cookie = header['Cookie'] || header['cookie'];
                return cookie && cookie.indexOf(process._cookiev) > -1
            }
        }
    }
