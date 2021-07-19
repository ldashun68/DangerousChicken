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
        this._animTime = this.getAnimTime(animName)*1000;
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
        if (this._animName == "") {
            return;
        }
        
        console.log("动作",this._animName,"开始播放");
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
        else {
            Laya.timer.clear(this, this.onPlayAnim);
            Laya.timer.once(this._animTime, this, this.onPlayAnim);
        }
    }

    /**
     * 播放多个组合动画
     * @param arr 0-动画名字，1-动画层级
     */
    public onPlayAnimList(arr: Array<Array<any>> = null)
    {
        if(this._animator != null) {
            arr.forEach((value: Array<any>, index: number) => {
                this._animator.crossFade(value[0], 0.1, value[1]);
            });
        }
    }

    /**动画播放完成 */
    protected onAnimPlayEnd()
    {
        console.log("动作",this._animName,"播放完了");
        Laya.timer.clear(this, this.onPlayAnim);
    }

    /**
     * 动画时间
     * @param animName 
     * @returns 
     */
    public getAnimTime(animName:string, layer: number = 0):number
    {
        if(this._animator && this._animator.getControllerLayer(layer).getAnimatorState(animName))
        {
           return this._animator.getControllerLayer(layer).getAnimatorState(animName).clip.duration();
        }
        return 1;
    }

    /**设置动画 */
    public setAnimation (animName: string, isPlay: boolean, isLoop: boolean) {
        this._animName = animName;
        this._animTime = this.getAnimTime(animName)*1000;
        this._isLoop = isLoop;

        if (isPlay == true) {
            this.onPlayAnim();
        }
    }

    public set animName (animName: string) {
        this._animName = animName;
    }

    public get animName (): string {
        return this._animName;
    }

    /**帧循环 */
    public Update() {
        
    }

    /**离开状态 */
    public Leave() {
        Laya.timer.clearAll(this);
    }

    /**销毁 */
    public Destroy() {
        Laya.timer.clearAll(this);
    }
}