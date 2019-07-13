
import { Snapshot } from '../framework'

function trimEndline(str) {
    if (str.length > 0 && str[str.length-1] === '\n')
        return str.slice(0, str.length-1);

    return str;
}

export default async function nodeRepl(snapshot: Snapshot) {
    
    async function evaluate(line) {
        line = trimEndline(line);
        await snapshot.applyQuery(line);
        repl.displayPrompt();
    }

    function completer(line) {
        try {
            const autocompleteInfo = snapshot.getValueOpt('autocompleteInfo')
            if (!autocompleteInfo)
                return;

            const matches = [];

            for (const w in autocompleteInfo.found.everyWord) {
                if (w.startsWith(line))
                    matches.push(w);
            }

            return [matches, line];
        } catch (err) {
            console.error(err);
            return []
        }
    }

    const repl = require('repl').start({
        prompt: ' $$ ',
        eval: evaluate,
        completer
    });
}
