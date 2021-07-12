import RabView from "../../rab/RabView";
import GameController from "../manager/GameController";
import GameMessage from "../GameMessage";
import GameManager from "../../rab/Manager/GameManager";

export default class SelectModeView extends RabView {
    
    protected _view: fgui.GComponent;
    private modelList:fgui.GList;

    protected OnInit() {
        this._path = "res/UI/SelectModeView";
        this. _pkgName = "SelectModeView";
        this. _resName = "Main";
    }

    onResize() {
        let scaleX = Laya.stage.width/Laya.stage.designWidth;
        if (scaleX > 1) {
            this._view.getChildAt(0).scaleX = scaleX;
        }
    }

    protected InitView() {
        this._view.getChild("close").asCom.on(Laya.Event.MOUSE_DOWN,this,  ()=> {
            //TODO: 关闭房前页面 创新显示大厅的3d角色
            this.SendMessage(GameMessage.HallView_ShowRole);
            this.OnCloseView();
        });

        this.modelList = this._view.getChild("list").asList;
        for(var i =0; i<7; i++) {
            let item:fgui.GComponent;
            if (i < this.modelList.numItems) {
                item = this.modelList.getChildAt(i).asCom;
            }else {
                item = this.modelList.addItemFromPool(this.modelList.getChildAt(0).asCom.resourceURL).asCom;
            }
            item.getChild("type").text = "Escape_"+i;
            item.getChild("count").text = i+"";
            item.getChild("icon").asLoader.url = "ui://SelectModeView/icon_"+i;
            item.onClick(this, this.onJsonRoom, ["Escape_"+i]);
        }

        this.AddListenerMessage(GameMessage.MGOBE_EnterRoomFinish,this.onEnterRoom);
    }

    /**
     * 加入选择模式房间
     * @param type 
     */
    onJsonRoom(type:string)
    {
        if (GameManager.gameLogicManager.isHaveRole() == true) {
            if(this._viewdata[0] == 1) {
               //TODO 自己创建房间 这里先直接自动创建，后面需要加一个页面
                //GameController.mgobeManager.CreateRoom("恐怖房屋",type);
            }
            else {
                //TODO 快速进入同类是房间
                //GameController.mgobeManager.onQuickPlay(type)
            }
        }
    }

    /**进入房间成功 */
    onEnterRoom()
    {
        this.OnCloseView();
    }
}