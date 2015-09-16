var debug = require('debug')('libkv:store:consul')
var util = require('util')
var clone = require('clone')
var Store = require('./index')


var Consul = function Consul(options) {
  Consul.super_.apply(this, arguments)

  if (this.uri.protocol != 'consul:') {
    throw new Error('unexpected uri format', this.href)
  }

  if (this.uri.port == null) {
    this.uri.port = 8500
  }

  this.options.host = this.uri.host
  this.options.port = this.uri.port
  
  this.consul = require('consul')(clone(this.options) || {})

  return this
}
util.inherits(Consul, Store)
module.exports = Consul

Consul.prototype.get = function ConsulGet(key, callback) {
  this.consul.kv.get(key, function(err, data, res) {
    return callback(err, data.Value || null, data || null)
  })
}

Consul.prototype.set = function ConsulSet(key, value, callback) {
  var opts = {}
  
  var pair = {
    Key: key,
    Value: value
  }

  this.consul.kv.set(key, value, opts, function(err, status, res) {
    return callback(err, status, res)
  })
}
Consul.prototype.put = Consul.prototype.set

Consul.prototype.delete = function ConsulDelete(key, callback) {
  this.consul.kv.del(key, function(err) {
    callback(err, err ? false : true)
  })
}

Consul.prototype.exists = function ConsulExists(key, callback) {
  this.consul.kv.get(key, function(err, data, res) {
    if (err) {
      return callback(err)
    }

    if (data == null) {
      return callback(null, false)
    }
    
    return callback(null, true)
  })
}
