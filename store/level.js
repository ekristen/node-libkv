var debug = require('debug')('libkv:store:level')
var util = require('util')
var level = require('level')
var Store = require('./index')
var NotFoundError = require('./error')

var Level = function Level(options) {
  Level.super_.apply(this, arguments)

  if (this.uri.protocol != 'level:') {
    throw new Error('unexpected uri format', this.href)
  }

  if (this.uri.path == null) {
    throw new Error('path is required')
  }

  this.store = level(this.uri.path)

  return this
}
util.inherits(Level, Store)
module.exports = Level

Level.prototype.get = function LevelGet(key, callback) {
  debug('get - key: %s', this.normalize(key))
  this.store.get(this.normalize(key), function(err, value) {
    if (err && err.status == 404) {
      return callback(new NotFoundError())
    }

    if (err) {
      return callback(err)
    }

    var pair = {
      Key: key,
      Value: value
    }

    debug('get - pair: %j', pair)

    callback(null, pair)
  })
}

Level.prototype.set = function LevelSet(key, value, callback) {
  this.store.put(this.normalize(key), value, function(err) {
    if (err) {
      return callback(err, false)
    }

    callback(null, true)
  })
}

Level.prototype.delete = function LevelDelete(key, callback) {
  this.store.del(this.normalize(key), function(err) {
    if (err) {
      return callback(err, false)
    }
    
    callback(null, true)
  })
}

Level.prototype.exists = function LevelExists(key, callback) {
  debug('exists - key: %s', this.normalize(key))
  this.store.get(this.normalize(key), function(err, value) {
    if (err && !err.notFound) {
      debug('exists - error: %j', err)
      return callback(err)
    }

    if (err && err.notFound) {
      debug('exists - status: %s', false)
      return callback(null, false)
    }

    debug('exists - status: %s', true)
    callback(null, true)
  })
}

Level.prototype.close = function LevelClose(callback) {
  if (typeof callback != 'function') {
    callback = function LevelCloseNoop() {}
  }

  debug('close')

  this.store.close(callback)
}

Level.prototype.normalize = function LevelNormalize(key) {
  return Store.prototype.normalize.call(this, key).substr(1)
}

