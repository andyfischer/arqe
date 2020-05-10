
import React, { useState, useEffect, useContext } from 'react'
import { Text, Box, Color, StdinContext, useInput } from 'ink'

export default function AppView({dir, api}) {
    let [ items, setItems ] = useState([]);
    let [ selectedIndex, setSelectedIndex ] = useState(0);

    async function refreshItems() {
        const items = await api.getBranches(dir);
        setItems(items);

        if (selectedIndex >= items.length)
            selectedIndex = items.length - 1;
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
            await refreshItems();
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
        <Text>[press 'd' to delete]</Text>
        {items.map((item, i) => {
            const selected = selectedIndex === i;
            return <Box key={item} marginRight={1}>
                { selected && <Color hex="#ff00ff">{'> '}{item}</Color> }
                { !selected && '  ' + item }
            </Box>
        })}
    </Box>
}
