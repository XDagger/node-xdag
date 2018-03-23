const net = require('net');
const commands = require('./commands');
const util = require('util');
const xdagUtils = require('./utils');
const readline = require('readline');
const fs = require('fs');
const EventEmitter = require('events');
const { parseBlock, parseAddress, parseTransaction } = require('./block');

class XDag {

    constructor(options) {
        if (!options.socketFile) {
            throw new Error('Invalid unix socket file');
        }
        this.socketFile = options.socketFile;
    }

    getBalance(address) {

        if (!xdagUtils.isAddress(address)) {
            return Promise.reject(new Error('Invalid XDAG address!'))
        }

        var cmd = util.format(commands.balanceCmd, address);

        return this.command(cmd).then((result) => {
            var values = result.split(' ');
            return { result: values[1] };
        });
    }

    getBlock(address) {
        var that = this;
        if (!xdagUtils.isAddress(address)) {
            return Promise.reject(new Error('Invalid block address!'))
        }
        const cmd = util.format(commands.blockCmd, address);
        var p = new Promise((resolve, reject) => {
            var block = {
                address: [], //block as address: details
                transaction: [] //Block as transaction: details
            };

            var currentPart = '';
            that.readlineCommand(cmd)
                .on('error', (err) => {
                    reject(err)
                })
                .on('line', (line) => {
                    const notFoundReg = /Block is not found/i;
                    const transactionReg = /Block as transaction: details/i;
                    const addressReg = /block as address: details/i;

                    if (currentPart == '') {
                        if (notFoundReg.test(line)) {
                            const err = new Error('Block is not found');
                            reject(err);
                            return;
                        }
                    }

                    // Block as transaction
                    if (currentPart != 'transaction' && transactionReg.exec(line)) {
                        currentPart = 'transaction';
                        return;
                    }

                    // block as address
                    if (currentPart != 'address' && addressReg.exec(line)) {
                        currentPart = 'address';
                        return;
                    }

                    switch (currentPart) {
                        case 'transaction':
                            parseTransaction(line, block);
                            break;
                        case 'address':
                            parseAddress(line, block);
                            break;
                        default:
                            parseBlock(line, block);
                            break;
                    }

                })
                .on('finish', () => {
                    resolve({ result: block });
                });
        })

        return p;
    }

    getStats() {
        const that = this;
        var p = new Promise((resolve, reject) => {

            var stats = {};
            that.readlineCommand(commands.statsCmd)
                .on('error', (err) => {
                    reject(err)
                })
                .on('line', (line) => {
                    const reg = /\s*(.*): (.*)/i;
                    const match = reg.exec(line);
                    if (match) {
                        let [, key, value] = match;
                        stats[key] = value;
                    }
                })
                .on('finish', () => {
                    resolve({ result: stats });
                });
        })

        return p;
    }

    getLastBlocks(numbers) {
        const that = this;
        var p = new Promise((resolve, reject) => {

            var blocks = [];
            const cmd = util.format(commands.lastBlocksCmd, numbers)
            that.readlineCommand(cmd)
                .on('error', (err) => {
                    reject(err)
                })
                .on('line', (line) => {

                    if (xdagUtils.isAddress(line)) {
                        blocks.push(line);
                    }
                })
                .on('finish', () => {
                    resolve({ result: blocks });
                });
        })

        return p;

    }

    //get the connected miners of the current pool
    getMiners(minerStatus) {

        const that = this;
        var p = new Promise((resolve, reject) => {

            var result = { miners: [], total: 0 };
            that.readlineCommand(commands.minersCmd)
                .on('error', (err) => {
                    reject(err)
                })
                .on('line', (line) => {
                    const minerReg = /\s*[0-9]*\.\s*([a-zA-Z0-9\/+]{32})\s*(archive|active|free)\s*(\S*):(\d+)\s*(\d+)\/(\d+)\s*([0-9]*\.[0-9]*)/i;
                    // const totalReg = /\s*(Total)\s*(\d+)\s*(active)\s*(miners)\./i;
                    var match = minerReg.exec(line);
                    if (match) {
                        let [, address, status, ip, port, inBytes, outBytes, nopaidShares] = match;
                        if(minerStatus && status != minerStatus) {
                            return;
                        } 
                        var miner = {
                            address: address,
                            status: status,
                            ip: ip,
                            port: port,
                            inBytes: inBytes,
                            outBytes: outBytes,
                            nopaidShares: nopaidShares
                        };

                        result.miners.push(miner);
                    }

                })
                .on('finish', () => {
                    result.total = result.miners.length;
                    resolve({ result: result });
                });
        })

        return p;
    }

    command(cmd) {
        var promise = new Promise((resolve, reject) => {
            var socket = net.connect(this.socketFile);
            socket.on('error', (err) => {
                reject(err);
            });
            socket.on('connect', () => {
                socket.write(cmd);
            })

            socket.on('data', (data) => {
                socket.end();
                resolve(data.toString('utf-8'));
            });
        });
        return promise;
    }


    readlineCommand(cmd) {

        var eventEmitter = new EventEmitter();
        var socket = net.connect(this.socketFile);
        var rl = readline.createInterface({
            input: socket
        });

        rl.on('line', (line) => {
            eventEmitter.emit('line', line);
        });
        rl.on('close', () => {
            eventEmitter.emit('finish');
        });


        socket.on('connect', () => {
            socket.write(cmd);
        });
        socket.on('finish', () => {
            socket.end();
            rl.close();
        });
        socket.on('error', (err) => {
            eventEmitter.emit('error', err);
        });

        return eventEmitter;
    }
}

module.exports = XDag;