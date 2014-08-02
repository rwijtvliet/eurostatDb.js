
//In short:
db = eurostatDb();
db.addTable("demo_pjan", {FREQ: "A", AGE: "TOTAL"}, {startYear: 2000, endYear: 2015}, function () {//1
    db.fetchData("demo_pjan", {SEX:["T", "M", "F"], GEO:["NL", "BE", "LU"]}, function () {//2
        var data = db.getRst("demo_pjan", {SEX:"T", GEO:"NL"}, "TIME asec"); //3

        $("div#info").append("<h2>Total population in the Netherlands:</h2>");
        data.forEach(function(d) {$("div#info").append("<p>In " + d.TIME + ": " + d.OBS_VALUE + "</p>");}); //4
    });
});
//What's happening here?
//1: Create a table for the dataflow "demo_pjan".
//   Fix the dimensions "FREQ" and "AGE" so that we always fetch annual data and age aggregates.
//   Also fix the time period to always fetch data between 2000 and 2015.
//2: Fetch "demo_pjan" data for total, male, and female population of BeNeLux countries.
//3: Get record set that has 'total' population for Netherlands, ordered by ascending year.
//4: Make a list of the values that were found.






//Example 1: no prior knowledge
//  I'm trying to get and use population data. How do I go about it?
/*
var db = eurostatDb();


//  1.1: Get names and descriptions of relevant dataflows.
//  First, I get a list of dataflows that could be relevant, by searching for "population".
db.fetchDfs("population", function (dfs) {
    console.log(JSON.stringify(dfs, null, 2));
});
//  This outputs array with 244 dataflow objects:
//[
//    ...,
//    {
//        "name": "crim_pris",
//        "descrs": ["Prison population", "Zahl der Gefangenen", "Personnes détenues"]
//    },
//    {
//        "name": "crim_pris_hist",
//        "descrs": ["Prison population: historical data 1987-2000", "Zahl der Gefangenen: Zeitreihe 1987-2000", "Personnes détenues : données historiques 1987-2000"]
//    },
//    {
//        "name": "demo_pjan",
//        "descrs": ["Population on 1 January by age and sex", "Bevölkerung am 1. Januar nach Alter und Geschlecht", "Population au 1er janvier par âge et sexe"]
//    },
//    {
//        "name": "demo_pjanbroad",
//        "descrs": ["Population on 1 January by broad age group and sex", "Bevölkerung am 1. Januar nach breite Altersgruppe und Geschlecht", "Population au 1er janvier par grand groupe d'âges et sexe"]
//    },
//    ...
//]


//  1.2: Get data structure definition of a certain dataflow.
//  Dataflow "demo_pjan" sound like it might fit my needs. Let's see how its data structure is defined.
db.fetchDsd("demo_pjan", function (dsd) {
    console.log(JSON.stringify(dsd));
});
//  This outputs:
//{
//      "name":"demo_pjan",
//      "dimensions":["FREQ","AGE","SEX","GEO","TIME_PERIOD"],
//      "concepts":  ["FREQ","AGE","SEX","GEO","TIME","INDICATORS","OBS_VALUE","OBS_STATUS","OBS_FLAG"],
//      "codelists":[
//          {"name":"AGE","codes":[{"name":"TOTAL","descr":"Total"}, {"name":"Y_LT1","descr":"Less than 1 year"}, {"name":"Y1","descr":"1 year"},{"name":"Y2","descr":"2 years"},{"name":"Y3","descr":"3 years"},{"name":"Y4","descr":"4 years"},{"name":"Y5","descr":"5 years"},{"name":"Y6","descr":"6 years"},{"name":"Y7","descr":"7 years"},{"name":"Y8","descr":"8 years"},{"name":"Y9","descr":"9 years"},{"name":"Y10","descr":"10 years"},{"name":"Y11","descr":"11 years"},{"name":"Y12","descr":"12 years"},{"name":"Y13","descr":"13 years"},{"name":"Y14","descr":"14 years"},{"name":"Y15","descr":"15 years"},{"name":"Y16","descr":"16 years"},{"name":"Y17","descr":"17 years"},{"name":"Y18","descr":"18 years"},{"name":"Y19","descr":"19 years"},{"name":"Y20","descr":"20 years"},{"name":"Y21","descr":"21 years"},{"name":"Y22","descr":"22 years"},{"name":"Y23","descr":"23 years"},{"name":"Y24","descr":"24 years"},{"name":"Y25","descr":"25 years"},{"name":"Y26","descr":"26 years"},{"name":"Y27","descr":"27 years"},{"name":"Y28","descr":"28 years"},{"name":"Y29","descr":"29 years"},{"name":"Y30","descr":"30 years"},{"name":"Y31","descr":"31 years"},{"name":"Y32","descr":"32 years"},{"name":"Y33","descr":"33 years"},{"name":"Y34","descr":"34 years"},{"name":"Y35","descr":"35 years"},{"name":"Y36","descr":"36 years"},{"name":"Y37","descr":"37 years"},{"name":"Y38","descr":"38 years"},{"name":"Y39","descr":"39 years"},{"name":"Y40","descr":"40 years"},{"name":"Y41","descr":"41 years"},{"name":"Y42","descr":"42 years"},{"name":"Y43","descr":"43 years"},{"name":"Y44","descr":"44 years"},{"name":"Y45","descr":"45 years"},{"name":"Y46","descr":"46 years"},{"name":"Y47","descr":"47 years"},{"name":"Y48","descr":"48 years"},{"name":"Y49","descr":"49 years"},{"name":"Y50","descr":"50 years"},{"name":"Y51","descr":"51 years"},{"name":"Y52","descr":"52 years"},{"name":"Y53","descr":"53 years"},{"name":"Y54","descr":"54 years"},{"name":"Y55","descr":"55 years"},{"name":"Y56","descr":"56 years"},{"name":"Y57","descr":"57 years"},{"name":"Y58","descr":"58 years"},{"name":"Y59","descr":"59 years"},{"name":"Y60","descr":"60 years"},{"name":"Y61","descr":"61 years"},{"name":"Y62","descr":"62 years"},{"name":"Y63","descr":"63 years"},{"name":"Y64","descr":"64 years"},{"name":"Y65","descr":"65 years"},{"name":"Y66","descr":"66 years"},{"name":"Y67","descr":"67 years"},{"name":"Y68","descr":"68 years"},{"name":"Y69","descr":"69 years"},{"name":"Y70","descr":"70 years"},{"name":"Y71","descr":"71 years"},{"name":"Y72","descr":"72 years"},{"name":"Y73","descr":"73 years"},{"name":"Y74","descr":"74 years"},{"name":"Y75","descr":"75 years"},{"name":"Y76","descr":"76 years"},{"name":"Y77","descr":"77 years"},{"name":"Y78","descr":"78 years"},{"name":"Y79","descr":"79 years"},{"name":"Y80","descr":"80 years"},{"name":"Y81","descr":"81 years"},{"name":"Y82","descr":"82 years"},{"name":"Y83","descr":"83 years"},{"name":"Y84","descr":"84 years"},{"name":"Y85","descr":"85 years"},{"name":"Y86","descr":"86 years"},{"name":"Y87","descr":"87 years"},{"name":"Y88","descr":"88 years"},{"name":"Y89","descr":"89 years"},{"name":"Y90","descr":"90 years"},{"name":"Y91","descr":"91 years"},{"name":"Y92","descr":"92 years"},{"name":"Y93","descr":"93 years"},{"name":"Y94","descr":"94 years"},{"name":"Y95","descr":"95 years"},{"name":"Y96","descr":"96 years"},{"name":"Y97","descr":"97 years"},{"name":"Y98","descr":"98 years"},{"name":"Y99","descr":"99 years"},{"name":"Y100","descr":"100 years"},{"name":"Y101","descr":"101 years"},{"name":"Y102","descr":"102 years"},{"name":"Y103","descr":"103 years"},{"name":"Y104","descr":"104 years"},{"name":"Y105","descr":"105 years"},{"name":"Y106","descr":"106 years"},{"name":"Y107","descr":"107 years"},{"name":"Y108","descr":"108 years"},{"name":"Y109","descr":"109 years"},{"name":"Y_OPEN","descr":"Open-ended age class"},{"name":"UNK","descr":"Unknown"}]},
//          {"name":"FREQ","codes":[{"name":"D","descr":"Daily"},{"name":"W","descr":"Weekly"},{"name":"Q","descr":"Quarterly"},{"name":"A","descr":"Annual"},{"name":"M","descr":"Monthly"},{"name":"H","descr":"Semi-annual"}]},
//          {"name":"GEO","codes":[{"name":"EU28","descr":"European Union (28 countries)"},{"name":"EU27","descr":"European Union (27 countries)"},{"name":"EA18","descr":"Euro area (18 countries)"},{"name":"EA17","descr":"Euro area (17 countries)"},{"name":"EA16","descr":"Euro area (16 countries)"},{"name":"BE","descr":"Belgium"},{"name":"BG","descr":"Bulgaria"},{"name":"CZ","descr":"Czech Republic"},{"name":"DK","descr":"Denmark"},{"name":"DE","descr":"Germany (until 1990 former territory of the FRG)"},{"name":"DE_TOT","descr":"Germany (including former GDR)"},{"name":"EE","descr":"Estonia"},{"name":"IE","descr":"Ireland"},{"name":"EL","descr":"Greece"},{"name":"ES","descr":"Spain"},{"name":"FR","descr":"France"},{"name":"FX","descr":"France (metropolitan)"},{"name":"HR","descr":"Croatia"},{"name":"IT","descr":"Italy"},{"name":"CY","descr":"Cyprus"},{"name":"LV","descr":"Latvia"},{"name":"LT","descr":"Lithuania"},{"name":"LU","descr":"Luxembourg"},{"name":"HU","descr":"Hungary"},{"name":"MT","descr":"Malta"},{"name":"NL","descr":"Netherlands"},{"name":"AT","descr":"Austria"},{"name":"PL","descr":"Poland"},{"name":"PT","descr":"Portugal"},{"name":"RO","descr":"Romania"},{"name":"SI","descr":"Slovenia"},{"name":"SK","descr":"Slovakia"},{"name":"FI","descr":"Finland"},{"name":"SE","descr":"Sweden"},{"name":"UK","descr":"United Kingdom"},{"name":"EEA31","descr":"European Economic Area (EU-28 plus IS, LI, NO)"},{"name":"EEA30","descr":"European Economic Area (EU-27 plus IS, LI, NO)"},{"name":"EFTA","descr":"European Free Trade Association"},{"name":"IS","descr":"Iceland"},{"name":"LI","descr":"Liechtenstein"},{"name":"NO","descr":"Norway"},{"name":"CH","descr":"Switzerland"},{"name":"ME","descr":"Montenegro"},{"name":"MK","descr":"Former Yugoslav Republic of Macedonia, the"},{"name":"RS","descr":"Serbia"},{"name":"TR","descr":"Turkey"},{"name":"AL","descr":"Albania"},{"name":"AD","descr":"Andorra"},{"name":"BY","descr":"Belarus"},{"name":"BA","descr":"Bosnia and Herzegovina"},{"name":"XK","descr":"Kosovo (under United Nations Security Council Resolution 1244/99)"},{"name":"MD","descr":"Moldova"},{"name":"MC","descr":"Monaco"},{"name":"RU","descr":"Russia"},{"name":"SM","descr":"San Marino"},{"name":"UA","descr":"Ukraine"},{"name":"AM","descr":"Armenia"},{"name":"AZ","descr":"Azerbaijan"},{"name":"GE","descr":"Georgia"}]},
//          {"name":"OBS_FLAG","codes":[{"name":"f","descr":"forecast"},{"name":"u","descr":"extremely unreliable data"},{"name":"e","descr":"estimated value"},{"name":"s","descr":"eurostat estimate"},{"name":"b","descr":"break in series"},{"name":"c","descr":"confidential"},{"name":"r","descr":"revised value"},{"name":"p","descr":"provisional value"},{"name":"n","descr":"not significant"},{"name":"i","descr":"see explanatory notes"}]},
//          {"name":"OBS_STATUS","codes":[{"name":"na","descr":"not available"},{"name":"-","descr":"not applicable or real zero or zero by default"},{"name":"0","descr":"less than half of the unit used"}]},
//          {"name":"SEX","codes":[{"name":"T","descr":"Total"},{"name":"M","descr":"Males"},{"name":"F","descr":"Females"}]}
//      ]
// }


//  1.3: Add table to hold data.
//  Let's prepare a table that doesn't 'fix' any dimension.
db.addTable("demo_pjan", {}, {}, function (tbl) {
    console.log(JSON.stringify(tbl));
});
//  This outputs the table:
//{
//    "name": "demo_pjan",
//    "fixDims": {"TIME_PERIOD": ""},
//    "varDims": ["FREQ", "AGE", "SEX", "GEO"],
//    "fields": ["FREQ", "AGE", "SEX", "GEO", "TIME", "INDICATORS", "OBS_VALUE", "OBS_STATUS", "OBS_FLAG"],
//    "dsd": {...}
//}
//  It shows, which fields might all be present in the data that is fetched.
//  It also shows which are the 'variable dimensions' for which I need to specify values, in order to fetch data.


//  1.4: Fetch data.
//  I'd like to add the annual population data for France and Germany, of all ages, for both males and females.
db.fetchData("demo_pjan", {FREQ:["A"], GEO:["FR", "DE"], AGE:["TOTAL"], SEX:["M", "F"]}, function (record) {
    console.log(JSON.stringify(record));
});
//  This outputs a few arrays like this:
//[
//    {   "AGE": "TOTAL",   "SEX": "M",   "GEO": "FR",   "FREQ": "A",   "TIME": 2013,   "OBS_VALUE": 31764615,   "OBS_FLAG": "p",    "___id": "T000002R000002",   "___s": true },
//    {   "AGE": "TOTAL",   "SEX": "M",   "GEO": "FR",   "FREQ": "A",   "TIME": 2012,   "OBS_VALUE": 31616281,   "OBS_FLAG": "b",    "___id": "T000002R000003",   "___s": true },
//    ...
//    {   "AGE": "TOTAL",   "SEX": "M",   "GEO": "FR",   "FREQ": "A",   "TIME": 1960,   "OBS_VALUE": null,       "OBS_STATUS": "na", "___id": "T000002R000055",   "___s": true }
//]


//  1.5: Use data.
//  Finally, I'd like to use this data, for example to display in a table.
/*db.getRst("demo_pjan", {})//TODO




//  Useful functions:
//  If I don't know which values are accepted for a certain field or dimension, I can get the code list like this:
db.codeList("demo_pjan", "GEO");
//  and the same goes for the list of dimensions:
db.dimensions("demo_pjan");
//  , the list of variable and fixed dimensions:
db.varDims("demo_pjan");
db.fixDims("demo_pjan");
//  , and the list of table fields:
db.fields("demo_pjan");
//  All these functions return part of the dsd or tbl object, as shown under 1.2 and 1.3. Note that the latter 3 can only
//  be used as soon as the table has been initialised, whereas the former 2 can be used as soon as the dsd has been fetched.





//If I already know exactly what data I'm interacting with, I might do something like this:
//
db = eurostatDb();
db.addTable("demo_pjan", {FREQ: "A", AGE: "TOTAL"}, {startYear: 2000, endYear: 2010}, function () {
    db.fetchData("demo_pjan", {SEX:["T", "M", "F"], GEO:["EU28"]});   //total, male, and female population of EU28.
    db.fetchData("demo_pjan", {SEX:["T"], GEO:["BE", "NL", "LU"]});   //total population of Belgium, Netherlands, and Luxembourg.
});
//The first line specifies the name of the dataflow that I'm interested in, and fixes some of its dimensions and the time period.
//The second and third line then fetch and store some specific data.




db.addTable({name: "demo_pjan", fixDims: {FREQ: "A", AGE: "TOTAL"}, timePeriod: {startYear: 2000, endYear: 2010}}, function (tbl) {
    console.log(JSON.stringify(tbl, null, 4));
});
//Note thate I didn't specifically fetch the data structure definition, but this is done automatically. Also note that I've fixed the
//"FREQ" and "AGE" dimensions. These will no longer be stored in the database, and are therefore absent in the 'varDims' and 'fields' properties of the table object.
//The output:
//{
//    "name": "demo_pjan",
//    "fixDims": ["FREQ", "AGE", "TIME_PERIOD"],
//    "fixDimFilter": {"FREQ": "A", "AGE": "TOTAL", "TIME_PERIOD": "/?startPeriod=2000&endPeriod=2010"},
//    "varDims": ["SEX", "GEO"],
//    "fields":  ["SEX", "GEO", "TIME", "INDICATORS", "OBS_VALUE", "OBS_STATUS", "OBS_FLAG"],
//    "dsd": { "name": "demo_pjan",
//        "dimensions": ["FREQ", "AGE", "SEX", "GEO", "TIME_PERIOD"],
//        "concepts": ["FREQ", "AGE", "SEX", "GEO", "TIME", "INDICATORS", "OBS_VALUE", "OBS_STATUS", "OBS_FLAG"],
//        "codelists":[
//            {"name":"AGE","codes":[{"name":"TOTAL","descr":"Total"}, {"name":"Y_LT1","descr":"Less than 1 year"}, {"name":"Y1","descr":"1 year"},{"name":"Y2","descr":"2 years"},{"name":"Y3","descr":"3 years"},{"name":"Y4","descr":"4 years"},{"name":"Y5","descr":"5 years"},{"name":"Y6","descr":"6 years"},{"name":"Y7","descr":"7 years"},{"name":"Y8","descr":"8 years"},{"name":"Y9","descr":"9 years"},{"name":"Y10","descr":"10 years"},{"name":"Y11","descr":"11 years"},{"name":"Y12","descr":"12 years"},{"name":"Y13","descr":"13 years"},{"name":"Y14","descr":"14 years"},{"name":"Y15","descr":"15 years"},{"name":"Y16","descr":"16 years"},{"name":"Y17","descr":"17 years"},{"name":"Y18","descr":"18 years"},{"name":"Y19","descr":"19 years"},{"name":"Y20","descr":"20 years"},{"name":"Y21","descr":"21 years"},{"name":"Y22","descr":"22 years"},{"name":"Y23","descr":"23 years"},{"name":"Y24","descr":"24 years"},{"name":"Y25","descr":"25 years"},{"name":"Y26","descr":"26 years"},{"name":"Y27","descr":"27 years"},{"name":"Y28","descr":"28 years"},{"name":"Y29","descr":"29 years"},{"name":"Y30","descr":"30 years"},{"name":"Y31","descr":"31 years"},{"name":"Y32","descr":"32 years"},{"name":"Y33","descr":"33 years"},{"name":"Y34","descr":"34 years"},{"name":"Y35","descr":"35 years"},{"name":"Y36","descr":"36 years"},{"name":"Y37","descr":"37 years"},{"name":"Y38","descr":"38 years"},{"name":"Y39","descr":"39 years"},{"name":"Y40","descr":"40 years"},{"name":"Y41","descr":"41 years"},{"name":"Y42","descr":"42 years"},{"name":"Y43","descr":"43 years"},{"name":"Y44","descr":"44 years"},{"name":"Y45","descr":"45 years"},{"name":"Y46","descr":"46 years"},{"name":"Y47","descr":"47 years"},{"name":"Y48","descr":"48 years"},{"name":"Y49","descr":"49 years"},{"name":"Y50","descr":"50 years"},{"name":"Y51","descr":"51 years"},{"name":"Y52","descr":"52 years"},{"name":"Y53","descr":"53 years"},{"name":"Y54","descr":"54 years"},{"name":"Y55","descr":"55 years"},{"name":"Y56","descr":"56 years"},{"name":"Y57","descr":"57 years"},{"name":"Y58","descr":"58 years"},{"name":"Y59","descr":"59 years"},{"name":"Y60","descr":"60 years"},{"name":"Y61","descr":"61 years"},{"name":"Y62","descr":"62 years"},{"name":"Y63","descr":"63 years"},{"name":"Y64","descr":"64 years"},{"name":"Y65","descr":"65 years"},{"name":"Y66","descr":"66 years"},{"name":"Y67","descr":"67 years"},{"name":"Y68","descr":"68 years"},{"name":"Y69","descr":"69 years"},{"name":"Y70","descr":"70 years"},{"name":"Y71","descr":"71 years"},{"name":"Y72","descr":"72 years"},{"name":"Y73","descr":"73 years"},{"name":"Y74","descr":"74 years"},{"name":"Y75","descr":"75 years"},{"name":"Y76","descr":"76 years"},{"name":"Y77","descr":"77 years"},{"name":"Y78","descr":"78 years"},{"name":"Y79","descr":"79 years"},{"name":"Y80","descr":"80 years"},{"name":"Y81","descr":"81 years"},{"name":"Y82","descr":"82 years"},{"name":"Y83","descr":"83 years"},{"name":"Y84","descr":"84 years"},{"name":"Y85","descr":"85 years"},{"name":"Y86","descr":"86 years"},{"name":"Y87","descr":"87 years"},{"name":"Y88","descr":"88 years"},{"name":"Y89","descr":"89 years"},{"name":"Y90","descr":"90 years"},{"name":"Y91","descr":"91 years"},{"name":"Y92","descr":"92 years"},{"name":"Y93","descr":"93 years"},{"name":"Y94","descr":"94 years"},{"name":"Y95","descr":"95 years"},{"name":"Y96","descr":"96 years"},{"name":"Y97","descr":"97 years"},{"name":"Y98","descr":"98 years"},{"name":"Y99","descr":"99 years"},{"name":"Y100","descr":"100 years"},{"name":"Y101","descr":"101 years"},{"name":"Y102","descr":"102 years"},{"name":"Y103","descr":"103 years"},{"name":"Y104","descr":"104 years"},{"name":"Y105","descr":"105 years"},{"name":"Y106","descr":"106 years"},{"name":"Y107","descr":"107 years"},{"name":"Y108","descr":"108 years"},{"name":"Y109","descr":"109 years"},{"name":"Y_OPEN","descr":"Open-ended age class"},{"name":"UNK","descr":"Unknown"}]},
//            {"name":"FREQ","codes":[{"name":"D","descr":"Daily"},{"name":"W","descr":"Weekly"},{"name":"Q","descr":"Quarterly"},{"name":"A","descr":"Annual"},{"name":"M","descr":"Monthly"},{"name":"H","descr":"Semi-annual"}]},
//            {"name":"GEO","codes":[{"name":"EU28","descr":"European Union (28 countries)"},{"name":"EU27","descr":"European Union (27 countries)"},{"name":"EA18","descr":"Euro area (18 countries)"},{"name":"EA17","descr":"Euro area (17 countries)"},{"name":"EA16","descr":"Euro area (16 countries)"},{"name":"BE","descr":"Belgium"},{"name":"BG","descr":"Bulgaria"},{"name":"CZ","descr":"Czech Republic"},{"name":"DK","descr":"Denmark"},{"name":"DE","descr":"Germany (until 1990 former territory of the FRG)"},{"name":"DE_TOT","descr":"Germany (including former GDR)"},{"name":"EE","descr":"Estonia"},{"name":"IE","descr":"Ireland"},{"name":"EL","descr":"Greece"},{"name":"ES","descr":"Spain"},{"name":"FR","descr":"France"},{"name":"FX","descr":"France (metropolitan)"},{"name":"HR","descr":"Croatia"},{"name":"IT","descr":"Italy"},{"name":"CY","descr":"Cyprus"},{"name":"LV","descr":"Latvia"},{"name":"LT","descr":"Lithuania"},{"name":"LU","descr":"Luxembourg"},{"name":"HU","descr":"Hungary"},{"name":"MT","descr":"Malta"},{"name":"NL","descr":"Netherlands"},{"name":"AT","descr":"Austria"},{"name":"PL","descr":"Poland"},{"name":"PT","descr":"Portugal"},{"name":"RO","descr":"Romania"},{"name":"SI","descr":"Slovenia"},{"name":"SK","descr":"Slovakia"},{"name":"FI","descr":"Finland"},{"name":"SE","descr":"Sweden"},{"name":"UK","descr":"United Kingdom"},{"name":"EEA31","descr":"European Economic Area (EU-28 plus IS, LI, NO)"},{"name":"EEA30","descr":"European Economic Area (EU-27 plus IS, LI, NO)"},{"name":"EFTA","descr":"European Free Trade Association"},{"name":"IS","descr":"Iceland"},{"name":"LI","descr":"Liechtenstein"},{"name":"NO","descr":"Norway"},{"name":"CH","descr":"Switzerland"},{"name":"ME","descr":"Montenegro"},{"name":"MK","descr":"Former Yugoslav Republic of Macedonia, the"},{"name":"RS","descr":"Serbia"},{"name":"TR","descr":"Turkey"},{"name":"AL","descr":"Albania"},{"name":"AD","descr":"Andorra"},{"name":"BY","descr":"Belarus"},{"name":"BA","descr":"Bosnia and Herzegovina"},{"name":"XK","descr":"Kosovo (under United Nations Security Council Resolution 1244/99)"},{"name":"MD","descr":"Moldova"},{"name":"MC","descr":"Monaco"},{"name":"RU","descr":"Russia"},{"name":"SM","descr":"San Marino"},{"name":"UA","descr":"Ukraine"},{"name":"AM","descr":"Armenia"},{"name":"AZ","descr":"Azerbaijan"},{"name":"GE","descr":"Georgia"}]},
//            {"name":"Observation flag.","codes":[{"name":"f","descr":"forecast"},{"name":"u","descr":"extremely unreliable data"},{"name":"e","descr":"estimated value"},{"name":"s","descr":"eurostat estimate"},{"name":"b","descr":"break in series"},{"name":"c","descr":"confidential"},{"name":"r","descr":"revised value"},{"name":"p","descr":"provisional value"},{"name":"n","descr":"not significant"},{"name":"i","descr":"see explanatory notes"}]},
//            {"name":"Observation status.","codes":[{"name":"na","descr":"not available"},{"name":"-","descr":"not applicable or real zero or zero by default"},{"name":"0","descr":"less than half of the unit used"}]},
//            {"name":"SEX","codes":[{"name":"T","descr":"Total"},{"name":"M","descr":"Males"},{"name":"F","descr":"Females"}]}
//        ]
//    }
//}




//  I'm interested in annual data and total (i.e. not split by age) numbers, between the years 2000 and 2010.
//  I'm keeping the other dimensions ("GEO" and "SEX") undefined, as I'd like to vary these.
/*



function test1() {
    db.addTable({name:"demo_pjan", fixDims:{FREQ:"A", AGE:"TOTAL"}, timePeriod:{startYear:2000, endYear:2010}}, function(){console.log(JSON.stringify(db.tbl("demo_pjan"),null,4))});
}
/*
$("#geo").change(changeHandler).keypress(changeHandler);
$("#product").change(changeHandler).keypress(changeHandler);
function changeHandler() {
    dataConfig.filter.product = $("#product").val();
    dataConfig.filter.geo = $("#geo").val();
    if (dataConfig.filter.geo !== null && dataConfig.filter.product !== null) db.addData(dataConfig);
}

db.fetchDsds(["ei_isen_m","for_remov"]);

function bla2(name) {
    var url = "http://ec.europa.eu/eurostat/SDMX/diss-web/rest/data/" + name + "/";
    var filter;
    if (name === "ei_isen_m") filter = "A+M.NSA.IS-PNG-TJ.HR+FR/q?startPeriod=2011&endPeriod=2013";
    if (name === "for_remov") filter = "A.TOTAL.RND..UNBK.HR+FR/q?startPeriod=2011&endPeriod=2013";
    url +=filter;

    $.ajax(url, {
        success: function(xml) {
            var converter = new X2JS();
            var xmlData = converter.xml2json(xml);
            console.log(JSON.stringify(xmlData));

        }
    });

}*/