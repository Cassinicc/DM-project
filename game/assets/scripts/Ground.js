
cc.Class({
    extends: cc.Component,

    properties: {
        prefab:cc.Prefab,
        length:100

    },

    onLoad(){
        
        this.RigidBody=this.getComponent(cc.RigidBody);
        this.enabled=false;      
        
    },

    start:function(){
        this.create();
        this.enabled=true;
        var v=this.RigidBody.linearVelocity;
        v.x=-465;
        this.RigidBody.linearVelocity=v;
    },

    stopMove:function(){
        var v=this.RigidBody.linearVelocity;
        v.x=0;
        this.RigidBody.linearVelocity=v;
    },
    create:function(){
        length=225;
        for(let x=2;x<G.pos.length;x++){
            let prefab=cc.instantiate(this.prefab);
            this.node.addChild(prefab);
            prefab.scaleX=G.len[x]*4;
            if(prefab.scaleX<1) prefab.scaleX=0.8;
            prefab.x=length+prefab.scaleX*100/2;
            if(G.pos[x]-G.pos[1]>3){
                prefab.y=25*3;
            }
            else if(G.pos[x]-G.pos[1]<-3){
                prefab.y=-25*3;
            }
            else prefab.y=25*(G.pos[x]-G.pos[1]);
            length=prefab.x+prefab.scaleX*100/2+25;
            prefab.getComponent('ground_control').parent=this.node;
        }
        console.log(length);
    },

    update (dt) {      
        if(this.node.x<=-(length-420)&&this.RigidBody.linearVelocity.x!=0){
            this.stopMove();
        }
            
    },


});
