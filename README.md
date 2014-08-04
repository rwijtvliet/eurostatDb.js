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
    db.fetchRst("demo_pjan", {SEX: "T", GEO:"NL", OBS_VALUE:{gt:16e6}}, function (error, rst) {//2

        $("div#info").append("<h2>Total population in the Netherlands (years with >16 million):</h2>");
        if (error) {$("div#info").append("<p>Error: " + error.message + "</p>"); return;}
        rst.forEach(function(r) {$("div#info").append("<p>In " + r.TIME + ": " + r.OBS_VALUE + "</p>");}); //3
    });
});
```

What's happening here?<br>
Line 1 specifies the name of the dataflow that I'm interested in, and fixes some of its dimensions and the time period. That way, I always fetch annual data and age aggregates, from the time period between 1995 and 2015.<br>
Line 2 fetches data for total population of Netherlands above 16million.<br>
Line 3 then uses this data to make a list.<br>
<br>

###In long
Typically, there are 5 steps in interacting with (eurostat) data.

  1) Get list of 'data flows' (=tables) that are available.<br>
  2) Get 'data structure definition' for a certain data flow.<br>
  3) Initialise local table(s) to hold retrieved information.<br>
  4) Fill local table(s).<br>
  5) Use the data.<br>
  
Suppose I'm interested in population data.
Let's start by creating a database object. In the console, I type:
```js
db = eurostatDb();
```

####Step 1: Get list of dataflows
First, I get a list of dataflows that could be relevant, by searching for "population".<br>
```js
var myDfs;
db.fetchDfs("population", function (error, dfs) {myDfs = dfs;});
```
which turns the variable ```myDfs``` into an array of 244 dataflow objects:
```js
[
    ...,
    {
        name: "crim_pris",
        descrs: ["Prison population", "Zahl der Gefangenen", "Personnes détenues"]
    },
    {
        name: "crim_pris_hist",
        descrs: ["Prison population: historical data 1987-2000", "Zahl der Gefangenen: Zeitreihe 1987-2000", "Personnes détenues : données historiques 1987-2000"]
    },
    {
        name: "demo_pjan",
        descrs: ["Population on 1 January by age and sex", "Bevölkerung am 1. Januar nach Alter und Geschlecht", "Population au 1er janvier par âge et sexe"]
    },
    {
        name: "demo_pjanbroad",
        descrs: ["Population on 1 January by broad age group and sex", "Bevölkerung am 1. Januar nach breite Altersgruppe und Geschlecht", "Population au 1er janvier par grand groupe d'âges et sexe"]
    },
    ...
]
```

####Step 2: Get data structure definition
Dataflow "demo_pjan" sounds like it might fit my needs. Let's see how its data it structured. In the console, I type:
```js
var myDsd;
db.fetchDsd("demo_pjan", function (error, dsd) {myDsd = dsd;});
```
which, after a few moments, sets the variable ```myDsd``` to the following object:
```js
{
      name:"demo_pjan",
      dimensions:["FREQ","AGE","SEX","GEO","TIME_PERIOD"],
      concepts:  ["FREQ","AGE","SEX","GEO","TIME","INDICATORS","OBS_VALUE","OBS_STATUS","OBS_FLAG"],
      codelists:[
          {name:"AGE",codes:[{name:"TOTAL",descr:"Total"}, {name:"Y_LT1",descr:"Less than 1 year"}, {name:"Y1",descr:"1 year"},...,{name:"Y108",descr:"108 years"},{name:"Y109",descr:"109 years"},{name:"Y_OPEN",descr:"Open-ended age class"},{name:"UNK",descr:"Unknown"}]},
          {name:"FREQ","codes":[{name:"D",descr:"Daily"},{name:"W",descr:"Weekly"},{name:"Q",descr:"Quarterly"},{name:"A",descr:"Annual"},{name:"M",descr:"Monthly"},{name:"H",descr:"Semi-annual"}]},
          {name:"GEO","codes":[{name:"EU28",descr:"European Union (28 countries)"},{name:"EU27",descr:"European Union (27 countries)"},{name:"EA18",descr:"Euro area (18 countries)"},{name:"EA17",descr:"Euro area (17 countries)"},{name:"EA16",descr:"Euro area (16 countries)"},{name:"BE",descr:"Belgium"},{name:"BG",descr:"Bulgaria"},{name:"CZ",descr:"Czech Republic"},{name:"DK",descr:"Denmark"},{name:"DE",descr:"Germany (until 1990 former territory of the FRG)"},{name:"DE_TOT",descr:"Germany (including former GDR)"},{name:"EE",descr:"Estonia"},{name:"IE",descr:"Ireland"},{name:"EL",descr:"Greece"},{name:"ES",descr:"Spain"},{name:"FR",descr:"France"},{name:"FX",descr:"France (metropolitan)"},{name:"HR",descr:"Croatia"},{name:"IT",descr:"Italy"},{name:"CY",descr:"Cyprus"},{name:"LV",descr:"Latvia"},{name:"LT",descr:"Lithuania"},{name:"LU",descr:"Luxembourg"},{name:"HU",descr:"Hungary"},{name:"MT",descr:"Malta"},{name:"NL",descr:"Netherlands"},{name:"AT",descr:"Austria"},{name:"PL",descr:"Poland"},{name:"PT",descr:"Portugal"},{name:"RO",descr:"Romania"},{name:"SI",descr:"Slovenia"},{name:"SK",descr:"Slovakia"},{name:"FI",descr:"Finland"},{name:"SE",descr:"Sweden"},{name:"UK",descr:"United Kingdom"},{name:"EEA31",descr:"European Economic Area (EU-28 plus IS, LI, NO)"},{name:"EEA30",descr:"European Economic Area (EU-27 plus IS, LI, NO)"},{name:"EFTA",descr:"European Free Trade Association"},{name:"IS",descr:"Iceland"},{name:"LI",descr:"Liechtenstein"},{name:"NO",descr:"Norway"},{name:"CH",descr:"Switzerland"},{name:"ME",descr:"Montenegro"},{name:"MK",descr:"Former Yugoslav Republic of Macedonia, the"},{name:"RS",descr:"Serbia"},{name:"TR",descr:"Turkey"},{name:"AL",descr:"Albania"},{name:"AD",descr:"Andorra"},{name:"BY",descr:"Belarus"},{name:"BA",descr:"Bosnia and Herzegovina"},{name:"XK",descr:"Kosovo (under United Nations Security Council Resolution 1244/99)"},{name:"MD",descr:"Moldova"},{name:"MC",descr:"Monaco"},{name:"RU",descr:"Russia"},{name:"SM",descr:"San Marino"},{name:"UA",descr:"Ukraine"},{name:"AM",descr:"Armenia"},{name:"AZ",descr:"Azerbaijan"},{name:"GE",descr:"Georgia"}]},
          {name:"OBS_FLAG","codes":[{name:"f",descr:"forecast"},{name:"u",descr:"extremely unreliable data"},{name:"e",descr:"estimated value"},{name:"s",descr:"eurostat estimate"},{name:"b",descr:"break in series"},{name:"c",descr:"confidential"},{name:"r",descr:"revised value"},{name:"p",descr:"provisional value"},{name:"n",descr:"not significant"},{name:"i",descr:"see explanatory notes"}]},
          {name:"OBS_STATUS","codes":[{name:"na",descr:"not available"},{name:"-",descr:"not applicable or real zero or zero by default"},{name:"0",descr:"less than half of the unit used"}]},
          {name:"SEX","codes":[{name:"T",descr:"Total"},{name:"M",descr:"Males"},{name:"F",descr:"Females"}]}
      ]
}
```
Here, the ```dimensions``` property describes the fields for which values are needed in order to fetch data, and the ```concepts``` property describes the fields that might be present in that data.
Think of the ```dimensions``` as the input array, and the ```concepts``` as the output array. As we'll see in the next step, however, we don't need to specify the values of all input array elements each time we fetch data. Instead, we can "fix" some dimensions which are always the same.

The final property, ```codelists```, describes the values that the dimensions can be given when fetching data. In order to make it easier using them, there is a method ```.codelistDict``` that returns a dictionary object with code:description pairs, like so: 
```js 
db.codeListDict("demo_pjan", "SEX");
```
which returns ```{T:"Total",M:"Males",F:"Females"}```.


####Step 3: Initialise local table
Let's prepare a table to hold data for this dataflow. If I am interested in all possible values for all dimensions, and in all time periods for which there is data, I do not "fix" any dimension here, nor do I specify a time period: 
```js
var myTbl;
db.initTable("demo_pjan", function (error, tbl) {myTbl = tbl;});
```
After this, the value of ```myTbl``` is:
```js
{
    name: "demo_pjan",
    fixDims: ["TIME_PERIOD"],
    fixDimFilter: {TIME_PERIOD: ""},
    varDims: ["FREQ", "AGE", "SEX", "GEO"],
    fields:  ["FREQ", "AGE", "SEX", "GEO", "TIME", "INDICATORS", "OBS_VALUE", "OBS_STATUS", "OBS_FLAG"],
    dsd: {...}
}
```
Notice how the elements in the ```dimensions``` property of the DSD, above, have been divided over the properties ```fixDims``` and ```varDims```. The latter shows the "variable dimensions" for which I need to specify values every time I want to fetch data. The ```fields``` property describes the fields that might be stored in the table. Compare with the ```concepts``` property of the DSD.<br><br>


Before we continue, let's see what is different, if I know upfront that I'm only ever interested in the annual data, aggregated over ages, after the year 2000. In that case, I use two additional arguments in calling the function:
```js
var myTbl;
db.initTable("demo_pjan", {FREQ:"A", AGE:"TOTAL"}, {startYear:2000}, function (error, tbl) {myTbl = tbl;});
```
And ```myTbl``` equals:
```js
{
    name: "demo_pjan",
    fixDims: ["FREQ","AGE","TIME_PERIOD"],
    fixDimFilter: {FREQ:"A",AGE:"TOTAL",TIME_PERIOD:"/?startPeriod=2000"},
    varDims: ["SEX", "GEO"],
    fields: ["SEX","GEO","TIME","INDICATORS","OBS_VALUE","OBS_STATUS","OBS_FLAG"],
    dsd : {...}
}
```
Notice how, compared to the previous table, this one has 2 elements less in the ```varDims``` array: in order to fetch data for this table, I no longer need to specify the values for the ```FREQ``` and ```AGE``` dimensions every time -- as they are fixed and known. This is also why the same 2 elements are missing from the ```fields``` array: they are no longer stored in every record in the database.



####Step 4: Fetch data
I decide I'm not interested in age distribution, that annual data suffices, and that data from the last millennium do not interest me either, and so I stick to the latter table definition. Now, I want to make a comparison between the number of inhabitants of several countries. In order to get this data, I need to specify the values for the ```varDims``` elements, so in this case  ```SEX``` and ```GEO```. <br>
<br>
I decide to fetch the data for Germany, France and the Netherlands this time, and I might just as well get the numbers for male, female, and total. In the console:
```js
db.fetchData("demo_pjan", {GEO:["FR", "DE", "NL"], SEX:["T", "M", "F"]});
```
When the data fetching is done, I have the data that I wanted and from which I can take, analyse and display pieces.
 
 
####Step 5: Query data
Now, I want to display a list of the number of female inhabitants of France since 2000. I'm lucky, because that's exactly part of the data I've just fetched. Let's get it out, in chronological order:
```js
var data = db.getRst("demo_pjan", {SEX:"F", GEO:"FR"}, "TIME asec");
```
The contents of variable ```data```:
```js
[{SEX:"F", GEO:"FR", TIME:2000, OBS_VALUE:31161369, ___id:"T000002R000099", ___s:true},
 {SEX:"F", GEO:"FR", TIME:2001, OBS_VALUE:31400989, ___id:"T000002R000098", ___s:true},
 ...
 {SEX:"F", GEO:"FR", TIME:2013, OBS_VALUE:33814204, OBS_FLAG:"p", ___id:"T000002R000086", ___s:true}
] 
```
Hmmm... I wonder what that ```"p"``` value means on the 2013 record...
```js
db.codelistDict("demo_pjan", "OBS_FLAG")["p"]
```
returns
```js
"provisional value"
```

Or, say I want to get the total inhabitants data for the Netherlands, but only for when it was above 16 million:
```js
var data = db.getRst("demo_pjan", {SEX:"T", GEO:"NL", OBS_VALUE:{gt:16e6}}, "TIME asec");
```

Note that with ```.getRst()``` can only get recordsets that have already been fetched. If I want to get recordsets of data that may or may not have already been fetched, I must use the asynchronous ```.fetchRst()``` as was done in the shorter sample above.

####Concluding

There's more we can do, have a look in the documentation at the beginning of the ```eurostatDb.js``` file.



Suggestions
-----------
I'm always interested in feedback and suggestions. Please let me know what you think is good, or what could be better. Thanks!
