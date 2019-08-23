
import { implement, print, error, performedAction } from '..'

implement('cd', (query) => {
    const dir = query.args[0];

    try {
        process.chdir(dir);
    } catch (err) {

        if (err.code === 'ENOENT') {
            query.respond(error('no such directory: ' + dir));
            return;
        }

        query.respond(err);
        return;
    }

    query.respond(performedAction('changed directory to: ' + dir));
});

implement('cwd', (query) => {
    query.respond(process.cwd());
});
