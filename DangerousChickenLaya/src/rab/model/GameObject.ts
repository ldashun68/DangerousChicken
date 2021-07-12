
/**
 * 模拟U3D的GameObject
 */
export default  abstract class GameObject extends Laya.Script3D {

    private _gameObject:Laya.MeshSprite3D;
    private _transform:Laya.Transform3D;
    private _initPosition:Laya.Vector3;

    onAwake() {
        this.setValue();
        this.OnInit();
    }

    /**赋值 */
    private setValue (): void {
        this._gameObject = (<Laya.MeshSprite3D>(this.owner));
        this._transform = this.gameObject.transform;
        this._initPosition = new Laya.Vector3(
            this._transform.localPositionX,
            this._transform.localPositionY,
            this._transform.localPositionZ
        );
    }

    /**返回当前对象 MeshSprite3D */
    get gameObject(){
        if(!this._gameObject) {
            this.setValue();
        }
        return this._gameObject;
    }

    /**返回当前 transform */
    get transform(){
        if(!this._transform) {
            this.setValue();
        }
        return this._transform;
    }

    /**初始位置信息 */
    get initPosition() {
        return this._initPosition;
    }

    /**初始化方法 */
    abstract OnInit(): any;

    /**销毁 */
    onDestroy(): void {
        Laya.timer.clearAll(this);
        Laya.stage.offAllCaller(this);

        if(this.gameObject) {
            this.gameObject.removeSelf();
            this.gameObject.destroy();
        }
    }

    /**
     * 监听消息
     * @param name	消息类型
     * @param callbreakFun	回调
     * @param caller	事件侦听函数的执行域
     */
    protected AddListenerMessage(name,callbreakFun){
        Laya.stage.on(name, this, callbreakFun);
    }

    /**
     * 移除消息监听
     * @param name	消息类型
     * @param args	回调
     */
    protected RemoveListenerMessage(name,callbreakFun){
        Laya.stage.off(name, this,callbreakFun);
    }

    /**
     * 发送消息
     * @param name 消息类型
     * @param args 参数
     */
    protected SendMessage(name,...args: any[])
    {
        Laya.stage.event(name,args);
    }

    /**
     * 寻找子节点
     * @param node 
     * @param path 
     */
    protected findChild(node:Laya.Sprite3D, path:string): Laya.Sprite3D
    {
        let url = path.split('/');
        let parent = node;
        let child: Laya.Sprite3D = node;
        if(node && url) {
            for(var i = 0;i<url.length;i++) {
                child = <Laya.Sprite3D>parent.getChildByName(url[i]);
                parent = child;
            }
        }
        return child;
    }

    /**
     * 克隆
     * @param item 
     * @param parent 
     * @param worldPositionStays 
     * @param position 
     * @param rotation 
     */
    protected instantiate(original:Laya.Sprite3D,parent?:Laya.Sprite3D,worldPositionStays?: boolean, position?: Laya.Vector3, rotation?: Laya.Quaternion):Laya.Sprite3D
    {
      return Laya.Sprite3D.instantiate(original, this._gameObject, worldPositionStays, position);
    }
}