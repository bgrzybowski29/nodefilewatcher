const events = require("events"),
  util = require("util");

const fs = require("fs"),
  watchDir = "./watch",
  processedDir = "./done";

class Watcher extends events.EventEmitter {
  constructor(watchDir, processedDir) {
    super();
    this.watchDir = watchDir;
    this.processedDir = processedDir;
  }

  watch() {
    const watcher = this;
    fs.readdir(this.watchDir, function (err, files) {
      if (err) throw err;
      for (let index in files) {
        watcher.emit("process", files[index]);
      }
    });
  }

  start() {
    var watcher = this;
    fs.watchFile(watchDir, function () {
      watcher.watch();
    });
  }
}

let watcher = new Watcher(watchDir, processedDir);

watcher.on("process", function process(file) {
  console.log(`processing file: ${file}`)
  let rawdata = fs.readFileSync(file);
  let batch = JSON.parse(rawdata);

  batch.forEach(row => {
    console.log(`processing record: ${row.record}, data: ${row.data}`);
  });

  const watchFile = this.watchDir + "/" + file;
  const processedFile = this.processedDir + "/" + file.toLowerCase();
  fs.rename(watchFile, processedFile, function (err) {
    if (err) throw err;
  });
  console.log(`completed processing file: ${file}`)
});

watcher.start();