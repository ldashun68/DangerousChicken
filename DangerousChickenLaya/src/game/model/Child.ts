import GameManager from "../../rab/Manager/GameManager";
import Util from "../../rab/Util";
import { RoleState } from "./DataType";
import Role from "./Role";
import RoleMoveRayCast from "./RoleMoveRayCast";
import AttackState from "./State/AttackState";
import DeathState from "./State/DeathState";
import FallState from "./State/FallState";
import HitState from "./State/HitState";
import IdleState from "./State/IdleState";
import JumpState from "./State/JumpState";
import MoveState from "./State/MoveState";

export default class Child extends Role {
    
    /**落下坐标 */
    private startFallPos: Laya.Vector3;
	private endFallPos: Laya.Vector3;

    protected onInitEntityUnity() {
        super.onInitEntityUnity();
        
        // 调整相机位置
        if (this.unitInfo.id == MGOBE.Player.id) {
            this.camera.transform.position = new Laya.Vector3();
            this.camera.transform.localPosition = new Laya.Vector3(0, 1.5, 0);
            this.camera.transform.localPositionZ = -3;
        }

        // 添加射线检测
        if (this._isSendMessage == true) {
            this.roleMoveRayCast = new RoleMoveRayCast();
            this.roleMoveRayCast.role = this;
            
            // 设置射线检测的Y坐标、动画名字
            this.roleMoveRayCast.startPosY = 1.3;
            this._fsm = GameManager.fsmManager.Create(this._unitInfo.id,this,[
                new IdleState("Girl_IdleStay",this._animator),
                new MoveState("Girl_Run",this._animator),
                new AttackState("Girl_Attack",this._animator),
                new JumpState("Girl_Jump",this._animator),
                new FallState("Girl_Jump",this._animator),
                new DeathState("Girl_Dead",this._animator),
                new HitState("Dorothy_Hurt",this._animator)
            ]);

            this.OnChangeEntityState(RoleState.idle);
        }
    }

    /**落下 */
    public fall (): void {
        if (this.startFallPos == null) {
            return;
        }

		let pos: Laya.Vector3 = new Laya.Vector3();
		Laya.Vector3.lerp(this.startFallPos, this.endFallPos, 0.07, pos);
        Util.setPosition(new Laya.Vector3(NaN, pos.y, NaN), this.gameObject);
		this.startFallPos.y = pos.y;

		if (Math.abs(pos.y - this.endFallPos.y) < 0.2) {
			this.roleMoveRayCast.isFall = false;
            this.OnChangeEntityState(RoleState.idle, true);

            this.startFallPos = null;
            this.endFallPos = null;
		}
    }

    /**切换状态 */
    public OnChangeEntityState(state:RoleState, compel?: boolean, ...data: any) {
        switch (state) {
            case RoleState.attack:
                this.onAttack();
                break;
            case RoleState.jump:
                this.onJump();
                break;
            case RoleState.fall:
                this.onFall(data[0]);
                break;
            default:
                break;
        }

        super.OnChangeEntityState(state, compel, data);
    }

    /**攻击 */
    private onAttack() {
        
    }

    /**跳跃 */
    private onJump() {
        
    }

    /**落下 */
    private onFall (endFallPos: Laya.Vector3) {
        Laya.timer.once(100, this, () => {
            this.startFallPos = new Laya.Vector3(0, this.gameObject.transform.position.y, 0);
            this.endFallPos = endFallPos;
        });
    }
}