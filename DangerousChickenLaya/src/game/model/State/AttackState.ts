import BaseState from "../../../rab/Fsm/BaseState";
import { RoleState } from "../DataType";
import Unit from "../Unit";
import ActorState from "./ActorState";

/**
 * 攻击状态
 */
export default class AttackState extends ActorState<Unit> {


    public get onStateType(): RoleState {
        return RoleState.attack;
    }

    protected onEnterState() {
        this.Exchange = false;
        console.log("切换成了攻击状态");
    }

    public Update() {
        
    }

    protected onAnimPlayEnd() {
        this.Exchange = true;
        this.CurrFsm.ChangeState(RoleState.idle);
    }
}