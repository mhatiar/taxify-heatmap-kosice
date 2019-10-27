"use strict";

const dataReq = require("./data_req");



// This will retrieve data from Bolt Data ExoTaxiDataset table AKfycbwpGyCw-W3AviTFgeuxdTaxfPohOK4bl5GZlaAqWNvTKMaWRec/exec

var httpOptions = {
   host: "script.google.com",
	path: "/macros/s/AKfycbwpGyCw-W3AviTFgeuxdTaxfPohOK4bl5GZlaAqWNvTKMaWRec/exec",
    timeout: 60000,
	followAllRedirects: true,
    method: "GET"
};

async function RetrieveData() {        
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