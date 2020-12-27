
cc.Class({
    extends: cc.Component,

    properties: {
        speed:-100,
        prefab:cc.Prefab
            

    },

    onLoad(){
        
        this.RigidBody=this.getComponent(cc.RigidBody);
        this.enabled=false;      
        
    },

    start:function(){
        this.create();
        this.enabled=true;
        var v=this.RigidBody.linearVelocity;
        v.x=-100;
        this.RigidBody.linearVelocity=v;
    },

    stopMove:function(){
        var v=this.RigidBody.linearVelocity;
        v.x=0;
        this.RigidBody.linearVelocity=v;
    },
    create:function(){
        let length=200;
        for(let x=2;x<G.pos.length;x++){
            let prefab=cc.instantiate(this.prefab);
            this.node.addChild(prefab);
            //prefab.getComponent(cc.Node).size=cc.size(G.len[x]*400,25);
            prefab.x=length+G.len[x]*200;
            prefab.y=25*(G.pos[x]-G.pos[1]);
            length+=G.len[x]*400;
            console.log(length);
            prefab.getComponent('ground_control').parent=this.node;
        }
    },
    update (dt) {      
        if(this.node.x<=-(200*(G.pos.length-1)-320)&&this.RigidBody.linearVelocity.x!=0){
            this.stopMove();
        }
            
    },


});
