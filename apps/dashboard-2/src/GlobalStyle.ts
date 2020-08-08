import { createGlobalStyle } from "styled-components";
import colorScheme from './ColorScheme'

export default createGlobalStyle`
    body {
        background: ${colorScheme.background};
        color: ${colorScheme.neutralPrimary};
    }
`