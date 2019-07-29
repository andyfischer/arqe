
import { CommandContext, declareCommand, runAsMain } from '../framework'
import { Query } from '..'

async function run(query: Query) {
}

const command = declareCommand({
    name: 'capture-storybook',
    run
});

export default command;

if (require.main === module) {
    runAsMain(command);
}

