import GameNotity from "../rab/GameNotity";

export default class GameMessage extends GameNotity {

    static MGOBE_LeaveRoom: string = "MGOBE_LeaveRoom";
    static MGOBE_EnterRoomFinish: string = "MGOBE_EnterRoomFinish";
    static MGOBE_RecvFromClient: string = "MGOBE_RecvFromClient";
    static MGOBE_RecvFromGameServer: string = "MGOBE_RecvFromGameServer";
    static MGOBE_RoomOffLine: string = "MGOBE_RoomOffLine";
    static MGOBE_GameOffLine: string = "MGOBE_GameOffLine";

    static HallView_ShowRole: string = "HallView_ShowRole";
    static GameView_ShowIcon: string ="GameView_ShowIcon";

    static JoystickUp: string ="JoystickUp";
    static JoystickMoving: string ="JoystickMoving";
}