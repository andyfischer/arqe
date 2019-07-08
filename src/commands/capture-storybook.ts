
import { CommandContext, declareCommand, runAsMain } from '../framework'

async function run(context: CommandContext) {
}

const command = declareCommand({
    name: 'capture-storybook',
    run
});

export default command;

if (require.main === module) {
    runAsMain(command);
}

