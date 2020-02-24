'use strict';

let fs = require('fs');
let events = require('events');
let path = require('path');
let Mocha = require('mocha');
let map = require('multiprocess-map');

module.exports = class MochaWrapper extends Mocha {
    addFile(file) {
        let files = fs.statSync(file).isDirectory()
            ? fs.readdirSync(file)
                .map(f => path.join(file, f))
                .filter(f => fs.statSync(f).isFile())
            : [file];
        this.files.push(...files)
    }

    run(cb = () => null) {
        let testFiles = this.files.map(file => ({
            type: 'test',
            file: file,
            options: this.options
        }));
        if (!testFiles.length) {
            throw new Error('Mocharallel called without test files')
        }
        let runner = new events.EventEmitter();
        new this._reporter(runner);
        runner.emit('start');
        let previousTest = Date.now();
        let currentSuite = '';
        // let reportTag = '$_MocharallelReport';
        let reportTag = 'MocharallelReport';
        let processStdout = stdout => {
            stdout.split(/\n/).forEach(line => {
                if (line.startsWith(reportTag)) {
                    let duration = Date.now() - previousTest;
                    previousTest = Date.now();
                    let {pass, fail, suite} = JSON.parse(line.slice(reportTag.length));
                    if (pass) {
                        runner.emit('pass', {title: pass.title, /*slow: () => 100,*/ duration})
                    } else if (fail) {
                        let {title, message, stack} = fail;

                        let error = new Error(message);
                        error.stack = stack;

                        runner.emit('fail', {title /*fullTitle: () => title,*/ /*path: () => [title],*/ /*titlePath: () => [title]*/}, error)
                    } else if (suite) {
                        let title = suite.title;
                        if (currentSuite) {
                            runner.emit('suite end')
                        }
                        currentSuite = title;
                        if (title) runner.emit('suite', {title})
                    }
                } else {
                    console.log(line)
                }
            })
        };

        map(testFiles, ({file, options}) => {
            let Mocha2 = require('mocha');

            function Reporter(runner) {
                let prevSuite;
                let report = obj => {
                    // console.log('$_MocharallelReport' + JSON.stringify(obj))
                    console.log('MocharallelReport' + JSON.stringify(obj))
                };
                let onTest = () => {
                    let suite = runner.suite.title;
                    if (suite !== prevSuite) {
                        prevSuite = suite;
                        report({suite})
                    }
                };
                runner.on('pass', test => {
                    onTest(test);
                    report({pass: {title: test.title}})
                });
                runner.on('fail', (test, err) => {
                    onTest(test);
                    report({fail: {title: test.title, message: err.message, stack: err.stack}})
                })
            }
            let mocha3 = new Mocha2(Object.assign(options, {reporter: Reporter}));
            mocha3.addFile(file);
            return new Promise(resolve => {
                mocha3.run(resolve)
            })
        }, {max: this.options['maxParallel'], processStdout}).then(codes => {
            runner.emit('end');
            let failures = codes.reduce((a, b) => a + b);
            cb(failures)
        }).catch(error => {
            // report what was found
            console.error('UNEXPECTED MOCHARALLEL ERROR:');
            console.error(error);
            process.exit(9)
        })
    }
};
