import GameObject from "../../rab/model/GameObject";
import Util from "../../rab/Util";
import GameController from "../manager/GameController";
import { DoorType, DoorIndex } from "./DataType";

/**
 * 门
 */
export default class Door extends GameObject {
    
    private isOpen: boolean;
    private doorIndex: number;

    OnInit(): void {
        
    }

    /**打开门 */
    public openDoor (): void {
        if (this.isOpen == false) {
            if (this.doorIndex <= DoorIndex.red) {
                if (GameController.doorManager.isHaveKey(this.doorIndex) == true) {
                    this.isOpen = true;
                    this.openColorDoor();
                }
            }
            else if (this.doorIndex == DoorIndex.iron) {
                this.isOpen = true;
                this.openIronDoor();
            }
        }
    }

    /**关闭门 */
    public closeDoor (): void {
        this.isOpen = false;
        for (let index in DoorType) {
            if (this.gameObject.name.indexOf(DoorType[index]) != -1) {
                this.doorIndex = parseInt(DoorIndex[index]);
            }
        }

        if (this.doorIndex <= DoorIndex.red) {
            this.closeColorDoor();
        }
        else if (this.doorIndex == DoorIndex.iron) {
            this.closeIronDoor();
        }
    }

    /**获得门索引 */
    public getDoorIndex (): number {
        return this.doorIndex;
    }

    /**打开颜色门 */
    private openColorDoor (): void {
        Util.sprite3DRotation(this.gameObject, new Laya.Vector3(-90, 0, -180), false, 300, Laya.Ease.backOut);
    }

    /**关闭颜色门 */
    private closeColorDoor (): void {
        Util.sprite3DRotation(this.gameObject, new Laya.Vector3(-90, 0, -90), false, 100);
    }

    /**打开铁门 */
    private openIronDoor (): void {
        Util.sprite3DMove(this.gameObject, Util.getAddPosition(new Laya.Vector3(0, 1.5, 0), this.gameObject),
        false, 300, Laya.Ease.backOut, () => {
            
        });
    }

    /**关闭铁门 */
    private closeIronDoor (): void {

    }

    public getIsOpen (): boolean {
        return this.isOpen;
    }
}