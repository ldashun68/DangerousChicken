import GameManager from "../../../rab/Manager/GameManager";
import Util from "../../../rab/Util";
import GameMessage from "../../GameMessage";
import GameController from "../../manager/GameController";
import Child from "../Child";
import { GameServerCMD, PropType, SkillServer, TaskType } from "../DataType";
import SkillState from "../State/SkillState";
import Skill from "./Skill";

/**
 * 小孩双手操控
 */
export default class Child_Control extends Skill {

    private role: Child;
    /**技能状态 */
    private skillState: SkillState;
    /**道具类型 */
    private propType: PropType;

    public create(id: string, skillServer: SkillServer): void {
        this.role = GameController.roleManager.getRole(id) as Child;
        if (this.onHandControl() == true) {
            this.skillState = this.role.setAnimation("Girl_Contact", true, true) as SkillState;
            this.role.setCurrentSkill(this);
            Laya.timer.once(5000, this, this.handControl);
        }
        else {
            this.role.outSkillFail(skillServer.skill);
        }
    }

    public remove(): void {
        Laya.timer.clearAll(this);
    }

    /**是否附近有道具 */
    private onHandControl (): boolean {
        let bool: boolean = false;
        let isRscue = GameController.roleManager.isRscue();
        let isPart = GameController.doorManager.isHavePart();
        let collider = GameManager.gameScene3D.scene3D.getChildByName("collider") as Laya.Sprite3D;
        let prop = collider.getChildByName("prop") as Laya.Sprite3D;

        for (let index: number = 0; index < prop.numChildren; index++) {
            let item = this.role.findChildAt(prop, index);
            let distance: number = Util.getDistanceV3(item.transform.position, this.role.gameObject.transform.position, "y");
            let gap = (item.name.indexOf(PropType.spanner) != -1)? 3:1;
            if (distance < gap && Math.abs(item.transform.position.y - this.role.gameObject.transform.position.y) < 2) {
                // 判断道具类型
                for (let index in PropType) {
                    if (item.name.indexOf(PropType[index]) != -1) {
                        if (index == PropType.rescue) {
                            // 救援
                            bool = isRscue;
                        }
                        else if (index == PropType.spanner) {
                            // 大门扳手
                            bool = isPart;
                        }
                        else {
                            bool = true;
                        }
                    }
                    
                    if (bool == true) {
                        this.propType = PropType[index];
                        break;
                    }
                }
            }
        }
        return bool;
    }

    /**手部操控 */
    private handControl () {
        this.skillState.onAnimPlayEnd();
        let isRscue = GameController.roleManager.isRscue();

        if (this.role.unitInfo.id == MGOBE.Player.id) {
            // 判断道具类型
            if (this.propType == PropType.rescue) {
                if (isRscue == true) {
                    // 救援
                    GameController.mgobeManager.sendToGameSvr(GameServerCMD.roleRescue, {});
                    this.role.SendMessage(GameMessage.Role_Task, TaskType.Child_RescueChild);
                }
            }
            else if (this.propType == PropType.keyBox) {
                // 钥匙宝箱
                GameController.mgobeManager.sendToGameSvr(GameServerCMD.roleGetKeyBox, {});
            }
            else if (this.propType == PropType.partBox) {
                // 零件宝箱
                GameController.mgobeManager.sendToGameSvr(GameServerCMD.roleGetPartBox, {});
            }
            else if (this.propType == PropType.stones) {
                // 石堆
                GameController.mgobeManager.sendToGameSvr(GameServerCMD.roleGetStones, {});
            }
            else if (this.propType == PropType.spanner) {
                // 大门扳手
                GameController.mgobeManager.sendToGameSvr(GameServerCMD.roleSpanner, {});
            }
        }
    }
}