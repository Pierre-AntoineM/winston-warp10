/**
 * @module 'winston-warp10'
 * @fileoverview Winston transport for logging into Warp10
 * @author pa.moitier@gmail.com (Pierre-antoine Moitier)
 */
'use strict';
const Transport = require('winston-transport');
const util = require('util');
const axios = require('axios');
const WebSocket = require('ws');
const waitUntil = require('wait-until');
const {
  LEVEL,
  MESSAGE,
} = require('triple-beam');

/**
 * Constructor for the Warp10 transport object.
 * @constructor
 * @param {Object} options
 * @param {string=info} options.level Level of messages transport will log.
 * @param {boolean=false} options.silent Boolean flag indicating whether to suppress output, default false.
 * @param {string=Warp10} options.name Name of the transport instance.
 * @param {string} options.writeToken Warp10 writing token, mandatory.
 * @param {string} options.protocol Protocol : http or https or ws or wss, mandatory.
 * @param {string} options.host Host, mandatory.
 * @param {string} options.port Port, default none.
 * @param {string} options.className Class name you want to post, mandatory.
 * @param {string={}} options.labels Labels of the GTS.
 * @param {string} options.timestamp Timestamp, default : use Warp10 own timestamp.
 * @param {string} options.latitude Latitude.
 * @param {string} options.longitude Longitude.
 * @param {string} options.elevation Elevation.
 * @param {boolean=true} options.keepWSAlive Keep alive websocket connection, default true.
 */

let Warp10 = exports.Warp10 = function(options){

    Transport.call(this, options);

    options = (options || {});

    if (!options.writeToken) {
      throw new Error("Please provide Warp10 writing token.");
    }
    if (!options.className) {
      throw new Error("Please provide class name of GTS.");
    }
    if (!options.protocol || (options.protocol !== "ws" && options.protocol !== "wss" && options.protocol !== "http" && options.protocol !== "https")){
      throw new Error("Please provide correct protocol, we are currently supporting 'http(s)' and 'ws(s)'.");
    }
    if (!options.host){
      throw new Error("Please provide host.");
    }
    if ((options.protocol === "ws" || options.protocol === "http") && options.host === "sandbox.senx.io") {
      throw new Error("Warp 10 sandbox only supports https and wss protocol.")
    }

    this.port = options.port ? ":" + options.port : '';

    this.endpoint = (options.protocol === "wss" || options.protocol === "ws") ? "/api/v0/streamupdate" : "/api/v0/update";
    
    this.protocol = options.protocol;
    this.host = options.host;
    this.url = options.protocol + "://" + options.host + this.port + this.endpoint;
    this.name = options.name || "Warp10";
    this.writeToken = options.writeToken;
    this.level = options.level || 'info';
    this.silent = options.silent || false;  
    this.className = options.className;
    this.labels = options.labels || '';
    this.timestamp = options.timestamp || '';
    this.latitude = options.latitude || '';
    this.longitude = options.longitude || '';
    this.elevation = options.elevation || '';
    this.keepWSAlive = options.keepWSAlive || true;
    this.coords = '';

    if (options.protocol === "ws" || options.protocol === "wss"){

      this.socket = new WebSocket(this.url);

      this.socket.onopen = (res) => {
        console.log("[open] Connection established");

        /**
         *  Set ERROR mode and send warp10 write token 
         *  Check https://www.warp10.io/content/03_Documentation/03_Interacting_with_Warp_10/06_Websockets for more info
         */
        if (res.target.readyState === 1) {
          this.socket.send("TOKEN " + options.writeToken);
          this.socket.send("ONERROR MESSAGE");
        }

        /* Keep the conneection alive and avoid timeout */
        if (this.keepWSAlive) {setInterval(() => {this.socket.send("NOOP")}, 270000);}
      }

      this.socket.onclose = (event) => {
        if (event.wasClean) {
          console.log("Clean exit : " + event.code + " "+ event.reason);
        } else {
          // e.g. server process killed or network down
          // event.code is usually 1006 in this case
          console.log("Socket died : " + event.code + " " + event.reason);
        }
      };

      this.socket.onmessage = (res) => {
        console.log("Message received : " + res.data);
      }

    }
};

/**
 * Inherit from `winston-transport`.
 */
util.inherits(Warp10, Transport);

/**
 * Logging method.
 * @param {object} info Logs
 * @param {Function} callback Continuation to respond to when complete.
 */
Warp10.prototype.log = function(info, callback) {

    if (!callback) {
      callback = ()=>{};
    }

    process.nextTick(()=>{
      if (this.silent) {
        callback(null, true);
      }
      const infoMessage = info.message || info[MESSAGE];
      let msg;
      if (typeof infoMessage !== 'string' && typeof infoMessage !== 'object') {
        msg = {
          message: Warp10.prototype.safeToString(infoMessage),
        };
      } else if (typeof infoMessage === 'string') {
        msg = {
          message: infoMessage,
        };
      }

      const logObject = Object.assign({},
        info,
        msg, {
          level: info[LEVEL] || this.level,
        });

      if (this.latitude !== '' && this.longitude !== ''){
        this.coords = this.latitude + ":" + this.longitude;
      }

      var headers = {
        'X-Warp10-Token': this.writeToken
      }

      var url = this.url;
      var data = this.timestamp + "/" + this.coords + "/"+ this.elevation + " " 
      + this.className + "{" + this.labels + "}" + "'" + escape(logObject.message) + "'";

      if (this.protocol === "wss" || this.protocol === "ws"){

        waitUntil()
          .interval(500)
          .times(10)
          .condition(() => {
            return (this.socket.readyState === 1 ? true : false);
          })
          .done((result) => {
            this.socket.send(data, (err) => {
              if (err) {
                this.emit('error', err); 
                callback(err)
              }
              this.emit('logged');
              callback(null, true);
            });
          })        
        
      } else {

        axios.post(url, data, {headers: headers})
          .then((response) => {
            console.log("Post response : " + response.status + ' ' + response.statusText);
            this.emit('logged');
            callback(null, true)
          })
          .catch((error) => {
            try {
              this.emit('error', error);
              callback(error);
            }
            catch(err) {
              if(error && error.response && error.response.statusText) {
                console.log("Error attempting to log : " + error.response.statusText);
              } else {
                console.log("Error attempting to log : post request did not work");
              }
            }
          })  
      }
    });
    return true;      
}

/* Stringify */
Warp10.prototype.safeToString = function(json) {
    try {
      return JSON.stringify(json);
    } catch (ex) {
      return stringifySafe(json, null, null, () => {});
    }
}

/**
 * Closes transport, usefull for ws or wss transport mode
 */
Warp10.prototype.close = function() {
  if (this.socket) {
    this.socket.close();
  }
}