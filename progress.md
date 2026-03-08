Original prompt: 先将环境补齐将项目运行起来，再做更细的代码导览

- Environment setup completed using Node 22 from `~/.nvm/versions/node/v22.22.0/bin/node`.
- Installed dependencies with `npm ci`.
- Verified `tsc` build succeeds and `dist/demo.js` runs.
- Added selector compatibility so exported DSL selectors work as both callable functions and object-based `Selector` instances.
- Added controller inference in selectors so tests and lightweight setups work even when entities are inserted into zones without an explicit `controller`.
- Full verification is now green: `tsc` passes and Jest passes `36/36` suites (`372/372` tests).
- Next suggestion: inspect `actions`, `targeting`, and one representative card script end-to-end.
