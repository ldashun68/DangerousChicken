import { RoleState } from "../DataType";
import Unit from "../Unit";
import ActorState from "./ActorState";

export default class HitState extends ActorState<Unit>{
    
    public get onStateType(): RoleState {
        return RoleState.hit;
    }

    protected onEnterState() {
        this.Exchange = false;
        console.log("切换成了受伤状态");
    }
    
    protected onAnimPlayEnd() {
        this.Exchange = true;
    }
}