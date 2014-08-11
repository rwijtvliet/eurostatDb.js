eurostatDb.js
=============

Retrieve and store data from eurostat's API.

Eurostat provides a wealth of information -- it's just pretty hard to get to and use. It provides the data over its [API](http://epp.eurostat.ec.europa.eu/portal/page/portal/sdmx_web_services/getting_started/rest_sdmx_2.1) in a very 'rich' xml format that is a bit too overwhelming for many uses. This library aims at making things easier for use in javascript web applications.


## Sample use
```js
db = eurostatDb();
db.initTable("demo_pjan", {FREQ: "A", AGE: "TOTAL"}, {startYear: 1995, endYear: 2015}, function () {//1
    db.fetchRst("demo_pjan", {SEX: "T", GEO:"NL"}, function (error, rst) {//2

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
* xml2json (https://github.com/abdmob/x2js) to convert xml into json
* taffydb (https://github.com/typicaljoe/taffydb) to store information

so be sure to include those. 

Also, the file `all_latest_ESTAT_references=none_detail=full.xml` which contains the dataflow names and descriptions, must be located in the `js/` directory.


## Suggestions

I'm always interested in feedback and suggestions. Please let me know what you think is good, or what could be better. Thanks!
