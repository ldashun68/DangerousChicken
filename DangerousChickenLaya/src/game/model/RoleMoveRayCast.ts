import GameManager from "../../rab/Manager/GameManager";
import Util from "../../rab/Util";
import GameMessage from "../GameMessage";
import GameController from "../manager/GameController";
import Child from "./Child";
import { RoleSkill, RoleState, RoleType } from "./DataType";
import Door from "./Door";
import Role from "./Role";

export default class RoleMoveRayCast {
	
	public role: Role;
	public startPosY: number;
	public floor: Laya.Sprite3D;
	public stair: Laya.Sprite3D;
	public prop: Laya.Sprite3D;
	public door: Laya.Sprite3D;

	private lineForward: Laya.PixelLineSprite3D;
	private lineDown: Laya.PixelLineSprite3D;

	public isFall: boolean;

	constructor() {
		this.lineForward = new Laya.PixelLineSprite3D();
        GameManager.gameScene3D.scene3D.addChild(this.lineForward);
		this.lineDown = new Laya.PixelLineSprite3D();
        GameManager.gameScene3D.scene3D.addChild(this.lineDown);

		this.isFall = false;
	}

	/**射线检测 */
	public forward (): boolean {
		if (GameManager.gameScene3D.scene3D == null || GameManager.gameScene3D.scene3D.physicsSimulation == null) {
			return false;
		}

		let position = Util.getNewVector3(this.role.prior);
		position.y += this.startPosY;
		this.role.getForward();
        let direction = Util.getNewVector3(this.role.forward);
		Laya.Vector3.scale(direction, 20, direction);
		Laya.Vector3.add(direction, position, direction);

		this.lineForward.clear();
        this.lineForward.addLine(position, direction, Laya.Color.RED, Laya.Color.BLACK);

		// 射线检测，前方是否有碰撞物体
        let hitResults: Array<Laya.HitResult> = [];
        GameManager.gameScene3D.scene3D.physicsSimulation.raycastAllFromTo(position, direction, hitResults);

		if (this._forward(hitResults, position) == true) {
			return true;
		}
		else {
			// 脚部射线
			hitResults = [];
			position = Util.getNewVector3(this.role.prior);
			position.y += 0.3;
			GameManager.gameScene3D.scene3D.physicsSimulation.raycastAllFromTo(position, direction, hitResults);
			return this._forward(hitResults, position);
		}
	}

	private _forward (hitResults: Array<Laya.HitResult>, position: Laya.Vector3): boolean {
		if (hitResults.length > 0) {
			for (let index: number = 0; index < hitResults.length; index++) {
				let value: Laya.HitResult = hitResults[index];
				let cube: Laya.Sprite3D = value.collider.owner as Laya.Sprite3D;
				if (cube.parent.name.indexOf("wall") != -1) {
					if (Util.getDistanceV3(value.point, position, "y") <= 0.5) {
						return true;
					}
                }
				else if (cube.name.indexOf("door") != -1) {
					if (Util.getDistanceV3(value.point, position, "y") <= 0.5) {
						this.door = cube;
						// 只有小孩可以开门
						if (this.role.unitInfo.type == RoleType.child) {
							let door: Door = this.door.parent.getComponent(Door);
							if (door != null) {
								door.openDoor();
							}
						}
						return true;
					}
                }
				else if (cube.parent.name.indexOf("prop") != -1) {
					if (Util.getDistanceV3(value.point, position, "y") <= 0.5) {
						return true;
					}
                }
				else if (cube.name.indexOf("safe") != -1) {
					if (Util.getDistanceV3(value.point, position, "y") <= 0.5) {
						this.role.OnChangeEntityState(RoleState.safe, true);
						GameController.roleManager.isChildWin();
						return true;
					}
				}
			}
		}
		return false;
	}

	/**射线检测 */
	public down (): void {
		if (GameManager.gameScene3D.scene3D == null || GameManager.gameScene3D.scene3D.physicsSimulation == null) {
			return;
		}

		if (this.role.unitInfo.type == RoleType.child) {
			if ((this.role as Child).jumpHeight > 0) {
				return;
			}
		}
		
		let position = Util.getNewVector3(this.role.prior);
		position.y += 0.25;
        let direction = new Laya.Vector3(0, -0.1, 0);
		Laya.Vector3.scale(direction, 100, direction);
		Laya.Vector3.add(direction, position, direction);

		this.lineDown.clear();
        this.lineDown.addLine(position, direction, Laya.Color.RED, Laya.Color.BLACK);

        let hitResult: Laya.HitResult = new Laya.HitResult();
        GameManager.gameScene3D.scene3D.physicsSimulation.raycastFromTo(position, direction, hitResult);

		this.floor = null;
		this.stair = null;
		this.prop = null;
		if (hitResult.collider != null) {
			let cube: Laya.Sprite3D = hitResult.collider.owner as Laya.Sprite3D;
			// 是否位移
			let bool = true;
			if (cube.parent.name.indexOf("floor") != -1) {
				this.floor = cube;
			}
			else if (cube.parent.name.indexOf("stair") != -1) {
				this.stair = cube;
			}
			else if (cube.parent.name.indexOf("prop") != -1) {
				this.prop = cube;
				if (cube.name.indexOf(RoleSkill.Ghost_Trap) != -1) {
					bool = false;
				}
			}

			let gap = Math.abs(this.role.gameObject.transform.position.y - hitResult.point.y);
			if (gap >= 0.1 && this.role.unitInfo.type == RoleType.child) {
				this.isFall = true;
				if (bool == true) {

					(this.role as Child).onFall(new Laya.Vector3(0, hitResult.point.y, 0));
				}

				if (this.prop != null) {
					if (cube.name.indexOf(RoleSkill.Ghost_Trap) != -1) {
						this.role.SendMessage(GameMessage.GameView_Hint, this.role.unitInfo.nickName+"中了陷阱");
						GameController.mgobeManager.sendToGameSvr(GameMessage.Role_TreadTrap, {}, this.role.unitInfo.id);
					}
				}
			}
			else {
				if (this.isFall == false && bool == true) {
					this.role.gameObject.transform.position.y = hitResult.point.y;
				}
			}
		}
	}
}