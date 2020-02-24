'use strict';

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const Mocharallel = require('..');

module.exports = (processArgv, cb) => {
    const argv = yargs
        .boolean('bail')
        .option('compilers', {
            array: true,
            default: []
        })
        .boolean('delay')
        .string('grep')
        .boolean('enableTimeouts')
        .option('exit', {
            boolean: true
        })
        .number('slow')
        .option('require', {
            array: true,
            default: []
        })
        .number('retries')
        .number('timeout')
        .number('maxParallel')
        .parse(processArgv);

    const Mocharallel = new Mocharallel(argv);

    if (argv._.length) {
        argv._.forEach(file => {
            if (fs.existsSync(file)) Mocharallel.addFile(file)
        })
    } else {
        Mocharallel.addFile(path.join(process.cwd(), 'test'))
    }

    Mocharallel.run(cb)
};