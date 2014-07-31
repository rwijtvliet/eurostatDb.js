/**
 * Created by ruud wijtvliet (rwijtvliet@gmail.com).
 *
 * Much information about the Eurostat data API is found here:
 * http://epp.eurostat.ec.europa.eu/portal/page/portal/sdmx_web_services/getting_started/rest_sdmx_2.1
 *
 *
 * Use of this library:
 *
 *
 * ABBREVIATIONS:
 *
 * df = dataflow
 * dfs = dataflows
 * dsd = data structure definition
 * dsds = data structure definitions
 *
 *
 *
 * DESCRIPTION OF METHODS
 *
 * .fetchDfs()
 *      Prepare dataflow objects that describe what data are available from eurostat server.
 *      Arguments: (optional) filter word, or array with filter words, of which dataflow name or dataflow description must include >=1 to be saved. If omitted or "": all available on eurostat server.
 *                 (optional) callback function with as argument a clone of the array of df objects.
 *      Return: eurostatDb module itself.
 *
 * .dfNames()
 *      Array of fetched dataflow names.
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
 *                 (optional) callback function called after dsd retrieval, with as argument a clone of the dsd object.
 *      Return: eurostatDb module itself.
 *
 * .namesWithDsd()
 *      Array of dataflow names for which the dsd has been fetched.
 *      Arguments: none.
 *      Return: array of dataflow names.
 *
 * .dsd()
 *      Fetched data structure definition (dsd) object.
 *      Arguments: dataflow name.
 *      Return: clone of dsd object.
 *
 * .dimensions()
 *      Array of dimensions for a certain dataflow.
 *      Arguments: dataflow name.
 *      Return: clone of array of dimension names.
 *
 * .codeList()
 *      Array with codes, and their description, that can be used/found for certain field.
 *      Arguments: dataflow name.
 *                 name of field (or dimension) of which the list of possible codes is wanted.
 *      Return: clone of code list.
 *
 * .addTable()
 *      Initialise table in database to store data.
 *      Arguments: tblConfig object.
 *                 (optional) callback function called after tbl initialisation, with as argument a clone of the tbl object.
 *      Return: eurostatDb module itself.
 *
 * .tbl()
 *      Table object.
 *      Arguments: (optional) dataflow name. If omitted or "": all available in database array.
 *      Return: clone of table object.
 *
 * .namesWithTbl()
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
 *      Object of the fixed dimensions, and the values they are fixed to.
 *      Arguments: dataflow name.
 *      Return: clone of object of (dimension name: value) pairs.
 *
 * .fetchData()
 *      Fetch, through eurostat server API, certain data. (asynchronous)
 *      Arguments: dataConfig object, or array of dataConfig objects, describing which data should be fetched.
 *                 (optional) callback function called each time a piece of data (records) is retrieved, with as argument the records.
 *                            If all necessary data is already present in the database, the function is called as well, with as argument 'undefined'.
 *      Return: eurostatDb module itself.
 *
 * .getRst()
 *      Get data (record set) from local database.
 *      Arguments: rstConfig object, describing which data is wanted.
 *      Return: array with records; each record is object with (field:value) pairs.
 *
 *
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
 * table configuration (tblConfig) object {
 *      name: "dataflowname",
 *      fixDims: {                          //Defines which of the dimensions are fixed (and not stored as fields in database). Subset of dsd.dimensions (without TIME_PERIOD).
 *          field1:"value1",
 *          field2:"value2",
 *          ...
 *      }
 *      (optional) timePeriod: {            //Years of which data must be retrieved (end points inclusive). If one omitted: half-open interval. If both omitted: all available years.
 *          startYear:value,
 *          endYear:value
 *      }
 * }
 *
 * data fetch configuration (dataConfig) object {
 *      name: "dataflowname",
 *      varDimFilter: {                     //Defines, for each field in the varDims array of the tbl object (see above), which values should be fetched.
 *          field1: ["value", ...],
 *          field2: ["value", ...],
 *          ...
 *      }
 * }
 *
 * recordset configuration (rstConfig) object {
 *      name: "dataflowname",
 *      fieldFilter: {                      //Defines, for zero or more fields in the fields array of the tbl object (see above), which values should be gotten.
 *          field1: "value",
 *          field2: "value",
 *          ...
 *       }
 * }
 *
 *
 * DEPENDENCIES
 *
 * jQuery (http://jquery.com/)
 * xml2json (https://github.com/abdmob/x2js) to convert xml into json
 * taffydb (https://github.com/typicaljoe/taffydb) to store information
 *
 */


