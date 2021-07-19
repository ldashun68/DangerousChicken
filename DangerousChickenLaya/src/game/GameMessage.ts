import GameNotity from "../rab/GameNotity";

export default class GameMessage extends GameNotity {

    static MGOBE_JoinRoom: string = "MGOBE_JoinRoom";
    static MGOBE_LeaveRoom: string = "MGOBE_LeaveRoom";
    static MGOBE_EnterRoomFinish: string = "MGOBE_EnterRoomFinish";
    static MGOBE_RecvFromClient: string = "MGOBE_RecvFromClient";
    static MGOBE_RecvFromGameServer: string = "MGOBE_RecvFromGameServer";
    static MGOBE_GameOnLine: string = "MGOBE_GameOnLine";
    static MGOBE_GameOffLine: string = "MGOBE_GameOffLine";
    static MGOBE_ChangeRoomOwner: string = "MGOBE_ChangeRoomOwner";

    static HallView_ShowRole: string = "HallView_ShowRole";
    static GameView_Hint: string ="GameView_Hint";
    static GameView_FindBox: string ="GameView_FindBox";

    static JoystickUp: string ="JoystickUp";
    static JoystickMoving: string ="JoystickMoving";
    static ClickPlaySkill: string ="ClickPlaySkill";

    static Role_Sync: string ="Role_Sync";
    static Role_Skill: string ="Role_Skill";
    static Role_UpdateStone: string ="Role_UpdateStone";
    static Role_TreadTrap: string ="Role_TreadTrap";
    static Role_Task: string ="Role_Task";
    static Role_UpdateTask: string ="Role_UpdateTask";
}