#! /usr/bin/env node

import 'source-map-support/register'

import os from 'os'
import Fs from 'fs-extra'
import Path from 'path'
import serveExpressApp from './serveExpressApp'
import { print, readTextLinesSync } from '../utils'
import { loadBootstrapFile } from '../framework'
import { runQueryInput } from '../query'
import { setupUserDir } from '../storage'
import { loadMainSnapshot } from '../framework'
import nodeRepl from '../terminal/nodeRepl'

async function main() {

    await setupUserDir();
    const snapshot = await loadMainSnapshot();
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
        // Run args as a query.
        await runQueryInput(snapshot, args.join(' '));
        return;
    }

    nodeRepl(snapshot);
}

main()
.catch(console.error);
