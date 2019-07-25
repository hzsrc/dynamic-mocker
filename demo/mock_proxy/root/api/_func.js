module.exports = {
    disabled: 0,
    body: function (query, post, header, request) {
    //output log in the node console
        console.log('post.type: ' + post.type)

        //use queryString in url
        //use key word 'this', which point to the yaml root object
        if (query.id == '1') return ok(this.case_1);

        //use http postData
        if (post && post.type == 'test') return ok(this.case_2);

        //use http headers
        if (header['content-type'] == 'text/txt') return ok('Hello,txt')

        //use request info
        return ok({ default: 'no data', url: request.url })

        function ok(d) {
            return { status: 0, data: d }
        }
    },
    case_1: {
        id: 1,
        b: 2
    },
    case_2: {
        a: 3,
        b: 'test'
    }
}
