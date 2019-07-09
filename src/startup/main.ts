#! /usr/bin/env node

import 'source-map-support/register'
import os from 'os'
import Fs from 'fs-extra'
import Path from 'path'
import { fileStoreExists, setupFileStore } from '../store'
import serveExpressApp from './serveExpressApp'
import { print, readTextLinesSync } from '../utils'
import { loadBootstrapFile, applyQuery } from '../snapshot'
import setupUserDir from './setupUserDir'
import loadMainSnapshot from './loadMainSnapshot'
import nodeRepl from './nodeRepl'

async function main() {

    await setupUserDir();
    const snapshot = await loadMainSnapshot();
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
        // Run args as a query.
        await applyQuery(snapshot, args.join(' '));
        return;
    }

    nodeRepl(snapshot);
}

main()
.catch(console.error);
