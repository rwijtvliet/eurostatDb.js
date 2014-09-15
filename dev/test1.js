//check if all dsd can be fetched for all dfs, and if some dsds might have unexpected property (location of TIME_PERIOD dimension)
(function () {
    var dfOk = [],
        dfNoTime = [],
        dfTimeWrong = [],
        dfError = [],
        consOnly = [],
        dimsOnly = [],
        intersects = [],
        db = eurostatDb();
    db.fetchDfs("", function () {
        var dfNames = db.dfNames(),
            inflight = 0;

        dfNames.forEach(function (dfName, i) {
            if (i>200) return;
            $("ul").append("<li class='" + dfName + " started'>" + dfName + " </li>");
            inflight++;
            db.qDsd(dfName, function (error, dsd) {
                inflight--;
                checkDsd(error, dsd, dfName, i);
                checkAll(error, dsd);
                if (!inflight) {
                    checkAll_final(dfNames, dfError);
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
    function checkAll(error, dsd) {
        if (error) return;
        //Sort the 'additional' concepts (= those concepts that are not in the dimensions) by the df that have them.
        var consNotDim = dsd.concepts.filter(function(con){return dsd.dimensions.indexOf(con) ===-1;});
        var dimsNotCon = dsd.dimensions.filter(function(dim){return dsd.concepts.indexOf(dim) ===-1;});
        var intersect = dsd.dimensions.filter(function(dim){return dsd.concepts.indexOf(dim) > -1;});

        addSomewhere(consNotDim, consOnly, dsd, "#consOnly");
        addSomewhere(dimsNotCon, dimsOnly, dsd, "#dimsOnly");
        addSomewhere(intersect, intersects, dsd, "#intersects");
    }
    function addSomewhere(arr, collection, dsd, dom){
        var codelistNames = dsd.codelists.map(function(codelist){return codelist.name;});
        arr.forEach(function(el){
            var i = collection.map(function(e){return e.name}).indexOf(el);
            var j = codelistNames.indexOf(el);
            if (i === -1) {
                i = collection.length;
                collection.push({name: el, dfs: {codelist: [], noCodelist: []}});
            }
            if (j > -1) collection[i].dfs.codelist.push(dsd.name);
            else collection[i].dfs.noCodelist.push(dsd.name);
        });
        $(dom).text(JSON.stringify(collection));
    }

    function checkAll_final(dfNames, dfError) {
        var dfErrorNames = dfError.map(function (df) {return df.name});
        addSomewhere_final(consOnly, dfNames, dfErrorNames, "#consOnly");
        addSomewhere_final(dimsOnly, dfNames, dfErrorNames, "#dimsOnly");
        addSomewhere_final(intersects, dfNames, dfErrorNames, "#intersects");
    }
    function addSomewhere_final(collection, dfNames, dfErrorNames, dom) {
        collection.forEach(function (e) {
            e.dfsnot = [];
            var dfsnotCnt = 0;
            dfNames.forEach(function (dfName) {
                if (e.dfs.codelist.indexOf(dfName) === -1 && e.dfs.noCodelist.indexOf(dfName) === -1 && dfErrorNames.indexOf(dfName) === -1) {
                    if (dfsnotCnt<100) e.dfsnot.push(dfName); //limit to 100.
                    else if (dsfnotCnt===100) e.dfsnot.push("...");
                    dfsnotCnt++;
                }
            });
            e.dfNotHaveCount = dfsnotCnt;
        });

        $(dom).text(JSON.stringify(collection.map(function(e){return {name: e.name, dfHaveCountWithCodelist: e.dfs.codelist.length, dfHaveCountWithoutCodelist: e.dfs.noCodelist.length, dfNotCount: e.dfNotHaveCount, dfs: e.dfs, dfsnot: e.dfsnot}}), null, 2));
    }
}());
/*$.ajax("dev/test1_conceptsThatAreNotDimensions.json").done(function(data){
 var d1= 0, d2= 0, d3=0;
 data.forEach(function(d){
 if (d.dfHaveCountWithoutCodelist) {
 if (d.dfHaveCountWithCodelist) d3++;
 else d2++;
 } else {
 if (d.dfHaveCountWithCodelist) d1++;
 }
 });
 alert (d1 + " " + d2 + " " + d3);
 });*/