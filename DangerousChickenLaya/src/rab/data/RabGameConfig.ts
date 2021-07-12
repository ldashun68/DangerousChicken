/**
 * 游戏配置信息
 * @author Rabbit
 */
export default interface RabGameConfig {
    
    debug:boolean;
    version:string;
    loadJson:{
        
    };
    loadui:Array<string>;
    config:{
        /**是否分享 */
        allow_share:boolean;
        /**是否视频 */
        allow_video:boolean;
        /**视频失败是否分享 */
        video_faill_share:boolean;
        /**分享超时 */
        shareDuration:number;
        /**是否打开导量 */
        allow_adGame:boolean,
        /**是否展示视频图标 */
        videoIcon:boolean
    };
}
