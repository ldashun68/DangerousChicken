import GameManager from "./Manager/GameManager";

/**
 * 底层对象
 * @author Rabbit
 */
export default abstract class RabObject extends Laya.Script {

    protected _myManager:any;
    protected msgList:object;

    constructor() {
        super();
        this.msgList = {};
    }

    protected abstract OnInit(): any;

    protected myManager<T>(c: { new(): T }):T
    {
        if(!this._myManager)
        {
            this._myManager = <T>(GameManager.getManager<T>(c));;
        }
        return <T>(this._myManager); 
    }

    /**监听消息 */
    protected AddListenerMessage(name:string,callbreakFun:Function,target:any=this){
        if(!this.msgList[name])
        {
            this.msgList[name] = 1;
            Laya.stage.on(name,target,callbreakFun);
        }
    }

    /**移除消息 */
    protected RemoveListenerMessage(name:string,callbreakFun:Function){
        Laya.stage.off(name, this,callbreakFun);
        this.msgList[name] = 0;
    }

    /**发送消息 */
    protected SendMessage(name:any,...args:any[])
    {
        Laya.stage.event(name,args);
    }

    /**销毁 */
    onDestroy()
    {
        this.msgList= null;
        Laya.timer.clearAll(this);
        Laya.stage.offAllCaller(this);
    }

    protected OnRemove()
    {
        this.onDestroy();
    }

    /**获得字节点 */
    protected findChild(parent: Laya.Node, path:string): Laya.Node
    {
        var paths = path.split("/");
        var child = parent;      
        if(paths)
        {
            for (var i = 0; i < paths.length; ++i)
            {
                child = parent.getChildByName(paths[i]);
                parent = child;
            }
        }  
        return child;
    }
}
