import GameManager from "../../rab/Manager/GameManager";
import GameStateManager from "./GameStateManager";
import MgobeManager from "./MgobeManager";
import ViewConfig from "../ViewConfig";
import ResourceManager from "./ResourceManager";
import RoleManager from "./RoleManager";
import { PlayerRoomState } from "../model/DataType";

/**游戏控制器 */
class GameController {
    
    private _mgobeManager:MgobeManager;
    private _gameStateManager:GameStateManager;
    private _resourceManager:ResourceManager;
    private _roleManager:RoleManager;

    public onInitHall()
    {
        this._resourceManager = GameManager.addManager(ResourceManager);
        this._gameStateManager = GameManager.addManager(GameStateManager);
    }

    public onInitRoom()
    {
        this._roleManager = GameManager.addManager(RoleManager);
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
        GameManager.removeManager(RoleManager);

        if (this.gameStateManager.ME <= PlayerRoomState.gameLoading) {
            GameManager.uimanager.onCloseView(ViewConfig.WaitingRoomView);
            GameManager.uimanager.onCreateView(ViewConfig.HallView);
        }
        else {

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