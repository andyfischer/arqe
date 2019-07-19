
import ExpressPromisedApp, { createExpressApp } from '../../express-promised-app'
import { print } from '../../utils'

// listen for register commands
// keep a table of registered services

interface Service {
    name: string
    url: string
    tags: string[]
}

const registeredServices: { [id: string]: Service } = {}

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

        const info = req.body;

        if (!info.name) {
            return {
                statusCode: 400,
                error: "service info is missing: name"
            }
        }

        if (!info.url) {
            return {
                statusCode: 400,
                error: "service info is missing: url"
            }
        }

        registeredServices[id] = info;

        print(`registered service ${id}: ${JSON.stringify(info)}`);

        return {
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
