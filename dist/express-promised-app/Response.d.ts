export declare type CacheOption = 'forever' | 'short' | 'none';
export interface CookieData {
    value: string;
    maxAge?: number;
    httpOnly?: boolean;
    signed?: boolean;
    secure?: boolean;
}
export default interface Response {
    cache?: CacheOption;
    statusCode?: number;
    location?: string;
    headers?: {
        [key: string]: string;
    };
    setCookie?: {
        [key: string]: CookieData | null;
    };
    contentType?: string;
    body?: any;
    [key: string]: any;
}
