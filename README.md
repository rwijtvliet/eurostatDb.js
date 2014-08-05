eurostatDb.js
=============

Retrieve and store data from eurostat's API.

Eurostat provides a wealth of information -- it's just pretty hard to get to and use. It provides the data over its API in a very 'rich' xml format that is a bit too overwhelming for many uses. This library aims at making things easier for use in javascript web applications.


Usage 
-----

###In short
If I already know exactly what data I'm interacting with, I might do something like in this sample code:<br>

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
More in found in the wiki, check it out!


Suggestions
-----------
I'm always interested in feedback and suggestions. Please let me know what you think is good, or what could be better. Thanks!
