let fs = require('fs');
let path = require('path');
let yargs = require('yargs');
let Mocharallel = require('./index');

module.exports = (processArgv, cb) => {
    let argvi = yargs
        .option('compilers', {
            array: true,
            default: []
        })
        .boolean('bail')
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

    let mocharallel = new Mocharallel(argvi);

    if (argvi._.length) {
        argvi._.forEach(file => {
            if (fs.existsSync(file)) mocharallel.addFile(file)
        })
    } else {
        mocharallel.addFile(path.join(process.cwd(), 'test'))
    }

    mocharallel.run(cb)
};
