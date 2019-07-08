
def-relation might-be-at
def-relation create-if-missing
def-relation has-default-value

def-declaration used-by-fix-js-project

used-by-fix-js-project ..
  relation/might-be-at
  relation/create-if-missing
  relation/has-default-value

main-script ..
  might-be-at src/index.ts
  might-be-at src/index.tsx
  might-be-at src/index.js
  create-if-missing src/index.js

package.json has-default-value ..
  version '1.0.0'
  license 'UNLICESED'
  main 'dist/index.js'
  scripts {}
  dependencies {}
  devDependencies {}
  
  


