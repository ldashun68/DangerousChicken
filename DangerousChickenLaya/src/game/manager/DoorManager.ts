import GameManager from "../../rab/Manager/GameManager";
import { RabManager } from "../../rab/Manager/RabManager";
import Util from "../../rab/Util";
import GameMessage from "../GameMessage";
import { DoorIndex, GameServerCMD, PlayerRoomState, SendGameServer, TaskType } from "../model/DataType";
import Door from "../model/Door";
import Role from "../model/Role";
import GameController from "./GameController";

/**
 * 门管理系统
 */
export default class DoorManager extends RabManager {

    /**门列表 */
    private doorList: Array<Door>;
    /**钥匙列表 */
    private keyList: Array<boolean>;
    /**钥匙数量 */
    private keyCount: Array<number>;
    /**零件列表 */
    private partList: Array<boolean>;
    /**零件数量 */
    private partCount: Array<number>;
    /**是否打开大门 */
    public isOpenDoor: boolean;
    
    protected OnInit() {
        this.doorList = new Array<Door>();
        this.isOpenDoor = false;

        this.AddListenerMessage(GameMessage.MGOBE_RecvFromGameServer, this.onRecvFromGameServer);
    }

    public create (): void {
        this.keyCount = [0, 1, 2];
        this.keyList = [false, false, false];
        this.partCount = [0, 1, 2];
        this.partList = [false, false, false];

        this.doorList = new Array<Door>();
        this.isOpenDoor = false;
        let door: Laya.Sprite3D = GameManager.gameScene3D.scene3D.getChildByName("gameroom") as Laya.Sprite3D;
        door = GameController.roleManager.ME.findChild(door, "map_Escape3/F_DoorType");
        for (let index: number = 0; index < door.numChildren; index++) {
            let item = door.getChildAt(index);
            if (item.name == "door_blue" || item.name == "door_green" || item.name == "door_red" || item.name == "door_iron") {
                let _door: Door = item.addComponent(Door);
                _door.closeDoor();
                this.doorList.push(_door);
            }
        }
    }

    /**找到钥匙 */
    public findKey (): number {
        let index = Util.random(this.keyCount.length);
        let value = this.keyCount[index];
        this.keyList[value] = true;
        this.keyCount.splice(index, 1);
        return value;
    }

    /**找到零件 */
    public findPart (): number {
        let value = this.partCount[0];
        this.partList[value] = true;
        this.partCount.splice(0, 1);
        return 2-this.partCount.length;
    }

    /**是否有钥匙 */
    public isHaveKey (index: number): boolean {
        return this.keyList[index];
    }

    /**是否有零件 */
    public isHavePart (): boolean {
        return this.partList.indexOf(false) != -1;
    }

    private openIronDoor (id: string): void {
        let role: Role = GameController.roleManager.getRole(id);
        this.doorList.forEach((value: Door, index: number) => {
            if (value.getIsOpen() == false) {
                let distance: number = Util.getDistanceV3(value.transform.position, role.gameObject.transform.position, "y");
                if (distance < 10 && Math.abs(value.transform.position.y - role.gameObject.transform.position.y) < 1) {
                    value.openDoor();
                    return;
                }
            }
        });
    }

    /**收到服务器返回 */
    private onRecvFromGameServer(data:SendGameServer)
    {
        if(GameController.gameStateManager.ME == PlayerRoomState.gameEnd) return;
        if (data) {
            if (data.cmd == GameServerCMD.roleSpanner) {
                this.openIronDoor(data.sendPlayid);
                this.isOpenDoor = true;
                if (data.sendPlayid == MGOBE.Player.id) {
                    this.SendMessage(GameMessage.Role_Task, TaskType.Child_EscapeSuccess);
                }
            }
        }
    }
}