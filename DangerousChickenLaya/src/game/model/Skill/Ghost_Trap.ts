import GameMessage from "../../GameMessage";
import GameController from "../../manager/GameController";
import { PlayerRoomState, SendGameServer, SkillServer } from "../DataType";
import Role from "../Role";
import SkillState from "../State/SkillState";
import Skill from "./Skill";

/**
 * 鬼魂捕兽夹
 */
export default class Ghost_Trap extends Skill {

    private role: Role;
    public trap: Laya.Sprite3D;

    public create(id: string, skillServer: SkillServer): void {
        if (this.trap == null) {
            this.role = GameController.roleManager.getRole(id);
            this.role.setCurrentSkill(this);
            (this.role.setAnimation("", false) as SkillState).notChangeStateEnd();

            this.trap = GameController.propManager.createTrap(this.role.gameObject.transform.position);
        }

        Laya.stage.on(GameMessage.MGOBE_RecvFromGameServer, this, this.onRecvFromGameServer);
    }

    public remove(): void {
        Laya.timer.clearAll(this);
        Laya.stage.offAllCaller(this);
    }

    /**收到服务器返回 */
    private onRecvFromGameServer (data: SendGameServer) {
        if(GameController.gameStateManager.ME == PlayerRoomState.gameEnd) return;
        if (data) {
            if (data.cmd == GameMessage.Role_TreadTrap) {
                let role = GameController.roleManager.getRole(data.sendPlayid);
                this.remove();
                this.trap.active = false;
                this.trap.destroy();

                role.moveSpeed = role.moveSpeed-0.02;
                Laya.timer.once(3000, this, () => {
                    role.moveSpeed = role.moveSpeed+0.02;
                });
            }
        }
    }
}