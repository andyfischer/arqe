
const ChildProcess = require('child_process');
const Util = require('util');

const fslib = global['fslib'];

const exec = Util.promisify(ChildProcess.exec);

fslib.implementCommand('yarn-workspace-list', async (query) => {

    try {
        const { stdout } = await exec('yarn workspaces info -s')

        const packageMap = JSON.parse(stdout);

        const packages = Object.keys(packageMap);

        query.respond({
            type: 'string[]',
            value: packages
        });

    } catch (err) {
        query.respond({
            error: err.message
        });
        return;
    }
});
