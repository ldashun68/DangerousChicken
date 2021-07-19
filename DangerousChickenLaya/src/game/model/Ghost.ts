import GameManager from "../../rab/Manager/GameManager";
import GameController from "../manager/GameController";
import { GameServerCMD, PlayerRoomState, RoleSkill, RoleState } from "./DataType";
import Role from "./Role";
import RoleMoveRayCast from "./RoleMoveRayCast";
import SkillState from "./State/SkillState";
import DeathState from "./State/DeathState";
import HitState from "./State/HitState";
import IdleState from "./State/IdleState";
import JumpState from "./State/JumpState";
import MoveState from "./State/MoveState";
import Vct3 from "../../rab/model/Vct3";

/**
 * 鬼魂
 */
export default class Ghost extends Role {
    
    private initIdle: boolean;

    protected onInitEntityUnity() {
        super.onInitEntityUnity();
        
        // 调整相机位置
        if (this.unitInfo.id == MGOBE.Player.id) {
            this.camera.transform.rotationEuler = new Laya.Vector3();
            this.camera.transform.localRotationEuler = new Laya.Vector3(0, 180, 0);
            this.camera.transform.position = new Laya.Vector3();
            this.camera.transform.localPosition = new Laya.Vector3(0, 1.5, 0);
            this.camera.transform.localPositionZ = -3.3;
        }

        // 添加射线检测
        if (this._isSendMessage == true) {
            this.roleMoveRayCast = new RoleMoveRayCast();
            this.roleMoveRayCast.role = this;
            this.roleMoveRayCast.startPosY = 1.9;
        }

        // 设置动画名字
        this._fsm = GameManager.fsmManager.Create(this.unitInfo.id,this,[
            new IdleState("",this._animator),
            new MoveState("GrandMother_Run",this._animator),
            new SkillState("",this._animator),
            new JumpState("GrandMother_Jump",this._animator),
            new DeathState("GrandMother_Dead",this._animator),
            new HitState("GrandMother_Hit",this._animator)
        ]);

        // 设置技能列表
        this.skillList.set(RoleSkill.Ghost_StickHit, {
            id: RoleSkill.Ghost_StickHit,
            time: 3000,
            cd: 0,
        });
        this.skillList.set(RoleSkill.Ghost_Trap, {
            id: RoleSkill.Ghost_Trap,
            time: 3000,
            cd: 0,
        });
        this.skillList.set(RoleSkill.Ghost_Shield, {
            id: RoleSkill.Ghost_Shield,
            time: 3000,
            cd: 0,
        });

        this.initIdle = false;
    }

    public idle (): void {
        if (GameController.gameStateManager.ME >= PlayerRoomState.gameLoading) {
            this.setAnimationName("GrandMother_IdleStay");
        }
        else {
            this.setAnimationName("Grandmother_idle");
        }
    }

    /**
     * 点击了技能
     * @param data 
     */
    protected OnClickPlaySkill(index:number)
    {
        if(index ==1)
        {
            this.PlaySkill(RoleSkill.Ghost_StickHit)
        }
        else if(index ==2)
        {
            this.PlaySkill(RoleSkill.Ghost_Trap)
        }
        else if(index ==3)
        {
            this.PlaySkill(RoleSkill.Ghost_Shield)
        }
    }

    protected skill (roleSkill: RoleSkill): void {
        let skillServer: any;
        if (roleSkill == RoleSkill.Ghost_StickHit) {
            skillServer = {
                skill: roleSkill,
                forward: new Vct3(this.forward.x, this.forward.y, this.forward.z),
            }
            GameController.mgobeManager.sendToGameSvr(GameServerCMD.roleSkill, skillServer, this.unitInfo.id);
        }
        else if (roleSkill == RoleSkill.Ghost_Trap) {
            skillServer = {
                skill: roleSkill,
            }
            GameController.mgobeManager.sendToGameSvr(GameServerCMD.roleSkill, skillServer, this.unitInfo.id);
        }
        else if (roleSkill == RoleSkill.Ghost_Shield) {
            skillServer = {
                skill: roleSkill,
            }
            GameController.mgobeManager.sendToGameSvr(GameServerCMD.roleSkill, skillServer, this.unitInfo.id);
        }

        if (skillServer != null) {
            this._isSkill = true;
        }
    }
}