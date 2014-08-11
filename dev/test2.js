(function(){
    var dfOk = [],
        dfNotOk = [],
        dfError = [],
        inflight = 0,
        db = eurostatDb();
    db.fetchDfs("", function() {
        var dfNames = db.dfNames();

        dfNames.forEach(function (dfName, i) {
            if (i>1) return;
            $("ul").append("<li class='" + dfName + " started'>" + dfName + " </li>");
            inflight++;
            db.initTable(dfName, {startYear: 2000, endYear: 2010}, function (error, tbl) {
                getSomeData(error, tbl, dfName);
            });
        });
    });

    function getSomeData(error, tbl, dfName) {
        if (error) {
            dfError.push(dfName);
            $("#ERRORS").append("<p>" + dfName + " :   " + error.toString() + "</p>");
            $("#ERRORNAMES").text(JSON.stringify(dfError));
            $("li." + dfName).removeClass("started").addClass("error");
            return;
        }
        tryAgain(tbl, 10, function(error, data) {
            if (error) {
                dfNotOk.push(tbl.name);
                $("#NOTOK").append("<p>" + tbl.name + " :   " + error.toString() + "</p>");
                $("#NOTOKNAMES").text(dfNotOk.length + ":\n\n" + JSON.stringify(dfNotOk));
                $("li." + dfName).removeClass("started").addClass("notok");
            } else if (!(data instanceof Array)) {
                dfNotOk.push(tbl.name);
                $("#NOTOK").append("<p>" + tbl.name + " :   dimensions: " + JSON.stringify(tbl.dsd.dimensions) + "</p>");
                $("#NOTOKNAMES").text(dfNotOk.length + ":\n\n" + JSON.stringify(dfNotOk));
                $("li." + dfName).removeClass("started").addClass("notok");
            } else {
                dfOk.push(tbl.name);
                $("#OK").append("<p>" + tbl.name + " : " + JSON.stringify(data[0]) + "</p>");
                $("#OKNAMES").text(dfOk.length + ":\n\n" + JSON.stringify(dfOk));
                $("li." + dfName).removeClass("started").addClass("ok");
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
            var codes = Object.keys(db.codelistDict(tbl.name, varDim));
            if (varDim === "PARTNER" || (varDim.indexOf("DECL") > -1) || (varDim.indexOf("INDICATOR") > -1)) val = ""; //all
            else if (varDim === "FREQ") val = codes;
            else val = codes[Math.floor(Math.random()*codes.length)]; //random
            varDimFilter[varDim] = val;
        });
        return varDimFilter;
    }

    function tryAgain(tbl, cnt, callback, vdf) {
        if (cnt<=0) {callback(Error("too many tries, last filter: " + JSON.stringify(vdf))); return;}

        var vdf = varDimFilter(tbl);
        console.log (JSON.stringify(vdf));
        (function(cnt, vdf) {
            cnt--;
            db.fetchData(tbl.name, vdf, function (error, rst) {
                if (error) callback(error);
                else if (rst) callback(null, rst);
                else tryAgain(tbl, cnt, callback, vdf);
            });
        }(cnt, vdf));
    }
}());