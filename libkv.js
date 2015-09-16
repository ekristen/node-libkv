var backends = [
  'consul',
  'redis',
  'etcd'
]

var initializers = {
  'consul': require('./store/consul.js'),
  'redis': require('./store/redis.js'),
  'etcd': require('./store/etcd.js')
}


var NewStore = function(backend, options) {
  if (backends.indexOf(backend) !== -1) {
    return new initializers[backend](options)
  }

  throw new Error('unsupported backend')
}

module.exports = NewStore
