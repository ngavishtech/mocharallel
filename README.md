# MochaRallel

## Overview
This project purpose is to provide helper methods for mocha parallelism.

Inspired by mocha-parallel-tests, but simpler. Options are wired into mocha module.

## How to use
Just like mocha.
```
mocharallel --maxParallel 2 --timeout 10000, path/to/test
```
```
const Mocharallel = require('mocharallel');

const mocha = new Mocharallel({ maxParallel: 2 });
mocha.addFile('path/to/tests');
mocha.run(code => {
    process.exit(code)
});

```
