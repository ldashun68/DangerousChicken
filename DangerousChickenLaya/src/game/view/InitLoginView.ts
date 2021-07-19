import GameNotity from "../../rab/GameNotity";
import GameManager from "../../rab/Manager/GameManager";
import RabView from "../../rab/RabView";
import MgobeManager from "../manager/MgobeManager";
import ViewConfig from "../ViewConfig";

export default class InitLoadView extends RabView{

    protected _view: fgui.GComponent;
    private isEnter: boolean;

    protected OnInit() {
        this._path = "res/UI/InitLoadView";
        this. _pkgName = "InitLoadView";
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
        this.isEnter = false;
        this._view.getChild("ProgressText").asTextField.text = "加载中...0%";

        fgui.UIPackage.loadPackage([
            "res/UI/HallView",
        ], Laya.Handler.create(this, () => {
            this.onLoadend();
        }), Laya.Handler.create(this, (progress: number) => {
            progress = parseFloat(progress.toFixed(2));
            this._view.getChild("ProgressText").asTextField.text = "加载中..."+Math.round(progress*100)+"%";
        }, [], false));

        GameManager.addManager(MgobeManager);

        this.AddListenerMessage(GameNotity.GameMessage_LoadingEnd, this.onLoadend);
    }

    onLoadend() {
        if(this.isEnter == true) {
            this.onEnterGame();
        }
        this.isEnter = true;
    }

    private onEnterGame() {
        this.OnCloseView();
        GameManager.uimanager.onCreateView(ViewConfig.HallView);
    }
}