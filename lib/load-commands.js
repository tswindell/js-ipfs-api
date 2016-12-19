'use strict';

function requireCommands() {
  var cmds = {
    // add and createAddStream alias
    add: require('./api/add'),
    createAddStream: require('./api/create-add-stream'),
    bitswap: require('./api/bitswap'),
    block: require('./api/block'),
    bootstrap: require('./api/bootstrap'),
    cat: require('./api/cat'),
    commands: require('./api/commands'),
    config: require('./api/config'),
    dht: require('./api/dht'),
    diag: require('./api/diag'),
    id: require('./api/id'),
    get: require('./api/get'),
    log: require('./api/log'),
    ls: require('./api/ls'),
    mount: require('./api/mount'),
    name: require('./api/name'),
    object: require('./api/object'),
    pin: require('./api/pin'),
    ping: require('./api/ping'),
    pubsub: require('./api/pubsub'),
    refs: require('./api/refs'),
    repo: require('./api/repo'),
    swarm: require('./api/swarm'),
    update: require('./api/update'),
    version: require('./api/version')
  };

  // TODO: crowding the 'files' namespace temporarily for interface-ipfs-core
  // compatibility, until 'files vs mfs' naming decision is resolved.
  cmds.files = function (send) {
    var files = require('./api/files')(send);
    files.add = require('./api/add')(send);
    files.createAddStream = require('./api/create-add-stream.js')(send);
    files.get = require('./api/get')(send);

    // aliases
    cmds.add = files.add;
    cmds.createAddStream = files.createAddStream;
    cmds.get = files.get;

    return files;
  };

  cmds.util = function (send) {
    var util = {
      addFromFs: require('./api/util/fs-add')(send),
      addFromStream: require('./api/add')(send),
      addFromURL: require('./api/util/url-add')(send)
    };
    return util;
  };

  return cmds;
}

function loadCommands(send) {
  var files = requireCommands();
  var cmds = {};

  Object.keys(files).forEach(function (file) {
    cmds[file] = files[file](send);
  });

  return cmds;
}

module.exports = loadCommands;