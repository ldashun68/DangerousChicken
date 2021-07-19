import Util from "../../../rab/Util";
import GameMessage from "../../GameMessage";
import GameController from "../../manager/GameController";
import Child from "../Child";
import { AttackMessage, GameServerCMD, Ghost_StickHitServer, RoleState, SkillServer, TaskType } from "../DataType";
import Skill from "./Skill";

/**
 * 鬼魂棍击
 */
export default class Ghost_StickHit extends Skill {

    public create(id: string, skillServer: Ghost_StickHitServer): void {
        let role = GameController.roleManager.getRole(id);
        role.setAnimation("GrandMother_Atk", true);
        role.setCurrentSkill(this);

        let forward = new Laya.Vector3(skillServer.forward.x, skillServer.forward.y, skillServer.forward.z);
        Laya.Vector3.scale(forward, 10, forward);
        let pos: Laya.Vector3 = Util.getNewVector3(role.gameObject.transform.position);
        Laya.Vector3.add(pos, forward, pos);
        
        Laya.timer.once(500, this, () => {
            let list: Array<Child> = GameController.roleManager.getAllChild();
            list.forEach((value: Child, index: number) => {
                if (value.currentState != RoleState.death) {
                    let distance: number = Util.getDistanceV3(pos, value.gameObject.transform.position, "y");
                    if (distance <= 1.5) {
                        let attackMessage: AttackMessage = {
                            attackerID: role.unitInfo.id,
                            injuredID: value.unitInfo.id,
                        }
                        if (role.unitInfo.id == MGOBE.Player.id) {
                            role.SendMessage(GameMessage.Role_Task, TaskType.Ghost_ImprisonChild);
                            GameController.mgobeManager.sendToGameSvr(GameServerCMD.roleHit, attackMessage);
                        }
                    }
                }
            });
        });
    }

    public remove(): void {
        
    }
}