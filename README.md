eurostatDb.js
=============

Retrieve and store data from eurostat's API.

Eurostat provides a wealth of information -- it's just pretty hard to get to and use. It provides the data over its API in a very 'rich' xml format that is a bit too overwhelming for many uses. This library aims at making things easier for use in javascript web applications.


Usage 
-----

###In short
If I already know exactly what data I'm interacting with, I might do something like this:<br>

```js
db = eurostatDb();
db.addTable("demo_pjan", {FREQ: "A", AGE: "TOTAL"}, {startYear: 2000, endYear: 2015}, function () {//1
    db.fetchData("demo_pjan", {SEX:["T", "M", "F"], GEO:["NL", "BE", "LU"]}, function () {//2
        var data = db.getRst("demo_pjan", {SEX:"T", GEO:"NL"}, "TIME asec"); //3
        
        $("div#info").append("<h2>Total population in the Netherlands:</h2>");
        data.forEach(function(d) {$("div#info").append("<p>In " + d.TIME + ": " + d.OBS_VALUE + "</p>");}); //4
    });
});
```

What's happening here?<br>
Line 1 specifies the name of the dataflow that I'm interested in, and fixes some of its dimensions and the time period. That way, we always fetch annual data and age aggregates, from the time period between 2000 and 2015.<br>
Line 2 fetches some data for total, male, and female population of BeNeLux countries.<br>
Line 3 gets a specific record set that has total population for Netherlands, ordered by ascending year.<br>
Line 4 then uses this data to make a list.<br>
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
var dataflows;
db.fetchDfs("population", function (dfs) {dataflows = dfs;});
```
which turns the variable ```dataflows``` into an array of 244 dataflow objects:
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
var structure;
db.fetchDsd("demo_pjan", function (dsd) {structure = dsd;});
```
which, after a few moments, puts the following object into variable ```structure```:
```js
{
      name:"demo_pjan",
      dimensions:["FREQ","AGE","SEX","GEO","TIME_PERIOD"],
      concepts:  ["FREQ","AGE","SEX","GEO","TIME","INDICATORS","OBS_VALUE","OBS_STATUS","OBS_FLAG"],
      codelists:[
          {name:"AGE",codes:[{name:"TOTAL",descr:"Total"}, {name:"Y_LT1",descr:"Less than 1 year"}, {name:"Y1",descr:"1 year"},{name:"Y2",descr:"2 years"},{name:"Y3",descr:"3 years"},{name:"Y4",descr:"4 years"},{name:"Y5",descr:"5 years"},{name:"Y6",descr:"6 years"},{name:"Y7",descr:"7 years"},{name:"Y8",descr:"8 years"},{name:"Y9",descr:"9 years"},{name:"Y10",descr:"10 years"},{name:"Y11",descr:"11 years"},{name:"Y12",descr:"12 years"},{name:"Y13",descr:"13 years"},{name:"Y14",descr:"14 years"},{name:"Y15",descr:"15 years"},{name:"Y16",descr:"16 years"},{name:"Y17",descr:"17 years"},{name:"Y18",descr:"18 years"},{name:"Y19",descr:"19 years"},{name:"Y20",descr:"20 years"},{name:"Y21",descr:"21 years"},{name:"Y22",descr:"22 years"},{name:"Y23",descr:"23 years"},{name:"Y24",descr:"24 years"},{name:"Y25",descr:"25 years"},{name:"Y26",descr:"26 years"},{name:"Y27",descr:"27 years"},{name:"Y28",descr:"28 years"},{name:"Y29",descr:"29 years"},{name:"Y30",descr:"30 years"},{name:"Y31",descr:"31 years"},{name:"Y32",descr:"32 years"},{name:"Y33",descr:"33 years"},{name:"Y34",descr:"34 years"},{name:"Y35",descr:"35 years"},{name:"Y36",descr:"36 years"},{name:"Y37",descr:"37 years"},{name:"Y38",descr:"38 years"},{name:"Y39",descr:"39 years"},{name:"Y40",descr:"40 years"},{name:"Y41",descr:"41 years"},{name:"Y42",descr:"42 years"},{name:"Y43",descr:"43 years"},{name:"Y44",descr:"44 years"},{name:"Y45",descr:"45 years"},{name:"Y46",descr:"46 years"},{name:"Y47",descr:"47 years"},{name:"Y48",descr:"48 years"},{name:"Y49",descr:"49 years"},{name:"Y50",descr:"50 years"},{name:"Y51",descr:"51 years"},{name:"Y52",descr:"52 years"},{name:"Y53",descr:"53 years"},{name:"Y54",descr:"54 years"},{name:"Y55",descr:"55 years"},{name:"Y56",descr:"56 years"},{name:"Y57",descr:"57 years"},{name:"Y58",descr:"58 years"},{name:"Y59",descr:"59 years"},{name:"Y60",descr:"60 years"},{name:"Y61",descr:"61 years"},{name:"Y62",descr:"62 years"},{name:"Y63",descr:"63 years"},{name:"Y64",descr:"64 years"},{name:"Y65",descr:"65 years"},{name:"Y66",descr:"66 years"},{name:"Y67",descr:"67 years"},{name:"Y68",descr:"68 years"},{name:"Y69",descr:"69 years"},{name:"Y70",descr:"70 years"},{name:"Y71",descr:"71 years"},{name:"Y72",descr:"72 years"},{name:"Y73",descr:"73 years"},{name:"Y74",descr:"74 years"},{name:"Y75",descr:"75 years"},{name:"Y76",descr:"76 years"},{name:"Y77",descr:"77 years"},{name:"Y78",descr:"78 years"},{name:"Y79",descr:"79 years"},{name:"Y80",descr:"80 years"},{name:"Y81",descr:"81 years"},{name:"Y82",descr:"82 years"},{name:"Y83",descr:"83 years"},{name:"Y84",descr:"84 years"},{name:"Y85",descr:"85 years"},{name:"Y86",descr:"86 years"},{name:"Y87",descr:"87 years"},{name:"Y88",descr:"88 years"},{name:"Y89",descr:"89 years"},{name:"Y90",descr:"90 years"},{name:"Y91",descr:"91 years"},{name:"Y92",descr:"92 years"},{name:"Y93",descr:"93 years"},{name:"Y94",descr:"94 years"},{name:"Y95",descr:"95 years"},{name:"Y96",descr:"96 years"},{name:"Y97",descr:"97 years"},{name:"Y98",descr:"98 years"},{name:"Y99",descr:"99 years"},{name:"Y100",descr:"100 years"},{name:"Y101",descr:"101 years"},{name:"Y102",descr:"102 years"},{name:"Y103",descr:"103 years"},{name:"Y104",descr:"104 years"},{name:"Y105",descr:"105 years"},{name:"Y106",descr:"106 years"},{name:"Y107",descr:"107 years"},{name:"Y108",descr:"108 years"},{name:"Y109",descr:"109 years"},{name:"Y_OPEN",descr:"Open-ended age class"},{name:"UNK",descr:"Unknown"}]},
          {name:"FREQ","codes":[{name:"D",descr:"Daily"},{name:"W",descr:"Weekly"},{name:"Q",descr:"Quarterly"},{name:"A",descr:"Annual"},{name:"M",descr:"Monthly"},{name:"H",descr:"Semi-annual"}]},
          {name:"GEO","codes":[{name:"EU28",descr:"European Union (28 countries)"},{name:"EU27",descr:"European Union (27 countries)"},{name:"EA18",descr:"Euro area (18 countries)"},{name:"EA17",descr:"Euro area (17 countries)"},{name:"EA16",descr:"Euro area (16 countries)"},{name:"BE",descr:"Belgium"},{name:"BG",descr:"Bulgaria"},{name:"CZ",descr:"Czech Republic"},{name:"DK",descr:"Denmark"},{name:"DE",descr:"Germany (until 1990 former territory of the FRG)"},{name:"DE_TOT",descr:"Germany (including former GDR)"},{name:"EE",descr:"Estonia"},{name:"IE",descr:"Ireland"},{name:"EL",descr:"Greece"},{name:"ES",descr:"Spain"},{name:"FR",descr:"France"},{name:"FX",descr:"France (metropolitan)"},{name:"HR",descr:"Croatia"},{name:"IT",descr:"Italy"},{name:"CY",descr:"Cyprus"},{name:"LV",descr:"Latvia"},{name:"LT",descr:"Lithuania"},{name:"LU",descr:"Luxembourg"},{name:"HU",descr:"Hungary"},{name:"MT",descr:"Malta"},{name:"NL",descr:"Netherlands"},{name:"AT",descr:"Austria"},{name:"PL",descr:"Poland"},{name:"PT",descr:"Portugal"},{name:"RO",descr:"Romania"},{name:"SI",descr:"Slovenia"},{name:"SK",descr:"Slovakia"},{name:"FI",descr:"Finland"},{name:"SE",descr:"Sweden"},{name:"UK",descr:"United Kingdom"},{name:"EEA31",descr:"European Economic Area (EU-28 plus IS, LI, NO)"},{name:"EEA30",descr:"European Economic Area (EU-27 plus IS, LI, NO)"},{name:"EFTA",descr:"European Free Trade Association"},{name:"IS",descr:"Iceland"},{name:"LI",descr:"Liechtenstein"},{name:"NO",descr:"Norway"},{name:"CH",descr:"Switzerland"},{name:"ME",descr:"Montenegro"},{name:"MK",descr:"Former Yugoslav Republic of Macedonia, the"},{name:"RS",descr:"Serbia"},{name:"TR",descr:"Turkey"},{name:"AL",descr:"Albania"},{name:"AD",descr:"Andorra"},{name:"BY",descr:"Belarus"},{name:"BA",descr:"Bosnia and Herzegovina"},{name:"XK",descr:"Kosovo (under United Nations Security Council Resolution 1244/99)"},{name:"MD",descr:"Moldova"},{name:"MC",descr:"Monaco"},{name:"RU",descr:"Russia"},{name:"SM",descr:"San Marino"},{name:"UA",descr:"Ukraine"},{name:"AM",descr:"Armenia"},{name:"AZ",descr:"Azerbaijan"},{name:"GE",descr:"Georgia"}]},
          {name:"OBS_FLAG","codes":[{name:"f",descr:"forecast"},{name:"u",descr:"extremely unreliable data"},{name:"e",descr:"estimated value"},{name:"s",descr:"eurostat estimate"},{name:"b",descr:"break in series"},{name:"c",descr:"confidential"},{name:"r",descr:"revised value"},{name:"p",descr:"provisional value"},{name:"n",descr:"not significant"},{name:"i",descr:"see explanatory notes"}]},
          {name:"OBS_STATUS","codes":[{name:"na",descr:"not available"},{name:"-",descr:"not applicable or real zero or zero by default"},{name:"0",descr:"less than half of the unit used"}]},
          {name:"SEX","codes":[{name:"T",descr:"Total"},{name:"M",descr:"Males"},{name:"F",descr:"Females"}]}
      ]
}
```
Here, the ```dimensions``` property describes the "dimensions" for which values are needed in order to fetch data, and the ```concepts``` property describes the fields that might be present in that data.
Think of the ```dimensions``` as the input array, and the ```concepts``` as the output array. As we'll see in the next step, however, we don't need to specify the values of all input array elements each time we fetch data. Instead, we can "fix" some dimensions which are always the same.


