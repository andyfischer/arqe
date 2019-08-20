
import LocalTerminalConnection from './LocalTerminalConnection'
import TerminalState from './TerminalState'
import { render } from 'ink'
import React from 'react'
import InkConsole from './InkConsole'
import { Snapshot } from '../..'

export default async function startLocalTerminal(snapshot: Snapshot) {
    const connection = new LocalTerminalConnection(snapshot)
    await connection.start();

    const state = new TerminalState(connection);

    render(<InkConsole state={state} />);
}
