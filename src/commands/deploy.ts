
import { CommandContext, declareCommand, runAsMain } from '../framework'
import { print } from '../utils'
import { Query } from '..'
import { mkdirp } from 'fs-extra'

async function run(query: Query) {
    // Check if there is a designated deployment location
    // Look at the deployment targret
    // Create the directory
    // Create the package.json
    // Run yarn --pnp

    const name = query.get('deployment-name');
    // await context.subQuery(`provision-working-dir dir-name=${name}`);

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

