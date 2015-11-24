var debug = require('debug')('libkv:store:etcd')
var util = require('util')
var Store = require('./index')
var NotFoundError = require('./error')

var Etcd = function Etcd(options) {
  Etcd.super_.apply(this, arguments)

  if (this.uri.protocol != 'etcd:') {
    throw new Error('unexpected uri format', this.href)
  }

  if (this.uri.host == '') {
    this.uri.host = '127.0.0.1'
  }

  if (this.uri.port == null) {
    this.uri.port = 2379
  }

  var etcd = require('node-etcd')
  this.etcd = new etcd(this.uri.host, this.uri.port)

  debug('connected', {host: this.uri.host, port: this.uri.port})

  return this
}
util.inherits(Etcd, Store)
module.exports = Etcd


Etcd.prototype.get = function EtcdGet(key, options, callback) {
  debug('get - key: %s', this.normalize(key))

  if (typeof options == 'function') {
    callback = options
    options = {}
  }

  this.etcd.get(this.normalize(key), function(err, data, res) {
    if (err && err.errorCode == 100) {
      debug('get - not found - key: %s', key)
      return callback(new NotFoundError())
    }

    if (err) {
      debug('get - error: %j', err)
      return callback(err)
    }

    if (data.action == 'get') {
      var pair = {
        Key: data.node.key.substr(1),
        Value: data.node.value,
        Metadata: {
          CreatedIndex: data.node.createdIndex,
          ModifiedIndex: data.node.modifiedIndex
        }
      }
      
      return callback(null, pair, res)
    }

    callback(null, data, res)
  })
}

Etcd.prototype.set = function EtcdSet(key, value, options, callback) {
  debug('set - key: %s', this.normalize(key))

  if (typeof options == 'function') {
    callback = options
    options = {}
  }

  this.etcd.set(this.normalize(key), value, function(err, data, res) {
    if (err) {
      debug('set - error: %j', err)
      return callback(err)
    }

    if (data.action == 'set') {
      return callback(null, true, data, res)
    }

    callback(null, false, data, res)
  })
}
Etcd.prototype.put = Etcd.prototype.set

Etcd.prototype.delete = function EtcdDelete(key, callback) {
  debug('delete - key: %s', this.normalize(key))
  this.etcd.delete(this.normalize(key), function(err, data, res) {
    if (err) {
      debug('delete - error: %j', err)
      return callback(err)
    }

    if (data.action == 'delete') {
      return callback(null, true, data, res)
    }

    callback(null, false, data, res)
  })
}

Etcd.prototype.exists = function EtcdExists(key, callback) {
  debug('exists - key: %s', this.normalize(key))
  this.etcd.get(this.normalize(key), function(err, data, res) {
    if (err && err.errorCode != 100) {
      debug('exists - error: %j', err)
      return callback(err, data, res)
    }

    if (err && err.errorCode == 100) {
      return callback(null, false, data, res)
    }

    if (data.action == 'get') {
      return callback(null, true, data, res)
    }
    
    callback(null, false, data, res)
  })
}

Etcd.prototype.watch = function EtcdWatch(key, options) {
  options = options || {}
  return this.etcd.watcher(key, options)
}
