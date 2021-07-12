import RabGameConfig from "./data/RabGameConfig";
import GameManager from "./Manager/GameManager";
import PublicSDK from "./PublicSDK";
import Util from "./Util";

/**
 * SDK渠道
 * @author Rabbit
 */
class SDKChannel   {

    private _gameconf:RabGameConfig;
    private _publicSDK:PublicSDK;

    constructor()
    {
        this._publicSDK = new PublicSDK();
    }

    /**
     * 初始化获得保存数据
     * @param gameInfo 数据对象
     * @param key 键值
     */
    initData(gameInfo:any,config:RabGameConfig,key:string = "gameinfo")
    {
        this._gameconf = config;
        if(typeof wx != "undefined")
        {
            // var _data = {};
            // Object.keys(gameInfo).forEach(function(key){
            //     _data[key] = ws.getData(key, gameInfo[key]);
            // });
            // rab.Util.Log('初始化获得保存数据',_data);
            // return _data;
        }else
        {
            var info = Laya.LocalStorage.getItem(key); 
            if(info)
            {
                let data = JSON.parse(info);
                // rab.Util.Log('初始化获得保存数据===',data)
               gameInfo = Util.supplement(gameInfo,data);
            }
        }
        return gameInfo;
    }

    /**
     * 登录服务器
     */
    login(breakcall:Function)
    {
        // if(typeof ws != "undefined")
        // {
        //     this._publicSDK.showLoading('登录中');
        //     ws.login();
        // }else{
        //     breakcall&&breakcall();
        // }
        breakcall&&breakcall();
    }

    /**
     * 创建授权按钮
     * @param btnNode 参考按钮
     * @param wnode 当前最大的坐标
     * @param handler 
     */
    public createUserInfoButton(handler:Function)
    {
        if(typeof sdk != 'undefined')
        {
            //if(wx.sdk.needUserInfo())
            {
                let left = 0;
                let top =  0;
                let width = Laya.stage.width;
                let height = Laya.stage.height;0
                this._publicSDK.createUserInfoButton(left,top,width,height,handler)
            }
        }
        
    }

    /**
     * 保存用户数据
     * @param gameInfo 
     * @param key 
     */
    SaveData(gameInfo:any,key:string = "gameinfo")
    {
        // if(typeof ws != "undefined" && this._gameconf.config.controllerData)
        // {
        //     Object.keys(gameInfo).forEach(function(key){
        //         ws.setData(key, gameInfo[key]);
        //      });
        //      ws.postData();
        // }else{
        //     Laya.LocalStorage.setItem(key,JSON.stringify(gameInfo));
        // }
        Laya.LocalStorage.setItem(key,JSON.stringify(gameInfo));
    }

    onHide(breakcall:Function)
    {
        if(typeof sdk != "undefined")
        {
            Util.Log("隐藏游戏");
            sdk.onHide(breakcall);
        }
    }

    onShow(breakcall:Function)
    {
        // if(typeof ws != "undefined")
        // {
        //     ws.onShow(breakcall);
        // }
    }

    /**
     * 在线跟新新版本
     */
    UpdateGame(call?:Function)
    {
        // rab.wxSdk.UpdateGame(call);
    }

    /**
     * 激励点
     * @param pos 位置
     * @param way 方式 0:无 1：分享 2：视频 其他：功能未开放
     * @param succeed 成功
     * @param fail 失败
     */
    public stimulate(pos:string,succeed:Function,fail?:Function){
        let way = this._gameconf.config[pos];
        switch(way){
            case 0:
                succeed();
                break;
            case 1:
                this.createShare(pos,()=>{
                    succeed();
                },()=>{
                    fail&&fail();
                });
                break;
            case 2:
                this.createVideo(pos,()=>{
                    succeed();
                    GameManager.musicManager.InitMusic();
                },()=>{
                    fail&&fail();
                    GameManager.musicManager.InitMusic();
                });
                break;
            default:
                fail&&fail();
                this._publicSDK.showToast("该功能未开发!");
        }
    }

    /**
     * 分享
     * @param pos 位置
     * @param succeed 成功
     * @param fail 失败
     */
    createShare(_pos:string,succeed?:Function,fail?:Function,imageUrl?:string,title?:string,query?:any)
    {
        if(this._gameconf.config.allow_share){
               
        }else{
            this._publicSDK.showToast("功能未启动");
            fail&&fail();
        }
    }

    /**
     * 视频
     * @param pos 位置
     * @param succeed 成功
     * @param fail 失败
     */
    createVideo(pos:string,succeed?:Function,fail?:Function)
    {
        if(typeof wx != 'undefined')
        {
            if(this._gameconf.config.allow_video)
            {
                
            }else{
                this._publicSDK.showToast("视频功能未启动");
                fail&&fail();
            }
        }
    }

    private BannerAd: any;
    /**
     * 创建banner
     * @param pos 位置
     */
    public createBanner(_pos:string)
    {
        // Util.Log("创建banner",_pos);
        if(_pos != "")
        {
            
        }
    }
    
    /**
     * 关闭banner
     */
    public closeBanner(pos:string="")
    {
        if(pos != "")
        {
            
        }
    }

    /**
     * 返回导量列表
     * @param pos 
     */
    getAdGame(pos:string,success:Function,count:number = 10)
    {
        
    }

    /**
     * 跳转到游戏
     * @param item 
     */
    onTapAdGame(pos:string,item:any,success?:Function,fail?:Function)
    {
        
    }

    /**埋点显示 */
    traceEvent(key:string,data?:any)
    {
        
        // Util.Log("埋点：",key);
    }
}

export default new SDKChannel();