
import { AgentFramework, loadMainSnapshot, print } from '../../..'

async function main() {
    const snapshot = await loadMainSnapshot();

    snapshot.implementCommand('capture-page', () => {
    });

    const framework = new AgentFramework({
        name: 'Puppeteer',
        snapshot
    });



    await framework.start();

    print('Launched as service ' + framework.serviceId);

    process.on('SIGINT', () => {
        framework.stop();
    });
}

main()
.catch(console.error);
