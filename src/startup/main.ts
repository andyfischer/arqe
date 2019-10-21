#! /usr/bin/env node

import 'source-map-support/register'

import os from 'os'
import Fs from 'fs-extra'
import Path from 'path'
import serveExpressApp from './serveExpressApp'
import { print, readTextLinesSync } from '../utils'
import { loadDataFile } from '../framework'
import { runQueryInput } from '../query'
import { setupUserDir } from '../storage'
import { loadStdlibScope } from '../bootstrap-runtime'
import nodeRepl from '../terminal/nodeRepl'
import { VM } from '../VM'

async function main() {

    await setupUserDir();
    const scope = await loadStdlibScope();
    const args = process.argv.slice(2);
    const vm = new VM(scope);
    
    if (args.length > 0) {
        print('error: sorry not working');
        return;
        // Run args as a query.
        //await runQueryInput(snapshot, args.join(' '), { isInteractive: true });
        //return;
    }

    nodeRepl(vm);
}

main()
.catch(console.error);
