import { RabManager } from "../../rab/Manager/RabManager";
import GameMessage from "../GameMessage";
import { PlayerRoomState, RoleType, Task, TaskType } from "../model/DataType";
import GameController from "./GameController";

/**
 * 任务管理器
 */
export default class TaskManager extends RabManager {

    /**鬼魂任务 */
    public ghostTask: Map<TaskType, Task>;
    /**小孩任务 */
    public childTask: Map<TaskType, Task>;
    /**我的任务 */
    public meTask: Map<TaskType, Task>;

    protected OnInit() {
        this.AddListenerMessage(GameMessage.Role_Task, this.task);
    }

    public start (): void {
        this.ghostTask = new Map<TaskType, Task>();
        this.ghostTask.set(TaskType.Ghost_DefenseStone, {
            type: TaskType.Ghost_DefenseStone,
            name: "防御石头5次",
            count: 0,
            maxCount: 5,
            award: 100,
            awardType: "coin"
        });
        this.ghostTask.set(TaskType.Ghost_PreventRescue, {
            type: TaskType.Ghost_PreventRescue,
            name: "中断营救3次",
            count: 0,
            maxCount: 3,
            award: 100,
            awardType: "coin"
        });
        this.ghostTask.set(TaskType.Ghost_ImprisonChild, {
            type: TaskType.Ghost_ImprisonChild,
            name: "抓住小孩5次",
            count: 0,
            maxCount: 5,
            award: 100,
            awardType: "coin" 
        });
        this.ghostTask.set(TaskType.Ghost_DefendDoor, {
            type: TaskType.Ghost_DefendDoor,
            name: "3分钟内不让小孩打开大门1次",
            count: 0,
            maxCount: 1,
            award: 300,
            awardType: "coin"
        });


        this.childTask = new Map<TaskType, Task>();
        this.childTask.set(TaskType.Child_GetPart, {
            type: TaskType.Child_GetPart,
            name: "获得零件1个",
            count: 0,
            maxCount: 1,
            award: 100,
            awardType: "coin"
        });
        this.childTask.set(TaskType.Child_RescueChild, {
            type: TaskType.Child_RescueChild,
            name: "营救成功2次",
            count: 0,
            maxCount: 2,
            award: 100,
            awardType: "coin"
        });
        this.childTask.set(TaskType.Child_StoneHit, {
            type: TaskType.Child_StoneHit,
            name: "用石头砸中老奶奶3次",
            count: 0,
            maxCount: 3,
            award: 100,
            awardType: "coin"
        });
        this.childTask.set(TaskType.Child_EscapeSuccess, {
            type: TaskType.Child_EscapeSuccess,
            name: "3分钟内打开大门1次",
            count: 0,
            maxCount: 1,
            award: 300,
            awardType: "coin"
        });

        if (GameController.roleManager.ME.unitInfo.type == RoleType.child) {
            this.meTask = this.childTask;
        }
        else {
            this.meTask = this.ghostTask;
        }
    }

    private task (type: TaskType): void {
        console.log("task", type);
        if (GameController.gameStateManager.ME >= PlayerRoomState.gameLoading) {
            if (this.meTask.has(type) == true) {
                if (this.meTask.get(type).count < this.meTask.get(type).maxCount) {
                    this.meTask.get(type).count++;
                    this.SendMessage(GameMessage.Role_UpdateTask);
                }
            }
            // if (GameController.roleManager.ME.unitInfo.type == RoleType.child) {
            //     // 小孩任务
            //     switch (type) {
            //         case TaskType.Child_GetPart:
                        
            //             break;
            //         case TaskType.Child_RescueChild:
                    
            //             break;
            //         case TaskType.Child_StoneHit:
                        
            //             break;
            //         case TaskType.Child_EscapeSuccess:
                    
            //             break;
            //         default:
            //             break;
            //     }
            // }
            // else {
            //     // 鬼魂任务
            //     switch (type) {
            //         case TaskType.Ghost_DefendDoor:
                        
            //             break;
            //         case TaskType.Ghost_PreventRescue:
                    
            //             break;
            //         case TaskType.Ghost_ImprisonChild:
                        
            //             break;
            //         case TaskType.Ghost_DefendDoor:
                    
            //             break;
            //         default:
            //             break;
            //     }
            // }
        }
    }

    public isWin (): boolean {
        if (GameController.roleManager.ME.unitInfo.type == RoleType.child) {
            return this.childTask.get(TaskType.Child_EscapeSuccess).count >= this.childTask.get(TaskType.Child_EscapeSuccess).maxCount;
        }
        else {
            return !GameController.doorManager.isOpenDoor;
        }
    }
}