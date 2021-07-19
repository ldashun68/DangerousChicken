import { RabManager } from "../../rab/Manager/RabManager";
import Vct3 from "../../rab/model/Vct3";
import GameMessage from "../GameMessage";
import { GameServerCMD, PlayerRoomState, RoleSkill, RoleState, SendGameServer, SkillServer } from "../model/DataType";
import Child_Control from "../model/Skill/Child_Control";
import Child_ThrowStone from "../model/Skill/Child_ThrowStone";
import Ghost_Shield from "../model/Skill/Ghost_Shield";
import Ghost_StickHit from "../model/Skill/Ghost_StickHit";
import Ghost_Trap from "../model/Skill/Ghost_Trap";
import Skill from "../model/Skill/Skill";
import GameController from "./GameController";

/**
 * 技能管理器
 */
export default class SkillManager extends RabManager {

    private classList: Map<string, any>;
    private skillList: Array<Skill>;

    protected OnInit() {
        this.skillList = [];
        this.classList = new Map<string, any>();
        this.classList.set(RoleSkill.Child_ThrowStone, Child_ThrowStone);
        this.classList.set(RoleSkill.Child_Control, Child_Control);
        this.classList.set(RoleSkill.Ghost_StickHit, Ghost_StickHit);
        this.classList.set(RoleSkill.Ghost_Trap, Ghost_Trap);
        this.classList.set(RoleSkill.Ghost_Shield, Ghost_Shield);

        this.AddListenerMessage(GameMessage.MGOBE_RecvFromGameServer, this.onRecvFromGameServer);
    }

    /**删除技能 */
    public removeSkill (): void {
        this.skillList.forEach((value: Skill, index: number) => {
            value.remove();
        });
    }

    /**收到服务器返回 */
    private onRecvFromGameServer (data: SendGameServer) {
        if (GameController.gameStateManager.ME == PlayerRoomState.gameEnd) return;
        if (data) {
            if (data.cmd == GameServerCMD.roleSkill) {
                let skillServer: SkillServer = data.data;
                let _class = this.classList.get(skillServer.skill);
                if (_class != null) {
                    let role = GameController.roleManager.getRole(data.sendPlayid);
                    if (role != null) {
                        role.OnChangeEntityState(RoleState.skill);
                        let skill: Skill = new _class();
                        skill.create(data.sendPlayid, skillServer);
                        this.skillList.push(skill);
                    }
                }
            }
            else if (data.cmd == GameMessage.Role_Sync) {
                if (GameController.roleManager.joinPlayerId.length == 0) {
                    // 创建鬼魂捕兽夹
                    if (data.data.trap != null && GameController.propManager.getAllTrap().length == 0) {
                        let trap: Array<Vct3> = data.data.trap;
                        trap.forEach((value: Vct3, index: number) => {
                            let skill: Ghost_Trap = new Ghost_Trap();
                            skill.trap = GameController.propManager.createTrap(new Laya.Vector3(value.x, value.y, value.z));
                            skill.create(null, null);
                            this.skillList.push(skill);
                        });
                    }
                }
            }
        }
    }
}