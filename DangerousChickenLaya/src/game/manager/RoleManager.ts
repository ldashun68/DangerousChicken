import GameLogicManager from "../../rab/Manager/GameLogicManager";
import GameManager from "../../rab/Manager/GameManager";
import { RabManager } from "../../rab/Manager/RabManager";
import Vct3 from "../../rab/model/Vct3";
import { Queue } from "../../rab/Queue";
import Util from "../../rab/Util";
import GameMessage from "../GameMessage";
import Child from "../model/Child";
import { AttackMessage, FightUserInfo, FrameSyncRoleData, GameServerCMD, PlayerRoomState, RoleState, RoleType, SendGameServer } from "../model/DataType";
import Ghost from "../model/Ghost";
import Role from "../model/Role";
import ViewConfig from "../ViewConfig";
import GameController from "./GameController";

/**
 * 角色管理系统
 */
export default class RoleManager extends RabManager {

    private roleList: Map<string, Role>;
    private me: Role;
    private scene3D: Laya.Scene3D;
    private camera: Laya.Camera;
    private _frame:Queue<MGOBE.types.Frame>;

    /**新加入玩家 */
    public joinPlayerId: Array<string>;
    /**是否执行帧循环 */
    private isLoop: boolean;

    protected OnInit() {
        Util.Log("初始化玩家管理器");

        this.isLoop = false;
        this.roleList = new Map<string,Role>();
        this.joinPlayerId = [];
        
        Laya.timer.loop(60/1000, this, this.update);
        this._frame = new Queue<MGOBE.types.Frame>();
        GameController.mgobeManager.OnreceiveFrameMessage("RoleManager",this.onFrameHandler.bind(this))

        this.AddListenerMessage(GameMessage.MGOBE_GameOffLine, this.offLine);
        this.AddListenerMessage(GameMessage.MGOBE_GameOnLine, this.addRole);
        this.AddListenerMessage(GameMessage.MGOBE_RecvFromGameServer, this.onRecvFromGameServer);
    }

    /**
     * 添加角色
     * @param playinfo 
     * @param isOwner 
     */
    public addRole(playinfo:MGOBE.types.PlayerInfo, isOwner:boolean): void
    {
        // 断线重连时
        if (GameManager.gameScene3D.scene3D == null) {
            GameController.gameOver();
            return;
        }

        if (playinfo == null) {
            for(var i = 0;i<GameController.mgobeManager.roomInfo.playerList.length;i++) {
                let player = GameController.mgobeManager.roomInfo.playerList[i];
                if (this.roleList.has(player.id) == false) {
                    this.addRole(player, (player.id == MGOBE.Player.id));
                }
            }
            return;
        }

        this.isLoop = true;
        this.scene3D = GameManager.gameScene3D.scene3D;
        this.camera = GameManager.gameScene3D.camera;

        let fightUserInfo: FightUserInfo = JSON.parse(playinfo.customProfile) as FightUserInfo;
        let path = GameController.resourceManager.getRolePath(fightUserInfo.role);
        if (Laya.loader.getRes(path) == null) {
            Laya.loader.create(path, Laya.Handler.create(this, () => {
                this.addRole(playinfo, isOwner);
            }));
            return;
        }
        let _sp = this.scene3D.addChild(Laya.loader.getRes(path).clone()) as Laya.Sprite3D;
        let role: Role;

        // 相机调整放入角色类
        if (isOwner == true) {
            _sp.addChild(this.camera);
        }

        // 赋值坐标
        let pos: Laya.Vector3;
        if (GameController.gameStateManager.ME < PlayerRoomState.gameLoading) {
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
                pos = new Laya.Vector3(pos.x+Math.random()*6-2, pos.y, pos.z+Math.random()*6-3);
            }
        }
        _sp.transform.position = pos;

        // 生成角色脚本
        if (fightUserInfo.role.type == RoleType.child) {
            role = _sp.addComponentIntance(new Child(fightUserInfo));
        }
        else {
            role = _sp.addComponentIntance(new Ghost(fightUserInfo));
        }
        this.roleList.set(playinfo.id, role);
        if (isOwner == true) {
            this.me = role;

            // 添加门组件
            if (GameController.gameStateManager.ME >= PlayerRoomState.gameLoading) {
                GameController.doorManager.create();
            }
        }
        else {
            role.gameObject.transform.position = new Laya.Vector3(100, 100, 100);
            role.OnChangeEntityState(RoleState.idle);
        }

