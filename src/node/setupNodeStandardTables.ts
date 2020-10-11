
import setupFilesystemTables from '../tables/Filesystem'

export default function setupNodeStandardTables() {
    return ([]
        .concat(setupFilesystemTables())
        
        )
}