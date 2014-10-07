(function(){
    var dfOk = [],
        dfNotOk = [],
        dfError = [],
        inflight = 0,
        db = eurostatDb();
    db.dfsQ("").then(function (dfs) {
        var dfIds = dfs.map(function (df) {return df.id;});

        dfIds.forEach(function (dfId, i) {
            if (i<90 || i>100) return;
            $("ul").append("<li class='" + dfId + " started'>" + dfId + " </li>");
            inflight++;
            db.tblQinit(dfId, {startYear: 2000, endYear: 2010})
                .then(function (tbl) {getSomeData(tbl, dfId);}, function (error) {addError(error, dfId);});
        });
    });
    function addError(error, dfId) {
        dfError.push(dfId);
        $("#ERRORS").append("<p>" + dfId + " :   " + error.toString() + "</p>");
        $("#ERRORNAMES").text(JSON.stringify(dfError));
        $("li." + dfId).removeClass("started").addClass("error");
    }
    function getSomeData(tbl, dfId) {
        tryAgain(tbl, 10, function(error, data) {
            if (error) {
                dfNotOk.push(dfId);
                $("#NOTOK").append("<p>" + dfId + " :   " + error.toString() + "</p>");
                $("#NOTOKNAMES").text(dfNotOk.length + ":\n\n" + JSON.stringify(dfNotOk));
                $("li." + dfId).removeClass("started").addClass("notok");
            } else if (!(data instanceof Array)) {
                dfNotOk.push(dfId);
                $("#NOTOK").append("<p>" + dfId + " :   dimensions: " + JSON.stringify(tbl.dsd.dimensions) + "</p>");
                $("#NOTOKNAMES").text(dfNotOk.length + ":\n\n" + JSON.stringify(dfNotOk));
                $("li." + dfId).removeClass("started").addClass("notok");
            } else {
                dfOk.push(dfId);
                $("#OK").append("<p>" + dfId + " : " + JSON.stringify(data[0]) + "</p>");
                $("#OKNAMES").text(dfOk.length + ":\n\n" + JSON.stringify(dfOk));
                $("li." + dfId).removeClass("started").addClass("ok");
            }

            inflight--;
            if (!inflight) {
                alert("FINISHED!");
            }
        });
    }

    function varDimFilter(tbl) {
        var varDimFilter = {};
        tbl.varDims.forEach(function(varDim){
            var val = [""];
            var codes = Object.keys(tbl.dsd.codesDict(varDim));
            if (varDim === "PARTNER" || (varDim.indexOf("DECL") > -1) || (varDim.indexOf("INDICATOR") > -1)) val = ""; //all
            else if (varDim === "FREQ") val = codes;
            else val = codes[Math.floor(Math.random()*codes.length)]; //random
            varDimFilter[varDim] = val;
        });
        return varDimFilter;
    }

    function tryAgain(tbl, cnt, callback) {
        if (cnt<=0) {callback(Error("too many tries, last filter: " + JSON.stringify(vdf))); return;}

        var vdf = varDimFilter(tbl);
        console.log (tbl.id + " " + JSON.stringify(vdf));
        (function(cnt, vdf) {
            cnt--;
            db.dataQ(tbl.id, vdf)
                .then(function (rst) {
                    if (!rst || !rst.length) tryAgain(tbl, cnt, callback);
                    else callback(null, rst);
                },
                function (error) {callback(error);});
        }(cnt, vdf));
    }
}());