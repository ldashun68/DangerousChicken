// import { StateType } from "../../game/model/DataType";
import FsmBase from "./FsmBase";
import BaseState from "./BaseState";


/**
 * 状态机
 */
export default class Fsm<T> extends FsmBase {

    private m_CurrState:BaseState<T>;
    private m_StateDic:Array<BaseState<T>>;

    /**
     * 初始化状态机
     * @param fsmid 
     * @param owner 
     * @param states 
     */
    constructor(fsmid:string,owner:T,states:Array<BaseState<T>> )
    {
        super(fsmid);
        this. m_StateDic = []
        this.owner = owner;
        for (let i in states) {
            let state = states[i];
            state.CurrFsm = this;
            this.m_StateDic.push(state);
        }
        this.m_CurrState = this.m_StateDic[0];
        this.CurrStateType = this.m_CurrState.onStateType;
        this.LastStateType = this.m_CurrState.onStateType;
        this.m_CurrState.Enter();
    }

    /**
     * 拥有者
     */
    public get Owner():T
    {
        return <T>this.owner
    }

    /**
     * 当前状态
     */
    public get CurrState():BaseState<T>
    {
        return this.m_CurrState
    }

    /**
     * 获取当前状态
     * @param stateType 
     * @returns 
     */
    public GetState(stateType:any):BaseState<T> {
        let state:BaseState<T> = null;
        for(var i = 0;i<this.m_StateDic.length;i++) {
            if(this.m_StateDic[i].onStateType == stateType) {
                state = (this.m_StateDic[i]);
            }
        }
        return state;
    }

    /**
     * 执行当前状态
     */
    public Update(){
        if (this.m_CurrState) {
            this.m_CurrState.Update();
        }
    }

    /**
     * 切换当前状态
     * @param newState 下一个的状态
     * @param compel 是否强制切换 默认非强制
     * @returns 
     */
    public ChangeState(newState:number,compel:boolean = false){
        if (this.CurrStateType == newState) {
            return;
        }

        if (this.m_CurrState != null) {
            if(!this.m_CurrState.Exchange && !compel) {
                return;
            }
            this.m_CurrState.Leave();
        }

        this.LastStateType = this.CurrStateType;
        this.CurrStateType = newState;
        this.m_CurrState = this.GetState(this.CurrStateType);
        //进入新状态
        this.m_CurrState.Enter();
    }

    /**
     * 关闭状态机
     */
    public ShutDown() {
        if (this.m_CurrState!=null) {
            this.m_CurrState.Leave();
        }
        for (let index in this.m_StateDic) {
            this.m_StateDic[index].Destroy();
        }
        delete this.m_StateDic;
    }
}