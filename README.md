[![ISC License][license-image]][license-url]
[![Test Status][test-image]][test-url]

# winston-warp10

A [Warp10][0] transport for [Winston][1].

## Installation

``` bash
  $ npm install winston
  $ npm install winston-warp10
```

## Basic usage
``` js
var winston = require('winston');
var warp10 = require('winston-warp10').Warp10;
  
/* Check https://sandbox.senx.io to get your 
*  <writeToken> for using Warp10 sandbox.
*  Or use credentials from your own Warp10 instance
*/ 
var options = {
    writeToken: "<writeToken>",
    protocol: "https",    
    host: "sandbox.senx.io",
    className: "test"
}

winston.add(new warp10(options));
  
/* Insert a new entry in the GTS 'test{}' with value equals to 'logs' */
winston.info("logs");
```

The Warp10 transport takes the following options. **writeToken**, **protocol**, **host** and **className** are required :

* __level:__ Level of messages transport will log, default : info.
* __silent:__ Boolean flag indicating whether to suppress output, default : false.
* __name:__ Name and identifier of the transport instance, default : Warp10.
* __writeToken:__ Warp10 writing token.
* __protocol:__ ```http``` or ```https``` or ```ws``` or ```wss```.
* __host:__ Host. Can be sandbox : "sandbox.senx.io" therefore you can only use ```https``` or ```wss``` protocol. Or it can be any host address of private Warp10 instance.
* __port:__ Port of your Warp10 instance. Empty for Warp10 sandbox.
* __className:__ Class name of the GTS you want to send your data to.
* __labels:__ Labels of the GTS, default : empty.
* __timestamp:__ Timestamp, default : use Warp10 own timestamp.
* __Latitude:__ Latitude coordinate.
* __Longitude:__ Longitude coordinate.
* __Elevation:__ Elevation above sea level.
* __KeepWSAlive:__ Keep alive websocket connection, default true. Useless in ```http``` or ```https``` protocol.


## Advanced usage

In the example below, we create our own winston logger. We add the warp10 transport, then we will be able to dynamically set attributes like latitude or labels even after the creation of the transport.  

``` js
const winston = require('winston');
const warp10Transport = require('winston-warp10').Warp10;

const customLogger = winston.createLogger({
    /* options 
    *  You can set various options for your own custom
    *  logger, see Winston documentation.
    */
    transports: [
        new warp10Transport({
            name: "My Warp10 transport",
            writeToken: "<writeToken>",
            protocol: "https",
            host: "sandbox.senx.io",
            className: "test",
            labels: "position=Paris"
        }),
    ] 
})

/* Insert a new entry in the GTS 'test' with label 'position=Paris' and value equals to 'Hello from Paris', at Eiffel Tower's geographic position */
customLogger.transports[0].latitude = "48.86";
customLogger.transports[0].longitude = "2.29"
customLogger.info("Hello from Paris");
```

Changelog
---------

***Current Version: 1.0.00*** — Released 2019-07-03

* Introducing the warp10 Transport for winston.


## License

winston-warp10 is freely distributable under the terms of the [ISC license][license-url].


#### Author: [Pierre-Antoine Moitier](https://github.com/Pierre-AntoineM)
#### Contributors: [Erwan Géréec](https://github.com/wawanopoulos)

[0]: https://www.warp10.io/
[1]: https://github.com/winstonjs/winston

[license-image]: http://img.shields.io/badge/license-ISC-blue.svg?style=flat
[license-url]: LICENSE

[test-image]: https://img.shields.io/badge/Abstract%20winston%20transport%20test-passing-green.svg
[test-url]: test/winston-warp10-test.js
