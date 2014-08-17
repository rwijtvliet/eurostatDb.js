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
 * .fields()
 *      Array of fields that are stored in a local table for a certain dataflow. These are used in getting data out of the table (see .getRst, below).
 *      Arguments: dataflow name.
 *      Return: clone of array of field names.
 *
 * .varDims()
 *      Array of variable dimensions for a certain dataflow. These are used in fetching data to store in the table (see .fetchData, below).
 *      Arguments: dataflow name.
 *      Return: clone of array of dimension names.
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
 *                 fieldFilter object.
 *                 (optional) order string, e.g. "OBS_VALUE asec" or "TIME desc". If omitted: ordered by ascending TIME field value.
 *      Return: array with records; each record is object with (field:value) pairs.
 *
 * .fetchRst()
 *      Get data (record set) from local database and fetch, through eurostat API, any data that might be missing.
 *      Arguments: dataflow name.
 *                 fieldFilter object.
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
 *  }
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
//TODO: turn into ECMA6
//TODO: find out how the informational flag (OBS_FLAG="i") is represented in metadata --> answer: not necessary; "i" is deprecated.

//Make sure Object.keys function is available in all browsers. May be removed in due time.
if (typeof Object.keys != 'function') {
    Object.keys = function(obj) {
        if (typeof obj != "object" && typeof obj != "function" || obj == null) throw new TypeError("Object.keys called on non-object");
        var keys = [];
        for (var p in obj) obj.hasOwnProperty(p) && keys.push(p);
        return keys;
    }
}
function eurostatDb () {
    var esDb = {},
        dfs = [],//Dataflow objects (see above)
        dsds = [],//Data Structure Definition objects (see above)
        tbls = [];//Table objects (see above)

    esDb.dfNames = function () {return dfs.map(function(df){return df.name;});};
    esDb.df = function (name) {return $.extend(true, {}, getDf(name));}; //immutable
    esDb.fetchDfs = function (filter, callback){
        //Get array of all dataflows that are available from API that comply to filter, and save to internal 'dfs' array.
        var url = "js/all_latest_ESTAT_references=none_detail=full.xml";
        //originally found at "http://www.ec.europa.eu/eurostat/SDMX/diss-web/rest/dataflow/ESTAT/all/latest", cannot be fetched by machine (protected?)

        if (arguments.length === 1 && typeof arguments[0] === "function") {
            filter = undefined;
            callback = arguments[0];
        }

        $.get(url)
            .done(function (xml) {
                dfs = parseDfsXml(xml, filter);
                if (typeof callback === "function") callback(null, $.extend(true, [], dfs));
            })
            .fail(function (xhr, textStatus, error) {
                if (typeof callback === "function") callback(new Error(error.toString()), undefined); //no callback --> no error
            });

        return esDb;
    };
    function parseDfsXml (xml, filter){
        //Parse xml data describing all dataflows that are available from API.
        var dfsXml,//all dataflow data in xml file
            dfs = [],
            converter = new X2JS();

        //Parse.
        dfsXml = converter.xml2json(xml);
        dfsXml["Structure"]["Structures"]["Dataflows"]["Dataflow"].forEach(function(d) {
            var df = {
                    name: d["_id"],
                    descrs: []
                },
                add = true;

            d["Name"].forEach(function(n){
                switch(n["_xml:lang"]) {
                    case "en": df.descrs[0] =  n["__text"]; break;
                    case "de": df.descrs[1] =  n["__text"]; break;
                    case "fr": df.descrs[2] =  n["__text"]; break;
                }
            });

            //Filter, if needed.
            if (filter) {
                add = false;
                [].concat(filter).forEach(function(filterTerm) {
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

    esDb.dsdNames = function () {return dsds.map(function(dsd){return dsd.name;});};
    esDb.dsd = function (name) {return $.extend(true, {}, getDsd(name));}; //immutable.
    esDb.fetchDsd = function (name, callback) {
        //Get data flow definition from certain table and add to corresponding dsd array.
        var dsd = getDsd(name),
            url = "http://ec.europa.eu/eurostat/SDMX/diss-web/rest/datastructure/ESTAT/DSD_" + name;

        if (dsd) {//dsd already obtained earlier
            if (typeof callback === "function") callback(null, $.extend(true, {}, dsd));
            return esDb;
        }
        $.get(url)
            .done(function (xml) {
                dsd = getDsd(name);
                if (dsd) {//dsd already obtained earlier (check again because of asynchronousity)
                    if (typeof callback === "function") callback(null, $.extend(true, {}, dsd));
                }
                dsd = parseDsdXml(xml);
                dsd.name = name;

                dsds.push(dsd);
                if (typeof callback === "function") callback(null, $.extend(true, {}, dsd));
            })
            .fail(function (xhr, textStatus, error) {
                if (typeof callback === "function") callback(new Error(error.toString()), undefined);
            });
        return esDb;
    };
    function parseDsdXml (xml){
        //Parse xml data describing data flow definition of certain dataflow.
        var dsdXml,//data structure definition data in xml file
            dsd = {
                name: "",
                dimensions: [],
                concepts: [],
                codelists: []
            },
            converter = new X2JS(),
            renameCodelists = {"Observation flag.":"OBS_FLAG", "Observation status.":"OBS_VALUE"};

        //Parse: dimensions.
        dsdXml = converter.xml2json(xml);
        [].concat(dsdXml["Structure"]["Structures"]["DataStructures"]["DataStructure"]["DataStructureComponents"]["DimensionList"]["Dimension"]).forEach(function(dim) {
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
        [].concat(dsdXml["Structure"]["Structures"]["Concepts"]["ConceptScheme"]["Concept"]).forEach(function(con) {
            dsd.concepts.push(con["_id"]);
        });
        //Parse: codelists.
        [].concat(dsdXml["Structure"]["Structures"]["Codelists"]["Codelist"]).forEach(function(clist) {
            var codes = [];
            [].concat(clist["Code"]).forEach(function(code){
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
    esDb.codelist = function(name, fldName) {
        if (!fldName) {
            try {
                return getDsd(name).codelists;
            } catch(e) {throw Error("Dsd for " + name + " not found");}
        } else {
            try {
                return $.grep(getDsd(name).codelists, function(codelist){return codelist.name === fldName;})[0].codes;
            } catch(e) {throw Error("Dsd for " + name + ", or fieldname " + fldName + " not found");}
        }
    };
    esDb.codelistDict = function(name, fldName) {
        var dict = {};
        if (!name) {
            var names = dsds.map(function (dsd) {return dsd.name;});
            names.forEach(function (name) {dict[name] = esDb.codelistDict(name);});
        } else if (!fldName) {
            try {
                var fldNames = getDsd(name).codelists.map(function(codelist){return codelist.name;});
                fldNames.forEach(function (fldName) {dict[fldName] = esDb.codelistDict(name, fldName)});
            } catch(e) {throw Error("Dsd for " + name + " not found");}
        } else {
            try {
                var codes = $.grep(getDsd(name).codelists, function(codelist){return codelist.name === fldName;})[0].codes; //problem if fldName not found
                codes.forEach(function (code) {dict[code.name] = code.descr;});
            } catch(e) {throw Error("Dsd for " + name + ", or fieldname " + fldName + " not found");}
        }
        return dict;
    };
    esDb.dimensions = function(name) {return $.extend([], getDsd(name).dimensions);}; //Array of all the dimensions.

    esDb.initTable = function (name, fixDimFilter, timePeriod, callback) {
        //Get arguments straight.
        var n = arguments.length;
        if (n === 2 || n === 3) {
            if (typeof arguments[n-1] === "function") {callback = arguments[n-1]; n--;}// if last argument is function, it is the callback. Otherwise, the callback is undefined (automatically).
            if (n === 3) {//both were passed
                fixDimFilter = arguments[1];
                timePeriod = arguments[2];
            } else if (n === 1) {//neither was passed
                fixDimFilter = undefined;
                timePeriod = undefined;
            } else {//one was passed
                if (arguments[1] && (arguments[1].hasOwnProperty("startYear") || arguments[1].hasOwnProperty("endYear"))) {
                    timePeriod = arguments[1];
                    fixDimFilter = undefined;
                } else {
                    fixDimFilter = arguments[1];
                    timePeriod = undefined;
                }
            }
        }
        if (fixDimFilter && !Object.keys(fixDimFilter).length) fixDimFilter = undefined; //empty object --> undefined
        if (timePeriod && !Object.keys(timePeriod).length) timePeriod = undefined; //empty object --> undefined

        //Make sure dsd does already exist.
        var dsd = getDsd(name);
        if (!(dsd)) {
            esDb.fetchDsd(name, function(error){
                if (error) {
                    if (typeof callback === "function") callback(error);
                } else {
                    esDb.initTable(name, fixDimFilter, timePeriod, callback)
                }
            });//retry to add table when dsd is fetched
            return esDb;
        }

        //Check if tbl does already exist. If so, delete
        var tbl = getTbl(name);
        if (tbl) {tbls[tblIndex(name)] = tbls[tbls.length-1]; tbls.pop();} //Table is already in db; delete.

        //Make table.
        tbl = {
            name: name,
            /*archive: {fixDimFilter: fixDimFilter, timePeriod: timePeriod},//arguments with which table was initialised*/
            fixDims: [],
            fixDimFilter: {},
            varDims: [],
            fields: [],
            dsd: dsd, //properties dimensions, concepts, codelists, and name (=redundant)
            data: TAFFY() //database itself
        };

        //Dimensions: split into fixed and variable.
        tbl.dsd.dimensions.forEach(function(dim){
            if (dim === "TIME_PERIOD") return;//exclude dimension TIME_PERIOD from appearing anywhere (is added later)
            if (fixDimFilter && fixDimFilter.hasOwnProperty(dim)) {
                tbl.fixDims.push(dim);
                tbl.fixDimFilter[dim] = fixDimFilter[dim];
            } else tbl.varDims.push(dim);
        });

        //Time period: add to fixed dimensions.
        var period = "";
        if (timePeriod){
            if (!isNaN(timePeriod.startYear)) period = "startPeriod=" + timePeriod.startYear;
            if (!isNaN(timePeriod.endYear)) {
                if (period) period += "&";
                period += "endPeriod=" + timePeriod.endYear;
            }
            if (period) period = "/?" + period;
        }

        tbl.fixDims.push("TIME_PERIOD");
        tbl.fixDimFilter["TIME_PERIOD"] = period;

        //Get table fields.
        tbl.dsd.concepts.forEach(function(con) {if (!tbl.fixDimFilter.hasOwnProperty(con)) tbl.fields.push(con); });

        tbls.push(tbl);

        if (typeof callback === "function") callback(null, $.extend(true,{},tbl));
        return esDb;
    };
    esDb.tblNames = function (){return tbls.map(function(tbl){return tbl.name;});};
    esDb.tbl = function(name) {var tbl = getTbl(name); if (!tbl) return undefined; else return $.extend(true, {}, tbl);}; //immutable
    esDb.fields = function(name) {return $.extend([], getTbl(name).fields);}; //Array of fields that are stored in a certain table.
    esDb.varDims = function(name) {return $.extend([], getTbl(name).varDims);}; //Array of variable dimensions in fetching data for a certain table.
    esDb.fixDims = function(name) {return $.extend([], getTbl(name).fixDims);}; //Array of fixed dimensions in fetching data for a certain table.
    esDb.fixDimFilter = function(name) {return $.extend([], getTbl(name).fixDimFilter);}; //Object of fixed dimensions, and their values, for a certain table.

    esDb.fetchData = function (name, varDimFilters, callback) {
        var errors = "",
            fetchedData = [];
        var tbl = getTbl(name),
            inflight = 0; //count how many ajax requests we're still waiting for.

        if (!(tbl)) {callback(new Error("No table found to store data from dataflow '" +  name + "'. Make sure you have run .initTable()")); return esDb;}

        function errCollect(e) {
            if (!(typeof e === "string")) e = e.toString();
            if (errors.indexOf(e) > -1) return;
            if (errors) errors += " | " + e; else errors = e;
        }
        function checkFinished() {
            if (inflight || !(typeof callback === "function")) return;
            errors = (errors) ? new Error(errors) : null;
            callback(errors, fetchedData);
        }

        [].concat(varDimFilters).forEach(function (varDimFilter) {
            //varDimFilter: single object with properties that are value arrays. singlevalFilters(varDimFilter): array of objects with properties that are single values.
            singlevalFilters(varDimFilter).forEach(function (filter) {

                if (tbl.data(fieldFilter(filter)).count()) return;

                try {var url = dataUrl(tbl.name, filter);}
                catch (e) {errCollect(e); return;}
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
                        } catch (e) {errCollect(e);}
                    })
                    .fail(function (xhr, textStatus, e) {errCollect(e);})
                    .always(function () {
                        inflight--;
                        checkFinished();
                    });
            });
        });
        checkFinished();
        return esDb;
    };
    function dataUrl (name, varDimFilter) {
        //Returns URL to obtain dataset as defined in config object.
        var tbl = getTbl(name),
            url = "http://ec.europa.eu/eurostat/SDMX/diss-web/rest/data/" + tbl.name + "/",
            dimVals = [],
            dimString;

        tbl.dsd.dimensions.forEach(function (dim) {
            var dimVal;
            if (tbl.fixDimFilter.hasOwnProperty(dim)) dimVal = tbl.fixDimFilter[dim];
            else if (varDimFilter.hasOwnProperty(dim)) dimVal = varDimFilter[dim];
            else throw Error("Value for dimension '" + dim + "' (in table definition) given neither by table definition nor by the user. Use '' (empty string) to get all possible values for this dimension.");
            dimVals.push([].concat(dimVal));
        });
        dimString = dimVals.map(function (e) {return e.join("+");}).join(".");
        url += dimString;

        return url;
    }
    function parseDataXml(xml, fields){
        var xmlData, //data series as in xml file
            newData = [], //data series as wanted
            converter = new X2JS(),
            errText;

        xmlData = converter.xml2json(xml);
        if (!xmlData.hasOwnProperty("GenericData")) throw Error("Unexpected xml document; node 'GenericData' not found");
        if (!xmlData["GenericData"].hasOwnProperty("DataSet")) {
            if (!xmlData["GenericData"].hasOwnProperty("Footer") || !xmlData["GenericData"]["Footer"].hasOwnProperty("Message") || !xmlData["GenericData"]["Footer"]["Message"].hasOwnProperty("Text")) throw Error("Unexpected xml document; nodes 'GenericData/DataSet'  AND 'GenericData/Footer/Message/Text' not found.");
            else {
                errText = [].concat(xmlData["GenericData"]["Footer"]["Message"]["Text"]).map(function(t){return t["__text"]}).join(", ");
                throw Error(errText);
            }
        }

        if (!xmlData["GenericData"]["DataSet"].hasOwnProperty("Series")) { //empty dataset, no results found OR too many results (wait and download later)
            errText = [].concat(xmlData["GenericData"]["Footer"]["Message"]["Text"]).map(function(t){return t["__text"]}).join(", ");
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

    esDb.getRst = function (name, fieldFilter, order) {
        //Get recordset that is described with fieldFilter object. Synchronous, searches in existing db.
        order = order || "TIME asec";//default
        fieldFilter = $.extend(true, {}, fieldFilter); //local copy
        var tbl = getTbl(name);
        if (!(tbl)) throw Error("No table found with data for dataflow '" + name + "'. Make sure you have run .initTable()");
        Object.keys(fieldFilter).forEach(function (fld) {
            if (tbl.fields.indexOf(fld) === -1) throw Error("Unknown fieldname '" + fld + "' present in filter.");
            if (fieldFilter[fld] === "") delete fieldFilter[fld];
        });
        return tbl.data(fieldFilter).order(order).get();
    };

    esDb.fetchRst = function(name, fieldFilter, order, callback){
        var tbl = getTbl(name);
        if (typeof order === "function") {callback = order; order = undefined;}

        //Get recordset that is described with fieldFilter object. Asynchronous, fetch data first if necessary.
        if (!(tbl)) {
            if (typeof callback === "function") callback(Error("No table found with data for dataflow '" + name + "'. Make sure you have run .initTable()"));
            return esDb;
        }
        //Fetch (missing) data, get recordset, and use in callback.
        esDb.fetchData(name, varDimFilter(tbl, fieldFilter), function (error) {
            if (!error) {
                try {var rst = esDb.getRst(name, fieldFilter, order);}
                catch (e) {error = e;}
            }
            if (typeof callback === "function") callback(error, rst);
        });
        return esDb;
    };
    function varDimFilter(tbl, fieldFilter){
        var varDimFilter = {};
        tbl.varDims.forEach(function (dim) {
            var val = fieldFilter[dim];
            if (!val || $.isPlainObject(val)) varDimFilter[dim] = ""; //dimension left out (val == undefined) or query object. Either case: must get data for all available values.
            else varDimFilter[dim] = val;
        });
        return varDimFilter;
    } //Turn fieldFilter into varDimFilter, for use in .fetchData().
    function fieldFilter(varDimFilter){
        var fieldFilter = {};
        Object.keys(varDimFilter).forEach(function(dim){
            var val = varDimFilter[dim];
            if (val !== "") fieldFilter[dim] = val;
        });
        return fieldFilter;
    } //Turn varDimFilter into fieldFilter, for use in taffy().

    function allPropValCombinations(obj) {
        //From an object, of which the properties are arrays of values, create an array of objects, of which the properties
        // are single values. The objects in the returned array contain all possible combinations of array values for the
        // individual properties, so if there are 3 properties with 4-element arrays each, there will be 64 (4^3) objects
        // in the returned array.
        // E.g. in: {prop1:[1,2], prop2:['a','b']} --> out: [{prop1:1, prop2:'a'}, {prop1:1, prop2:'b'}, ...]
        var obj = $.extend(true, {}, obj), //local copy to not affect input object.
            keys = Object.keys(obj);

        if (keys.length == 0) {
            return [{}];
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
    function singlevalFilters(multivalFilter) {return allPropValCombinations(multivalFilter);}//alias to make code more readable.

    function getDf(name)  {return $.grep(dfs,  function(df) {return (df.name === name);})[0];}
    function getDsd(name) {return $.grep(dsds, function(dsd){return (dsd.name === name);})[0];}
    function getTbl(name) {return $.grep(tbls, function(tbl){return (tbl.name === name);})[0];}
    function tblIndex(name) {return tbls.map(function(tbl){return tbl.name;}).indexOf(name);}

    function pop(obj, key) {var value = {}; value[key] = obj[key]; delete obj[key]; return value;}
    return esDb;
}