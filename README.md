# Utilities Kingston

As of July 2014, `my.utilitieskingston.com` does not offer an api. So you need to scrape data for automated processes. The scraping process is a bit convoluted though.

```
$ npm install utilitieskingston
```

### Examples

Scrape My Time-Of-Use data in csv format for a given Account ID.

```javascript
var scrape = require('utilitieskingston')(username, password)

scrape(accountId, {
  from: lastWeek(), to: yesterday()
}, function (error, csv) {
  // handle error
  // parse csv
})
```

It comes with a command to get the csv for an account for the last week. Use the command to pipe from stdout.

```sh
$ npm install -g utilitieskingston
$ utilitieskingston ACCOUNT_ID -u USERNAME -p PASSWORD > test.csv
```

Alternatively you can export the `UTILITIESKINGSTON_USERNAME` and `UTILITIESKINGSTON_PASSWORD` environment variables. It will pick them up.

```sh
$ export UTILITIESKINGSTON_USERNAME=USERNAME
$ export UTILITIESKINGSTON_PASSWORD=PASSWORD
$ utilitieskingston ACCOUNT_ID > test.csv
```

The command writes info to stderr. Don't worry, that's not included in stdout csv.

### Notes

The portal is slow and unpredictable. It takes four sequential requests to actually get data, so even when it's up, nearly 30% of scrapes fail. When using in a background job, retry multiple times and set a very high timeout if necessary like twenty seconds. 

It only holds onto data for the last year, but sometimes data in the current month is unavailable as well. 

License **MIT**
