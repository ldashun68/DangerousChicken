import BaseState from "../../../rab/Fsm/BaseState";
import { RoleState } from "../DataType";
import Unit from "../Unit";
import ActorState from "./ActorState";
import IdleState from "./IdleState";
import MoveState from "./MoveState";

/**
 * 技能状态
 */
export default class SkillState extends ActorState<Unit> {

    public get onStateType(): RoleState {
        return RoleState.skill;
    }

    protected onEnterState() {
        this.Exchange = false;
        this.Update = () => {
            
        }

        console.log("切换成了技能状态");
    }

    public onAnimPlayEnd() {
        super.onAnimPlayEnd();
        this._animName = "";
        this.Exchange = true;
        if (this.CurrFsm.Owner.isMove == true) {
            this.CurrFsm.Owner.OnChangeEntityState(RoleState.move);
        }
        else {
            this.CurrFsm.Owner.OnChangeEntityState(RoleState.idle);
        }
    }

    /**不却换状态停止 */
    public notChangeStateEnd (): void {
        super.onAnimPlayEnd();
        this._animName = "";
        this.Exchange = true;
    }
}