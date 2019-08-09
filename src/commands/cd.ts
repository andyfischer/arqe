
import { implement, print } from '..'

implement('cd', (query) => {
    const dir = query.commandArgs[0];

    try {
        process.chdir(dir);
    } catch (err) {

        if (err.code === 'ENOENT') {
            query.respond({
                error: 'no such directory: ' + dir
            });
            return;
        }

        query.respond(err);
        return;
    }

    query.respond('changed directory to: ' + dir);
});

implement('cwd', (query) => {
    query.respond(process.cwd());
});
