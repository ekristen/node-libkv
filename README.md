**WIP:** This is alpha/beta, tests pass, basic functionality is there, things most likely will change. Until the library hits v1.0.0, all bets are off on backwards compatibility. 

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

Not all backends support `[options]`

### .get(key, [options], [callback])

### .set(key, value = null, [options], [callback])

### .delete(key, [options], [callback])

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
