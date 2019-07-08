
// to build:

// Types:

// Event
//  - The way changes are stored & shared
//  - Plain JSON
//  - Can be cached forever
//  - Has a unique id
//  - Ordered
//  - Can be associated with a session
//
// Filter
//  - matches some events
//
// Stream
//  - a filtered view of events
//  - some events are in it, some aren't
//
// Reducer
//  - stateful function that operates on an event stream
//  - has an intermediate data
//  - can be accessed at a certain time
//  - has a unique name
//  - some are reversable, some aren't
//  - support checkpointing, have a dynamic checkpointing policy
//
// Directory
//  - maps human names to resources
//  - works as a namespace
//
// Supported operations:
//
//   - getReducerAt(reducerName, eventId)
//   - getLatestEventOnSession(sessionId)
//
// Support a way to see 'latest'
//
// ---
// Calendar example
//   Every change is an event
//   Document implemented as a reducer
//     Implemented with insert & remove & change operations
//
// Code to write
//  - Use postgres as the store
//    - Fetch & store events
//    - Store heads
//    - Store directory
//  - Implement reducer flow
//    - Auto checkpointing
//  - Implement document reducer
//  - Handle incoming events
//    - Find all affected reducers and update
//
// First prototype
//  - Receive incoming events
//  - Support events to spawn directories
//  - Store directories in Postgres
//  - Support events to spawn reducers
//  - Store reducers in Postgres
//  - Support events
//  - Store events in Postgres
//  - Each database knows its latest event (for meta-events)
