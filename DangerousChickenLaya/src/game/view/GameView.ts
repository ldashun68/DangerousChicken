import GameManager from "../../rab/Manager/GameManager";
import RabView from "../../rab/RabView";
import Util from "../../rab/Util";
import GameMessage from "../GameMessage";
import GameController from "../manager/GameController";
import { DoorIndex, PlayerRoomState, PropType, RoleType, Task, TaskType } from "../model/DataType";
import ViewConfig from "../ViewConfig";

export default class GameView extends RabView {

    protected _view: fgui.GComponent;
    private gameInfo: fgui.GComponent;
    private taskList: fgui.GList;
    private timeText: fgui.GTextField;

    private time: number;
    private hintCount: number;

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
        this.time = 60*30;
        this.gameInfo = this._view.getChild("gameInfo").asCom;
        this.taskList = this._view.getChild("task").asCom.getChild("taskList").asList;

        this.timeText = this.gameInfo.getChild("timeText").asTextField;
        this.timeText.text = Util.UpdateTime(this.time, false, true);
        this.gameInfo.getChild("roleCountText").asTextField.text = "幸存者: "+GameController.roleManager.getAllChild().length;

        this.gameInfo.getChild("hintText1").visible = false;
        this.gameInfo.getChild("hintText2").visible = false;
        this.gameInfo.getChild("hintText3").visible = false;
        this.hintCount = 1;
        this.taskList.visible = false;

        GameController.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.gameStart);

        this.AddListenerMessage(GameMessage.GameView_Hint, this.showHint, this);
        this.AddListenerMessage(GameMessage.GameView_FindBox, this.updateBox, this);
        this.AddListenerMessage(GameMessage.Role_UpdateTask, this.updateTask, this);
        this.AddListenerMessage(GameMessage.GameMessage_GameStart, this.startGame, this);
        this.AddListenerMessage(GameMessage.GameMessage_GameEnd, this.endGame, this);
    }

    private startGame (): void {
        GameManager.uimanager.onCreateView(ViewConfig.JoystickView);
        GameController.propManager.start();
        GameController.taskManager.start();
        GameController.mgobeManager.sendToGameSvr(GameMessage.Role_Sync, {});
        GameController.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.gameing);

        this.updateTask();

        Laya.timer.loop(1000, this, this.second);
    }

    private endGame (): void {
        if (GameController.doorManager.isOpenDoor == false) {
            GameController.taskManager.ghostTask.get(TaskType.Ghost_DefendDoor).count++;
        }
        
        GameController.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.gameEnd);
        GameController.gameOver();
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

    private showHint (hint: string): void {
        if (GameController.gameStateManager.ME < PlayerRoomState.gameLoading) {
            return;
        }
        
        let item = this.gameInfo.getChild("hintText"+this.hintCount);
        item.y = 202;
        item.asTextField.text = "提示语: "+hint;
        item.visible = true;
        Laya.Tween.clearAll(item);
        Laya.Tween.to(item, {y: 128}, 1000, null, Laya.Handler.create(this, () => {
            item.asTextField.text = "";
            item.visible = false;
        }));

        this.hintCount++;
        if (this.hintCount > 3) {
            this.hintCount = 1;
        }
    }

    private updateBox (propType: PropType, index: number): void {
        if (propType == PropType.partBox) {
            let part = this.gameInfo.getChild("part"+(index+1)).asCom;
            part.getChildAt(1).visible = true;
            this.gameInfo.getChild("partCountText").asTextField.text = "已获逃亡零件: "+(index+1);
        }
        else if (propType == PropType.keyBox) {
            let key = this.gameInfo.getChild("key"+(index+1)).asCom;
            key.getChildAt(1).visible = true;
            if (index == DoorIndex.blue) {
                key.getChildAt(1).asImage.color = "#0000FF";
                this.gameInfo.getChild("key"+(index+1)+"Text").asTextField.color = "#0000FF";
            }
            else if (index == DoorIndex.green) {
                key.getChildAt(1).asImage.color = "#00FF00";
                this.gameInfo.getChild("key"+(index+1)+"Text").asTextField.color = "#00FF00";
            }
            else if (index == DoorIndex.red) {
                key.getChildAt(1).asImage.color = "#FF0000";
                this.gameInfo.getChild("key"+(index+1)+"Text").asTextField.color = "#FF0000";
            }
        }
    }

    private updateTask (): void {
        this.taskList.numItems = GameController.taskManager.meTask.size;
        this.taskList.visible = true;
        let index: number = 0;
        GameController.taskManager.meTask.forEach((value: Task, key: TaskType) => {
            let item = this.taskList.getChildAt(index);
            item.asCom.getChild("explainText").asTextField.text = value.name;
            item.asCom.getChild("countText").asTextField.text = value.count+" / "+value.maxCount;
            if (value.count >= value.maxCount) {
                item.asCom.getChild("explainText").asTextField.color = "#00FF00";
                item.asCom.getChild("countText").asTextField.color = "#00FF00";
            }
            else {
                item.asCom.getChild("explainText").asTextField.color = "#FFFFFF";
                item.asCom.getChild("countText").asTextField.color = "#FFFFFF";
            }
            index++;
        });
    }
}