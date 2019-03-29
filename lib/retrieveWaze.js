"use strict";

const dataReq = require("./data_req");

var httpOptions = {
   host: "",
   path: "",
   method: ""
};

async function RetrieveData(city) {
	
		httpOptions.host = "3bbnskbyx7.execute-api.us-east-2.amazonaws.com";
	    httpOptions.path = "/production/get-waze-data?city=" + city;
	    httpOptions.method = "GET"
		
		var values = [];
            try {
                const rdata = await dataReq.requestData(httpOptions);
                if (rdata === 0) {
                    const err = new Error("No data from API" + httpOptions.host);
                    err.code = 204;
                    err.codeStr = "No Content";
                    log.error("Retrieved no data - " + err.toString());
                    throw err;
                }

                values = values.concat(rdata);
            }            
            catch(err) {
                console.log("Unable to retrieve data - " + err.toString());
                throw(err);
            }
		
        return (values);
};

exports.RetrieveData = RetrieveData;