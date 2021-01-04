/*
 * @Author: Yang Rui
 * @Date: 2020-12-29 17:36:00
 * @LastEditTime: 2021-01-04 17:52:05
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /DM-project/server.js
 */
const http = require("http");
const app = http.createServer();
const fs = require("fs");
const path = require("path");
const { Midi } = require("@tonejs/midi");
const { exec } = require("child_process");
app.on("request", (req, res) => {
  if (req.method == "POST") {
    var data = [];
    req.on("data", (chunk) => {
      data.push(chunk);
    });
    req.on("end", () => {
      var buffer = Buffer.concat(data);
      fs.writeFile("./static/music/sample.midi", buffer, (err) => {
        if (!err) {
          //midi to json
          const midiData = fs.readFileSync("./static/music/sample.midi");
          const midi = new Midi(midiData);
          fs.writeFileSync(
            "./static/midi-sample.json",
            Buffer(JSON.stringify(midi))
          );
          console.log("ok: midi to json");
          //midi to mp3
          exec(
            "timidity sample.midi -Ow -o my_music.mp3",
            {
              cwd: path.join(process.cwd(), "static/music"),
            },
            (err, stdout, stderr) => {
              if (err) {
                console.log(err);
              }
              console.log(`stdout:${stdout}`);
            }
          );
          res.end("success");
        }
      });
    });
  }
});
app.listen(3000, () => {
  console.log("Running on 3000!");
});
