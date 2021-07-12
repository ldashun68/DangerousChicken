import BaseState from "../../../rab/Fsm/BaseState";
import { RoleState } from "../DataType";
import Unit from "../Unit";
import ActorState from "./ActorState";

/**
 * 跳跃状态
 */
export default class JumpState extends ActorState<Unit> {

    public get onStateType(): RoleState {
        return RoleState.jump
    }

    protected onEnterState() {
        console.log("切换成了跳跃状态");
        this.Exchange = false;
    }

    public Update() {
        if(this.CurrFsm.Owner.isMove == true) {
            this.CurrFsm.Owner.move();
        }
    }
    
    protected onAnimPlayEnd() {
        this.Exchange = true;
        if (this.CurrFsm.Owner.isMove == true) {
            this.CurrFsm.ChangeState(RoleState.move);
        }
        else {
            this.CurrFsm.ChangeState(RoleState.idle);
        }
    }
}