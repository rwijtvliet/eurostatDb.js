
//In short:
db = eurostatDb();
db.addTable("demo_pjan", {FREQ: "A", AGE: "TOTAL"}, {startYear: 2000, endYear: 2015}, function () {//1
    db.fetchData("demo_pjan", {SEX:["T", "M", "F"], GEO:["FR", "NL", "BE", "LU"]}, function () {//2
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
