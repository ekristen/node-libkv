var debug = require('debug')('libkv:store:etcd')
var util = require('util')
var Store = require('./index')

var Etcd = function Etcd(options) {
  Etcd.super_.apply(this, arguments)

  if (this.uri.protocol != 'etcd:') {
    throw new Error('unexpected uri format', this.href)
  }

  if (this.uri.port == null) {
    this.uri.port = 2379
  }

  var etcd = require('node-etcd')
  this.etcd = new etcd(this.uri.host, this.uri.port)

  return this
}
util.inherits(Etcd, Store)
module.exports = Etcd


Etcd.prototype.get = function EtcdGet(key, callback) {
  this.etcd.get(key, function(err, data, res) {
    if (err) {
      return callback(err)
    }

    if (data.action == 'get') {
      return callback(null, data.node.value, data, res)
    }

    callback(null, null, data, res)
  })
}

Etcd.prototype.set = function EtcdSet(key, value, callback) {
  this.etcd.set(key, value, function(err, data, res) {
    if (err) {
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
  this.etcd.delete(key, function(err, data, res) {
    if (err) {
      return callback(err)
    }

    if (data.action == 'delete') {
      return callback(null, true, data, res)
    }

    callback(null, false, data, res)
  })
}

Etcd.prototype.exists = function EtcdExists(key, callback) {
  this.etcd.get(key, function(err, data, res) {
    if (err && err.errorCode != 100) {
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
