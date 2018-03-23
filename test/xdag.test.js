const should = require('should');
const net = require('net');
const fs = require('fs');
const XDag = require('../index.js');
const commands = require('../lib/commands');
const path = require('path');

describe('xdag.js', () => {

    var xdag = null;
    var server = null;

    var socketFile = '/tmp/xdag_test.sock';

    before((done) => {

        console.log('test env', process.env.NODE_ENV);
        if (process.env.NODE_ENV == 'production') {
            socketFile = '/data/xdag/client/unix_sock.dat';
            xdag = new XDag({
                socketFile: socketFile
            });

            done();
            return;
        }
        if (fs.existsSync(socketFile)) {
            fs.unlinkSync(socketFile);
        }
        server = net.createServer((c) => {
            c.on('end', () => {
                console.log('client disconnected');
            });
            c.on('data', (data) => {
                var commandStr = data.toString('utf-8');
                var command = commandStr.split(' ')[0];
                command = command.replace('\0', '');
                var filePath = path.join(__dirname, './mocks/' + command + '_mocks.txt');
                c.write(fs.readFileSync(filePath,'utf-8'));
                c.end();

            });
        });
        server.on('error', (err) => {
            done(err);
        });

        server.listen(socketFile, () => {
            done();
        });
        xdag = new XDag({
            socketFile: socketFile
        });

    })

    describe('#getBalance', () => {

        it('should be getbalance success', (done) => {
            xdag.getBalance('4f1Sp/UD55JX5+kQCevUCpyenaPwqmpC').then((data) => {
                data.result.should.be.ok();
                done();
            }).catch((err) => {
                done(err);
            })
        })
    })

    describe('#getBlock', () => {

        it('should be getblock success', (done) => {
            xdag.getBlock('4f1Sp/UD55JX5+kQCevUCpyenaPwqmpC').then((data) => {

                data.result.should.have.property('address').which.is.an.Array();
                data.result.should.have.property('transaction').which.is.an.Array();
                // console.log(result);
                done();
            }).catch((err) => {
                done(err);
            })
        })
    })

    describe('#getStats', () => {

        it('should be get xdag stats success', (done) => {
            xdag.getStats().then((data) => {
                data.result.should.be.ok();
                data.result.should.have.property('hosts');
                data.result.should.have.property('blocks');
                data.result.should.have.property('main blocks');
                data.result.should.have.property('orphan blocks');
                done();
            }).catch((err) => {
                done(err);
            })
        })
    })

    describe('#getLastBlocks', () => {
        it('should be get last 10 blocks success', (done) => {
            xdag.getLastBlocks(10)
                .then((data) => {
                    data.should.be.ok();
                    data.result.length.should.be.equal(10);
                    done();
                })
                .catch((err) => {
                    console.error(err);
                    done(err);
                })
        });
    })

    describe('#getMiners', () => {
        it('should be get current miners success', (done) => {
            xdag.getMiners('active')
                .then((data) => {
                    console.log(data.result);
                    data.result.should.have.property('miners').which.is.an.Array();
                    data.result.should.have.property('total').which.is.a.Number();
                    data.should.be.ok();
                    done();
                })
                .catch((err) => {
                    console.error(err);
                    done(err);
                })
        });
    })

    after((done) => {

        if (process.env.NODE_ENV == 'production') {
            done();
            return;
        }
        server.close(() => {
            if (fs.existsSync(socketFile)) {
                fs.unlinkSync(socketFile);
            }
            done();
        });
    });
})