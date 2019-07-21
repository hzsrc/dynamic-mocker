module.exports = {
  disabled: 0,
  headers: {},
  body: function (query, post, headers, req) {
    return {
      status: 200,
      url: req.url,
      method: req.method,
      data: 'successfully deleted: ' + query.ThisUrlPart,
    }
  }
}
