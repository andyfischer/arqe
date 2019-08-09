
import { declareCommand, print } from '..'

declareCommand({
    name: 'cd',
    run: (query) => {
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
    }
});

declareCommand({
    name: 'cwd',
    run: (query) => {
        query.respond(process.cwd());
    }
});
