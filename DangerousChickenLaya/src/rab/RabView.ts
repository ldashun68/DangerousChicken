
import GameManager from "./Manager/GameManager";
import RabObject from "./RabObject";
import SDKChannel from "./SDKChannel";

/**
 * 界面
 * @author Rabbit
 */
abstract class RabView extends RabObject {

    private classPath:string = "";
    
    /**当前页面对象子类必须实现的对象 */
    protected _view: fgui.GComponent;
    /**页面传参 */
    protected _viewdata:Array<any>;
    protected _bannerPos:string;
    /**资源路径 */
    protected _path:string;
    protected _pkgName:string;
    protected _resName:string;

    constructor (className:string, value:Array<any>) {
        super();
        this.classPath = className;
        this._viewdata = value;
        this.OnInit();
        this.LoadView();
    }

    /**加载界面 */
    private LoadView()
    {
        fgui.UIPackage.loadPackage(this._path, Laya.Handler.create(this, this.onUILoaded));
    }

    private onUILoaded()
    {
        this._view = fgui.UIPackage.createObject(this._pkgName, this._resName).asCom;
        this._view.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
        this._view.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);
        fgui.GRoot.inst.addChild(this._view);
        this.onShow();
        this.InitView();
    }
    
    /**初始界面 */
    protected abstract InitView(): any;

    /**显示界面 */
    private onShow() {
        this._view.enabled = true;
        this.onResize();
        this.createBanner();
    }

    /**刷新界面 */
    onRefresh(value:Array<any>) {
        this._viewdata = value;
        this.onShow();
    }

    /**隐藏界面 */
    onHide() {
        this._view.enabled = false;
        Laya.timer.clearAll(this);
        this.closeBanner();
    }

    /**设置界面分辨率 */
    onResize() {
        this._view.setSize(Laya.stage.width, Laya.stage.height);
    }

    /**关闭界面 */
    OnCloseView()
    {
        GameManager.uimanager.onCloseView(this.classPath);
    }

    /**销毁界面 */
    onDestroy(): void {
        this.onHide();
        this._view.dispose();
        super.onDestroy();
    }

    ///-------------------------SDK------------------------

    /**
     * 创建banner
     * @param pos 位置
     */
    protected createBanner()
    {
        // Util.Log("创建banner: ",this._bannerPos);
        SDKChannel.createBanner(this._bannerPos);
    }
    
    /**
     * 关闭
     */
    protected closeBanner()
    {
        SDKChannel.closeBanner(this._bannerPos);
    }
}

export default RabView