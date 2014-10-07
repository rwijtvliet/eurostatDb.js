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
    db.dfsQ("")
        .then(function (dfs) {
            var dfIds = dfs.map(function (df) {return df.id;}),
                inflight = 0;

        dfIds.forEach(function (dfId, i) {
            if (i>200) return;
            $("ul").append("<li class='" + dfId + " started'>" + dfId + " </li>");
            inflight++;
            db.dsdQ(dfId)
                .then(function (dsd) {
                    inflight--;
                    checkDsd(undefined, dsd, dfId, i);
                    checkAll(undefined, dsd);
                    if (!inflight) {
                        checkAll_final(dfIds, dfError);
                        alert("FINISHED!");
                    }
                })
                .catch (function (error) {
                    checkDsd(error, undefined, dfId, i);
                    checkAll(error, undefined);
                });
        });
    });

    function checkDsd(error, dsd, dfId) {
        if (error) {
            dfError.push({id: dfId, error: error.toString()});
            $("#Error").text(JSON.stringify(dfError));
            $("li." + dfId).removeClass("started").addClass("error");
            return;
        }
        var count = dsd.dimensions.length;
        var index = dsd.dimensions.indexOf("TIME_PERIOD");
        if (index === -1) {
            dfNoTime.push({id: dfId, dimensions: dsd.dimensions});
            $("#NoTime").text(JSON.stringify(dfNoTime));
            $("li." + dfId).removeClass("started").addClass("notime");
        }
        else if (index !== count - 1) {
            dfTimeWrong.push({id: dfId, dimensions: dsd.dimensions});
            $("#TimeWrong").text(JSON.stringify(dfTimeWrong));
            $("li." + dfId).removeClass("started").addClass("timewrong");
        }
        else {
            dfOk.push(dfId);
            $("#OK").text(JSON.stringify(dfOk));
            $("li." + dfId).removeClass("started").addClass("ok");
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
        var codelistNames = dsd.codelists.map(function(codelist){return codelist.fldName;});
        arr.forEach(function(el){
            var i = collection.map(function(e){return e.fldName}).indexOf(el);
            var j = codelistNames.indexOf(el);
            if (i === -1) {
                i = collection.length;
                collection.push({fldName: el, dfs: {codelist: [], noCodelist: []}});
            }
            if (j > -1) collection[i].dfs.codelist.push(dsd.id);
            else collection[i].dfs.noCodelist.push(dsd.id);
        });
        $(dom).text(JSON.stringify(collection));
    }

    function checkAll_final(dfIds, dfError) {
        var dfErrorNames = dfError.map(function (df) {return df.name});
        addSomewhere_final(consOnly, dfIds, dfErrorNames, "#consOnly");
        addSomewhere_final(dimsOnly, dfIds, dfErrorNames, "#dimsOnly");
        addSomewhere_final(intersects, dfIds, dfErrorNames, "#intersects");
    }
    function addSomewhere_final(collection, dfIds, dfErrorNames, dom) {
        collection.forEach(function (e) {
            e.dfsnot = [];
            var dfsnotCnt = 0;
            dfIds.forEach(function (dfId) {
                if (e.dfs.codelist.indexOf(dfId) === -1 && e.dfs.noCodelist.indexOf(dfId) === -1 && dfErrorNames.indexOf(dfId) === -1) {
                    if (dfsnotCnt<100) e.dfsnot.push(dfId); //limit to 100.
                    else if (dsfnotCnt===100) e.dfsnot.push("...");
                    dfsnotCnt++;
                }
            });
            e.dfNotHaveCount = dfsnotCnt;
        });

        $(dom).text(JSON.stringify(collection.map(function(e){return {fldName: e.fldName, dfHaveCountWithCodelist: e.dfs.codelist.length, dfHaveCountWithoutCodelist: e.dfs.noCodelist.length, dfNotCount: e.dfNotHaveCount, dfs: e.dfs, dfsnot: e.dfsnot}}), null, 2));
    }
}());