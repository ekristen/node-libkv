var debug = require('debug')('libkv:store:zookeeper')
var util = require('util')
var Store = require('./index')

var Zookeeper = function Zookeeper(options) {
  Zookeeper.super_.apply(this, arguments)

  if (this.uri.protocol != 'zookeeper:') {
    throw new Error('unexpected uri format', this.href)
  }

  if (this.uri.host == '') {
    this.uri.host = '127.0.0.1'
  }

  if (this.uri.port == null) {
    this.uri.port = 2181
  }

  var ZookeeperClient = require('node-zookeeper-client')
  this.store = ZookeeperClient.createClient(this.uri.host + ':' + this.uri.port)
  this.store.connect()

  debug('connected', {host: this.uri.host, port: this.uri.port})

  return this
}
util.inherits(Zookeeper, Store)
module.exports = Zookeeper


Zookeeper.prototype.get = function ZookeeperGet(key, callback) {
  debug('get - key: %s', this.normalize(key))
  this.store.getData(this.normalize(key), function(err, data, stat) {
    if (err) {
      debug('get - error: %j', err)
      return callback(err)
    }

    var pair = {
      Key: key,
      Value: data.toString(),
      Metadata: stat
    }

    debug('get - pair: %j', pair)

    callback(null, pair)
  })
}

Zookeeper.prototype._set = function ZookeeperSetFundamental(key, value, callback) {
  debug('set - key: %s, value: %s', this.normalize(key), value)
  this.store.setData(this.normalize(key), new Buffer(value), function(err, stat) {
    if (err) {
      debug('set - error: %j', err)
      return callback(err)
    }

    if (stat) {
      debug('set - stat: %j', stat)
      return callback(null, true, stat)
    }

    callback(null, false, stat)
  })
}

Zookeeper.prototype.set = function ZookeeperSet(key, value, callback) {
  var self = this

  self.exists(key, function(err, exists) {
    if (err) {
      return callback(err)
    }

    if (exists) {
      return self._set(key, value, callback)
    }

    self.store.create(self.normalize(key), function(err) {
      if (err) {
        return callback(err)
      }

      self._set(key, value, callback)
    })
  })
}
Zookeeper.prototype.put = Zookeeper.prototype.set

Zookeeper.prototype.delete = function ZookeeperDelete(key, callback) {
  this.store.remove(this.normalize(key), function(err) {
    if (err) {
      return callback(err)
    }

    callback(null, true)
  })
}
Zookeeper.prototype.remove = Zookeeper.prototype.delete

Zookeeper.prototype.exists = function ZookeeperExists(key, callback) {
  this.store.exists(this.normalize(key), function(err, stat) {
    if (err) {
      return callback(err)
    }

    if (stat) {
      return callback(null, true, stat)
    }

    callback(null, false, stat)
  })
}

Zookeeper.prototype.close = function ZookeeperClose(callback) {
  if (typeof callback != 'function') {
    callback = function ZookeeperCloseNoop() {}
  }

  this.store.close()  

  process.nextTick(function() {
    debug('close')
    callback()
  })
}
