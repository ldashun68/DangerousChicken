import GameNotity from "../../rab/GameNotity";
import GameLogicManager from "../../rab/Manager/GameLogicManager";
import GameManager from "../../rab/Manager/GameManager";
import { RabManager } from "../../rab/Manager/RabManager";
import Util from "../../rab/Util";
import GameController from "./GameController";
import GameMessage from "../GameMessage";
import { FightUserInfo, FrameSyncData, GameConfig, PlayerRoomState, RoleType, RoomType, SendGameServer, UnitServerType } from "../model/DataType";

export default class MgobeManager extends RabManager {

    private room:MGOBE.Room;
    /**房间信息 */
    private _roomInfo:MGOBE.types.RoomInfo;
    private _frame:MGOBE.types.Frame;
    /**实时服务器消息编号 */
    private sendServerID:Map<string, number>;
    private recvServerID:Map<string, number>;
    private gamelogic:GameLogicManager;
    private _roomList:Array<MGOBE.types.RoomInfo>

    protected OnInit() {
        this.gamelogic = GameManager.gameLogicManager
        var gameConfig: GameConfig = {
            gameId: "obg-52gwuamv",
            openId: this.gamelogic.gameInfo.openId,
            secretKey: "056f40194cc2cca04d555824e112586d8c18f2f4",
            server: "",
        };
    
        var config = {
            url: "52gwuamv.wxlagame.com",
            reconnectMaxTimes: 5,
            reconnectInterval: 4000,
            resendInterval: 2000,
            resendTimeout: 20000,
            isAutoRequestFrame: true,
        };
        
        MGOBE.Listener.init(gameConfig, config, (event) => {
            if(event.code == 0)
            {
                Util.Log("初始化对战引擎成功",MGOBE.Player.id);
                if (event.code === MGOBE.ErrCode.EC_OK) {
                    this.room = new MGOBE.Room();
                    MGOBE.Listener.add(this.room);
                    this.setBroadcast();
                    GameController.onInitHall();
                    this.SendMessage(GameNotity.GameMessage_LoadingEnd);
                    MGOBE.Room.getMyRoom((event)=>{
                        Util.Log("初始化对战引擎成功",event);
                        if (event.code === MGOBE.ErrCode.EC_OK) {
                            this.room.initRoom(event.data.roomInfo);
                            this.onEnterGameRoom(event.data)
                            Util.Log("玩家已在房间内：", event.data.roomInfo.name);
                        }
                        if (event.code === 20011) {
                            Util.Log("玩家不在房间内");
                        }
                    })
                }
            }
            Util.Log("初始化对战引擎==",event);
        });
    }

