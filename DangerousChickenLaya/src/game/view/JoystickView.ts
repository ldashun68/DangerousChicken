import RabView from "../../rab/RabView";
import GameMessage from "../GameMessage";
import GameController from "../manager/GameController";
import Child from "../model/Child";
import { PlayerRoomState, RoleSkill, RoleState, RoleType } from "../model/DataType";
import Joystick from "../model/Joystick";

export default class JoystickView extends RabView {
    
    private joystick: Joystick;
    
    protected OnInit() {
        this._path = "res/UI/Joystick";
        this. _pkgName = "Joystick";
        this. _resName = "Main";
    }

    onResize() {
        let scaleX = Laya.stage.width/Laya.stage.designWidth;

        for (let index: number = 0; index < this._view.numChildren; index++) {
            this._view.getChildAt(index).x *= scaleX;
        }
    }

    protected InitView() {
        this.joystick = new Joystick();
        this.joystick._view = this._view;
        this.joystick.touchUpCallback = () => {
            this.SendMessage(GameMessage.JoystickUp);
        }
        this.joystick.touchDownCallback = (degree: number) => {
            this.SendMessage(GameMessage.JoystickMoving, degree);
        }
        this.joystick.init();

        this._view.displayObject.zOrder = -1;
        this._view.getChild("Touch").on(Laya.Event.MOUSE_MOVE,this,this.onListMove);
        this._view.getChild("Touch").on(Laya.Event.MOUSE_UP,this,this.onListUp);
        this._view.getChild("Touch").on(Laya.Event.MOUSE_OVER,this,this.onListUp);
        this._view.getChild("Touch").on(Laya.Event.MOUSE_DOWN,this,this.onListDown);

        if (GameController.roleManager.ME.unitInfo.type == RoleType.ghost) {
            this._view.getChild("Skill").asCom.getChild("skill1").asLoader.url = "ui://Joystick/Btn_Skill_Hit";
            this._view.getChild("Skill").asCom.getChild("skill2").asLoader.url = "ui://Joystick/clamp";
            this._view.getChild("Skill").asCom.getChild("skill3").asLoader.url = "ui://Joystick/defence";
            this._view.getChild("Skill").asCom.getChild("countText").visible = false;
        }
        else {
            this._view.getChild("Skill").asCom.getChild("skill1").asLoader.url = "ui://Joystick/Btn_Skill_Opration";
            this._view.getChild("Skill").asCom.getChild("skill2").asLoader.url = "ui://Joystick/jump";
            this._view.getChild("Skill").asCom.getChild("skill3").asLoader.url = "ui://Joystick/throw stones";
            this._view.getChild("Skill").asCom.getChild("countText").asTextField.text = "0";
        }

        this._view.getChild("Skill").asCom.getChild("skill1").onClick(this, ()=>{
            this.SendMessage(GameMessage.ClickPlaySkill,1);
        });

        this._view.getChild("Skill").asCom.getChild("skill2").onClick(this, ()=>{
            this.SendMessage(GameMessage.ClickPlaySkill,2);
            if (GameController.roleManager.ME.unitInfo.type == RoleType.ghost) {
                GameController.mgobeManager.sendToGameSvr(GameMessage.Role_Skill, {
                    roleSkill: RoleSkill.Ghost_Trap
                });
            }
            else {
                GameController.roleManager.ME.OnChangeEntityState(RoleState.jump);
            }
        });

        this._view.getChild("Skill").asCom.getChild("skill3").onClick(this, ()=>{
            this.SendMessage(GameMessage.ClickPlaySkill,3);
            if (GameController.roleManager.ME.unitInfo.type == RoleType.ghost) {
                GameController.mgobeManager.sendToGameSvr(GameMessage.Role_Skill, {
                    roleSkill: RoleSkill.Ghost_Shield
                });
            }
            else {
                GameController.mgobeManager.sendToGameSvr(GameMessage.Role_Skill, {
                    roleSkill: RoleSkill.Child_ThrowStone
                });
            }
        });

        this.updateStoneCount();
        this.AddListenerMessage(GameMessage.Role_UpdateStone, this.updateStoneCount);
    }

    private _last:Laya.Vector2;
    private _isMove:boolean;

    private onListUp() {
        this._isMove = false;
    }

    private onListDown() {
        this._isMove = true;
    }
    
    private onListMove(event: Laya.Event) {
        if (!this._isMove) return;
        if (this._last) {
            GameController.roleManager.ME.cameraRotation((this._last.x - Laya.stage.mouseX),(this._last.y - Laya.stage.mouseY));
        }
        else {
            this._last = new Laya.Vector2(Laya.stage.mouseX,Laya.stage.mouseY);
        }

        this._last.x = Laya.stage.mouseX;
        this._last.y = Laya.stage.mouseY;
    }

    private updateStoneCount (): void {
        this._view.getChild("Skill").asCom.getChild("countText").asTextField.text = (GameController.roleManager.ME as Child).stoneCount+"";
    }

    onDestroy() {
        this._view.getChild("Touch").off(Laya.Event.MOUSE_MOVE,this,this.onListMove);
        this._view.getChild("Touch").off(Laya.Event.MOUSE_UP,this,this.onListUp);
        this._view.getChild("Touch").off(Laya.Event.MOUSE_OVER,this,this.onListUp);
        this._view.getChild("Touch").off(Laya.Event.MOUSE_DOWN,this,this.onListDown);

        this.onListUp();
        this.joystick.onDestroy();

        super.onDestroy();
    }
}
