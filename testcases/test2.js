db = eurostatDb();
//TODO aact_eaa04: wrong order --> fixed by moving TIME_PERIOD to end of dimensios array?

db.fetchDfs("", function(){
    var dfNames = db.dfNames(),
        dfOk = [],
        dfNoTime = [],
        dfTimeWrong = [],
        dfError = [],
        inflight = 0;
    for (var n =0; n<1; n++) {
        var dfName = dfNames[n];
        $("ul").append("<li class='" + dfName + " started'>" + n + " </li>");
        inflight++;
        console.log("start...");
        db.initTable(dfName, function(tbl) {
            console.log("got tbl");
            var varDimFilter = {};
            tbl.varDims.forEach(function(varDim){
                var val = "";
                if (varDim === "FREQ") val = db.codelist(tbl.name, varDim).map(function(c){return c.name;});
                else val = db.codelist(tbl.name, varDim)[0].name;
                varDimFilter[varDim] = val;
            });
            console.log("got varDims: " + JSON.stringify(varDimFilter));
            db.fetchRst(tbl.name, varDimFilter, "", function (rst){
                console.log("got rst");
                $("#Results").append("<p>" + tbl.name + " : " + JSON.stringify(rst) + "</p>");
                $("li." + tbl.name).removeClass("started").addClass("ok");
                inflight--;
                if (!inflight) {
                    alert("FINISHED!");
                }
            });
        });
    }
});

