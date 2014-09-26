eurostatDb.js
=============

Retrieve and store data from eurostat's API.

Eurostat provides a wealth of information -- it's just pretty hard to get to and use. It provides the data over its [API](http://epp.eurostat.ec.europa.eu/portal/page/portal/sdmx_web_services/getting_started/rest_sdmx_2.1) in a very 'rich' xml format that is a bit too overwhelming for many uses. This library aims at making things easier for use in javascript web applications.

The code has been rewritten to use promises instead of callbacks, so that there are now 2 versions:
* v0+: (deprecated) uses callbacks
* v1+: uses promises
There is no compatibility between the versions. The use of v1+ is encouraged.


## Sample use
v1+
```js
db = eurostatDb();
db.tblQinit("demo_pjan", {FREQ: "A", AGE: "TOTAL"}, {startYear: 1995, endYear: 2015}); //1
db.rstQ("demo_pjan", {SEX: "T", GEO: "NL"}, "TIME ASEC") //2
    .then(function (rst) {
        $("div#info").prepend("<h2>Total population in the Netherlands:</h2>");
        rst.forEach(function (r) {$("ul").append("<li>In " + r.TIME + ": " + r.OBS_VALUE + "</li>");});//3
    })
    .catch(function (e) {alert(e);});
```
v0+ (deprecated):
```js
db = eurostatDb();
db.initTable("demo_pjan", {FREQ: "A", AGE: "TOTAL"}, {startYear: 1995, endYear: 2015}, function () {//1
    db.fetchRst("demo_pjan", {SEX: "T", GEO:"NL"}, "TIME ASEC", function (error, rst) {//2

        $("div#info").append("<h2>Total population in the Netherlands:</h2>");
        if (error) {$("div#info").append("<p>Error: " + error.message + "</p>"); return;}
        rst.forEach(function(r) {$("div#info").append("<p>In " + r.TIME + ": " + r.OBS_VALUE + "</p>");}); //3
    });
});
```
Resulting web page, and other examples, are found in the [wiki pages](https://github.com/rwijtvliet/eurostatDb.js/wiki). Check it out!

## Reference

Found in the wiki's [library reference](https://github.com/rwijtvliet/eurostatDb.js/wiki/Library-reference).


## Dependencies

eurostatDb.js depends on 
* jQuery (http://jquery.com/)
* q (https://github.com/kriskowal/q) to provide promises
* xml2json (https://github.com/abdmob/x2js) to convert xml into json
* taffydb (https://github.com/typicaljoe/taffydb) to store information

so be sure to include those. 

Also, the file `all_latest_ESTAT_references=none_detail=full.xml` which contains the dataflow names and descriptions, must be located in the `js/` directory.


## Suggestions

I'm always interested in feedback and suggestions. Please let me know what you think is good, or what could be better. Thanks!
