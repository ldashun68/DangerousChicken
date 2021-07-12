import RabView from "../RabView";

/**
 * 管理器基类
 * @author Rabbit
 */
export abstract class RabManager{

    protected msgList:Map<string,Function>;
    protected _node:Laya.Sprite;

    constructor(node?:Laya.Sprite)
    {
        this._node = node;
        this.msgList = new Map<string,Function>();
        this.OnInit();
    }

    /**初始化 */
    protected abstract OnInit(): any;

    /**监听消息 */
    protected AddListenerMessage(name:string,callbreakFun:Function,target:any=this){
        if(!this.msgList.has(name))
        {
            this.msgList.set(name,callbreakFun);
            Laya.stage.on(name,target,callbreakFun);
        }
    }

    /**移除消息 */
    protected RemoveListenerMessage(name:string,callbreakFun:Function){
        Laya.stage.off(name, this,callbreakFun,);
        this.msgList.delete(name);
    }

    /**发送消息 */
    protected SendMessage(name:any,...args:any[])
    {
        Laya.stage.event(name,args);
    }

    public onDestroy()
    {
        Laya.timer.clearAll(this);
        Laya.stage.offAllCaller(this);
        this.msgList.clear();
    }
}

/**
 * 音乐管理器
 * @author Rabbit
 */
 export class MusicManager extends RabManager {

    private soundState:number = 1;
    private musicState:number = 1;
    private bgm: string = "";

    protected OnInit() {
        //失去舞台焦点（切出游戏）的处理
        Laya.stage.on(Laya.Event.BLUR, this, () => {
            Laya.SoundManager.stopAll();
        });
        //获得舞台焦点（切回游戏）的处理
        Laya.stage.on(Laya.Event.FOCUS, this, () => {
            Laya.SoundManager.playMusic(this.bgm);
        });
    }

    /**初始化音效 */
    public InitMusic(music?:number,sound?:number)
    {
        if(music) {
            this.musicState = music;
        }

        if(sound) {
            this.soundState = sound;
        }
        
        this.SetState(this.musicState,this.soundState);
    }

    /**
     * 设置音乐音效状态
     * @param music  1:正常0：不播放
     * @param audio 1:正常0：不播放
     */
    SetState(music:number,audio:number)
    {
        Laya.SoundManager.musicMuted = (music == 0)? true:false;
        Laya.SoundManager.soundMuted = (audio == 0)? true:false;
    }
 
    playMusic (url: string, volume: number = 2): void {
        // Util.Log("===播放音乐==",this.musicState);
        if(this.musicState == 0) {
            return;
        }
        // Util.Log("===播放音乐url==",url);
        this.bgm = url;
        // Laya.SoundManager.musicVolume = volume;
        Laya.SoundManager.playMusic(url);
    }

    playSound (url: string, loop: number = 1, volume: number = 2, callback: Laya.Handler = null): void {
        // Util.Log("===播放音效==",this.soundState);
        if(this.soundState == 0) {
            return;
        }
        // Laya.SoundManager.soundVolume = volume;
        Laya.SoundManager.playSound(url, loop, callback);
    }
 
    stopSound (url: string): void {
        Laya.SoundManager.stopSound(url);
    }
}

export class UIManager extends RabManager {

    private UIList:Map<string,RabView>= new Map<string,RabView>();
    //**参考Laya的类工具类来实现 */
    private _clsList:Map<string,any>= new Map<string,any>();

    protected OnInit() {
        
    }

    /**
     * 创建页面UI
     * @param path 
     * @param optionalParams 
     */
    onCreateView(uiclass:string,breckcall?:Function,...optionalParams: any[])
    {
        // rab.Util.Log("加载view ",path);
        // Util.Log("加载view ",uiclass);
        if(this.UIList.has(uiclass))
        {
            this.UIList.get(uiclass).onRefresh(optionalParams);
            breckcall&&breckcall();
        }else{
            var view: RabView = this.getRegClass(uiclass, optionalParams);
            if(view) {
                this.UIList.set(uiclass,view);
            }
        }
    }

    /**
     * 隐藏页面
     * @param Resname 
     */
    onHideView(uiclass:string)
    {
        if(this.UIList.has(uiclass))
        {
            this.UIList.get(uiclass).onHide();
        }
    }

    /**
     * 关闭页面
     * @param Resname 
     */
    onCloseView(uiclass:string)
    {
        // Util.Log("关闭页面",uiclass);
        if(this.UIList.has(uiclass))
        {
            this.UIList.get(uiclass).onDestroy();
            this.UIList.delete(uiclass);
        }
    }

    //---------------------------------------------------

    /**
     * 注册 Class 映射，方便在class反射时获取。
     * @param className 映射的名字或者别名。
     * @param classDef 类的全名或者类的引用，全名比如:"laya.display.Sprite"。
     */
    public regClass(className:string, classDef:any):void
    {
        if(this._clsList.has(className))
        {
            console.log("重复标签了");
        }else{
            this._clsList.set(className,classDef);
        }
    }
    
    /**
     * 返回注册的 Class 映射。
     * @param className 映射的名字。
     */
    public getRegClass(className:string, ...optionalParams: any[]):RabView
    {
        if(this._clsList.has(className)) {
            return new (this._clsList.get(className))(className, optionalParams);
        }
        else {
            console.log("未找注册该类型",this._clsList);
            return null;
        }
    }
}
