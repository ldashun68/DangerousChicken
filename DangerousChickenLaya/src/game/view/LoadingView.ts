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

        for (let index: number = 0; index < this._view.numChildren; index++) {
            this._view.getChildAt(index).x *= scaleX;
        }
    }

    protected InitView() {
        this._view.getChild("ProgressText").asTextField.text = "加载中...0%";

        if (GameController.gameStateManager.ME == PlayerRoomState.hall) {
            Laya.loader.create(GameController.resourceManager.getWaitingRoomAllPath(),
                Laya.Handler.create(this, () => {
                    this.onLoadEnd();
                }),
                Laya.Handler.create(this, (progress: number) => {
                    progress = parseFloat(progress.toFixed(2));
                    this._view.getChild("ProgressText").asTextField.text = "加载中..."+Math.round(progress*100)+"%";
                })
            );
        }
        else if (GameController.gameStateManager.ME == PlayerRoomState.waitingRoom) {
            Laya.loader.create(GameController.resourceManager.getGameRoomPath(),
                Laya.Handler.create(this, () => {
                    GameController.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.gameLoading);
                }),
                Laya.Handler.create(this, (progress: number) => {
                    progress = parseFloat(progress.toFixed(2));
                    this._view.getChild("ProgressText").asTextField.text = "加载中..."+Math.round(progress*100)+"%";
                })
            );
        }

        this.AddListenerMessage(GameMessage.GameMessage_LoadingEnd, this.onLoadEnd, this);
    }

    /**加载完成 */
    onLoadEnd() {
        if (GameController.gameStateManager.ME == PlayerRoomState.hall) {
            GameManager.gameScene3D.onLoad3dScene(GameController.resourceManager.getWaitingRoomPath()[0], () => {
                this.OnCloseView();
                GameController.roleManager.addRole(null, false);
                GameManager.uimanager.onCreateView(ViewConfig.WaitingRoomView);
            });
        }
        else if (GameController.gameStateManager.ME == PlayerRoomState.gameLoading) {
            GameManager.gameScene3D.onLoad3dScene(GameController.resourceManager.getGameRoomPath(), () => {
                this.OnCloseView();
                GameController.roleManager.addRole(null, false);
                GameManager.uimanager.onCreateView(ViewConfig.GameView);
            });
        }
    }
}