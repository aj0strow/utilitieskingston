# Utilities Kingston

Scrapes CSV by Account ID for `my.utilitieskingston.com` time of use data. 

```
var scrape = require('utilitieskingston')(username, password)

scrape(accountId, {
  from: lastWeek(), to: yesterday()
}, function (error, csv) {
  // handle error
  // parse csv
})
```

The portal is slow and unpredictable. It takes four sequential requests to actually get data, so even when it's up, nearly 30% of scrapes fail. When using in a background job, retry multiple times and set a very high timeout if necessary like twenty seconds. 

It only holds onto data for the last year, but sometimes data in the current month is unavailable as well. 
