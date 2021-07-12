import BaseState from "../../../rab/Fsm/BaseState";
import { RoleState } from "../DataType";
import Unit from "../Unit";

/**
 * 角色状态基类
 */
export default abstract class ActorState<T> extends BaseState<Unit> {

    protected _animator:Laya.Animator;
    protected _animName:string;
    protected _isLoop:boolean = false;
    private _animTime:number;

    constructor(animName:string,animator:Laya.Animator) {
        super();
        this._animName = animName;
        this._animator = animator;
        this._animTime = this.getAnimTime(animName)*1000
    }

    /**获得状态 */
    public abstract get onStateType():RoleState;

    /**进入状态 */
    protected abstract onEnterState(): any;

    public Enter() {
        this.onEnterState();
        this.onPlayAnim();
    }

    /**播放动画 */
    protected onPlayAnim()
    {
        if(this._animator)
        {
            this._animator.speed = 1;
            this._animator.crossFade(this._animName, 0.1);
        }
        if(!this._isLoop)
        {
            Laya.timer.clear(this, this.onAnimPlayEnd);
            Laya.timer.once(this._animTime, this, this.onAnimPlayEnd);
        }
    }

    /**
     * 播放多个组合动画
     * @param arr 0-动画名字，1-动画层级
     */
    protected onPlayAnimList(arr: Array<Array<any>> = null)
    {
        if(this._animator != null) {
            this._animator.crossFade(this._animName, 0.1, 0);
            arr.forEach((value: Array<any>, index: number) => {
                this._animator.crossFade(value[0], 0.1, value[1]);
            });
        }
    }

    /**动画播放完成 */
    protected onAnimPlayEnd()
    {
        console.log("动作",this._animName,"播放完了");
    }

    /**
     * 动画时间
     * @param animName 
     * @returns 
     */
    private getAnimTime(animName:string):number
    {
        if(this._animator && this._animator.getControllerLayer(0).getAnimatorState(animName))
        {
           return this._animator.getControllerLayer(0).getAnimatorState(animName).clip.duration();
        }
        return 1;
    }

    /**帧循环 */
    public Update() {
        
    }

    /**离开状态 */
    public Leave() {
        
    }

    /**销毁 */
    public Destroy() {
        
    }
}