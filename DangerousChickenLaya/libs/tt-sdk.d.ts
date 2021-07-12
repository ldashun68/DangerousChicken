declare namespace sdk {
     /**返回平台配置信息 */
     export var confs:any;
     /** 用户数据保存*/
     export var user:any;
     /** 游戏数据保存*/
     export var data:any;
     export function postData();
     //**分享 */
     export function share(opt:any);
     /**激烈视频拉取 */
     export function createVideo(opt:any);
     /**获得 */
     export function getGameAd(opt:any);
     /**跳转 */
     export function tapGameAd(opt:any);
     /**打开banner */
     export function createBanner(opt:any);
     /**关闭banner */
     export function closeBanner(pos:string);
     /**事件埋点 */
     export function traceEvent(key:string);
     /**事件埋点 */
     export function traceEvent(key:string,data:any);
     /**隐藏 */
     export function onHide(back:Function);
     /**显示 */
     export function onShow(back:Function);
     /**是否需要创建用户授权 */
     export function needUserInfo():boolean
     /**此步骤将获取用户资料，并做存储，是一个异步操作 */
     export function checkUserInfo();
     /**此步骤将获取用户资料，并做存储，是一个异步操作 */
     export function getUserInfo();
}