//Make sure Object.keys function is available in all browsers. May be removed in due time.
if (typeof Object.keys != 'function') {
    Object.keys = function(obj) {
        if (typeof obj != "object" && typeof obj != "function" || obj == null) throw TypeError("Object.keys called on non-object");
        var keys = [];
        for (var p in obj) obj.hasOwnProperty(p) && keys.push(p);
        return keys;
    }
}

function eurostatDb () {
    var esDb = {},
        dfs = [],//Dataflow objects {name: "", descrs: ["", ...]}
        dsds = [],//Data Structure Definition objects {name: "", dimensions:[""], concepts:[""], codelists:[{name:"",codes:[{}]] }
        db = []/*
            {
                name: "nrg_100a",
                fields: ["geo", "indic_nrg", "product", "year", "value"], //fields in database (i.e., data property of this object)
                filterFields: ["geo", "indic_nrg", "product"],
                dimensions: ["freq", "unit", "product", "indic_nrg", "geo", "timeperiod"],//fields (and order) of which values need to be passed to api to get data
                fixedDimensions: {freq:['A'], unit:['TJ'], timeperiod:['']},//fields in api data set, but not saved because always same value (only 1 value available from api, or only 1 of possible values of interest to us)
                data: TAFFY()
            },
            {
                name: "demo_pjan",
                fields: ["geo", "year", "value"],
                filterFields: ["geo"],
                dimensions: ["freq", "age", "sex", "geo", "timeperiod"],//must be array because order is important
                fixedDimensions: {freq:['A'], age:['TOTAL'], sex:['T'], timeperiod:['']},
                data: TAFFY()
            }
        ];*/;


    function plotIfReady(rstConfig) {
        //Check data and plot/update graph.
        if (!allDataAvailable(rstConfig)) return false;

        var tblName = rstConfig.name,
            filter = rstConfig.filter,
            rst = getTbl(tblName).data(filter),
            data = rst.get();
        //console.log("found " + rst.count() + " records to plot: " + JSON.stringify(data, null, 2));//DEBUG
        d3.select("#inf")
            .datum(data)
            .call(myGr);//TODO: take out of database
    }

    function allDataAvailable (rstConfig) {
        //Check if all data that is to be plotted is available for plotting.
        var tbl = getTbl(rstConfig.name),
            filters = singlevalFilters(rstConfig.filter),
            allAvailable = true;

        filters.forEach(function(filter){
            if (!allAvailable) return;
            if (!(tbl.data(filter).count())) allAvailable = false;
        });
        return allAvailable;
    }



    esDb.dfNames = function () {return dfs.map(function(df){return df.name;});};
    esDb.df = function (name) {return $.extend(true, {}, getDf(name));}; //immutable
    esDb.fetchDfs = function (filter, callback){
        //Get array of all dataflows that are available from API that comply to filter, and save to internal 'dfs' array.
        var url = "js/all_latest_ESTAT_references=none_detail=full.xml";
        //originally found at "http://www.ec.europa.eu/eurostat/SDMX/diss-web/rest/dataflow/ESTAT/all/latest", cannot be read by machine (protected?)

        if (typeof filter === "string") filter = [filter];

        $.ajax(url, {
            success: function(xml) {
                dfs = parseDfsXml(xml, filter);
                if (typeof callback === "function") callback($.extend(true, [], dfs));
            },
            error: function(x, error) {throw error;}
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
                filter.forEach(function(filterTerm) {
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

    esDb.namesWithDsd = function () {return dsds.map(function(dsd){return dsd.name;});};
    esDb.dsd = function (name) {return $.extend(true, {}, getDsd(name));}; //immutable.
    esDb.fetchDsd = function (name, callback) {
        //Get data flow definition from certain table and add to corresponding dsd array.
        var dsd = getDsd(name),
            url = "http://ec.europa.eu/eurostat/SDMX/diss-web/rest/datastructure/ESTAT/DSD_" + name;

        if (dsd) return; //dsd already obtained earlier

        $.ajax(url, {
            success: function (xml) {
                if (dsd) return; //dsd already obtained earlier (check again because of asynchronosity)
                dsd = parseDsdXml(xml);
                dsd.name = name;

                dsds.push(dsd);
                if (typeof callback === "function") callback($.extend(true, {}, dsd));
            }
        });
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


        //Parse.
        dsdXml = converter.xml2json(xml);
        dsdXml["Structure"]["Structures"]["DataStructures"]["DataStructure"]["DataStructureComponents"]["DimensionList"]["Dimension"].forEach(function(dim) {
            dsd.dimensions[+(dim._position) - 1] = dim["_id"];
        });
        var t = dsdXml["Structure"]["Structures"]["DataStructures"]["DataStructure"]["DataStructureComponents"]["DimensionList"]["TimeDimension"];
        dsd.dimensions[+(t["_position"]) - 1] = t["_id"];
        dsdXml["Structure"]["Structures"]["Concepts"]["ConceptScheme"]["Concept"].forEach(function(con) {
            dsd.concepts.push(con["_id"]);
        });
        dsdXml["Structure"]["Structures"]["Codelists"]["Codelist"].forEach(function(clist) {
            var codes = [];
            if (!(clist["Code"] instanceof Array)) clist["Code"] = [clist["Code"]];
            clist["Code"].forEach(function(code){
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

        //Additional information for analysis.
        /*
        dsd.conceptsNotInDimensions = [];
        dsd.concepts.forEach(function(con){
            if (dsd.dimensions.indexOf(con)===-1) dsd.conceptsNotInDimensions.push(con);
        });
        dsd.dimensionsNotInConpects = [];
        dsd.dimensions.forEach(function(dim){
            if (dsd.concepts.indexOf(dim)===-1) dsd.dimensionsNotInConpects.push(dim);
        });*/

        return dsd;
    }
    esDb.codeList = function(name, fldName) {return $.extend([], $.grep(getDsd(name).codelists, function(codelist){return codelist.name === fldName;})[0].codes);}; //Array of the names, and the meaning, of the codes that a field or dimension may take.
    esDb.dimensions = function(name) {return $.extend([], getDsd(name).dimensions);}; //Array of all the dimensions.

    esDb.addTable = function (name, fixDims, timePeriod, callback) {
        var dsd = getDsd(name),
            tbl,
            i = tblIndex(name);

        if (!(dsd)) {
            esDb.fetchDsd(name, function(){
                esDb.addTable(name, fixDims, timePeriod, callback)
            });//retry to add table when dsd is fetched
            return;
        }
        if (i > -1) {//Table is already in db; delete.
            db[i] = db[db.length-1];
            db.pop();
        }

        tbl = {
            name: dsd.name,
            fixDims: {},
            varDims: [],
            fields: [],
            dsd: dsd //properties dimensions, concepts, codelists, and name (=redundant)
        };

        //Dimensions: split into fixed and variable.
        tbl.dsd.dimensions.forEach(function(dim){
            if (dim === "TIME_PERIOD") return;//exclude dimension TIME_PERIOD from appearing anywhere (is added later)
            if (fixDims.hasOwnProperty(dim)) {
                tbl.fixDims[dim] = fixDims[dim];
            } else {
                tbl.varDims.push(dim);
            }
        });

        //Time period: add to fixed dimensions.
        var period = "";
        if (timePeriod){
            if (!isNaN(timePeriod.startYear)) period = "startPeriod=" + tblConfig.timePeriod.startYear;
            if (!isNaN(timePeriod.endYear)) {
                if (period) period += "&";
                period += "endPeriod=" + timePeriod.endYear;
            }
            if (period) period = "/?" + period;
        }
        tbl.fixDims["TIME_PERIOD"] = period;

        //Get table fields.
        tbl.dsd.concepts.forEach(function(con) {
            if (!tbl.fixDims.hasOwnProperty(con)) tbl.fields.push(con);
        });

        //Database itself.
        tbl.data = TAFFY();

        db.push(tbl);

        if (typeof callback === "function") callback($.extend(true,{},tbl));

        return esDb;
    };
    esDb.namesWithTbl = function (){return db.map(function(tbl){return tbl.name;});};
    esDb.tbl = function(name) {return $.extend(true, {}, getTbl(name));}; //immutable
    esDb.fields = function(name) {return $.extend([], getTbl(name).fields);}; //Array of fields that are stored in a certain table.
    esDb.varDims = function(name) {return $.extend([], getTbl(name).varDims);}; //Array of variable dimensions in fetching data for a certain table.
    esDb.fixDims = function(name) {return $.extend([], getTbl(name).fixDims);}; //Object of fixed dimensions, and their values, for a certain table.

    esDb.fetchData = function (name, varDimFilter, callback) {
        var tbl = getTbl(name),
            filters = singlevalFilters(varDimFilter), //varDimFilter: single object with properties that are value arrays.
                                                      //filters: array of objects with properties that are single values.
            fetchCount = 0;
        filters.forEach(function(filter){
            if (!(tbl.data(filter).count())) {
                var url = dataUrl(tbl.name, filter);
                fetchCount++;
                $.ajax(url, {
                    success: function(xml) {
                        var records = parseDataXml(xml, tbl.fields);
                        tbl.data.insert(records);
                        if (typeof callback === "function") callback(records);
                    }
                });
            }
        });
        if ((!fetchCount) && (typeof callback === "function")) callback(undefined);
        return esDb;
    };
    function dataUrl (name, varDimFilter) {
        //Returns URL to obtain dataset as defined in config object.
        var tbl = getTbl(name),
            url = "http://ec.europa.eu/eurostat/SDMX/diss-web/rest/data/" + tbl.name + "/",
            dimVals = [],
            dimString;

        tbl.dsd.dimensions.forEach(function(dimension){
            var dimVal;
            if (tbl.fixDims.hasOwnProperty(dimension)) dimVal = tbl.fixDims[dimension];
            else if (varDimFilter.hasOwnProperty(dimension)) dimVal = varDimFilter[dimension];
            else throw "A value for the dimension '" + dimension + "' is needed according to the 'dimensions' property of the table definition. However, a value was not given by the user and also not by the fixedDimensions of the table definition.";
            if (!(dimVal instanceof Array)) dimVal = [dimVal];//increase robustness, in case of only one value that's not put in 1-element array.
            dimVals.push(dimVal);
        });
        dimString = dimVals.map(function(e){return e.join("+");}).join(".");

        url += dimString;
        return url;
    }
    function parseDataXml(xml, fields){
        var xmlData, //data series as in xml file
            newData = [], //data series as wanted
            converter = new X2JS();

        xmlData = converter.xml2json(xml);
        if (!xmlData.hasOwnProperty("GenericData")) throw "Unexpected xml document; node 'GenericData' not found";
        if (!xmlData["GenericData"].hasOwnProperty("DataSet")) {
            if (!xmlData["GenericData"].hasOwnProperty("Footer") || !xmlData["GenericData"]["Footer"].hasOwnProperty("Message") || !xmlData["GenericData"]["Footer"]["Message"].hasOwnProperty("Text")) throw "Unexpected xml document; nodes 'GenericData/DataSet'  AND 'GenericData/Footer/Message/Text' not found.";
            else throw "Unexpected xml document; message from server:\n" + xmlData["GenericData"]["Footer"]["Message"]["Text"].join('\n');
        }
        xmlData = xmlData["GenericData"]["DataSet"]["Series"];//chop off uninteresting part

        if (xmlData.hasOwnProperty("SeriesKey")) xmlData = [xmlData];//fix: problem with array if only 1 country
        xmlData.forEach(function (d) {
            //get all data that remains the same (=unit, country, product, indic_nrg, ...) in series
            var v_base = {};
            d["SeriesKey"]["Value"].forEach(function (skv) {
                var key = skv["_id"];
                if (fields.indexOf(key) > -1) v_base[key] = skv["_value"];
            });
            //get all value and year data from series
            d["Obs"].forEach(function (o) {
                var v = $.extend({}, v_base); //copy
                v.TIME = Number(o["ObsDimension"]["_value"]);
                if (o.hasOwnProperty("Attributes") && o["Attributes"].hasOwnProperty("Value") && o["Attributes"]["Value"].hasOwnProperty("_id") && o["Attributes"]["Value"]["_id"] === "OBS_STATUS") {
                    v.OBS_STATUS = o["Attributes"]["Value"]["_value"];
                    v.OBS_VALUE = v.OBS_STATUS === "na" ? null : 0; //value unknown: null. value (practically) zero: 0.
                } else {
                    v.OBS_VALUE = o["ObsValue"]["_value"];
                    if (!isNaN(v.OBS_VALUE)) v.OBS_VALUE = Number(v.OBS_VALUE);
                    else throw "OBS_VALUE is NaN";
                }
                if (o.hasOwnProperty("Attributes") && o["Attributes"].hasOwnProperty("Value") && o["Attributes"]["Value"].hasOwnProperty("_id") && o["Attributes"]["Value"]["_id"] === "OBS_FLAG") {
                    v.OBS_FLAG = o["Attributes"]["Value"]["_value"];
                }
                newData.push(v);
            });
        });
        return newData;
    }

    esDb.getRst = function (name, fieldFilter, callback) {
        //Get recordset that is described with rstConfig object. Download data that is not available yet.
        var tbl = getTbl(name);
        for (var fieldName in fieldFilter) {if (tbl.fields.indexOf(fieldName) === -1) throw "Unknown fieldname '" + fieldName + "' present in filter.";}
        //TODO: download data that is not available
        //TODO: run callback
        //TODO: return esDb
        return tbl.data(filter).get();
    };

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
    function getTbl(name) {return $.grep(db,   function(tbl){return (tbl.name === name);})[0];}
    function tblIndex(name) {return db.map(function(tbl){return tbl.name;}).indexOf(name);}

    function pop(obj, key) {var value = {}; value[key] = obj[key]; delete obj[key]; return value;}

    return esDb;
}