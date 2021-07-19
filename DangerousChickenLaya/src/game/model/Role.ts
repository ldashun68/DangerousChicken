import GameManager from "../../rab/Manager/GameManager";
import Vct3 from "../../rab/model/Vct3";
import Util from "../../rab/Util";
import GameMessage from "../GameMessage";
import GameController from "../manager/GameController";
import { FrameSyncRoleData, PlayerRoomState, RoleSkill, RoleState, RoleType, SkillInfo } from "./DataType";
import RoleMoveRayCast from "./RoleMoveRayCast";
import Skill from "./Skill/Skill";
import Unit from "./Unit";

export default class Role extends Unit {
    
    /**天空盒 */
    protected sky: Laya.Sprite3D;
    /**角色移动射线检测 */
    protected roleMoveRayCast: RoleMoveRayCast;
    /**技能列表 */
    public skillList: Map<RoleSkill, SkillInfo>;

    /**其他角色数据 */
    protected otherRole: Array<FrameSyncRoleData>;
    /**角度偏移值 */
    protected dangle:number;
    /**记录前一个坐标 */
    public prior: Laya.Vector3;

    /**是否在释放技能 */
    protected _isSkill: boolean;
    /**当前技能 */
    protected currentSkill: Skill;

    protected onInitEntityUnity() {
        this._moveAngle = 0;
        this._roleModel = this.gameObject.getChildAt(0) as Laya.Sprite3D;

        this.skillList = new Map<RoleSkill, SkillInfo>();
        this.otherRole = [];
        this.dangle = this.gameObject.transform.localRotationEulerY;
        this.prior = Util.getNewVector3(this.gameObject.transform.position);
        this.onMove(0);

        // 设置天空盒
        if (GameController.gameStateManager.ME >= PlayerRoomState.gameLoading && this.unitInfo.id == MGOBE.Player.id) {
            this.sky = GameManager.gameScene3D.scene3D.getChildByName("gameroom").getChildByName("SkyDome") as Laya.Sprite3D;
            this.sky.transform.position = this.gameObject.transform.position;
            this.sky.transform.localPosition = new Laya.Vector3();
            this.sky.transform.setWorldLossyScale(new Laya.Vector3(100, 100, 100));
        }

        // 添加射线检测
        this._isSendMessage = this.unitInfo.id == MGOBE.Player.id;
        if (this._isSendMessage == true) {
            this.AddListenerMessage(GameMessage.JoystickMoving, this.OnJoystickMoving);
            this.AddListenerMessage(GameMessage.JoystickUp, this.OnJoystickUp);
            this.AddListenerMessage(GameMessage.ClickPlaySkill, this.OnClickPlaySkill);
        }
    }

    /**帧频 */
    public onUpdateentity()
    {
        if (this.roleMoveRayCast != null) {
            this.roleMoveRayCast.down();

            this.skillList.forEach((value: SkillInfo, key: RoleSkill) => {
                if (value.cd > 0) {
                    value.cd -= 1000/60;
                }
            });
        }

        if (this.otherRole.length > 0) {
            this.otherRoleMove();
        }

        super.onUpdateentity();
    }

    /**移动 */
    public move (speed: number = this.moveSpeed): void {
        if (this.unitInfo.id == MGOBE.Player.id) {
            if (this.roleMoveRayCast.forward() == false) {
                this.prior = Util.getNewVector3(this.gameObject.transform.position);
    
                super.move(speed);
            }
        }
    }

    /**其他玩家移动 */
    protected otherRoleMove (): void {
        let frame: FrameSyncRoleData = this.otherRole.shift();
        Util.setPosition(frame.point as Laya.Vector3, this.gameObject);
        this._roleModel.transform.localRotationEulerY = frame.rotationY;
    }

    /**技能 */
    protected skill (roleSkill: RoleSkill): void {
        
    }

