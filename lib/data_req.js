"use strict";

//const http = require('https');
const http = require('follow-redirects').https;


/**
 * @export exports.requestData
 */
exports.requestData = function(httpOpt, dataToSend) {
    let buffer = '';
    return new Promise(function(resolve, reject) {
        const req = http.request(httpOpt, (res) => {		
            if (res.statusCode < 200 || res.statusCode >= 300) {
                const err = new Error(res.statusMessage);
                err.code = res.statusCode;
                err.codeStr = res.statusMessage;
                reject(err);
                return;
            }

            res.on('data', chunk => {
                buffer += chunk;
            });
            res.on('end', () => {
                try {
                    const data = JSON.parse(buffer);
                    resolve(data);
                } catch (err) {
                    err.code = 500;
                    err.codeStr = "Internal Error 1";
                    reject(err);
                }
            });
            res.on('error', (err) => {
                err.code = 500;
                err.codeStr = "Internal Error 2";
                reject(err);
            });
        });
        req.on('error', (err) => {
            err.code = 500;
            err.codeStr = "Internal Error 3";
            reject(err);
        });
        req.on('timeout', () => {
            const err = new Error("Source Receiving Timeout");
            err.code = 504;
            err.codeStr = "Timeout";
            reject(err);
            return;
        });
        if (dataToSend !== undefined) {
            req.write(JSON.stringify(dataToSend));
        }
        req.end();
    });
};