import Fsm from "../../rab/Fsm/Fsm";
import GameManager from "../../rab/Manager/GameManager";
import GameObject from "../../rab/model/GameObject";
import Util from "../../rab/Util";
import GameController from "../manager/GameController";
import { AnimationName, FightUserInfo, FrameSyncData, RoleState, UnitInfo } from "./DataType";

/**
 * 实体单元
 */
export default abstract class Unit extends GameObject {

    /**动作 */
    protected _animator:Laya.Animator;
    /**相机 */
    protected camera:Laya.Camera;
    /**是否同步状态和位置 */
    protected _isSendMessage:boolean;
    /**移动距离 */
    protected _moveDistance:Laya.Vector3;
    /**移动角度 */
    protected _moveAngle:number;
    /**单元模型 */
    protected _roleModel:Laya.Sprite3D;
    /**单位数据 */
    protected _unitInfo: UnitInfo;
    /**向前向量 */
    public forward: Laya.Vector3;
    /**单位状态 */
    protected _fsm:Fsm<Unit>;
    /**是否移动 */
    protected _isMove:boolean;

    constructor (fightUserInfo: FightUserInfo) {
        super();

        this._isMove = false;
        this._unitInfo = {
            id: fightUserInfo.id,
            type: fightUserInfo.role.type,
        };
    }
    
    OnInit(): void {
        this._roleModel = this.gameObject;
        this._moveDistance = new Laya.Vector3();
        this.camera = GameManager.gameScene3D.camera;
        // this._currentState = RoleState.none;
        this._isSendMessage = false;
        this._animator = this.gameObject.getComponent(Laya.Animator);

        if (this._animator == null) {
            if (this.gameObject.numChildren > 0) {
                for (let index: number = 0; index < this.gameObject.numChildren; index++) {
                    this._animator = this.gameObject.getChildAt(index).getComponent(Laya.Animator);
                    if (this._animator) {
                        break;
                    }
                }
            }
        }

        this.onInitEntityUnity();
    }

    /**初始化对象属性 */
    protected abstract onInitEntityUnity(): any;

    /**帧频处理 */
    public onUpdateentity()
    {
        
        if(this._fsm)
        {
            this._fsm.Update();
            // if(this._isSendMessage == true) {
            //     if (this._isMove) {
            //         this.move();
            //         this.onSendMessage();
            //     }
            // }
        }
    }

    /**获得向前向量 */
    public getForward (speed: number = this.moveSpeed): void {
        this.forward = new Laya.Vector3();
        this._moveDistance.x = speed;
        this._moveDistance.z = speed;
        Util.getVector(this._moveDistance, this.forward, this._moveAngle);
    }

    /**移动 */
    public move (speed: number = this.moveSpeed): void {
        this.getForward();
        Util.addPosition(this.forward, this.gameObject);
        this.onSendMessage();
    }

    /**落下 */
    public fall (): void {

    }

    /**切换状态 */
    protected OnChangeEntityState(state:RoleState, compel?: boolean) {
        if(this._fsm)
        {
            this._fsm.ChangeState(state, compel); 
            this.onSendMessage();
        }
    }

    /**当前速度 */
    public get moveSpeed():number
    {
        return 0.05;
    }

    /**当前状态 */
    public get currentState (): RoleState {
        if(this._fsm && this._fsm.CurrState)
        {
            return this._fsm.CurrState.onStateType;
        }
        return RoleState.none;
    }

    /**是否移动 */
    public get isMove (): boolean
    {
        return this._isMove;
    }

    /**获得单位信息 */
    public get unitInfo (): UnitInfo {
        return this._unitInfo;
    }

    //----------------------------------------发送消息----------------------------------------

    protected onSendFrameMessage():FrameSyncData
    {
        return null;
    }

    protected onSendMessage()
    {
        if(GameController.gameStateManager)
        {
            if(GameController.mgobeManager && this._isSendMessage)
            {
                GameController.mgobeManager.sendFrame(this.onSendFrameMessage());
            }
        }
    }

    /**获得同步数据处理 */
    public setServerData(data:FrameSyncData)
    {
        if(data)
        {
            this.onHandleMessage(data);
        }
    }

    /**处理接受到的消息 */
    protected onHandleMessage(data:FrameSyncData)
    {

    }
}