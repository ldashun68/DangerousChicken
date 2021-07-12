
import Fsm from "./Fsm";

/**装套类型 */
export default abstract class BaseState<T>
{
    constructor() { 
        this.Exchange = true;
    }

    /**当前状态类型 */
    public abstract get onStateType(): any;
    /**状态对应的状态机 */
    public CurrFsm:Fsm<T>;
    /** 是否可以切换状态 */
    public Exchange:boolean = true;
    /**进入状态 */
    public abstract Enter(): any;
    /**执行状态 */
    public abstract Update(): any;
    /**离开状态 */
    public abstract Leave(): any;
    /**状态机销毁时调用 */
    public abstract Destroy(): any;
}