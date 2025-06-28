# Claude

Hello Claude, here are the preferred ways to interact with this codebase. Thanks!

### How to make changes

Whenever making changes, unless specified (either explicitly or with a "[no pr]" piece of text at the beginning of the prompt) always do so through a GitHub PR using git and the GitHub CLI.

- Start with a clean, freshly pulled version of the main branch
- Create a new branch
- Make code changes
- Make a commit
- Push the commit
- Make a PR

The PR will then be reviewed and either merged or changes will be requested.

Please, don't ever merge a PR.

### Code style

- In writing code, simplicity and readability are key
- Good variable naming is important
  - Variables names should convey the underlying meaning of a variable, not just how its being used in the current context
  - Use words for variable names, not single letters nor acronyms
  - For booleans, always use 'is' or 'has' prefixes (or similar) (i.e.: isBlue, hasChildren)
    - Setters for booleans should be the name of boolean prefixed by 'set' (i.e.: setIsBlue, setHasChildren)
- Use functional programming styles and immutability when it makes the code cleaner
- Prefer creating mutiple files with distinct purposes, rather than giant monolith files
- Always feature-based file and folder organization for code. Minimal nesting of features
  is preferred. Feature folders should be lower-cased. Here is an example:
  - map/
    - mapRendering.js
    - mapLayers.js
    - useMap.js
    - Map/
      - Map.jsx
      - Map.module.css
- React components files should always be structured as the following (folder with two files in it). Example:
  - ComponentName/
    - ComponentName.jsx
    - ComponentName.module.css
- In JS / TS, always use arrow functions
- Use modern JS and TS features and latest best practices
- In redux slices, don't export actions (instead refer to them like: mainSlice.actions.performaAction())
- Don't modify the README.md
- Use whitespace to separate logically connected sections of code
  - If a block of code is unclear, add a comment above it
- Format comments with a capital letter. No periods are needed unless multiple sentences
  are written
- In JS / TS, always us // for comments, don't use /\* \*/
- In CSS, use "px" when possible
- Minimal reliance on external dependencies is always preferred
- In JS / TS, prefer ?? to || for defaulting operations
- When adding permanent console statements, use console.info, console.warn, or console.error
  - Reserve console.log for temporary debugging statements only
- The guidelines from the "Zen of Python" are great:
  - Beautiful is better than ugly.
  - Explicit is better than implicit.
  - Simple is better than complex.
  - Complex is better than complicated.
  - Flat is better than nested.
  - Sparse is better than dense.
  - Readability counts.
  - Special cases aren't special enough to break the rules.
  - Although practicality beats purity.
  - Errors should never pass silently.
  - Unless explicitly silenced.
  - In the face of ambiguity, refuse the temptation to guess.
  - There should be one-- and preferably only one --obvious way to do it.
  - Although that way may not be obvious at first unless you're Dutch.
  - Now is better than never.
  - Although never is often better than _right_ now.
  - If the implementation is hard to explain, it's a bad idea.
  - If the implementation is easy to explain, it may be a good idea.
