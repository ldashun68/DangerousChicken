import BaseState from "../../../rab/Fsm/BaseState";
import { RoleState } from "../DataType";
import Unit from "../Unit";
import ActorState from "./ActorState";

/**
 * 落下状态
 */
export default class FallState extends ActorState<Unit> {

    public get onStateType(): RoleState {
        return RoleState.fall;
    }

    protected onEnterState() {
        console.log("切换成了落下状态");
        this.Exchange = false;
    }

    public Update() {
        this.CurrFsm.Owner.fall();
    }

    protected onPlayAnim() {
        if (this.CurrFsm.LastStateType == RoleState.move) {
            super.onPlayAnim();
        }
    }
    
    protected onAnimPlayEnd() {
        if (this.CurrFsm.Owner.isMove == true) {
            this.CurrFsm.ChangeState(RoleState.move);
        }
        else {
            this.CurrFsm.ChangeState(RoleState.idle);
        }
    }
}