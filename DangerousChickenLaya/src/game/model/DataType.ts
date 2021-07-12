import Vct3 from "../../rab/model/Vct3";

/**游戏配置 */
export interface GameConfig {
	gameId: string,
	openId: string,
	secretKey: string,
	server: string,
};

/**json表 */
export enum JsonList {
    /**角色模型索引 */
    RoleModelIndex = "RoleModelIndex",
}

/**房间类型 */
export enum RoomType {
    /**逃亡模式 */
    EscapeMode = "EscapeMode",
}

////////////////////////////////////////////// 用户 //////////////////////////////////////////////

/**用户的当前角色数据 */
export interface UserCurrentRole {
    /**角色类型 */
    type: RoleType,
    /**角色编号 */
    id: number,
}

/**匹配中需要的数据 */
export interface FightUserInfo {
    id: string,
    /**昵称 */
    nickName: string,
    /**头像 */
    avatarUrl: string,
    /**角色 */
    role: UserCurrentRole,
}

////////////////////////////////////////////// 消息 //////////////////////////////////////////////

/**帧同步数据 */
export interface FrameSyncData
{
    /**id */
    id: string,
    /**状态 */
    state: RoleState,
}

/**帧同步角色数据 */
export interface FrameSyncRoleData extends FrameSyncData
{
    /**坐标 */
    point: Vct3,
    /**旋转 */
    rotationY: number,
}

/**玩家房间状态修改 */
export enum PlayerRoomState
{
    none,
    hall,
    waitingRoom,
    gameLoading,
    gameStart,
    gameing,
    gameEnd,
}



/**实时服务器消息类型 */
export enum UnitServerType {
    role = "role",
}

/**游戏消息 */
export enum GameServerCMD
{
    roleHit = "roleHit",
}

/**发送信息 */
export interface SendGameServer {
    cmd: string,
	data: any,
    senderID: string,
}

////////////////////////////////////////////// 角色 //////////////////////////////////////////////

/**单位信息 */
export interface UnitInfo {
    /**id */
    id: string,
    /**类型 */
    type: RoleType,
}

/**角色类型 */
export enum RoleType {
    /**鬼魂 */
    ghost,
    /**小孩 */
    child,
}

/**角色状态 */
export enum RoleState {
    /**默认 */
    none,
    /**待机 */
    idle,
    /**移动 */
    move,
    /**跳跃 */
    jump,
    /**落下 */
    fall,
    /**攻击 */
    attack,
    /**受伤 */
    hit,
    /**死亡 */
    death,
}

/**角色动画名字 */
export interface AnimationName
{
    /**待机 */
    idle: string,
    /**移动 */
    move: string,
    /**跳跃 */
    jump: string,
    /**落下 */
    fall: string,
    /**攻击 */
    attack: string,
    /**受伤 */
    hit: string,
    /**死亡 */
    death: string,
}