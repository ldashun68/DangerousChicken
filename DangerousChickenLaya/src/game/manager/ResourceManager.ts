import GameManager from "../../rab/Manager/GameManager";
import { RabManager } from "../../rab/Manager/RabManager";
import { FightUserInfo, JsonList, RoleType, UserCurrentRole } from "../model/DataType";
import GameController from "./GameController";

/**
 * 资源管理器
 */
export default class ResourceManager extends RabManager {
    
    /**鬼魂 */
    private _ghost:Array<string>;
    /**小孩 */
    private _child:Array<string>;

    protected OnInit() {
        let role: Array<string> = GameManager.gameLogicManager.getJsonData(JsonList.RoleModelIndex);
        this._ghost = role["ghost"];
        this._child = role["child"];
    }

    /**获得所有鬼魂资源路径 */
    public get ghost (): Array<string> {
        return this._ghost;
    }

    /**获得鬼魂资源路径 */
    public getGhostPath(role: number):string
    {
        return this._ghost[role];
    }

    /**获得所有小孩资源路径 */
    public get child (): Array<string> {
        return this._child;
    }

    /**获得小孩资源路径 */
    public getChildPath (role: number):string
    {
        return this._child[role];
    }

    /**获得等待房间资源路径 */
    public getWaitingRoomPath ():Array<string>
    {
        return [
            "3dscene/waitingroom/Conventional/waitingroom.ls",
            "units/Conventional/box_key.lh",
            "units/Conventional/box_part.lh",
            "units/Conventional/key_blue.lh",
            "units/Conventional/key_green.lh",
            "units/Conventional/key_red.lh",
            "units/Conventional/key_yellow.lh",
            "units/Conventional/stone.lh",
            "units/Conventional/stones.lh",
            "units/Conventional/traps.lh",
            "units/Conventional/shield.lh",
        ];
    }

    /**获得游戏房间资源路径 */
    public getGameRoomPath ():string
    {
        return "3dscene/gameroom1/Conventional/gameroom1.ls";
    }

    /**获得角色资源路径 */
    public getRolePath (role: UserCurrentRole): string
    {
        if (role.type == RoleType.ghost) {
            return this.getGhostPath(role.id);
        }
        else {
            return this.getChildPath(role.id);
        }
    }

    /**获得角色资源全部路径 */
    public getRoleAllPath (role: UserCurrentRole): Array<string>
    {
        if (role.type == RoleType.ghost) {
            return this._ghost;
        }
        else {
            return this._child;
        }
    }

    /**获得等待房间所需的全部资源路径 */
    public getWaitingRoomAllPath (): Array<string>
    {
        let arr:Array<string> = this.getWaitingRoomPath();
        
        let room = GameController.mgobeManager.roomInfo;
        room.playerList.forEach((value: MGOBE.types.PlayerInfo, index: number) => {
            arr.push(this.getRolePath((JSON.parse(value.customProfile) as FightUserInfo).role));
        });
        return arr;
    }
}