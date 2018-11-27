"use strict";

const dataReq = require("./data_req");

var httpOptions = {
   host: "script.google.com",
	path: "/macros/s/AKfycbwTqe68n2e9t4QBvlK9J-azxtSNFHh4BAjzShy4RF7Q0aE_tiM/exec",
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