
def-command def-command
def-command def-relation

def-relation is
def-relation includes
def-relation has
def-relation requires-arg
def-relation has-main-arg
def-relation has-no-implementation

command/def-command ..
  has-no-implementation
  requires-arg command-name
  has-main-arg command-name

command/def-relation ..
  has-no-implementation
  requires-arg relation-name
  has-main-arg relation-name

def-command def-declaration
def-command def-type
def-command def-collection
def-command def-language
def-command def-filetype
def-command def-alias
def-command def-relation
def-command name
def-command load-file
def-command add-context
def-command remove-context
def-command eof
def-command dump
def-command file-contents
def-command deploy
def-command set
def-command help
def-command http-post

command/def-declaration ..
  has-no-implementation
  requires-arg declaration-name
  has-main-arg declaration-name

command/eof has-no-implementation

.. is type
  integer
  number
  string
  boolean
  null
  object

bootstrap-scripts includes ..
  edit.p
  workingdir.p
  languages.p
  jenkins.p

