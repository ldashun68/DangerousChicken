import BaseState from "../../../rab/Fsm/BaseState";
import { RoleState } from "../DataType";
import Unit from "../Unit";
import ActorState from "./ActorState";

/**
 * 待机状态
 */
export default class IdleState extends ActorState<Unit> {

    public get onStateType(): RoleState {
        return RoleState.idle;
    }

    protected onEnterState() {
        console.log("切换成了待机状态");
    }

    protected onPlayAnim () {
        this.CurrFsm.Owner.idle();
        super.onPlayAnim();

        if (this._animName != "") {
            this._animator.getControllerLayer(0).getAnimatorState(this._animName).clip.islooping = true;
        }
    }
}