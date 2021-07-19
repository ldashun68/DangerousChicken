import Util from "../../../rab/Util";
import GameController from "../../manager/GameController";
import { SkillServer } from "../DataType";
import Role from "../Role";
import Skill from "./Skill";

/**
 * 鬼魂盾牌
 */
export default class Ghost_Shield extends Skill {

    private role: Role;
    private shield: Laya.MeshSprite3D;

    public create(id: string, skillServer: SkillServer): void {
        this.role = GameController.roleManager.getRole(id);
        this.role.setAnimation("GrandMother_BlockStay", true);
        this.role.setCurrentSkill(this);

        this.shield = Laya.loader.getRes("units/Conventional/shield.lh").clone() as Laya.MeshSprite3D;
        this.role.roleModel.addChild(this.shield);
        (this.shield.getChildAt(0) as Laya.MeshSprite3D).meshRenderer.enable = false;
        this.shield.transform.position = new Laya.Vector3();
        this.shield.transform.localPosition = new Laya.Vector3();
        this.shield.transform.localPositionZ += 1;
        this.shield.name = this.role.unitInfo.id;

        Laya.timer.once(this.role.getAnimTime("GrandMother_BlockStay")*1000, this, () => {
            this.remove();
            this.shield.active = false;
            this.shield.destroy();
        });
    }

    public remove(): void {
        Laya.timer.clearAll(this);
        Laya.stage.offAllCaller(this);
    }
}