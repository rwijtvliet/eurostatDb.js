eurostatDb.js
=============

Retrieve and store data from eurostat's API.

Eurostat provides a wealth of information -- it's just pretty hard to get to and use. It provides the data over its API in a very 'rich' xml format that is a bit too overwhelming for many uses. This library aims at making things easier for use in javascript web applications.


Usage 
-----

###In short
If I already know exactly what data I'm interacting with, I might do something like this:
```js
db = eurostatDb();
db.addTable({name: "demo_pjan", fixDims: {FREQ: "A", AGE: "TOTAL"}, timePeriod: {startYear: 2000, endYear: 2010}}, function () {
    db.fetchData({name: "demo_pjan", varDimFilter: {SEX:["T", "M", "F"], GEO:["EU28"]}});   //total, male, and female population of EU28.
    db.fetchData({name: "demo_pjan", varDimFilter: {SEX:["T"], GEO:["BE", "NL", "LU"]}});   //total population of Belgium, Netherlands, and Luxembourg.
});
```
The first line specifies the name of the dataflow that I'm interested in, and fixes some of its dimensions and the time period.
The second and third line then fetch and store some specific data. 



Typically, there are 4 steps in interacting with eurostat data.

  1) Get list of 'data flows' (=tables) that are available.<br>
  2) Get 'data structure definition' for a certain data flow.<br>
  3) Initialise local table(s) to hold retrieved information.<br>
  4) Fill local table(s) and use the data.<br>
