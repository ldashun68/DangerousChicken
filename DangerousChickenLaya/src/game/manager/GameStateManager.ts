
import { RabManager } from "../../rab/Manager/RabManager";
import Util from "../../rab/Util";
import GameController from "./GameController";
import GameMessage from "../GameMessage";
import { PlayerRoomState } from "../model/DataType";

/**
 * 状态管理器 这里管理游戏整体的状态
 */
export default class GameStateManager extends RabManager {

    /**我的状态 */
    private _playerRoomState:PlayerRoomState;
    /**所有玩家状态 */
    private allPlayerRoomState:Map<string,roomState>; 

    protected OnInit() {
        this.allPlayerRoomState = new Map<string,roomState>();
        this._playerRoomState = PlayerRoomState.hall;

        this.AddListenerMessage(GameMessage.MGOBE_LeaveRoom, this.leaveRoom);
    }

    /**游戏状态 */
    public get ME ():PlayerRoomState
    {
        return this._playerRoomState;
    }

    /**
     * 设置状态 
     * @param id 用户id
     * @param state 状态
     */
    public setRoomState(id:string,state:PlayerRoomState)
    {
        if (this.allPlayerRoomState.has(id) == false) {
            let roomState: roomState = {
                state: state,
                id: id
            };
            this.allPlayerRoomState.set(id, roomState);
        }
        else {
            this.allPlayerRoomState.get(id).state = state;
        }

        if (id == MGOBE.Player.id) {
            this._playerRoomState = state;
        }
        //TODO:这里状态暂时是自己管理自己的
        switch(state)
        {
            case PlayerRoomState.hall:
                //大厅
            break;
            case PlayerRoomState.waitingRoom:
                //等待房间
            break;
            case PlayerRoomState.gameLoading:
                //进入游戏中
                Laya.timer.frameLoop(1, this, this.enterGameRoom);
            break;
            case PlayerRoomState.gameStart:
                //开始游戏
                Laya.timer.frameLoop(1, this, this.startGame);
            break;
            case PlayerRoomState.gameing:
                //游戏进行中
            break;
            case PlayerRoomState.gameEnd:
                //游戏结束
            break;
        }
    }

    /**玩家离开房间 */
    private leaveRoom (): void {
        let room = GameController.mgobeManager.roomInfo;
        room.playerList.forEach((value: MGOBE.types.PlayerInfo, index: number) => {
            if (this.allPlayerRoomState.has(value.id) == false) {
                this.allPlayerRoomState.delete(value.id);
            }
        });
    }

    /**进入游戏房间 */
    private enterGameRoom (): void {
        if (this.isNextState(PlayerRoomState.gameLoading) == true) {
            this.SendMessage(GameMessage.GameMessage_LoadingEnd);
            Laya.timer.clear(this, this.enterGameRoom);
        }
    }

    /**开始游戏 */
    private startGame (): void {
        if (this.isNextState(PlayerRoomState.gameStart) == true) {
            this.SendMessage(GameMessage.GameMessage_GameStart);
            Laya.timer.clear(this, this.startGame);
        }
    }

    /**
     * 是否开始下一g状态
     * @param state 
     * @returns 
     */
    private isNextState(state:PlayerRoomState): boolean
    {
        let count: number = 0;
        this.allPlayerRoomState.forEach(element => {
            if (element.state != state) {
                count += 1;
            }
        });
        return (count == 0);
    }
}

export interface roomState {
    state:PlayerRoomState
    id:string
}