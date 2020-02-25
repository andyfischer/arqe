
# Description #

shell-bootstrap provides a way to load the application's model with text files
that include a series of updating commands.

The approach is *reproducible* and *update-aware*. We can insert a new command anywhere
in the stream, and the system will correctly update all the derived information.

# MOTIVATIONS #

# Why the format needs to be command-based #

This approach allows the model to be updated by a series of actions / commands. There
are some builtin commands for common data structures, and it's possible to define
more commands. The reason we use a command-based approach:

 - It's the best way to allow for safe, *transactional* updates.
 - It's the easiest way for humans to directly interact with the system.
 - It's the most compressed way to store the data.

# Human centric #

The format aims to be very human-centric. Commands are easy to read, write, and modify.
Often a user will type in commands as part of a REPL interface, so they are empowered to
be able to manually do anything that can be done with the format.

    USE CASE: The system uses its knowledge of commands to provide good *autocompletion*,
    and other helpful UX features.

# DETAILS OF SYNTAX #

    <command> [<key>=<value> ...] [<bare key> ...] -- [...raw value ...]

 - The key/value section is *order independent*. This helps keep the format flexible
   and extensible for context-free manipulation.

     USE CASE: Add a new key/value pair to an existing command.

# Declarative in nature #

These commands are declarative in nature, and highly *observable*. The system supports
*abstract interpretation* and *speculative* execution.

     USE CASE: For a given command, list and describe the effects that it will have.
