
export default class SocketClient {
    constructor(ws) {
    }
}

// patterns:
//
//    shared client-server synchronized state
//      used for: ? (poop emoji)
//
//    one way data / logging client
//      used for: trace logging in various apps
//      idea:
//        mount a table as a write-only feed to a socket backed table
//
//    push to client
//      used for: shared view driven by various input scripts
//      related to: dispatching server
//
//    dispatching server
//      used for: central server that coordinates
//      idea:
//        server receives queries, and certain tags cause the entire query to be resolved by a different client.
//
// To implement:
//  - Socket backed table mixin
//  - Launch Arqe with socket server enabled
//  - Mount a table with a "super tag" (?) matcher
//
//
// SocketBackedTable?
//   Receives queries, all queries are sent across a socket, and finished with a reply.
//
// SocketServer
//   Receives messages, runs the query, replies with the result.
