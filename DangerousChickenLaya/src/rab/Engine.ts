
import GameManager from "./Manager/GameManager";
import { MusicManager, UIManager } from "./Manager/RabManager";
import GameLogicManager from "./Manager/GameLogicManager";
import GameScene3D from "./Manager/GameScene3D";
import ViewConfig from "../game/ViewConfig";
import FsmManager from "./Fsm/FsmManager";


export default class Engine {

    private sceneNode:Laya.Sprite;
    private uiNode:Laya.Sprite;
    private topUiNode:Laya.Sprite;
    
    constructor()
    {
        this.onInit()
    }

    private onInit()
    {
        this.sceneNode = new Laya.Sprite();
        this.uiNode = new Laya.Sprite();
        this.topUiNode = new Laya.Sprite();
        Laya.stage.addChild(this.sceneNode);
        Laya.stage.addChild(this.uiNode);
        Laya.stage.addChild(this.topUiNode);

        fgui.GRoot.inst.displayObject.zOrder = 2;
        fgui.GRoot.inst.width = Laya.stage.designWidth;
        fgui.GRoot.inst.height = Laya.stage.designHeight;
        fairygui.UIConfig.packageFileExtension = 'txt';
        this.uiNode.addChild(fgui.GRoot.inst.displayObject);
        GameManager.addManager(MusicManager);
        GameManager.addManager(UIManager,this.uiNode);
        GameManager.addManager(ViewConfig);
        GameManager.addManager(GameLogicManager);
        GameManager.addManager(FsmManager);
        GameManager.addManager(GameScene3D,this.sceneNode);

        GameManager.uimanager.onCreateView(ViewConfig.InitLoadView);
    }
}