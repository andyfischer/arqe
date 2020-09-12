import React from "react";
import useLiveRelation, { useLiveRelationList } from "./useLiveRelation";
import colorScheme from './ColorScheme'
import TextPrompt from './components/TextPrompt'
import QueryView from "./components/QueryView";

function TopMenubar() {
    return <div className="top-menubar">
    </div>
}

function SidebarItem({title, link}) {
    return <div className="sidebar-item">
        <h1>{title}</h1>
    </div>
}

function LeftSidebar() {
    const items = useLiveRelationList('get sidebar-item/* title link') || [];

    return <div className="left-sidebar">
        { items.map((item, index) => <SidebarItem key={index} {...item} />) }
    </div>
}

function component({ document_item, type, style }) {
    const itemKey = `document_item/${document_item}`

    if (type === 'query') {
        return <QueryView
            key={itemKey}
            style={style}
            type={type}
            path={ itemKey }
            />
    }

    if (type === 'prompt')
        return <TextPrompt key={itemKey} path={itemKey} />

    return <div>unrecognized type: {type}</div>
}

function MainContentPanel() {
    const items = useLiveRelationList('get document_item type style') || []

    return <div className="main-content-panel">
        { items.map((item, i) => component(item)) }
    </div>
}

export default function DashboardShell() {

    return <div className="dashboard-grid">
        <TopMenubar />
        <LeftSidebar />
        <MainContentPanel />
    </div>
}
