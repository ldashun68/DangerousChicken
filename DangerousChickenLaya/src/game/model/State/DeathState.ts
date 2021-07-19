import BaseState from "../../../rab/Fsm/BaseState";
import { RoleState } from "../DataType";
import Unit from "../Unit";
import ActorState from "./ActorState";

/**
 * 死亡状态
 */
export default class DeathState extends ActorState<Unit>{

    public get onStateType(): RoleState {
        return RoleState.death;
    }

    protected onEnterState() {
        this.Exchange = false;
        console.log("切换成了死亡状态");
    }

    protected onAnimPlayEnd() {
        super.onAnimPlayEnd();
        this.CurrFsm.Owner.death();
    }
}