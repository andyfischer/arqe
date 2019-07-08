
/**
 * Enum of valid options for `cache` in a [[Response]].
 */
export type CacheOption = 'forever' | 'short' | 'none';

/**
 * Object used to assign a single cookie in a [[Response]].
 */
export interface CookieData {
    value: string
    maxAge?: number,
    httpOnly?: boolean,
    signed?: boolean
    secure?: boolean
}

/**
 * Response data for an endpoint call. This is the data returned by your endpoint handler.
 * Express-wrapper will take this data and send it to Express's `res` object.
 *
 * There are two kinds of responses that you can send:
 *
 *  1) Responses with no `contentType` or `body`. In this case, Express-wrapper will serialize
 *     the entire `Response` object (including any extra fields that you include), and send
 *     that as the body. The `content-type` header will be `application/json`
 *
 *  Note that Express-wrapper will NOT include any fields that it uses. For example,
 *  Express-wrapper uses the `statusCode` field to set the `status` header. This
 *  field is NOT included in the serialized JSON data in the response body.
 *
 *  2) Responses with `contentType` and `body`. In this case, the response will simply
 *     include the provided `body`. Any extra fields in the `Response` will not be used.
 */
export default interface Response {
    /**
     * The HTTP cache option to use for this response. If provided, this sets the `cache-control`
     * response header.
     *
     * Cache options are:
     *   * `'forever'` - Sets `max-age` to 1 year
     *   * `'short'` - Sets `max-age` to 15 minutes
     * 
     * @default none
     * @optional
     */
    cache?: CacheOption

    /**
     * HTTP status code for this response
     * 
     * @optional
     * @default 200
     */
    statusCode?: number

    /**
     * Location response header. If provided, this will trigger a redirect. Also, 
     * if a location is provided, then the default `statusCode` is 302. (if you
     * don't provide a different `statusCode`)
     * @optional
     */
    location?: string

    /**
     * HTTP headers to add to the response.
     */
    headers?: { [key:string]: string }

    /**
     * Any cookies to assign.
     * @optional
     */
    setCookie?: {[key:string]: CookieData | null}

    /**
     * Specific `content-type` to use for this response. If you provide this, then
     * you should also provide a `body` value.
     * @optional
     */
    contentType?: string

    /**
     * Custom response body. This is only used when `contentType` is provided. This data
     * can be anything that Express's `res.end()` accepts, such as a string or Buffer.
     * @optional
     */
    body?: any

    [key: string]: any
}
