#! /usr/bin/env node

import 'source-map-support/register'
import React from 'react'
import { render } from 'ink'
import InkConsole from './InkConsole'
import HttpTerminalConnection from './HttpTerminalConnection'
import TerminalState from './TerminalState'
import { printError } from '../..'

async function main() {

    const connection = new HttpTerminalConnection()
    await connection.start();

    const state = new TerminalState(connection);

    render(<InkConsole state={state} />);
}

main()
.catch(printError);
