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
 * .dfsQ()
 *      Asynchronously get dataflow objects (i.e., that describe what data are available from eurostat server).
 *      Arguments: (optional) filter word, or array with filter words, of which dataflow id or dataflow name (en, de, fr) must include >=1 to be saved. If omitted or "": all available on eurostat server.
 *      Return: Q promise to array of df objects.
 *
 * .dsdQ()
 *      Asynchronously fetch, through eurostat server API, data structure definitions (DSDs), for certain dataflow.
 *      Arguments: dataflow id.
 *      Return: Q promise to dsd object.
 *
 * .tblQ()
 *      Get promise to table object that was created before (or is still being created) with tblQinit().
 *      Arguments: dataflow id.
 *      Return: Q promise to tbl object.
 *
 * .tblQinit()
 *      Asynchronously (re)initialise table in database to hold data.
 *      Arguments: dataflow id.
 *                 (optional) <<fixDimFilter object, see below>> describing which dimensions are fixed to which values.
 *                 (optional) <<timePeriod object, see below>> describing time period of which to retrieve data. Must contain at least one of the properties 'startYear' and 'endYear'.
 *      Return: Q promise to tbl object.
 *
 * .tblQIds()
 *      Array of dataflow ids for which a table has been created (or is still being created) with tblQinit().
 *      Arguments: none.
 *      Return: string array of dataflow ids.
 *
 * .dataQ()
 *      Asynchronously fetch, through eurostat server API, certain data.
 *      Arguments: dataflow id.
 *                 varDimFilter object, or array of varDimFilter objects, describing which data should be fetched.
 *                 (optional) prLastOnly boolean value. States if progress callback is called only for most recent dataQ call (false) or for all dataQ calls (true). If omitted: false.
 *      Return: Q promise to recordset with those records that needed to be fetched in order to complete the data described by varDimFilter.
 *                 Progress function available with number of ajax fetches still 'in flight'. See prLastOnly argument.
 *                 Recordset is array of objects with (field:value) pairs.
 *
 * .rstQ()
 *      Synchronously get certain data from local database, and asynchronously fetch, through eurostat sever API, any data that might be missing.
 *      Arguments: dataflow id.
 *                 fieldFilter object (varDimFilter object also possible).
 *                 (optional) order string, e.g. "OBS_VALUE asec" or "GEO asec, TIME desc". "asec" can be omitted. If omitted completely: no ordering (faster).
 *                 (optional) prLastOnly boolean value. States if progress callback is called only for most recent dataQ call (false) or for all dataQ calls (true). If omitted: false.
 *      Return: Q promise to recordset with data described by fieldFilter.
 *                 Progress function available with number of ajax fetches still 'in flight'. See prLastOnly argument.
 *
 * .rst()
 *      Synchronously get certain data from local database.
 *      Arguments: dataflow id.
 *                 fieldFilter object (varDimFilter object also possible).
 *                 (optional) order string, e.g. "OBS_VALUE asec" or "TIME desc". If omitted: ordered by ascending TIME field value.
 *      Return: Recordset with data described by fieldFilter.
 *
 *
 *
 * DESCRIPTION OF OBJECTS CREATED (AND USED) BY EUROSTATDB
 *
 * dataflow (df) object {
 *      id: "dataflowId",
 *      names: ["nameEn", "nameDe", "nameFr"]
 *  }
 *
 *
 * data structure definition (dsd) object {
 *      id: "dataflowId",
 *      concepts: ["field", ...],
 *      dimensions: ["field", ...],
 *      codelists: [
 *          {
 *              fldName: "fieldname",
 *              codes: [{id: "code", name:""}, ...]
 *          }, ...  ],
 *      codesArr: function,  //see below
 *      codesDict: function   //see below
 *  }
 * where
 *      codesArr()
 *          Code array for a certain field.
 *          Arguments: name of field(/concepts/dimension) of which the list of possible codes is wanted.
 *          Return: the codes array for the specified field.
 *
 *      codesDict()
 *          Dictionary object with codes, and their names, that can be used/found for certain field.
 *          Arguments: (optional) name of field(/concept/dimension) of which the list of possible codes is wanted. If omitted: for all fieldnames.
 *          Return: if fieldname specified:  object with {id: name}, for each code in the field's codes array.
 *                  if fieldname omitted:    object with {fieldName: {id: name}}, for each fieldname in the codelist-array.
 *
 *
 * table (tbl) object {
 *      id: "dataflowId",
 *      dsd: <<dsd object, see above>>,
 *      fixDims: ["field", ...],        //fields of which value was specified during table initialisation.
 *      fixDimFilter: {field1:"value1", field2:"value2", ...}, //Object of the fixed dimensions, and the values they are fixed to. See tblDef object, below.
 *      varDims: ["field", ...],        //fields of which value must be specified in order to fetch data.
 *      fields: ["field", ...],         //fields which, if available, are stored for every record in database. Used when querying the data in the local database.
 *      fieldsInput: ["field", ...],    //subset of .fields, containing the fields that uniquely specify a datapoint.
 *      fieldsOutput: ["field", ...],   //subset of .fields, containing the remaining fields, which specify the observation ('value') for that datapoint.
 *      data: TAFFY database
 *  }
 *
 *
 *
 * DESCRIPTION OF OBJECTS SUPPLIED TO EUROSTATDB BY USER
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
 * fieldFilter object: {                      //Defines, for zero or more fields in the fields array of the dsd object (see above), which records should be gotten.
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
 * q (https://github.com/kriskowal/q) to provide promises
 * xml2json (https://github.com/abdmob/x2js) to convert xml into json
 * taffydb (https://github.com/typicaljoe/taffydb) to store information
 *
 */


//TODO: count expected return size, check if exceeds limit of 1 000 000

function eurostatDb () {
    var esDb = {},
        fetchIdCurrent = 0,
        fetchRegister = {},//key = 'tblId|varDim1Val|varDim2Val|...';  value = 'undefined' before fetching; 'Promise' if being fetched; '1' after fetching.
        dfsQ,      //Promise to array with Dataflow objects (see above)
        dsdQs = {},//Object with promises to Data Structure Definition objects (see above)
        tblQs = {},//Object with promises to Table objects (see above)
        tbls = {}; // Object with Table objects.

    esDb.dfsQ = function (filter) {
        //Get array of all dataflows that are available from API that comply to filter, and save to internal 'dfs' array.
        var url = "js/all_latest_ESTAT_references=none_detail=full.xml"; //originally found at "http://www.ec.europa.eu/eurostat/SDMX/diss-web/rest/dataflow/ESTAT/all/latest", cannot be fetched by machine (protected?)

        dfsQ = Q.Promise(function (resolve, reject) {
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
    function parseDfsXml (xml, filter) {
        //Parse xml data describing all dataflows that are available from API.
        var dfsXml,//all dataflow data in xml file
            dfs = [],
            converter = new X2JS();

        //Parse.
        dfsXml = converter.xml2json(xml);
        dfsXml["Structure"]["Structures"]["Dataflows"]["Dataflow"].forEach(function (d) {
            var df = {
                    id: d["_id"],
                    names: []
                },
                add = true;

            d["Name"].forEach(function (n) {
                switch(n["_xml:lang"]) {
                    case "en": df.names[0] =  n["__text"]; break;
                    case "de": df.names[1] =  n["__text"]; break;
                    case "fr": df.names[2] =  n["__text"]; break;
                }
            });

            //Filter, if needed.
            if (filter) {
                add = false;
                [].concat(filter).forEach(function (filterTerm) {
                    if (add) return;
                    if (df.id.toLowerCase().indexOf(filterTerm.toLowerCase()) > -1) add = true;
                    df.names.forEach(function (name) {
                        if (name.toLowerCase().indexOf(filterTerm.toLowerCase()) > -1) add = true;
                    });
                });
            }

            //Save.
            if (add) dfs.push(df);
        });
        return dfs;
    }

    //esDb.dsdQIds = function () {return Object.keys(dsdQs);};
    esDb.dsdQ = function (id) {
        //Get (promise to) data flow definition from certain table and add to dsd promise array.
        if (dsdQs.hasOwnProperty(id)) return dsdQs[id];

        var url = "http://ec.europa.eu/eurostat/SDMX/diss-web/rest/datastructure/ESTAT/DSD_" + id;

        dsdQs[id] = Q.Promise(function (resolve, reject) {
            $.get(url)
                .done(function (xml) {
                    var dsd = parseDsdXml(xml);
                    dsd.id = id;
                    dsd.codesArr = codesArr;
                    dsd.codesDict = codesDict;
                    resolve(dsd);
                })
                .fail(function (xhr, textStatus, error) {
                    reject(Error(error.toString()));
                });
        });

        return dsdQs[id];
    };
    function parseDsdXml (xml) {
        //Parse xml data describing data flow definition of certain dataflow.
        var dsdXml,//data structure definition data in xml file
            dsd = {
                //id, //added later
                dimensions: [],
                concepts: [],
                codelists: []
                //codesArr, //added later
                //codesDict //added later
            },
            converter = new X2JS(),
            renameFldNames = {"Observation flag.": "OBS_FLAG", "Observation status.": "OBS_STATUS"};

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
                    id: code["_id"],
                    name: code["Name"]["__text"]
                });
            });
            var fldName = clist["Name"]["__text"];
            if (renameFldNames.hasOwnProperty(fldName)) fldName = renameFldNames[fldName];//rename 2 fieldnames (flag and status) that do not make sense.
            dsd.codelists.push({
                fldName: fldName,
                codes: codes
            });
        });

        return dsd;
    }

    function codesArr (fldName) {
        if (!fldName) throw Error("No fieldname specified");
        var codelist = this.codelists.filter(function (codelist) {return codelist.fldName === fldName;});
        if (!codelist.length) throw Error("Fieldname " + fldName + " not found");
        return codelist[0].codes;
    }
    function codesDict (fldName) {
        var dict = {};
        if (!fldName) {
            var fldNames = this.codelists.map(function (codelist) {return codelist.fldName;});
            fldNames.forEach(function (fldName) {dict[fldName] = codesDict(fldName)});
        } else {
            var codelist = this.codelists.filter(function (codelist) {return codelist.fldName === fldName;});
            if (!codelist.length) throw Error("Fieldname " + fldName + " not found");
            codelist[0].codes.forEach(function (code) {dict[code.id] = code.name;});
        }
        return dict;
    }

    esDb.tbl = function (id) {if (tbls.hasOwnProperty(id)) return tbls[id]; else return undefined;};
    esDb.tblQ = function (id) {if (tblQs.hasOwnProperty(id)) return tblQs[id]; else return undefined;};
    esDb.tblQinit = function (id, fixDimFilter, timePeriod) {
        //Get arguments straight.
        var n = arguments.length;
        if (n === 2 && (arguments[1].hasOwnProperty("startYear") || arguments[1].hasOwnProperty("endYear"))) {
            //fixDimFilter was not passed and timePeriod WAS passed.
            timePeriod = arguments[1];
            fixDimFilter = undefined;
        }
        if (fixDimFilter && !Object.keys(fixDimFilter).length) fixDimFilter = undefined; //empty object --> undefined
        if (timePeriod && !Object.keys(timePeriod).length) timePeriod = undefined; //empty object --> undefined

        //Overwrite this tblQ if already exists
        tblQs[id] = Q.Promise(function (resolve, reject) {

            //Make table.
            var tbl = {
                id: id,
                fixDims: [],
                fixDimFilter: {},
                varDims: [],
                fields: [],
                fieldsInput: [],
                fieldsOutput: [],
                //dsd, //properties dimensions, concepts, codelists, etc. //added later
                data: TAFFY() //database itself
            };

            //Do when (promise to) dsd is resolved.
            esDb.dsdQ(id)
                .then(function (dsd) {
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

                    //Get codelist for TIME: 1: get 'test record set'.
                    var varDimFilter = {};
                    tbl.varDims.forEach(function (dim) {varDimFilter[dim] = tbl.dsd.codesArr(dim)[0].id;});
                    return dataQ(tbl, varDimFilter);
                })
                .then(function (rst) {
                    //Get codelist for TIME: 2: add codelist.
                    var times = [];
                    rst.forEach(function (row) {if (times.indexOf(row.TIME) === -1) times.push(row.TIME);});
                    var codes = times.map(function (time) {return {id: time, name: time};});
                    tbl.dsd.codelists.push({fldName: "TIME", codes: codes});

                    //Save & resolve.
                    tbls[id] = tbl;
                    resolve(tbl);
                })
                .catch(function (e) {reject(e);});
        });

        return tblQs[id];
    };
    esDb.tblQIds = function () {return Object.keys(tblQs);};

    esDb.dataQ = function (id, varDimFilters, prLastOnly) {
        //Get promise to recordset that is fetched in order to complete the data described with varDimFilters object.
        if (!tblQs.hasOwnProperty(id)) throw Error("Table (or promise to table) '" + id + "' has not been found.");
        return tblQs[id].then(function (tbl) {
            return dataQ(tbl, varDimFilters, prLastOnly);
        });
    };
    esDb.rstQ = function (id, fieldFilter, order, prLastOnly) {
        if (prLastOnly===undefined && (order===true || order===false)) {prLastOnly = order; order = undefined;}
        //Get promise to recordset that is described with fieldFilter object. Asynchronous, fetch data first if necessary.
        if (!tblQs.hasOwnProperty(id)) throw Error("Table (or promise to table) '" + id + "' has not been found.");
        return Q.Promise(function (resolve, reject, progress) {
            //Fetch (missing) data, get recordset, and use in callback.
            tblQs[id]
                .then(function (tbl) {return dataQ(tbl, varDimFilter(tbl.varDims, fieldFilter), prLastOnly);})
                .then(function () {resolve(esDb.rst(id, fieldFilter, order));}, reject, progress);
        });
    };
    esDb.rst = function (id, fieldFilter, order) {
        //Get recordset that is described with fieldFilter object. Synchronous, searches in existing db.
        if (!tbls.hasOwnProperty(id)) throw Error("Table '" + id + "' has not been found.");
        return rst(tbls[id], fieldFilter, order);
    };
    function dataQ (tbl, varDimFilters, prLastOnly) {
        var fetchedData = [],
            fetchId = ++fetchIdCurrent, //used to make sure only progress for latest request is posted.
            inflight = 0; //count how many ajax requests we're still waiting for.
        prLastOnly = prLastOnly || false; //default value is false

        return Q.Promise(function (resolve, reject, progress) {

            //e.g. varDimFilters                  = [{a:"1", b:["1", "2"]}, {a:"4", b:"5"}]
            //     varDimFilter                   = {a:"1", b:["1", "2"]} (on first pass) or {a:"4", b:"5"} (on second pass)
            //     singlevalFilters(varDimFilter) = {a:"1", b:"1"} or {a:"1", b:"2"} (first pass), or {a:"4", b:"5"} (second pass)
            var filters = [];
            [].concat(varDimFilters).forEach(function (varDimFilter) {
                singlevalFilters(varDimFilter).forEach(function (filter) {
                    filters.push(filter);
                });
            });

            var promises = [];
            filters.forEach(function (filter) {

                var key = fetchKey(tbl, filter);

                //Don't refetch if data is already present in db.
                if (fetchRegister[key] === 1) return; //data has already been fetched before
                if (fetchRegister[key]) {             //data is being fetched right now
                    promises.push(fetchRegister[key]);
                    return;
                }

                //data must be fetched
                var url = dataUrl(tbl, filter);
                inflight++;
                fetchRegister[key] = Q($.get(url))
                    .then(function (xml) {
                        //console.log(url);//DEBUG
                        var records = parseDataXml(xml, tbl.fields); //might throw error
                        if (records) {//sometimes there might be no data in the requested rst
                            fetchedData = fetchedData.concat(records);
                            tbl.data.insert(records);
                        }
                        fetchRegister[key] = 1;//done, no need to fetch again
                    })
                    .catch(function (e) {
                        fetchRegister[key] = undefined;
                        reject(e);
                    })
                    .finally(function () {
                        if ((typeof progress === 'function') && (!prLastOnly || fetchId === fetchIdCurrent)) progress(--inflight);
                    });
                promises.push(fetchRegister[key]);
            });

            Q.all(promises)
                .then(function () {resolve(fetchedData);})
                .catch(reject);
        });
    }
    function dataUrl (tbl, varDimFilter) {
        //Returns URL to obtain dataset as defined in config object.
        var url = "http://ec.europa.eu/eurostat/SDMX/diss-web/rest/data/" + tbl.id + "/",
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
    function parseDataXml (xml, fields) {
        var xmlData, //data series as in xml file
            newData = [], //data series as wanted
            converter = new X2JS(),
            errText;

        xmlData = converter.xml2json(xml);
        if (!xmlData.hasOwnProperty("GenericData")) throw Error("Unexpected xml document; node 'GenericData' not found");
        if (!xmlData["GenericData"].hasOwnProperty("DataSet")) {
            if (!xmlData["GenericData"].hasOwnProperty("Footer") || !xmlData["GenericData"]["Footer"].hasOwnProperty("Message") || !xmlData["GenericData"]["Footer"]["Message"].hasOwnProperty("Text")) throw Error("Unexpected xml document; nodes 'GenericData/DataSet'  AND 'GenericData/Footer/Message/Text' not found.");
            else {
                errText = xmlData["GenericData"]["Footer"]["Message"]["_code"];
                errText += [].concat(xmlData["GenericData"]["Footer"]["Message"]["Text"]).map(function(t){return t["__text"]}).join(", ");
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
    function rst (tbl, fieldFilter, order) {
        //Get recordset that is described with fieldFilter object. Synchronous, searches in existing db.
        fieldFilter = $.extend(true, {}, fieldFilter); //local copy
        Object.keys(fieldFilter).forEach(function (fld) {
            if (tbl.fields.indexOf(fld) === -1) throw Error("Unknown fieldname '" + fld + "' present in filter.");
            if (fieldFilter[fld] === "") delete fieldFilter[fld];
        });
        if (!order) return tbl.data(fieldFilter).get();
        order = order.replace(/ASEC/gi, "asec").replace(/ASC/gi, "asec").replace(/DESC/ig, "desc");
        return tbl.data(fieldFilter).order(order).get();
    }

    function varDimFilter (varDims, fieldFilter) {
        //Turn fieldFilter into varDimFilter, for use in .dataQ().
        var varDimFilter = {};
        varDims.forEach(function (dim) {
            var val = fieldFilter[dim];
            if (!val || $.isPlainObject(val)) varDimFilter[dim] = ""; //dimension left out (val == undefined) or query object. Either case: must get data for all available values.
            else varDimFilter[dim] = val;
        });
        return varDimFilter;
    }
    function fetchKey (tbl, varDimFilter) {
        var keyVals = [tbl.id]; //start with table id
        tbl.varDims.forEach(function (dim) {
            var val = varDimFilter[dim] || ""; //make "" if undefined
            if (val instanceof Array && val.length === 1) val = val[0]; //1-string-element array also OK
            if (typeof val !== 'string') throw Error("FetchKey must have 1 or less string values for each element in table's varDims array.");
            keyVals.push(val);
        });
        return keyVals.join("|");
    }

    function allPropValCombinations (obj) {
        //From an object, of which the properties are arrays of values, create an array of objects, of which the properties
        // are single values. The objects in the returned array contain all possible combinations of array values for the
        // individual properties, so if there are 3 properties with 4-element arrays each, there will be 64 (4^3) objects
        // in the returned array.
        // E.g. in: {prop1:[1,2], prop2:['a','b']} --> out: [{prop1:1, prop2:'a'}, {prop1:1, prop2:'b'}, ...]
        var obj = $.extend({}, obj), //local copy to not affect input object.
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
    function singlevalFilters (multivalFilter) {return allPropValCombinations(multivalFilter);}//alias to make code more readable.

    function pop (obj, key) {var value = {}; value[key] = obj[key]; delete obj[key]; return value;}

    return esDb;
}
