var test = require('tape')
var libkv = require('./libkv')
var async = require('async')

var backend_to_test = process.argv[2] || 'all'

var backends = [
  'consul',
  'etcd',
  'level',
  'redis',
  'zookeeper'
]

if (backend_to_test != 'all') {
  backends = [ backend_to_test ]
}

var configs = {
  consul: {
    uri: 'consul://127.0.0.1'
  },
  etcd: {
    uri: 'etcd://127.0.0.1'
  },
  level: {
    uri: 'level:///tmp/testdb'
  },
  redis: {
    uri: 'redis://'
  },
  zookeeper: {
    uri: 'zookeeper://127.0.0.1'
  },
}

var tests = {
  set: function(client, test, callback) {
    client.set('one', 'two', function(err, result) {
      test.ok(!err, 'no error')
      test.equal(result, true)
  
      client.close(test.end.bind(null))
  
      callback()
    })
  },
  get: function(client, test, callback) {
    client.set('one', 'two', function(err, result) {
      client.get('one', function(err, res) {
        test.ok(!err, 'no error')
        test.equal(res.Key, 'one')
        test.equal(res.Value, 'two')

        client.close(test.end.bind(null))
        
        callback()
      })
    })
  },
  getMissing: function(client, test, callback) {
    client.get('oneone', function(err, data, res) {
      test.ok(err)
      test.equal(err.status, 404)
      client.close(test.end.bind(null))
      callback()
    })
  },
  delete: function(client, test, callback) {
    client.set('two', 'one', function(err, res) {
      test.ok(!err, 'no error')
      client.delete('two', function(err, status) {
        test.ok(!err, 'no error')
        test.equal(status, true)
        
        client.close(test.end.bind(null))
        
        callback()
      })
    })
  },
  exists: function(client, test, callback) {
    client.set('three', 'one', function(err, status1) {
      test.ok(!err, 'no error')

      client.exists('three', function(err, status2) {
        test.ok(!err, 'no error')
        test.equal(status2, true)

        client.exists('four', function(err, status3) {

          test.ok(!err, 'no error')
          test.equal(status3, false)

          client.close(test.end.bind(null))

          callback()
        })
      })
    })
  },
  expires: function(client, test, callback) {
    if (client._supportsTTL == false) {
      test.ok(true, 'CLIENT DOES NOT SUPPORT TTL/EXPIRATION')
      client.close(test.end.bind(null))
      return callback()
    }

    client.set('expires', 'one', {ttl: 10}, function(err, status1) {
      test.ok(!err, 'no error')

      client.exists('expires', function(err, status2) {
        test.ok(!err, 'no error')
        test.equal(status2, true)

        setTimeout(function() {
          
          client.exists('expires', function(err, status3) {
            test.ok(!err, 'no error')
            test.equal(status3, false)
            
            client.close(test.end.bind(null))
            callback()
            
          })
          
        }, 12250)
      })      
    })
  }
}


async.eachSeries(backends, function(backend, backendCallback) {

  async.eachSeries(Object.keys(tests), function(func, testCallback) {
    var testName = backend + '#' + func
    
    test(testName, function(t) {
      var client = libkv(backend, configs[backend])

      tests[func].call(null, client, t, testCallback)
    })
  }, backendCallback)
  
}, function(err) {

})
