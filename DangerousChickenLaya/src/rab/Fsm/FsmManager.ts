import Fsm from "./Fsm";
import FsmBase from "./FsmBase";
import BaseState from "./BaseState";
import { RabManager } from "../Manager/RabManager";

/**
 * 状态机管理类
 */
export default class FsmManager extends RabManager {

    private M_FsmDic:Map<string,FsmBase> = new Map<string,FsmBase>();

    protected OnInit() {
        
    }
     
    /**
     * 创建状态机
     * @param owner 
     * @param states 
     * @returns 
     */
    public Create<T>(fsmId:string,owner:T,states:BaseState<T>[]):Fsm<T> {
        let fsm=new Fsm(fsmId,owner,states)
        this.M_FsmDic.set(fsmId,fsm)
        return fsm;
    }

    /**
     * 获得状态机
     * @param fsmId 
     * @returns 
     */
    public onGetFsm<T>(fsmId:string):Fsm<T>
    {
        let fsm=null;
        if (this.M_FsmDic.has(fsmId)) {
            fsm=this.M_FsmDic.get(fsmId);
        }
        return fsm
    }

    /**
     * 销毁状态机
     * @param fsmId 
     */
    public DestroyFsm(fsmId:string){
       let fsm=null;
        if (this.M_FsmDic.has(fsmId)) {
            fsm=this.M_FsmDic.get(fsmId);
            fsm.ShutDown();
            this.M_FsmDic.delete(fsmId)
        }
    }
}
    