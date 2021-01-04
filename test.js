/*
 * @Author: Yang Rui
 * @Date: 2021-01-04 17:49:42
 * @LastEditTime: 2021-01-04 17:51:36
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /DM-project/test.js
 */
//midi to mp3
const path = require("path");
const { exec } = require("child_process");
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
