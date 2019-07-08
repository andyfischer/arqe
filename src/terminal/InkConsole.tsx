
import { Text } from 'ink'
import React, { useState, useReducer, useEffect, useContext } from 'react'
import TextInput from 'ink-text-input'
import Spinner from 'ink-spinner'
import { StdinContext } from 'ink'
import { printError } from '../utils'
import chalk from 'chalk'
import TerminalState from './TerminalState'

export function useForceUpdate() {
    const [, setTick] = useState(0);
    const update = () => {
        setTick(tick => tick + 1);
    }
    return update;
}

function CurrentInput(props) {
    return <Text>
        {'> ' + props.text + chalk.inverse(' ') }
    </Text>
}

export default function InkConsole(props: { state: TerminalState }) {
    const state = props.state;
    const [input, setInput] = useState('')
    const [isWaiting, setIsWaiting] = useState(false);
    const { stdin, setRawMode } = useContext(StdinContext);
    const triggerUpdate = useForceUpdate();

    const mountCheck = {
        mounted: true
    }

    function handleInput(data) {
        if (!mountCheck.mounted)
            return;

        state.handleInput(data);
    }

    useEffect(() => {
		setRawMode(true);
		stdin.on('data', handleInput);
        state.events.on('change', triggerUpdate);

        return () => {
            mountCheck.mounted = false;
            stdin.removeListener('data', handleInput);
            state.events.removeListener('change', triggerUpdate);
            setRawMode(false);
        }
    })

    return <>
        { state.output.map((line, i) => <Text key={i}>{line} </Text>) }
        { isWaiting && <Spinner /> }
        <CurrentInput text={ state.currentInput } />
    </>
}
