// generated file

import { Snapshot } from '../framework';
import agents from './agents';
import cd from './cd';
import createWorkingDir from './create-working-dir';
import defFunction from './def-function';
import defRelation from './def-relation';
import defSlot from './def-slot';
import defType from './def-type';
import defineToggle from './define-toggle';
import deploy from './deploy';
import dirSnapshots from './dir-snapshots';
import encodeFile from './encode-file';
import env from './env';
import findRelations from './find-relations';
import fixErrorsFromTsc from './fix-errors-from-tsc';
import gitCheckout from './git-checkout';
import help from './help';
import ls from './ls';
import npmListInstalled from './npm-list-installed';
import setInCurrentFile from './set-in-current-file';
import set from './set';
import showCommands from './show-commands';
import spawnDiscoveryAgentIfNeeded from './spawn-discovery-agent-if-needed';
import thatShouldWork from './that-should-work';
import timedate from './timedate';
import watch from './watch';

export function implementEveryCommand(snapshot: Snapshot) {
    agents(snapshot);
    cd(snapshot);
    createWorkingDir(snapshot);
    defFunction(snapshot);
    defRelation(snapshot);
    defSlot(snapshot);
    defType(snapshot);
    defineToggle(snapshot);
    deploy(snapshot);
    dirSnapshots(snapshot);
    encodeFile(snapshot);
    env(snapshot);
    findRelations(snapshot);
    fixErrorsFromTsc(snapshot);
    gitCheckout(snapshot);
    help(snapshot);
    ls(snapshot);
    npmListInstalled(snapshot);
    setInCurrentFile(snapshot);
    set(snapshot);
    showCommands(snapshot);
    spawnDiscoveryAgentIfNeeded(snapshot);
    thatShouldWork(snapshot);
    timedate(snapshot);
    watch(snapshot);
}