    /**服务器消息接收 */
    private setBroadcast() {
		if (!this.room) { return; }

        this.room.onJoinRoom = event => {
            Util.Log("新玩家加入", event);
        }

        this.room.onLeaveRoom = event => {
            Util.Log("退出房间:",event);
            if(this._roomInfo && event.data.roomInfo.id == this._roomInfo.id)
            {
                if(event.data.roomInfo.playerList.length < 2)
                {
                    if(MGOBE.Player.id == this._roomInfo.owner)
                    {
                        this.dismissRoom();
                    }
                }
            }
        };

        this.room.onDismissRoom = event => {
            Util.Log("解散房间:",event);
            if(this._roomInfo && event.data.roomInfo.id == this._roomInfo.id)
            {
                Laya.timer.clearAll(this);
                GameController.gameOver();
            }
        };

		this.room.onChangeCustomPlayerStatus = event => {
            if(this._roomInfo && event.data.roomInfo.id == this._roomInfo.id)
            {
                GameController.gameStateManager.setRoomState(event.data.changePlayerId, event.data.customPlayerStatus);
            }
        };

		this.room.onAutoRequestFrameError = event => {
            Util.Log("onAutoRequestFrameError");
        };

		this.room.onRecvFromGameSvr = event => {
            let bool: boolean = true;
            for (let index in UnitServerType) {
                if (event.data.data["cmd"].indexOf(UnitServerType[index]) != -1) {
                    let sendServerID = event.data.data["sendServerID"];
                    bool = (this.recvServerID.get(UnitServerType[index]) < sendServerID);
                    if (this.getPlayInfo((event.data.data as SendGameServer).senderID).isRobot == true) {
                        bool = true;
                    }
                    if (bool == true) {
                        this.recvServerID.set(UnitServerType[index], sendServerID);
                        if (index.indexOf(UnitServerType.role) != -1) {
                            this.sendServerID.set(UnitServerType[index], sendServerID);
                        }
                        break;
                    }
                }
            }

            if(this._roomInfo && event.data.roomId == this._roomInfo.id && bool == true)
            {
                this.SendMessage(GameMessage.MGOBE_RecvFromGameServer,event.data.data);
            }
            else {
                Util.Log("实时服务器接收数据：",event.data);
            }
        };

        this.room.onRecvFromClient = event => {
            if(this._roomInfo && event.data.roomId == this._roomInfo.id)
            {
                if(MGOBE.Player.id == event.data.sendPlayerId)
                {
                    
                }else{
                    this.SendMessage(GameMessage.MGOBE_RecvFromClient,event.data);
                }
            }
        };

        this.room.onRecvFrame = event => {
            if(this._roomInfo && event.data.frame.roomId == this._roomInfo.id)
            {
                if(event.data.frame.items.length > 0)
                {
                    this._frame = (event.data.frame);
                }
            }
        };

        this.room.onChangePlayerNetworkState = event => {
            if(this._roomInfo)
            {
                this._roomInfo =event.data.roomInfo;
                if(event.data.networkState == MGOBE.types.NetworkState.COMMON_OFFLINE)
                {
                    this.SendMessage(GameMessage.MGOBE_RoomOffLine, event.data.changePlayerId)

                }if(event.data.networkState == MGOBE.types.NetworkState.RELAY_OFFLINE)
                {
                    this.SendMessage(GameMessage.MGOBE_GameOffLine, event.data.changePlayerId)
                    if(event.data.changePlayerId == MGOBE.Player.id)
                    {
                        Util.Log("我在游戏中掉线了")
                    }
                }

                if(event.data.networkState == MGOBE.types.NetworkState.COMMON_ONLINE)
                {
                    if(event.data.changePlayerId == MGOBE.Player.id)
                    {
                        Util.Log("我在游戏中又上线了")
                    }

                }if(event.data.networkState == MGOBE.types.NetworkState.RELAY_ONLINE)
                {
                    
                }
            }
        };

        this.room.onChangeRoom = event => {
            console.log("房间属性变更", event.data.roomInfo);
            if(this._roomInfo.id == event.data.roomInfo.id)
            {
                this._roomInfo = event.data.roomInfo;
            }
         };
	}

    ////////////////////////////////////   发送服务器消息   ////////////////////////////////////

    /**
     * 已经在房间了
     * @param data 
     */
    private onEnterGameRoom(data:MGOBE.types.GetRoomByRoomIdRsp)
    {
        if(data.roomInfo)
        {
            Util.Log("玩家当前自定义的状态：",MGOBE.Player.customPlayerStatus);
            this.room.leaveRoom({}, event => {
                if (event.code === MGOBE.ErrCode.EC_OK) {
                    Util.Log("先退出房间",event.code);
                }else {
                    Util.Log(`退出房间失败，错误码：${event.code}`);
                }
            });
        }
    }

    /**修改玩家状态 */
    public changeCustomPlayerStatus(playerstatus:PlayerRoomState)
    {
        if(this.room)
        {
            this.room.changeCustomPlayerStatus({customPlayerStatus:playerstatus},event=>{
                if (event.code === MGOBE.ErrCode.EC_OK) {
                    Util.Log(`修改玩家状态是修改成功`);
                } else {
                    Util.Log(`修改玩家状态是修改失败，错误码：${event.code}`);
                }
            })
        }
    }

