import React from "react";
import styled from 'styled-components'
import useLiveRelation, { useLiveRelationList } from "./useLiveRelation";
import QueryView from "./QueryView";

import colorScheme from './ColorScheme'

const DashboardGridStyle = styled.div`
    display: grid;
    grid-template-columns: [left-col] 160px [main-content-col] auto;
    grid-template-rows: [top-menubar] 40px [main-content-row] auto;

    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
`

const TopMenubarStyle = styled.div`
    grid-row: top-menubar;
    grid-column: main-content-col / 3;
    background: ${colorScheme.backgroundLightTint};
    padding: 4px;
    display: flex;
    align-items: center;
`

const LeftSidebarStyle = styled.div`
    grid-row: top-menubar / 3;
    grid-column: left-col;
    border-right: 1px solid grey;

    background: ${colorScheme.backgroundDarkTint};
`

const MainContentPanelStyle = styled.div`
    grid-row: main-content-row;
    grid-column: main-content-col;
    padding: 4px;
`

function TopMenubar() {
    return <TopMenubarStyle>
    </TopMenubarStyle>
}

const SidebarItemStyle = styled.div`
    height: 60px;
    display: flex;
    justify-content: left;
    padding: 4px;
    border-bottom: 1px solid grey;
    align-items: center;

    font-size: 12px;
    flex-wrap: wrap;

    h1 {
        text-align: left;
        width: 100%;
        margin: 0;
    }
`

function SidebarItem({title, link}) {
    return <SidebarItemStyle>
        <h1>{title}</h1>
    </SidebarItemStyle>
}

function LeftSidebar() {
    const items = useLiveRelationList('get sidebar-item/* title link') || [];
    return <LeftSidebarStyle>
        { items.map((item, index) => <SidebarItem key={index} {...item} />) }
    </LeftSidebarStyle>
}

function MainContentPanel() {
    const items = useLiveRelationList('get document-item style query') || []

    return <MainContentPanelStyle>
        { items.map((item, i) => (
            <QueryView
                key={i}
                style={item.style}
                queryStr={item.query}
            />
        )) }
    </MainContentPanelStyle>
}

export default function DashboardShell() {

    return <DashboardGridStyle>
        <TopMenubar />
        <LeftSidebar />
        <MainContentPanel />
    </DashboardGridStyle>
}
