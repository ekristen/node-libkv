*WIP* This is alpha, some tests pass, basic functionality is there, things could change.

# node-libkv

Provides a standardized API for multiple key/value storage backends. Inspired by https://github.com/docker/libkv

## Supported Backends

* Consul
* etcd
* Redis
* Zookeeper

## API

* get
* set (alias: put)
* delete
* exists

### .get(key, [options], [callback])

### .set(key, value = null, [options], [callback])

### .delete(key, [options], [callback])

### .watch(key, [options], [callback])


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
