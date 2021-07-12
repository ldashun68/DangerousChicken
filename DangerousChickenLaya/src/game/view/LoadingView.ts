import GameManager from "../../rab/Manager/GameManager";
import RabView from "../../rab/RabView";
import GameMessage from "../GameMessage";
import GameController from "../manager/GameController";
import { PlayerRoomState } from "../model/DataType";
import ViewConfig from "../ViewConfig";

export default class LoadingView extends RabView{
    protected _view: fgui.GComponent;

    protected OnInit() {
        this._path = "res/UI/LoadingView";
        this. _pkgName = "LoadingView";
        this. _resName = "Main";
    }

    onResize() {
        let scaleX = Laya.stage.width/Laya.stage.designWidth;
        if (scaleX > 1) {
            this._view.getChildAt(0).scaleX = scaleX;
        }
    }

    protected InitView() {
        if (GameController.gameStateManager.ME == PlayerRoomState.hall) {
            Laya.loader.create(GameController.resourceManager.getWaitingRoomAllPath(),
                Laya.Handler.create(this, () => {
                    Laya.timer.once(2000,this,this.onLoadEnd);
                })
            );
        }
        else if (GameController.gameStateManager.ME == PlayerRoomState.waitingRoom) {
            Laya.loader.create(GameController.resourceManager.getGameRoomPath(),
                Laya.Handler.create(this, () => {
                    GameController.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.gameLoading);
                })
            );
        }

        this.AddListenerMessage(GameMessage.GameMessage_LoadingEnd, this.onLoadEnd, this);
    }

    /**加载完成 */
    onLoadEnd()
    {
        if (GameController.gameStateManager.ME == PlayerRoomState.hall) {
            GameManager.gameScene3D.onLoad3dScene(GameController.resourceManager.getWaitingRoomPath(), () => {
                this.OnCloseView();
                GameManager.uimanager.onCreateView(ViewConfig.WaitingRoomView);
                GameController.onInitRoom();
            });
        }
        else if (GameController.gameStateManager.ME == PlayerRoomState.gameLoading) {
            GameManager.gameScene3D.onLoad3dScene(GameController.resourceManager.getGameRoomPath(), () => {
                this.OnCloseView();
                GameManager.uimanager.onCreateView(ViewConfig.GameView);
                GameController.onInitRoom();
            });
        }
    }
}