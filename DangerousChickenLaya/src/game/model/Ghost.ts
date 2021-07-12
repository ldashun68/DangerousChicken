import GameManager from "../../rab/Manager/GameManager";
import { RoleState } from "./DataType";
import Role from "./Role";
import RoleMoveRayCast from "./RoleMoveRayCast";
import AttackState from "./State/AttackState";
import DeathState from "./State/DeathState";
import HitState from "./State/HitState";
import IdleState from "./State/IdleState";
import JumpState from "./State/JumpState";
import MoveState from "./State/MoveState";

export default class Ghost extends Role {
    
    protected onInitEntityUnity() {
        super.onInitEntityUnity();
        
        // 调整相机位置
        if (this.unitInfo.id == MGOBE.Player.id) {
            this.camera.transform.position = new Laya.Vector3();
            this.camera.transform.localPosition = new Laya.Vector3(0, 1.5, 0);
            this.camera.transform.localPositionZ = -3.3;
        }

        // 添加射线检测
        if (this._isSendMessage == true) {
            this.roleMoveRayCast = new RoleMoveRayCast();
            this.roleMoveRayCast.role = this;
            
            // 设置射线检测的Y坐标、动画名字
            this.roleMoveRayCast.startPosY = 1.9;
            this._fsm = GameManager.fsmManager.Create(this._unitInfo.id,this,[
                new IdleState("GrandMother_IdleStay",this._animator),
                new MoveState("GrandMother_Run",this._animator),
                new AttackState("GrandMother_Atk",this._animator),
                new JumpState("GrandMother_Jump",this._animator),
                new DeathState("GrandMother_Dead",this._animator),
                new HitState("GrandMother_Hit",this._animator)
            ]);

            this.OnChangeEntityState(RoleState.idle);
        }
    }

    /**切换状态 */
    public OnChangeEntityState(state:RoleState, compel?: boolean, ...data: any) {
        switch (state) {
            case RoleState.attack:
                this.onAttack();
                break;
                break;
            default:
                break;
        }

        super.OnChangeEntityState(state, compel, data);
    }

    /**攻击 */
    private onAttack() {
        
    }
}