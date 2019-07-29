
import { Snapshot } from '../framework'
import { printEvents } from '../utils'

const prompt = ' ~ '
let promptIsLive = false;
let promptIsRecentlyPrinted = false;

function trimEndline(str) {
    if (str.length > 0 && str[str.length-1] === '\n')
        return str.slice(0, str.length-1);

    return str;
}

printEvents.on('beforeLog', () => {
    if (promptIsRecentlyPrinted) {
        process.stdout.write('\n');
        promptIsRecentlyPrinted = false;

        setTimeout(() => {
            if (promptIsLive && !promptIsRecentlyPrinted) {
                promptIsRecentlyPrinted = true;
                process.stdout.write(prompt);
            }
        }, 200);
    }
});

printEvents.on('afterLog', () => {
});

function onStartedPrompt() {
    promptIsLive = true;
    promptIsRecentlyPrinted = true;
}

function onFinishedPrompt() {
    promptIsLive = false;
    promptIsRecentlyPrinted = false;
}

export default async function nodeRepl(snapshot: Snapshot) {
    
    async function evaluate(line) {
        onFinishedPrompt();

        line = trimEndline(line);
        await snapshot.applyQuery(line, { isInteractive: true } );

        repl.displayPrompt();

        onStartedPrompt();
    }

    function completer(line) {
        try {
            const autocompleteInfo = snapshot.getValueOpt('autocompleteInfo', null)
            if (!autocompleteInfo)
                return;

            const matches = [];

            for (const w in autocompleteInfo.everyWord) {
                if (w.startsWith(line))
                    matches.push(w);
            }

            return [matches, line];
        } catch (err) {
            console.error(err);
            return []
        }
    }

    onStartedPrompt();

    const repl = require('repl').start({
        prompt,
        eval: evaluate,
        completer
    });
}
