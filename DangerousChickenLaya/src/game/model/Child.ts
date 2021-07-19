import GameManager from "../../rab/Manager/GameManager";
import Vct3 from "../../rab/model/Vct3";
import Util from "../../rab/Util";
import GameMessage from "../GameMessage";
import GameController from "../manager/GameController";
import { GameServerCMD, PlayerRoomState, PropType, RoleSkill, RoleState } from "./DataType";
import Role from "./Role";
import RoleMoveRayCast from "./RoleMoveRayCast";
import SkillState from "./State/SkillState";
import DeathState from "./State/DeathState";
import FallState from "./State/FallState";
import HitState from "./State/HitState";
import IdleState from "./State/IdleState";
import JumpDownState from "./State/JumpDownState";
import JumpState from "./State/JumpState";
import MoveState from "./State/MoveState";
import Unit from "./Unit";
import SafeState from "./State/SafeState";

/**
 * 小孩
 */
export default class Child extends Role {
    
    /**落下坐标 */
    private startFallPos: Laya.Vector3;
	private endFallPos: Laya.Vector3;

    /**是否被关禁闭 */
    private _isCage: boolean;
    /**跳跃高度 */
    public jumpHeight: number;
    /**石头数量 */
    private _stoneCount: number;

    private initIdle: boolean;

    protected onInitEntityUnity() {
        super.onInitEntityUnity();
        
        // 调整相机位置
        if (this.unitInfo.id == MGOBE.Player.id) {
            this.camera.transform.rotationEuler = new Laya.Vector3();
            this.camera.transform.localRotationEuler = new Laya.Vector3(0, 180, 0);
            this.camera.transform.position = new Laya.Vector3();
            this.camera.transform.localPosition = new Laya.Vector3(0, 1.5, 0);
            this.camera.transform.localPositionZ = -3;
        }

        // 添加射线检测
        if (this._isSendMessage == true) {
            this.roleMoveRayCast = new RoleMoveRayCast();
            this.roleMoveRayCast.role = this;
            this.roleMoveRayCast.startPosY = 1.3;
        }

        // 设置动画名字
        this._fsm = GameManager.fsmManager.Create(this.unitInfo.id,this,[
            new IdleState("",this._animator),
            new MoveState("Girl_Run",this._animator),
            new SkillState("",this._animator),
            new JumpState("Girl_Jump",this._animator),
            new JumpDownState("Girl_JumpDown",this._animator),
            new FallState("Girl_Jump",this._animator),
            new DeathState("Girl_Dead",this._animator),
            new HitState("Dorothy_Hurt",this._animator),
            new SafeState("Girl_IdleStay",this._animator)
        ]);

        // 设置技能列表
        this.skillList.set(RoleSkill.Child_Control, {
            id: RoleSkill.Child_Control,
            time: 0,
            cd: 0,
        });
        this.skillList.set(RoleSkill.Child_ThrowStone, {
            id: RoleSkill.Child_ThrowStone,
            time: 3000,
            cd: 0,
        });

        this.initIdle = false;
        this._isCage = false;
        this._isSkill = false;
        this.jumpHeight = 0;
        this._stoneCount = 3;
    }

    public idle (): void {
        if (GameController.gameStateManager.ME >= PlayerRoomState.gameLoading) {
            this.setAnimationName("Girl_IdleStay");
        }
        else {
            this.setAnimationName("Girl_IdleFacial");
        }
    }

    public jump()
    {
        if (this.jumpHeight > 0) {
            Util.addPosition(new Laya.Vector3(0, 0.05, 0), this.gameObject, false);
            this.jumpHeight -= 0.05;
            this.onSendMessage();
        }
    }

