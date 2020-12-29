/*
 * @Author: your name
 * @Date: 2020-12-29 17:36:00
 * @LastEditTime: 2020-12-29 18:59:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /DM-project/server.js
 */
const http = require("http");
const app = http.createServer();
const fs= require("fs");
const { Midi } = require('@tonejs/midi')
app.on("request",(req,res)=>{
    if(req.method=="POST"){
        var data  = [];
    req.on("data",(chunk)=>{
        data.push(chunk)
    })
    req.on("end",()=>{
        var buffer = Buffer.concat(data);
        fs.writeFile("./static/music/my_music.midi",buffer,(err)=>{
            if(!err){
                const midiData = fs.readFileSync("./static/music/my_music.midi");
                const midi = new Midi(midiData)
                fs.writeFileSync("./static/midi-sample.json", Buffer(JSON.stringify(midi)))
                res.end("success");
            }
        })
    })
    }
})
app.listen(3000,()=>{
    console.log("ok");
})