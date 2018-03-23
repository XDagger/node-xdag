const should = require('should');
const net = require('net');
const fs = require('fs');
const XDag = require('../lib/xdag');
// const { parseBlock } = require('../lib/block');

describe('node-xdag', () => {

    const socketFile = '/tmp/command_test.sock';
    var server = null;
    // console.log('parser', parseBlock);
    before((done) => {
        if (fs.existsSync(socketFile)) {
            fs.unlinkSync(socketFile);
        }
        server = net.createServer((c) => {
            c.on('end', () => {
                // console.log('client disconnected');
            });
            c.on('data', (data) => {
                c.write('hello ' + data.toString('utf-8'));
            });
        });
        server.on('error', (err) => {
            throw err;
        });

        server.listen(socketFile, () => {
            // console.log('server bound');
            done();
        });

    })

    describe('#command(cmd)', function () {

        it('should be connect socketfile & send command success', (done) => {
            var xdag = new XDag({
                socketFile: socketFile
            });

            xdag.command('world').then((result) => {
                result.should.equal('hello world');
                done();
            }).catch((err) => {
                console.log('error....', err);
                done(err);
            });
        })
    });

    after((done) => {

        server.close(() => {
            if (fs.existsSync(socketFile)) {
                fs.unlinkSync(socketFile);
            }
            done();
        });
    })
});