####Step 3: Initialise local table
Let's prepare a table to hold data for this dataflow. If I am interested in all possible values for all dimensions, and in all time periods for which there is data, I do not "fix" any dimension here, nor do I specify a time period: 
```js
var myTbl;
db.addTable("demo_pjan", function (tbl) {myTbl = tbl;});
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


Before we continue, let's see what is different, if I know upfront that I'm only ever interested in the annual data, aggregated over ages, after the year 2000. In that case, I use two additional arguments:
```js
var myTbl;
db.addTable("demo_pjan", {FREQ:"A", AGE:"TOTAL"}, {startYear:2000}, function (tbl) {myTbl = tbl;});
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
I decide I'm not interested in age distribution, that annual data suffices, and that data from the last millennium do not interest me either, and so I stick to the latter table definition. 
Now, I want to make a comparison between the number of inhabitants of several countries. In order to get this data, I need to specify the values for the ```varDims``` elements, so in this case 
```SEX``` and ```GEO```. <br>
<br>
Short intermezzo: how do I even know what values I can pick? For this, there is a method: .codeListDict, used like this:
```js
db.codeListDict("demo_pjan", "SEX");
```
which returns
```js
{T:"Total",M:"Males",F:"Females"}
```
<br>
<br>
Back to fetching data. I'll get the data for Germany and France this time, and I might just as well get the numbers for male, female, and total. In the console:
```js
db.fetchData("demo_pjan", {GEO:["FR", "DE"], SEX:["T", "M", "F"]});
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
db.codeListDict("demo_pjan", "OBS_FLAG")["p"]
```
```js
"provisional value"
```

Or, say I want to get the total inhabitants data for the Netherlands, but only for when it was above 16 million:
```js
var data = db.getRst("demo_pjan", {SEX:"T", GEO:"NL", OBS_VALUE:{gt:16e6}}, "TIME asec");
```

There's more we can do, have a look in the documentation at the beginning of the ```eurostatDb.js``` file.



Suggestions
-----------
I'm always interested in feedback and suggestions. Please let me know what you think is good, or what could be better. Thanks!
