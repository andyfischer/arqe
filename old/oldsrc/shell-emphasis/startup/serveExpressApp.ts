
import Express from 'express'
import ExpressPromisedApp from '../express-promised-app'
import setupEndpoints from '../web/setupEndpoints'
import { print } from '../utils'

export default async function setupExpressApp() {

    const app = Express();
    app.use(require('body-parser').json());

    app.options('/*', (req, res) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Max-Age', '86400');
        res.sendStatus(200);
    });
    
    const layer = new ExpressPromisedApp({
        expressApp: app
    });

    setupEndpoints(layer);

    app.use((req, res, next) => {
        res.status(404);
        res.setHeader('Content-Type', 'text/plain');
        res.end('Not found: ' + req.url);
    });

    const port = process.env.PORT || 9140;
    await layer.listen(port)
    print(`Web server started, listening on: 0.0.0.0:${port}`);
}
