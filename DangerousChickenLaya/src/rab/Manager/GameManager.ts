/**
 * 游戏管理器
 * @author Rabbit
 */

import FsmManager from "../Fsm/FsmManager";
import GameLogicManager from "./GameLogicManager";
import GameScene3D from "./GameScene3D";
import { RabManager, UIManager, MusicManager } from "./RabManager";


class GameManager {

    private managerList: Map<{ new(node) }, Object> = new Map<{ new(node) }, Object>();

    /**
     * 添加管理器
     * @param c 
     */
    public addManager<T extends RabManager >(c: { new(node): T },node?:Laya.Sprite): T
    {
        // Util.Log("添加管理器：",c);
        if (!this.managerList.has(c)) {
            let obj = new c(node);
            this.managerList.set(c, obj);
            return obj;
        }else{
            console.log("管理器已经有了：");
        }
        return <T>this.managerList.get(c)
    }

    /**
     * 获得管理器
     * @param c 
     */
    public getManager<T>(c: { new(): T }):T
    {
        if (this.managerList.has(c)) {
            return <T>this.managerList.get(c)
        }
        return null
    }

    /**
     * 获得管理器
     * @param c 
     */
    public removeManager<T>(c: { new(): T }):T
    {
        if (this.managerList.has(c)) {
        (<RabManager>this.managerList.get(c)).onDestroy();
            this.managerList.delete(c);
        }
        return null
    }

    /**
     * ui管理器
     */
    public get uimanager():UIManager
    {
        return this.getManager(UIManager);
    }

    /**
     * 音效管理器
     */
    public get musicManager():MusicManager
    {
        return this.getManager(MusicManager);
    }

    /**
     * 3D基础场景
     */
    public get gameScene3D():GameScene3D
    {
        return this.getManager(GameScene3D);
    }
    
    /**
     * 3D基础场景
     */
    public get gameLogicManager():GameLogicManager
    {
        return this.getManager(GameLogicManager);
    }

    /**
     * 状态机管理器
     */
    public get fsmManager():FsmManager
    {
        return this.getManager(FsmManager);
    }
}

export default new GameManager();