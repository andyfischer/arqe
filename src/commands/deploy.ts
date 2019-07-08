
import { CommandContext, declareCommand, runAsMain } from '../framework'
import { print } from '../utils'
import { mkdirp } from 'fs-extra'

async function run(context: CommandContext) {
    // Check if there is a designated deployment location
    // Look at the deployment targret
    // Create the directory
    // Create the package.json
    // Run yarn --pnp

    await name = context.get('deployment-name');
    await context.query(`provision-working-dir dir-name=${name}`);

    //const packageJson = await context.get('deploy.packageJson');

    // print('deploying to: ' + dir);

    // Create the directory
    // await mkdirp(path.join(dir, deployName));
}

const command = declareCommand({
    name: 'deploy',
    run
});

if (require.main === module) {
    runAsMain(command);
}

