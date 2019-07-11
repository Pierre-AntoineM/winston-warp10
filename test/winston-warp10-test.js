/**
 * @module 'winston-warp10-test'
 * @fileoverview Tests for instances of the Warp10 transport
 * @author pa.moitier@gmail.com (Pierre-antoine Moitier)
 */

 /* Check https://sandbox.senx.io to get your writeToken */
'use strict';
const test = require('abstract-winston-transport');
const Warp10 = require('../winston-warp10').Warp10;
const protocolHttp = "https";
const protocolWs = "wss";
const host = "sandbox.senx.io";
const writeToken = "<writeToken>";
const className = "ClassTest";
const keepWSAlive = false;

test({name: 'Https', Transport: Warp10, construct: {protocol : protocolHttp, host, writeToken, className}});
test({name: 'Wss', Transport: Warp10, construct: {protocol : protocolWs, host, writeToken, className, keepWSAlive}});
