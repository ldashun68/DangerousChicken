import { UserCurrentRole } from "../../game/model/DataType";

/**
 * 游戏基础数据
 */
export interface RabGameInfo  {
    id: number,
    /** */
    openId: string,
    /**昵称 */
	nickName: string,
    /**头像 */
	avatarUrl: string,
    /**音效 0关闭 1开启 */
    audio: number,
    /**背景音效 0关闭 1开启 */
    music: number,
    /**振动 0关闭 1开启 */
    vibrate: number,
    /**上次打开时间 */
    lastTime: Time,
    /**离线时间 */
    offlineTime: Time,
    /**最大体力 */
    maxTicket: number,
    /**体力 */
    ticket: number,
    /**钻石 */
    diamond: number,
    /**金币 */
    coin: number,
    /**当前角色 */
    currentRole: UserCurrentRole,
    /**鬼魂 */
    ghost: Array<number>,
    /**小孩 */
    child: Array<number>,
}

export interface Time {
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
}