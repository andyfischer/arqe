#! /usr/bin/env node

import 'source-map-support/register'
import os from 'os'
import Fs from 'fs-extra'
import Path from 'path'
import { fileStoreExists, setupFileStore } from '../store'
import serveExpressApp from './serveExpressApp'
import { print, readTextLinesSync } from '../utils'
import { getMainSnapshot, loadBootstrapFile, applyQuery } from '../snapshot'
import promptRepl from './promptRepl'

async function main() {

    const snapshot = await getMainSnapshot();
    const args = process.argv.slice(2);
    if (args.length > 0) {
        await applyQuery(snapshot, args.join(' '));
        return;
    }

    //if (args.repl)
    //    await startLocalTerminal(snapshot)

    await promptRepl(snapshot);
}

main()
.catch(console.error);
