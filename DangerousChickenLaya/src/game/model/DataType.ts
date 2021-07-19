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
    roleRescue = "roleRescue",
    roleCreateKeyBox = "roleCreateKeyBox",
    roleGetKeyBox = "roleGetKeyBox",
    roleCreatePartBox = "roleCreatePartBox",
    roleGetPartBox = "roleGetPartBox",
    roleCreateStones = "roleCreateStones",
    roleGetStones = "roleGetStones",
    roleSpanner = "roleSpanner",

    roleSkill = "roleSkill",
}

/**发送信息 */
export interface SendGameServer {
    cmd: string,
	data: any,
    sendPlayid: string,
}

/**攻击消息 */
export interface AttackMessage {
    attackerID: string,
    injuredID: string,
}

////////////////////////////////////////////// 角色 //////////////////////////////////////////////

/**单位信息 */
export interface UnitInfo {
    /**id */
    id: string,
    /**昵称 */
    nickName: string,
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
    /**跳跃落地 */
    jumpDown,
    /**技能 */
    skill,
    /**受伤 */
    hit,
    /**死亡 */
    death,
    /**安全 */
    safe,
}

/**门类型 */
export enum DoorType {
    blue = "blue",
    green = "green",
    red = "red",
    iron = "iron",
}

/**门索引 */
export enum DoorIndex {
    blue,
    green,
    red,
    iron,
}

/**道具类型 */
export enum PropType {
    /**救援 */
    rescue = "rescue",
    /**钥匙宝箱 */
    keyBox = "keyBox",
    /**零件宝箱 */
    partBox = "partBox",
    /**石堆 */
    stones = "stones",
    /**大门扳手 */
    spanner = "spanner",
}

/**技能信息 */
export interface SkillInfo {
    /**技能ID */
    id: RoleSkill,
    /**技能冷却时间 */
    time: number,
    /**技能当前时间 */
    cd: number,
}

/**角色技能 */
export enum RoleSkill {
    /**小孩扔石头 */
    Child_ThrowStone = "Child_ThrowStone",
    /**小孩双手操控 */
    Child_Control = "Child_Control",

    /**鬼魂棍击 */
    Ghost_StickHit = "Ghost_StickHit",
    /**鬼魂捕兽夹 */
    Ghost_Trap = "Ghost_Trap",
    /**鬼魂盾牌 */
    Ghost_Shield = "Ghost_Shield",
}

/**技能发送信息 */
export interface SkillServer {
    skill: RoleSkill,
}

/**小孩扔石头 */
export interface Child_ThrowStoneServer extends SkillServer {
    forward: Vct3,
}

/**鬼魂棍击 */
export interface Ghost_StickHitServer extends SkillServer {
    forward: Vct3,
}

/**任务类型 */
export enum TaskType {
    /**小孩获得零件 */
    Child_GetPart = "Child_GetPart",
    /**小孩营救小孩 */
    Child_RescueChild = "Child_RescueChild",
    /**小孩石头击中 */
    Child_StoneHit = "Child_StoneHit",
    /**小孩逃脱成功 */
    Child_EscapeSuccess = "Child_EscapeSuccess",

    /**鬼魂防御石头 */
    Ghost_DefenseStone = "Ghost_DefenseStone",
    /**鬼魂中断营救 */
    Ghost_PreventRescue = "Ghost_PreventRescue",
    /**鬼魂囚禁小孩 */
    Ghost_ImprisonChild = "Ghost_ImprisonChild",
    /**鬼魂防守大门 */
    Ghost_DefendDoor = "Ghost_DefendDoor",
}

/**任务 */
export interface Task {
    /**类型 */
    type: TaskType,
    /**名字 */
    name: string,
    /**当前计数 */
    count: number,
    /**目标计数 */
    maxCount: number,
    /**奖励 */
    award: number,
    /**奖励类型 */
    awardType: string,
}