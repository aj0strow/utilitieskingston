var request = require('request')

var agent = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3)',
  'AppleWebKit/537.36 (KHTML, like Gecko)',
  'Chrome/35.0.1916.153 Safari/537.36',
].join(' ')

var headers = {
  'accept-encoding': 'gzip,deflate,sdch',
  'accept-language': 'en-US,en;q=0.8',
  'cache-control': 'max-age=0',
  'connection': 'keep-alive',
  'user-agent': agent,
}

var jar = request.jar()
var req = request.defaults({
  jar: jar,
  headers: headers,
})

module.exports = req
