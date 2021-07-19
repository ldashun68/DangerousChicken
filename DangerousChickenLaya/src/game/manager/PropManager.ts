import GameManager from "../../rab/Manager/GameManager";
import { RabManager } from "../../rab/Manager/RabManager";
import Vct3 from "../../rab/model/Vct3";
import Util from "../../rab/Util";
import GameMessage from "../GameMessage";
import Child from "../model/Child";
import { DoorIndex, GameServerCMD, PlayerRoomState, PropType, RoleSkill, SendGameServer, TaskType } from "../model/DataType";
import Role from "../model/Role";
import GameController from "./GameController";

/**
 * 道具管理系统
 */
export default class PropManager extends RabManager {

    /**道具父节点 */
    private prop: Laya.Sprite3D;
    /**钥匙宝箱列表 */
    private keyBoxList: Array<Laya.Sprite3D>;
    /**零件宝箱列表 */
    private partBoxList: Array<Laya.Sprite3D>;
    /**石堆列表 */
    private stonesList: Array<Laya.Sprite3D>;
    /**捕兽夹列表 */
    private trapList: Array<Laya.Sprite3D>;
    
    protected OnInit() {
        this.prop = null;
    }

    /**开始 */
    public start (): void {
        this.prop = GameManager.gameScene3D.scene3D.getChildByName("collider").getChildByName("prop") as Laya.Sprite3D;
        this.keyBoxList = new Array<Laya.Sprite3D>();
        this.partBoxList = new Array<Laya.Sprite3D>();
        this.stonesList = new Array<Laya.Sprite3D>();
        this.trapList = new Array<Laya.Sprite3D>();

        this.createKeyBox();
        Laya.timer.loop(1000*60, this, this.createKeyBox);

        this.createStones();
        Laya.timer.loop(1000*30, this, this.createStones);

        this.createPartBox();

        this.AddListenerMessage(GameMessage.MGOBE_RecvFromGameServer, this.onRecvFromGameServer);
    }

    /**删除道具 */
    public removeProp (): void {
        this.prop = null;
        this.RemoveListenerMessage(GameMessage.MGOBE_RecvFromGameServer, this.onRecvFromGameServer);
        Laya.timer.clearAll(this);
    }

    /**创建捕兽夹 */
    public createTrap (pos: Laya.Vector3): Laya.Sprite3D {
        if (this.prop == null) {
            this.prop = GameManager.gameScene3D.scene3D.getChildByName("collider").getChildByName("prop") as Laya.Sprite3D;
            this.trapList = new Array<Laya.Sprite3D>();
        }
        let trap: Laya.Sprite3D = Laya.loader.getRes("units/Conventional/traps.lh").clone() as Laya.Sprite3D;
        this.prop.addChild(trap);
        trap.name = RoleSkill.Ghost_Trap+this.trapList.length;
        this.syncNode(trap, trap, -1);
        trap.transform.position = pos;
        this.trapList.push(trap);
        return trap;
    }

    public getAllTrap (): Array<Vct3> {
        let list = [];
        if (this.trapList != null) {
            this.trapList.forEach((value: Laya.Sprite3D, index: number) => {
                if (value != null && value.destroyed == false && value.active == true) {
                    list.push(new Vct3(
                        value.transform.position.x,
                        value.transform.position.y,
                        value.transform.position.z
                    ));
                }
            });
        }
        return list;
    }

    private createKeyBox (): void {
        if (GameController.mgobeManager.isRoomOwner() == false) {
            return;
        }

        let keyBoxPos: Laya.Sprite3D = GameManager.gameScene3D.scene3D.getChildByName("keyBoxPos") as Laya.Sprite3D;
        GameController.mgobeManager.sendToGameSvr(GameServerCMD.roleCreateKeyBox, {
            index: this.getRandomPos(keyBoxPos)
        });
    }

