var request = require('./lib/request')
var scrape = require('./lib/scrape')

module.exports = function (username, password) {
  if (!(username && password)) {
    throw new Error('You must provide username and password.')    
  }

  request.USERNAME = username
  request.PASSWORD = password
  return scrape
}
