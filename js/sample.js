
//In short:

//Sample code 1:

db = eurostatDb();
db.initTable("demo_pjan", {FREQ: "A", AGE: "TOTAL"}, {startYear: 1995, endYear: 2015}, function () {//1
    db.fetchRst("demo_pjan", {SEX: "T", GEO:"NL"}, function (error, rst) {//2

        $("div#info").prepend("<h2>Total population in the Netherlands:</h2>");
        if (error) {alert (error); return;}
        rst.forEach(function(r) {$("ul").append("<li>In " + r.TIME + ": " + r.OBS_VALUE + "</li>");});//3
    });
});
//What's happening here?
//1: specifies the name of the dataflow that I'm interested in, and fixes some of its dimensions and the time period. That way, I always fetch annual data and age aggregates, from the time period between 1995 and 2015.
//2: fetches data for total population of Netherlands above 16million.
//3: then uses this data to make a list.


//sample code 2: no prior knowledge

cb = function (error, data) { //callback to display information to console
    if (error) console.error(error.message);
    else console.log(JSON.stringify(data, null, 2));
};
function step1() {db.fetchDfs("monthly", cb );}
function step2() {db.fetchDsd("DS-008573", cb);}
function step3() {db.initTable("DS-008573", cb);}
function step4() {db.fetchData("DS-008573", {FREQ:"M", DECLARANT:["001", "003"], PRCCODE:["27101100", "27101250"], MEASUREMENT_UNIT:"VALUE", INDICATORS: "IMPORTS"}, cb);}
function step5() {db.fetchRst("DS-008573", {FREQ:"M", DECLARANT:["001", "003"], PRCCODE:["27101100", "27101250"], MEASUREMENT_UNIT:"VALUE", INDICATORS: "IMPORTS", OBS_FLAG:"p"}, cb);}



//Sample code 3:
//TODO: needs work (joins not satisfactorily solved)

function sample3(){
    db.initTable("demo_pjan", {FREQ: "A", AGE: "TOTAL"}, {startYear: 1995, endYear: 2015}, function () {//1
        db.fetchData("demo_pjan", {SEX: ["M", "F"], GEO:"NL"}, function() {
            var rstM = db.getRst("demo_pjan", {SEX: ["M"], GEO:"NL"}, "TIME asec"),
                rstF = db.getRst("demo_pjan", {SEX: ["F"], GEO:"NL"}, "TIME asec"),
                rst = [];
            for (var i = 0; i<rstM.length; i++) {
                var r = {TIME: rstM[i].TIME, OBS_VALUE: rstM[i].OBS_VALUE/(rstM[i].OBS_VALUE+rstF[i].OBS_VALUE)};
                rst.push(r);
            }
            $("div#info").append("<h2>Male percentage in the Netherlands:</h2>");
            rst.forEach(function(r) {$("div#info").append("<p>In " + r.TIME + ": " + r.OBS_VALUE + "</p>");}); //4
        });
    });
}
