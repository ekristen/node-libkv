**WIP:** This is alpha/beta, tests pass, basic functionality is there, things most likely will change. Until the library hits v1.0.0, all bets are off on backwards compatibility. 

[![Dependency Status](https://david-dm.org/ekristen/node-libkv.svg)](https://david-dm.org/ekristen/node-libkv) [![devDependency Status](https://david-dm.org/ekristen/node-libkv/dev-status.svg)](https://david-dm.org/ekristen/node-libkv#info=devDependencies) [![Build Status](https://travis-ci.org/ekristen/node-libkv.svg)](https://travis-ci.org/ekristen/node-libkv) ![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Downloads per Month](https://img.shields.io/npm/dm/libkv.svg) ![Downloads](https://img.shields.io/npm/dt/libkv.svg)
# node-libkv

Provides a standardized API for multiple key/value storage backends. Inspired by https://github.com/docker/libkv. It is **not** designed to cover all implementations and use cases.

Consul, etcd, and Zookeeper all require path (or folder like) structures, therefore the library has been designed to normalize all keys to be based on path (aka separated by `/`). 

Consul, redis, and LevelDB strip the `/` from the beginning of the key, but it is required for etcd and Zookeeper.

## Installation

`npm install libkv`

## Supported Backends

* Consul
* etcd
* LevelDB
* Redis
* Zookeeper

## API

* get
* set (alias: put)
* delete (aliases: remove, del)
* exists

The below definitions are general, they vary slightly by backend.

### .get(key, [options], [callback])

### .set(key, value = null, [options], [callback])

* ttl (in seconds) (redis, etcd, leveldb, consul)
* maxRetries (etcd)

### .delete(key, [callback])

### .watch(key, [options], [callback])

**Note:** Not yet implemented


## Usage

```javascript
var libkv = require('libkv')

var client = libkv('redis', {
  uri: 'redis://172.15.5.5:6379'
})

client.set('example', 'value', function(err, ok) {
  // ok == true/false
})

```

## Testing

`npm test` or `npm test <backend>` (example: `npm test redis`)

## Badges

[![Dependency Status](https://david-dm.org/ekristen/node-libkv.svg)](https://david-dm.org/ekristen/node-libkv)