    /**遥感移动 */
    private OnJoystickMoving(angle: any)
    {
        if (this.currentState == RoleState.death || this.currentState == RoleState.safe) {
            return;
        }

        this._isMove = true;
        this._moveAngle = this.dangle+(360-angle-45);
        this._roleModel.transform.localRotationEulerY = 360-angle;
        this.OnChangeEntityState(RoleState.move);
    }

    /**摇杆弹起 */
    private OnJoystickUp()
    {
        this._isMove = false;
        this.OnChangeEntityState(RoleState.idle);
    }

    /**
     * 点击了技能
     * @param data 
     */
    protected OnClickPlaySkill(index:number)
    {
        
    }

    /**
     * 播放技能
     * @param typ 
     */
    protected PlaySkill(typ:RoleSkill): boolean {
        if (this.skillList.get(typ).cd <= 0) {
            this.skillList.get(typ).cd = this.skillList.get(typ).time;
            this.skill(typ);
            return true;
        }
        return false;
    }

    /**移动 */
    private onMove(angle: number) {
        this._moveAngle = this.dangle+(360-angle-45);
        this._roleModel.transform.localRotationEulerY = 360-angle;
    }

    /**相机旋转 */
    public cameraRotation(x:number, y:number) {
        if (GameManager.gameScene3D.scene3D == null) {
            return;
        }
        
        if(Math.abs(x) > Math.abs(y)) {
            if(x > 0) {
                this.gameObject.transform.localRotationEulerY += 2;
                this._roleModel.transform.localRotationEulerY -= 2;
            }
            else {
                this.gameObject.transform.localRotationEulerY -= 2;
                this._roleModel.transform.localRotationEulerY += 2;
            }
            this.dangle = this.gameObject.transform.localRotationEulerY;
            this.getForward();
        }
        else {
            if(y > 0) {
                if(this.camera.transform.localRotationEulerX > -40) {
                    this.camera.transform.localPositionY += 0.017;
                    this.camera.transform.localRotationEulerX -= 0.5;
                }
            }
            else {
                if(this.camera.transform.localRotationEulerX < 20) {
                    this.camera.transform.localPositionY -= 0.017;
                    this.camera.transform.localRotationEulerX += 0.5;
                }
            }
        }
    }

    /**技能释放失败 */
    public outSkillFail (roleSkill: RoleSkill): void {
        this.skillList.get(roleSkill).cd = 0;
        this.OnChangeEntityState(RoleState.idle, true);
    }

    /**获得技能冷却时间 */
    public getSkillCD (roleSkill: RoleSkill): number {
        return this.skillList.get(roleSkill).time;
    }

    /**获得技能当前冷却时间 */
    public getSkillCurrentCD (roleSkill: RoleSkill): number {
        if (this.skillList.has(roleSkill) == true) {
            return this.skillList.get(roleSkill).cd;
        }
        return 1;
    }

    /**设置当前技能 */
    public setCurrentSkill (skill: Skill): void {
        if (this.currentSkill != null) {
            this.currentSkill.remove();
            this.currentSkill = null;
        }
        this.currentSkill = skill;
    }

    protected onHandleMessage (data: FrameSyncRoleData)
    {
        this.OnChangeEntityState(data.state, true);
        if (data.state != RoleState.none && data.state != RoleState.death) {
            this.otherRole.push(data);
        }
    }

    onDestroy () {
        GameManager.fsmManager.DestroyFsm(this._fsm.FsmId);
        this.setCurrentSkill(null);
        super.onDestroy();
    }

    //--------------------发送消息------------------------------

    /**发送数据 */
    protected onSendFrameMessage():FrameSyncRoleData
    {
        let data: FrameSyncRoleData = {
            id: "player"+MGOBE.Player.id,
            state: this.currentState,
            point: new Vct3(
                this.gameObject.transform.position.x,
                this.gameObject.transform.position.y,
                this.gameObject.transform.position.z
            ),
            rotationY: this._roleModel.transform.localRotationEulerY+this.gameObject.transform.localRotationEulerY,
        }
        return data;
    }
}