import BaseState from "../../../rab/Fsm/BaseState";
import { RoleState } from "../DataType";
import Unit from "../Unit";
import ActorState from "./ActorState";

/**
 * 安全状态
 */
export default class SafeState extends ActorState<Unit> {

    public get onStateType(): RoleState {
        return RoleState.safe;
    }

    protected onEnterState() {
        console.log("切换成了安全状态");
        this.Exchange = false;
    }

    protected onPlayAnim () {
        super.onPlayAnim();

        if (this._animName != "") {
            this._animator.getControllerLayer(0).getAnimatorState(this._animName).clip.islooping = true;
        }
    }
}