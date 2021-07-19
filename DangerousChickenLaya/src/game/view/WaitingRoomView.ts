import GameManager from "../../rab/Manager/GameManager";
import RabView from "../../rab/RabView";
import GameMessage from "../GameMessage";
import GameController from "../manager/GameController";
import { PlayerRoomState, SendGameServer } from "../model/DataType";
import ViewConfig from "../ViewConfig";

export default class WaitingRoomView extends RabView {
    
    protected _view: fgui.GComponent;
    private camera:Laya.Camera;
    private downcountTime: number;

    protected OnInit() {
        this._path = "res/UI/WaitingRoom";
        this. _pkgName = "WaitingRoom";
        this. _resName = "Main";
    }

    onResize() {
        let scaleX = Laya.stage.width/Laya.stage.designWidth;
        
        for (let index: number = 0; index < this._view.numChildren; index++) {
            this._view.getChildAt(index).x *= scaleX;
        }
    }

    protected InitView() {
        this.camera = GameManager.gameScene3D.camera;
        GameManager.uimanager.onCreateView(ViewConfig.JoystickView);

        this._view.displayObject.mouseThrough = true;
        this._view.getChild("timeText").visible = false;

        this._view.getChild("leaveButton").onClick(this, ()=>{
            GameController.leaveRoom();
        });

        this._view.getChild("startButton").visible = GameController.mgobeManager.isRoomOwner();
        this._view.getChild("startButton").onClick(this, ()=>{
            if (this.isStartGame() == true && this._view.getChild("startButton").visible == true) {
                this._view.getChild("startButton").visible = false;
                GameController.mgobeManager.changeRoom(true);
                GameController.mgobeManager.sendToGameSvr(GameMessage.GameMessage_LoadProgess, {});
            }
        });


        this.updateRoom();
        this.AddListenerMessage(GameMessage.MGOBE_EnterRoomFinish, this.updateRoom);
        this.AddListenerMessage(GameMessage.MGOBE_JoinRoom, this.joinRoom);
        this.AddListenerMessage(GameMessage.MGOBE_LeaveRoom, this.leaveRoom);
        this.AddListenerMessage(GameMessage.MGOBE_ChangeRoomOwner, this.changeRoomOwner, this);
        this.AddListenerMessage(GameMessage.MGOBE_RecvFromGameServer, this.RecvFromGameServer);

        GameController.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.waitingRoom);
    }

    /**玩家自己进入房间 */
    private updateRoom (): void {
        let room = GameController.mgobeManager.roomInfo;
        this._view.getChild("roleCountText").text = room.playerList.length+"/"+room.maxPlayers;
    }

    /**其他玩家进入房间 */
    private joinRoom (joinPlayerId: string): void {
        if (joinPlayerId == MGOBE.Player.id) {
            return;
        }

        let playinfo: MGOBE.types.PlayerInfo = GameController.mgobeManager.getPlayInfo(joinPlayerId);
        GameController.roleManager.joinPlayerId.push(joinPlayerId);
        GameController.roleManager.addRole(playinfo, false);
        this.updateRoom();
    }

    /**其他玩家离开房间 */
    private leaveRoom (leavePlayerId: string): void {
        if (leavePlayerId == MGOBE.Player.id) {
            return;
        }

        GameController.roleManager.removeRole(leavePlayerId);
        this.updateRoom();
    }

    private changeRoomOwner (): void {
        if (GameController.mgobeManager.isRoomOwner() == true) {
            this._view.getChild("startButton").visible = true;
        }
    }


    /**是否可以开始游戏 */
    private isStartGame (): boolean {
        let bool = true;
        let room = GameController.mgobeManager.roomInfo;
        let count = GameController.mgobeManager.getRoleCount(room);
        // 大于等于6个玩家时，需要2个鬼魂
        if (room.playerList.length >= 6 && count[0] == 2) {
            bool = true;
        }
        // 大于等于4个玩家时，需要1个鬼魂
        else if (room.playerList.length >= 4 && count[0] == 1) {
            bool = true;
        }
        if (bool == true) {
            bool = GameController.gameStateManager.isNextState(PlayerRoomState.waitingRoom);
        }
        return bool;
    }

    private startDowncount (): void {
        this.downcountTime = 3;
        this._view.getChild("timeText").asTextField.text = ""+this.downcountTime;
        this._view.getChild("timeText").visible = true;
        this._view.getChild("leaveButton").visible = false;

        Laya.timer.clear(this, this.downcount);
        Laya.timer.loop(1000, this, this.downcount);
    }

    private downcount (): void {
        this.downcountTime--;
        if (this.downcountTime == 0) {
            this.startGame();
            Laya.timer.clear(this, this.downcount);
        }
        else {
            this._view.getChild("timeText").asTextField.text = ""+this.downcountTime;
        }
    }

    private startGame (): void {
        this.OnCloseView();
        
        GameManager.uimanager.onCreateView(ViewConfig.LoadingView);
    }

    private RecvFromGameServer (data: SendGameServer): void {
        if(GameController.gameStateManager.ME == PlayerRoomState.gameEnd) return;
        if (data) {
            if (data.cmd == GameMessage.GameMessage_LoadProgess) {
                this.startDowncount();
            }
        }
    }

    onDestroy () {
        super.onDestroy();

        // 开始游戏和离开房间都需要执行
        GameManager.uimanager.onCloseView(ViewConfig.JoystickView);
        GameController.roleManager.removeRole(null);
        GameManager.gameScene3D.onRemoveScene();
    }
}