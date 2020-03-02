
def-relation is-alias-for
def-relation supports-jsx
def-relation doesnt-support-jsx
def-relation has-supported-type
def-relation is-based-on

bool is-alias-for boolean
int is-alias-for integer
nil is-alias-for null

javascript ..
  has-supported-type number
  has-supported-type boolean
  has-supported-type null
  has-supported-type object

typescript ..
  is language
  is-based-on javascript

.. is filetype
  js
  jsx
  ts
  tsx

.. is relation
  supports-jsx

js doesnt-support-jsx
ts doesnt-support-jsx
jsx supports-jsx
tsx supports-jsx

# be able to enter a JSX snippet into the system
# file-context project=react-test
# load-file xxx

def-link ..
  includes 

# linker should autodetect required props
# linker should be able to attach it to a web application
# link forall-current-project

# serve the linked application as a web app
# have it all work!
