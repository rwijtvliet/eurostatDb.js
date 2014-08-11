//check if all dsd can be fetched for all dfs, and if some dsds might have unexpected property (location of TIME_PERIOD dimension)
(function () {
    var dfOk = [],
        dfNoTime = [],
        dfTimeWrong = [],
        dfError = [],
        addiConcepts = [],
        db = eurostatDb();
    db.fetchDfs("", function () {
        var dfNames = db.dfNames(),
            inflight = 0;

        dfNames.forEach(function (dfName, i) {
            $("ul").append("<li class='" + dfName + " started'>" + dfName + " </li>");
            inflight++;
            db.fetchDsd(dfName, function (error, dsd) {
                inflight--;
                checkDsd(error, dsd, dfName, i);
                checkAdditionalConcepts(error, dsd, dfName);
                if (!inflight) {
                    checkAdditionalConcepts_final(dfNames, dfError);
                    alert("FINISHED!");
                }
            });
        });
    });

    function checkDsd(error, dsd, dfName) {
        if (error) {
            dfError.push({name: dfName, error: error.toString()});
            $("#Error").text(JSON.stringify(dfError));
            $("li." + dfName).removeClass("started").addClass("error");
            return;
        }
        var count = dsd.dimensions.length;
        var index = dsd.dimensions.indexOf("TIME_PERIOD");
        if (index === -1) {
            dfNoTime.push({name: dfName, dimensions: dsd.dimensions});
            $("#NoTime").text(JSON.stringify(dfNoTime));
            $("li." + dfName).removeClass("started").addClass("notime");
        }
        else if (index !== count - 1) {
            dfTimeWrong.push({name: dfName, dimensions: dsd.dimensions});
            $("#TimeWrong").text(JSON.stringify(dfTimeWrong));
            $("li." + dfName).removeClass("started").addClass("timewrong");
        }
        else {
            dfOk.push(dfName);
            $("#OK").text(JSON.stringify(dfOk));
            $("li." + dfName).removeClass("started").addClass("ok");
        }
    }
    function checkAdditionalConcepts(error, dsd, dfName) {
        if (error) return;
        //Sort the 'additional' concepts (= those concepts that are not in the dimensions) by the df that have them.
        dsd.concepts.forEach(function(con){
            if (dsd.dimensions.indexOf(con) === -1) {
                var i = addiConcepts.map(function(addiConcept){return addiConcept.name}).indexOf(con);
                if (i > -1) addiConcepts[i].dfs.push(dfName);
                else {
                    addiConcepts.push(
                        {
                            name: con,
                            dfs: [dfName]
                        }
                    );
                }
            }
        });
        $("#addiConcepts").text(JSON.stringify(addiConcepts.map(function(addiConcept){return {name: addiConcept.name, dfCount: addiConcept.dfs.length, dfs: addiConcept.dfs}}), null, 2));
    }
    function checkAdditionalConcepts_final(dfNames, dfError) {
        addiConcepts.forEach(function(addiConcept) {
            addiConcept.dfsnot = [];
            var dfErrorNames = dfError.map(function (df){return df.name});
            dfNames.forEach(function(dfName){
                if (addiConcept.dfs.indexOf(dfName) === -1 && dfErrorNames.indexOf(dfName) === -1) addiConcept.dfsnot.push(dfName);
            });
        });
        $("#addiConcepts").text(JSON.stringify(addiConcepts.map(function(addiConcept){return {name: addiConcept.name, dfCount: addiConcept.dfs.length, dfs: addiConcept.dfs, dfnotCount: addiConcept.dfsnot.length, dfsnot: addiConcept.dfsnot}}), null, 2));
    }
}());