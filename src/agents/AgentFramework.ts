
import ExpressPromisedApp, { createExpressApp } from '../express-promised-app'
import { Snapshot, CommandHandler } from '../framework'
import Bent from 'bent'
import { print, randomHex } from '..'

interface SetupArgs {
    name: string
    discoveryServiceUrl?: string
}

const defaultDiscoveryServiceUrl = 'http://localhost:9141/'

export default class AgentFramework {

    serviceId: string
    setupArgs: SetupArgs
    webApp: ExpressPromisedApp
    httpServer: any
    snapshot: Snapshot
    discoveryServiceUrl: string

    constructor(args: SetupArgs) {
        this.setupArgs = args;
        this.serviceId = `${args.name}-${randomHex(6)}`
        this.webApp = createExpressApp({
            setupEndpoints: app => this.setupEndpoints(app)
        });
        this.discoveryServiceUrl = args.discoveryServiceUrl || defaultDiscoveryServiceUrl;
    }

    private setupEndpoints(app: ExpressPromisedApp) {
    }

    implementCommand() {
    }

    async start() {

        let registeredService;

        try {
            const put = Bent(this.discoveryServiceUrl, 'json', 'PUT', 200);
            registeredService = await put(`service/${this.serviceId}`, {
                name: this.setupArgs.name
            });

        } catch (err) {
            const msg = 'error: Failed to connect to discovery service at ' + this.discoveryServiceUrl;
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

        this.httpServer = await this.webApp.listen(port);
    }
    
    async stop() {
        const del = Bent(this.discoveryServiceUrl, 'json', 'DELETE', 200);
        await del(`service/${this.serviceId}`);
        this.httpServer.close();
    }
}
