
/**
 * 状态机基类
 */
export default abstract class FsmBase {

    /**当前状态类型 */ 
    public CurrStateType:number; 
    /**上一个状态 */
    public LastStateType:number; 
    /**状态机编号 */ 
    public FsmId:string; 
    /**状态机拥有者 */ 
    protected owner:any; 

    constructor(fsmid:string) {
        this.FsmId = fsmid;
    } 
    
    /**
     * 切换当前状态
     * @param newState 下一个的状态
     * @param compel 是否强制切换 默认非强制
     * @returns 
     */
    public abstract ChangeState(newState:number,compel:boolean): any;

    /**关闭状态机 */ 
    public abstract ShutDown(): any;
}