    /**落下 */
    public fall (): void {
        if (this.startFallPos == null || this.endFallPos == null) {
            return;
        }

		let pos: Laya.Vector3 = new Laya.Vector3();
		Laya.Vector3.lerp(this.startFallPos, this.endFallPos, 0.08, pos);
        let posY: number = this.startFallPos.y-0.05;
        pos.y = (pos.y > posY)? posY:pos.y;
        Util.setPosition(new Laya.Vector3(NaN, pos.y, NaN), this.gameObject);
		this.startFallPos.y = pos.y;

		if (pos.y <= this.endFallPos.y+0.05) {
			this.roleMoveRayCast.isFall = false;
            Util.setPosition(new Laya.Vector3(NaN, this.endFallPos.y, NaN), this.gameObject);
            this.OnChangeEntityState(RoleState.jumpDown, true);

            this.startFallPos = null;
            this.endFallPos = null;
		}
        this.onSendMessage();
    }

    /**找到石头 */
    public findStone (): void {
        this._stoneCount++;
        this.SendMessage(GameMessage.Role_UpdateStone);
    }

    public death (): void {
        if (GameController.gameStateManager.ME >= PlayerRoomState.gameLoading) {
            this._isCage = true;
            this._isSkill = false;
            let cagePos = GameManager.gameScene3D.scene3D.getChildByName("cagePos") as Laya.Sprite3D;
            let pos = Util.getNewVector3(cagePos.transform.position);
            pos = new Laya.Vector3(pos.x+Math.random()*4-2, pos.y, pos.z+Math.random()*8-4);
            this.gameObject.transform.position = pos;
            this.prior = pos;
            this.move(0);

            if (GameController.roleManager.isGhostWin() == false) {
                this.OnChangeEntityState(RoleState.idle, true);
            }
        }
        else {
            this.OnChangeEntityState(RoleState.idle, true);
        }
    }

    /**落下 */
    public onFall (endFallPos: Laya.Vector3) {
        this.startFallPos = new Laya.Vector3(0, this.gameObject.transform.position.y, 0);
        this.endFallPos = endFallPos;
        this.OnChangeEntityState(RoleState.fall, true);
    }

    /**
     * 点击了技能
     * @param data 
     */
    protected OnClickPlaySkill(index:number) {
        if (this.currentState == RoleState.death || this.currentState == RoleState.safe) {
            return;
        }

        if(index ==1) {
            if (GameController.gameStateManager.ME >= PlayerRoomState.gameLoading) {
                this.PlaySkill(RoleSkill.Child_Control)
            }
        }
        else if(index ==2) {
            if(this.OnChangeEntityState(RoleState.jump)) {
                this.jumpHeight = 1.25;
            }
        }
        else if(index ==3) {
            if(GameController.gameStateManager.ME >= PlayerRoomState.gameLoading) {
                if (this._stoneCount > 0) {
                    if (this.PlaySkill(RoleSkill.Child_ThrowStone) == true) {
                        this._stoneCount--;
                        this.SendMessage(GameMessage.Role_UpdateStone);
                    }
                }
            }
            else {
                this.PlaySkill(RoleSkill.Child_ThrowStone);
            }
        }
    }

    protected skill (roleSkill: RoleSkill): void {
        let skillServer: any;
        if (roleSkill == RoleSkill.Child_ThrowStone) {
            skillServer = {
                skill: roleSkill,
                forward: new Vct3(this.forward.x, this.forward.y, this.forward.z),
            }
            GameController.mgobeManager.sendToGameSvr(GameServerCMD.roleSkill, skillServer, this.unitInfo.id);
        }
        else if (roleSkill == RoleSkill.Child_Control) {
            skillServer = {
                skill: roleSkill,
            }
            GameController.mgobeManager.sendToGameSvr(GameServerCMD.roleSkill, skillServer, this.unitInfo.id);
        }

        if (skillServer != null) {
            this._isSkill = true;
        }
    }

    /**是否被关禁 */
    public set isCage (_isCage: boolean) {
        this._isCage = _isCage;
    }

    /**是否被关禁 */
    public get isCage (): boolean {
        return this._isCage;
    }

    public get stoneCount (): number {
        return this._stoneCount;
    }
}