    /**创建钥匙宝箱 */
    private _createKeyBox (index: number): void {
        let keyBoxPos: Laya.Sprite3D =  GameManager.gameScene3D.scene3D.getChildByName("keyBoxPos") as Laya.Sprite3D;
        let keyBox: Laya.Sprite3D = Laya.loader.getRes("units/Conventional/box_key.lh").clone() as Laya.Sprite3D;
        this.prop.addChild(keyBox);
        keyBox.name = PropType.keyBox;
        this.syncNode(keyBox, keyBoxPos, index);

        this.keyBoxList.push(keyBox);
        if (this.keyBoxList.length == 3) {
            Laya.timer.clear(this, this.createKeyBox);
        }
        console.log("createKeyBox", this.keyBoxList);
    }

    /**获得钥匙宝箱 */
    private getKeyBox (id: string): void {
        let role: Role = GameController.roleManager.getRole(id);
        this.keyBoxList.forEach((value: Laya.Sprite3D, index: number) => {
            if (value.active == true) {
                let distance: number = Util.getDistanceV3(value.transform.position, role.gameObject.transform.position, "y");
                if (distance < 1 && Math.abs(value.transform.position.y - role.gameObject.transform.position.y) < 2) {
                    value.active = false;
                    let key = GameController.doorManager.findKey();
                    if (key == DoorIndex.blue) {
                        this.SendMessage(GameMessage.GameView_Hint, role.unitInfo.nickName+"拿到了蓝色钥匙");
                    }
                    else if (key == DoorIndex.green) {
                        this.SendMessage(GameMessage.GameView_Hint, role.unitInfo.nickName+"拿到了绿色钥匙");
                    }
                    else if (key == DoorIndex.red) {
                        this.SendMessage(GameMessage.GameView_Hint, role.unitInfo.nickName+"拿到了红色钥匙");
                    }
                    this.SendMessage(GameMessage.GameView_FindBox, PropType.keyBox, key);
                    return;
                }
            }
        });
    }

    private createPartBox (): void {
        if (GameController.mgobeManager.isRoomOwner() == false) {
            return;
        }
        
        let blueBoxPos: Laya.Sprite3D = GameManager.gameScene3D.scene3D.getChildByName("blueBoxPos") as Laya.Sprite3D;
        let greenBoxPos: Laya.Sprite3D = GameManager.gameScene3D.scene3D.getChildByName("greenBoxPos") as Laya.Sprite3D;
        let redBoxPos: Laya.Sprite3D = GameManager.gameScene3D.scene3D.getChildByName("redBoxPos") as Laya.Sprite3D;
        GameController.mgobeManager.sendToGameSvr(GameServerCMD.roleCreatePartBox, {
            arr: [
                this.getRandomPos(blueBoxPos),
                this.getRandomPos(greenBoxPos),
                this.getRandomPos(redBoxPos),
            ]
        });
    }

    /**创建零件宝箱 */
    private _createPartBox (arr: Array<number>): void {
        arr.forEach((value: number, index: number) => {
            let partBoxPos: Laya.Sprite3D;
            if (index == 0) {
                partBoxPos = GameManager.gameScene3D.scene3D.getChildByName("blueBoxPos") as Laya.Sprite3D;
            }
            else if (index == 1) {
                partBoxPos = GameManager.gameScene3D.scene3D.getChildByName("greenBoxPos") as Laya.Sprite3D;
            }
            else if (index == 2) {
                partBoxPos = GameManager.gameScene3D.scene3D.getChildByName("redBoxPos") as Laya.Sprite3D;
            }

            let partBox: Laya.Sprite3D = Laya.loader.getRes("units/Conventional/box_part.lh").clone() as Laya.Sprite3D;
            this.prop.addChild(partBox);
            partBox.name = PropType.partBox;
            this.syncNode(partBox, partBoxPos, value);
    
            this.partBoxList.push(partBox);
        });
        
        console.log("createPartBox", this.partBoxList);
    }

    /**获得零件宝箱 */
    private getPartBox (id: string): void {
        let role: Role = GameController.roleManager.getRole(id);
        this.partBoxList.forEach((value: Laya.Sprite3D, index: number) => {
            if (value.active == true) {
                let distance: number = Util.getDistanceV3(value.transform.position, role.gameObject.transform.position, "y");
                if (distance < 1 && Math.abs(value.transform.position.y - role.gameObject.transform.position.y) < 2) {
                    value.active = false;
                    let part = GameController.doorManager.findPart();
                    this.SendMessage(GameMessage.GameView_Hint, role.unitInfo.nickName+"拿到了逃亡零件");
                    this.SendMessage(GameMessage.GameView_FindBox, PropType.partBox, part);
                    if (id == MGOBE.Player.id) {
                        this.SendMessage(GameMessage.Role_Task, TaskType.Child_GetPart);
                    }
                    return;
                }
            }
        });
    }

