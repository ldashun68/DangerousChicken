import GameConfig from "../GameConfig";

/**
 * 工具类
 * @author Rabbit
 */
export default class Util {

    public static version: string = "1.0.0";
    /**缓动列表 */
    public static tweenList: TweenList = {
        move: new Map<number, Laya.Tween>(),
        scale: new Map<number, Laya.Tween>(),
        rotation: new Map<number, Laya.Tween>(),
    };
    /**缓动类型 */
    public static tweenType = {
        move: "move",
        scale: "scale",
        rotation: "rotation"
    }
    /**按钮列表 */
    public static buttonList: Map<string, Array<any>> = new Map<string, Array<any>>();

    public static get isMobil():boolean {
        if(typeof sdk != "undefined") {
            return true;
        }
        return false;
    }

    /**随机数 */
    public static random (number: number): number {
        return Math.round(Math.random()*number+0.4-0.4);
    }

    /**
     * 随机区间
     * @param Min 
     * @param Max 
     */
    public static randomNum(Min:number,Max:number):number
    {
        var Range = Max - Min;
        var Rand = Math.random();
        var num = Min + Math.round(Rand * Range);
        return num;
    }

    /**
     * 随机排序
     * @param arr 
     */
    public static randomSort(arr:Array<number>){
        arr.sort(function(){
            return 0.5-Math.random();
        });
    }

    /**范围钳制 */
    public static clamp (min: number, max: number, data: number): number {
        if (data < min) {
            data = min;
        }
        if (data > max) {
            data = max;
        }
        return data;
    }

    /**
     * 格式化时间 00：00
     * @param time 
     */
    /**
     * 更新时间
     * @param time 时间
     */
    public static UpdateTime(time:number, isChinese: boolean = true, isClearZero: boolean = false){
        time = time<0?0:time;
        let t = Math.ceil(time);
        let h = Math.floor(t / 3600);
        let m = Math.floor(t % 3600 / 60);
        let s = Math.floor(t % 60);
        let hs:string = (h>=10)?h+"":("0"+h);
        let ms:string = (m>=10)?m+"":("0"+m);
        let ss:string = (s>=10)?s+"":("0"+s);
        let str: string = "";
        
        if(h > 0) {
            if (isClearZero == true) {
                if (hs.indexOf("0") != -1) {
                    hs = hs.substring(1, hs.length);;
                }
            }

            if (isChinese == true) {
                str = hs + "时" + ms + "分" + ss + "秒";
            }
            else {
                str = hs + ":" + ms + ":" + ss;
            }
        }
        else {
            if (isClearZero == true) {
                if (ms.indexOf("0") != -1) {
                    ms = ms.substring(1, ms.length);
                }
            }

            if (isChinese == true) {
                str = ms + "分" + ss +"秒";
            }
            else {
                str = ms + ":" + ss;
            }
        }
        return str;
    }

    /**计算两点距离 */
    public static distance(p1:Laya.Vector2,p2:Laya.Vector2):number{
        var dx = Math.abs(p2.x - p1.x);
        var dy = Math.abs(p2.y - p1.y);
        var dis = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
        return dis;
    }

    
    /**获得弧度 */
    public static getRadian (angle: number): number {
        return angle * Math.PI / 180;
    }

    /**获得夹角 */
    public static getAngle(px: number, py: number, mx: number, my: number): number {
        var x = Math.abs(px-mx);
        var y = Math.abs(py-my);
        var z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
        var cos = y/z;
        var radina = Math.acos(cos);//用反三角函数求弧度
        var angle = Math.floor(180/(Math.PI/radina));//将弧度转换成角度

        if(mx>px&&my>py){//鼠标在第四象限
            angle = 180 - angle;
        }

        if(mx==px&&my>py){//鼠标在y轴负方向上
            angle = 180;
        }

        if(mx>px&&my==py){//鼠标在x轴正方向上
            angle = 90;
        }

        if(mx<px&&my>py){//鼠标在第三象限
            angle = 180+angle;
        }

        if(mx<px&&my==py){//鼠标在x轴负方向
            angle = 270;
        }

        if(mx<px&&my<py){//鼠标在第二象限
            angle = 360 - angle;
        }
        return angle;
    }

