
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

    async function completer(line) {
        // todo
        return []
    }

    const repl = require('repl').start({
        prompt: ' > ',
        eval: evaluate,
        completer
    });
}
