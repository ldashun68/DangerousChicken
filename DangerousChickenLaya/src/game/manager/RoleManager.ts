import GameManager from "../../rab/Manager/GameManager";
import { RabManager } from "../../rab/Manager/RabManager";
import Util from "../../rab/Util";
import GameMessage from "../GameMessage";
import Child from "../model/Child";
import { FightUserInfo, FrameSyncRoleData, GameServerCMD, PlayerRoomState, RoleType, SendGameServer } from "../model/DataType";
import Ghost from "../model/Ghost";
import Role from "../model/Role";
import GameController from "./GameController";

/**
 * 角色管理系统
 */
export default class RoleManager extends RabManager {

    private roleList: Map<string, Role>;
    private me: Role;
    private scene3D: Laya.Scene3D;
    private camera: Laya.Camera;
    /**帧ID */
    private frameId: number;

    /**是否执行帧循环 */
    public isLoop: boolean;

    protected OnInit() {
        this.frameId = 0;
        this.isLoop = true;
        Util.Log("初始化玩家管理器");
        this.scene3D = GameManager.gameScene3D.scene3D;
        this.camera = GameManager.gameScene3D.camera;
        this.roleList = new Map<string,Role>();

        //初始化角色对象
        for(var i = 0;i<GameController.mgobeManager.roomInfo.playerList.length;i++) {
            let player = GameController.mgobeManager.roomInfo.playerList[i];
            if(player.id == MGOBE.Player.id) {
                //这是自己
                this.me = this.loadRole(player, true);
            }
            else {
                //其他人
                this.loadRole(player, false)
            }
        }
        
        GameController.mgobeManager.startFrameSync();

        Laya.timer.loop(60/1000, this, this.update);

        this.AddListenerMessage(GameMessage.MGOBE_RecvFromGameServer, this.onRecvFromGameServer);
    }

    /**
     * 加载显示角色
     * @param playinfo 
     * @param isOwner 
     */
    private loadRole(playinfo:MGOBE.types.PlayerInfo,isOwner:boolean): any
    {
        let fightUserInfo: FightUserInfo = JSON.parse(playinfo.customProfile) as FightUserInfo;
        let path = GameController.resourceManager.getRolePath(fightUserInfo.role);
        var _sp = this.scene3D.addChild(Laya.loader.getRes(path).clone()) as Laya.Sprite3D;

        // 相机调整放入角色类
        if (isOwner == true) {
            _sp.addChild(this.camera);
        }

        // 赋值坐标
        let pos: Laya.Vector3;
        if (GameController.gameStateManager.ME == PlayerRoomState.hall) {
            pos = (this.scene3D.getChildByName("rolePos") as Laya.Sprite3D).transform.position;
            pos = new Laya.Vector3(pos.x+Math.random()*6-3, pos.y, pos.z+Math.random()*6-3);
        }
        else {
            if (fightUserInfo.role.type == RoleType.child) {
                pos = (this.scene3D.getChildByName("childPos") as Laya.Sprite3D).transform.position;
                pos = new Laya.Vector3(pos.x+Math.random()*6-3, pos.y, pos.z+Math.random()*6-3);
            }
            else {
                pos = (this.scene3D.getChildByName("ghostPos") as Laya.Sprite3D).transform.position;
                pos = new Laya.Vector3(pos.x+Math.random()*6-2, pos.y, pos.z+Math.random()*6-2);
            }
        }
        _sp.transform.position = pos;

        // 生成角色脚本
        let role: Role;
        if (fightUserInfo.role.type == RoleType.child) {
            role = _sp.addComponentIntance(new Child(fightUserInfo));
        }
        else {
            role = _sp.addComponentIntance(new Ghost(fightUserInfo));
        }
        this.roleList.set(playinfo.id, role);
        return role;
    }

    /**获得我控制的角色 */
    public get ME (): Role {
        return this.me;
    }

    //------------------------------------------------消息------------------------------------------------

    private update()
    {
        if (this.isLoop == true) {
            this.onFrameLoop();
            this.roleList.forEach((value: Role, key: string) => {
                value.onUpdateentity();
            });
        }
    }
    
    /**
     * 帧同步处理
     */
    private onFrameLoop()
    {
        if(GameController.mgobeManager)
        {
            var frame:MGOBE.types.Frame = GameController.mgobeManager.GameFrame;
            if(frame)
            {
                if(this.frameId != frame.id && frame.id > this.frameId)
                {
                    this.frameId = frame.id;
                    frame.items.forEach(item => {
                        this.setPlayerData(item.playerId, (item.data as FrameSyncRoleData));
                    });
                }
            }
        }
    }
 
    /**
     * 处理帧同步数据
     * @param playerId 
     * @param data 
     */
    private setPlayerData(playerId:string,data:FrameSyncRoleData)
    {
        if (data.id.indexOf("player") != -1) {
            data.id = data.id.replace("player", "");
            if(this.roleList.has(playerId) && playerId != MGOBE.Player.id) {
                this.roleList.get(playerId).setServerData(data);
            }

            // this.sendRolePosition();
        }
    }
 
    /**收到服务器返回 */
    private onRecvFromGameServer(data:SendGameServer)
    {
        if(GameController.gameStateManager.ME == PlayerRoomState.gameEnd) return;
        // Util.Log("收到服务器返回",data)
        if(data ) {
            if (data.cmd == GameServerCMD.roleHit) {
            
            }
        }
    }
}