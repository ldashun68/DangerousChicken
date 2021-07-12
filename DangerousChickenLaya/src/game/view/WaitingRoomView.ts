import GameManager from "../../rab/Manager/GameManager";
import RabView from "../../rab/RabView";
import GameMessage from "../GameMessage";
import GameController from "../manager/GameController";
import RoleManager from "../manager/RoleManager";
import { PlayerRoomState } from "../model/DataType";
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

        this._view.getChild("LeaveRoom").onClick(this, ()=>{
            GameController.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.hall);
            GameController.leaveRoom();
        });

        if (GameController.mgobeManager.isRoomOwner() == true) {
            this._view.getChild("GameStart").onClick(this, ()=>{
                if (this.isStartGame() == true && this._view.getChild("GameStart").visible == true) {
                    GameController.mgobeManager.changeRoom(true);
                    this.downcountTime = 3;
                    this._view.getChild("timeText").asTextField.text = ""+this.downcountTime;
                    this._view.getChild("timeText").visible = true;
        
                    Laya.timer.clear(this, this.downcount);
                    Laya.timer.loop(1000, this, this.downcount);
                }
                this._view.getChild("GameStart").visible = false;
            });
        }
        else {
            this._view.getChild("GameStart").visible = false;
        }

        GameController.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.waitingRoom);

        this.updateRoom();
        this.AddListenerMessage(GameMessage.MGOBE_EnterRoomFinish, this.updateRoom);
        this.AddListenerMessage(GameMessage.MGOBE_LeaveRoom, this.updateRoom);
    }

    private updateRoom (): void {
        let room = GameController.mgobeManager.roomInfo;
        this._view.getChild("roleCountText").text = room.playerList.length+"/"+room.maxPlayers;
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
        return bool;
    }

    private downcount (): void {
        this.downcountTime--;
        if (this.downcountTime == 0) {
            this.startGame();
        }
        else {
            this._view.getChild("timeText").asTextField.text = ""+this.downcountTime;
        }
    }

    private startGame (): void {
        this.OnCloseView();

        GameManager.uimanager.onCreateView(ViewConfig.LoadingView);

        Laya.timer.clear(this, this.downcount);
    }

    onDestroy () {
        GameManager.uimanager.onCloseView(ViewConfig.JoystickView);
        GameController.roleManager.isLoop = false;
        GameManager.removeManager(RoleManager);
        GameManager.gameScene3D.onRemoveScene();

        super.onDestroy();
    }
}