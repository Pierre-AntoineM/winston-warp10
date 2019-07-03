// Type definition for winston-warp10

import { transports } from "winston";
import { WinstonWarp10Transports } from "winston-warp10";

declare module 'winston' {
    export interface Transports extends WinstonWarp10Transports {}
}

declare module 'winston-warp10' {
    export interface Warp10TransportInstance extends transports.StreamTransportInstance {
        new (options: Warp10ConnectionOptions) : Warp10TransportInstance;
        query: (callback: Function, options?: any) => Promise<any>;
    }

    export interface WinstonWarp10Transports {
        Warp10: Warp10TransportInstance;
    }

    export interface Warp10ConnectionOptions {
        /* Level of messages transport will log, default : info */
        level?: string;

        /* Boolean flag indicating whether to suppress output, default : false */
        silent?: boolean;

        /* Name and identifier of the transport instance, default : Warp10 */
        name?: string;

        /* Warp10 writing token, mandatory */
        writeToken: string;

        /* Protocol : "http" or "https" or "ws" or "wss" , mandatory */
        protocol: string;

        /* Host, mandatory */
        host: string

        /* Port, default : none */
        port: string

        /* Class name you want to post, mandatory */
        className: string;

        /* Labels of the GTS, empty by default : {} */
        labels?: string;

        /* Timestamp, default : use Warp10 own timestamp */
        timestamp?: string;

        /* Latitude */
        latitude?: string;

        /* Longitude */
        longitude?: string;

        /* Elevation */
        elevation?: string;

        /* Keep alive websocket connection, default true */
        keepWSAlive?: boolean;

    }
}