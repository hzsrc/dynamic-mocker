# dyn-mocker
A dynamic "mock + proxy" server for front-end development.
Please see the [sample project](https://github.com/hzsrc/dyn-mocker-sample) in source code.

# Usage

## 1. install
	npm i dyn-mocker -D
####or
	yarn add dyn-mocker --dev

## 2. configuration
	Make a mock directory, and copy the mock-config.js into it.
	Make a root directory as the root of mock files.
	--mock
	----root
	----mock-config.js
	--package.json

## 3. configuration
Edit the mock-config.js options:


### mockEnabled 
	[true] to enable it
### mockPath
	the root path of mock files
### proxyTarget
	If no mock file for a url request, the http pipe will be reversely proxied to this target server. If this is empty, then won't proxy.
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
	    "mock": "node ./node_modules/dyn-mocker ./mock/mock-config.js"
	}
## 5. Start mock server
	npm run mock

## 6. Create yaml files for dyn-mocker in the mock/root directory
###Simple yml file:
	# dyn-mocker use json eval mode, but not JSON.parse
	disabled: 0
	body: |
	  {
	    status:0,
	    data:{
	        id:1,
	        tag:'This is a simple json data',
	        name:'张三丰',
	    }
	  }
###Yml file with javascript functions:
	disabled: 0
	body: |
	  function(query, post, header, request){
	    //output log in the node console
	    console.log('post data: ' + post)
	    
	    //use queryString in url
	    //use key word 'this', which point to the yaml root object
	    if (query.id == '1') return ok(this.case_1);
	    
	    //use http postData
	    if (post && post.type =='test') return ok(this.case_2);
	    
	    //use http headers
	    if (header["content-type"] == "text/txt") return ok("Hello,txt")
	    
	    //use request info
	    return ok({default:'no data', url: request.url})
	
	    function ok(d){
	      return {status:0,data:d}
	    }
	  }
	case_1: |
	  {id:1,b:2}
	case_2: |
	  {a:3,b:"test"}

###Another yml:

	disabled: 0
	status: 200
	headers: |
	  function(query, post, header, request){
	    var r = {}
	    if(eval(this.checkFn)(post, header)) {
	      r['set-cookie'] = 'a=b; Max-Age=30000; path=/';
	    }
	    else{
	      r['set-cookie'] = 'a=b; Max-Age=0; path=/';
	    }
	    return r;
	  }
	body: |
	  function(query, post, header, request){
	    return  {
	      status: eval(this.checkFn)(post, header) ? 0 : 1,
	      data: '', 
	      msg: 'Invalid account or password!'
	    }
	  }
	checkFn: |
	  (function(post, header){
	    if( post.password == '123' || post.password == '' ) return true;
	  })