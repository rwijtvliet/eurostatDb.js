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
            var dfNames = dfs.map(function (df) {return df.name;}),
                inflight = 0;

        dfNames.forEach(function (dfName, i) {
            if (i>200) return;
            $("ul").append("<li class='" + dfName + " started'>" + dfName + " </li>");
            inflight++;
            db.dsdQ(dfName)
                .then(function (dsd) {
                    inflight--;
                    checkDsd(undefined, dsd, dfName, i);
                    checkAll(undefined, dsd);
                    if (!inflight) {
                        checkAll_final(dfNames, dfError);
                        alert("FINISHED!");
                    }
                })
                .catch (function (error) {
                    checkDsd(error, undefined, dfName, i);
                    checkAll(error, undefined);
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


/**
 * Created by ruud wijtvliet (rwijtvliet@gmail.com).
 *
 * Much information about the Eurostat data API is found here:
 * http://epp.eurostat.ec.europa.eu/portal/page/portal/sdmx_web_services/getting_started/rest_sdmx_2.1
 * and here:
 * http://epp.eurostat.ec.europa.eu/portal/page/portal/sdmx_web_services/getting_started/a_few_useful_points
 *
 *
 * Use of this library:
 *
 *
 * ABBREVIATIONS:
 *
 * df, dfs   = dataflow(s)
 * dsd, dsds = data structure definition(s)
 * tbl, tbls = table(s)
 *
 *
 * DESCRIPTION OF METHODS
 *
 * comprehensive information on https://github.com/rwijtvliet/eurostatDb.js
 *
 * .fetchDfs()
 *      Prepare dataflow objects that describe what data are available from eurostat server. (asynchronous)
 *      Arguments: (optional) filter word, or array with filter words, of which dataflow name or dataflow description must include >=1 to be saved. If omitted or "": all available on eurostat server.
 *                 (optional) callback function with as argument the error object (if applicable) and a clone of the array of df objects.
 *      Return: eurostatDb module itself.
 *
 * .dfNames()
 *      Array of dataflow names for which description has been fetched.
 *      Arguments: none.
 *      Return: array of dataflow names.
 *
 * .df()
 *      Fetched dataflow (df) object.
 *      Arguments: dataflow name.
 *      Return: clone of df object.
 *
 * .fetchDsd()
 *      Fetch, through eurostat server API, data structure definitions (DSDs), for certain dataflow. (asynchronous)
 *      Arguments: dataflow name.
 *                 (optional) callback function called after dsd retrieval, with as argument the error object (if applicable) and a clone of the dsd object.
 *      Return: eurostatDb module itself.
 *
 * .dsd()
 *      Fetched data structure definition (dsd) object.
 *      Arguments: dataflow name.
 *      Return: clone of dsd object.
 *
 * .dsdNames()
 *      Array of dataflow names for which the dsd has been fetched.
 *      Arguments: none.
 *      Return: array of dataflow names.
 *
 * .dimensions()
 *      Array of dimensions for a certain dataflow.
 *      Arguments: dataflow name.
 *      Return: clone of array of dimension names.
 *
 * .concepts()
 *      Array of concepts for a certain dataflow.
 *      Arguments: dataflow name.
 *      Return: clone of array of concept names.
 *
 *
 * .codelistDict()
 *      Dictionary object with codes, and their description, that can be used/found for certain field.
 *      Arguments: (optional) dataflow name. If omitted: for all dataflows.
 *                 (optional) name of field (or dimension) of which the list of possible codes is wanted. If omitted: for all fieldnames.
 *      Return: if both specified:       object with {code: description}, for each code in the codelist
 *              if fieldname omitted:    object with {fieldname: {code: description}}, for each fieldname in the codelist-array.
 *              if dataflowname omitted: object with {dataflowname: {fieldname: {code: description}}}, for each dsd that has been fetched.
 *
 * .initTable()
 *      (Re)initialise table in database to store data.
 *      Arguments: dataflow name.
 *                 (optional) fixDimFilter object, describing which dimensions are fixed to which values.
 *                 (optional) timePeriod object, describing time period of which to retrieve data. Must contain at least one of the properties 'startYear' and 'endYear'.
 *                 (optional) callback function called after tbl initialisation, with as argument the error object (if applicable) and a clone of the tbl object.
 *      Return: eurostatDb module itself.
 *
 * .tbl()
 *      Table object.
 *      Arguments: dataflow name.
 *      Return: clone of table object.
 *
 * .tblNames()
 *      Array of dataflow names for which a table has been created.
 *      Arguments: none.
 *      Return: array of dataflow names.
 *
 * .fixDims()
 *      Array of fixed dimensions for a certain dataflow. These are used in fetching data to store in the table (see .fetchData, below).
 *      Arguments: dataflow name.
 *      Return: clone of array of dimension names.
 *
 * .fixDimFilter()
 *      Object of the fixed dimensions, and the values they are fixed to.
 *      Arguments: dataflow name.
 *      Return: clone of object of (dimension name: value) pairs.
 *
 * .varDims()
 *      Array of variable dimensions for a certain dataflow. These are used in fetching data to store in the table (see .fetchData, below).
 *      Arguments: dataflow name.
 *      Return: clone of array of dimension names.
 *
 * .fields()
 *      Array of fields that are stored in a local table for a certain dataflow. These are used in getting data out of the table (see .getRst, below).
 *      Arguments: dataflow name.
 *      Return: clone of array of field names.
 *
 * .fieldsInput()
 *      Array of input fields that are stored in a local table for a certain dataflow. Specifying a single value for each uniquely specifies a record.
 *      Arguments: dataflow name.
 *      Return: clone of array of input field names.
 *
 * .fieldsOutput()
 *      Array of output fields that are stored in a local table for a certain dataflow. The values for these specify the observation connected to the input field values.
 *      Arguments: dataflow name.
 *      Return: clone of array of input field names.
 *
 * .fields()
 *      Array of fields that are stored in a local table for a certain dataflow. These are used in getting data out of the table (see .getRst, below).
 *      Arguments: dataflow name.
 *      Return: clone of array of field names.
 *
 * .fetchData()
 *      Fetch, through eurostat server API, certain data. (asynchronous)
 *      Arguments: dataflow name.
 *                 varDimFilter object, or array of varDimFilter objects, describing which data should be fetched.
 *                 (optional) callback function called when ALL data is available, with as argument the error object (if applicable) and the records that were fetched to complete the data.
 *      Return: eurostatDb module itself.
 *
 * .getRst()
 *      Get data (record set) from local database.
 *      Arguments: dataflow name.
 *                 fieldFilter object (varDimFilter object also possible).
 *                 (optional) order string, e.g. "OBS_VALUE asec" or "TIME desc". If omitted: ordered by ascending TIME field value.
 *      Return: array with records; each record is object with (field:value) pairs.
 *
 * .fetchRst()
 *      Get data (record set) from local database and fetch, through eurostat API, any data that might be missing.
 *      Arguments: dataflow name.
 *                 fieldFilter object (varDimFilter object also possible).
 *                 (optional) order string, e.g. "OBS_VALUE asec" or "TIME desc". If omitted: ordered by ascending TIME field value.
 *                 (optional) callback function called after all data is available, with as argument the error object (if applicable) and the record set.
 *      Return: eurostatDb module itself.
 *
 * DESCRIPTION OF OBJECTS
 *
 * dataflow (df) object {
 *      name: "dataflowname",
 *      descrs: ["descrEn", "descrDe", "descrFr"]
 * }
 *
 * data structure definition (dsd) object {
 *      name: "dataflowname",
 *      concepts: ["field", ...],
 *      dimensions: ["field", ...],
 *      codelists: [{name: "codelistname", codes: [{name:"codename", descr:""}, ...]}, ...]
 * }
 *
 * table (tbl) object {
 *      name: "dataflowname",
 *      dsd: <<dsd object, see above>>,
 *      fixDims: {field1:"value1", field2:"value2", ...}, //see tblDef object, above. This includes TIME_PERIOD.
 *      varDims: ["field", ...], //fields of which value must be specified in order to fetch data.
 *      fields: ["field", ...], //fields which, if available, are stored for every record in database.
 *      data: TAFFY database
 * }
 *
 * fixDimFilter object: {                     //Defines which of the dimensions are fixed (and not stored as fields in database). Subset of dsd.dimensions (without TIME_PERIOD).
 *      field1:"value1",
 *      field2:"value2",
 *      ...
 *  }
 * timePeriod object: {                       //Years of which data must be retrieved (end points inclusive). If one omitted: half-open interval. If both omitted: all available years.
 *      startYear:value,
 *      endYear:value
 *  }
 *
 * varDimFilter object: {                     //Defines, for each field in the varDims array of the tbl object (see above), which values should be fetched.
 *      field1: "value",                      //--> All values should be strings to avoid problems with leading 0s.
 *      field2: ["value", ...],               //--> Arrays to get multiple values.
 *      field3: "",                           //--> Empty string to get all values.
 *      ...                                   //ALL fields in the varDims array must be present, also those for which value = "".
 *  }
 *
 * fieldFilter object: {                      //Defines, for zero or more fields in the fields array of the tbl dsd object (see above), which records should be gotten.
 *      field1: "value",                      //See TaffyDB description for allowed filters: http://www.taffydb.com/writingqueries
 *      field2: ["value2a", "orvalue2b"],     //--> array specifies OR
 *      field3: {lt: "maxvalue"},             //--> lt, lte, gt, gte (<,<=,>,>=), is, isnocase, left, leftnocase, right, rightnocase (match all/leftmost/rightmost characters case(in)sensitive),
 *      ...                                   //Fields in the varDims array, for which value = "", may be left out, but this is not recommended.
 *  }                                         //Wherever a fieldFilter object is needed, a varDimFilter object also works.
 *
 *
 *
 * DEPENDENCIES
 *
 * jQuery (http://jquery.com/)
 * xml2json (https://github.com/abdmob/x2js) to convert xml into json
 * taffydb (https://github.com/typicaljoe/taffydb) to store information
 *
 */


//TODO: count expected return size, check if exceeds limit of 1 000 000
//TODO: find out how the informational flag (OBS_FLAG="i") is represented in metadata --> answer: not necessary; "i" is deprecated.

function eurostatDb () {
    var esDb = {},
        dfsQ,      //Promise to array with Dataflow objects (see above)
        dsdQs = {},//Object with promises to Data Structure Definition objects (see above)
        tblQs = {},//Object with promises to Table objects (see above)
        tbls = {}; //Object with Table objects.

//    esDb.dfNamesQ = function () {
//        return new Promise(function (resolve, reject) {
//            dfsQ.then(function (dfs) {resolve(dfNames(dfs));})
//                .catch(function (error) {reject(error);});
//        });
//    };
//    function dfNames (dfs) {return dfs.map(function(df){return df.name;});}
//    esDb.dfQ = function (name) {
//        return new Promise(function (resolve, reject) {
//            dfsQ.then(function (dfs) {resolve($.grep(dfs, function (df) {return (df.name === name);})[0]);})
//                .catch(function (error) {reject(error);});
//        });
//    };
    esDb.dfsQ = function (filter) {
        //Get array of all dataflows that are available from API that comply to filter, and save to internal 'dfs' array.
        var url = "js/all_latest_ESTAT_references=none_detail=full.xml"; //originally found at "http://www.ec.europa.eu/eurostat/SDMX/diss-web/rest/dataflow/ESTAT/all/latest", cannot be fetched by machine (protected?)

        dfsQ = new Promise(function (resolve, reject) {
            $.get(url)
                .done(function (xml) {
                    var dfs = parseDfsXml(xml, filter);
                    resolve($.extend(true, [], dfs));
                })
                .fail(function (xhr, textStatus, error) {
                    reject(Error(error.toString())); //TODO:simply reject(error)?
                });
        });
        return dfsQ;
    };
    function parseDfsXml(xml, filter) {
        //Parse xml data describing all dataflows that are available from API.
        var dfsXml,//all dataflow data in xml file
            dfs = [],
            converter = new X2JS();

        //Parse.
        dfsXml = converter.xml2json(xml);
        dfsXml["Structure"]["Structures"]["Dataflows"]["Dataflow"].forEach(function (d) {
            var df = {
                    name: d["_id"],
                    descrs: []
                },
                add = true;

            d["Name"].forEach(function (n) {
                switch (n["_xml:lang"]) {
                    case "en":
                        df.descrs[0] = n["__text"];
                        break;
                    case "de":
                        df.descrs[1] = n["__text"];
                        break;
                    case "fr":
                        df.descrs[2] = n["__text"];
                        break;
                }
            });

            //Filter, if needed.
            if (filter) {
                add = false;
                [].concat(filter).forEach(function (filterTerm) {
                    if (add) return;
                    if (df.name.toLowerCase().indexOf(filterTerm.toLowerCase()) > -1) add = true;
                    df.descrs.forEach(function (descr) {
                        if (descr.toLowerCase().indexOf(filterTerm.toLowerCase()) > -1) add = true;
                    });
                });
            }

            //Save.
            if (add) dfs.push(df);
        });
        return dfs;
    }

    esDb.dsdQnames = function () {
        return Object.keys(dsdQs);
    };
    esDb.dsdQ = function (name) {
        //Get (promise to) data flow definition from certain table and add to dsd promise array.
        if (dsdQs.hasOwnProperty(name)) return dsdQs[name];

        var url = "http://ec.europa.eu/eurostat/SDMX/diss-web/rest/datastructure/ESTAT/DSD_" + name;

        dsdQs[name] = new Promise(function (resolve, reject) {
            $.get(url)
                .done(function (xml) {
                    var dsd = parseDsdXml(xml);
                    dsd.name = name;
                    dsd.codelist = codelist;
                    dsd.codelistDict = codelistDict;
                    resolve(dsd);
                })
                .fail(function (xhr, textStatus, error) {
                    reject(Error(error.toString()));
                });
        });

        return dsdQs[name];
    };
    function parseDsdXml(xml) {
        //Parse xml data describing data flow definition of certain dataflow.
        var dsdXml,//data structure definition data in xml file
            dsd = {
                name, //added later
                dimensions: [],
                concepts: [],
                codelists: [],
                codelist, //added later
                codelistDict //added later
            },
            converter = new X2JS(),
            renameCodelists = {"Observation flag.": "OBS_FLAG", "Observation status.": "OBS_STATUS"};

        //Parse: dimensions.
        dsdXml = converter.xml2json(xml);
        [].concat(dsdXml["Structure"]["Structures"]["DataStructures"]["DataStructure"]["DataStructureComponents"]["DimensionList"]["Dimension"]).forEach(function (dim) {
            dsd.dimensions[+(dim._position) - 1] = dim["_id"];
        });
        var t = dsdXml["Structure"]["Structures"]["DataStructures"]["DataStructure"]["DataStructureComponents"]["DimensionList"]["TimeDimension"];
        var timePos = +(t["_position"]) - 1;
        dsd.dimensions[timePos] = t["_id"];
        //Fix problems with dimensions, if TIME_PERIOD is not at end.
        if (timePos !== dsd.dimensions.length - 1) {
            var timeDim = dsd.dimensions.splice(timePos, 1)[0];//remove from middle
            dsd.dimensions.push(timeDim);//add at end
        }
        //Parse: concepts.
        [].concat(dsdXml["Structure"]["Structures"]["Concepts"]["ConceptScheme"]["Concept"]).forEach(function (con) {
            dsd.concepts.push(con["_id"]);
        });
        //Parse: codelists.
        [].concat(dsdXml["Structure"]["Structures"]["Codelists"]["Codelist"]).forEach(function (clist) {
            var codes = [];
            [].concat(clist["Code"]).forEach(function (code) {
                codes.push({
                    name: code["_id"],
                    descr: code["Name"]["__text"]
                });
            });
            var name = clist["Name"]["__text"];
            if (renameCodelists.hasOwnProperty(name)) name = renameCodelists[name];//rename 2 codes (flag and status) that do not make sense.
            dsd.codelists.push({
                name: name,
                codes: codes
            });
        });

        return dsd;
    }

    function codelist(fldName) {
        if (!fldName) return this.codelists;
        else {
            var codelist = $.grep(this.codelists, function (codelist) {
                return codelist.name === fldName;
            });
            if (!codelist.length) throw Error("Fieldname " + fldName + " not found");
            return codelist[0].codes;
        }
    }

    function codelistDict(fldName) {
        var dict = {};
        if (!fldName) {
            var fldNames = this.codelists.map(function (codelist) {
                return codelist.name;
            });
            fldNames.forEach(function (fldName) {
                dict[fldName] = codelistDict(fldName)
            }); //TODO: 'this' needed somewhere?
        } else {
            var codelist = $.grep(this.codelists, function (codelist) {
                return codelist.name === fldName;
            });
            if (!codelist.length) throw Error("Fieldname " + fldName + " not found");
            codelist[0].codes.forEach(function (code) {
                dict[code.name] = code.descr;
            });
        }
        return dict;
    }

    esDb.codelistDict = function (name, fldName) { //TODO: remove?
        var dict = {};
        if (!name) {
            var names = dsds.map(function (dsd) {
                return dsd.name;
            });
            names.forEach(function (name) {
                dict[name] = esDb.codelistDict(name);
            });
        } else if (!fldName) {
            try {
                var fldNames = getDsd(name).codelists.map(function (codelist) {
                    return codelist.name;
                });
                fldNames.forEach(function (fldName) {
                    dict[fldName] = esDb.codelistDict(name, fldName)
                });
            } catch (e) {
                throw Error("Dsd for " + name + " not found");
            }
        } else {
            try {
                var codes = $.grep(getDsd(name).codelists, function (codelist) {
                    return codelist.name === fldName;
                })[0].codes; //problem if fldName not found
                codes.forEach(function (code) {
                    dict[code.name] = code.descr;
                });
            } catch (e) {
                throw Error("Dsd for " + name + ", or fieldname " + fldName + " not found");
            }
        }
        return dict;
    };
    //6esDb.dimensions = function(name) {return $.extend([], getDsd(name).dimensions);}; //Array of all the dimensions.

    esDb.tbl = function (name) {
        if (tbls.hasOwnProperty(name)) return tbls[name]; else return undefined;
    };
    esDb.tblQ = function (name) {
        if (tblQs.hasOwnProperty(name)) return tblQs[name]; else return undefined;
    };
    esDb.tblQinit = function (name, fixDimFilter, timePeriod) {
        //Get arguments straight.
        var n = arguments.length;
        if (n === 2 && (arguments[1].hasOwnProperty("startYear") || arguments[1].hasOwnProperty("endYear"))) {
            //fixDimFilter was not passed and timePeriod WAS passed.
            timePeriod = arguments[1];
            fixDimFilter = undefined;
        }
        if (fixDimFilter && !Object.keys(fixDimFilter).length) fixDimFilter = undefined; //empty object --> undefined
        if (timePeriod && !Object.keys(timePeriod).length) timePeriod = undefined; //empty object --> undefined

        //Check if tbl does already exist. If so, delete
        if (tblQs.hasOwnProperty(name)) delete tblQs[name]; //TODO: necessary? will be overwritten on next line

        tblQs[name] = new Promise(function (resolve, reject) {

            //Make table.
            var tbl = {
                name: name,
                fixDims: [],
                fixDimFilter: {},
                varDims: [],
                fields: [],
                fieldsInput: [],
                fieldsOutput: [],
                //dsd, //properties dimensions, concepts, codelists, and name //added later
                //dataQ, //added later TODO:remove
                //rstQ, //added later TODO:remove
                //rst, //added later TODO:remove
                data: TAFFY() //database itself
            };

            //Do when (promise to) dsd is resolved.
            esDb.dsdQ(name).then(function (dsd) {

                //Save dsd to table.
                tbl.dsd = dsd;

                //Dimensions: split into fixed and variable.
                dsd.dimensions.forEach(function (dim) {
                    if (dim === "TIME_PERIOD") return;//exclude dimension TIME_PERIOD from appearing anywhere (is added later)
                    if (fixDimFilter && fixDimFilter.hasOwnProperty(dim)) {
                        tbl.fixDims.push(dim);
                        tbl.fixDimFilter[dim] = fixDimFilter[dim];
                    } else tbl.varDims.push(dim);
                });

                //Time period: add to fixed dimensions.
                var period = "";
                if (timePeriod) {
                    if (!isNaN(timePeriod.startYear)) period = "startPeriod=" + timePeriod.startYear;
                    if (!isNaN(timePeriod.endYear)) {
                        if (period) period += "&";
                        period += "endPeriod=" + timePeriod.endYear;
                    }
                    if (period) period = "/?" + period;
                }
                tbl.fixDims.push("TIME_PERIOD");
                tbl.fixDimFilter["TIME_PERIOD"] = period;

                //Fields.
                dsd.concepts.forEach(function (con) {
                    if (tbl.fixDims.indexOf(con) === -1) {//exclude those that are fixed
                        tbl.fields.push(con);
                        if (tbl.varDims.indexOf(con) > -1 || con === "TIME" || con === "PERIOD") tbl.fieldsInput.push(con); else tbl.fieldsOutput.push(con);
                    }
                });

                //Methods to get data into the table.
                //tbl.dataQ = dataQ; //TODO:remove
                //tbl.rstQ = rstQ; //TODO:remove
                //tbl.rst = rst; //TODO:remove

                //Save.
                tbls[name] = tbl;

                resolve(tbl);
            });
        });

        return tblQs[name];
    };
    esDb.tblQNames = function () {
        return Object.keys(tblQs);
    };
    //6
    //6esDb.fixDims = function(name) {return $.extend([], getTbl(name).fixDims);}; //Array of fixed dimensions in fetching data for a certain table.
    //6esDb.fixDimFilter = function(name) {return $.extend([], getTbl(name).fixDimFilter);}; //Object of fixed dimensions, and their values, for a certain table.
    //6esDb.varDims = function(name) {return $.extend([], getTbl(name).varDims);}; //Array of variable dimensions in fetching data for a certain table.
    //6esDb.fields = function(name) {return $.extend([], getTbl(name).fields);}; //Array of fields that are stored in a certain table.
    //6esDb.fieldsInput = function(name) {return $.extend([], getTbl(name).fieldsInput);}; //Array of fields that are stored in a certain table, that uniquely specify a record.
    //6esDb.fieldsOutput = function(name) {return $.extend([], getTbl(name).fieldsOutput);}; //Array of fields that are stored in a certain table, that specify the observation.

    esDb.dataQ = function (name, varDimFilters) {
        if (!tblQs.hasOwnProperty(name)) throw Error("Table (or promise to table) '" + name + "' has not been found.");

        var dataQ = new Promise(function (resolve, reject) {
            var fetchedData = [],
                inflight = 0; //count how many ajax requests we're still waiting for.

            function checkFinished() {
                if (!inflight) resolve(fetchedData);
            }

            tblQs[name].then(function (tbl) {
                [].concat(varDimFilters).forEach(function (varDimFilter) {
                    //varDimFilter: single object with properties that are value arrays. singlevalFilters(varDimFilter): array of objects with properties that are single values.
                    singlevalFilters(varDimFilter).forEach(function (filter) {

                        if (tbl.data(fieldFilter(filter)).count()) return;

                        var url = dataUrl(tbl, filter);
                        inflight++;
                        $.get(url)
                            .done(function (xml) {
                                //console.log(url);//DEBUG
                                try {
                                    var records = parseDataXml(xml, tbl.fields); //might throw error
                                    if (records) {
                                        if (tbl.data(fieldFilter(filter)).count()) return; //records already obtained earlier (check again because of asynchronousity)
                                        tbl.data.insert(records);
                                        fetchedData = fetchedData.concat(records);
                                    }
                                } catch (e) {
                                    reject(e);
                                }
                            })
                            .fail(function (xhr, textStatus, error) {
                                reject(error);
                            }) //TODO: or: reject(Error(error.toString()));?
                            .always(function () {
                                inflight--;
                                checkFinished();
                            });
                    });
                });
                checkFinished();
            });
        });
        return dataQ;
    };
    function dataUrl(tbl, varDimFilter) {
        //Returns URL to obtain dataset as defined in config object.
        var url = "http://ec.europa.eu/eurostat/SDMX/diss-web/rest/data/" + tbl.name + "/",
            dimVals = [],
            dimString;

        tbl.dsd.dimensions.forEach(function (dim) {
            var dimVal;
            if (tbl.fixDimFilter.hasOwnProperty(dim)) dimVal = tbl.fixDimFilter[dim];
            else if (varDimFilter.hasOwnProperty(dim)) dimVal = varDimFilter[dim];
            else throw Error("Value for dimension '" + dim + "' (in table definition) given neither by table definition nor by the user. Use '' (empty string) to get all possible values for this dimension.");
            dimVals.push([].concat(dimVal));
        });
        dimString = dimVals.map(function (e) {
            return e.join("+");
        }).join(".");
        url += dimString;

        return url;
    }

    function parseDataXml(xml, fields) {
        var xmlData, //data series as in xml file
            newData = [], //data series as wanted
            converter = new X2JS(),
            errText;

        xmlData = converter.xml2json(xml);
        if (!xmlData.hasOwnProperty("GenericData")) throw Error("Unexpected xml document; node 'GenericData' not found");
        if (!xmlData["GenericData"].hasOwnProperty("DataSet")) {
            if (!xmlData["GenericData"].hasOwnProperty("Footer") || !xmlData["GenericData"]["Footer"].hasOwnProperty("Message") || !xmlData["GenericData"]["Footer"]["Message"].hasOwnProperty("Text")) throw Error("Unexpected xml document; nodes 'GenericData/DataSet'  AND 'GenericData/Footer/Message/Text' not found.");
            else {
                errText = [].concat(xmlData["GenericData"]["Footer"]["Message"]["Text"]).map(function (t) {
                    return t["__text"]
                }).join(", ");
                throw Error(errText);
            }
        }

        if (!xmlData["GenericData"]["DataSet"].hasOwnProperty("Series")) { //empty dataset, no results found OR too many results (wait and download later)
            errText = [].concat(xmlData["GenericData"]["Footer"]["Message"]["Text"]).map(function (t) {
                return t["__text"]
            }).join(", ");
            //No results found.
            if (errText === "No Results Found") return []; //empty
            //Too many for immediate return; must be downloaded later (show as error).
            else throw Error("Too many records to add immediately. (" + errText + ") Try again with more narrow query.");
        }
        xmlData = xmlData["GenericData"]["DataSet"]["Series"];//chop off uninteresting part

        [].concat(xmlData).forEach(function (d) { //turn into array if only 1 data set
            //get all data that remains the same (=unit, country, PRODUCT, indic_nrg, ...) in series
            var v_base = {};
            d["SeriesKey"]["Value"].forEach(function (skv) {
                var key = skv["_id"];
                if (fields.indexOf(key) > -1) v_base[key] = skv["_value"];
            });
            //get all value and year data from series
            [].concat(d["Obs"]).forEach(function (o) { //turn into array if only 1 observation value in data set
                var v = $.extend({}, v_base); //copy
                v.TIME = Number(o["ObsDimension"]["_value"]);
                if (o.hasOwnProperty("Attributes") && o["Attributes"].hasOwnProperty("Value") && o["Attributes"]["Value"].hasOwnProperty("_id") && o["Attributes"]["Value"]["_id"] === "OBS_STATUS") {
                    v.OBS_STATUS = o["Attributes"]["Value"]["_value"];
                    v.OBS_VALUE = v.OBS_STATUS === "na" ? null : 0; //value unknown: null. value (practically) zero: 0.
                } else {
                    v.OBS_VALUE = o["ObsValue"]["_value"];
                    if (v.OBS_VALUE === "NaN") v.OBS_VALUE = null;
                    else if (!isNaN(v.OBS_VALUE)) v.OBS_VALUE = Number(v.OBS_VALUE);
                    else throw Error("OBS_VALUE has unexpected value '" + v.OBS_VALUE + "' for dimensions " + JSON.stringify(v));
                }
                if (o.hasOwnProperty("Attributes") && o["Attributes"].hasOwnProperty("Value") && o["Attributes"]["Value"].hasOwnProperty("_id") && o["Attributes"]["Value"]["_id"] === "OBS_FLAG") {
                    v.OBS_FLAG = o["Attributes"]["Value"]["_value"];
                }
                newData.push(v);
            });
        });
        return newData;
    }

    function rst(tbl, fieldFilter, order) {
        //Get recordset that is described with fieldFilter object. Synchronous, searches in existing db.
        order = order || "TIME asec";//default
        fieldFilter = $.extend(true, {}, fieldFilter); //local copy
        Object.keys(fieldFilter).forEach(function (fld) {
            if (tbl.fields.indexOf(fld) === -1) throw Error("Unknown fieldname '" + fld + "' present in filter.");
            if (fieldFilter[fld] === "") delete fieldFilter[fld];
        });
        return tbl.data(fieldFilter).order(order).get();
    }

    esDb.rst = function (name, fieldFilter, order) {
        //Get recordset that is described with fieldFilter object. Synchronous, searches in existing db.
        if (!tbls.hasOwnProperty(name)) throw Error("Table '" + name + "' has not been found.");
        return rst(tbls[name], fieldFilter, order);
    };
    esDb.rstQ = function (name, fieldFilter, order) {
        //Get promise to recordset that is described with fieldFilter object. Asynchronous, fetch data first if necessary.
        if (!tblQs.hasOwnProperty(name)) throw Error("Table (or promise to table) '" + name + "' has not been found.");
        var rstQ = new Promise(function (resolve, reject) {
            //Fetch (missing) data, get recordset, and use in callback.
            tblQs[name].then(function (tbl) {
                esDb.dataQ(tbl.name, varDimFilter(tbl.varDims, fieldFilter))
                    .then(function () {
                        resolve(rst(tbl, fieldFilter, order));
                    }) //don't use argument passed to dataQ's resolve function, because that contains only the FRESHLY ADDED data.
                    .catch(function (error) {
                        reject(error);
                    })
            });
        });
        return rstQ;
    };
    function varDimFilter(varDims, fieldFilter) {
        //Turn fieldFilter into varDimFilter, for use in .dataQ().
        var varDimFilter = {};
        varDims.forEach(function (dim) {
            var val = fieldFilter[dim];
            if (!val || $.isPlainObject(val)) varDimFilter[dim] = ""; //dimension left out (val == undefined) or query object. Either case: must get data for all available values.
            else varDimFilter[dim] = val;
        });
        return varDimFilter;
    }

    function fieldFilter(varDimFilter) {
        //Turn varDimFilter into fieldFilter, for use in taffy(). I.e.: remove empty values from varDimFilter.
        var fieldFilter = {};
        Object.keys(varDimFilter).forEach(function (dim) {
            var val = varDimFilter[dim];
            if (val !== "") fieldFilter[dim] = val;
        });
        return fieldFilter;
    }

    function allPropValCombinations(obj) {
        //From an object, of which the properties are arrays of values, create an array of objects, of which the properties
        // are single values. The objects in the returned array contain all possible combinations of array values for the
        // individual properties, so if there are 3 properties with 4-element arrays each, there will be 64 (4^3) objects
        // in the returned array.
        // E.g. in: {prop1:[1,2], prop2:['a','b']} --> out: [{prop1:1, prop2:'a'}, {prop1:1, prop2:'b'}, ...]
        var obj = $.extend({}, obj), //local copy to not affect input object.
            keys = Object.keys(obj);

        if (keys.length == 0) {
            return [
                {}
            ];
        } else {
            var result = [],
                key = keys[0],
                arr = pop(obj, key)[key],//take (remove) one property from object and get value array for that property
                restCombinations = allPropValCombinations(obj);  // recur with the rest of object
            for (var i = 0; i < restCombinations.length; i++) {
                if (!(arr instanceof Array)) arr = [arr];//increase robustness, in case of only one value that's not put in 1-element array.
                for (var j = 0; j < arr.length; j++) {
                    var objToAdd = $.extend({}, restCombinations[i]);//make copy
                    objToAdd[key] = arr[j];//and add property-value-pair
                    result.push(objToAdd);
                }
            }
            return result;
        }
    }

    function singlevalFilters(multivalFilter) {
        return allPropValCombinations(multivalFilter);
    }//alias to make code more readable.

    function pop(obj, key) {
        var value = {};
        value[key] = obj[key];
        delete obj[key];
        return value;
    }

    return esDb;
}