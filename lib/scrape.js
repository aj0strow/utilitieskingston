// dependencies

var moment = require('moment')
var cheerio = require('cheerio')
var findWhere = require('lodash').findWhere
var util = require('util')

// libs

var request = require('./request')

module.exports = scrape

// scrape('#######', { from: date, to: date }, cb)
function scrape (accountId, options, cb) {
  if (!accountId) {
    return cb(new Error('No account id.'))
  }

  if (!options.from) {
    return cb(new Error('No "from" option.'))
  }

  if (!options.to) {
    return cb(new Error('No "to" option.'))
  }

  console.error('(%s) login', accountId)
  login(function (e) {
    if (e) { return cb(e) }

    console.error('(%s) find account', accountId)
    getAccounts(function (e,  accounts) {
      if (e) { return cb(e) }
      var account = findWhere(accounts, { accountId: +accountId })

      if (!account) {
        return cb(new Error('No account ' + accountId))
      }

      var path = account.url

      console.error('(%s) select account', accountId)
      selectAccount(path, options, function (e, path) {
        if (e) { return cb(e) }

        console.error('(%s) download csv', accountId)
        download(path, options, function (e, text) {
          if (e) { return cb(e) }

          var days = moment(options.to).diff(options.from, 'days')
          var csv = text.split(/\r?\n/gm).slice(0, days + 3).join('\n')

          console.error('(%s) done', accountId)
          return cb(null, csv)
        })
      })
    })
  })
}

// actions

function login (cb) {
  request({
    method: 'POST',
    url: url('/app/capricorn?para=index'),
    form: {
      accessCode: request.USERNAME,
      password: request.PASSWORD
    },
  }, function (e, res) {
    if (e) { return cb(e) }
    if (res.statusCode != 200) {
      return cb(new Error(res.body))
    }
    return cb()
  })
}

function getAccounts (cb) {
  request({
    method: 'POST',
    url: url('/app/capricorn'),
    form: {
      'para': 'selectAccount',
      'userAction': 'search',
      'switchAccount': 'Switch Account'
    }
  }, function (e, res) {
    if (e) { return cb(e) }
    if (res.statusCode != 200) {
      return cb(new Error(res.body))
    }
    var accounts = []

    var $ = cheerio.load(res.body)
    var table = $('table table table table table')
    table.find('tr').each(function () {
      var row = {}
      $(this).find('td').each(function (i) {
        var text = $(this).text().trim()
        if (i == 1) {
          row.url = $(this).find('a').attr('href')
          row.accountId = +text
        } else if (i == 2) {
          row.meterId = text
        } else if (i == 3) {
          row.address = text
        }
      })
      if (row.url) { accounts.push(row) }
    })

    return cb(null, accounts)
  })
}

function selectAccount (path, options, cb) {
  request({
    method: 'GET',
    url: url(path)
  }, function (e, res) {
    if (e) { return cb(e) }
    if (res.statusCode != 200) {
      return cb(new Error(res.body))
    }
    request({
      method: 'POST',
      url: url('/app/capricorn?para=greenButtonDownload'),
      form: form(options.from, options.to),
    }, function (e, res) {
      if (e) { return cb(e) }
      if (res.statusCode != 200) {
        return cb(new Error(res.body))
      }
      var $ = cheerio.load(res.body)
      var action = $('form[name="downloadData2Spreadsheet"]').attr('action')
   
      return cb(null, action)
    })
    
  })
}

function download (path, options, cb) {
  request({
    method: 'POST',
    url: url(path),
    form: form(options.from, options.to),
  }, function (e, res) {
    if (e) { return cb(e) }
    if (res.statusCode != 200) {
      return cb(new Error(res.body))
    }
    var $ = cheerio.load(res.body)
    var title = $('title').text()
    if (title == 'Utilities Kingston :: Cannot Process Request') {
      return cb(new Error(res.body))
    }
    cb(null, res.body)
  })
}

// helpers

function url (path) {
  return 'https://my.utilitieskingston.com' + path
}

function form (fromDate, toDate) {
  var from = moment(fromDate)
  var to = moment(toDate)
  return {
    para: 'greenButtonDownload',
    downloadConsumption: 'Y', // comment out for XLS
    userAction: '',
    hourlyOrDaily: 'Hourly',

    GB_iso_fromDate: from.format("YYYY-MM-DD"),
    GB_fromDate: from.format("DD/MM/YYYY"),
    GB_day_from: from.format("DD"),
    GB_month_from: from.format("MM"),
    GB_year_from: from.format("YYYY"),

    GB_iso_toDate: to.format("YYYY-MM-DD"),
    GB_toDate: to.format("DD/MM/YYYY"),
    GB_day_to: to.format("DD"),
    GB_month_to: to.format("MM"),
    GB_year_to: to.format("YYYY"),
  }
}
