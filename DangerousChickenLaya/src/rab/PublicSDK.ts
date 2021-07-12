import Util from "./Util";
import Size from "./model/Size";

/**
 * 通用SDK
 * @author Rabbit
 */
export default class PublicSDK  {

    // private wx;
    constructor()
    {
        Util.Log("初始化微信SDK");
        this.showShareMenu();
    }

    /**
     * 显示当前页面的转发按钮
     * @param withShareTicket 
     */
    showShareMenu(withShareTicket:boolean = true)
    {
        if(typeof wx != "undefined")
        {
            wx.showShareMenu({
                withShareTicket: withShareTicket
            })
            wx.onShareAppMessage(()=> {
                return {
                    title: "和平峡谷，水晶吃鸡，真实王者对战！",
                    imageUrl: "https://mmocgame.qpic.cn/wechatgame/zez7olQ7aib5uhVRWiaPgplKgNMB5ZSGqibl4fBCiauWS0lMdTxqYH6SB3RIDYOnZ2icQ/0" // 图片 URL
                }
            });
        }
    }

    /**
     * 隐藏
     */
    public hideLoading()
    {
        if(typeof wx != "undefined")
        {
            wx.hideLoading();
        }
    }

    /**
     * 显示
     * @param _title 
     */
    public showLoading(_title:string)
    {
        if(typeof wx != "undefined")
        {
            wx.showLoading({ /**
                * 提示的内容
                */
               title: _title,
             
               /**
                * 是否显示透明蒙层，防止触摸穿透，默认：false
                */
               mask: false,
             
               /**
                * 接口调用成功的回调函数
                */
               success: () => {},
             
               /**
                * 接口调用失败的回调函数
                */
               fail: () => {
                   
               },
             
               /**
                * 接口调用结束的回调函数（调用成功、失败都会执行）
                */
               complete: () => {} 
            })
        }
    }

    /**提示框 */
    public showModal(opt:any){
        if(typeof wx != "undefined")
        {
            wx.showModal({
                title: opt.title||"提示",
                content: opt.content||"提示内容",
                success(res) {
                    if (res.confirm) {
                    Util.Log("confirm, continued");
                    opt.success&&opt.success();
                    } else if (res.cancel) {
                    Util.Log("cancel, cold");
                    opt.cancel&&opt.cancel();
                    } else {
                    // what happend?
                    }
                },
                fail() {
                    Util.Log(`showModal调用失败`);
                }
            });
        }else{
            Util.Log(`提示框`);
        }
    }

    /**
     * 提示
     * @param msg 提示文字
     */
    showToast(msg:string,time?:number){
        if(Util.isMobil){
            wx.showToast({
                title: msg,
                icon: 'none',
                duration: time||2000
            });
        }else{
            Util.Log(msg);
        }
    }

    /**
     * 长震动
     */
    vibrateLong()
    {
        if(typeof wx != "undefined")
        {
            wx.vibrateLong();
        }
    }

    /**
     * 短震动
     */
    vibrateShort()
    {
        if(typeof wx != "undefined")
        {
            wx.vibrateShort();
        }
    }

    /**
     * 获得屏幕宽高
     */
    getSystemInfoSync():Size
    {
        if(typeof wx !="undefined")
        {
            var phone = wx.getSystemInfoSync();
            return new Size(phone.screenWidth,phone.screenHeight)
        }
    }

    /**
     * 小游戏胶囊位置
     */
    getMenuButtonBoundingClientRect()
    {
        if(typeof wx != "undefined")
        {
            return wx.getMenuButtonBoundingClientRect();
        }
        return null;
    }

    /**
     * 在线跟新新版本
     */
    UpdateGame(call?:Function)
    {
        if(typeof wx != "undefined")
        {
            if (typeof wx.getUpdateManager === 'function') {
                const updateManager = wx.getUpdateManager();
                updateManager.onCheckForUpdate(function (res) {
                    call&&call(1);
                    Util.Log("===新版本====="+res.hasUpdate)
                })
                updateManager.onUpdateReady(function () {
                    Util.Log("===新版本并重启=====")
                    updateManager.applyUpdate();
                    call&&call(1);
                })
                updateManager.onUpdateFailed(function () {
                    // 新的版本下载失败
                    Util.Log("版本更新失败");
                    call&&call(0);
                })
            }else{
                call&&call(1);
            }
        }else{
            call&&call(1);
        }
    }

    /**
     * 判断版本号大小
     * @param {*} _version 
     */
    public getSystemInfo(_version='2.3.0')
    {
        if(typeof wx != "undefined")
        {
            const version = wx.getSystemInfoSync().SDKVersion || "1.1.0";

            if (this.compareVersion(version, _version) >= 0) {
                //支持功能
                return true;
            }
            else {
                return false;
            }
        }
        return true;
    }

    private compareVersion(v1, v2) {
        v1 = v1.split('.')
        v2 = v2.split('.')
        const len = Math.max(v1.length, v2.length)
        
        while (v1.length < len) {
            v1.push('0')
        }
        while (v2.length < len) {
            v2.push('0')
        }
        
        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i])
            const num2 = parseInt(v2[i])
        
            if (num1 > num2) {
            return 1
            } else if (num1 < num2) {
            return -1
            }
        }
        
        return 0;
    }

    /**
     * 拉起客服提示
     * @param title 标题
     * @param img  图
     * @param success 返回成功
     * @param fail 失败返回
     */
    public openCustomerServiceConversation(title:string,img:string,success?:Function,fail?:Function)
    {
        if(typeof wx != 'undefined')
        {
            if(wx.openCustomerServiceConversation)
            {
                wx.openCustomerServiceConversation({
                    showMessageCard: true,
                    sendMessageTitle:title,
                    sendMessageImg:img,
                    success:(res)=>{
                        success&&success(res);
                    },
                    fail:(res)=>{
                        fail&&fail(res);
                    }
                })
            }
        }
    }

    private btnAuthorize:any;
    /**
     * 拉取授权按钮
     * @param left 
     * @param top 
     * @param width 
     * @param height 
     * @param handler 
     */
    public createUserInfoButton(left:number,top:number,width:number,height:number,handler:Function)
    {
        //创建用户授权按钮
         this.btnAuthorize = wx.createUserInfoButton({
            // 按钮参数，这里只给出示例
            type: 'image',
            // type: 'text',
            // text: '授权按钮',
            style: {
                left: left -(width/2) ,
                top: top - (height/2),
                width: width,
                height: height,
                lineHeight: 0,
                backgroundColor: '',
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 16,
                borderRadius: 4
            }
        });
        this.btnAuthorize.onTap((res) =>{
            if (res.userInfo) {
                wx.showToast({title:"授权成功"});
                //此步骤将获取用户资料，并做存储，是一个异步操作
                sdk.getUserInfo();
                // wx.sdk.user = res.userInfo;
                // sdk.user.nickName = res.userInfo.nickName;
                // sdk.user.avatarUrl = res.userInfo.avatarUrl;
                // sdk.user.city= res.userInfo.city;
                // sdk.user.gender= res.userInfo.gender;
                Util.Log("授权成功:",res.userInfo);
                Util.Log("隐藏当前按钮");
                this.btnAuthorize.hide();
                handler(1);
            }else {
                wx.showToast({title:"授权失败"});
                handler(0);
            }
            // gotoGame();
        })
    }

    /**
     * 销毁用户信息按钮
     */
    public destroyUserInfoButton()
    {
        if(this.btnAuthorize)
        {
            this.btnAuthorize.destroy()
        }
    }

    /**
     * 隐藏授权按钮
     */
    public hideUserInfoButton()
    {
        if(this.btnAuthorize)
        {
            this.btnAuthorize.hide()
        }
    }

    /**
     * 显示授权按钮
     */
    public showUserInfoButton()
    {
        if(this.btnAuthorize)
        {
            this.btnAuthorize.show()
        }
    }
}
