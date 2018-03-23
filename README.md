# node-xdag
node.js communicate with xdag (via unix_sock now)

[![Build Status](https://travis-ci.org/feiin/node-xdag.svg?branch=master)](https://travis-ci.org/feiin/node-xdag)



## Usage

```shell

> npm install node-xdag --save

```


```node.js

const XDag = require('node-xdag')
const xdag = new XDag({socketFile:'path/xdag/unix_sock.data'})
```

## Options

### socketFile
type: `string`

path of the xdag unix_sock.dat file

## API

 - [getBalance](#get_balance)
 - [getBlock](#get_block)
 - [getStats](#get_stats)
 - [getLastBlocks](#get_lastblocks)
 - [getMiners](#get_miners)


 ### <a id="get_balance">getBalance</a>

> get xdag balance

```javascript
xdag.getBalance("xdagAddress")
    .then((data) => {
        console.log(data.result);// balance
    })
    .catch((err) => {
        console.error(err);//err
    })
```

### <a id="get_block">getBlock</a>

>get the xdag block info

**result**
```json
{
    "account":"4f1Sp/UD55JX5+kQCevUCpyenaPwqmpC",
    "balance":"1024",
    "difficulty":"0000000013147562c",
    "hash":"d6ad0e0cf7b099ff426aaaf0a39d9e9c0ad4eb0910e9e75792e703f5a752fde1",
    "file pos":"7e00",
    "flags":"1c",
    "timestamp":"16a2c094123",
    "time":"2018-02-20",
    "transaction":[
        { "direction": "fee",
        "address":"OwFhTJbCdaj1ZqkJYPxrGDjGSvXlGrv7",
        "amount": "0.000000000" }
        
    ],
    "address":[
        { 
            "direction": "input",
            "address": "81a9+kgFbquw6GGKju/VkS7KiUWmOOxy",
            "amount": "0.003222176",
            "time": "2018-02-20 04:58:40.815"
        }
        
    ]

}
```
example

```javascript
xdag.getBlock('blockAddress')
    .then((data) => {
        console.log(data.result);//block info
    })
    .catch((err) => {
        console.error(err);
    })
```

 ### <a id="get_stats">getStats</a>

> get the xdag's stats

**result**

```json
{ "hosts": "320 of 320",
  "blocks": "14311273 of 14311295",
  "main blocks": "102117 of 102117",
  "orphan blocks": "1",
  "wait sync blocks": "28",
  "chain difficulty": "1d79edf0ecb4d2c0e71859df10 of  1d79edf0ecb4d2c0e71859df10",
  "XDAG supply": "104567808.000000000 of 104567808.000000000",
  "4 hr hashrate MHs": "0.00 of 6397628.62"
}
```

example

```javascript
xdag.getStats().then((data) => {
                console.log(data.result);
            }).catch((err) => {

            })

```

 ### <a id="get_lastblocks">getLastBlocks</a>

> get xdag last N blocks

**result**

type: `Arrary`

```json
[ "o5+zRJy7tVzzZ763+kQHIP5H4RLltZJv",
  "XsLYI0NJ0mnXWW6ocx3PzUoTk/4d45an",
  "0MnKSxiXJRPXs3HHBqzeQyqgU0Kv5/Ka",
  "2rrC3NR7uOT0VZSgXNlEtnB847PsOHnS",
  "GZ4R4mQLSKeBZwfeUizAi2kZ1jOAfTsV",
  "koqkXiy6a/RVUXdSCip7kKmmuSF+QkiO",
  "T4jj427IPx0h6JarVUxaRI+/X8tNdXNu",
  "2E1KfP8v6o4MVLb1Lkw/FaIBNAcJEZKO",
  "jM4Kx8AJ3BSP95lEoEC6x6uZ2/x+g3cE",
  "OJpD1d8P0IIKABo4evFDrjKa66/RDV1n" ]
```

example

```javascript

            xdag.getLastBlocks(10)
                .then((data) => {
                    console.log(data.result);
                    done();
                })
                .catch((err) => {
                    console.error(err);
                    done(err);
                })
```

### <a id="get_miners">getMiners</a>

**params**

minerStatus: `String`, optional, Default: `null`; status: 'active', 'archive', 'free'


**result**
```json
{ "miners":
   [ 
       { "address": "XZomlEkBFTLWYEycxr86zOrDdopONt/r",
       "status": "active",
       "ip": "125.71.100.120",
       "port": "19415",
       "inBytes": "19232",
       "outBytes": "14752",
       "nopaidShares": "294.039915"
        }],
  "total": 1 
  }
```

example 

```javascript

            xdag.getMiners('active')
                .then((data) => {
                    console.log(data.result);
                })
                .catch((err) => {
                    console.error(err);
                })

```

## Building

```shell
> git clone  git@github.com:feiin/node-xdag.git
> npm install

```

## Testing

```
> npm test 
```

test with xdag


```
> npm run xdagtest
```

## Maintainers

solar (xdag: 4f1Sp/UD55JX5+kQCevUCpyenaPwqmpC)