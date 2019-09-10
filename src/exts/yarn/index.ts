
/*
import ChildProcess from 'child_process'
import Util from 'util'
import { implement } from '../..'

const exec = Util.promisify(ChildProcess.exec);

implement('yarn-workspace-list', async (query) => {

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
*/
