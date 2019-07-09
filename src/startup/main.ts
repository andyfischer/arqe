#! /usr/bin/env node

import 'source-map-support/register'
import os from 'os'
import Fs from 'fs-extra'
import Path from 'path'
import { fileStoreExists, setupFileStore } from '../store'
import serveExpressApp from './serveExpressApp'
import { print, readTextLinesSync } from '../utils'
import { getMainSnapshot, loadBootstrapFile, applyQuery } from '../snapshot'
import nodeRepl from './nodeRepl'

function start() {
    const evaluate = (line) => {
        console.log('evaluate: ', line);
    }

    const completer = (line) => {
        console.log('complete: ', line);
        return []
    }

    const repl = require('repl').start( {
        prompt: '> ',
        eval: evaluate,
        completer
    });
}

async function main() {

    const snapshot = await getMainSnapshot();
    const args = process.argv.slice(2);
    if (args.length > 0) {
        await applyQuery(snapshot, args.join(' '));
        return;
    }

    nodeRepl(snapshot);
}

main()
.catch(console.error);
