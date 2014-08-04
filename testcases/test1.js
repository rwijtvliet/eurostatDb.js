db = eurostatDb();
db.fetchDfs("", function(){
    var dfNames = db.dfNames(),
        dfOk = [],
        dfNoTime = [],
        dfTimeWrong = [],
        dfError = [],
        inflight = 0;
    for (var n = 0; n<dfNames.length; n++) {
        var dfName = dfNames[n];
        (function(n,df) {
            $("ul").append("<li class='" + n + " started'>" + n + " </li>");
            inflight++;
            db.fetchDsd(dfName, function (dsd, error) {
                inflight--;
                if (error) {
                    dfError.push({name: df, error: error});
                    $("#Error").text(JSON.stringify(dfError));
                    $("li." + n).removeClass("started").addClass("error");
                }
                else {
                    var count = dsd.dimensions.length;
                    var index = dsd.dimensions.indexOf("TIME_PERIOD");
                    if (index === -1) {
                        dfNoTime.push(df);
                        $("#NoTime").text(JSON.stringify(dfNoTime));
                        $("li." + n).removeClass("started").addClass("notime");
                    }
                    else if (index !== count - 1) {
                        dfTimeWrong.push({name: df, dimensions: dsd.dimensions});
                        $("#TimeWrong").text(JSON.stringify(dfTimeWrong));
                        $("li." + n).removeClass("started").addClass("timewrong");
                    }
                    else {
                        dfOk.push(df);
                        $("#OK").text(JSON.stringify(dfOk));
                        $("li." + n).removeClass("started").addClass("ok");
                    }
                }
                if (!inflight) {
                    alert("FINISHED!");
                }
            });
        }(n,dfName));
    }
});