        if (GameController.gameStateManager.ME < PlayerRoomState.gameLoading) {
            // 新玩家加入时，所有玩家同步坐标
            if (this.roleList.size == GameController.mgobeManager.roomInfo.playerList.length && this.joinPlayerId.length == 0
                && GameController.mgobeManager.roomInfo.playerList.length > 1) {
                    GameController.mgobeManager.sendToGameSvr(GameMessage.Role_Sync, {});
                }
        }
    }

    /**删除角色 */
    public removeRole (id: string): void {
        if (GameController.gameStateManager.ME <= PlayerRoomState.gameLoading) {
            if (id != null && this.roleList.has(id) == true) {
                this.roleList.get(id).onDestroy();
                this.roleList.delete(id);

                // 若是我退出
                if (id == MGOBE.Player.id) {
                    this.joinPlayerId = [];
                }
            }
            else {
                this.isLoop = false;
                this.roleList.forEach((value: Role, key: string) => {
                    this.removeRole(value.unitInfo.id);
                });
            }
        }
    }

    private offLine (id: string) {
        if (GameController.gameStateManager.ME < PlayerRoomState.gameLoading) {
            this.removeRole(id);
        }

        if (id == MGOBE.Player.id) {
            GameController.leaveRoom();
        }
    }

    /**获得我控制的角色 */
    public get ME (): Role {
        return this.me;
    }

    /**获得角色 */
    public getRole (id: string): Role {
        return this.roleList.get(id);
    }

    /**获得所有小孩 */
    public getAllChild (): Array<Child> {
        let list: Array<Child> = [];
        this.roleList.forEach((value: Role, key: string) => {
            if (value.unitInfo.type == RoleType.child) {
                list.push(value as Child); 
            }
        });
        return list;
    }

    /**获得所有鬼魂 */
    public getAllGhost (): Array<Ghost> {
        let list: Array<Ghost> = [];
        this.roleList.forEach((value: Role, key: string) => {
            if (value.unitInfo.type == RoleType.ghost) {
                list.push(value as Ghost); 
            }
        });
        return list;
    }

    /**救援 */
    private rescue (): void {
        let rescuePos = GameManager.gameScene3D.scene3D.getChildByName("rescuePos") as Laya.Sprite3D;
        let list: Array<Child> = this.getAllChild();
        list.forEach((value: Child, index: number) => {
            if (value.isCage == true) {
                let pos = Util.getNewVector3((rescuePos.getChildAt(index) as Laya.Sprite3D).transform.position);
                value.gameObject.transform.position = pos;
                value.prior = pos;
                value.isCage = false;
            }
        });
    }

    /**是否需要救援 */
    public isRscue (): boolean {
        let bool = false;
        let list: Array<Child> = this.getAllChild();
        list.forEach((value: Child, index: number) => {
            if (value.isCage == true) {
                bool = true;
                return;
            }
        });
        return bool;
    }

    /**是否鬼魂胜利 */
    public isGhostWin (): boolean {
        let bool = true;
        let list: Array<Child> = this.getAllChild();
        list.forEach((value: Child, index: number) => {
            if (value.isCage == false) {
                bool = false;
                return;
            }
        });

        if (bool == true) {
            this.SendMessage(GameMessage.GameMessage_GameEnd);
        }
        return bool;
    }

    /**是否小孩胜利 */
    public isChildWin (): void {
        let isCage = 0;
        let isSafe = 0;
        let list: Array<Child> = this.getAllChild();
        list.forEach((value: Child, index: number) => {
            if (value.isCage == true) {
                isCage++;
            }
            else if (value.currentState == RoleState.safe) {
                isSafe++;
            }
        });

        if (isCage+isSafe == list.length) {
            this.SendMessage(GameMessage.GameMessage_GameEnd);
        }
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

    private onFrameHandler(frame:MGOBE.types.Frame)
    {
        this._frame.push(frame);
    }
    
    /**
     * 帧同步处理
     */
    private onFrameLoop() {
        let frame = this._frame.pop()
        if(GameController.mgobeManager) {
            if(frame) {
                frame.items.forEach(item => {
                    this.setPlayerData(item.playerId, (item.data as FrameSyncRoleData));
                });
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
        if(playerId == MGOBE.Player.id) return;
        if (data.id.indexOf("player") != -1) {
            data.id = data.id.replace("player", "");
            if(this.roleList.has(playerId)) {
                this.roleList.get(playerId).setServerData(data);
            }

            // this.sendRolePosition();
        }
    }
 
    /**收到服务器返回 */
    private onRecvFromGameServer (data: SendGameServer) {
        if(GameController.gameStateManager.ME == PlayerRoomState.gameEnd) return;
        if (data) {
            if (data.cmd == GameMessage.Role_Sync) {
                this.me.move(0);
                
                if (this.joinPlayerId.length != 0) {
                    // 接收到新用户的同步信息
                    let index: number = this.joinPlayerId.indexOf(data.sendPlayid);
                    if (index != -1) {
                        this.joinPlayerId.splice(index, 1);
                        let propData = {};
                        if (GameController.mgobeManager.isRoomOwner() == true) {
                            // 若是房主，同步道具信息
                            propData = {
                                trap: GameController.propManager.getAllTrap(),
                            }
                        }
                        GameController.mgobeManager.sendToGameSvr(GameMessage.Role_Sync, propData);
                    }
                }
            }
            else if (data.cmd == GameMessage.Role_Skill) {
                //this.roleList.get(data.sendPlayid).OnChangeEntityState(RoleState.skill, true);
            }
            else if (data.cmd == GameServerCMD.roleHit) {
                let attackMessage: AttackMessage = data.data;
                if (this.roleList.get(attackMessage.injuredID).unitInfo.type == RoleType.child) {
                    this.roleList.get(attackMessage.injuredID).OnChangeEntityState(RoleState.death, true);
                }
                else {
                    this.roleList.get(attackMessage.injuredID).OnChangeEntityState(RoleState.hit, true);
                }
            }
            else if (data.cmd == GameServerCMD.roleRescue) {
                this.rescue();
            }
        }
    }
}