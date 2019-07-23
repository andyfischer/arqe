
import ExpressPromisedApp, { createExpressApp } from '../../express-promised-app'
import { print } from '../../utils'
import Service from '../../types/ServiceInfo'

// listen for register commands
// keep a table of registered services

const registeredServices: { [id: string]: Service } = {}
const registeredPorts: { [port: string]: Service } = {}
let nextPort = 3500;

function assignPort(service: Service) {
    const port = nextPort;

    if (registeredPorts[port]) {
        throw new Error(`internal error: port ${port} already has a service`);
    }

    nextPort += 1;
    service.port = port;
    registeredPorts[port] = service;
}

function setupEndpoints(app: ExpressPromisedApp) {
    app.put('/service/:id', async (req) => {
        const { id } = req.params;
        const found = registeredServices[id];
        if (found) {
            return {
                statusCode: 400,
                error: "already have a service with id: " + id
            }
        }

        const service = req.body;

        if (!service.name) {
            return {
                statusCode: 400,
                error: "request data is missing: name"
            }
        }

        assignPort(service);
        registeredServices[id] = service;

        print(`registered service ${id}: ${JSON.stringify(service)}`);

        return {
            service,
            message: 'okay, registered service with id: ' + id
        }
    });

    app.delete('/service/:id', async (req) => {
        const { id } = req.params;
        const found = registeredServices[id];
        if (found) {
            delete registeredServices[id];
            print(`deleted service ${id}`);
            return {
                message: 'okay, deleted service: ' + id
            }
        } else {
            return {
                statusCode: 404,
                error: "didn't find service: " + id
            }
        }
    });

    app.get('/find', async (req) => {
        print('called find');
        const query = req.query;

        const allServices: Service[] = Object.values(registeredServices);
        const matches = allServices.filter(service => {
            if (query.name && service.name !== query.name)
                return false;

            if (query.tag && service.tags.indexOf(query.tag) === -1)
                return false;

            return true;
        });

        return {
            services: matches
        }
    });
}

async function startListening() {
    const app = createExpressApp({
        setupEndpoints,
        printAccessLog: true
    });

    const port = process.env.PORT || 9141;
    await app.listen(port)
    print(`Web server listening at: 0.0.0.0:${port}`);
}

if (require.main === module) {
    startListening()
    .catch(console.error);
}
