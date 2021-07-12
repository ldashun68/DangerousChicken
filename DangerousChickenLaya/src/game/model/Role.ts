import GameManager from "../../rab/Manager/GameManager";
import Vct3 from "../../rab/model/Vct3";
import Util from "../../rab/Util";
import GameMessage from "../GameMessage";
import GameController from "../manager/GameController";
import { FrameSyncRoleData, PlayerRoomState, RoleState } from "./DataType";
import RoleMoveRayCast from "./RoleMoveRayCast";
import Unit from "./Unit";

export default class Role extends Unit {
    
    /**天空盒 */
    protected sky: Laya.Sprite3D;
    /**角色移动射线检测 */
    protected roleMoveRayCast: RoleMoveRayCast;

    /**其他角色数据 */
    protected otherRole: Array<FrameSyncRoleData>;
    /**角度偏移值 */
    protected dangle:number;
    /**记录前一个坐标 */
    public prior: Laya.Vector3;

    protected onInitEntityUnity() {
        this._moveAngle = 0;
        this._roleModel = this.gameObject.getChildAt(0) as Laya.Sprite3D;

        this.otherRole = [];
        this.dangle = this.gameObject.transform.localRotationEulerY;
        this.prior = Util.getNewVector3(this.gameObject.transform.position);

        // 设置天空盒
        if (GameController.gameStateManager.ME >= PlayerRoomState.gameLoading && this.unitInfo.id == MGOBE.Player.id) {
            this.sky = GameManager.gameScene3D.scene3D.getChildByName("gameroom").getChildByName("SkyDome") as Laya.Sprite3D;
            this.sky.transform.position = this.gameObject.transform.position;
            this.sky.transform.localPosition = new Laya.Vector3();
            this.sky.transform.setWorldLossyScale(new Laya.Vector3(100, 100, 100));
        }

        // 添加射线检测
        this._isSendMessage = this.unitInfo.id == MGOBE.Player.id;
        if (this._isSendMessage == true) {
            this.AddListenerMessage(GameMessage.JoystickMoving, this.OnChangeEntityState);
            this.AddListenerMessage(GameMessage.JoystickUp, this.OnChangeEntityState);
        }
    }

    /**帧频 */
    public onUpdateentity()
    {
        if (this.roleMoveRayCast != null) {
            this.roleMoveRayCast.down();
        }

        if (this.otherRole.length > 0) {
            this.otherRoleMove();
        }

        super.onUpdateentity();
    }

    /**移动 */
    public move (speed: number): void {
        if (this.roleMoveRayCast.forward() == false) {
            this.prior = Util.getNewVector3(this.gameObject.transform.position);

            super.move(speed);
        }
    }

    /**其他玩家移动 */
    protected otherRoleMove (): void {
        let frame: FrameSyncRoleData = this.otherRole.shift();
        Util.setPosition(frame.point as Laya.Vector3, this.gameObject);
        this._roleModel.transform.localRotationEulerY = frame.rotationY;
    }

    /**切换状态 */
    public OnChangeEntityState(state:RoleState, compel?: boolean, ...data: any) {
        switch (state) {
            case RoleState.idle:
                this._isMove = false;
                break;
            case RoleState.move:
                this._isMove = true;
                this.onMove(data[0]);
                break;
            default:
                break;
        }

        super.OnChangeEntityState(state, compel);
    }

    /**移动 */
    private onMove(angle: any) {
        this._moveAngle = this.dangle-140-angle;
        this._roleModel.transform.localRotationEulerY = 270-angle;
    }

    /**相机旋转 */
    public cameraRotation(x:number, y:number)
    {
        if(Math.abs(x) > Math.abs(y))
        {
            if(x > 0)
            {
                this.gameObject.transform.localRotationEulerY += 2;
                this._roleModel.transform.localRotationEulerY -= 2;
            }
            else
            {
                this.gameObject.transform.localRotationEulerY -= 2;
                this._roleModel.transform.localRotationEulerY += 2;
            }
            this.dangle = this.gameObject.transform.localRotationEulerY;
        }
        else
        {
            if(y > 0)
            {
                if(this.camera.transform.localRotationEulerX > -25)
                {
                    this.camera.transform.localPositionY += 0.017;
                    this.camera.transform.localRotationEulerX -= 0.5;
                }
            }
            else
            {
                if(this.camera.transform.localRotationEulerX < 0)
                {
                    this.camera.transform.localPositionY -= 0.017;
                    this.camera.transform.localRotationEulerX += 0.5;
                }
            }
        }
    }

    onDestroy () {
        GameManager.fsmManager.DestroyFsm(this._fsm.FsmId);
        super.onDestroy();
    }

    //--------------------发送消息------------------------------

    /**发送数据 */
    protected onSendFrameMessage():FrameSyncRoleData
    {
        let data: FrameSyncRoleData = {
            id: "player"+MGOBE.Player.id,
            state: this.currentState,
            point: new Vct3(
                this.gameObject.transform.position.x,
                this.gameObject.transform.position.y,
                this.gameObject.transform.position.z
            ),
            rotationY: this._roleModel.transform.localRotationEulerY,
        }
        return data;
    }
}