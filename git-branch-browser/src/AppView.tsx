
import React, { useState, useEffect, useContext } from 'react'
import { Text, Box, StdinContext, useInput } from 'ink'
import SelectInput from 'ink-select-input'

export default function AppView({dir, api}) {
    const [ items, setItems ] = useState([]);
    const [ selectedIndex, setSelectedIndex ] = useState(0);

    async function refreshItems() {
        const items = await api.getBranches(dir);
        setItems(items);
    }

    function selectUp() {
        if (selectedIndex > 0)
            setSelectedIndex(selectedIndex - 1);
    }

    function selectDown() {
        if (selectedIndex < (items.length - 1))
            setSelectedIndex(selectedIndex + 1);
    }

    async function handleInput(data) {
        if (data === 'j')
            selectDown()

        if (data === 'k')
            selectUp()

        if (data === 'd') {
            const current = items[selectedIndex];
            await api.deleteBranch(dir, current);
            setSelectedIndex(selectedIndex - 1);
        }
    }

    /*
    function onData(data) {
        handleInput(data);
        return true;
    }

    useEffect(() => {
        process.stdin.on('data', onData);
        return () => {
            process.stdin.removeListener('data', onData)
        }
    });
    */

    useInput((input, key) => {
        handleInput(input);
    });

    useEffect((() => { refreshItems()}), []);

    return <Box flexDirection="column">
        {items.map((item, i) => {
            const selected = selectedIndex === i;
            return <Box key={item} marginRight={1}>
                { selected ? '> ' : '  '}
                {item}
            </Box>
        })}
    </Box>
}
