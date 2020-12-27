// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        player:{
            default:null,
            type: cc.Node
        },

        direction : 0,

        MOVE_SPEED : 20,

        jumpHeight:65,

        // 主角跳跃持续时间
        jumpDuration: 0.5,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.enabled=false;
        //启动物理引擎
        cc.director.getPhysicsManager().enabled=true;
        this.RigidBody=this.player.getComponent(cc.RigidBody);

        //cc.director.getCollisionManager().enabled = true;
        //cc.director.getCollisionManager().enabledDebugDraw = true;
        //cc.director.getCollisionManager().enabledDrawBoundingBox = true;
        //this.touchingNumber = 0;
        
    },

    /*onCollisionEnter: function (other) {
        this.node.color = cc.Color.RED;
        this.touchingNumber ++;
    },

    onCollisionStay: function (other) { },
        
    onCollisionExit: function () {
        this.touchingNumber --;
        if (this.touchingNumber == 0) {
        this.node.color = cc.Color.WHITE; 
        }
    },*/

    onDestroy () {
        // 取消键盘输入监听
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyPressed, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyReleased, this);
    }, 

    onKeyPressed:function(event){
        let keyCode=event.keyCode;
        switch(keyCode){
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.direction=1;
                break;
            case cc.macro.KEY.space:
                //if(this.touchingNumber!=0)
                    this.on_player_jump();
        }
    },

    onKeyReleased:function(event){
        let keyCode=event.keyCode;
        switch(keyCode){
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.direction=0;
                break;
        }
    },

    update (dt) {
        //console.log(this.touchingNumber);
        if(this.direction!=0){
            this.on_player_walk();
        }
        else
            this.player_stop();

    },

    start:function(){
        this.enabled=true;

        //设置键盘监听
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyPressed,this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,this.onKeyReleased,this);
    },

    stopMove:function(){
        this.node.stopAllActions();
    },
    
    on_player_walk:function(){
        // 取得之前获得的刚体组件的线速度
        var v = this.RigidBody.linearVelocity;
 
        // 改变其x方向的速度
        v.x = this.MOVE_SPEED;
 
        // 将改变后的线速度赋值回去
        this.RigidBody.linearVelocity = v;

    },
    player_stop:function(){
        var v=this.RigidBody.linearVelocity;
        v.x=0;
        this.RigidBody.linearVelocity=v;
    },

    runJumpAction:function(){
        // 跳跃上升
        var jumpUp = cc.tween().by(this.jumpDuration, { y: this.jumpHeight }, { easing: 'sineOut' });

        // 下落
        var jumpDown = cc.tween().by(this.jumpDuration, { y: -this.jumpHeight }, { easing: 'sineIn' });

        // 创建一个缓动
        var tween = cc.tween()
                        // 按 jumpUp，jumpDown 的顺序执行动作
                        .sequence(jumpUp, jumpDown);
        return tween;
    },

    on_player_jump:function(){
        var jumpAction=this.runJumpAction();
        cc.tween(this.node).then(jumpAction).start();
    }
});
