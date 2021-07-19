import GameManager from "../../rab/Manager/GameManager";
import RabView from "../../rab/RabView";
import Util from "../../rab/Util";
import GameController from "../manager/GameController";
import { RoleType, Task, TaskType } from "../model/DataType";
import ViewConfig from "../ViewConfig";

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

        for (let index: number = 0; index < this._view.numChildren; index++) {
            this._view.getChildAt(index).x *= scaleX;
        }
    }

    protected InitView() {
        let homeButton: fgui.GComponent = this._view.getChild("homeButton").asCom;
        homeButton.onClick(this, () => {
            this.OnCloseView();
            GameManager.uimanager.onCreateView(ViewConfig.HallView);
        });
        Util.addButtonAnimation(homeButton, "OverView");

        let GetButton: fgui.GComponent = this._view.getChild("window").asCom.getChild("GetButton").asCom;
        GetButton.onClick(this, () => {
            
        });
        Util.addButtonAnimation(GetButton, "OverView");

        let GetDoubleButton: fgui.GComponent = this._view.getChild("window").asCom.getChild("GetDoubleButton").asCom;
        GetDoubleButton.onClick(this, () => {
            
        });
        Util.addButtonAnimation(GetDoubleButton, "OverView");

        this.showTask();
    }

    private showTask (): void {
        let task: Map<TaskType, Task> = GameController.taskManager.meTask;
        if (GameController.taskManager.isWin() == true) {
            if (GameController.roleManager.ME.unitInfo.type == RoleType.child) {
                this._view.getChild("window").asCom.getChild("titleText").asTextField.text = "成 功 逃 脱 ！";
            }
            else {
                this._view.getChild("window").asCom.getChild("titleText").asTextField.text = "成 功 囚 禁 ！";
            }
        }
        else {
            if (GameController.roleManager.ME.unitInfo.type == RoleType.child) {
                this._view.getChild("window").asCom.getChild("titleText").asTextField.text = "逃 脱 失 败 ！";
            }
            else {
                this._view.getChild("window").asCom.getChild("titleText").asTextField.text = "囚 禁 失 败 ！";
            }
        }

        let index: number = 0;
        let coin: number = 0;
        let taskList: fgui.GList = this._view.getChild("window").asCom.getChild("takList").asList;
        taskList.numItems = task.size;
        task.forEach((value: Task, key: TaskType) => {
            let item = taskList.getChildAt(index);
            item.asCom.getChild("explainText").asTextField.text = value.name;
            item.asCom.getChild("statusText").asTextField.text = value.count+" / "+value.maxCount;
            item.asCom.getChild("coinText").asTextField.text = "+"+value.award;
            item.asCom.getChild("check").visible = (value.count >= value.maxCount);
            if (item.asCom.getChild("check").visible == true) {
                coin += value.award;
            }
            index++;
        });

        this._view.getChild("window").asCom.getChild("GetButton").asCom.getChild("text").asTextField.text = ""+coin;
        this._view.getChild("window").asCom.getChild("GetDoubleButton").asCom.getChild("text").asTextField.text = ""+(coin*2);
    }

    onDestroy () {
        Util.removeAllButtonAnimation("OverView");
        super.onDestroy();
    }
}
