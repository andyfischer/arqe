
import Path from 'path'
import Response, { CacheOption, CookieData } from './Response'
import ExpressWrapper from '.'

function defaultStatusCode(response:Response) {
    if (response.location)
        return 302;
    else
        return 200;
}

function defaultCacheOption(req, response:Response) : CacheOption {
    if (req.method === 'get')
        return 'short';
    else
        return 'none';
}

function serveBody(req, res, response: Response) {
    res.setHeader('content-type', response.contentType);
    res.end(response.body);
}

function serveJsonBody(req, res, response: Response) {
    // Reply with JSON data
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(response, null, 2));
}

export default function sendResponse(wrapper: ExpressWrapper, req, res, response:Response) {

    const statusCode = response.statusCode || defaultStatusCode(response);
    res.status(statusCode);

    // Extract and delete fields from response
    const cacheOption:CacheOption = response.cache || defaultCacheOption(req, response);

    for (const headerName in (response.headers || {})) {
        res.setHeader(headerName, response.headers[headerName]);
    }

    delete response.cache;
    delete response.statusCode;
    delete response.headers;

    // CORS header
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Cache header
    switch (cacheOption) {
    case 'forever':
        res.setHeader('cache-control', 'max-age=31556926'); // 1 year
        break;
    case 'short':
        res.setHeader('cache-control', 'max-age=900'); // 15 minutes
        break;
    }

    if (response.location) {
        res.setHeader('location', response.location);
        res.end();
        return;
    }

    if (response.setCookie) {
        for (const key in response.setCookie) {
            const data:CookieData|null = response.setCookie[key];

            if (!data) {
                res.clearCookie(key);
            } else {
                res.cookie(key, (<CookieData>data).value, (<CookieData>data));

                if ((<CookieData>data).httpOnly)
                    (<CookieData>data).value = '(http only)';
            }
        }
        delete response.setCookie;
    }

    if (response.contentType) {
        serveBody(req, res, response);
    } else {
        serveJsonBody(req, res, response);
    }
}