    private createStones (): void {
        if (GameController.mgobeManager.isRoomOwner() == false) {
            return;
        }

        let stonePos: Laya.Sprite3D = GameManager.gameScene3D.scene3D.getChildByName("stonePos") as Laya.Sprite3D;
        GameController.mgobeManager.sendToGameSvr(GameServerCMD.roleCreateStones, {
            index: this.getRandomPos(stonePos)
        });
    }

    /**创建石堆 */
    private _createStones (index: number): void {
        let stonePos: Laya.Sprite3D =  GameManager.gameScene3D.scene3D.getChildByName("stonePos") as Laya.Sprite3D;
        let stones: Laya.Sprite3D = Laya.loader.getRes("units/Conventional/stones.lh").clone() as Laya.Sprite3D;
        this.prop.addChild(stones);
        stones.name = PropType.stones;
        this.syncNode(stones, stonePos, index);

        this.stonesList.push(stones);
        if (this.stonesList.length == 6) {
            Laya.timer.clear(this, this.createStones);
        }
        console.log("createStones", this.stonesList);
    }

    /**获得石堆 */
    private getStones (id: string): void {
        let role: Role = GameController.roleManager.getRole(id);
        this.stonesList.forEach((value: Laya.Sprite3D, index: number) => {
            if (value.active == true) {
                let distance: number = Util.getDistanceV3(value.transform.position, role.gameObject.transform.position, "y");
                if (distance < 1 && Math.abs(value.transform.position.y - role.gameObject.transform.position.y) < 2) {
                    value.active = false;
                    (role as Child).findStone();
                    return;
                }
            }
        });
    }

    /**获得随机坐标 */
    private getRandomPos (nodePos: Laya.Sprite3D): number {
        let item: Laya.Sprite3D;
        let bool = true;
        let index: number = 0;
        while (bool == true) {
            index = Util.random(nodePos.numChildren-1);
            item = nodePos.getChildAt(index) as Laya.Sprite3D;

            bool = false;
            this.keyBoxList.forEach((value: Laya.Sprite3D) => {
                if (Laya.Vector3.equals(value.transform.position, item.transform.position) == true) {
                    bool = true;
                    return;
                }
            });
        }
        return index;
    }

    /**同步节点 */
    private syncNode (node: Laya.Sprite3D, posNode: Laya.Sprite3D, index: number): void {
        node.transform.position = new Laya.Vector3();
        node.transform.localPosition = new Laya.Vector3();
        node.transform.rotationEuler = new Laya.Vector3();
        node.transform.localRotationEuler = new Laya.Vector3();

        if (index >= 0 && index < posNode.numChildren) {
            let item: Laya.Sprite3D = posNode.getChildAt(index) as Laya.Sprite3D;
            node.transform.position = item.transform.position;
            node.transform.rotationEuler = item.transform.rotationEuler;
        }
    }

    /**收到服务器返回 */
    private onRecvFromGameServer(data:SendGameServer)
    {
        if(GameController.gameStateManager.ME == PlayerRoomState.gameEnd) return;
        if (data) {
            if (data.cmd == GameServerCMD.roleCreateKeyBox) {
                this._createKeyBox(data.data.index);
            }
            else if (data.cmd == GameServerCMD.roleGetKeyBox) {
                this.getKeyBox(data.sendPlayid);
            }
            else if (data.cmd == GameServerCMD.roleCreatePartBox) {
                this._createPartBox(data.data.arr);
            }
            else if (data.cmd == GameServerCMD.roleGetPartBox) {
                this.getPartBox(data.sendPlayid);
            }
            else if (data.cmd == GameServerCMD.roleCreateStones) {
                this._createStones(data.data.index);
            }
            else if (data.cmd == GameServerCMD.roleGetStones) {
                this.getStones(data.sendPlayid);
            }
        }
    }
}