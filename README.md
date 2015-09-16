*WIP* This is alpha, some tests pass, basic functionality is there, things could change.

# node-libkv

Provides a standardized API for multiple key/value storage backends. Inspired by https://github.com/docker/libkv

## Supported Backends

* Consul
* etcd
* Level
* Level (via Multilevel)
* Redis
* Zookeeper

## API

* get
* set (alias: put)
* delete
* exists

### SET

```javascript
client.set('example', 'value', function(err, ok, data, res) {
  // err
  // ok == true or false

  // data == original data returned by consul / etcd
  // res == original response object from consul / etcd
})
```

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
