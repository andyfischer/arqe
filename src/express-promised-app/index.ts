
import Response, { CacheOption, CookieData } from './Response'
import sendResponse from './sendResponse'

export { default as Response, CacheOption, CookieData } from './Response'
export { Request } from 'express'

/**
 * Callback function for an endpoint handler. This receives an Express Request
 * as its input and asynchonously returns a response.
 */
export type EndpointHandler = (req:any) => Promise<Response>;

function sendEndpointError(req, res, err) {
    console.error(err);

    const statusCode = err.statusCode || 500;
    const internalError = err.statusCode >= 500;

    res.setHeader('content-type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(statusCode);
    res.end(err.stack || err);
}

/**
 * The main ExpressWrapper class. This wraps around a single `Express` app instance.
 * Using this class you can declare endpoints in Express-like style (using `app.get`, etc).
 */
export default class ExpressWrapper {
    expressApp: any

    constructor(params: {expressApp:any}) {
        if (!params.expressApp) throw new Error("missing: .expressApp");

        this.expressApp = params.expressApp;
    }

    listen(port: string | number) {
        const portNum = typeof port === 'string' ? parseInt(port, 10) : port;
        return new Promise((resolve, reject) => {
            this.expressApp.listen(port, '0.0.0.0', resolve);
        });
    }
    
    /**
     * Declare an endpoint with the given method.
     */
    resource = (method:string, path:string, handler: EndpointHandler) => {

        this.expressApp[method](path, async (req, res) => {

            try {
                const response = await handler(req);
                sendResponse(this, req, res, response);
            } catch (err) {
                sendEndpointError(req, res, err);
            }
        })
    }

    /**
     * Declare an endpoint handler for the GET method.
     */
    get = (path:string, handler: EndpointHandler) =>
        this.resource('get', path, handler);

    /**
     * Declare an endpoint handler for the POST method.
     */
    post = (path:string, handler: EndpointHandler) =>
        this.resource('post', path, handler);

    /**
     * Declare an endpoint handler for the PUT method.
     */
    put = (path:string, handler: EndpointHandler) =>
        this.resource('put', path, handler);

    /**
     * Declare an endpoint handler for the DELETE method.
     */
    delete = (path:string, handler: EndpointHandler) =>
        this.resource('delete', path, handler);
}
