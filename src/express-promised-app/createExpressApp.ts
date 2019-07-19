
import Express from 'express'
import BodyParser from 'body-parser'
import ExpressPromisedApp from '.'
import { print } from '../utils'

interface Options {
    setupEndpoints: (app: ExpressPromisedApp) => void,
    printAccessLog?: boolean
}

export default function createExpressApp(opts: Options): ExpressPromisedApp {
    const app = Express();

    if (opts && opts.printAccessLog) {
        app.use((req, res, next) => {
            res.on('finish', () => {
                print(`${req.method} ${req.url} ${res.statusCode}`);
            });
            next();
        });
    }

    app.use(BodyParser.json());

    app.options('/*', (req, res) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Max-Age', '86400');
        res.sendStatus(200);
    });
    
    const layer = new ExpressPromisedApp({
        expressApp: app
    });

    opts.setupEndpoints(layer);

    app.use((req, res, next) => {
        res.status(404);
        res.setHeader('Content-Type', 'text/plain');
        res.end('Not found: ' + req.url);
    });

    return layer;
}
