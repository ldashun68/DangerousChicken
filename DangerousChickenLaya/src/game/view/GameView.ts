import GameManager from "../../rab/Manager/GameManager";
import RabView from "../../rab/RabView";
import Util from "../../rab/Util";
import GameMessage from "../GameMessage";
import GameController from "../manager/GameController";
import { PlayerRoomState } from "../model/DataType";
import ViewConfig from "../ViewConfig";

export default class GameView extends RabView {

    protected _view: fgui.GComponent;
    private timeText: fgui.GTextField;

    private time: number;

    protected OnInit() {
        this._path = "res/UI/GameView";
        this. _pkgName = "GameView";
        this. _resName = "Main";
    }

    onResize() {
        let scaleX = Laya.stage.width/Laya.stage.designWidth;

        for (let index: number = 0; index < this._view.numChildren; index++) {
            this._view.getChildAt(index).x *= scaleX;
        }
    }

    protected InitView() {
        this.time = 60*3;
        this.timeText = this._view.getChild("timeText").asTextField;
        this.timeText.text = Util.UpdateTime(this.time, false, true);

        GameController.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.gameStart);

        this.AddListenerMessage(GameMessage.GameMessage_GameStart, this.startGame, this);
        this.AddListenerMessage(GameMessage.GameMessage_GameEnd, this.endGame, this);
    }

    private startGame (): void {
        GameManager.uimanager.onCreateView(ViewConfig.JoystickView);
        GameController.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.gameing);

        Laya.timer.loop(1000, this, this.second);
    }

    private endGame (): void {
        this.OnCloseView();
        GameManager.uimanager.onCloseView(ViewConfig.JoystickView);
        GameController.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.gameEnd);
    }

    private second (): void {
        this.time--;
        if (this.time < 0) {
            this.endGame();

            Laya.timer.clear(this, this.second);
        }
        else {
            this.timeText.text = Util.UpdateTime(this.time, false, true);
        }
    }
}