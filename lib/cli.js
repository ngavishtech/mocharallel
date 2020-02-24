'use strict';

const fs = require('fs');
const path = require('path');
// const {argv} = require('yargs');
const Mocharallel = require('..');

module.exports = (processArgv, cb) => {
    let argvi = require('yargs')
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
        .parse(processArgv)
        .argv;

    const Mocharallel = new Mocharallel(argvi);

    if (argvi._.length) {
        argvi._.forEach(file => {
            if (fs.existsSync(file)) Mocharallel.addFile(file)
        })
    } else {
        Mocharallel.addFile(path.join(process.cwd(), 'test'))
    }

    Mocharallel.run(cb)
};
