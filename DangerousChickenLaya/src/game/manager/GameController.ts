import GameManager from "../../rab/Manager/GameManager";
import GameStateManager from "./GameStateManager";
import MgobeManager from "./MgobeManager";
import ViewConfig from "../ViewConfig";
import ResourceManager from "./ResourceManager";
import RoleManager from "./RoleManager";
import { PlayerRoomState } from "../model/DataType";
import DoorManager from "./DoorManager";
import PropManager from "./PropManager";
import SkillManager from "./SkillManager";
import TaskManager from "./TaskManager";

/**游戏控制器 */
class GameController {
    
    private _mgobeManager:MgobeManager;
    private _gameStateManager:GameStateManager;
    private _resourceManager:ResourceManager;
    private _roleManager:RoleManager;
    private _doorManager:DoorManager;
    private _propManager:PropManager;
    private _skillManager:SkillManager;
    private _taskManager:TaskManager;

    public onInitHall()
    {
        this._resourceManager = GameManager.addManager(ResourceManager);
        this._gameStateManager = GameManager.addManager(GameStateManager);
        this._roleManager = GameManager.addManager(RoleManager);
        this._doorManager = GameManager.addManager(DoorManager);
        this._propManager = GameManager.addManager(PropManager);
        this._skillManager = GameManager.addManager(SkillManager);
        this._taskManager = GameManager.addManager(TaskManager);
    }

    /**通信管理器 */
    public get mgobeManager():MgobeManager
    {
        if(!this._mgobeManager)
        {
            this._mgobeManager = GameManager.getManager(MgobeManager);
        }
        return this._mgobeManager
    }

    /**状态管理器 */
    public get gameStateManager():GameStateManager
    {
        if(!this._gameStateManager)
        {
            this._gameStateManager = GameManager.getManager(GameStateManager);
        }
        return this._gameStateManager
    }

    /**资源管理器 */
    public get resourceManager():ResourceManager
    {
        if(!this._resourceManager)
        {
            this._resourceManager = GameManager.getManager(ResourceManager);
        }
        return this._resourceManager
    }

    /**角色管理器 */
    public get roleManager():RoleManager
    {
        if(!this._roleManager)
        {
            this._roleManager = GameManager.getManager(RoleManager);
        }
        return this._roleManager;
    }

    /**门管理器 */
    public get doorManager():DoorManager
    {
        if(!this._doorManager)
        {
            this._doorManager = GameManager.getManager(DoorManager);
        }
        return this._doorManager;
    }

    /**道具管理器 */
    public get propManager():PropManager
    {
        if(!this._propManager)
        {
            this._propManager = GameManager.getManager(PropManager);
        }
        return this._propManager;
    }

    /**技能管理器 */
    public get skillManager():SkillManager
    {
        if(!this._skillManager)
        {
            this._skillManager = GameManager.getManager(SkillManager);
        }
        return this._skillManager;
    }

    /**任务管理器 */
    public get taskManager():TaskManager
    {
        if(!this._taskManager)
        {
            this._taskManager = GameManager.getManager(TaskManager);
        }
        return this._taskManager;
    }

    /**离开房间 */
    public leaveRoom()
    {
        if(this._mgobeManager)
        {
            this._mgobeManager.leaveRoom(()=>{
                this.gameOver();
            });
        }
    }

    /**游戏结束 */
    public gameOver()
    {
        this._roleManager.removeRole(null);
        this._skillManager.removeSkill();
        this._propManager.removeProp();

        if (this.gameStateManager.ME <= PlayerRoomState.gameLoading) {
            GameManager.uimanager.onCloseView(ViewConfig.WaitingRoomView);
            GameManager.uimanager.onCreateView(ViewConfig.HallView);
        }
        else {
            GameManager.gameScene3D.onRemoveScene();
            GameManager.uimanager.onCloseView(ViewConfig.GameView);
            GameManager.uimanager.onCloseView(ViewConfig.JoystickView);
            GameManager.uimanager.onCreateView(ViewConfig.OverView);
        }
    }
    
    public load3dRes(url:any)
    {
        if(url instanceof Array)
        {
            for(var i = 0;i<url.length;i++)
            {
                Laya.loader.setGroup(url[i],"fightRes")
            }
        }else{
            Laya.loader.setGroup(url,"fightRes")
        }
    }
}

export default new GameController();