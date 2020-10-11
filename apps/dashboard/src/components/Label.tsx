
import React, { useState } from 'react'
import useLiveRelation, { useLiveRelationSingleObject } from "../useLiveRelation";

interface Props {
    path: string
}

export default function Label({path}) {
    console.log('label path: ' + path)
    const value = useLiveRelationSingleObject(`run-query query ${path}`).value;

    return <div>Label: {value || ''}</div>
}
