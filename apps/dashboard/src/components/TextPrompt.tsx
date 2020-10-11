
import React, { useState } from 'react'
import useLiveRelation, { useLiveRelationSingleObject } from "../useLiveRelation";
import { run } from '../graph'

interface Props {
    path: string
}

export default function TextPrompt({ path }: Props) {
    
    // const [ ver, setVer ] = useState(0);
    const value = useLiveRelationSingleObject(`get ${path} value`).value;

    function onChange(event) {
        const val = event.target.value;
        run(`set ${path} value/(set ${val})`);
        // setVer(ver + 1);
    }

    return <input className="text-prompt" type="text" value={value || ''} onChange={onChange} />
}
