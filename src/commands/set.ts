
import { CommandContext, declareCommand, runAsMain } from '../framework'
import { print } from '../utils'

const verbose = !!process.env.verbose;

async function run(context: CommandContext) {

    if (!context.snapshot)
        throw new Error('missing context.snapshot');

    const options = context.query.options;

    for (const k in options) {
        const v = options[k];

        if (verbose)
            print(`setting '${k}' to '${v}'`);

        context.snapshot.liveValues[k] = options[k];
    }
}

const command = declareCommand({
    name: 'set',
    run
});

if (require.main === module) {
    runAsMain(command);
}
