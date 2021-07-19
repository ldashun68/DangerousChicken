import GameManager from "../../../rab/Manager/GameManager";
import Util from "../../../rab/Util";
import GameMessage from "../../GameMessage";
import GameController from "../../manager/GameController";
import { Child_ThrowStoneServer, RoleState, TaskType } from "../DataType";
import Ghost from "../Ghost";
import Role from "../Role";
import ActorState from "../State/ActorState";
import Unit from "../Unit";
import Skill from "./Skill";

/**
 * 小孩扔石头
 */
export default class Child_ThrowStone extends Skill {

    private role: Role;
    private ghostList: Array<Ghost>;
    private stone: Laya.Sprite3D;
    private _forward: Laya.Vector3;
    private _initPos: Laya.Vector3;

    /**是否可以击中，当石块撞击到墙、门、道具之前，可以击中鬼魂 */
    private isHit: boolean;

    public create (id: string, skillServer: Child_ThrowStoneServer): void {
        this.role = GameController.roleManager.getRole(id);
        this.role.setAnimation("Girl_Attack", true);
        this.role.setCurrentSkill(this);
        
        this.ghostList = GameController.roleManager.getAllGhost();
        this._forward = new Laya.Vector3(skillServer.forward.x, skillServer.forward.y, skillServer.forward.z);
        Laya.Vector3.scale(this._forward, 5, this._forward);
        this._forward.y = 0;
        this._initPos = Util.getNewVector3(this.role.gameObject.transform.position);
        this.isHit = true;

        Laya.timer.once(200, this, () => {
            this.stone = Laya.loader.getRes("units/Conventional/stone.lh").clone() as Laya.Sprite3D;
            this.stone.transform.position = Util.getNewVector3(this.role.gameObject.transform.position);
            this.stone.transform.position.x += 0.1;
            this.stone.transform.position.y += 1.3;
            this.stone.transform.position.z += 0.3;
            this.role.gameObject.parent.addChild(this.stone);
            if (Math.random() < 0.5) {
                this.stone.getChildAt(0).active = false;
            }
            else {
                this.stone.getChildAt(1).active = false;
            }
    
            Laya.timer.frameLoop(1, this, this.update);
        });
    }

    public remove (): void {
        this.isHit = false;
        if (this.stone != null && this.stone.destroyed == false) {
            this.stone.active = false;
            this.stone.removeSelf();
            this.stone.destroy();
        }
        Laya.timer.clearAll(this);
    }

    private update (): void {
        Util.addRotationEuler(new Laya.Vector3(0, 0, 20), this.stone, false);
        if (this.forward () == false && this.isHit == true) {
            Util.addPosition(this._forward, this.stone, false);
        }
        else {
            this.isHit = false;
            if (this._forward.y == 0) {
                this._forward.y = -0.04;
            }
            Util.addPosition(new Laya.Vector3(0, this._forward.y*2, 0), this.stone, false);
        }
        this.down();
        this.hitGhost();

        this._forward.x *= 0.99;
        this._forward.y *= 1.005;
        this._forward.z *= 0.99;

        if (this.isHit == true) {
            if (Util.getDistanceV3(this._initPos, this.stone.transform.position, "y") > 5) {
                if (this._forward.y == 0) {
                    this._forward.y = -0.04;
                }
            }
        }
    }

    /**击中鬼魂 */
    private hitGhost (): void {
        if (this.isHit == false) {
            return;
        }

        this.ghostList.forEach((value: Ghost, index: number) => {
            if (Util.getDistanceV3(value.gameObject.transform.position, this.stone.transform.position, "y") <= 0.5) {
                value.OnChangeEntityState(RoleState.hit, true);
                this.remove();
                if (this.role.unitInfo.id == MGOBE.Player.id) {
                    this.role.SendMessage(GameMessage.Role_Task, TaskType.Child_StoneHit);
                }
                return;
            }
        });
    }

    /**射线检测 */
	private forward (): boolean {
		if (GameManager.gameScene3D.scene3D == null || GameManager.gameScene3D.scene3D.physicsSimulation == null) {
			return false;
		}

		let position = Util.getNewVector3(this.stone.transform.position);
        let direction = Util.getNewVector3(this._forward);
		Laya.Vector3.scale(direction, 20, direction);
		Laya.Vector3.add(direction, position, direction);

		// 射线检测，前方是否有碰撞物体
        let hitResult: Laya.HitResult = new Laya.HitResult();
        GameManager.gameScene3D.scene3D.physicsSimulation.raycastFromTo(position, direction, hitResult);

        if (hitResult.collider != null) {
            let cube: Laya.Sprite3D = hitResult.collider.owner as Laya.Sprite3D;
            if (cube.parent.name.indexOf("wall") != -1 || cube.name.indexOf("door") != -1 || cube.parent.name.indexOf("prop") != -1
            || cube.name.indexOf("shield") != -1) {
                if (Util.getDistanceV3(hitResult.point, position, "y") <= 0.25) {
                    if (cube.name.indexOf("shield") != -1) {
                        if (cube.parent.name == MGOBE.Player.id) {
                            this.role.SendMessage(GameMessage.Role_Task, TaskType.Ghost_DefenseStone);
                        }
                    }
                    return true;
                }
			}
		}
        return false;
	}

    /**射线检测 */
	private down (): void {
        if (GameManager.gameScene3D.scene3D == null || GameManager.gameScene3D.scene3D.physicsSimulation == null) {
			return;
		}

        let position = Util.getNewVector3(this.stone.transform.position);
		position.y += 0.25;
        let direction = new Laya.Vector3(0, -0.1, 0);
		Laya.Vector3.scale(direction, 100, direction);
		Laya.Vector3.add(direction, position, direction);

        let hitResult: Laya.HitResult = new Laya.HitResult();
        GameManager.gameScene3D.scene3D.physicsSimulation.raycastFromTo(position, direction, hitResult);

		if (hitResult.collider != null) {
            let cube: Laya.Sprite3D = hitResult.collider.owner as Laya.Sprite3D;
            if (cube.parent.name.indexOf("floor") != -1 || cube.parent.name.indexOf("stair") != -1) {
                if (this.stone.transform.position.y < hitResult.point.y) {
                    this.remove();
                }
			}
		}
    }
}