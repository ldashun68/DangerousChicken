import GameManager from "../../rab/Manager/GameManager";
import RabView from "../../rab/RabView";
import GameController from "../manager/GameController";
import GameMessage from "../GameMessage";
import ViewConfig from "../ViewConfig";
import { PlayerRoomState, RoomType } from "../model/DataType";
import Util from "../../rab/Util";

export default class HallView extends RabView{

    protected _view: fgui.GComponent;
    private scene3d:Laya.Scene3D
    private _role:Laya.Sprite3D;
    private isClick: boolean;

    protected OnInit() {
        this._path = "res/UI/HallView";
        this. _pkgName = "HallView";
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
        this.peripherySystem();
        this.gameMode();
        this.InitScene3D();
        this.userInfo();
        this.updateUserInfo();

        GameController.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.hall);

        this.AddListenerMessage(GameMessage.GameMessage_UpdateUserInfo, this.updateUserInfo, this);
        this.AddListenerMessage(GameMessage.MGOBE_EnterRoomFinish, this.enterRoom, this);
    }

    /**周边系统 */
    private peripherySystem (): void {
        let peripheryList: fgui.GList = this._view.getChild("PeripheryList").asList;
        for (let index: number = 0; index < peripheryList.numChildren; index++) {
            peripheryList.getChildAt(index).asCom.setPivot(0.5, 0.5);
            Util.addButtonAnimation(peripheryList.getChildAt(index), "HallView");
        }

        peripheryList.getChildAt(4).asCom.getChildAt(0).asLoader.url = "ui://HallView/Icon_Shop";
        peripheryList.getChildAt(4).asCom.getChildAt(1).asTextField.text = "商店";
        peripheryList.getChildAt(4).onClick(this, () => {

        });

        peripheryList.getChildAt(3).asCom.getChildAt(0).asLoader.url = "ui://HallView/Icon_Signin";
        peripheryList.getChildAt(3).asCom.getChildAt(1).asTextField.text = "签到";
        peripheryList.getChildAt(3).onClick(this, () => {

        });

        peripheryList.getChildAt(2).asCom.getChildAt(0).asLoader.url = "ui://HallView/Icon_Achievements";
        peripheryList.getChildAt(2).asCom.getChildAt(1).asTextField.text = "成就";
        peripheryList.getChildAt(2).onClick(this, () => {

        });

        peripheryList.getChildAt(1).asCom.getChildAt(0).asLoader.url = "ui://HallView/Icon_Clan";
        peripheryList.getChildAt(1).asCom.getChildAt(1).asTextField.text = "家族";
        peripheryList.getChildAt(1).onClick(this, () => {

        });

        peripheryList.getChildAt(0).asCom.getChildAt(0).asLoader.url = "ui://HallView/Icon_Ranking";
        peripheryList.getChildAt(0).asCom.getChildAt(1).asTextField.text = "排名";
        peripheryList.getChildAt(0).onClick(this, () => {

        });
    }

    /**游戏模式 */
    private gameMode (): void {
        let isEnter: boolean = false;
        let escapeMode: fgui.GComponent = this._view.getChild("EscapeMode").asCom;
        escapeMode.setPivot(0.5, 0.5);
        escapeMode.onClick(this, () => {
            if (isEnter == false) {
                GameController.mgobeManager.onQuickMatch(RoomType.EscapeMode);
            }
            isEnter = true;
        });
        Util.addButtonAnimation(escapeMode, "HallView");

        let undetermined1: fgui.GComponent = this._view.getChild("Undetermined1").asCom;
        undetermined1.setPivot(0.5, 0.5);
        undetermined1.onClick(this, () => {

        });
        Util.addButtonAnimation(undetermined1, "HallView");

        let undetermined2: fgui.GComponent = this._view.getChild("Undetermined2").asCom;
        undetermined2.setPivot(0.5, 0.5);
        undetermined2.onClick(this, () => {

        });
        Util.addButtonAnimation(undetermined2, "HallView");
    }

    /**用户数据 */
    private userInfo (): void {
        let coinBox: fgui.GComponent = this._view.getChild("CoinBox").asCom;
        coinBox.setPivot(0.5, 0.5);
        coinBox.onClick(this, () => {

        });
        Util.addButtonAnimation(coinBox, "HallView");

        let diamondBox: fgui.GComponent = this._view.getChild("DiamondBox").asCom;
        diamondBox.setPivot(0.5, 0.5);
        diamondBox.onClick(this, () => {

        });
        Util.addButtonAnimation(diamondBox, "HallView");
    }

    /**更新用户数据 */
    private updateUserInfo (): void {
        let coinBox: fgui.GComponent = this._view.getChild("CoinBox").asCom;
        coinBox.getChild("text").asTextField.text = ""+Util.formatter(GameManager.gameLogicManager.gameInfo.coin);

        let diamondBox: fgui.GComponent = this._view.getChild("DiamondBox").asCom;
        diamondBox.getChild("text").asTextField.text = ""+Util.formatter(GameManager.gameLogicManager.gameInfo.diamond);
    }
    
    protected InitScene3D (): void {
        if (this.scene3d == null) {
            GameManager.gameScene3D.onLoad3dScene("", (scene3d:Laya.Scene3D) => {
                this.isClick = false;
                this._view.getChild("LeftArrow").onClick(this, this.chooseRole, [-1]);
                Util.addButtonAnimation(this._view.getChild("LeftArrow"), "HallView");
                this._view.getChild("RightArrow").onClick(this, this.chooseRole, [1]);
                Util.addButtonAnimation(this._view.getChild("RightArrow"), "HallView");

                this.scene3d = scene3d;
                this._view.getChildAt(0).displayObject.addChild(this.scene3d);
    
                let camera: Laya.Camera = this.scene3d.getChildByName("camera") as Laya.Camera;
                camera.nearPlane = 0.3;
                camera.farPlane = 300;
                camera.fieldOfView = 60;
                camera.cullingMask = Math.pow(2,0)|Math.pow(2,1);//层级
                camera.transform.position = new Laya.Vector3(0,0,0);
                camera.transform.localPosition = new Laya.Vector3(0,0,0);
    
                this.InitRole();
            });
        }
        else {
            this.InitRole();
        }
    }

    /**初始化大厅3d角色 */
    private InitRole(): void {
        let path = GameController.resourceManager.getRolePath(GameManager.gameLogicManager.gameInfo.currentRole);
        Laya.loader.create(path, Laya.Handler.create(this, () => {
            if (this._role != null) {
                this._role.destroy();
                this._role = null;
            }

            this.isClick = false;
            this._role = Laya.loader.getRes(path) as Laya.MeshSprite3D;
            this.scene3d.addChild(this._role);
            this._role.transform.localPosition = new Laya.Vector3(-1.7,-0.8,-3.3)
        }));
    }

    /**选择角色 */
    private chooseRole (index: number): void {
        if (this.isClick == true) {
            return;
        }

        this.isClick = true;
        GameManager.gameLogicManager.setCurrentRole(index);
        this.InitRole();
    }

    /**匹配成功，加入房间 */
    private enterRoom (): void {
        this.OnCloseView();
        GameManager.uimanager.onCreateView(ViewConfig.LoadingView);
    }

    onDestroy () {
        this.scene3d.destroy(true);
        Util.removeAllButtonAnimation("HallView");
        super.onDestroy();
    }
}
