import Response from './Response';
export { default as Response, CacheOption, CookieData } from './Response';
export { Request } from 'express';
export { default as createExpressApp } from './createExpressApp';
export declare type EndpointHandler = (req: any) => Promise<Response>;
export default class ExpressWrapper {
    expressApp: any;
    constructor(params: {
        expressApp: any;
    });
    listen(port: string | number): Promise<unknown>;
    resource: (method: string, path: string, handler: EndpointHandler) => void;
    get: (path: string, handler: EndpointHandler) => void;
    post: (path: string, handler: EndpointHandler) => void;
    put: (path: string, handler: EndpointHandler) => void;
    delete: (path: string, handler: EndpointHandler) => void;
}
