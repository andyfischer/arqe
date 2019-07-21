
import { AgentFramework } from '.'

const framework = new AgentFramework({
    name: 'TestAgent'
})

async function main() {
    await framework.start();

    await framework.stop();
}

main()
.catch(console.error);