    /**
     * 科学计数法
     * @param value 数值
     * @param fix 保留小数
     */
    public static formatter (value,fix?:number){
        let $fix:number = 2;
        let bits = ["K","M","B","T","aa","ab","ac","ad","ae","af","bb","bc","bd"];
        // if(/\D/.test(value)) return `${value}`;
        if(value >= 1000){
            for(let i=bits.length; i>0; i--){
                if(value >= Math.pow(1000,i)){
                   return `${parseFloat((value/Math.pow(1000,i)).toFixed($fix)).toPrecision(3)+bits[i-1]}`;
                }
            }
        }
        return `${parseFloat(value.toFixed($fix))}`;
    }

    /**浅拷贝 */
    public static objClone(obj:any):any{
        var dst:any = {};
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                dst[prop] = obj[prop];
            }
        }
        return dst;
    }

    /**获得点到线的距离 */
    public static getPointToLineLength (x, y, x1, y1, x2, y2) {
        var A = x - x1;
        var B = y - y1;
        var C = x2 - x1;
        var D = y2 - y1;

        var dot = A * C + B * D;
        var len_sq = C * C + D * D;
        var param = -1;
        if (len_sq != 0) //线段长度不能为0
            param = dot / len_sq;

        var xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        }
        else if (param > 1) {
            xx = x2;
            yy = y2;
        }
        else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        var dx = x - xx;
        var dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 数据补全
     * @param org 原数据
     * @param type 目标数据
     */
    public static supplement(org:any, type:any, isReverse:boolean = false):any{
        if (isReverse == false) {
            Object.keys(type).forEach((key)=>{
                //if(org[key] != undefined || org[key] == null){
                    org[key] = type[key];
                //}
            });
        }
        else {
            Object.keys(org).forEach((key)=>{
                if(type[key] != undefined || type[key] == null){
                    org[key] = type[key];
                }
            });
        }
        return org;
    }

    /**
     * 计算两个时间的相差的天数
     * @param oldTime 
     * @param curTime 
     */
    public static timestampToDay(oldTime:number,curTime:number){
        let d1 = Math.floor(curTime / (24 * 3600 * 1000));
        let d2 = Math.floor(oldTime / (24 * 3600 * 1000));
        return d1 - d2;
    }

    /**
     * 是否空字符串
     * @param str 
     */
    public static isEmpty(str: string){
        if(str != null && str != "")
        {
            return true;
        }
        return false;
    }

    /**
     * 秒转格式 分钟:秒 返回string
     * @param s 秒
     * @param en 是否英文默认是
     */
    public static coverTime(s:number,en:boolean = true):string{
        let min:number = Math.floor(s/60);
        let seconds:number = Math.floor(s%60);
        let str = null;
        if(en){
            str = min+":"+seconds;
        }else{
            str = min+"分"+seconds +"秒";
        }
        return str;
    }

    /**字符转数组 */
    public static stringToArray (str: string): Array<string> {
        str = str.replace(" ", "");
        return str.split(",");
    }

    /**字符转3维向量 */
    public static stringToVector3 (str: string): Laya.Vector3 {
        let temp: any = this.stringToArray(str);
        return new Laya.Vector3(parseFloat(temp[0]), parseFloat(temp[1]), parseFloat(temp[2]));
    }

    /**字符转四元数 */
    public static stringToQuaternion (str: string): Laya.Quaternion {
        let temp: any = this.stringToArray(str);
        return new Laya.Quaternion(parseFloat(temp[0]), parseFloat(temp[1]), parseFloat(temp[2]), parseFloat(temp[3]));
    }

    /**已知一个向量，一个夹角，求另一个向量 */
    public static getVector(v1: Laya.Vector3, v2: Laya.Vector3, angle: number): Laya.Vector3 {
        let quaternion: Laya.Quaternion = new Laya.Quaternion();
        Laya.Quaternion.createFromYawPitchRoll(angle * (Math.PI / 180), 0, 0, quaternion);
        Laya.Vector3.transformQuat(v1, quaternion, v2);
        return v2;
    }

    /**获得一个新向量 */
    public static getNewVector3 (v1: Laya.Vector3 = null): Laya.Vector3 {
        if (v1 == null) {
            return new Laya.Vector3();
        }
        else {
            return new Laya.Vector3(v1.x, v1.y, v1.z);
        }
    }

    /**获得距离 */
    public static getDistanceV3 (v1: Laya.Vector3, v2: Laya.Vector3, ignore: string): number {
        let v3: Laya.Vector3 = this.getNewVector3(v1);
        let v4: Laya.Vector3 = this.getNewVector3(v2);
        if (ignore.indexOf("x") != -1) {
            v3.x = 0;
            v4.x = 0;
        }
        if (ignore.indexOf("y") != -1) {
            v3.y = 0;
            v4.y = 0;
        }
        if (ignore.indexOf("z") != -1) {
            v3.z = 0;
            v4.z = 0;
        }
        return Laya.Vector3.distance(v3, v4);
    }

    /**
     * 对节点的position 进行赋值修改
     * @param data 修改数据
     * @param out 节点
     * @param isLocal 是否为本地坐标
     */
    public static setPosition (data: Laya.Vector3, out: Laya.Sprite3D, isLocal: boolean = false): void {
        if (isLocal == false) {
            out.transform.position = this.getPosition(data, out, isLocal);
        }
        else {
            out.transform.localPosition = this.getPosition(data, out, isLocal);
        }
    }

    /**
     * 基于out 节点的position 进行赋值修改，并返回
     * @param data 修改数据
     * @param out 节点
     * @param isLocal 是否为本地坐标
     */
    public static getPosition (data: Laya.Vector3, out: Laya.Sprite3D, isLocal: boolean = false): Laya.Vector3 {
        let position: Laya.Vector3 = new Laya.Vector3(0, 0, 0);
        if (isLocal == false) {
            position = this.getNewVector3(out.transform.position);
        }
        else {
            position = this.getNewVector3(out.transform.localPosition);
        }
        position.x = isNaN(data.x)?position.x:data.x;
        position.y = isNaN(data.y)?position.y:data.y;
        position.z = isNaN(data.z)?position.z:data.z;
        return position;
    }

    /**
     * 基于out 节点的position 进行加法修改
     * @param data 修改数据
     * @param out 节点
     */
    public static addPosition (data: Laya.Vector3, out: Laya.Sprite3D, isLocal: boolean = false): void {
        if (isLocal == false) {
            out.transform.position = this.getAddPosition(data, out, isLocal);
        }
        else {
            out.transform.localPosition = this.getAddPosition(data, out, isLocal);
        }
    }

    /**
     * 基于out 节点的position 进行加法修改，并返回
     * @param data 修改数据
     * @param out 节点
     */
    public static getAddPosition (data: Laya.Vector3, out: Laya.Sprite3D, isLocal: boolean = false): Laya.Vector3 {
        let position: Laya.Vector3 = new Laya.Vector3(0, 0, 0);
        if (isLocal == false) {
            position = this.getNewVector3(out.transform.position);
        }
        else {
            position = this.getNewVector3(out.transform.localPosition);
        }
        position.x += data.x;
        position.y += data.y;
        position.z += data.z;
        return position;
    }

    /**
     * 对节点的rotationEuler 进行赋值修改
     * @param data 修改数据
     * @param out 节点
     */
     public static setRotationEuler (data: Laya.Vector3, out: Laya.Sprite3D, isLocal: boolean = false): void {
        if (isLocal == false) {
            out.transform.rotationEuler = this.getRotationEuler(data, out, isLocal);
        }
        else {
            out.transform.localRotationEuler = this.getRotationEuler(data, out, isLocal);
        }
    }

    /**
     * 基于out 节点的rotationEuler 进行赋值修改，并返回
     * @param data 修改数据
     * @param out 节点
     */
     public static getRotationEuler (data: Laya.Vector3, out: Laya.Sprite3D, isLocal: boolean = false): Laya.Vector3 {
        let rotation: Laya.Vector3 = new Laya.Vector3(0, 0, 0);
        if (isLocal == false) {
            rotation = this.getNewVector3(out.transform.rotationEuler);
        }
        else {
            rotation = this.getNewVector3(out.transform.localRotationEuler);
        }
        rotation.x = isNaN(data.x)?rotation.x:data.x;
        rotation.y = isNaN(data.y)?rotation.y:data.y;
        rotation.z = isNaN(data.z)?rotation.z:data.z;
        return rotation;
    }

    /**
     * 基于out 节点的rotationEuler 进行加法修改
     * @param data 修改数据
     * @param out 节点
     */
    public static addRotationEuler (data: Laya.Vector3, out: Laya.Sprite3D, isLocal: boolean = false): void {
        if (isLocal == false) {
            out.transform.rotationEuler = this.getAddRotationEuler(data, out, isLocal);
        }
        else {
            out.transform.localRotationEuler = this.getAddRotationEuler(data, out, isLocal);
        }
    }

    /**
     * 基于out 节点的rotationEuler 进行加法修改，并返回
     * @param data 修改数据
     * @param out 节点
     */
    public static getAddRotationEuler (data: Laya.Vector3, out: Laya.Sprite3D, isLocal: boolean = false): Laya.Vector3 {
        let rotation: Laya.Vector3 = new Laya.Vector3(0, 0, 0);
        if (isLocal == false) {
            rotation = this.getNewVector3(out.transform.rotationEuler);
        }
        else {
            rotation = this.getNewVector3(out.transform.localRotationEuler);
        }
        rotation.x += data.x;
        rotation.y += data.y;
        rotation.z += data.z;
        return rotation;
    }

    public static addButtonAnimation (image: any, key: string, isPlaySound: boolean = true, isScale: boolean = true): void {
        if (this.buttonList.has(key) == false) {
            this.buttonList.set(key, []);
        }
        let list = this.buttonList.get(key);
        if (list.indexOf(image) != -1) {
            return;
        }
        list.push(image);

        let canClick: boolean = false;
        let onClick = (x: number, y: number) => {
            if (this.buttonList.has(key) == true) {
                let list = this.buttonList.get(key);
                if (list.indexOf(image) == -1) {
                    return;
                }
            }

            let scaleX = (image.scaleX > 0)? x:-x;
            let scaleY = (image.scaleY > 0)? y:-y;
            Laya.Tween.clearAll(image);
            Laya.Tween.to(image, {scaleX: scaleX, scaleY: scaleY}, 100, null);
        }

        let onDown = (event: Laya.Event): void => {
            if (isScale == true) {
                onClick(0.9, 0.9);
            }
            canClick = true;
            event.stopPropagation();

            if (isPlaySound == true) {
                // rab.MusicManager.playSound("res/audio/click.wav");
            }
        };
        
        let onUp = (event: Laya.Event): void => {
            if (canClick == true) {
                if (isScale == true) {
                    onClick(1, 1);
                }
                event.stopPropagation();
            }
            canClick = false;
        };
        
        let onOut = (event: Laya.Event): void => {
            if (canClick == true) {
                if (isScale == true) {
                    onClick(1, 1);
                }
                event.stopPropagation();
            }
            canClick = false;
        };
        
        image.on(Laya.Event.MOUSE_DOWN, this, onDown);
        image.on(Laya.Event.MOUSE_UP, this, onUp);
        image.on(Laya.Event.MOUSE_OUT, this, onOut);
    }

    public static removeAllButtonAnimation (key: string): void {
        if (this.buttonList.has(key) == true) {
            let list = this.buttonList.get(key);
            list.forEach((value: any, index: number) => {
                Laya.Tween.clearAll(value);
            });
            this.buttonList.delete(key);
        }
    }

    public static removeButtonAnimation (key: string, image: any): void {
        if (this.buttonList.has(key) == true) {
            let list = this.buttonList.get(key);
            list.forEach((value: any, index: number) => {
                if (image == value) {
                    list.splice(index, 1);
                    return;
                }
            });
        }
    }

    public static showWindowAnimation (window: any, callback: Function = null): void {
        window.scaleX = 0.5;
        window.scaleY = 0.5;
        Laya.Tween.clearAll(window);
        Laya.Tween.to(window, {scaleX: 1.1, scaleY: 1.1}, 100, null, Laya.Handler.create(this, () => {
            Laya.Tween.to(window, {scaleX: 1, scaleY: 1}, 100, null, Laya.Handler.create(this, () => {
                callback && callback();
            }));
        }));
    }

    /**是否在执行缓动动画 */
    public static isSprite3DTween (sprite: Laya.Sprite3D): boolean {
        return (this.tweenList[this.tweenType.move].has(sprite.id) == true) ||
        (this.tweenList[this.tweenType.scale].has(sprite.id) == true) ||
        (this.tweenList[this.tweenType.rotation].has(sprite.id) == true);
    }

    /**删除缓动动画 */
    public static sprite3DStopTween (sprite: Laya.Sprite3D, type: string): void {
        let stop = (tween: Laya.Tween) => {
            tween.pause();
            tween.clear();
            tween.recover();
        }

        let list: Map<number, Laya.Tween> = this.tweenList[type];
        list.forEach((value: Laya.Tween, key: number) => {
            if (key == sprite.id) {
                stop(value);
                list.delete(key);
            }
        });
    }

    /**
     * 移动动画
     * @param sprite 3D精灵
     * @param props 目标属性
     * @param duration 持续时间
     * @param ease 缓动类型
     * @param completed 完成回调
     * @param progress 每帧回调
     */
    public static sprite3DMove(sprite: Laya.Sprite3D, props: Laya.Vector3, isLocal: boolean, duration: number,
        ease?: Function, completed?: Function, progress?: Function) {
        this.sprite3DStopTween(sprite, this.tweenType.move);

        let position: Laya.Vector3 = new Laya.Vector3(0, 0, 0);
        if (isLocal == false) {
            position = sprite.transform.position;
        }
        else {
            position = sprite.transform.localPosition;
        }
        this.tweenList[this.tweenType.move].set(sprite.id,
            this.tweenUpdate(sprite, position, props, duration, ease,
                () => {
                    this.sprite3DStopTween(sprite, this.tweenType.move);
                    completed && completed();
                },
                (toPos: Laya.Vector3) => {
                    this.setPosition(toPos, sprite, isLocal);
                    progress && progress();
                }
            )
        );
    }

    /**
     * 缩放动画
     * @param sprite 3D精灵
     * @param props 目标属性
     * @param duration 持续时间
     * @param ease 缓动类型
     * @param completed 完成回调
     * @param progress 每帧回调
     */
    public static sprite3DScale(sprite: Laya.Sprite3D, props: Laya.Vector3, duration: number,
        ease?: Function, completed?: Function, progress?: Function) {
        this.sprite3DStopTween(sprite, this.tweenType.scale);
        this.tweenList[this.tweenType.scale].set(sprite.id,
            this.tweenUpdate(sprite, sprite.transform.getWorldLossyScale(), props, duration, ease,
                () => {
                    this.sprite3DStopTween(sprite, this.tweenType.scale);
                    completed && completed();
                },
                (toPos: Laya.Vector3) => {
                    sprite.transform.setWorldLossyScale(toPos);
                    progress && progress();
                }
            )
        );
    }

    /**
     * 旋转动画
     * @param sprite 3D精灵
     * @param props 目标属性
     * @param isLocal 是否本地坐标
     * @param duration 持续时间
     * @param ease 缓动类型
     * @param completed 完成回调
     * @param progress 每帧回调
     */
    public static sprite3DRotation(sprite: Laya.Sprite3D, props: Laya.Vector3, isLocal: boolean, duration: number,
        ease?: Function, completed?: Function, progress?: Function) {
        this.sprite3DStopTween(sprite, this.tweenType.rotation);
        let rotation: Laya.Vector3 = new Laya.Vector3();
        if (isLocal == false) {
            rotation = sprite.transform.rotationEuler;
        }
        else {
            rotation = sprite.transform.localRotationEuler;
        }
        this.tweenList[this.tweenType.rotation].set(sprite.id,
            this.tweenUpdate(sprite, rotation, props, duration, ease,
                () => {
                    this.sprite3DStopTween(sprite, this.tweenType.rotation);
                    completed && completed();
                },
                (toPos: Laya.Vector3) => {
                    this.setRotationEuler(toPos, sprite, isLocal);
                    progress && progress();
                }
            )
        );
    }

    /**缓动动画帧循环 */
    private static tweenUpdate (sprite: Laya.Sprite3D, initProps: Laya.Vector3, endProps: Laya.Vector3, duration: number,
        ease?: Function, completed?: Function, progress?: Function): Laya.Tween {
        let v3 = new Laya.Vector3();
        let initProp = {
            x: initProps.x,
            y: initProps.y,
            z: initProps.z
        };
        let endProp = {
            x: endProps.x,
            y: endProps.y,
            z: endProps.z,
            update: new Laya.Handler(this, function () {
                if (sprite == null || sprite.destroyed) return;
                v3.x = initProp.x;
                v3.y = initProp.y;
                v3.z = initProp.z;
                progress && progress(v3);
            })
        };
        return Laya.Tween.to(initProp, endProp, duration, ease, new Laya.Handler(this, completed));
    }

    public static Log(...msg:any[]) {
        if(GameConfig.stat) {
            console.log(msg)
        }
    }
}

export interface TweenList {
    move: Map<number, Laya.Tween>,
    scale: Map<number, Laya.Tween>,
    rotation: Map<number, Laya.Tween>,
}
// module.exports = Util;