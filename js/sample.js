db = eurostatDb();

//v1:

//Sample code 1:
db.tblQinit("demo_pjan", {FREQ: "A", AGE: "TOTAL"}, {startYear: 1995, endYear: 2015}); //1
db.rstQ("demo_pjan", {SEX: "T", GEO: "NL"}, "TIME asec") //2
    .then(function (rst) {
        $("div#info").prepend("<h2>Total population in the Netherlands:</h2>");
        rst.forEach(function (r) {$("ul").append("<li>In " + r.TIME + ": " + r.OBS_VALUE + "</li>");});//3
    }, undefined, function (val) {console.log("inflight: " + val);});
//What's happening here?
//1: specifies the name of the dataflow that I'm interested in, and fixes some of its dimensions and the time period. That way, I always fetch annual data and age aggregates, from the time period between 1995 and 2015.
//2: fetches data for total population of Netherlands.
//3: then uses this data to make a list.



//Sample code 2: no prior knowledge
var then = function (data) { //callback to display information to console
    console.log(JSON.stringify(data, null, 2));
};
function step1 () {db.dfsQ("monthly").then(then);}
function step2 () {db.dsdQ("DS-008573").then(then);}
function step3 () {db.tblQinit("DS-008573").then(then);}
function step4 () {db.dataQ("DS-008573", {FREQ:"M", DECLARANT:["001", "003"], PRCCODE:["27101100", "27101250"], MEASUREMENT_UNIT:"VALUE", INDICATORS: "IMPORTS"}).then(then);}
function step5 () {db.rstQ("DS-008573", {FREQ:"M", DECLARANT:["001", "003"], PRCCODE:["27101100", "27101250"], MEASUREMENT_UNIT:"VALUE", INDICATORS: "IMPORTS", OBS_FLAG:"p"}).then(then);}



//Sample code 3:
function sample3 () {
    db.tblQinit("demo_pjan", {FREQ: "A", AGE: "TOTAL"}, {startYear: 1995, endYear: 2015}); //1
    db.dataQ("demo_pjan", {SEX: ["M", "F"], GEO:"NL"})
        .then(function () {
            var rstM = db.rst("demo_pjan", {SEX: ["M"], GEO:"NL"}, "TIME asec"),
                rstF = db.rst("demo_pjan", {SEX: ["F"], GEO:"NL"}, "TIME asec"),
                rst = [];
            for (var i = 0; i<rstM.length; i++) {
                var r = {TIME: rstM[i].TIME, OBS_VALUE: rstM[i].OBS_VALUE/(rstM[i].OBS_VALUE+rstF[i].OBS_VALUE)};
                rst.push(r);
            }
            $("div#info").append("<h2>Male percentage in the Netherlands:</h2>");
            rst.forEach(function(r) {$("div#info").append("<p>In " + r.TIME + ": " + r.OBS_VALUE + "</p>");});
        }, undefined, function(val){console.log("inflight" + val);});
}


//not working 2014-09-30:
//http://ec.europa.eu/eurostat/SDMX/diss-web/rest/data/nrg_100a/A.TJ.0000.B_100900.NL.
db.tblQinit("nrg_100a", {FREQ: "A", UNIT: "TJ"}); //leaves GEO and PRODUCT and TIME and INDIC_NRG
function sample4() {
    db.dataQ("nrg_100a", {PRODUCT: ["0000", "2000"], INDIC_NRG: "B_100900", GEO: ["DE", "LU", "BE"]})
        .then(function (rst) {console.log("additionally fetched:   " + JSON.stringify(rst));},
        function (e) {console.log("error:   " + e.message);},
        function (f) {console.log("inflight:   " + f);}
    );
    db.dataQ("nrg_100a", {PRODUCT: ["0000", "2000"], INDIC_NRG: "B_100900", GEO: ["DE", "LU", "BE", "NL"]})
        .then(function (rst) {console.log("additionally fetched 2: " + JSON.stringify(rst));},
        function (e) {console.log("error 2: " + e.message);},
        function (f) {console.log("inflight 2: " + f);}
    );
}