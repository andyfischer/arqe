
import React, { useState, useEffect } from 'react';
import DashboardShell from './DashboardShell'
import { initializeGraph } from './initializeGraph'
import ColorScheme from './ColorScheme'

function Context({children}) {
    return <React.StrictMode>
        <div style={{
          '--body-bg': ColorScheme.background,
          '--bg-light-tint': ColorScheme.backgroundLightTint,
          '--bg-dark-tint': ColorScheme.backgroundDarkTint,
          '--primary': ColorScheme.neutralPrimary,
        }}>

        { children }

        </div>
    </React.StrictMode>
}

export default function Main() {

    return <Context>
        <DashboardShell />
    </Context>
}
