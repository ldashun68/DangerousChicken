import GameManager from "../rab/Manager/GameManager";
import { RabManager } from "../rab/Manager/RabManager";
import GameView from "./view/GameView";
import HallView from "./view/HallView";
import InitLoadView from "./view/InitLoginView";
import JoystickView from "./view/JoystickView";
import LoadingView from "./view/LoadingView";
import OverView from "./view/OverView";
import WaitingRoomView from "./view/WaitingRoomView";

export default class ViewConfig extends RabManager {

    static InitLoadView = "InitLoadView";
    static HallView = "HallView";
    static LoadingView = "LoadingView";
    static WaitingRoomView = "WaitingRoomView";
    static JoystickView = "JoystickView";
    static GameView = "GameView";
    static OverView = "OverView";
    
    protected OnInit() {
        GameManager.uimanager.regClass("InitLoadView",InitLoadView);
        GameManager.uimanager.regClass("HallView",HallView);
        GameManager.uimanager.regClass("LoadingView",LoadingView);
        GameManager.uimanager.regClass("WaitingRoomView",WaitingRoomView);
        GameManager.uimanager.regClass("JoystickView",JoystickView);
        GameManager.uimanager.regClass("GameView",GameView);
        GameManager.uimanager.regClass("OverView",OverView);
    }
}