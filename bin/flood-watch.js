#!/usr/bin/env node
// Copyright (c) 2012 Ian C. Good
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

var net = require('net');

require.paths.shift(process.cwd());

var configFile = process.argv[2] || 'config.json';
var config = require(configFile);

var i;
var clients = config.clients;
var counter = 0, seenClients = 0, snapshots = 0;
for (i=0; i<clients.length; i++) {
  clients[i] = net.connect(config.clientPort, clients[i]);
  clients[i].on('data', function (data) {
    var clientCounter = parseInt(data);
    counter += clientCounter;
    seenClients++;
    if (seenClients >= clients.length) {
      console.log(counter);
      counter = 0;
      seenClients = 0;
      if (++snapshots >= config.snapshots) {
        var i;
        for (i=0; i<clients.length; i++) {
          clients[i].end();
        }
      }
    }
  });
}

// vim:et:sw=2:ts=2:sts=2:
