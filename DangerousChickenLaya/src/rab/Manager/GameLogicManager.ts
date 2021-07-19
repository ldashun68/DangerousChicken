

import GameMessage from "../../game/GameMessage";
import GameController from "../../game/manager/GameController";
import MgobeManager from "../../game/manager/MgobeManager";
import { JsonList, RoleType, UserCurrentRole } from "../../game/model/DataType";
import RabGameConfig from "../data/RabGameConfig";
import { RabGameInfo } from "../data/RabGameInfo";
import SDKChannel from "../SDKChannel";
import Util from "../Util";
import GameManager from "./GameManager";
import { RabManager } from "./RabManager";

/**
 * 游戏管理器
 * @author Rabbit
 */
export default class GameLogicManager extends RabManager {

    /**游戏数据保存类型 */
    protected _gameType: string = "gameinfo";
    /**游戏数据 */
    public gameInfo: RabGameInfo;
    /**游戏配置表 */
    public gameConfig: RabGameConfig;

    /**是否启动定时增加体力 */
    public isLoopAddTicket: boolean;
    /**每次增加的体力 */
    public loopAddTicketValue: number;
    /**定时增加体力时间间隔 */
    public loopAddTicketTimeGap: number;

    /**初始化 */
    OnInit()
    {
        this.gameInfo = {
            id: 0,
            openId: Date.now()+"",
            nickName: "Rabbit",
            avatarUrl: "",
            music: 1,
            audio: 1,
            vibrate: 1,
            lastTime: {
                year: 0,
                month: 0,
                day: 0,
                hour: 0,
                minute: 0,
                second: 0,
            },
            offlineTime: {
                year: 0,
                month: 0,
                day: 0,
                hour: 0,
                minute: 0,
                second: 0,
            },
            maxTicket: 5,
            ticket: 5,
            diamond: 0,
            coin: 0,
            currentRole: {
                type: RoleType.ghost,
                id: 0,
            },
            ghost: [0],
            child: [0],
        };
        this.isLoopAddTicket = false;
        this.loopAddTicketTimeGap = 1000*60*30;
        this.loopAddTicketValue = 1;

        this.onInitManaager();
    }

    /**
     * json资源数据
     */
    protected jsonData: any={};

    onInitManaager()
    {
        this._gameType = "maingame";
        SDKChannel.UpdateGame();
        Util.Log("初始化管理器");
        let path = "config/config.json";
        Laya.loader.load(path , Laya.Handler.create(this, ()=>{
            Util.Log("加载配置表===",path);
            this.gameConfig= Laya.loader.getRes(path);
            this.InitConfig();
        }));
    } 

    /**
     * 加载配置表完成
     * @param res 
     */
    private InitConfig()
    {
        Util.Log("最新配置表",this.gameConfig);
        if(Util.isMobil)
        {
            this.gameConfig = Util.supplement(this.gameConfig,sdk.confs) 
        }
        /**TODO: 这里把参数定义成全局变量 */
        this.InitMusic();
        SDKChannel.traceEvent("entergame");
        this.loadJson();
    }

    // /**
    //  * 登录服务器
    //  */
    // private loginServer()
    // {
    //     Util.Log("登录服务器");
    //     SDKChannel.login(()=>{
    //         this.InitMusic();
    //         this.OnEnterGame();
    //     })
    // }

    /**
     * 可以执行下一步了
     */
    private OnEnterGame()
    {
        if(Util.isMobil)
        {
            if(sdk.data != null)
            {
                this.gameInfo = Util.supplement(this.gameInfo,sdk.data) 
            }else{
                sdk.data = this.gameInfo;
                sdk.postData();
            }
            // Util.Log("获得数据",this.gameInfo,sdk.data,sdk.user);
            if(sdk.user.avatar == null)
            {
                SDKChannel.createUserInfoButton(()=>{
                    this.gameInfo.nickName = "";
                    this.gameInfo.avatarUrl = "";
                    this.gameInfo.id = sdk.user.id;
                    this.gameInfo.openId = sdk.user.openid+"";
                    this.SendMessage(GameMessage.HallView_ShowRole);
                    sdk.data = this.gameInfo;
                    sdk.postData();
                })
            }else
            {
                if(this.gameInfo.nickName == "" || this.gameInfo.nickName == null)
                {
                    this.gameInfo.nickName = "";
                    this.gameInfo.avatarUrl = "";
                    this.gameInfo.id = sdk.user.id;
                    this.gameInfo.openId = sdk.user.openid+"";
                    this.SendMessage(GameMessage.HallView_ShowRole);
                    sdk.data = this.gameInfo;
                    sdk.postData();
                }
            }
            // this.gameInfo.openId = Date.now()+""
        }
        this.InitGameInfo();
    }

    /**
     * 初始化数据
     */
    protected InitGameInfo()
    {
        this.gameInfo = SDKChannel.initData(this.gameInfo,this.gameConfig);
        this.updateTime();
        Util.Log("获得数据",this.gameInfo);
        SDKChannel.onHide((res)=>{
            Util.Log("保存数据");
            this.SaveData()
        });
    }

    /**更新时间 */
    public updateTime (): void {
        let date: Date = new Date();
        let minute: number = 0;
        if (this.gameInfo.lastTime.year < date.getFullYear()) {
            this.gameInfo.ticket = this.gameInfo.maxTicket;
        }
        else if (this.gameInfo.lastTime.month < date.getMonth()) {
            this.gameInfo.ticket = this.gameInfo.maxTicket;
        }
        else if (this.gameInfo.lastTime.day < date.getDay()) {
            this.gameInfo.ticket = this.gameInfo.maxTicket;
        }
        else if (this.gameInfo.lastTime.hour < date.getHours()) {
            this.gameInfo.ticket = this.gameInfo.maxTicket;

            let hour = date.getHours() - this.gameInfo.lastTime.hour;
            minute = date.getMinutes() - this.gameInfo.lastTime.minute;
            minute += hour*60;
        }
        else if (this.gameInfo.lastTime.minute < date.getMinutes()) {
            minute = date.getMinutes() - this.gameInfo.lastTime.minute;
            while (minute >= 30 && this.gameInfo.ticket < this.gameInfo.maxTicket) {
                this.addTicket(this.loopAddTicketValue);
                minute -= 30;
            }

            minute = date.getMinutes() - this.gameInfo.lastTime.minute;
        }
        else if (this.gameInfo.lastTime.second < date.getSeconds()) {
            
        }

        this.gameInfo.lastTime.year = date.getFullYear();
        this.gameInfo.lastTime.month = date.getMonth();
        this.gameInfo.lastTime.day = date.getDay();
        this.gameInfo.lastTime.hour = date.getHours();
        this.gameInfo.lastTime.minute = date.getMinutes();
        this.gameInfo.lastTime.second = date.getSeconds();
    }

    private loadJson()
    {
        var arr = [];
        // rab.Util.Log("loadView===", this.gameConfig)
        Object.keys(this.gameConfig.loadJson).forEach((key)=>{
            arr.push(this.gameConfig.loadJson[key]);
        });

        if (arr.length > 0) {
            Laya.loader.load(arr , Laya.Handler.create(this, ()=>{
                this.loadView();
            }));
        }
        else {
            this.loadView();
        }
    }

    /**
     * 与加载资源
     */
    private loadView()
    {
        // let setPath = () => {
        //     let equipConf: Array<EquipConf> = this.getJsonData("equip");
        //     for(var i = 0; i < equipConf.length; i++)
        //     {
        //         equipConf[i].usepictures = "ui: //Res_Equip/"+equipConf[i].usepictures;
        //     }
        // }

        Object.keys(this.gameConfig.loadJson).forEach((key)=>{
            this.jsonData[key] = Laya.loader.getRes(this.gameConfig.loadJson[key]);
        });

        var arr = [];
        Object.keys(this.gameConfig.loadui).forEach((key)=>{
            arr.push(this.gameConfig.loadui[key]);
        });

        if (arr.length > 0) {
            fgui.UIPackage.loadPackage(arr, Laya.Handler.create(this, ()=>{
                // setPath();
                this.OnEnterGame();
            }));
        }
        else {
            // setPath();
            this.OnEnterGame();
        }
    }

    /**保存数据 */
    public SaveData()
    {
        if(Util.isMobil) {
            sdk.data = this.gameInfo;
            sdk.postData();
        }
        
        let date: Date = new Date();
        this.gameInfo.offlineTime.year = date.getFullYear();
        this.gameInfo.offlineTime.month = date.getMonth();
        this.gameInfo.offlineTime.day = date.getDay();
        this.gameInfo.offlineTime.hour = date.getHours();
        this.gameInfo.offlineTime.minute = date.getMinutes();
        this.gameInfo.offlineTime.second = date.getSeconds();
        SDKChannel.SaveData(this.gameInfo,this._gameType);
        Util.Log("保存数据",this.gameInfo);
    }
 
    /**获得json数据 */
    public getJsonData (name: JsonList): any {
        return this.jsonData[name];
    }

    /**增加（扣除）体力，返回false 体力不足 */
    public addTicket (ticket: number): boolean {
        if (this.gameInfo.ticket + ticket < 0) {
            //rab.UIManager.onCreateView(ViewConfig.gameView.GetTicketView);
            return false;
        }

        this.gameInfo.ticket += ticket;
        if (this.gameInfo.ticket >= this.gameInfo.maxTicket) {
            this.isLoopAddTicket = false;
            Laya.timer.clear(this, this.loopAddTicket);
        }
        else if (this.isLoopAddTicket == false) {
            this.isLoopAddTicket = true;
            Laya.timer.loop(this.loopAddTicketTimeGap, this, this.loopAddTicket);
        }

        this.SaveData();
        this.SendMessage(GameMessage.GameMessage_UpdateUserInfo);
        return true;
    }

    /**定时增加体力 */
    private loopAddTicket (): void {
        this.addTicket(this.loopAddTicketValue);
    }

    /**设置当前角色 */
    public setCurrentRole (index: number): void {
        let list: Array<string> = GameController.resourceManager.getRoleAllPath(this.gameInfo.currentRole);
        this.gameInfo.currentRole.id += index;
        if (this.gameInfo.currentRole.id < 0 || this.gameInfo.currentRole.id >= list.length) {
            if (this.gameInfo.currentRole.type == RoleType.ghost) {
                this.gameInfo.currentRole.type = RoleType.child;
            }
            else {
                this.gameInfo.currentRole.type = RoleType.ghost;
            }
            
            if (this.gameInfo.currentRole.id < 0) {
                list = GameController.resourceManager.getRoleAllPath(this.gameInfo.currentRole);
                this.gameInfo.currentRole.id = list.length-1;
            }
            else {
                this.gameInfo.currentRole.id = 0;
            }
        }
    }

    /**是否拥有角色 */
    public isHaveRole (role: UserCurrentRole = this.gameInfo.currentRole): boolean {
        if (role.type == RoleType.ghost) {
            return this.gameInfo.ghost.indexOf(role.id) != -1;
        }
        else {
            return this.gameInfo.child.indexOf(role.id) != -1;
        }
    }
 
    //----------TODO音乐接口----------------------

    /**
     * 重新初始化声音 防止微信拉起的时候没声音
     */
    public InitMusic()
    {
        GameManager.musicManager.SetState(this.gameInfo.music,this.gameInfo.audio);
    }
 
    /**
     * 播放背景音乐
     */
    public PlayMusic(musiPath: string,vol: number =0.5)
    {
        GameManager.musicManager.playMusic(musiPath,vol);
    }
 
    //--------------设置info--------------

    /**
     * 设置用户数据
     * @param typ 
     * @param val 
     */
    public setGameInfo(typ: string,val: number)
    {
        this.gameInfo[typ] = val;
    }
     
    /**
     * 设置背景音乐
     * @param val 
     */
    public setMusic()
    {
        this.gameInfo.music = this.gameInfo.music?0: 1;
        this.InitMusic();
    }
 
    /**
     * 设置音效
     * @param val 
     */
    public setAudio()
    {
        this.gameInfo.audio = this.gameInfo.audio?0: 1;
        this.InitMusic();
    }

    /**
     * 设置振动
     * @param val 
     */
    public setVibrate()
    {
        this.gameInfo.vibrate = this.gameInfo.vibrate?0: 1;
    }


    //----------------处理加密事情--------------------------
}
