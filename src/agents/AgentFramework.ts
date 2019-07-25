
import ExpressPromisedApp, { createExpressApp } from '../express-promised-app'
import { Snapshot, CommandHandler } from '../framework'
import Bent from 'bent'
import { print, randomHex } from '..'

interface SetupArgs {
    name: string
    snapshot: Snapshot
}

// future: find discoveryServiceUrl in the snapshot
const discoveryServiceUrl = 'http://localhost:9141/'

export default class AgentFramework {

    serviceId: string
    setupArgs: SetupArgs
    webApp: ExpressPromisedApp
    httpServer: any
    snapshot: Snapshot

    constructor(args: SetupArgs) {
        this.setupArgs = args;
        this.serviceId = `${args.name}-${randomHex(6)}`
        this.webApp = createExpressApp({
            setupEndpoints: app => this.setupEndpoints(app)
        });
    }

    private setupEndpoints(app: ExpressPromisedApp) {
    }

    implementCommand() {
    }

    async start() {

        let registeredService;

        try {
            const put = Bent(discoveryServiceUrl, 'json', 'PUT', 200);
            registeredService = await put(`service/${this.serviceId}`, {
                name: this.setupArgs.name,
                tags: ['agent']
            });

        } catch (err) {
            const msg = 'error: Failed to connect to discovery service at ' + discoveryServiceUrl;
            print(msg);
            if (err.responseBody) {
                print(await err.responseBody);
            }

            throw new Error(msg);
        }

        const port = registeredService.service.port;

        if (!port) {
            const msg = "error: discovery service didn't give us a port"
            print(msg);
            throw new Error(msg);
        }

        process.on('beforeExit', code => {
            this.stop();
        });

        this.httpServer = await this.webApp.listen(port);
    }
    
    async stop() {
        try {
            const del = Bent(discoveryServiceUrl, 'json', 'DELETE', 200);
            await del(`service/${this.serviceId}`);
        } catch (err) {
        }

        this.httpServer.close();
    }
}