    /**开始帧同步 */
    public startFrameSync()
    {
        this.room.startFrameSync({}, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                Util.Log(`开始帧同步成功`);
            } else {
                Util.Log(`开始帧同步失败，错误码：${event.code}`);
            }
        });
    }

    /**创建房间 */
    public CreateRoom(roomName:string, roomType:RoomType)
    {
        let userInfo: FightUserInfo = {
            id: MGOBE.Player.id,
            nickName: this.gamelogic.gameInfo.nickName,
            avatarUrl: this.gamelogic.gameInfo.avatarUrl,
            role: this.gamelogic.gameInfo.currentRole,
        };
        let data:MGOBE.types.CreateRoomPara ={
            roomName: roomName,
            roomType: roomType,
            maxPlayers: 8,
            isPrivate: false,
            customProperties: "WAIT",
            playerInfo: {
                name: this.gamelogic.gameInfo.nickName,
                customPlayerStatus: 0,
                customProfile: JSON.stringify(userInfo),
            }
        };

        this.room.createRoom(data,event =>{
            Util.Log("创建房间",event);
            if (event.code === MGOBE.ErrCode.EC_OK) {
                Util.Log("创建房间成功");
                this._roomInfo = event.data.roomInfo;
                this.onEnterGame();
            }else{

            }
        })
    }

    /**
     * 加入房间
     * @param roomId 
     */
    public JoinRoom(roomId:string)
    {
        this.room.initRoom({id:roomId});

        let joinRoomPara: MGOBE.types.JoinRoomPara ={
            playerInfo: {
                name: this.gamelogic.gameInfo.nickName,
                customPlayerStatus: 0,
                customProfile: JSON.stringify({
                    id:MGOBE.Player.id,
                    nickName: this.gamelogic.gameInfo.nickName,
                    avatarUrl: this.gamelogic.gameInfo.avatarUrl,
                    role: this.gamelogic.gameInfo.currentRole,
                }),
            }
        }
        this.room.joinRoom(joinRoomPara,event =>{
            Util.Log("加入房间",event);
            if (event.code === MGOBE.ErrCode.EC_OK) {
                Util.Log("加入房间成功");
                this._roomInfo = event.data.roomInfo;
                this.onEnterGame();
            }
            else{

            }
        })
    }

    /**
     * 退出房间
     * @param breakCall 
     */
    public leaveRoom(breakCall:Function) {
		this.room.leaveRoom({}, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                Util.Log("退出房间成功",event.code);
                this.SendMessage(GameMessage.MGOBE_LeaveRoom);
                breakCall&&breakCall();
                // this.room = null;
            }else {
                Util.Log(`退出房间失败，错误码：${event.code}`);
                breakCall&&breakCall();
                if(MGOBE.Player.id == this._roomInfo.owner)
                {
                    this.dismissRoom();
                }
            }
        });
	}

    /**解散房间 */
    public dismissRoom()
    {
        this.room.dismissRoom({}, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                Util.Log("解散房间成功",event.code);
            }else {
                Util.Log(`解散房间失败，错误码：${event.code}`);
            }
        });
    }

	/**取消匹配 */
	public cancelMatch() {
		this.room.cancelPlayerMatch({ matchType: MGOBE.ENUM.MatchType.PLAYER_COMPLEX }, event => {
            Util.Log("取消匹配",event.code);
        });
	}

    /**修改房间信息 */
    public changeRoom(isForbidJoin:boolean)
    {
        const changeRoomPara = {
            isForbidJoin: isForbidJoin,
            // roomName?: string;
            // owner?: string;
            // isPrivate?: boolean;
            // customProperties?: string;
        };
        this.room.changeRoom(changeRoomPara,event => {
            if (event.code === 0) {
                console.log("更新房间信息成功", event.data.roomInfo);
            }
        });
    }

    /**
     * 发送房间消息
     * @param msg 字符串房间消息
     */
     public sendToClient(msg: string) {
        const sendToClientPara: MGOBE.types.SendToClientPara = {
            recvPlayerList: [],
            recvType: MGOBE.types.RecvType.ROOM_ALL,
            msg,
        };

        this.room.sendToClient(sendToClientPara, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                
            } else {
                Util.Log(`发送房间消息失败，错误码：${event.code}`);
            }
        });
    }

    /**
     * 发送实时服务器消息
     * @param cmd 消息号
     * @param _data 发送数据
     * @param id 默认是自己 
     */
    public sendToGameSvr(cmd:string,_data: any,id?:string) {
        let _sendPlayid = MGOBE.Player.id;
        if (id != null) {
            _sendPlayid = id;
        }

        let sendServerID = 0;
        if (this.getPlayInfo(_sendPlayid).isRobot == false) {
            for (let index in UnitServerType) {
                if (cmd.indexOf(UnitServerType[index]) != -1) {
                    sendServerID = this.sendServerID.get(UnitServerType[index])+1;
                    this.sendServerID.set(UnitServerType[index], sendServerID);
                    if (sendServerID <= this.recvServerID.get(UnitServerType[index])) {
                        return;
                    }
                    break;
                }
            }
        }

        const sendToGameSvrPara: MGOBE.types.SendToGameSvrPara = {
            data: {cmd:cmd,sendServerID:sendServerID,data:_data,sendPlayid:_sendPlayid}
        };

        this.room.sendToGameSvr(sendToGameSvrPara, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                
            } else {
                Util.Log(`发送实时服务器消息失败，错误码：${event.code}`);
            }
        });
    }

    /**
     * 发送帧消息
     * @param senddata 帧数据
     */
    public sendFrame(senddata: FrameSyncData) {

        const sendFramePara: MGOBE.types.SendFramePara = {
            data: senddata,
        };

        this.room.sendFrame(sendFramePara, event => {
            if (event.code === MGOBE.ErrCode.EC_OK) {
                
            } else {
                Util.Log(`发送帧消息失败，错误码：${event.code}`);
            }
        });
    }

    ////////////////////////////////////   从服务器获得数据   ////////////////////////////////////
   
    /**获得房间列表 */
    public getRoomList(breakCall:Function)
    {
        MGOBE.Room.getRoomList({
            pageNo: 1,
            pageSize: 10,
        },(event)=>{
            Util.Log("房间列表",event);
            if(event.data)
            {
                breakCall&&breakCall(event.data.roomList)
            }else
            {
                breakCall&&breakCall(null)
            }
        });
    }

    /**获得鬼魂和小孩数量 */
    public getRoleCount (roomInfo: MGOBE.types.RoomInfo): Array<number> {
        let ghost: number = 0;
        let child: number = 0;
        roomInfo.playerList.forEach((value: MGOBE.types.PlayerInfo, index: number) => {
            let fightUserInfo: FightUserInfo = JSON.parse(value.customProfile);
            if (fightUserInfo.role.type == RoleType.ghost) {
                ghost++;
            }
            else {
                child++;
            }
        });
        return [ghost, child];
    }

    /**是否可以加入房间 */
    public isJoinRoom (roomInfo: MGOBE.types.RoomInfo): boolean {
        if (roomInfo.playerList.length >= 2) {
            let count = this.getRoleCount(roomInfo);
            if (count[0] >= 2 && this.gamelogic.gameInfo.currentRole.type == RoleType.ghost) {
                Util.Log("请换一个角色加入房间");
                return false;
            }
            else if (count[1] >= 6 && this.gamelogic.gameInfo.currentRole.type == RoleType.child) {
                Util.Log("请换一个角色加入房间");
                return false;
            }
        }
        return true;
    }

    /**
     * 快速开始游戏
     * @param roomType 根据房间类型
     */
    public onQuickMatch(roomType: RoomType)
    {
        this.getRoomList((roomList: MGOBE.types.RoomInfo[]) => {
            if(roomList) {
                this._roomList = roomList;
                let arr = []
                for(var i = 0;i<this._roomList.length;i++)
                {
                    if(this._roomList[i].type == roomType)
                    {
                        if(!this._roomList[i].isForbidJoin && !this._roomList[i].isPrivate)
                        {
                            if(this._roomList[i].maxPlayers > this._roomList[i].playerList.length)
                            {
                                if(this._roomList[i].frameSyncState == MGOBE.types.FrameSyncState.STOP)
                                {
                                    arr.push(this._roomList[i]);
                                }
                            }
                        }
                    }
                }

                let bool: boolean = false;
                if(arr.length > 0) {
                    let count: number = 0;
                    while (count < this._roomList.length && bool == false) {
                        let index = Util.randomNum(0, arr.length-1);
                        if (this.isJoinRoom(arr[index]) == true) {
                            this.JoinRoom(arr[index].id);
                            bool = true;
                        }
                        count++;
                    }
                }
                if (bool == false) {
                    Util.Log("没有符合条件的房间");
                    this.CreateRoom("恐怖屋",roomType);
                }
            }
            else {
                Util.Log("没有房间创建一个吧");
                this.CreateRoom("恐怖屋",roomType);
            }
        });
    }

    /**匹配成功进入游戏 */
    private onEnterGame() {
        this.sendServerID = new Map<string, number>();
        this.recvServerID = new Map<string, number>();
        for (let index in UnitServerType) {
            this.sendServerID.set(UnitServerType[index], 0);
            this.recvServerID.set(UnitServerType[index], 0);
        };

        this.SendMessage(GameMessage.MGOBE_EnterRoomFinish);
    }

    /**返回玩家信息 */
    public getPlayInfo(id:string):MGOBE.types.PlayerInfo {
        let info:MGOBE.types.PlayerInfo;
        this._roomInfo.playerList.forEach(play => {
            if(play&&play.id == id)
            {
                info = play;
                return play;
            }
        });
        return info;
    }

    /**是否为房主 */
    public isRoomOwner (): boolean {
        return this._roomInfo.owner == MGOBE.Player.id;
    }
    
    /**清空帧数据 */
    public clearFrame() {
        this._frame = null;
    }

    /**获取房间信息 */
    public get roomInfo():MGOBE.types.RoomInfo {
        return this._roomInfo
    }

    /**获得帧信息 */
    public get GameFrame():MGOBE.types.Frame {
        return this._frame;
    }
}