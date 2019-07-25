
import { AgentFramework, loadMainSnapshot, print } from '..'

async function main() {
    const snapshot = await loadMainSnapshot();

    const framework = new AgentFramework({
        name: 'TestAgent',
        snapshot
    })

    await framework.start();

    print('Launched as service ' + framework.serviceId);

    process.on('SIGINT', () => {
        framework.stop();
    });
}

main()
.catch(console.error);
