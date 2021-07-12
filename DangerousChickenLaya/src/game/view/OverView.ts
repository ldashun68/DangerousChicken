import RabView from "../../rab/RabView";

export default class OverView extends RabView{

    protected _view: fgui.GComponent;

    protected OnInit() {
        this._path = "res/UI/OverView";
        this. _pkgName = "OverView";
        this. _resName = "Main";
    }

    onResize() {
        let scaleX = Laya.stage.width/Laya.stage.designWidth;
        if (scaleX > 1) {
            this._view.getChildAt(0).scaleX = scaleX;
        }
    }

    protected InitView() {
        
    }
}
