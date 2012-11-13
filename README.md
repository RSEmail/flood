
About
=====

For performance testing, it is generally necessary to configure many machines
generating simultaneous load against an endpoint. With servers these days
having many CPU cores, a good tool should utilize all cores.

Flood has simplified the process of aggregating test counters across many
machines with many CPUs.

Installation
============

To install the package globally, run:

    # npm install flood -g

This will add two commands to your system, `flood` and `flood-watch`.

Configuration
=============

### `flood`

Machines that will actually generate the load by spawning worker threads will
be running the `flood` command. This service listens for jobs and executes
them. An HTTP-like listener is opened on port 5143, where clients may submit
jobs and wait for completion. Here is an example in curl:

    curl -i -X POST \
        -H 'Content-Type: text/javascript' \
        -d @mytest.js \
        http://localhost:5143/test/mytest.js

The test file `mytest.js` simply needs to define `exports.counters` and
`exports.run`. The `exports.counters` is an array of counter names the test can
then increment. The `exports.run` is a function that is called which should run
indefinitely, incrementing counters.

    exports.counters = ['beeps'];

    exports.run = function (counters) {
      function beep() {
        counters.counterInc('beeps');
        process.nextTick(beep);
      }
      beep();
    };

Optionally, `exports.setUp` may be a function that initializes the test, before
snapshot timers begin. It must call its `callback` argument when complete.
Additional arguments passed to `callback` will be given to `exports.run`:

    exports.counters = ['beeps'];

    exports.setUp = function (callback) {
      require('fs').readFile('beeps.txt', function (err, beepsData) {
        callback(beepsData);
      }
    };

    exports.run = function (counters, beepsData) {
      function beep() {
        counters.counterInc('beeps');
        process.nextTick(beep);
      }
      beep();
    };

### `flood-watch`

The intention of the `flood-watch` process is to connect to all the `flood`
processes and aggregate all their counters over a set time. A single argument
with the JSON configuration file is passed to `flood-watch`, which looks
something like this:

    {
      "clients": [
        "localhost"
      ],
      "snapshots": 10,
      "interval": 1000,
      "workerModule": "beeps.js",
      "numWorkers": 0
    }

The options are:

 * *`clients`*: A socket connection is initiated to the `flood` service on each
   host in the list to run the test.

 * *`snapshots`*: Number of counter snapshots to gather for the test.
   Corresponds to the `X-Snapshots` header to the `flood` service.

 * *`interval`*: The length, in milliseconds, of each snapshot window. The
   entire run-length of the test is given by `interval * snapshots`.
   Corresponds to the `X-Snapshot-Length` header.

 * *`workerModule`*: This file is read in and passed to the `flood` service as
   the test file.

 * *`numworkers`*: The number of worker threads created by each machine running
   the `flood` service. Positive numbers indicate an exact number of threads,
   while zero and negatives will subtract from the number of CPU cores.

