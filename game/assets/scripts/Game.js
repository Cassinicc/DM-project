const Player=require('Player');
const Ground=require('Ground');

cc.Class({
    extends: cc.Component,

    properties: {
        ground:{
            default:null,
            type:Ground
        },

        player:{
            default:null,
            type:Player
        },

        btnNode:{
            default:null,
            type:cc.Node
        },

        gameOverNode:{
            default:null,
            type:cc.Node
        },

        restartNode:{
            default:null,
            type:cc.Node
        },

        gameWinNode:{
            default:null,
            type:cc.Node
        },

        audioclip:{
            default:null,
            type:cc.AudioClip
        },
        mgr: cc.Node,
        item: cc.Prefab
    },

    

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.enabled=false;
        //console.log(this.audioclip);
        // 实例化 item
        for (let i = 0; i < 40; i++) {
            let item = cc.instantiate(this.item);
            this.mgr.addChild(item);
            item.y = 0;
            item.x = -560 + i * 28 + 14;
        }
        // 处理不同平台
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
    },

    onStartGame:function(){
        this.enabled=true;
        this.btnNode.x=3000;
        this.gameOverNode.active=false;
        this.restartNode.active=false;
        this.gameWinNode.active=false;
        this.player.start();
        this.ground.start();
        this.timer = 0;
        

        let self=this;
        //console.log(self.audioclip);
        
        var absolutePath="../../static//music/my_music.mp3"
        cc.assetManager.loadRemote(absolutePath,function(err,audioClip){
        self.audioclip=audioClip;
        let AudioContext = window.AudioContext;
        // audioContext 只相当于一个容器。
        let audioContext = new AudioContext();
        // 要让 audioContext 真正丰富起来需要将实际的音乐信息传递给它的。
        // 也就是将 AudioBuffer 数据传递进去。
        // 以下就是创建音频资源节点管理者。
        self.audioBufferSourceNode = audioContext.createBufferSource();
        // 将 AudioBuffer 传递进去。
        self.audioBufferSourceNode.buffer = audioClip._audio;
        // 创建分析器。
        self.analyser = audioContext.createAnalyser();
        // 精度设置
        self.analyser.fftSize = 256;
        // 在传到扬声器之前，连接到分析器。
        self.audioBufferSourceNode.connect(self.analyser);
        // 连接到扬声器。
        self.analyser.connect(audioContext.destination);
        // 开始播放
        self.audioBufferSourceNode.start(0);
        //cc.audioEngine.playMusic(audioClip,true);
        });     
    
    },


    update (dt) {
        //玩家超出屏幕范围则触发失败逻辑
        if(this.player.node.x>this.node.width/2||
            this.player.node.x<-this.node.width/2||
            this.player.node.y>this.node.height/2||
            this.player.node.y<-this.node.height/2){
                this.gameOver();
                this.enabled=false;
                return;
            } 
        if(this.timer>=19){
            this.gameWin();
            this.enabled=false;
        }
        this.timer += dt;
        // 等待准备好
        //console.log(this.analyser);
        if (!this.analyser) return;
        // 建立数据准备接受数据
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        // 分析结果存入数组。
        this.analyser.getByteFrequencyData(this.dataArray);
        this.draw(this.dataArray);
    },

    draw (dataArray) {
        // 数值自定
        // 960 / 40 有 24 ; 128 / 40 取 3
        for (let i = 0; i < 40; i++) {
            let h = dataArray[i * 3] * 1.2;
            if (h < 5) h = 5;
            // this.mgr.children[i].height = h;
            let node = this.mgr.children[i];
            // 插值，不那么生硬
            node.height = cc.misc.lerp(node.height, h, 0.4);
        }
    },

    gameOver:function(){
        this.gameOverNode.active=true;
        this.restartNode.active=true;
        this.player.enabled=false;
        this.player.stopMove();
        this.ground.stopMove();
        //停止背景音乐
        //cc.audioEngine.stopMusic(this.audioclip);
        this.audioBufferSourceNode.stop();
        //console.log(this.audioclip);
    },

    gameWin:function(){
        this.gameWinNode.active=true;
        this.player.enabled=false;
        this.player.stopMove();
        //cc.audioEngine.stopMusic(this.audioclip);
        this.audioBufferSourceNode.stop();
    },

    reloadScene:function(){
        //重新载入场景
        cc.director.loadScene('main');
    }
});