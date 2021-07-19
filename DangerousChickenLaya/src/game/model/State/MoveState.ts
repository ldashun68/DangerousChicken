import BaseState from "../../../rab/Fsm/BaseState";
import { RoleState } from "../DataType";
import Unit from "../Unit";
import ActorState from "./ActorState";

/**
 * 移动状态
 */
export default class MoveState extends ActorState<Unit>  {

    public get onStateType(): RoleState {
        return RoleState.move
    }

    protected onEnterState() {
        console.log("切换成了移动状态");
    }

    public Update() {
        this.CurrFsm.Owner.move();
    }
}