(function () {
    'use strict';

    var Scene = Laya.Scene;
    var REG = Laya.ClassUtils.regClass;
    var ui;
    (function (ui) {
        var test;
        (function (test) {
            class TestSceneUI extends Scene {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("test/TestScene");
                }
            }
            test.TestSceneUI = TestSceneUI;
            REG("ui.test.TestSceneUI", TestSceneUI);
        })(test = ui.test || (ui.test = {}));
    })(ui || (ui = {}));

    class GameUI extends ui.test.TestSceneUI {
        constructor() {
            super();
            this.newScene = Laya.stage.addChild(new Laya.Scene3D());
            var camera = this.newScene.addChild(new Laya.Camera(0, 0.1, 100));
            camera.transform.translate(new Laya.Vector3(0, 6, 9.5));
            camera.transform.rotate(new Laya.Vector3(-15, 0, 0), true, false);
            var directionLight = new Laya.DirectionLight();
            this.newScene.addChild(directionLight);
            directionLight.color = new Laya.Vector3(0.6, 0.6, 0.6);
            var mat = directionLight.transform.worldMatrix;
            mat.setForward(new Laya.Vector3(-1.0, -1.0, -1.0));
            directionLight.transform.worldMatrix = mat;
            var plane = this.newScene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(10, 10, 10, 10)));
            var planeMat = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/grass.png", Laya.Handler.create(this, function (tex) {
                planeMat.albedoTexture = tex;
            }));
            var tilingOffset = planeMat.tilingOffset;
            tilingOffset.setValue(5, 5, 0, 0);
            planeMat.tilingOffset = tilingOffset;
            plane.meshRenderer.material = planeMat;
            var planeStaticCollider = plane.addComponent(Laya.PhysicsCollider);
            var planeShape = new Laya.BoxColliderShape(10, 0, 10);
            planeStaticCollider.colliderShape = planeShape;
            planeStaticCollider.friction = 2;
            planeStaticCollider.restitution = 0.3;
            this.mat1 = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/wood.jpg", Laya.Handler.create(this, function (tex) {
                this.mat1.albedoTexture = tex;
                Laya.timer.once(100, this, function () {
                    this.addBox();
                });
            }));
        }
        addBox() {
            var box = this.newScene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(0.75, 0.5, 0.5)));
            box.meshRenderer.material = this.mat1;
            var transform = box.transform;
            var pos = transform.position;
            pos.setValue(0, 10, 0);
            transform.position = pos;
            var rigidBody = box.addComponent(Laya.Rigidbody3D);
            var boxShape = new Laya.BoxColliderShape(0.75, 0.5, 0.5);
            rigidBody.colliderShape = boxShape;
            rigidBody.mass = 10;
        }
    }

    class GameConfig {
        constructor() {
        }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("script/GameUI.ts", GameUI);
        }
    }
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "test/TestScene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class FsmBase {
        constructor(fsmid) {
            this.FsmId = fsmid;
        }
    }

    class Fsm extends FsmBase {
        constructor(fsmid, owner, states) {
            super(fsmid);
            this.m_StateDic = [];
            this.owner = owner;
            for (let i in states) {
                let state = states[i];
                state.CurrFsm = this;
                this.m_StateDic.push(state);
            }
            this.m_CurrState = this.m_StateDic[0];
            this.CurrStateType = this.m_CurrState.onStateType;
            this.LastStateType = this.m_CurrState.onStateType;
            this.m_CurrState.Enter();
        }
        get Owner() {
            return this.owner;
        }
        get CurrState() {
            return this.m_CurrState;
        }
        GetState(stateType) {
            let state = null;
            if (this.m_StateDic != null) {
                for (var i = 0; i < this.m_StateDic.length; i++) {
                    if (this.m_StateDic[i].onStateType == stateType) {
                        state = (this.m_StateDic[i]);
                    }
                }
            }
            return state;
        }
        Update() {
            if (this.m_CurrState) {
                this.m_CurrState.Update();
            }
        }
        ChangeState(newState, compel = false) {
            if (this.CurrStateType == newState) {
                return false;
            }
            let temp = this.GetState(newState);
            if (temp == null) {
                return;
            }
            if (this.m_CurrState != null) {
                if (!this.m_CurrState.Exchange && !compel) {
                    return false;
                }
                this.m_CurrState.Leave();
            }
            this.LastStateType = this.CurrStateType;
            this.CurrStateType = newState;
            this.m_CurrState = temp;
            this.m_CurrState.Enter();
            return true;
        }
        ShutDown() {
            if (this.m_CurrState != null) {
                this.m_CurrState.Leave();
            }
            for (let index in this.m_StateDic) {
                this.m_StateDic[index].Destroy();
            }
            delete this.m_StateDic;
        }
    }

    class RabManager {
        constructor(node) {
            this._node = node;
            this.msgList = new Map();
            this.OnInit();
        }
        AddListenerMessage(name, callbreakFun, target = this) {
            if (!this.msgList.has(name)) {
                this.msgList.set(name, callbreakFun);
                Laya.stage.on(name, target, callbreakFun);
            }
        }
        RemoveListenerMessage(name, callbreakFun) {
            Laya.stage.off(name, this, callbreakFun);
            this.msgList.delete(name);
        }
        SendMessage(name, ...args) {
            Laya.stage.event(name, args);
        }
        onDestroy() {
            Laya.timer.clearAll(this);
            Laya.stage.offAllCaller(this);
            this.msgList.clear();
        }
    }
    class MusicManager extends RabManager {
        constructor() {
            super(...arguments);
            this.soundState = 1;
            this.musicState = 1;
            this.bgm = "";
        }
        OnInit() {
            Laya.stage.on(Laya.Event.BLUR, this, () => {
                Laya.SoundManager.stopAll();
            });
            Laya.stage.on(Laya.Event.FOCUS, this, () => {
                Laya.SoundManager.playMusic(this.bgm);
            });
        }
        InitMusic(music, sound) {
            if (music) {
                this.musicState = music;
            }
            if (sound) {
                this.soundState = sound;
            }
            this.SetState(this.musicState, this.soundState);
        }
        SetState(music, audio) {
            Laya.SoundManager.musicMuted = (music == 0) ? true : false;
            Laya.SoundManager.soundMuted = (audio == 0) ? true : false;
        }
        playMusic(url, volume = 2) {
            if (this.musicState == 0) {
                return;
            }
            this.bgm = url;
            Laya.SoundManager.playMusic(url);
        }
        playSound(url, loop = 1, volume = 2, callback = null) {
            if (this.soundState == 0) {
                return;
            }
            Laya.SoundManager.playSound(url, loop, callback);
        }
        stopSound(url) {
            Laya.SoundManager.stopSound(url);
        }
    }
    class UIManager extends RabManager {
        constructor() {
            super(...arguments);
            this.UIList = new Map();
            this._clsList = new Map();
        }
        OnInit() {
        }
        onCreateView(uiclass, breckcall, ...optionalParams) {
            if (this.UIList.has(uiclass)) {
                this.UIList.get(uiclass).onRefresh(optionalParams);
                breckcall && breckcall();
            }
            else {
                var view = this.getRegClass(uiclass, optionalParams);
                if (view) {
                    this.UIList.set(uiclass, view);
                }
            }
        }
        onHideView(uiclass) {
            if (this.UIList.has(uiclass)) {
                this.UIList.get(uiclass).onHide();
            }
        }
        onCloseView(uiclass) {
            if (this.UIList.has(uiclass)) {
                this.UIList.get(uiclass).onDestroy();
                this.UIList.delete(uiclass);
            }
        }
        regClass(className, classDef) {
            if (this._clsList.has(className)) {
                console.log("重复标签了");
            }
            else {
                this._clsList.set(className, classDef);
            }
        }
        getRegClass(className, ...optionalParams) {
            if (this._clsList.has(className)) {
                return new (this._clsList.get(className))(className, optionalParams);
            }
            else {
                console.log("未找注册该类型", this._clsList);
                return null;
            }
        }
    }

    class FsmManager extends RabManager {
        constructor() {
            super(...arguments);
            this.M_FsmDic = new Map();
        }
        OnInit() {
        }
        Create(fsmId, owner, states) {
            let fsm = new Fsm(fsmId, owner, states);
            this.M_FsmDic.set(fsmId, fsm);
            return fsm;
        }
        onGetFsm(fsmId) {
            let fsm = null;
            if (this.M_FsmDic.has(fsmId)) {
                fsm = this.M_FsmDic.get(fsmId);
            }
            return fsm;
        }
        DestroyFsm(fsmId) {
            let fsm = null;
            if (this.M_FsmDic.has(fsmId)) {
                fsm = this.M_FsmDic.get(fsmId);
                fsm.ShutDown();
                this.M_FsmDic.delete(fsmId);
            }
        }
    }

    class GameNotity {
    }
    GameNotity.GameMessage_UpdateUserInfo = "GameMessage_UpdateUserInfo";
    GameNotity.GameMessage_LoadProgess = "GameMessage_LoadProgess";
    GameNotity.GameMessage_LoadingEnd = "GameMessage_LoadingEnd";
    GameNotity.GameMessage_GameStart = "GameMessage_GameStart";
    GameNotity.GameMessage_GameEnd = "GameMessage_GameEnd";

    class GameMessage extends GameNotity {
    }
    GameMessage.MGOBE_JoinRoom = "MGOBE_JoinRoom";
    GameMessage.MGOBE_LeaveRoom = "MGOBE_LeaveRoom";
    GameMessage.MGOBE_EnterRoomFinish = "MGOBE_EnterRoomFinish";
    GameMessage.MGOBE_RecvFromClient = "MGOBE_RecvFromClient";
    GameMessage.MGOBE_RecvFromGameServer = "MGOBE_RecvFromGameServer";
    GameMessage.MGOBE_GameOnLine = "MGOBE_GameOnLine";
    GameMessage.MGOBE_GameOffLine = "MGOBE_GameOffLine";
    GameMessage.MGOBE_ChangeRoomOwner = "MGOBE_ChangeRoomOwner";
    GameMessage.HallView_ShowRole = "HallView_ShowRole";
    GameMessage.GameView_Hint = "GameView_Hint";
    GameMessage.GameView_FindBox = "GameView_FindBox";
    GameMessage.JoystickUp = "JoystickUp";
    GameMessage.JoystickMoving = "JoystickMoving";
    GameMessage.ClickPlaySkill = "ClickPlaySkill";
    GameMessage.Role_Sync = "Role_Sync";
    GameMessage.Role_Skill = "Role_Skill";
    GameMessage.Role_UpdateStone = "Role_UpdateStone";
    GameMessage.Role_TreadTrap = "Role_TreadTrap";
    GameMessage.Role_Task = "Role_Task";
    GameMessage.Role_UpdateTask = "Role_UpdateTask";

    ;
    var JsonList;
    (function (JsonList) {
        JsonList["RoleModelIndex"] = "RoleModelIndex";
    })(JsonList || (JsonList = {}));
    var RoomType;
    (function (RoomType) {
        RoomType["EscapeMode"] = "EscapeMode";
    })(RoomType || (RoomType = {}));
    var PlayerRoomState;
    (function (PlayerRoomState) {
        PlayerRoomState[PlayerRoomState["none"] = 0] = "none";
        PlayerRoomState[PlayerRoomState["hall"] = 1] = "hall";
        PlayerRoomState[PlayerRoomState["waitingRoom"] = 2] = "waitingRoom";
        PlayerRoomState[PlayerRoomState["gameLoading"] = 3] = "gameLoading";
        PlayerRoomState[PlayerRoomState["gameStart"] = 4] = "gameStart";
        PlayerRoomState[PlayerRoomState["gameing"] = 5] = "gameing";
        PlayerRoomState[PlayerRoomState["gameEnd"] = 6] = "gameEnd";
    })(PlayerRoomState || (PlayerRoomState = {}));
    var UnitServerType;
    (function (UnitServerType) {
        UnitServerType["role"] = "role";
    })(UnitServerType || (UnitServerType = {}));
    var GameServerCMD;
    (function (GameServerCMD) {
        GameServerCMD["roleHit"] = "roleHit";
        GameServerCMD["roleRescue"] = "roleRescue";
        GameServerCMD["roleCreateKeyBox"] = "roleCreateKeyBox";
        GameServerCMD["roleGetKeyBox"] = "roleGetKeyBox";
        GameServerCMD["roleCreatePartBox"] = "roleCreatePartBox";
        GameServerCMD["roleGetPartBox"] = "roleGetPartBox";
        GameServerCMD["roleCreateStones"] = "roleCreateStones";
        GameServerCMD["roleGetStones"] = "roleGetStones";
        GameServerCMD["roleSpanner"] = "roleSpanner";
        GameServerCMD["roleSkill"] = "roleSkill";
    })(GameServerCMD || (GameServerCMD = {}));
    var RoleType;
    (function (RoleType) {
        RoleType[RoleType["ghost"] = 0] = "ghost";
        RoleType[RoleType["child"] = 1] = "child";
    })(RoleType || (RoleType = {}));
    var RoleState;
    (function (RoleState) {
        RoleState[RoleState["none"] = 0] = "none";
        RoleState[RoleState["idle"] = 1] = "idle";
        RoleState[RoleState["move"] = 2] = "move";
        RoleState[RoleState["jump"] = 3] = "jump";
        RoleState[RoleState["fall"] = 4] = "fall";
        RoleState[RoleState["jumpDown"] = 5] = "jumpDown";
        RoleState[RoleState["skill"] = 6] = "skill";
        RoleState[RoleState["hit"] = 7] = "hit";
        RoleState[RoleState["death"] = 8] = "death";
        RoleState[RoleState["safe"] = 9] = "safe";
    })(RoleState || (RoleState = {}));
    var DoorType;
    (function (DoorType) {
        DoorType["blue"] = "blue";
        DoorType["green"] = "green";
        DoorType["red"] = "red";
        DoorType["iron"] = "iron";
    })(DoorType || (DoorType = {}));
    var DoorIndex;
    (function (DoorIndex) {
        DoorIndex[DoorIndex["blue"] = 0] = "blue";
        DoorIndex[DoorIndex["green"] = 1] = "green";
        DoorIndex[DoorIndex["red"] = 2] = "red";
        DoorIndex[DoorIndex["iron"] = 3] = "iron";
    })(DoorIndex || (DoorIndex = {}));
    var PropType;
    (function (PropType) {
        PropType["rescue"] = "rescue";
        PropType["keyBox"] = "keyBox";
        PropType["partBox"] = "partBox";
        PropType["stones"] = "stones";
        PropType["spanner"] = "spanner";
    })(PropType || (PropType = {}));
    var RoleSkill;
    (function (RoleSkill) {
        RoleSkill["Child_ThrowStone"] = "Child_ThrowStone";
        RoleSkill["Child_Control"] = "Child_Control";
        RoleSkill["Ghost_StickHit"] = "Ghost_StickHit";
        RoleSkill["Ghost_Trap"] = "Ghost_Trap";
        RoleSkill["Ghost_Shield"] = "Ghost_Shield";
    })(RoleSkill || (RoleSkill = {}));
    var TaskType;
    (function (TaskType) {
        TaskType["Child_GetPart"] = "Child_GetPart";
        TaskType["Child_RescueChild"] = "Child_RescueChild";
        TaskType["Child_StoneHit"] = "Child_StoneHit";
        TaskType["Child_EscapeSuccess"] = "Child_EscapeSuccess";
        TaskType["Ghost_DefenseStone"] = "Ghost_DefenseStone";
        TaskType["Ghost_PreventRescue"] = "Ghost_PreventRescue";
        TaskType["Ghost_ImprisonChild"] = "Ghost_ImprisonChild";
        TaskType["Ghost_DefendDoor"] = "Ghost_DefendDoor";
    })(TaskType || (TaskType = {}));

    class GameStateManager extends RabManager {
        OnInit() {
            this.allPlayerRoomState = new Map();
            this._playerRoomState = PlayerRoomState.hall;
        }
        get ME() {
            return this._playerRoomState;
        }
        setRoomState(id, state) {
            if (this.allPlayerRoomState.has(id) == false) {
                let roomState = {
                    state: state,
                    id: id
                };
                this.allPlayerRoomState.set(id, roomState);
            }
            else {
                this.allPlayerRoomState.get(id).state = state;
            }
            if (id == MGOBE.Player.id) {
                this._playerRoomState = state;
            }
            switch (state) {
                case PlayerRoomState.hall:
                    break;
                case PlayerRoomState.waitingRoom:
                    break;
                case PlayerRoomState.gameLoading:
                    Laya.timer.frameLoop(1, this, this.enterGameRoom);
                    break;
                case PlayerRoomState.gameStart:
                    Laya.timer.frameLoop(1, this, this.startGame);
                    break;
                case PlayerRoomState.gameing:
                    break;
                case PlayerRoomState.gameEnd:
                    break;
            }
        }
        leaveRoom() {
            let room = GameController$1.mgobeManager.roomInfo;
            room.playerList.forEach((value, index) => {
                if (this.allPlayerRoomState.has(value.id) == false) {
                    this.allPlayerRoomState.delete(value.id);
                }
            });
        }
        enterGameRoom() {
            if (this.isNextState(PlayerRoomState.gameLoading) == true) {
                this.SendMessage(GameMessage.GameMessage_LoadingEnd);
                Laya.timer.clear(this, this.enterGameRoom);
            }
        }
        startGame() {
            if (this.isNextState(PlayerRoomState.gameStart) == true) {
                this.SendMessage(GameMessage.GameMessage_GameStart);
                Laya.timer.clear(this, this.startGame);
            }
        }
        isNextState(state) {
            let count = 0;
            if (this.allPlayerRoomState.size < GameController$1.mgobeManager.roomInfo.playerList.length) {
                count = 1;
            }
            else {
                this.allPlayerRoomState.forEach(element => {
                    if (element.state != state) {
                        count += 1;
                    }
                });
            }
            return (count == 0);
        }
    }

    class Util {
        static get isMobil() {
            if (typeof sdk != "undefined") {
                return true;
            }
            return false;
        }
        static random(number) {
            return Math.round(Math.random() * number + 0.4 - 0.4);
        }
        static randomNum(Min, Max) {
            var Range = Max - Min;
            var Rand = Math.random();
            var num = Min + Math.round(Rand * Range);
            return num;
        }
        static randomSort(arr) {
            arr.sort(function () {
                return 0.5 - Math.random();
            });
        }
        static clamp(min, max, data) {
            if (data < min) {
                data = min;
            }
            if (data > max) {
                data = max;
            }
            return data;
        }
        static UpdateTime(time, isChinese = true, isClearZero = false) {
            time = time < 0 ? 0 : time;
            let t = Math.ceil(time);
            let h = Math.floor(t / 3600);
            let m = Math.floor(t % 3600 / 60);
            let s = Math.floor(t % 60);
            let hs = (h >= 10) ? h + "" : ("0" + h);
            let ms = (m >= 10) ? m + "" : ("0" + m);
            let ss = (s >= 10) ? s + "" : ("0" + s);
            let str = "";
            if (h > 0) {
                if (isClearZero == true) {
                    if (hs.indexOf("0") != -1) {
                        hs = hs.substring(1, hs.length);
                        ;
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
                    str = ms + "分" + ss + "秒";
                }
                else {
                    str = ms + ":" + ss;
                }
            }
            return str;
        }
        static distance(p1, p2) {
            var dx = Math.abs(p2.x - p1.x);
            var dy = Math.abs(p2.y - p1.y);
            var dis = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
            return dis;
        }
        static getRadian(angle) {
            return angle * Math.PI / 180;
        }
        static getAngle(px, py, mx, my) {
            var x = Math.abs(px - mx);
            var y = Math.abs(py - my);
            var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
            var cos = y / z;
            var radina = Math.acos(cos);
            var angle = Math.floor(180 / (Math.PI / radina));
            if (mx > px && my > py) {
                angle = 180 - angle;
            }
            if (mx == px && my > py) {
                angle = 180;
            }
            if (mx > px && my == py) {
                angle = 90;
            }
            if (mx < px && my > py) {
                angle = 180 + angle;
            }
            if (mx < px && my == py) {
                angle = 270;
            }
            if (mx < px && my < py) {
                angle = 360 - angle;
            }
            return angle;
        }
        static formatter(value, fix) {
            let $fix = 2;
            let bits = ["K", "M", "B", "T", "aa", "ab", "ac", "ad", "ae", "af", "bb", "bc", "bd"];
            if (value >= 1000) {
                for (let i = bits.length; i > 0; i--) {
                    if (value >= Math.pow(1000, i)) {
                        return `${parseFloat((value / Math.pow(1000, i)).toFixed($fix)).toPrecision(3) + bits[i - 1]}`;
                    }
                }
            }
            return `${parseFloat(value.toFixed($fix))}`;
        }
        static objClone(obj) {
            var dst = {};
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    dst[prop] = obj[prop];
                }
            }
            return dst;
        }
        static getPointToLineLength(x, y, x1, y1, x2, y2) {
            var A = x - x1;
            var B = y - y1;
            var C = x2 - x1;
            var D = y2 - y1;
            var dot = A * C + B * D;
            var len_sq = C * C + D * D;
            var param = -1;
            if (len_sq != 0)
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
        static supplement(org, type, isReverse = false) {
            if (isReverse == false) {
                Object.keys(type).forEach((key) => {
                    org[key] = type[key];
                });
            }
            else {
                Object.keys(org).forEach((key) => {
                    if (type[key] != undefined || type[key] == null) {
                        org[key] = type[key];
                    }
                });
            }
            return org;
        }
        static timestampToDay(oldTime, curTime) {
            let d1 = Math.floor(curTime / (24 * 3600 * 1000));
            let d2 = Math.floor(oldTime / (24 * 3600 * 1000));
            return d1 - d2;
        }
        static isEmpty(str) {
            if (str != null && str != "") {
                return true;
            }
            return false;
        }
        static coverTime(s, en = true) {
            let min = Math.floor(s / 60);
            let seconds = Math.floor(s % 60);
            let str = null;
            if (en) {
                str = min + ":" + seconds;
            }
            else {
                str = min + "分" + seconds + "秒";
            }
            return str;
        }
        static stringToArray(str) {
            str = str.replace(" ", "");
            return str.split(",");
        }
        static stringToVector3(str) {
            let temp = this.stringToArray(str);
            return new Laya.Vector3(parseFloat(temp[0]), parseFloat(temp[1]), parseFloat(temp[2]));
        }
        static stringToQuaternion(str) {
            let temp = this.stringToArray(str);
            return new Laya.Quaternion(parseFloat(temp[0]), parseFloat(temp[1]), parseFloat(temp[2]), parseFloat(temp[3]));
        }
        static getVector(v1, v2, angle) {
            let quaternion = new Laya.Quaternion();
            Laya.Quaternion.createFromYawPitchRoll(angle * (Math.PI / 180), 0, 0, quaternion);
            Laya.Vector3.transformQuat(v1, quaternion, v2);
            return v2;
        }
        static getNewVector3(v1 = null) {
            if (v1 == null) {
                return new Laya.Vector3();
            }
            else {
                return new Laya.Vector3(v1.x, v1.y, v1.z);
            }
        }
        static getDistanceV3(v1, v2, ignore) {
            let v3 = this.getNewVector3(v1);
            let v4 = this.getNewVector3(v2);
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
        static setPosition(data, out, isLocal = false) {
            if (isLocal == false) {
                out.transform.position = this.getPosition(data, out, isLocal);
            }
            else {
                out.transform.localPosition = this.getPosition(data, out, isLocal);
            }
        }
        static getPosition(data, out, isLocal = false) {
            let position = new Laya.Vector3(0, 0, 0);
            if (isLocal == false) {
                position = this.getNewVector3(out.transform.position);
            }
            else {
                position = this.getNewVector3(out.transform.localPosition);
            }
            position.x = isNaN(data.x) ? position.x : data.x;
            position.y = isNaN(data.y) ? position.y : data.y;
            position.z = isNaN(data.z) ? position.z : data.z;
            return position;
        }
        static addPosition(data, out, isLocal = false) {
            if (isLocal == false) {
                out.transform.position = this.getAddPosition(data, out, isLocal);
            }
            else {
                out.transform.localPosition = this.getAddPosition(data, out, isLocal);
            }
        }
        static getAddPosition(data, out, isLocal = false) {
            let position = new Laya.Vector3(0, 0, 0);
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
        static setRotationEuler(data, out, isLocal = false) {
            if (isLocal == false) {
                out.transform.rotationEuler = this.getRotationEuler(data, out, isLocal);
            }
            else {
                out.transform.localRotationEuler = this.getRotationEuler(data, out, isLocal);
            }
        }
        static getRotationEuler(data, out, isLocal = false) {
            let rotation = new Laya.Vector3(0, 0, 0);
            if (isLocal == false) {
                rotation = this.getNewVector3(out.transform.rotationEuler);
            }
            else {
                rotation = this.getNewVector3(out.transform.localRotationEuler);
            }
            rotation.x = isNaN(data.x) ? rotation.x : data.x;
            rotation.y = isNaN(data.y) ? rotation.y : data.y;
            rotation.z = isNaN(data.z) ? rotation.z : data.z;
            return rotation;
        }
        static addRotationEuler(data, out, isLocal = false) {
            if (isLocal == false) {
                out.transform.rotationEuler = this.getAddRotationEuler(data, out, isLocal);
            }
            else {
                out.transform.localRotationEuler = this.getAddRotationEuler(data, out, isLocal);
            }
        }
        static getAddRotationEuler(data, out, isLocal = false) {
            let rotation = new Laya.Vector3(0, 0, 0);
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
        static addButtonAnimation(image, key, isPlaySound = true, isScale = true) {
            if (this.buttonList.has(key) == false) {
                this.buttonList.set(key, []);
            }
            let list = this.buttonList.get(key);
            if (list.indexOf(image) != -1) {
                return;
            }
            list.push(image);
            let canClick = false;
            let onClick = (x, y) => {
                if (this.buttonList.has(key) == true) {
                    let list = this.buttonList.get(key);
                    if (list.indexOf(image) == -1) {
                        return;
                    }
                }
                let scaleX = (image.scaleX > 0) ? x : -x;
                let scaleY = (image.scaleY > 0) ? y : -y;
                Laya.Tween.clearAll(image);
                Laya.Tween.to(image, { scaleX: scaleX, scaleY: scaleY }, 100, null);
            };
            let onDown = (event) => {
                if (isScale == true) {
                    onClick(0.9, 0.9);
                }
                canClick = true;
                event.stopPropagation();
                if (isPlaySound == true) {
                }
            };
            let onUp = (event) => {
                if (canClick == true) {
                    if (isScale == true) {
                        onClick(1, 1);
                    }
                    event.stopPropagation();
                }
                canClick = false;
            };
            let onOut = (event) => {
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
        static removeAllButtonAnimation(key) {
            if (this.buttonList.has(key) == true) {
                let list = this.buttonList.get(key);
                list.forEach((value, index) => {
                    Laya.Tween.clearAll(value);
                });
                this.buttonList.delete(key);
            }
        }
        static removeButtonAnimation(key, image) {
            if (this.buttonList.has(key) == true) {
                let list = this.buttonList.get(key);
                list.forEach((value, index) => {
                    if (image == value) {
                        list.splice(index, 1);
                        return;
                    }
                });
            }
        }
        static showWindowAnimation(window, callback = null) {
            window.scaleX = 0.5;
            window.scaleY = 0.5;
            Laya.Tween.clearAll(window);
            Laya.Tween.to(window, { scaleX: 1.1, scaleY: 1.1 }, 100, null, Laya.Handler.create(this, () => {
                Laya.Tween.to(window, { scaleX: 1, scaleY: 1 }, 100, null, Laya.Handler.create(this, () => {
                    callback && callback();
                }));
            }));
        }
        static isSprite3DTween(sprite) {
            return (this.tweenList[this.tweenType.move].has(sprite.id) == true) ||
                (this.tweenList[this.tweenType.scale].has(sprite.id) == true) ||
                (this.tweenList[this.tweenType.rotation].has(sprite.id) == true);
        }
        static sprite3DStopTween(sprite, type) {
            let stop = (tween) => {
                tween.pause();
                tween.clear();
                tween.recover();
            };
            let list = this.tweenList[type];
            list.forEach((value, key) => {
                if (key == sprite.id) {
                    stop(value);
                    list.delete(key);
                }
            });
        }
        static sprite3DMove(sprite, props, isLocal, duration, ease, completed, progress) {
            this.sprite3DStopTween(sprite, this.tweenType.move);
            let position = new Laya.Vector3(0, 0, 0);
            if (isLocal == false) {
                position = sprite.transform.position;
            }
            else {
                position = sprite.transform.localPosition;
            }
            this.tweenList[this.tweenType.move].set(sprite.id, this.tweenUpdate(sprite, position, props, duration, ease, () => {
                this.sprite3DStopTween(sprite, this.tweenType.move);
                completed && completed();
            }, (toPos) => {
                this.setPosition(toPos, sprite, isLocal);
                progress && progress();
            }));
        }
        static sprite3DScale(sprite, props, duration, ease, completed, progress) {
            this.sprite3DStopTween(sprite, this.tweenType.scale);
            this.tweenList[this.tweenType.scale].set(sprite.id, this.tweenUpdate(sprite, sprite.transform.getWorldLossyScale(), props, duration, ease, () => {
                this.sprite3DStopTween(sprite, this.tweenType.scale);
                completed && completed();
            }, (toPos) => {
                sprite.transform.setWorldLossyScale(toPos);
                progress && progress();
            }));
        }
        static sprite3DRotation(sprite, props, isLocal, duration, ease, completed, progress) {
            this.sprite3DStopTween(sprite, this.tweenType.rotation);
            let rotation = new Laya.Vector3();
            if (isLocal == false) {
                rotation = sprite.transform.rotationEuler;
            }
            else {
                rotation = sprite.transform.localRotationEuler;
            }
            this.tweenList[this.tweenType.rotation].set(sprite.id, this.tweenUpdate(sprite, rotation, props, duration, ease, () => {
                this.sprite3DStopTween(sprite, this.tweenType.rotation);
                completed && completed();
            }, (toPos) => {
                this.setRotationEuler(toPos, sprite, isLocal);
                progress && progress();
            }));
        }
        static tweenUpdate(sprite, initProps, endProps, duration, ease, completed, progress) {
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
                    if (sprite == null || sprite.destroyed)
                        return;
                    v3.x = initProp.x;
                    v3.y = initProp.y;
                    v3.z = initProp.z;
                    progress && progress(v3);
                })
            };
            return Laya.Tween.to(initProp, endProp, duration, ease, new Laya.Handler(this, completed));
        }
        static Log(...msg) {
            if (GameConfig.stat) {
                console.log(msg);
            }
        }
    }
    Util.version = "1.0.0";
    Util.tweenList = {
        move: new Map(),
        scale: new Map(),
        rotation: new Map(),
    };
    Util.tweenType = {
        move: "move",
        scale: "scale",
        rotation: "rotation"
    };
    Util.buttonList = new Map();

    class MgobeManager extends RabManager {
        constructor() {
            super(...arguments);
            this._frameHandler = new Map();
        }
        OnInit() {
            this.gamelogic = GameManager$1.gameLogicManager;
            var gameConfig = {
                gameId: "obg-52gwuamv",
                openId: this.gamelogic.gameInfo.openId,
                secretKey: "056f40194cc2cca04d555824e112586d8c18f2f4",
                server: "",
            };
            var config = {
                url: "52gwuamv.wxlagame.com",
                reconnectMaxTimes: 5,
                reconnectInterval: 4000,
                resendInterval: 2000,
                resendTimeout: 20000,
                isAutoRequestFrame: true,
            };
            MGOBE.Listener.init(gameConfig, config, (event) => {
                if (event.code == 0) {
                    Util.Log("初始化对战引擎成功", MGOBE.Player.id);
                    if (event.code === MGOBE.ErrCode.EC_OK) {
                        this.initRoom();
                        this.setBroadcast();
                        GameController$1.onInitHall();
                        this.SendMessage(GameNotity.GameMessage_LoadingEnd);
                    }
                }
                Util.Log("初始化对战引擎==", event);
            });
        }
        OnreceiveFrameMessage(key, call) {
            if (!this._frameHandler.has(key)) {
                this._frameHandler.set(key, call);
            }
        }
        initRoom() {
            this._frame = null;
            this.room = new MGOBE.Room();
            MGOBE.Listener.add(this.room);
            MGOBE.Room.getMyRoom((event) => {
                Util.Log("初始化对战引擎成功", event);
                if (event.code === MGOBE.ErrCode.EC_OK) {
                    this.room.initRoom(event.data.roomInfo);
                    this.onEnterGameRoom(event.data);
                    Util.Log("玩家已在房间内：", event.data.roomInfo.name);
                }
                if (event.code === 20011) {
                    Util.Log("玩家不在房间内");
                }
            });
        }
        setBroadcast() {
            if (!this.room) {
                return;
            }
            this.room.onJoinRoom = event => {
                let joinPlayerId = event.data.joinPlayerId;
                MGOBE.Room.getMyRoom((event) => {
                    if (event.code === MGOBE.ErrCode.EC_OK) {
                        this._roomInfo = event.data.roomInfo;
                        this.SendMessage(GameMessage.MGOBE_JoinRoom, joinPlayerId);
                    }
                });
                Util.Log("新玩家加入", event);
            };
            this.room.onLeaveRoom = event => {
                let leavePlayerId = event.data.leavePlayerId;
                MGOBE.Room.getMyRoom((event) => {
                    if (event.code === MGOBE.ErrCode.EC_OK) {
                        this._roomInfo = event.data.roomInfo;
                        this.SendMessage(GameMessage.MGOBE_LeaveRoom, leavePlayerId);
                    }
                });
                Util.Log("退出房间:", event);
            };
            this.room.onDismissRoom = event => {
                Util.Log("解散房间:", event);
            };
            this.room.onChangeCustomPlayerStatus = event => {
                if (this._roomInfo && event.data.roomInfo.id == this._roomInfo.id) {
                    GameController$1.gameStateManager.setRoomState(event.data.changePlayerId, event.data.customPlayerStatus);
                }
            };
            this.room.onAutoRequestFrameError = event => {
                Util.Log("onAutoRequestFrameError");
            };
            this.room.onRecvFromGameSvr = event => {
                let bool = true;
                for (let index in UnitServerType) {
                    if (event.data.data["cmd"].indexOf(UnitServerType[index]) != -1) {
                        let sendServerID = event.data.data["sendServerID"];
                        bool = (this.recvServerID.get(UnitServerType[index]) < sendServerID);
                        if (bool == true) {
                            this.recvServerID.set(UnitServerType[index], sendServerID);
                            if (index.indexOf(UnitServerType.role) != -1) {
                                this.sendServerID.set(UnitServerType[index], sendServerID);
                            }
                            break;
                        }
                    }
                }
                if (this._roomInfo && event.data.roomId == this._roomInfo.id && bool == true) {
                    this.SendMessage(GameMessage.MGOBE_RecvFromGameServer, event.data.data);
                }
                else {
                    Util.Log("实时服务器接收数据：", event.data);
                }
            };
            this.room.onRecvFromClient = event => {
                if (this._roomInfo && event.data.roomId == this._roomInfo.id) {
                    if (MGOBE.Player.id == event.data.sendPlayerId) {
                    }
                    else {
                        this.SendMessage(GameMessage.MGOBE_RecvFromClient, event.data);
                    }
                }
            };
            this.room.onRecvFrame = event => {
                if (this._roomInfo && event.data.frame.roomId == this._roomInfo.id) {
                    if (event.data.frame.items.length > 0) {
                        this._frameHandler.forEach((item, key) => {
                            item && item(event.data.frame);
                        });
                    }
                }
            };
            this.room.onChangePlayerNetworkState = event => {
                if (this._roomInfo) {
                    this._roomInfo = event.data.roomInfo;
                    if (event.data.networkState == MGOBE.types.NetworkState.COMMON_OFFLINE) {
                    }
                    if (event.data.networkState == MGOBE.types.NetworkState.RELAY_OFFLINE) {
                        this.SendMessage(GameMessage.MGOBE_GameOffLine, event.data.changePlayerId);
                        if (event.data.changePlayerId == MGOBE.Player.id) {
                            Util.Log("我在游戏中掉线了");
                        }
                    }
                    if (event.data.networkState == MGOBE.types.NetworkState.COMMON_ONLINE) {
                        if (event.data.changePlayerId == MGOBE.Player.id) {
                            Util.Log("我在游戏中又上线了");
                            this.SendMessage(GameMessage.MGOBE_GameOnLine);
                        }
                    }
                    if (event.data.networkState == MGOBE.types.NetworkState.RELAY_ONLINE) {
                    }
                }
            };
            this.room.onChangeRoom = event => {
                console.log("房间属性变更", event.data.roomInfo);
                if (this._roomInfo.id == event.data.roomInfo.id) {
                    this._roomInfo = event.data.roomInfo;
                    if (this.roomOwner != this._roomInfo.owner) {
                        this.roomOwner = this._roomInfo.owner + "";
                        this.SendMessage(GameMessage.MGOBE_ChangeRoomOwner);
                    }
                }
            };
        }
        onEnterGameRoom(data) {
            if (data.roomInfo) {
                this.leaveRoom(() => {
                });
            }
        }
        changeCustomPlayerStatus(playerstatus) {
            if (this.room) {
                this.room.changeCustomPlayerStatus({ customPlayerStatus: playerstatus }, event => {
                    if (event.code === MGOBE.ErrCode.EC_OK) {
                        Util.Log(`修改玩家状态是修改成功`);
                    }
                    else {
                        Util.Log(`修改玩家状态是修改失败，错误码：${event.code}`);
                    }
                });
            }
        }
        startFrameSync() {
            this.room.startFrameSync({}, event => {
                if (event.code === MGOBE.ErrCode.EC_OK) {
                    Util.Log(`开始帧同步成功`);
                }
                else {
                    Util.Log(`开始帧同步失败，错误码：${event.code}`);
                }
            });
        }
        CreateRoom(roomName, roomType) {
            let userInfo = {
                id: MGOBE.Player.id,
                nickName: this.gamelogic.gameInfo.nickName,
                avatarUrl: this.gamelogic.gameInfo.avatarUrl,
                role: this.gamelogic.gameInfo.currentRole,
            };
            let data = {
                roomName: roomName,
                roomType: roomType,
                maxPlayers: 8,
                isPrivate: false,
                customProperties: "WAIT",
                playerInfo: {
                    name: this.gamelogic.gameInfo.nickName,
                    customPlayerStatus: 0,
                    customProfile: JSON.stringify(userInfo),
                }
            };
            this.room.createRoom(data, event => {
                Util.Log("创建房间", event);
                if (event.code === MGOBE.ErrCode.EC_OK) {
                    Util.Log("创建房间成功");
                    this._roomInfo = event.data.roomInfo;
                    this.onEnterGame();
                }
                else {
                }
            });
        }
        JoinRoom(roomId) {
            this.room.initRoom({ id: roomId });
            let joinRoomPara = {
                playerInfo: {
                    name: this.gamelogic.gameInfo.nickName,
                    customPlayerStatus: 0,
                    customProfile: JSON.stringify({
                        id: MGOBE.Player.id,
                        nickName: this.gamelogic.gameInfo.nickName,
                        avatarUrl: this.gamelogic.gameInfo.avatarUrl,
                        role: this.gamelogic.gameInfo.currentRole,
                    }),
                }
            };
            this.room.joinRoom(joinRoomPara, event => {
                Util.Log("加入房间", event);
                if (event.code === MGOBE.ErrCode.EC_OK) {
                    Util.Log("加入房间成功");
                    this._roomInfo = event.data.roomInfo;
                    this.onEnterGame();
                }
                else {
                }
            });
        }
        leaveRoom(breakCall) {
            this._frame = null;
            if (this._roomInfo == null) {
                this.room.leaveRoom(() => {
                });
                return;
            }
            if (this._roomInfo.playerList.length > 1) {
                if (this.isRoomOwner() == true) {
                    this._roomInfo.playerList.forEach((value, index) => {
                        if (value.id != this._roomInfo.owner) {
                            this.changeRoom(false, value.id);
                            return;
                        }
                    });
                }
                this.room.leaveRoom({}, event => {
                    if (event.code === MGOBE.ErrCode.EC_OK) {
                        Util.Log("退出房间成功", event.code);
                        breakCall && breakCall();
                    }
                    else {
                        Util.Log(`退出房间失败，错误码：${event.code}`);
                    }
                });
            }
            else {
                this.dismissRoom();
            }
        }
        dismissRoom() {
            if (this._roomInfo == null) {
                return;
            }
            if (MGOBE.Player.id == this._roomInfo.owner) {
                this.room.dismissRoom({}, event => {
                    if (event.code === MGOBE.ErrCode.EC_OK) {
                        Laya.timer.clearAll(this);
                        GameController$1.gameOver();
                        Util.Log("解散房间成功", event.code);
                    }
                    else {
                        Util.Log(`解散房间失败，错误码：${event.code}`);
                    }
                });
            }
        }
        cancelMatch() {
            this.room.cancelPlayerMatch({ matchType: MGOBE.ENUM.MatchType.PLAYER_COMPLEX }, event => {
                Util.Log("取消匹配", event.code);
            });
        }
        changeRoom(isForbidJoin, owner = this._roomInfo.owner) {
            const changeRoomPara = {
                isForbidJoin: isForbidJoin,
                owner: owner,
            };
            this.room.changeRoom(changeRoomPara, event => {
                if (event.code === 0) {
                    console.log("更新房间信息成功", event.data.roomInfo);
                }
            });
        }
        sendToClient(msg) {
            const sendToClientPara = {
                recvPlayerList: [],
                recvType: MGOBE.types.RecvType.ROOM_ALL,
                msg,
            };
            this.room.sendToClient(sendToClientPara, event => {
                if (event.code === MGOBE.ErrCode.EC_OK) {
                }
                else {
                    Util.Log(`发送房间消息失败，错误码：${event.code}`);
                }
            });
        }
        sendToGameSvr(cmd, _data, id) {
            let _sendPlayid = MGOBE.Player.id;
            if (id != null) {
                _sendPlayid = id;
            }
            let sendServerID = 0;
            for (let index in UnitServerType) {
                if (cmd.indexOf(UnitServerType[index]) != -1) {
                    sendServerID = this.sendServerID.get(UnitServerType[index]) + 1;
                    this.sendServerID.set(UnitServerType[index], sendServerID);
                    if (sendServerID <= this.recvServerID.get(UnitServerType[index])) {
                        return;
                    }
                    break;
                }
            }
            const sendToGameSvrPara = {
                data: { cmd: cmd, sendServerID: sendServerID, data: _data, sendPlayid: _sendPlayid }
            };
            this.room.sendToGameSvr(sendToGameSvrPara, event => {
                if (event.code === MGOBE.ErrCode.EC_OK) {
                }
                else {
                    Util.Log(`发送实时服务器消息失败，错误码：${event.code}`);
                }
            });
        }
        sendFrame(senddata) {
            const sendFramePara = {
                data: senddata,
            };
            this.room.sendFrame(sendFramePara, event => {
                if (event.code === MGOBE.ErrCode.EC_OK) {
                }
                else {
                    Util.Log(`发送帧消息失败，错误码：${event.code}`);
                }
            });
        }
        getRoomList(breakCall) {
            MGOBE.Room.getRoomList({
                pageNo: 1,
                pageSize: 10,
            }, (event) => {
                Util.Log("房间列表", event);
                if (event.data) {
                    breakCall && breakCall(event.data.roomList);
                }
                else {
                    breakCall && breakCall(null);
                }
            });
        }
        getRoleCount(roomInfo) {
            let ghost = 0;
            let child = 0;
            roomInfo.playerList.forEach((value, index) => {
                let fightUserInfo = JSON.parse(value.customProfile);
                if (fightUserInfo.role.type == RoleType.ghost) {
                    ghost++;
                }
                else {
                    child++;
                }
            });
            return [ghost, child];
        }
        isJoinRoom(roomInfo) {
            if (roomInfo.playerList.length >= 2) {
                let count = this.getRoleCount(roomInfo);
                if (count[0] >= 2 && this.gamelogic.gameInfo.currentRole.type == RoleType.ghost) {
                    Util.Log("请换一个角色加入房间");
                    return false;
                }
                else if (count[1] >= 6 && this.gamelogic.gameInfo.currentRole.type == RoleType.child) {
                    Util.Log("请换一个角色加入房间");
                    return false;
                }
            }
            return true;
        }
        onQuickMatch(roomType) {
            this.getRoomList((roomList) => {
                if (roomList) {
                    this._roomList = roomList;
                    let arr = [];
                    for (var i = 0; i < this._roomList.length; i++) {
                        if (this._roomList[i].type == roomType) {
                            if (!this._roomList[i].isForbidJoin && !this._roomList[i].isPrivate) {
                                if (this._roomList[i].maxPlayers > this._roomList[i].playerList.length) {
                                    arr.push(this._roomList[i]);
                                }
                            }
                        }
                    }
                    let bool = false;
                    if (arr.length > 0) {
                        let count = 0;
                        while (count < this._roomList.length && bool == false) {
                            let index = Util.randomNum(0, arr.length - 1);
                            if (this.isJoinRoom(arr[index]) == true) {
                                this.JoinRoom(arr[index].id);
                                bool = true;
                            }
                            count++;
                        }
                    }
                    if (bool == false) {
                        Util.Log("没有符合条件的房间");
                        this.CreateRoom("恐怖屋", roomType);
                    }
                }
                else {
                    Util.Log("没有房间创建一个吧");
                    this.CreateRoom("恐怖屋", roomType);
                }
            });
        }
        onEnterGame() {
            this.sendServerID = new Map();
            this.recvServerID = new Map();
            for (let index in UnitServerType) {
                this.sendServerID.set(UnitServerType[index], 0);
                this.recvServerID.set(UnitServerType[index], 0);
            }
            ;
            this.roomOwner = this._roomInfo.owner + "";
            this.startFrameSync();
            this.SendMessage(GameMessage.MGOBE_EnterRoomFinish);
        }
        getPlayInfo(id) {
            let info;
            this._roomInfo.playerList.forEach(play => {
                if (play && play.id == id) {
                    info = play;
                    return play;
                }
            });
            return info;
        }
        isRoomOwner() {
            return this._roomInfo.owner == MGOBE.Player.id;
        }
        get roomInfo() {
            return this._roomInfo;
        }
        get GameFrame() {
            return this._frame;
        }
    }

    class RabObject extends Laya.Script {
        constructor() {
            super();
            this.msgList = {};
        }
        myManager(c) {
            if (!this._myManager) {
                this._myManager = (GameManager$1.getManager(c));
                ;
            }
            return (this._myManager);
        }
        AddListenerMessage(name, callbreakFun, target = this) {
            if (!this.msgList[name]) {
                this.msgList[name] = 1;
                Laya.stage.on(name, target, callbreakFun);
            }
        }
        RemoveListenerMessage(name, callbreakFun) {
            Laya.stage.off(name, this, callbreakFun);
            this.msgList[name] = 0;
        }
        SendMessage(name, ...args) {
            Laya.stage.event(name, args);
        }
        onDestroy() {
            this.msgList = null;
            Laya.timer.clearAll(this);
            Laya.stage.offAllCaller(this);
        }
        OnRemove() {
            this.onDestroy();
        }
        findChild(parent, path) {
            var paths = path.split("/");
            var child = parent;
            if (paths) {
                for (var i = 0; i < paths.length; ++i) {
                    child = parent.getChildByName(paths[i]);
                    parent = child;
                }
            }
            return child;
        }
    }

    class Size {
        constructor(w, h) {
            this._w = w;
            this._h = h;
        }
        get Width() {
            return this._w;
        }
        get Height() {
            return this._h;
        }
    }

    class PublicSDK {
        constructor() {
            Util.Log("初始化微信SDK");
            this.showShareMenu();
        }
        showShareMenu(withShareTicket = true) {
            if (typeof wx != "undefined") {
                wx.showShareMenu({
                    withShareTicket: withShareTicket
                });
                wx.onShareAppMessage(() => {
                    return {
                        title: "和平峡谷，水晶吃鸡，真实王者对战！",
                        imageUrl: "https://mmocgame.qpic.cn/wechatgame/zez7olQ7aib5uhVRWiaPgplKgNMB5ZSGqibl4fBCiauWS0lMdTxqYH6SB3RIDYOnZ2icQ/0"
                    };
                });
            }
        }
        hideLoading() {
            if (typeof wx != "undefined") {
                wx.hideLoading();
            }
        }
        showLoading(_title) {
            if (typeof wx != "undefined") {
                wx.showLoading({
                    title: _title,
                    mask: false,
                    success: () => { },
                    fail: () => {
                    },
                    complete: () => { }
                });
            }
        }
        showModal(opt) {
            if (typeof wx != "undefined") {
                wx.showModal({
                    title: opt.title || "提示",
                    content: opt.content || "提示内容",
                    success(res) {
                        if (res.confirm) {
                            Util.Log("confirm, continued");
                            opt.success && opt.success();
                        }
                        else if (res.cancel) {
                            Util.Log("cancel, cold");
                            opt.cancel && opt.cancel();
                        }
                        else {
                        }
                    },
                    fail() {
                        Util.Log(`showModal调用失败`);
                    }
                });
            }
            else {
                Util.Log(`提示框`);
            }
        }
        showToast(msg, time) {
            if (Util.isMobil) {
                wx.showToast({
                    title: msg,
                    icon: 'none',
                    duration: time || 2000
                });
            }
            else {
                Util.Log(msg);
            }
        }
        vibrateLong() {
            if (typeof wx != "undefined") {
                wx.vibrateLong();
            }
        }
        vibrateShort() {
            if (typeof wx != "undefined") {
                wx.vibrateShort();
            }
        }
        getSystemInfoSync() {
            if (typeof wx != "undefined") {
                var phone = wx.getSystemInfoSync();
                return new Size(phone.screenWidth, phone.screenHeight);
            }
        }
        getMenuButtonBoundingClientRect() {
            if (typeof wx != "undefined") {
                return wx.getMenuButtonBoundingClientRect();
            }
            return null;
        }
        UpdateGame(call) {
            if (typeof wx != "undefined") {
                if (typeof wx.getUpdateManager === 'function') {
                    const updateManager = wx.getUpdateManager();
                    updateManager.onCheckForUpdate(function (res) {
                        call && call(1);
                        Util.Log("===新版本=====" + res.hasUpdate);
                    });
                    updateManager.onUpdateReady(function () {
                        Util.Log("===新版本并重启=====");
                        updateManager.applyUpdate();
                        call && call(1);
                    });
                    updateManager.onUpdateFailed(function () {
                        Util.Log("版本更新失败");
                        call && call(0);
                    });
                }
                else {
                    call && call(1);
                }
            }
            else {
                call && call(1);
            }
        }
        getSystemInfo(_version = '2.3.0') {
            if (typeof wx != "undefined") {
                const version = wx.getSystemInfoSync().SDKVersion || "1.1.0";
                if (this.compareVersion(version, _version) >= 0) {
                    return true;
                }
                else {
                    return false;
                }
            }
            return true;
        }
        compareVersion(v1, v2) {
            v1 = v1.split('.');
            v2 = v2.split('.');
            const len = Math.max(v1.length, v2.length);
            while (v1.length < len) {
                v1.push('0');
            }
            while (v2.length < len) {
                v2.push('0');
            }
            for (let i = 0; i < len; i++) {
                const num1 = parseInt(v1[i]);
                const num2 = parseInt(v2[i]);
                if (num1 > num2) {
                    return 1;
                }
                else if (num1 < num2) {
                    return -1;
                }
            }
            return 0;
        }
        openCustomerServiceConversation(title, img, success, fail) {
            if (typeof wx != 'undefined') {
                if (wx.openCustomerServiceConversation) {
                    wx.openCustomerServiceConversation({
                        showMessageCard: true,
                        sendMessageTitle: title,
                        sendMessageImg: img,
                        success: (res) => {
                            success && success(res);
                        },
                        fail: (res) => {
                            fail && fail(res);
                        }
                    });
                }
            }
        }
        createUserInfoButton(left, top, width, height, handler) {
            this.btnAuthorize = wx.createUserInfoButton({
                type: 'image',
                style: {
                    left: left - (width / 2),
                    top: top - (height / 2),
                    width: width,
                    height: height,
                    lineHeight: 0,
                    backgroundColor: '',
                    color: '#ffffff',
                    textAlign: 'center',
                    fontSize: 16,
                    borderRadius: 4
                }
            });
            this.btnAuthorize.onTap((res) => {
                if (res.userInfo) {
                    wx.showToast({ title: "授权成功" });
                    sdk.getUserInfo();
                    Util.Log("授权成功:", res.userInfo);
                    Util.Log("隐藏当前按钮");
                    this.btnAuthorize.hide();
                    handler(1);
                }
                else {
                    wx.showToast({ title: "授权失败" });
                    handler(0);
                }
            });
        }
        destroyUserInfoButton() {
            if (this.btnAuthorize) {
                this.btnAuthorize.destroy();
            }
        }
        hideUserInfoButton() {
            if (this.btnAuthorize) {
                this.btnAuthorize.hide();
            }
        }
        showUserInfoButton() {
            if (this.btnAuthorize) {
                this.btnAuthorize.show();
            }
        }
    }

    class SDKChannel {
        constructor() {
            this._publicSDK = new PublicSDK();
        }
        initData(gameInfo, config, key = "gameinfo") {
            this._gameconf = config;
            if (typeof wx != "undefined") {
            }
            else {
                var info = Laya.LocalStorage.getItem(key);
                if (info) {
                    let data = JSON.parse(info);
                    gameInfo = Util.supplement(gameInfo, data);
                }
            }
            return gameInfo;
        }
        login(breakcall) {
            breakcall && breakcall();
        }
        createUserInfoButton(handler) {
            if (typeof sdk != 'undefined') {
                {
                    let left = 0;
                    let top = 0;
                    let width = Laya.stage.width;
                    let height = Laya.stage.height;
                    0;
                    this._publicSDK.createUserInfoButton(left, top, width, height, handler);
                }
            }
        }
        SaveData(gameInfo, key = "gameinfo") {
            Laya.LocalStorage.setItem(key, JSON.stringify(gameInfo));
        }
        onHide(breakcall) {
            if (typeof sdk != "undefined") {
                Util.Log("隐藏游戏");
                sdk.onHide(breakcall);
            }
        }
        onShow(breakcall) {
        }
        UpdateGame(call) {
        }
        stimulate(pos, succeed, fail) {
            let way = this._gameconf.config[pos];
            switch (way) {
                case 0:
                    succeed();
                    break;
                case 1:
                    this.createShare(pos, () => {
                        succeed();
                    }, () => {
                        fail && fail();
                    });
                    break;
                case 2:
                    this.createVideo(pos, () => {
                        succeed();
                        GameManager$1.musicManager.InitMusic();
                    }, () => {
                        fail && fail();
                        GameManager$1.musicManager.InitMusic();
                    });
                    break;
                default:
                    fail && fail();
                    this._publicSDK.showToast("该功能未开发!");
            }
        }
        createShare(_pos, succeed, fail, imageUrl, title, query) {
            if (this._gameconf.config.allow_share) {
            }
            else {
                this._publicSDK.showToast("功能未启动");
                fail && fail();
            }
        }
        createVideo(pos, succeed, fail) {
            if (typeof wx != 'undefined') {
                if (this._gameconf.config.allow_video) {
                }
                else {
                    this._publicSDK.showToast("视频功能未启动");
                    fail && fail();
                }
            }
        }
        createBanner(_pos) {
            if (_pos != "") {
            }
        }
        closeBanner(pos = "") {
            if (pos != "") {
            }
        }
        getAdGame(pos, success, count = 10) {
        }
        onTapAdGame(pos, item, success, fail) {
        }
        traceEvent(key, data) {
        }
    }
    var SDKChannel$1 = new SDKChannel();

    class RabView extends RabObject {
        constructor(className, value) {
            super();
            this.classPath = "";
            this.classPath = className;
            this._viewdata = value;
            this.OnInit();
            this.LoadView();
        }
        LoadView() {
            fgui.UIPackage.loadPackage(this._path, Laya.Handler.create(this, this.onUILoaded));
        }
        onUILoaded() {
            this._view = fgui.UIPackage.createObject(this._pkgName, this._resName).asCom;
            this._view.setSize(fgui.GRoot.inst.width, fgui.GRoot.inst.height);
            this._view.addRelation(fgui.GRoot.inst, fgui.RelationType.Size);
            fgui.GRoot.inst.addChild(this._view);
            this.onShow();
            this.InitView();
        }
        onShow() {
            this._view.enabled = true;
            this.onResize();
            this.createBanner();
        }
        onRefresh(value) {
            this._viewdata = value;
            this.onShow();
        }
        onHide() {
            this._view.enabled = false;
            Laya.timer.clearAll(this);
            this.closeBanner();
        }
        onResize() {
            this._view.setSize(Laya.stage.width, Laya.stage.height);
        }
        OnCloseView() {
            GameManager$1.uimanager.onCloseView(this.classPath);
        }
        onDestroy() {
            this.onHide();
            this._view.dispose();
            super.onDestroy();
        }
        createBanner() {
            SDKChannel$1.createBanner(this._bannerPos);
        }
        closeBanner() {
            SDKChannel$1.closeBanner(this._bannerPos);
        }
    }

    class GameView extends RabView {
        OnInit() {
            this._path = "res/UI/GameView";
            this._pkgName = "GameView";
            this._resName = "Main";
        }
        onResize() {
            let scaleX = Laya.stage.width / Laya.stage.designWidth;
            for (let index = 0; index < this._view.numChildren; index++) {
                this._view.getChildAt(index).x *= scaleX;
            }
        }
        InitView() {
            this.time = 60 * 30;
            this.gameInfo = this._view.getChild("gameInfo").asCom;
            this.taskList = this._view.getChild("task").asCom.getChild("taskList").asList;
            this.timeText = this.gameInfo.getChild("timeText").asTextField;
            this.timeText.text = Util.UpdateTime(this.time, false, true);
            this.gameInfo.getChild("roleCountText").asTextField.text = "幸存者: " + GameController$1.roleManager.getAllChild().length;
            this.gameInfo.getChild("hintText1").visible = false;
            this.gameInfo.getChild("hintText2").visible = false;
            this.gameInfo.getChild("hintText3").visible = false;
            this.hintCount = 1;
            this.taskList.visible = false;
            GameController$1.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.gameStart);
            this.AddListenerMessage(GameMessage.GameView_Hint, this.showHint, this);
            this.AddListenerMessage(GameMessage.GameView_FindBox, this.updateBox, this);
            this.AddListenerMessage(GameMessage.Role_UpdateTask, this.updateTask, this);
            this.AddListenerMessage(GameMessage.GameMessage_GameStart, this.startGame, this);
            this.AddListenerMessage(GameMessage.GameMessage_GameEnd, this.endGame, this);
        }
        startGame() {
            GameManager$1.uimanager.onCreateView(ViewConfig.JoystickView);
            GameController$1.propManager.start();
            GameController$1.taskManager.start();
            GameController$1.mgobeManager.sendToGameSvr(GameMessage.Role_Sync, {});
            GameController$1.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.gameing);
            this.updateTask();
            Laya.timer.loop(1000, this, this.second);
        }
        endGame() {
            if (GameController$1.doorManager.isOpenDoor == false) {
                GameController$1.taskManager.ghostTask.get(TaskType.Ghost_DefendDoor).count++;
            }
            GameController$1.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.gameEnd);
            GameController$1.gameOver();
        }
        second() {
            this.time--;
            if (this.time < 0) {
                this.endGame();
                Laya.timer.clear(this, this.second);
            }
            else {
                this.timeText.text = Util.UpdateTime(this.time, false, true);
            }
        }
        showHint(hint) {
            if (GameController$1.gameStateManager.ME < PlayerRoomState.gameLoading) {
                return;
            }
            let item = this.gameInfo.getChild("hintText" + this.hintCount);
            item.y = 202;
            item.asTextField.text = "提示语: " + hint;
            item.visible = true;
            Laya.Tween.clearAll(item);
            Laya.Tween.to(item, { y: 128 }, 1000, null, Laya.Handler.create(this, () => {
                item.asTextField.text = "";
                item.visible = false;
            }));
            this.hintCount++;
            if (this.hintCount > 3) {
                this.hintCount = 1;
            }
        }
        updateBox(propType, index) {
            if (propType == PropType.partBox) {
                let part = this.gameInfo.getChild("part" + (index + 1)).asCom;
                part.getChildAt(1).visible = true;
                this.gameInfo.getChild("partCountText").asTextField.text = "已获逃亡零件: " + (index + 1);
            }
            else if (propType == PropType.keyBox) {
                let key = this.gameInfo.getChild("key" + (index + 1)).asCom;
                key.getChildAt(1).visible = true;
                if (index == DoorIndex.blue) {
                    key.getChildAt(1).asImage.color = "#0000FF";
                    this.gameInfo.getChild("key" + (index + 1) + "Text").asTextField.color = "#0000FF";
                }
                else if (index == DoorIndex.green) {
                    key.getChildAt(1).asImage.color = "#00FF00";
                    this.gameInfo.getChild("key" + (index + 1) + "Text").asTextField.color = "#00FF00";
                }
                else if (index == DoorIndex.red) {
                    key.getChildAt(1).asImage.color = "#FF0000";
                    this.gameInfo.getChild("key" + (index + 1) + "Text").asTextField.color = "#FF0000";
                }
            }
        }
        updateTask() {
            this.taskList.numItems = GameController$1.taskManager.meTask.size;
            this.taskList.visible = true;
            let index = 0;
            GameController$1.taskManager.meTask.forEach((value, key) => {
                let item = this.taskList.getChildAt(index);
                item.asCom.getChild("explainText").asTextField.text = value.name;
                item.asCom.getChild("countText").asTextField.text = value.count + " / " + value.maxCount;
                if (value.count >= value.maxCount) {
                    item.asCom.getChild("explainText").asTextField.color = "#00FF00";
                    item.asCom.getChild("countText").asTextField.color = "#00FF00";
                }
                else {
                    item.asCom.getChild("explainText").asTextField.color = "#FFFFFF";
                    item.asCom.getChild("countText").asTextField.color = "#FFFFFF";
                }
                index++;
            });
        }
    }

    class HallView extends RabView {
        OnInit() {
            this._path = "res/UI/HallView";
            this._pkgName = "HallView";
            this._resName = "Main";
        }
        onResize() {
            let scaleX = Laya.stage.width / Laya.stage.designWidth;
            if (scaleX > 1) {
                this._view.getChildAt(0).scaleX = scaleX;
            }
            for (let index = 0; index < this._view.numChildren; index++) {
                this._view.getChildAt(index).x *= scaleX;
            }
        }
        InitView() {
            this.peripherySystem();
            this.gameMode();
            this.InitScene3D();
            this.userInfo();
            this.updateUserInfo();
            GameController$1.gameStateManager.setRoomState(MGOBE.Player.id, PlayerRoomState.hall);
            this.AddListenerMessage(GameMessage.GameMessage_UpdateUserInfo, this.updateUserInfo, this);
            this.AddListenerMessage(GameMessage.MGOBE_EnterRoomFinish, this.enterRoom, this);
        }
        peripherySystem() {
            let peripheryList = this._view.getChild("PeripheryList").asList;
            for (let index = 0; index < peripheryList.numChildren; index++) {
                peripheryList.getChildAt(index).asCom.setPivot(0.5, 0.5);
                Util.addButtonAnimation(peripheryList.getChildAt(index), "HallView");
            }
            peripheryList.getChildAt(4).asCom.getChildAt(0).asLoader.url = "ui://HallView/Icon_Shop";
            peripheryList.getChildAt(4).asCom.getChildAt(1).asTextField.text = "商店";
            peripheryList.getChildAt(4).onClick(this, () => {
            });
            peripheryList.getChildAt(3).asCom.getChildAt(0).asLoader.url = "ui://HallView/Icon_Signin";
            peripheryList.getChildAt(3).asCom.getChildAt(1).asTextField.text = "签到";
            peripheryList.getChildAt(3).onClick(this, () => {
            });
            peripheryList.getChildAt(2).asCom.getChildAt(0).asLoader.url = "ui://HallView/Icon_Achievements";
            peripheryList.getChildAt(2).asCom.getChildAt(1).asTextField.text = "成就";
            peripheryList.getChildAt(2).onClick(this, () => {
            });
            peripheryList.getChildAt(1).asCom.getChildAt(0).asLoader.url = "ui://HallView/Icon_Clan";
            peripheryList.getChildAt(1).asCom.getChildAt(1).asTextField.text = "家族";
            peripheryList.getChildAt(1).onClick(this, () => {
            });
            peripheryList.getChildAt(0).asCom.getChildAt(0).asLoader.url = "ui://HallView/Icon_Ranking";
            peripheryList.getChildAt(0).asCom.getChildAt(1).asTextField.text = "排名";
            peripheryList.getChildAt(0).onClick(this, () => {
            });
        }
        gameMode() {
            let isEnter = false;
            let escapeMode = this._view.getChild("EscapeMode").asCom;
            escapeMode.setPivot(0.5, 0.5);
            escapeMode.onClick(this, () => {
                if (isEnter == false && GameManager$1.gameLogicManager.isHaveRole() == true) {
                    isEnter = true;
                    GameController$1.mgobeManager.onQuickMatch(RoomType.EscapeMode);
                }
            });
            Util.addButtonAnimation(escapeMode, "HallView");
            let undetermined1 = this._view.getChild("Undetermined1").asCom;
            undetermined1.setPivot(0.5, 0.5);
            undetermined1.onClick(this, () => {
            });
            Util.addButtonAnimation(undetermined1, "HallView");
            let undetermined2 = this._view.getChild("Undetermined2").asCom;
            undetermined2.setPivot(0.5, 0.5);
            undetermined2.onClick(this, () => {
            });
            Util.addButtonAnimation(undetermined2, "HallView");
        }
        userInfo() {
            let coinBox = this._view.getChild("CoinBox").asCom;
            coinBox.setPivot(0.5, 0.5);
            coinBox.onClick(this, () => {
            });
            Util.addButtonAnimation(coinBox, "HallView");
            let diamondBox = this._view.getChild("DiamondBox").asCom;
            diamondBox.setPivot(0.5, 0.5);
            diamondBox.onClick(this, () => {
            });
            Util.addButtonAnimation(diamondBox, "HallView");
        }
        updateUserInfo() {
            let coinBox = this._view.getChild("CoinBox").asCom;
            coinBox.getChild("text").asTextField.text = "" + Util.formatter(GameManager$1.gameLogicManager.gameInfo.coin);
            let diamondBox = this._view.getChild("DiamondBox").asCom;
            diamondBox.getChild("text").asTextField.text = "" + Util.formatter(GameManager$1.gameLogicManager.gameInfo.diamond);
        }
        InitScene3D() {
            if (this.scene3d == null) {
                GameManager$1.gameScene3D.onLoad3dScene("", (scene3d) => {
                    this.isClick = false;
                    this._view.getChild("LeftArrow").onClick(this, this.chooseRole, [-1]);
                    Util.addButtonAnimation(this._view.getChild("LeftArrow"), "HallView");
                    this._view.getChild("RightArrow").onClick(this, this.chooseRole, [1]);
                    Util.addButtonAnimation(this._view.getChild("RightArrow"), "HallView");
                    this.scene3d = scene3d;
                    this._view.getChildAt(0).displayObject.addChild(this.scene3d);
                    let camera = this.scene3d.getChildByName("camera");
                    camera.nearPlane = 0.3;
                    camera.farPlane = 300;
                    camera.fieldOfView = 60;
                    camera.cullingMask = Math.pow(2, 0) | Math.pow(2, 1);
                    camera.transform.position = new Laya.Vector3(0, 0, 0);
                    camera.transform.localPosition = new Laya.Vector3(0, 0, 0);
                    this.InitRole();
                });
            }
            else {
                this.InitRole();
            }
        }
        InitRole() {
            let path = GameController$1.resourceManager.getRolePath(GameManager$1.gameLogicManager.gameInfo.currentRole);
            let scaleX = Laya.stage.width / Laya.stage.designWidth;
            Laya.loader.create(path, Laya.Handler.create(this, () => {
                if (this._role != null) {
                    this._role.destroy();
                    this._role = null;
                }
                this.isClick = false;
                this._role = Laya.loader.getRes(path);
                this.scene3d.addChild(this._role);
                this._role.transform.localPosition = new Laya.Vector3(-1.7 * scaleX, -0.8, -3.3);
            }));
        }
        chooseRole(index) {
            if (this.isClick == true) {
                return;
            }
            this.isClick = true;
            GameManager$1.gameLogicManager.setCurrentRole(index);
            this.InitRole();
        }
        enterRoom() {
            this.OnCloseView();
            GameManager$1.uimanager.onCreateView(ViewConfig.LoadingView);
        }
        onDestroy() {
            this.scene3d.destroy(true);
            Util.removeAllButtonAnimation("HallView");
            super.onDestroy();
        }
    }

    class InitLoadView extends RabView {
        OnInit() {
            this._path = "res/UI/InitLoadView";
            this._pkgName = "InitLoadView";
            this._resName = "Main";
        }
        onResize() {
            let scaleX = Laya.stage.width / Laya.stage.designWidth;
            if (scaleX > 1) {
                this._view.getChildAt(0).scaleX = scaleX;
            }
            for (let index = 0; index < this._view.numChildren; index++) {
                this._view.getChildAt(index).x *= scaleX;
            }
        }
        InitView() {
            this.isEnter = false;
            this._view.getChild("ProgressText").asTextField.text = "加载中...0%";
            fgui.UIPackage.loadPackage([
                "res/UI/HallView",
            ], Laya.Handler.create(this, () => {
                this.onLoadend();
            }), Laya.Handler.create(this, (progress) => {
                progress = parseFloat(progress.toFixed(2));
                this._view.getChild("ProgressText").asTextField.text = "加载中..." + Math.round(progress * 100) + "%";
            }, [], false));
            GameManager$1.addManager(MgobeManager);
            this.AddListenerMessage(GameNotity.GameMessage_LoadingEnd, this.onLoadend);
        }
        onLoadend() {
            if (this.isEnter == true) {
                this.onEnterGame();
            }
            this.isEnter = true;
        }
        onEnterGame() {
            this.OnCloseView();
            GameManager$1.uimanager.onCreateView(ViewConfig.HallView);
        }
    }

    class Joystick {
        constructor() {
            this.type = JoystickType.move;
        }
        init() {
            this._button = this._view.getChild("joystick").asButton;
            this._button.changeStateOnClick = false;
            this._thumb = this._button.getChild("thumb");
            this._touchArea = this._view.getChild("joystick_touch");
            this._center = this._view.getChild("joystick_center");
            this._InitX = this._center.x + this._center.width / 2;
            this._InitY = this._center.y + this._center.height / 2;
            this.touchId = -1;
            this.radius = 100;
            this._curPos = new Laya.Point();
            this._touchArea.on(Laya.Event.MOUSE_DOWN, this, this.onTouchDown);
        }
        Trigger(evt) {
            this.onTouchDown(evt);
        }
        onDestroy() {
            this._touchArea.off(Laya.Event.MOUSE_DOWN, this, this.onTouchDown);
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.OnTouchMove);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.OnTouchUp);
        }
        onTouchDown(evt) {
            if (this.touchId == -1) {
                this.touchId = evt.touchId;
                if (this._tweener != null) {
                    this._tweener.kill();
                    this._tweener = null;
                }
                this._view.globalToLocal(Laya.stage.mouseX, Laya.stage.mouseY, this._curPos);
                var bx = this._curPos.x;
                var by = this._curPos.y;
                this._button.selected = true;
                if (bx < 0)
                    bx = 0;
                else if (bx > this._touchArea.width)
                    bx = this._touchArea.width;
                if (by > fgui.GRoot.inst.height)
                    by = fgui.GRoot.inst.height;
                else if (by < this._touchArea.y)
                    by = this._touchArea.y;
                this._lastStageX = bx;
                this._lastStageY = by;
                this._center.visible = false;
                this._center.x = bx - this._center.width / 2;
                this._center.y = by - this._center.height / 2;
                if (this.type == JoystickType.move) {
                    this._button.x = bx - this._button.width / 2;
                    this._button.y = by - this._button.height / 2;
                }
                var deltaX = bx - this._InitX;
                var deltaY = by - this._InitY;
                var degrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
                this._thumb.rotation = degrees + 90;
                this._button.getChild("thumb1").rotation = this._thumb.rotation;
                Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.OnTouchMove);
                Laya.stage.on(Laya.Event.MOUSE_UP, this, this.OnTouchUp);
            }
        }
        OnTouchUp(evt) {
            if (this.touchId != -1 && evt.touchId == this.touchId) {
                this.touchId = -1;
                this._thumb.rotation = this._thumb.rotation + 180;
                this._button.getChild("thumb1").rotation = this._thumb.rotation;
                this._center.visible = false;
                if (this.type == JoystickType.move) {
                    this._tweener = fgui.GTween.to2(this._button.x, this._button.y, this._InitX - this._button.width / 2, this._InitY - this._button.height / 2, 0.3)
                        .setTarget(this._button, this._button.setXY)
                        .setEase(fgui.EaseType.CircOut)
                        .onComplete(this.onTweenComplete, this);
                }
                else {
                    this._button.x = this._InitX - this._button.width / 2;
                    this._button.y = this._InitY - this._button.height / 2;
                    this.onTweenComplete();
                }
                Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.OnTouchMove);
                Laya.stage.off(Laya.Event.MOUSE_UP, this, this.OnTouchUp);
                {
                    this.touchUpCallback && this.touchUpCallback();
                }
            }
        }
        onTweenComplete() {
            this._tweener = null;
            this._button.selected = false;
            this._thumb.rotation = 0;
            this._button.getChild("thumb1").rotation = this._thumb.rotation;
            this._center.visible = true;
            this._center.x = this._InitX - this._center.width / 2;
            this._center.y = this._InitY - this._center.height / 2;
        }
        OnTouchMove(evt) {
            if (this.touchId != -1 && evt.touchId == this.touchId) {
                var bx = Laya.stage.mouseX;
                var by = Laya.stage.mouseY;
                var moveX = bx - this._lastStageX;
                var moveY = by - this._lastStageY;
                this._lastStageX = bx;
                this._lastStageY = by;
                var buttonX = this._button.x + moveX;
                var buttonY = this._button.y + moveY;
                var offsetX = buttonX + this._button.width / 2 - this._InitX;
                var offsetY = buttonY + this._button.height / 2 - this._InitY;
                var rad = Math.atan2(offsetY, offsetX);
                var degree = rad * 180 / Math.PI;
                this._thumb.rotation = degree + 90;
                this._button.getChild("thumb1").rotation = this._thumb.rotation;
                var maxX = this.radius * Math.cos(rad);
                var maxY = this.radius * Math.sin(rad);
                if (Math.abs(offsetX) > Math.abs(maxX))
                    offsetX = maxX;
                if (Math.abs(offsetY) > Math.abs(maxY))
                    offsetY = maxY;
                buttonX = this._InitX + offsetX;
                buttonY = this._InitY + offsetY;
                if (buttonX < 0)
                    buttonX = 0;
                if (buttonY > fgui.GRoot.inst.height)
                    buttonY = fgui.GRoot.inst.height;
                this._button.x = buttonX - this._button.width / 2;
                this._button.y = buttonY - this._button.height / 2;
                if (degree < 0) {
                    degree += 360;
                }
                degree += 90;
                if (degree > 360) {
                    degree -= 360;
                }
                this.touchDownCallback && this.touchDownCallback(degree);
            }
        }
    }
    var JoystickType;
    (function (JoystickType) {
        JoystickType[JoystickType["move"] = 0] = "move";
        JoystickType[JoystickType["skill"] = 1] = "skill";
    })(JoystickType || (JoystickType = {}));

    class JoystickView extends RabView {
        OnInit() {
            this._path = "res/UI/Joystick";
            this._pkgName = "Joystick";
            this._resName = "Main";
        }
        onResize() {
            let scaleX = Laya.stage.width / Laya.stage.designWidth;
            for (let index = 0; index < this._view.numChildren; index++) {
                this._view.getChildAt(index).x *= scaleX;
            }
        }
        InitView() {
            this.joystick = new Joystick();
            this.joystick._view = this._view;
            this.joystick.touchUpCallback = () => {
                this.SendMessage(GameMessage.JoystickUp);
            };
            this.joystick.touchDownCallback = (degree) => {
                this.SendMessage(GameMessage.JoystickMoving, degree);
            };
            this.joystick.init();
            this._view.displayObject.zOrder = -1;
            this._view.getChild("Touch").on(Laya.Event.MOUSE_MOVE, this, this.onListMove);
            this._view.getChild("Touch").on(Laya.Event.MOUSE_UP, this, this.onListUp);
            this._view.getChild("Touch").on(Laya.Event.MOUSE_OVER, this, this.onListUp);
            this._view.getChild("Touch").on(Laya.Event.MOUSE_DOWN, this, this.onListDown);
            if (GameController$1.roleManager.ME.unitInfo.type == RoleType.ghost) {
                this._view.getChild("Skill").asCom.getChild("skill1").asLoader.url = "ui://Joystick/Btn_Skill_Hit";
                this._view.getChild("Skill").asCom.getChild("skill2").asLoader.url = "ui://Joystick/clamp";
                this._view.getChild("Skill").asCom.getChild("skill3").asLoader.url = "ui://Joystick/defence";
                this._view.getChild("Skill").asCom.getChild("countText").visible = false;
            }
            else {
                this._view.getChild("Skill").asCom.getChild("skill1").asLoader.url = "ui://Joystick/Btn_Skill_Opration";
                this._view.getChild("Skill").asCom.getChild("skill2").asLoader.url = "ui://Joystick/jump";
                this._view.getChild("Skill").asCom.getChild("skill3").asLoader.url = "ui://Joystick/throw stones";
                this._view.getChild("Skill").asCom.getChild("countText").asTextField.text = "0";
            }
            this._view.getChild("Skill").asCom.getChild("skill1").onClick(this, () => {
                this.SendMessage(GameMessage.ClickPlaySkill, 1);
            });
            this._view.getChild("Skill").asCom.getChild("skill2").onClick(this, () => {
                this.SendMessage(GameMessage.ClickPlaySkill, 2);
                if (GameController$1.roleManager.ME.unitInfo.type == RoleType.ghost) {
                    GameController$1.mgobeManager.sendToGameSvr(GameMessage.Role_Skill, {
                        roleSkill: RoleSkill.Ghost_Trap
                    });
                }
                else {
                    GameController$1.roleManager.ME.OnChangeEntityState(RoleState.jump);
                }
            });
            this._view.getChild("Skill").asCom.getChild("skill3").onClick(this, () => {
                this.SendMessage(GameMessage.ClickPlaySkill, 3);
                if (GameController$1.roleManager.ME.unitInfo.type == RoleType.ghost) {
                    GameController$1.mgobeManager.sendToGameSvr(GameMessage.Role_Skill, {
                        roleSkill: RoleSkill.Ghost_Shield
                    });
                }
                else {
                    GameController$1.mgobeManager.sendToGameSvr(GameMessage.Role_Skill, {
                        roleSkill: RoleSkill.Child_ThrowStone
                    });
                }
            });
            this.updateStoneCount();
            this.AddListenerMessage(GameMessage.Role_UpdateStone, this.updateStoneCount);
        }
        onListUp() {
            this._isMove = false;
        }
        onListDown() {
            this._isMove = true;
        }
        onListMove(event) {
            if (!this._isMove)
                return;
            if (this._last) {
                GameController$1.roleManager.ME.cameraRotation((this._last.x - Laya.stage.mouseX), (this._last.y - Laya.stage.mouseY));
            }
            else {
                this._last = new Laya.Vector2(Laya.stage.mouseX, Laya.stage.mouseY);
            }
            this._last.x = Laya.stage.mouseX;
            this._last.y = Laya.stage.mouseY;
        }
        updateStoneCount() {
            this._view.getChild("Skill").asCom.getChild("countText").asTextField.text = GameController$1.roleManager.ME.stoneCount + "";
        }
        onDestroy() {
            this._view.getChild("Touch").off(Laya.Event.MOUSE_MOVE, this, this.onListMove);
            this._view.getChild("Touch").off(Laya.Event.MOUSE_UP, this, this.onListUp);
            this._view.getChild("Touch").off(Laya.Event.MOUSE_OVER, this, this.onListUp);
            this._view.getChild("Touch").off(Laya.Event.MOUSE_DOWN, this, this.onListDown);
            this.onListUp();
            this.joystick.onDestroy();
            super.onDestroy();
        }
    }

    class LoadingView extends RabView {
        OnInit() {
            this._path = "res/UI/LoadingView";
            this._pkgName = "LoadingView";
            this._resName = "Main";
        }
        onResize() {
            let scaleX = Laya.stage.width / Laya.stage.designWidth;
            if (scaleX > 1) {
                this._view.getChildAt(0).scaleX = scaleX;
            }
            for (let index = 0; index < this._view.numChildren; index++) {
                this._view.getChildAt(index).x *= scaleX;
            }
        }
        InitView() {
            this._view.getChild("ProgressText").asTextField.text = "加载中...0%";
            if (GameController$1.gameStateManager.ME == PlayerRoomState.hall) {
                Laya.loader.create(GameController$1.resourceManager.getWaitingRoomAllPath(), Laya.Handler.create(this, () => {
                    this.onLoadEnd();
                }), Laya.Handler.create(this, (progress) => {
                    progress = parseFloat(progress.toFixed(2));
                    this._view.getChild("ProgressText").asTextField.text = "加载中..." + Math.round(progress * 100) + "%";
                }));
            }
            else if (GameController$1.gameStateManager.ME == PlayerRoomState.waitingRoom) {
                Laya.loader.create(GameController$1.resourceManager.getGameRoomPath(), Laya.Handler.create(this, () => {
                    GameController$1.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.gameLoading);
                }), Laya.Handler.create(this, (progress) => {
                    progress = parseFloat(progress.toFixed(2));
                    this._view.getChild("ProgressText").asTextField.text = "加载中..." + Math.round(progress * 100) + "%";
                }));
            }
            this.AddListenerMessage(GameMessage.GameMessage_LoadingEnd, this.onLoadEnd, this);
        }
        onLoadEnd() {
            if (GameController$1.gameStateManager.ME == PlayerRoomState.hall) {
                GameManager$1.gameScene3D.onLoad3dScene(GameController$1.resourceManager.getWaitingRoomPath()[0], () => {
                    this.OnCloseView();
                    GameController$1.roleManager.addRole(null, false);
                    GameManager$1.uimanager.onCreateView(ViewConfig.WaitingRoomView);
                });
            }
            else if (GameController$1.gameStateManager.ME == PlayerRoomState.gameLoading) {
                GameManager$1.gameScene3D.onLoad3dScene(GameController$1.resourceManager.getGameRoomPath(), () => {
                    this.OnCloseView();
                    GameController$1.roleManager.addRole(null, false);
                    GameManager$1.uimanager.onCreateView(ViewConfig.GameView);
                });
            }
        }
    }

    class OverView extends RabView {
        OnInit() {
            this._path = "res/UI/OverView";
            this._pkgName = "OverView";
            this._resName = "Main";
        }
        onResize() {
            let scaleX = Laya.stage.width / Laya.stage.designWidth;
            if (scaleX > 1) {
                this._view.getChildAt(0).scaleX = scaleX;
            }
            for (let index = 0; index < this._view.numChildren; index++) {
                this._view.getChildAt(index).x *= scaleX;
            }
        }
        InitView() {
            let homeButton = this._view.getChild("homeButton").asCom;
            homeButton.onClick(this, () => {
                this.OnCloseView();
                GameManager$1.uimanager.onCreateView(ViewConfig.HallView);
            });
            Util.addButtonAnimation(homeButton, "OverView");
            let GetButton = this._view.getChild("window").asCom.getChild("GetButton").asCom;
            GetButton.onClick(this, () => {
            });
            Util.addButtonAnimation(GetButton, "OverView");
            let GetDoubleButton = this._view.getChild("window").asCom.getChild("GetDoubleButton").asCom;
            GetDoubleButton.onClick(this, () => {
            });
            Util.addButtonAnimation(GetDoubleButton, "OverView");
            this.showTask();
        }
        showTask() {
            let task = GameController$1.taskManager.meTask;
            if (GameController$1.taskManager.isWin() == true) {
                if (GameController$1.roleManager.ME.unitInfo.type == RoleType.child) {
                    this._view.getChild("window").asCom.getChild("titleText").asTextField.text = "成 功 逃 脱 ！";
                }
                else {
                    this._view.getChild("window").asCom.getChild("titleText").asTextField.text = "成 功 囚 禁 ！";
                }
            }
            else {
                if (GameController$1.roleManager.ME.unitInfo.type == RoleType.child) {
                    this._view.getChild("window").asCom.getChild("titleText").asTextField.text = "逃 脱 失 败 ！";
                }
                else {
                    this._view.getChild("window").asCom.getChild("titleText").asTextField.text = "囚 禁 失 败 ！";
                }
            }
            let index = 0;
            let coin = 0;
            let taskList = this._view.getChild("window").asCom.getChild("takList").asList;
            taskList.numItems = task.size;
            task.forEach((value, key) => {
                let item = taskList.getChildAt(index);
                item.asCom.getChild("explainText").asTextField.text = value.name;
                item.asCom.getChild("statusText").asTextField.text = value.count + " / " + value.maxCount;
                item.asCom.getChild("coinText").asTextField.text = "+" + value.award;
                item.asCom.getChild("check").visible = (value.count >= value.maxCount);
                if (item.asCom.getChild("check").visible == true) {
                    coin += value.award;
                }
                index++;
            });
            this._view.getChild("window").asCom.getChild("GetButton").asCom.getChild("text").asTextField.text = "" + coin;
            this._view.getChild("window").asCom.getChild("GetDoubleButton").asCom.getChild("text").asTextField.text = "" + (coin * 2);
        }
        onDestroy() {
            Util.removeAllButtonAnimation("OverView");
            super.onDestroy();
        }
    }

    class WaitingRoomView extends RabView {
        OnInit() {
            this._path = "res/UI/WaitingRoom";
            this._pkgName = "WaitingRoom";
            this._resName = "Main";
        }
        onResize() {
            let scaleX = Laya.stage.width / Laya.stage.designWidth;
            for (let index = 0; index < this._view.numChildren; index++) {
                this._view.getChildAt(index).x *= scaleX;
            }
        }
        InitView() {
            this.camera = GameManager$1.gameScene3D.camera;
            GameManager$1.uimanager.onCreateView(ViewConfig.JoystickView);
            this._view.displayObject.mouseThrough = true;
            this._view.getChild("timeText").visible = false;
            this._view.getChild("leaveButton").onClick(this, () => {
                GameController$1.leaveRoom();
            });
            this._view.getChild("startButton").visible = GameController$1.mgobeManager.isRoomOwner();
            this._view.getChild("startButton").onClick(this, () => {
                if (this.isStartGame() == true && this._view.getChild("startButton").visible == true) {
                    this._view.getChild("startButton").visible = false;
                    GameController$1.mgobeManager.changeRoom(true);
                    GameController$1.mgobeManager.sendToGameSvr(GameMessage.GameMessage_LoadProgess, {});
                }
            });
            this.updateRoom();
            this.AddListenerMessage(GameMessage.MGOBE_EnterRoomFinish, this.updateRoom);
            this.AddListenerMessage(GameMessage.MGOBE_JoinRoom, this.joinRoom);
            this.AddListenerMessage(GameMessage.MGOBE_LeaveRoom, this.leaveRoom);
            this.AddListenerMessage(GameMessage.MGOBE_ChangeRoomOwner, this.changeRoomOwner, this);
            this.AddListenerMessage(GameMessage.MGOBE_RecvFromGameServer, this.RecvFromGameServer);
            GameController$1.mgobeManager.changeCustomPlayerStatus(PlayerRoomState.waitingRoom);
        }
        updateRoom() {
            let room = GameController$1.mgobeManager.roomInfo;
            this._view.getChild("roleCountText").text = room.playerList.length + "/" + room.maxPlayers;
        }
        joinRoom(joinPlayerId) {
            if (joinPlayerId == MGOBE.Player.id) {
                return;
            }
            let playinfo = GameController$1.mgobeManager.getPlayInfo(joinPlayerId);
            GameController$1.roleManager.joinPlayerId.push(joinPlayerId);
            GameController$1.roleManager.addRole(playinfo, false);
            this.updateRoom();
        }
        leaveRoom(leavePlayerId) {
            if (leavePlayerId == MGOBE.Player.id) {
                return;
            }
            GameController$1.roleManager.removeRole(leavePlayerId);
            this.updateRoom();
        }
        changeRoomOwner() {
            if (GameController$1.mgobeManager.isRoomOwner() == true) {
                this._view.getChild("startButton").visible = true;
            }
        }
        isStartGame() {
            let bool = true;
            let room = GameController$1.mgobeManager.roomInfo;
            let count = GameController$1.mgobeManager.getRoleCount(room);
            if (room.playerList.length >= 6 && count[0] == 2) {
                bool = true;
            }
            else if (room.playerList.length >= 4 && count[0] == 1) {
                bool = true;
            }
            if (bool == true) {
                bool = GameController$1.gameStateManager.isNextState(PlayerRoomState.waitingRoom);
            }
            return bool;
        }
        startDowncount() {
            this.downcountTime = 3;
            this._view.getChild("timeText").asTextField.text = "" + this.downcountTime;
            this._view.getChild("timeText").visible = true;
            this._view.getChild("leaveButton").visible = false;
            Laya.timer.clear(this, this.downcount);
            Laya.timer.loop(1000, this, this.downcount);
        }
        downcount() {
            this.downcountTime--;
            if (this.downcountTime == 0) {
                this.startGame();
                Laya.timer.clear(this, this.downcount);
            }
            else {
                this._view.getChild("timeText").asTextField.text = "" + this.downcountTime;
            }
        }
        startGame() {
            this.OnCloseView();
            GameManager$1.uimanager.onCreateView(ViewConfig.LoadingView);
        }
        RecvFromGameServer(data) {
            if (GameController$1.gameStateManager.ME == PlayerRoomState.gameEnd)
                return;
            if (data) {
                if (data.cmd == GameMessage.GameMessage_LoadProgess) {
                    this.startDowncount();
                }
            }
        }
        onDestroy() {
            super.onDestroy();
            GameManager$1.uimanager.onCloseView(ViewConfig.JoystickView);
            GameController$1.roleManager.removeRole(null);
            GameManager$1.gameScene3D.onRemoveScene();
        }
    }

    class ViewConfig extends RabManager {
        OnInit() {
            GameManager$1.uimanager.regClass("InitLoadView", InitLoadView);
            GameManager$1.uimanager.regClass("HallView", HallView);
            GameManager$1.uimanager.regClass("LoadingView", LoadingView);
            GameManager$1.uimanager.regClass("WaitingRoomView", WaitingRoomView);
            GameManager$1.uimanager.regClass("JoystickView", JoystickView);
            GameManager$1.uimanager.regClass("GameView", GameView);
            GameManager$1.uimanager.regClass("OverView", OverView);
        }
    }
    ViewConfig.InitLoadView = "InitLoadView";
    ViewConfig.HallView = "HallView";
    ViewConfig.LoadingView = "LoadingView";
    ViewConfig.WaitingRoomView = "WaitingRoomView";
    ViewConfig.JoystickView = "JoystickView";
    ViewConfig.GameView = "GameView";
    ViewConfig.OverView = "OverView";

    class ResourceManager extends RabManager {
        OnInit() {
            let role = GameManager$1.gameLogicManager.getJsonData(JsonList.RoleModelIndex);
            this._ghost = role["ghost"];
            this._child = role["child"];
        }
        get ghost() {
            return this._ghost;
        }
        getGhostPath(role) {
            return this._ghost[role];
        }
        get child() {
            return this._child;
        }
        getChildPath(role) {
            return this._child[role];
        }
        getWaitingRoomPath() {
            return [
                "3dscene/waitingroom/Conventional/waitingroom.ls",
                "units/Conventional/box_key.lh",
                "units/Conventional/box_part.lh",
                "units/Conventional/key_blue.lh",
                "units/Conventional/key_green.lh",
                "units/Conventional/key_red.lh",
                "units/Conventional/key_yellow.lh",
                "units/Conventional/stone.lh",
                "units/Conventional/stones.lh",
                "units/Conventional/traps.lh",
                "units/Conventional/shield.lh",
            ];
        }
        getGameRoomPath() {
            return "3dscene/gameroom1/Conventional/gameroom1.ls";
        }
        getRolePath(role) {
            if (role.type == RoleType.ghost) {
                return this.getGhostPath(role.id);
            }
            else {
                return this.getChildPath(role.id);
            }
        }
        getRoleAllPath(role) {
            if (role.type == RoleType.ghost) {
                return this._ghost;
            }
            else {
                return this._child;
            }
        }
        getWaitingRoomAllPath() {
            let arr = this.getWaitingRoomPath();
            let room = GameController$1.mgobeManager.roomInfo;
            room.playerList.forEach((value, index) => {
                arr.push(this.getRolePath(JSON.parse(value.customProfile).role));
            });
            return arr;
        }
    }

    class Queue {
        constructor(capacity) {
            this.elements = new Array();
            this._size = capacity;
        }
        push(o) {
            if (o == null) {
                return false;
            }
            if (this._size != undefined && !isNaN(this._size)) {
                if (this.elements.length == this._size) {
                    this.pop();
                }
            }
            this.elements.unshift(o);
            return true;
        }
        pop() {
            return this.elements.pop();
        }
        size() {
            return this.elements.length;
        }
        empty() {
            return this.size() == 0;
        }
        clear() {
            delete this.elements;
            this.elements = new Array();
        }
    }

    class Vct3 {
        constructor(_x, _y, _z) {
            this.x = _x + 0;
            this.y = _y + 0;
            this.z = _z + 0;
        }
    }

    class GameObject extends Laya.Script3D {
        onAwake() {
            this.setValue();
            this.OnInit();
        }
        setValue() {
            this._gameObject = (this.owner);
            this._transform = this.gameObject.transform;
            this._initPosition = new Laya.Vector3(this._transform.localPositionX, this._transform.localPositionY, this._transform.localPositionZ);
        }
        get gameObject() {
            if (!this._gameObject) {
                this.setValue();
            }
            return this._gameObject;
        }
        get transform() {
            if (!this._transform) {
                this.setValue();
            }
            return this._transform;
        }
        get initPosition() {
            return this._initPosition;
        }
        onDestroy() {
            Laya.timer.clearAll(this);
            Laya.stage.offAllCaller(this);
            if (this.gameObject) {
                this.gameObject.removeSelf();
                this.gameObject.destroy();
            }
        }
        AddListenerMessage(name, callbreakFun) {
            Laya.stage.on(name, this, callbreakFun);
        }
        RemoveListenerMessage(name, callbreakFun) {
            Laya.stage.off(name, this, callbreakFun);
        }
        SendMessage(name, ...args) {
            Laya.stage.event(name, args);
        }
        findChild(node, path) {
            let url = path.split('/');
            let parent = node;
            let child = node;
            if (node && url) {
                for (var i = 0; i < url.length; i++) {
                    child = parent.getChildByName(url[i]);
                    parent = child;
                }
            }
            return child;
        }
        findChildAt(node, index) {
            return node.getChildAt(index);
        }
        instantiate(original, parent, worldPositionStays, position, rotation) {
            return Laya.Sprite3D.instantiate(original, this._gameObject, worldPositionStays, position);
        }
    }

    class Unit extends GameObject {
        constructor(fightUserInfo) {
            super();
            this._moveSpeed = 0.03;
            this._isMove = false;
            this._unitInfo = {
                id: fightUserInfo.id,
                nickName: fightUserInfo.nickName,
                type: fightUserInfo.role.type,
            };
        }
        OnInit() {
            this._roleModel = this.gameObject;
            this._moveDistance = new Laya.Vector3();
            this.camera = GameManager$1.gameScene3D.camera;
            this._isSendMessage = false;
            this._animator = this.gameObject.getComponent(Laya.Animator);
            if (this._animator == null) {
                if (this.gameObject.numChildren > 0) {
                    for (let index = 0; index < this.gameObject.numChildren; index++) {
                        this._animator = this.gameObject.getChildAt(index).getComponent(Laya.Animator);
                        if (this._animator) {
                            break;
                        }
                    }
                }
            }
            this.onInitEntityUnity();
            this.getForward();
        }
        onUpdateentity() {
            if (this._fsm) {
                this._fsm.Update();
            }
        }
        getForward(speed = this.moveSpeed) {
            this.forward = new Laya.Vector3();
            this._moveDistance.x = speed;
            this._moveDistance.z = speed;
            Util.getVector(this._moveDistance, this.forward, this._moveAngle);
        }
        idle() {
        }
        move(speed = this.moveSpeed) {
            this.getForward(speed);
            Util.addPosition(this.forward, this.gameObject, false);
            this.onSendMessage();
        }
        jump() {
        }
        fall() {
        }
        death() {
        }
        OnChangeEntityState(state, compel) {
            if (this._fsm) {
                if (this._fsm.ChangeState(state, compel) == true) {
                    this.onSendMessage();
                    return true;
                }
            }
            return false;
        }
        GetState(stateType) {
            return this._fsm.GetState(stateType);
        }
        setAnimation(animName, isPlay, isLoop = false) {
            if (this._fsm != null) {
                this._fsm.CurrState.setAnimation(animName, isPlay, isLoop);
                return this._fsm.CurrState;
            }
            return null;
        }
        setAnimationName(animName) {
            if (this._fsm != null) {
                this._fsm.CurrState.animName = animName;
            }
        }
        getAnimTime(animName) {
            return this._fsm.CurrState.getAnimTime(animName);
        }
        get roleModel() {
            return this._roleModel;
        }
        set moveSpeed(speed) {
            this._moveSpeed = speed;
        }
        get moveSpeed() {
            return this._moveSpeed;
        }
        get currentState() {
            if (this._fsm && this._fsm.CurrState) {
                return this._fsm.CurrState.onStateType;
            }
            return RoleState.none;
        }
        get isMove() {
            return this._isMove;
        }
        get unitInfo() {
            return this._unitInfo;
        }
        get animator() {
            return this._animator;
        }
        onSendFrameMessage() {
            return null;
        }
        onSendMessage() {
            if (GameController$1.gameStateManager) {
                if (GameController$1.mgobeManager && this._isSendMessage) {
                    GameController$1.mgobeManager.sendFrame(this.onSendFrameMessage());
                }
            }
        }
        setServerData(data) {
            if (data) {
                this.onHandleMessage(data);
            }
        }
        onHandleMessage(data) {
        }
    }

    class Role extends Unit {
        onInitEntityUnity() {
            this._moveAngle = 0;
            this._roleModel = this.gameObject.getChildAt(0);
            this.skillList = new Map();
            this.otherRole = [];
            this.dangle = this.gameObject.transform.localRotationEulerY;
            this.prior = Util.getNewVector3(this.gameObject.transform.position);
            this.onMove(0);
            if (GameController$1.gameStateManager.ME >= PlayerRoomState.gameLoading && this.unitInfo.id == MGOBE.Player.id) {
                this.sky = GameManager$1.gameScene3D.scene3D.getChildByName("gameroom").getChildByName("SkyDome");
                this.sky.transform.position = this.gameObject.transform.position;
                this.sky.transform.localPosition = new Laya.Vector3();
                this.sky.transform.setWorldLossyScale(new Laya.Vector3(100, 100, 100));
            }
            this._isSendMessage = this.unitInfo.id == MGOBE.Player.id;
            if (this._isSendMessage == true) {
                this.AddListenerMessage(GameMessage.JoystickMoving, this.OnJoystickMoving);
                this.AddListenerMessage(GameMessage.JoystickUp, this.OnJoystickUp);
                this.AddListenerMessage(GameMessage.ClickPlaySkill, this.OnClickPlaySkill);
            }
        }
        onUpdateentity() {
            if (this.roleMoveRayCast != null) {
                this.roleMoveRayCast.down();
                this.skillList.forEach((value, key) => {
                    if (value.cd > 0) {
                        value.cd -= 1000 / 60;
                    }
                });
            }
            if (this.otherRole.length > 0) {
                this.otherRoleMove();
            }
            super.onUpdateentity();
        }
        move(speed = this.moveSpeed) {
            if (this.unitInfo.id == MGOBE.Player.id) {
                if (this.roleMoveRayCast.forward() == false) {
                    this.prior = Util.getNewVector3(this.gameObject.transform.position);
                    super.move(speed);
                }
            }
        }
        otherRoleMove() {
            let frame = this.otherRole.shift();
            Util.setPosition(frame.point, this.gameObject);
            this._roleModel.transform.localRotationEulerY = frame.rotationY;
        }
        skill(roleSkill) {
        }
        OnJoystickMoving(angle) {
            if (this.currentState == RoleState.death || this.currentState == RoleState.safe) {
                return;
            }
            this._isMove = true;
            this._moveAngle = this.dangle + (360 - angle - 45);
            this._roleModel.transform.localRotationEulerY = 360 - angle;
            this.OnChangeEntityState(RoleState.move);
        }
        OnJoystickUp() {
            this._isMove = false;
            this.OnChangeEntityState(RoleState.idle);
        }
        OnClickPlaySkill(index) {
        }
        PlaySkill(typ) {
            if (this.skillList.get(typ).cd <= 0) {
                this.skillList.get(typ).cd = this.skillList.get(typ).time;
                this.skill(typ);
                return true;
            }
            return false;
        }
        onMove(angle) {
            this._moveAngle = this.dangle + (360 - angle - 45);
            this._roleModel.transform.localRotationEulerY = 360 - angle;
        }
        cameraRotation(x, y) {
            if (GameManager$1.gameScene3D.scene3D == null) {
                return;
            }
            if (Math.abs(x) > Math.abs(y)) {
                if (x > 0) {
                    this.gameObject.transform.localRotationEulerY += 2;
                    this._roleModel.transform.localRotationEulerY -= 2;
                }
                else {
                    this.gameObject.transform.localRotationEulerY -= 2;
                    this._roleModel.transform.localRotationEulerY += 2;
                }
                this.dangle = this.gameObject.transform.localRotationEulerY;
                this.getForward();
            }
            else {
                if (y > 0) {
                    if (this.camera.transform.localRotationEulerX > -40) {
                        this.camera.transform.localPositionY += 0.017;
                        this.camera.transform.localRotationEulerX -= 0.5;
                    }
                }
                else {
                    if (this.camera.transform.localRotationEulerX < 20) {
                        this.camera.transform.localPositionY -= 0.017;
                        this.camera.transform.localRotationEulerX += 0.5;
                    }
                }
            }
        }
        outSkillFail(roleSkill) {
            this.skillList.get(roleSkill).cd = 0;
            this.OnChangeEntityState(RoleState.idle, true);
        }
        getSkillCD(roleSkill) {
            return this.skillList.get(roleSkill).time;
        }
        getSkillCurrentCD(roleSkill) {
            if (this.skillList.has(roleSkill) == true) {
                return this.skillList.get(roleSkill).cd;
            }
            return 1;
        }
        setCurrentSkill(skill) {
            if (this.currentSkill != null) {
                this.currentSkill.remove();
                this.currentSkill = null;
            }
            this.currentSkill = skill;
        }
        onHandleMessage(data) {
            this.OnChangeEntityState(data.state, true);
            if (data.state != RoleState.none && data.state != RoleState.death) {
                this.otherRole.push(data);
            }
        }
        onDestroy() {
            GameManager$1.fsmManager.DestroyFsm(this._fsm.FsmId);
            this.setCurrentSkill(null);
            super.onDestroy();
        }
        onSendFrameMessage() {
            let data = {
                id: "player" + MGOBE.Player.id,
                state: this.currentState,
                point: new Vct3(this.gameObject.transform.position.x, this.gameObject.transform.position.y, this.gameObject.transform.position.z),
                rotationY: this._roleModel.transform.localRotationEulerY + this.gameObject.transform.localRotationEulerY,
            };
            return data;
        }
    }

    class Door extends GameObject {
        OnInit() {
        }
        openDoor() {
            if (this.isOpen == false) {
                if (this.doorIndex <= DoorIndex.red) {
                    if (GameController$1.doorManager.isHaveKey(this.doorIndex) == true) {
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
        closeDoor() {
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
        getDoorIndex() {
            return this.doorIndex;
        }
        openColorDoor() {
            Util.sprite3DRotation(this.gameObject, new Laya.Vector3(-90, 0, -180), false, 300, Laya.Ease.backOut);
        }
        closeColorDoor() {
            Util.sprite3DRotation(this.gameObject, new Laya.Vector3(-90, 0, -90), false, 100);
        }
        openIronDoor() {
            Util.sprite3DMove(this.gameObject, Util.getAddPosition(new Laya.Vector3(0, 1.5, 0), this.gameObject), false, 300, Laya.Ease.backOut, () => {
            });
        }
        closeIronDoor() {
        }
        getIsOpen() {
            return this.isOpen;
        }
    }

    class RoleMoveRayCast {
        constructor() {
            this.lineForward = new Laya.PixelLineSprite3D();
            GameManager$1.gameScene3D.scene3D.addChild(this.lineForward);
            this.lineDown = new Laya.PixelLineSprite3D();
            GameManager$1.gameScene3D.scene3D.addChild(this.lineDown);
            this.isFall = false;
        }
        forward() {
            if (GameManager$1.gameScene3D.scene3D == null || GameManager$1.gameScene3D.scene3D.physicsSimulation == null) {
                return false;
            }
            let position = Util.getNewVector3(this.role.prior);
            position.y += this.startPosY;
            this.role.getForward();
            let direction = Util.getNewVector3(this.role.forward);
            Laya.Vector3.scale(direction, 20, direction);
            Laya.Vector3.add(direction, position, direction);
            this.lineForward.clear();
            this.lineForward.addLine(position, direction, Laya.Color.RED, Laya.Color.BLACK);
            let hitResults = [];
            GameManager$1.gameScene3D.scene3D.physicsSimulation.raycastAllFromTo(position, direction, hitResults);
            if (this._forward(hitResults, position) == true) {
                return true;
            }
            else {
                hitResults = [];
                position = Util.getNewVector3(this.role.prior);
                position.y += 0.3;
                GameManager$1.gameScene3D.scene3D.physicsSimulation.raycastAllFromTo(position, direction, hitResults);
                return this._forward(hitResults, position);
            }
        }
        _forward(hitResults, position) {
            if (hitResults.length > 0) {
                for (let index = 0; index < hitResults.length; index++) {
                    let value = hitResults[index];
                    let cube = value.collider.owner;
                    if (cube.parent.name.indexOf("wall") != -1) {
                        if (Util.getDistanceV3(value.point, position, "y") <= 0.5) {
                            return true;
                        }
                    }
                    else if (cube.name.indexOf("door") != -1) {
                        if (Util.getDistanceV3(value.point, position, "y") <= 0.5) {
                            this.door = cube;
                            if (this.role.unitInfo.type == RoleType.child) {
                                let door = this.door.parent.getComponent(Door);
                                if (door != null) {
                                    door.openDoor();
                                }
                            }
                            return true;
                        }
                    }
                    else if (cube.parent.name.indexOf("prop") != -1) {
                        if (Util.getDistanceV3(value.point, position, "y") <= 0.5) {
                            return true;
                        }
                    }
                    else if (cube.name.indexOf("safe") != -1) {
                        if (Util.getDistanceV3(value.point, position, "y") <= 0.5) {
                            this.role.OnChangeEntityState(RoleState.safe, true);
                            GameController$1.roleManager.isChildWin();
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        down() {
            if (GameManager$1.gameScene3D.scene3D == null || GameManager$1.gameScene3D.scene3D.physicsSimulation == null) {
                return;
            }
            if (this.role.unitInfo.type == RoleType.child) {
                if (this.role.jumpHeight > 0) {
                    return;
                }
            }
            let position = Util.getNewVector3(this.role.prior);
            position.y += 0.25;
            let direction = new Laya.Vector3(0, -0.1, 0);
            Laya.Vector3.scale(direction, 100, direction);
            Laya.Vector3.add(direction, position, direction);
            this.lineDown.clear();
            this.lineDown.addLine(position, direction, Laya.Color.RED, Laya.Color.BLACK);
            let hitResult = new Laya.HitResult();
            GameManager$1.gameScene3D.scene3D.physicsSimulation.raycastFromTo(position, direction, hitResult);
            this.floor = null;
            this.stair = null;
            this.prop = null;
            if (hitResult.collider != null) {
                let cube = hitResult.collider.owner;
                let bool = true;
                if (cube.parent.name.indexOf("floor") != -1) {
                    this.floor = cube;
                }
                else if (cube.parent.name.indexOf("stair") != -1) {
                    this.stair = cube;
                }
                else if (cube.parent.name.indexOf("prop") != -1) {
                    this.prop = cube;
                    if (cube.name.indexOf(RoleSkill.Ghost_Trap) != -1) {
                        bool = false;
                    }
                }
                let gap = Math.abs(this.role.gameObject.transform.position.y - hitResult.point.y);
                if (gap >= 0.1 && this.role.unitInfo.type == RoleType.child) {
                    this.isFall = true;
                    if (bool == true) {
                        this.role.onFall(new Laya.Vector3(0, hitResult.point.y, 0));
                    }
                    if (this.prop != null) {
                        if (cube.name.indexOf(RoleSkill.Ghost_Trap) != -1) {
                            this.role.SendMessage(GameMessage.GameView_Hint, this.role.unitInfo.nickName + "中了陷阱");
                            GameController$1.mgobeManager.sendToGameSvr(GameMessage.Role_TreadTrap, {}, this.role.unitInfo.id);
                        }
                    }
                }
                else {
                    if (this.isFall == false && bool == true) {
                        this.role.gameObject.transform.position.y = hitResult.point.y;
                    }
                }
            }
        }
    }

    class BaseState {
        constructor() {
            this.Exchange = true;
            this.Exchange = true;
        }
    }

    class ActorState extends BaseState {
        constructor(animName, animator) {
            super();
            this._isLoop = false;
            this._animName = animName;
            this._animator = animator;
            this._animTime = this.getAnimTime(animName) * 1000;
        }
        Enter() {
            this.onEnterState();
            this.onPlayAnim();
        }
        onPlayAnim() {
            if (this._animName == "") {
                return;
            }
            console.log("动作", this._animName, "开始播放");
            if (this._animator) {
                this._animator.speed = 1;
                this._animator.crossFade(this._animName, 0.1);
            }
            if (!this._isLoop) {
                Laya.timer.clear(this, this.onAnimPlayEnd);
                Laya.timer.once(this._animTime, this, this.onAnimPlayEnd);
            }
            else {
                Laya.timer.clear(this, this.onPlayAnim);
                Laya.timer.once(this._animTime, this, this.onPlayAnim);
            }
        }
        onPlayAnimList(arr = null) {
            if (this._animator != null) {
                arr.forEach((value, index) => {
                    this._animator.crossFade(value[0], 0.1, value[1]);
                });
            }
        }
        onAnimPlayEnd() {
            console.log("动作", this._animName, "播放完了");
            Laya.timer.clear(this, this.onPlayAnim);
        }
        getAnimTime(animName, layer = 0) {
            if (this._animator && this._animator.getControllerLayer(layer).getAnimatorState(animName)) {
                return this._animator.getControllerLayer(layer).getAnimatorState(animName).clip.duration();
            }
            return 1;
        }
        setAnimation(animName, isPlay, isLoop) {
            this._animName = animName;
            this._animTime = this.getAnimTime(animName) * 1000;
            this._isLoop = isLoop;
            if (isPlay == true) {
                this.onPlayAnim();
            }
        }
        set animName(animName) {
            this._animName = animName;
        }
        get animName() {
            return this._animName;
        }
        Update() {
        }
        Leave() {
            Laya.timer.clearAll(this);
        }
        Destroy() {
            Laya.timer.clearAll(this);
        }
    }

    class SkillState extends ActorState {
        get onStateType() {
            return RoleState.skill;
        }
        onEnterState() {
            this.Exchange = false;
            this.Update = () => {
            };
            console.log("切换成了技能状态");
        }
        onAnimPlayEnd() {
            super.onAnimPlayEnd();
            this._animName = "";
            this.Exchange = true;
            if (this.CurrFsm.Owner.isMove == true) {
                this.CurrFsm.Owner.OnChangeEntityState(RoleState.move);
            }
            else {
                this.CurrFsm.Owner.OnChangeEntityState(RoleState.idle);
            }
        }
        notChangeStateEnd() {
            super.onAnimPlayEnd();
            this._animName = "";
            this.Exchange = true;
        }
    }

    class DeathState extends ActorState {
        get onStateType() {
            return RoleState.death;
        }
        onEnterState() {
            this.Exchange = false;
            console.log("切换成了死亡状态");
        }
        onAnimPlayEnd() {
            super.onAnimPlayEnd();
            this.CurrFsm.Owner.death();
        }
    }

    class FallState extends ActorState {
        get onStateType() {
            return RoleState.fall;
        }
        onEnterState() {
            console.log("切换成了落下状态");
            this.Exchange = false;
        }
        Update() {
            this.CurrFsm.Owner.fall();
            if (this.CurrFsm.Owner.isMove == true) {
                this.CurrFsm.Owner.move();
            }
        }
        onPlayAnim() {
            if (this.CurrFsm.LastStateType == RoleState.move) {
                super.onPlayAnim();
            }
        }
    }

    class HitState extends ActorState {
        get onStateType() {
            return RoleState.hit;
        }
        onEnterState() {
            this.Exchange = false;
            console.log("切换成了受伤状态");
        }
        onAnimPlayEnd() {
            super.onAnimPlayEnd();
            this.Exchange = true;
            this.CurrFsm.Owner.OnChangeEntityState(RoleState.idle);
        }
    }

    class IdleState extends ActorState {
        get onStateType() {
            return RoleState.idle;
        }
        onEnterState() {
            console.log("切换成了待机状态");
        }
        onPlayAnim() {
            this.CurrFsm.Owner.idle();
            super.onPlayAnim();
            if (this._animName != "") {
                this._animator.getControllerLayer(0).getAnimatorState(this._animName).clip.islooping = true;
            }
        }
    }

    class JumpDownState extends ActorState {
        get onStateType() {
            return RoleState.jumpDown;
        }
        onEnterState() {
            console.log("切换成了跳跃状态");
            this.Exchange = false;
        }
        onAnimPlayEnd() {
            super.onAnimPlayEnd();
            this.Exchange = true;
            if (this.CurrFsm.Owner.isMove == true) {
                this.CurrFsm.Owner.OnChangeEntityState(RoleState.move);
            }
            else {
                this.CurrFsm.Owner.OnChangeEntityState(RoleState.idle);
            }
        }
    }

    class JumpState extends ActorState {
        get onStateType() {
            return RoleState.jump;
        }
        onEnterState() {
            console.log("切换成了跳跃状态");
            this.Exchange = false;
        }
        Update() {
            if (this.CurrFsm.Owner.isMove == true) {
                this.CurrFsm.Owner.move();
            }
            this.CurrFsm.Owner.jump();
        }
    }

    class MoveState extends ActorState {
        get onStateType() {
            return RoleState.move;
        }
        onEnterState() {
            console.log("切换成了移动状态");
        }
        Update() {
            this.CurrFsm.Owner.move();
        }
    }

    class SafeState extends ActorState {
        get onStateType() {
            return RoleState.safe;
        }
        onEnterState() {
            console.log("切换成了安全状态");
            this.Exchange = false;
        }
        onPlayAnim() {
            super.onPlayAnim();
            if (this._animName != "") {
                this._animator.getControllerLayer(0).getAnimatorState(this._animName).clip.islooping = true;
            }
        }
    }

    class Child extends Role {
        onInitEntityUnity() {
            super.onInitEntityUnity();
            if (this.unitInfo.id == MGOBE.Player.id) {
                this.camera.transform.rotationEuler = new Laya.Vector3();
                this.camera.transform.localRotationEuler = new Laya.Vector3(0, 180, 0);
                this.camera.transform.position = new Laya.Vector3();
                this.camera.transform.localPosition = new Laya.Vector3(0, 1.5, 0);
                this.camera.transform.localPositionZ = -3;
            }
            if (this._isSendMessage == true) {
                this.roleMoveRayCast = new RoleMoveRayCast();
                this.roleMoveRayCast.role = this;
                this.roleMoveRayCast.startPosY = 1.3;
            }
            this._fsm = GameManager$1.fsmManager.Create(this.unitInfo.id, this, [
                new IdleState("", this._animator),
                new MoveState("Girl_Run", this._animator),
                new SkillState("", this._animator),
                new JumpState("Girl_Jump", this._animator),
                new JumpDownState("Girl_JumpDown", this._animator),
                new FallState("Girl_Jump", this._animator),
                new DeathState("Girl_Dead", this._animator),
                new HitState("Dorothy_Hurt", this._animator),
                new SafeState("Girl_IdleStay", this._animator)
            ]);
            this.skillList.set(RoleSkill.Child_Control, {
                id: RoleSkill.Child_Control,
                time: 0,
                cd: 0,
            });
            this.skillList.set(RoleSkill.Child_ThrowStone, {
                id: RoleSkill.Child_ThrowStone,
                time: 3000,
                cd: 0,
            });
            this.initIdle = false;
            this._isCage = false;
            this._isSkill = false;
            this.jumpHeight = 0;
            this._stoneCount = 3;
        }
        idle() {
            if (GameController$1.gameStateManager.ME >= PlayerRoomState.gameLoading) {
                this.setAnimationName("Girl_IdleStay");
            }
            else {
                this.setAnimationName("Girl_IdleFacial");
            }
        }
        jump() {
            if (this.jumpHeight > 0) {
                Util.addPosition(new Laya.Vector3(0, 0.05, 0), this.gameObject, false);
                this.jumpHeight -= 0.05;
                this.onSendMessage();
            }
        }
        fall() {
            if (this.startFallPos == null || this.endFallPos == null) {
                return;
            }
            let pos = new Laya.Vector3();
            Laya.Vector3.lerp(this.startFallPos, this.endFallPos, 0.08, pos);
            let posY = this.startFallPos.y - 0.05;
            pos.y = (pos.y > posY) ? posY : pos.y;
            Util.setPosition(new Laya.Vector3(NaN, pos.y, NaN), this.gameObject);
            this.startFallPos.y = pos.y;
            if (pos.y <= this.endFallPos.y + 0.05) {
                this.roleMoveRayCast.isFall = false;
                Util.setPosition(new Laya.Vector3(NaN, this.endFallPos.y, NaN), this.gameObject);
                this.OnChangeEntityState(RoleState.jumpDown, true);
                this.startFallPos = null;
                this.endFallPos = null;
            }
            this.onSendMessage();
        }
        findStone() {
            this._stoneCount++;
            this.SendMessage(GameMessage.Role_UpdateStone);
        }
        death() {
            if (GameController$1.gameStateManager.ME >= PlayerRoomState.gameLoading) {
                this._isCage = true;
                this._isSkill = false;
                let cagePos = GameManager$1.gameScene3D.scene3D.getChildByName("cagePos");
                let pos = Util.getNewVector3(cagePos.transform.position);
                pos = new Laya.Vector3(pos.x + Math.random() * 4 - 2, pos.y, pos.z + Math.random() * 8 - 4);
                this.gameObject.transform.position = pos;
                this.prior = pos;
                this.move(0);
                if (GameController$1.roleManager.isGhostWin() == false) {
                    this.OnChangeEntityState(RoleState.idle, true);
                }
            }
            else {
                this.OnChangeEntityState(RoleState.idle, true);
            }
        }
        onFall(endFallPos) {
            this.startFallPos = new Laya.Vector3(0, this.gameObject.transform.position.y, 0);
            this.endFallPos = endFallPos;
            this.OnChangeEntityState(RoleState.fall, true);
        }
        OnClickPlaySkill(index) {
            if (this.currentState == RoleState.death || this.currentState == RoleState.safe) {
                return;
            }
            if (index == 1) {
                if (GameController$1.gameStateManager.ME >= PlayerRoomState.gameLoading) {
                    this.PlaySkill(RoleSkill.Child_Control);
                }
            }
            else if (index == 2) {
                if (this.OnChangeEntityState(RoleState.jump)) {
                    this.jumpHeight = 1.25;
                }
            }
            else if (index == 3) {
                if (GameController$1.gameStateManager.ME >= PlayerRoomState.gameLoading) {
                    if (this._stoneCount > 0) {
                        if (this.PlaySkill(RoleSkill.Child_ThrowStone) == true) {
                            this._stoneCount--;
                            this.SendMessage(GameMessage.Role_UpdateStone);
                        }
                    }
                }
                else {
                    this.PlaySkill(RoleSkill.Child_ThrowStone);
                }
            }
        }
        skill(roleSkill) {
            let skillServer;
            if (roleSkill == RoleSkill.Child_ThrowStone) {
                skillServer = {
                    skill: roleSkill,
                    forward: new Vct3(this.forward.x, this.forward.y, this.forward.z),
                };
                GameController$1.mgobeManager.sendToGameSvr(GameServerCMD.roleSkill, skillServer, this.unitInfo.id);
            }
            else if (roleSkill == RoleSkill.Child_Control) {
                skillServer = {
                    skill: roleSkill,
                };
                GameController$1.mgobeManager.sendToGameSvr(GameServerCMD.roleSkill, skillServer, this.unitInfo.id);
            }
            if (skillServer != null) {
                this._isSkill = true;
            }
        }
        set isCage(_isCage) {
            this._isCage = _isCage;
        }
        get isCage() {
            return this._isCage;
        }
        get stoneCount() {
            return this._stoneCount;
        }
    }

    class Ghost extends Role {
        onInitEntityUnity() {
            super.onInitEntityUnity();
            if (this.unitInfo.id == MGOBE.Player.id) {
                this.camera.transform.rotationEuler = new Laya.Vector3();
                this.camera.transform.localRotationEuler = new Laya.Vector3(0, 180, 0);
                this.camera.transform.position = new Laya.Vector3();
                this.camera.transform.localPosition = new Laya.Vector3(0, 1.5, 0);
                this.camera.transform.localPositionZ = -3.3;
            }
            if (this._isSendMessage == true) {
                this.roleMoveRayCast = new RoleMoveRayCast();
                this.roleMoveRayCast.role = this;
                this.roleMoveRayCast.startPosY = 1.9;
            }
            this._fsm = GameManager$1.fsmManager.Create(this.unitInfo.id, this, [
                new IdleState("", this._animator),
                new MoveState("GrandMother_Run", this._animator),
                new SkillState("", this._animator),
                new JumpState("GrandMother_Jump", this._animator),
                new DeathState("GrandMother_Dead", this._animator),
                new HitState("GrandMother_Hit", this._animator)
            ]);
            this.skillList.set(RoleSkill.Ghost_StickHit, {
                id: RoleSkill.Ghost_StickHit,
                time: 3000,
                cd: 0,
            });
            this.skillList.set(RoleSkill.Ghost_Trap, {
                id: RoleSkill.Ghost_Trap,
                time: 3000,
                cd: 0,
            });
            this.skillList.set(RoleSkill.Ghost_Shield, {
                id: RoleSkill.Ghost_Shield,
                time: 3000,
                cd: 0,
            });
            this.initIdle = false;
        }
        idle() {
            if (GameController$1.gameStateManager.ME >= PlayerRoomState.gameLoading) {
                this.setAnimationName("GrandMother_IdleStay");
            }
            else {
                this.setAnimationName("Grandmother_idle");
            }
        }
        OnClickPlaySkill(index) {
            if (index == 1) {
                this.PlaySkill(RoleSkill.Ghost_StickHit);
            }
            else if (index == 2) {
                this.PlaySkill(RoleSkill.Ghost_Trap);
            }
            else if (index == 3) {
                this.PlaySkill(RoleSkill.Ghost_Shield);
            }
        }
        skill(roleSkill) {
            let skillServer;
            if (roleSkill == RoleSkill.Ghost_StickHit) {
                skillServer = {
                    skill: roleSkill,
                    forward: new Vct3(this.forward.x, this.forward.y, this.forward.z),
                };
                GameController$1.mgobeManager.sendToGameSvr(GameServerCMD.roleSkill, skillServer, this.unitInfo.id);
            }
            else if (roleSkill == RoleSkill.Ghost_Trap) {
                skillServer = {
                    skill: roleSkill,
                };
                GameController$1.mgobeManager.sendToGameSvr(GameServerCMD.roleSkill, skillServer, this.unitInfo.id);
            }
            else if (roleSkill == RoleSkill.Ghost_Shield) {
                skillServer = {
                    skill: roleSkill,
                };
                GameController$1.mgobeManager.sendToGameSvr(GameServerCMD.roleSkill, skillServer, this.unitInfo.id);
            }
            if (skillServer != null) {
                this._isSkill = true;
            }
        }
    }

    class RoleManager extends RabManager {
        OnInit() {
            Util.Log("初始化玩家管理器");
            this.isLoop = false;
            this.roleList = new Map();
            this.joinPlayerId = [];
            Laya.timer.loop(60 / 1000, this, this.update);
            this._frame = new Queue();
            GameController$1.mgobeManager.OnreceiveFrameMessage("RoleManager", this.onFrameHandler.bind(this));
            this.AddListenerMessage(GameMessage.MGOBE_GameOffLine, this.offLine);
            this.AddListenerMessage(GameMessage.MGOBE_GameOnLine, this.addRole);
            this.AddListenerMessage(GameMessage.MGOBE_RecvFromGameServer, this.onRecvFromGameServer);
        }
        addRole(playinfo, isOwner) {
            if (GameManager$1.gameScene3D.scene3D == null) {
                GameController$1.gameOver();
                return;
            }
            if (playinfo == null) {
                for (var i = 0; i < GameController$1.mgobeManager.roomInfo.playerList.length; i++) {
                    let player = GameController$1.mgobeManager.roomInfo.playerList[i];
                    if (this.roleList.has(player.id) == false) {
                        this.addRole(player, (player.id == MGOBE.Player.id));
                    }
                }
                return;
            }
            this.isLoop = true;
            this.scene3D = GameManager$1.gameScene3D.scene3D;
            this.camera = GameManager$1.gameScene3D.camera;
            let fightUserInfo = JSON.parse(playinfo.customProfile);
            let path = GameController$1.resourceManager.getRolePath(fightUserInfo.role);
            if (Laya.loader.getRes(path) == null) {
                Laya.loader.create(path, Laya.Handler.create(this, () => {
                    this.addRole(playinfo, isOwner);
                }));
                return;
            }
            let _sp = this.scene3D.addChild(Laya.loader.getRes(path).clone());
            let role;
            if (isOwner == true) {
                _sp.addChild(this.camera);
            }
            let pos;
            if (GameController$1.gameStateManager.ME < PlayerRoomState.gameLoading) {
                pos = this.scene3D.getChildByName("rolePos").transform.position;
                pos = new Laya.Vector3(pos.x + Math.random() * 6 - 3, pos.y, pos.z + Math.random() * 6 - 3);
            }
            else {
                if (fightUserInfo.role.type == RoleType.child) {
                    pos = this.scene3D.getChildByName("childPos").transform.position;
                    pos = new Laya.Vector3(pos.x + Math.random() * 6 - 3, pos.y, pos.z + Math.random() * 6 - 3);
                }
                else {
                    pos = this.scene3D.getChildByName("ghostPos").transform.position;
                    pos = new Laya.Vector3(pos.x + Math.random() * 6 - 2, pos.y, pos.z + Math.random() * 6 - 3);
                }
            }
            _sp.transform.position = pos;
            if (fightUserInfo.role.type == RoleType.child) {
                role = _sp.addComponentIntance(new Child(fightUserInfo));
            }
            else {
                role = _sp.addComponentIntance(new Ghost(fightUserInfo));
            }
            this.roleList.set(playinfo.id, role);
            if (isOwner == true) {
                this.me = role;
                if (GameController$1.gameStateManager.ME >= PlayerRoomState.gameLoading) {
                    GameController$1.doorManager.create();
                }
            }
            else {
                role.gameObject.transform.position = new Laya.Vector3(100, 100, 100);
                role.OnChangeEntityState(RoleState.idle);
            }
            if (GameController$1.gameStateManager.ME < PlayerRoomState.gameLoading) {
                if (this.roleList.size == GameController$1.mgobeManager.roomInfo.playerList.length && this.joinPlayerId.length == 0
                    && GameController$1.mgobeManager.roomInfo.playerList.length > 1) {
                    GameController$1.mgobeManager.sendToGameSvr(GameMessage.Role_Sync, {});
                }
            }
        }
        removeRole(id) {
            if (GameController$1.gameStateManager.ME <= PlayerRoomState.gameLoading) {
                if (id != null && this.roleList.has(id) == true) {
                    this.roleList.get(id).onDestroy();
                    this.roleList.delete(id);
                    if (id == MGOBE.Player.id) {
                        this.joinPlayerId = [];
                    }
                }
                else {
                    this.isLoop = false;
                    this.roleList.forEach((value, key) => {
                        this.removeRole(value.unitInfo.id);
                    });
                }
            }
        }
        offLine(id) {
            if (GameController$1.gameStateManager.ME < PlayerRoomState.gameLoading) {
                this.removeRole(id);
            }
            if (id == MGOBE.Player.id) {
                GameController$1.leaveRoom();
            }
        }
        get ME() {
            return this.me;
        }
        getRole(id) {
            return this.roleList.get(id);
        }
        getAllChild() {
            let list = [];
            this.roleList.forEach((value, key) => {
                if (value.unitInfo.type == RoleType.child) {
                    list.push(value);
                }
            });
            return list;
        }
        getAllGhost() {
            let list = [];
            this.roleList.forEach((value, key) => {
                if (value.unitInfo.type == RoleType.ghost) {
                    list.push(value);
                }
            });
            return list;
        }
        rescue() {
            let rescuePos = GameManager$1.gameScene3D.scene3D.getChildByName("rescuePos");
            let list = this.getAllChild();
            list.forEach((value, index) => {
                if (value.isCage == true) {
                    let pos = Util.getNewVector3(rescuePos.getChildAt(index).transform.position);
                    value.gameObject.transform.position = pos;
                    value.prior = pos;
                    value.isCage = false;
                }
            });
        }
        isRscue() {
            let bool = false;
            let list = this.getAllChild();
            list.forEach((value, index) => {
                if (value.isCage == true) {
                    bool = true;
                    return;
                }
            });
            return bool;
        }
        isGhostWin() {
            let bool = true;
            let list = this.getAllChild();
            list.forEach((value, index) => {
                if (value.isCage == false) {
                    bool = false;
                    return;
                }
            });
            if (bool == true) {
                this.SendMessage(GameMessage.GameMessage_GameEnd);
            }
            return bool;
        }
        isChildWin() {
            let isCage = 0;
            let isSafe = 0;
            let list = this.getAllChild();
            list.forEach((value, index) => {
                if (value.isCage == true) {
                    isCage++;
                }
                else if (value.currentState == RoleState.safe) {
                    isSafe++;
                }
            });
            if (isCage + isSafe == list.length) {
                this.SendMessage(GameMessage.GameMessage_GameEnd);
            }
        }
        update() {
            if (this.isLoop == true) {
                this.onFrameLoop();
                this.roleList.forEach((value, key) => {
                    value.onUpdateentity();
                });
            }
        }
        onFrameHandler(frame) {
            this._frame.push(frame);
        }
        onFrameLoop() {
            let frame = this._frame.pop();
            if (GameController$1.mgobeManager) {
                if (frame) {
                    frame.items.forEach(item => {
                        this.setPlayerData(item.playerId, item.data);
                    });
                }
            }
        }
        setPlayerData(playerId, data) {
            if (playerId == MGOBE.Player.id)
                return;
            if (data.id.indexOf("player") != -1) {
                data.id = data.id.replace("player", "");
                if (this.roleList.has(playerId)) {
                    this.roleList.get(playerId).setServerData(data);
                }
            }
        }
        onRecvFromGameServer(data) {
            if (GameController$1.gameStateManager.ME == PlayerRoomState.gameEnd)
                return;
            if (data) {
                if (data.cmd == GameMessage.Role_Sync) {
                    this.me.move(0);
                    if (this.joinPlayerId.length != 0) {
                        let index = this.joinPlayerId.indexOf(data.sendPlayid);
                        if (index != -1) {
                            this.joinPlayerId.splice(index, 1);
                            let propData = {};
                            if (GameController$1.mgobeManager.isRoomOwner() == true) {
                                propData = {
                                    trap: GameController$1.propManager.getAllTrap(),
                                };
                            }
                            GameController$1.mgobeManager.sendToGameSvr(GameMessage.Role_Sync, propData);
                        }
                    }
                }
                else if (data.cmd == GameMessage.Role_Skill) {
                }
                else if (data.cmd == GameServerCMD.roleHit) {
                    let attackMessage = data.data;
                    if (this.roleList.get(attackMessage.injuredID).unitInfo.type == RoleType.child) {
                        this.roleList.get(attackMessage.injuredID).OnChangeEntityState(RoleState.death, true);
                    }
                    else {
                        this.roleList.get(attackMessage.injuredID).OnChangeEntityState(RoleState.hit, true);
                    }
                }
                else if (data.cmd == GameServerCMD.roleRescue) {
                    this.rescue();
                }
            }
        }
    }

    class DoorManager extends RabManager {
        OnInit() {
            this.doorList = new Array();
            this.isOpenDoor = false;
            this.AddListenerMessage(GameMessage.MGOBE_RecvFromGameServer, this.onRecvFromGameServer);
        }
        create() {
            this.keyCount = [0, 1, 2];
            this.keyList = [false, false, false];
            this.partCount = [0, 1, 2];
            this.partList = [false, false, false];
            this.doorList = new Array();
            this.isOpenDoor = false;
            let door = GameManager$1.gameScene3D.scene3D.getChildByName("gameroom");
            door = GameController$1.roleManager.ME.findChild(door, "map_Escape3/F_DoorType");
            for (let index = 0; index < door.numChildren; index++) {
                let item = door.getChildAt(index);
                if (item.name == "door_blue" || item.name == "door_green" || item.name == "door_red" || item.name == "door_iron") {
                    let _door = item.addComponent(Door);
                    _door.closeDoor();
                    this.doorList.push(_door);
                }
            }
        }
        findKey() {
            let index = Util.random(this.keyCount.length);
            let value = this.keyCount[index];
            this.keyList[value] = true;
            this.keyCount.splice(index, 1);
            return value;
        }
        findPart() {
            let value = this.partCount[0];
            this.partList[value] = true;
            this.partCount.splice(0, 1);
            return 2 - this.partCount.length;
        }
        isHaveKey(index) {
            return this.keyList[index];
        }
        isHavePart() {
            return this.partList.indexOf(false) != -1;
        }
        openIronDoor(id) {
            let role = GameController$1.roleManager.getRole(id);
            this.doorList.forEach((value, index) => {
                if (value.getIsOpen() == false) {
                    let distance = Util.getDistanceV3(value.transform.position, role.gameObject.transform.position, "y");
                    if (distance < 10 && Math.abs(value.transform.position.y - role.gameObject.transform.position.y) < 1) {
                        value.openDoor();
                        return;
                    }
                }
            });
        }
        onRecvFromGameServer(data) {
            if (GameController$1.gameStateManager.ME == PlayerRoomState.gameEnd)
                return;
            if (data) {
                if (data.cmd == GameServerCMD.roleSpanner) {
                    this.openIronDoor(data.sendPlayid);
                    this.isOpenDoor = true;
                    if (data.sendPlayid == MGOBE.Player.id) {
                        this.SendMessage(GameMessage.Role_Task, TaskType.Child_EscapeSuccess);
                    }
                }
            }
        }
    }

    class PropManager extends RabManager {
        OnInit() {
            this.prop = null;
        }
        start() {
            this.prop = GameManager$1.gameScene3D.scene3D.getChildByName("collider").getChildByName("prop");
            this.keyBoxList = new Array();
            this.partBoxList = new Array();
            this.stonesList = new Array();
            this.trapList = new Array();
            this.createKeyBox();
            Laya.timer.loop(1000 * 60, this, this.createKeyBox);
            this.createStones();
            Laya.timer.loop(1000 * 30, this, this.createStones);
            this.createPartBox();
            this.AddListenerMessage(GameMessage.MGOBE_RecvFromGameServer, this.onRecvFromGameServer);
        }
        removeProp() {
            this.prop = null;
            this.RemoveListenerMessage(GameMessage.MGOBE_RecvFromGameServer, this.onRecvFromGameServer);
            Laya.timer.clearAll(this);
        }
        createTrap(pos) {
            if (this.prop == null) {
                this.prop = GameManager$1.gameScene3D.scene3D.getChildByName("collider").getChildByName("prop");
                this.trapList = new Array();
            }
            let trap = Laya.loader.getRes("units/Conventional/traps.lh").clone();
            this.prop.addChild(trap);
            trap.name = RoleSkill.Ghost_Trap + this.trapList.length;
            this.syncNode(trap, trap, -1);
            trap.transform.position = pos;
            this.trapList.push(trap);
            return trap;
        }
        getAllTrap() {
            let list = [];
            if (this.trapList != null) {
                this.trapList.forEach((value, index) => {
                    if (value != null && value.destroyed == false && value.active == true) {
                        list.push(new Vct3(value.transform.position.x, value.transform.position.y, value.transform.position.z));
                    }
                });
            }
            return list;
        }
        createKeyBox() {
            if (GameController$1.mgobeManager.isRoomOwner() == false) {
                return;
            }
            let keyBoxPos = GameManager$1.gameScene3D.scene3D.getChildByName("keyBoxPos");
            GameController$1.mgobeManager.sendToGameSvr(GameServerCMD.roleCreateKeyBox, {
                index: this.getRandomPos(keyBoxPos)
            });
        }
        _createKeyBox(index) {
            let keyBoxPos = GameManager$1.gameScene3D.scene3D.getChildByName("keyBoxPos");
            let keyBox = Laya.loader.getRes("units/Conventional/box_key.lh").clone();
            this.prop.addChild(keyBox);
            keyBox.name = PropType.keyBox;
            this.syncNode(keyBox, keyBoxPos, index);
            this.keyBoxList.push(keyBox);
            if (this.keyBoxList.length == 3) {
                Laya.timer.clear(this, this.createKeyBox);
            }
            console.log("createKeyBox", this.keyBoxList);
        }
        getKeyBox(id) {
            let role = GameController$1.roleManager.getRole(id);
            this.keyBoxList.forEach((value, index) => {
                if (value.active == true) {
                    let distance = Util.getDistanceV3(value.transform.position, role.gameObject.transform.position, "y");
                    if (distance < 1 && Math.abs(value.transform.position.y - role.gameObject.transform.position.y) < 2) {
                        value.active = false;
                        let key = GameController$1.doorManager.findKey();
                        if (key == DoorIndex.blue) {
                            this.SendMessage(GameMessage.GameView_Hint, role.unitInfo.nickName + "拿到了蓝色钥匙");
                        }
                        else if (key == DoorIndex.green) {
                            this.SendMessage(GameMessage.GameView_Hint, role.unitInfo.nickName + "拿到了绿色钥匙");
                        }
                        else if (key == DoorIndex.red) {
                            this.SendMessage(GameMessage.GameView_Hint, role.unitInfo.nickName + "拿到了红色钥匙");
                        }
                        this.SendMessage(GameMessage.GameView_FindBox, PropType.keyBox, key);
                        return;
                    }
                }
            });
        }
        createPartBox() {
            if (GameController$1.mgobeManager.isRoomOwner() == false) {
                return;
            }
            let blueBoxPos = GameManager$1.gameScene3D.scene3D.getChildByName("blueBoxPos");
            let greenBoxPos = GameManager$1.gameScene3D.scene3D.getChildByName("greenBoxPos");
            let redBoxPos = GameManager$1.gameScene3D.scene3D.getChildByName("redBoxPos");
            GameController$1.mgobeManager.sendToGameSvr(GameServerCMD.roleCreatePartBox, {
                arr: [
                    this.getRandomPos(blueBoxPos),
                    this.getRandomPos(greenBoxPos),
                    this.getRandomPos(redBoxPos),
                ]
            });
        }
        _createPartBox(arr) {
            arr.forEach((value, index) => {
                let partBoxPos;
                if (index == 0) {
                    partBoxPos = GameManager$1.gameScene3D.scene3D.getChildByName("blueBoxPos");
                }
                else if (index == 1) {
                    partBoxPos = GameManager$1.gameScene3D.scene3D.getChildByName("greenBoxPos");
                }
                else if (index == 2) {
                    partBoxPos = GameManager$1.gameScene3D.scene3D.getChildByName("redBoxPos");
                }
                let partBox = Laya.loader.getRes("units/Conventional/box_part.lh").clone();
                this.prop.addChild(partBox);
                partBox.name = PropType.partBox;
                this.syncNode(partBox, partBoxPos, value);
                this.partBoxList.push(partBox);
            });
            console.log("createPartBox", this.partBoxList);
        }
        getPartBox(id) {
            let role = GameController$1.roleManager.getRole(id);
            this.partBoxList.forEach((value, index) => {
                if (value.active == true) {
                    let distance = Util.getDistanceV3(value.transform.position, role.gameObject.transform.position, "y");
                    if (distance < 1 && Math.abs(value.transform.position.y - role.gameObject.transform.position.y) < 2) {
                        value.active = false;
                        let part = GameController$1.doorManager.findPart();
                        this.SendMessage(GameMessage.GameView_Hint, role.unitInfo.nickName + "拿到了逃亡零件");
                        this.SendMessage(GameMessage.GameView_FindBox, PropType.partBox, part);
                        if (id == MGOBE.Player.id) {
                            this.SendMessage(GameMessage.Role_Task, TaskType.Child_GetPart);
                        }
                        return;
                    }
                }
            });
        }
        createStones() {
            if (GameController$1.mgobeManager.isRoomOwner() == false) {
                return;
            }
            let stonePos = GameManager$1.gameScene3D.scene3D.getChildByName("stonePos");
            GameController$1.mgobeManager.sendToGameSvr(GameServerCMD.roleCreateStones, {
                index: this.getRandomPos(stonePos)
            });
        }
        _createStones(index) {
            let stonePos = GameManager$1.gameScene3D.scene3D.getChildByName("stonePos");
            let stones = Laya.loader.getRes("units/Conventional/stones.lh").clone();
            this.prop.addChild(stones);
            stones.name = PropType.stones;
            this.syncNode(stones, stonePos, index);
            this.stonesList.push(stones);
            if (this.stonesList.length == 6) {
                Laya.timer.clear(this, this.createStones);
            }
            console.log("createStones", this.stonesList);
        }
        getStones(id) {
            let role = GameController$1.roleManager.getRole(id);
            this.stonesList.forEach((value, index) => {
                if (value.active == true) {
                    let distance = Util.getDistanceV3(value.transform.position, role.gameObject.transform.position, "y");
                    if (distance < 1 && Math.abs(value.transform.position.y - role.gameObject.transform.position.y) < 2) {
                        value.active = false;
                        role.findStone();
                        return;
                    }
                }
            });
        }
        getRandomPos(nodePos) {
            let item;
            let bool = true;
            let index = 0;
            while (bool == true) {
                index = Util.random(nodePos.numChildren - 1);
                item = nodePos.getChildAt(index);
                bool = false;
                this.keyBoxList.forEach((value) => {
                    if (Laya.Vector3.equals(value.transform.position, item.transform.position) == true) {
                        bool = true;
                        return;
                    }
                });
            }
            return index;
        }
        syncNode(node, posNode, index) {
            node.transform.position = new Laya.Vector3();
            node.transform.localPosition = new Laya.Vector3();
            node.transform.rotationEuler = new Laya.Vector3();
            node.transform.localRotationEuler = new Laya.Vector3();
            if (index >= 0 && index < posNode.numChildren) {
                let item = posNode.getChildAt(index);
                node.transform.position = item.transform.position;
                node.transform.rotationEuler = item.transform.rotationEuler;
            }
        }
        onRecvFromGameServer(data) {
            if (GameController$1.gameStateManager.ME == PlayerRoomState.gameEnd)
                return;
            if (data) {
                if (data.cmd == GameServerCMD.roleCreateKeyBox) {
                    this._createKeyBox(data.data.index);
                }
                else if (data.cmd == GameServerCMD.roleGetKeyBox) {
                    this.getKeyBox(data.sendPlayid);
                }
                else if (data.cmd == GameServerCMD.roleCreatePartBox) {
                    this._createPartBox(data.data.arr);
                }
                else if (data.cmd == GameServerCMD.roleGetPartBox) {
                    this.getPartBox(data.sendPlayid);
                }
                else if (data.cmd == GameServerCMD.roleCreateStones) {
                    this._createStones(data.data.index);
                }
                else if (data.cmd == GameServerCMD.roleGetStones) {
                    this.getStones(data.sendPlayid);
                }
            }
        }
    }

    class Skill {
    }

    class Child_Control extends Skill {
        create(id, skillServer) {
            this.role = GameController$1.roleManager.getRole(id);
            if (this.onHandControl() == true) {
                this.skillState = this.role.setAnimation("Girl_Contact", true, true);
                this.role.setCurrentSkill(this);
                Laya.timer.once(5000, this, this.handControl);
            }
            else {
                this.role.outSkillFail(skillServer.skill);
            }
        }
        remove() {
            Laya.timer.clearAll(this);
        }
        onHandControl() {
            let bool = false;
            let isRscue = GameController$1.roleManager.isRscue();
            let isPart = GameController$1.doorManager.isHavePart();
            let collider = GameManager$1.gameScene3D.scene3D.getChildByName("collider");
            let prop = collider.getChildByName("prop");
            for (let index = 0; index < prop.numChildren; index++) {
                let item = this.role.findChildAt(prop, index);
                let distance = Util.getDistanceV3(item.transform.position, this.role.gameObject.transform.position, "y");
                let gap = (item.name.indexOf(PropType.spanner) != -1) ? 3 : 1;
                if (distance < gap && Math.abs(item.transform.position.y - this.role.gameObject.transform.position.y) < 2) {
                    for (let index in PropType) {
                        if (item.name.indexOf(PropType[index]) != -1) {
                            if (index == PropType.rescue) {
                                bool = isRscue;
                            }
                            else if (index == PropType.spanner) {
                                bool = isPart;
                            }
                            else {
                                bool = true;
                            }
                        }
                        if (bool == true) {
                            this.propType = PropType[index];
                            break;
                        }
                    }
                }
            }
            return bool;
        }
        handControl() {
            this.skillState.onAnimPlayEnd();
            let isRscue = GameController$1.roleManager.isRscue();
            if (this.role.unitInfo.id == MGOBE.Player.id) {
                if (this.propType == PropType.rescue) {
                    if (isRscue == true) {
                        GameController$1.mgobeManager.sendToGameSvr(GameServerCMD.roleRescue, {});
                        this.role.SendMessage(GameMessage.Role_Task, TaskType.Child_RescueChild);
                    }
                }
                else if (this.propType == PropType.keyBox) {
                    GameController$1.mgobeManager.sendToGameSvr(GameServerCMD.roleGetKeyBox, {});
                }
                else if (this.propType == PropType.partBox) {
                    GameController$1.mgobeManager.sendToGameSvr(GameServerCMD.roleGetPartBox, {});
                }
                else if (this.propType == PropType.stones) {
                    GameController$1.mgobeManager.sendToGameSvr(GameServerCMD.roleGetStones, {});
                }
                else if (this.propType == PropType.spanner) {
                    GameController$1.mgobeManager.sendToGameSvr(GameServerCMD.roleSpanner, {});
                }
            }
        }
    }

    class Child_ThrowStone extends Skill {
        create(id, skillServer) {
            this.role = GameController$1.roleManager.getRole(id);
            this.role.setAnimation("Girl_Attack", true);
            this.role.setCurrentSkill(this);
            this.ghostList = GameController$1.roleManager.getAllGhost();
            this._forward = new Laya.Vector3(skillServer.forward.x, skillServer.forward.y, skillServer.forward.z);
            Laya.Vector3.scale(this._forward, 5, this._forward);
            this._forward.y = 0;
            this._initPos = Util.getNewVector3(this.role.gameObject.transform.position);
            this.isHit = true;
            Laya.timer.once(200, this, () => {
                this.stone = Laya.loader.getRes("units/Conventional/stone.lh").clone();
                this.stone.transform.position = Util.getNewVector3(this.role.gameObject.transform.position);
                this.stone.transform.position.x += 0.1;
                this.stone.transform.position.y += 1.3;
                this.stone.transform.position.z += 0.3;
                this.role.gameObject.parent.addChild(this.stone);
                if (Math.random() < 0.5) {
                    this.stone.getChildAt(0).active = false;
                }
                else {
                    this.stone.getChildAt(1).active = false;
                }
                Laya.timer.frameLoop(1, this, this.update);
            });
        }
        remove() {
            this.isHit = false;
            if (this.stone != null && this.stone.destroyed == false) {
                this.stone.active = false;
                this.stone.removeSelf();
                this.stone.destroy();
            }
            Laya.timer.clearAll(this);
        }
        update() {
            Util.addRotationEuler(new Laya.Vector3(0, 0, 20), this.stone, false);
            if (this.forward() == false && this.isHit == true) {
                Util.addPosition(this._forward, this.stone, false);
            }
            else {
                this.isHit = false;
                if (this._forward.y == 0) {
                    this._forward.y = -0.04;
                }
                Util.addPosition(new Laya.Vector3(0, this._forward.y * 2, 0), this.stone, false);
            }
            this.down();
            this.hitGhost();
            this._forward.x *= 0.99;
            this._forward.y *= 1.005;
            this._forward.z *= 0.99;
            if (this.isHit == true) {
                if (Util.getDistanceV3(this._initPos, this.stone.transform.position, "y") > 5) {
                    if (this._forward.y == 0) {
                        this._forward.y = -0.04;
                    }
                }
            }
        }
        hitGhost() {
            if (this.isHit == false) {
                return;
            }
            this.ghostList.forEach((value, index) => {
                if (Util.getDistanceV3(value.gameObject.transform.position, this.stone.transform.position, "y") <= 0.5) {
                    value.OnChangeEntityState(RoleState.hit, true);
                    this.remove();
                    if (this.role.unitInfo.id == MGOBE.Player.id) {
                        this.role.SendMessage(GameMessage.Role_Task, TaskType.Child_StoneHit);
                    }
                    return;
                }
            });
        }
        forward() {
            if (GameManager$1.gameScene3D.scene3D == null || GameManager$1.gameScene3D.scene3D.physicsSimulation == null) {
                return false;
            }
            let position = Util.getNewVector3(this.stone.transform.position);
            let direction = Util.getNewVector3(this._forward);
            Laya.Vector3.scale(direction, 20, direction);
            Laya.Vector3.add(direction, position, direction);
            let hitResult = new Laya.HitResult();
            GameManager$1.gameScene3D.scene3D.physicsSimulation.raycastFromTo(position, direction, hitResult);
            if (hitResult.collider != null) {
                let cube = hitResult.collider.owner;
                if (cube.parent.name.indexOf("wall") != -1 || cube.name.indexOf("door") != -1 || cube.parent.name.indexOf("prop") != -1
                    || cube.name.indexOf("shield") != -1) {
                    if (Util.getDistanceV3(hitResult.point, position, "y") <= 0.25) {
                        if (cube.name.indexOf("shield") != -1) {
                            if (cube.parent.name == MGOBE.Player.id) {
                                this.role.SendMessage(GameMessage.Role_Task, TaskType.Ghost_DefenseStone);
                            }
                        }
                        return true;
                    }
                }
            }
            return false;
        }
        down() {
            if (GameManager$1.gameScene3D.scene3D == null || GameManager$1.gameScene3D.scene3D.physicsSimulation == null) {
                return;
            }
            let position = Util.getNewVector3(this.stone.transform.position);
            position.y += 0.25;
            let direction = new Laya.Vector3(0, -0.1, 0);
            Laya.Vector3.scale(direction, 100, direction);
            Laya.Vector3.add(direction, position, direction);
            let hitResult = new Laya.HitResult();
            GameManager$1.gameScene3D.scene3D.physicsSimulation.raycastFromTo(position, direction, hitResult);
            if (hitResult.collider != null) {
                let cube = hitResult.collider.owner;
                if (cube.parent.name.indexOf("floor") != -1 || cube.parent.name.indexOf("stair") != -1) {
                    if (this.stone.transform.position.y < hitResult.point.y) {
                        this.remove();
                    }
                }
            }
        }
    }

    class Ghost_Shield extends Skill {
        create(id, skillServer) {
            this.role = GameController$1.roleManager.getRole(id);
            this.role.setAnimation("GrandMother_BlockStay", true);
            this.role.setCurrentSkill(this);
            this.shield = Laya.loader.getRes("units/Conventional/shield.lh").clone();
            this.role.roleModel.addChild(this.shield);
            this.shield.getChildAt(0).meshRenderer.enable = false;
            this.shield.transform.position = new Laya.Vector3();
            this.shield.transform.localPosition = new Laya.Vector3();
            this.shield.transform.localPositionZ += 1;
            this.shield.name = this.role.unitInfo.id;
            Laya.timer.once(this.role.getAnimTime("GrandMother_BlockStay") * 1000, this, () => {
                this.remove();
                this.shield.active = false;
                this.shield.destroy();
            });
        }
        remove() {
            Laya.timer.clearAll(this);
            Laya.stage.offAllCaller(this);
        }
    }

    class Ghost_StickHit extends Skill {
        create(id, skillServer) {
            let role = GameController$1.roleManager.getRole(id);
            role.setAnimation("GrandMother_Atk", true);
            role.setCurrentSkill(this);
            let forward = new Laya.Vector3(skillServer.forward.x, skillServer.forward.y, skillServer.forward.z);
            Laya.Vector3.scale(forward, 10, forward);
            let pos = Util.getNewVector3(role.gameObject.transform.position);
            Laya.Vector3.add(pos, forward, pos);
            Laya.timer.once(500, this, () => {
                let list = GameController$1.roleManager.getAllChild();
                list.forEach((value, index) => {
                    if (value.currentState != RoleState.death) {
                        let distance = Util.getDistanceV3(pos, value.gameObject.transform.position, "y");
                        if (distance <= 1.5) {
                            let attackMessage = {
                                attackerID: role.unitInfo.id,
                                injuredID: value.unitInfo.id,
                            };
                            if (role.unitInfo.id == MGOBE.Player.id) {
                                role.SendMessage(GameMessage.Role_Task, TaskType.Ghost_ImprisonChild);
                                GameController$1.mgobeManager.sendToGameSvr(GameServerCMD.roleHit, attackMessage);
                            }
                        }
                    }
                });
            });
        }
        remove() {
        }
    }

    class Ghost_Trap extends Skill {
        create(id, skillServer) {
            if (this.trap == null) {
                this.role = GameController$1.roleManager.getRole(id);
                this.role.setCurrentSkill(this);
                this.role.setAnimation("", false).notChangeStateEnd();
                this.trap = GameController$1.propManager.createTrap(this.role.gameObject.transform.position);
            }
            Laya.stage.on(GameMessage.MGOBE_RecvFromGameServer, this, this.onRecvFromGameServer);
        }
        remove() {
            Laya.timer.clearAll(this);
            Laya.stage.offAllCaller(this);
        }
        onRecvFromGameServer(data) {
            if (GameController$1.gameStateManager.ME == PlayerRoomState.gameEnd)
                return;
            if (data) {
                if (data.cmd == GameMessage.Role_TreadTrap) {
                    let role = GameController$1.roleManager.getRole(data.sendPlayid);
                    this.remove();
                    this.trap.active = false;
                    this.trap.destroy();
                    role.moveSpeed = role.moveSpeed - 0.02;
                    Laya.timer.once(3000, this, () => {
                        role.moveSpeed = role.moveSpeed + 0.02;
                    });
                }
            }
        }
    }

    class SkillManager extends RabManager {
        OnInit() {
            this.skillList = [];
            this.classList = new Map();
            this.classList.set(RoleSkill.Child_ThrowStone, Child_ThrowStone);
            this.classList.set(RoleSkill.Child_Control, Child_Control);
            this.classList.set(RoleSkill.Ghost_StickHit, Ghost_StickHit);
            this.classList.set(RoleSkill.Ghost_Trap, Ghost_Trap);
            this.classList.set(RoleSkill.Ghost_Shield, Ghost_Shield);
            this.AddListenerMessage(GameMessage.MGOBE_RecvFromGameServer, this.onRecvFromGameServer);
        }
        removeSkill() {
            this.skillList.forEach((value, index) => {
                value.remove();
            });
        }
        onRecvFromGameServer(data) {
            if (GameController$1.gameStateManager.ME == PlayerRoomState.gameEnd)
                return;
            if (data) {
                if (data.cmd == GameServerCMD.roleSkill) {
                    let skillServer = data.data;
                    let _class = this.classList.get(skillServer.skill);
                    if (_class != null) {
                        let role = GameController$1.roleManager.getRole(data.sendPlayid);
                        if (role != null) {
                            role.OnChangeEntityState(RoleState.skill);
                            let skill = new _class();
                            skill.create(data.sendPlayid, skillServer);
                            this.skillList.push(skill);
                        }
                    }
                }
                else if (data.cmd == GameMessage.Role_Sync) {
                    if (GameController$1.roleManager.joinPlayerId.length == 0) {
                        if (data.data.trap != null && GameController$1.propManager.getAllTrap().length == 0) {
                            let trap = data.data.trap;
                            trap.forEach((value, index) => {
                                let skill = new Ghost_Trap();
                                skill.trap = GameController$1.propManager.createTrap(new Laya.Vector3(value.x, value.y, value.z));
                                skill.create(null, null);
                                this.skillList.push(skill);
                            });
                        }
                    }
                }
            }
        }
    }

    class TaskManager extends RabManager {
        OnInit() {
            this.AddListenerMessage(GameMessage.Role_Task, this.task);
        }
        start() {
            this.ghostTask = new Map();
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
            this.childTask = new Map();
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
            if (GameController$1.roleManager.ME.unitInfo.type == RoleType.child) {
                this.meTask = this.childTask;
            }
            else {
                this.meTask = this.ghostTask;
            }
        }
        task(type) {
            console.log("task", type);
            if (GameController$1.gameStateManager.ME >= PlayerRoomState.gameLoading) {
                if (this.meTask.has(type) == true) {
                    if (this.meTask.get(type).count < this.meTask.get(type).maxCount) {
                        this.meTask.get(type).count++;
                        this.SendMessage(GameMessage.Role_UpdateTask);
                    }
                }
            }
        }
        isWin() {
            if (GameController$1.roleManager.ME.unitInfo.type == RoleType.child) {
                return this.childTask.get(TaskType.Child_EscapeSuccess).count >= this.childTask.get(TaskType.Child_EscapeSuccess).maxCount;
            }
            else {
                return !GameController$1.doorManager.isOpenDoor;
            }
        }
    }

    class GameController {
        onInitHall() {
            this._resourceManager = GameManager$1.addManager(ResourceManager);
            this._gameStateManager = GameManager$1.addManager(GameStateManager);
            this._roleManager = GameManager$1.addManager(RoleManager);
            this._doorManager = GameManager$1.addManager(DoorManager);
            this._propManager = GameManager$1.addManager(PropManager);
            this._skillManager = GameManager$1.addManager(SkillManager);
            this._taskManager = GameManager$1.addManager(TaskManager);
        }
        get mgobeManager() {
            if (!this._mgobeManager) {
                this._mgobeManager = GameManager$1.getManager(MgobeManager);
            }
            return this._mgobeManager;
        }
        get gameStateManager() {
            if (!this._gameStateManager) {
                this._gameStateManager = GameManager$1.getManager(GameStateManager);
            }
            return this._gameStateManager;
        }
        get resourceManager() {
            if (!this._resourceManager) {
                this._resourceManager = GameManager$1.getManager(ResourceManager);
            }
            return this._resourceManager;
        }
        get roleManager() {
            if (!this._roleManager) {
                this._roleManager = GameManager$1.getManager(RoleManager);
            }
            return this._roleManager;
        }
        get doorManager() {
            if (!this._doorManager) {
                this._doorManager = GameManager$1.getManager(DoorManager);
            }
            return this._doorManager;
        }
        get propManager() {
            if (!this._propManager) {
                this._propManager = GameManager$1.getManager(PropManager);
            }
            return this._propManager;
        }
        get skillManager() {
            if (!this._skillManager) {
                this._skillManager = GameManager$1.getManager(SkillManager);
            }
            return this._skillManager;
        }
        get taskManager() {
            if (!this._taskManager) {
                this._taskManager = GameManager$1.getManager(TaskManager);
            }
            return this._taskManager;
        }
        leaveRoom() {
            if (this._mgobeManager) {
                this._mgobeManager.leaveRoom(() => {
                    this.gameOver();
                });
            }
        }
        gameOver() {
            this._roleManager.removeRole(null);
            this._skillManager.removeSkill();
            this._propManager.removeProp();
            if (this.gameStateManager.ME <= PlayerRoomState.gameLoading) {
                GameManager$1.uimanager.onCloseView(ViewConfig.WaitingRoomView);
                GameManager$1.uimanager.onCreateView(ViewConfig.HallView);
            }
            else {
                GameManager$1.gameScene3D.onRemoveScene();
                GameManager$1.uimanager.onCloseView(ViewConfig.GameView);
                GameManager$1.uimanager.onCloseView(ViewConfig.JoystickView);
                GameManager$1.uimanager.onCreateView(ViewConfig.OverView);
            }
        }
        load3dRes(url) {
            if (url instanceof Array) {
                for (var i = 0; i < url.length; i++) {
                    Laya.loader.setGroup(url[i], "fightRes");
                }
            }
            else {
                Laya.loader.setGroup(url, "fightRes");
            }
        }
    }
    var GameController$1 = new GameController();

    class GameLogicManager extends RabManager {
        constructor() {
            super(...arguments);
            this._gameType = "gameinfo";
            this.jsonData = {};
        }
        OnInit() {
            this.gameInfo = {
                id: 0,
                openId: Date.now() + "",
                nickName: "Rabbit",
                avatarUrl: "",
                music: 1,
                audio: 1,
                vibrate: 1,
                lastTime: {
                    year: 0,
                    month: 0,
                    day: 0,
                    hour: 0,
                    minute: 0,
                    second: 0,
                },
                offlineTime: {
                    year: 0,
                    month: 0,
                    day: 0,
                    hour: 0,
                    minute: 0,
                    second: 0,
                },
                maxTicket: 5,
                ticket: 5,
                diamond: 0,
                coin: 0,
                currentRole: {
                    type: RoleType.ghost,
                    id: 0,
                },
                ghost: [0],
                child: [0],
            };
            this.isLoopAddTicket = false;
            this.loopAddTicketTimeGap = 1000 * 60 * 30;
            this.loopAddTicketValue = 1;
            this.onInitManaager();
        }
        onInitManaager() {
            this._gameType = "maingame";
            SDKChannel$1.UpdateGame();
            Util.Log("初始化管理器");
            let path = "config/config.json";
            Laya.loader.load(path, Laya.Handler.create(this, () => {
                Util.Log("加载配置表===", path);
                this.gameConfig = Laya.loader.getRes(path);
                this.InitConfig();
            }));
        }
        InitConfig() {
            Util.Log("最新配置表", this.gameConfig);
            if (Util.isMobil) {
                this.gameConfig = Util.supplement(this.gameConfig, sdk.confs);
            }
            this.InitMusic();
            SDKChannel$1.traceEvent("entergame");
            this.loadJson();
        }
        OnEnterGame() {
            if (Util.isMobil) {
                if (sdk.data != null) {
                    this.gameInfo = Util.supplement(this.gameInfo, sdk.data);
                }
                else {
                    sdk.data = this.gameInfo;
                    sdk.postData();
                }
                if (sdk.user.avatar == null) {
                    SDKChannel$1.createUserInfoButton(() => {
                        this.gameInfo.nickName = "";
                        this.gameInfo.avatarUrl = "";
                        this.gameInfo.id = sdk.user.id;
                        this.gameInfo.openId = sdk.user.openid + "";
                        this.SendMessage(GameMessage.HallView_ShowRole);
                        sdk.data = this.gameInfo;
                        sdk.postData();
                    });
                }
                else {
                    if (this.gameInfo.nickName == "" || this.gameInfo.nickName == null) {
                        this.gameInfo.nickName = "";
                        this.gameInfo.avatarUrl = "";
                        this.gameInfo.id = sdk.user.id;
                        this.gameInfo.openId = sdk.user.openid + "";
                        this.SendMessage(GameMessage.HallView_ShowRole);
                        sdk.data = this.gameInfo;
                        sdk.postData();
                    }
                }
            }
            this.InitGameInfo();
        }
        InitGameInfo() {
            this.gameInfo = SDKChannel$1.initData(this.gameInfo, this.gameConfig);
            this.updateTime();
            Util.Log("获得数据", this.gameInfo);
            SDKChannel$1.onHide((res) => {
                Util.Log("保存数据");
                this.SaveData();
            });
        }
        updateTime() {
            let date = new Date();
            let minute = 0;
            if (this.gameInfo.lastTime.year < date.getFullYear()) {
                this.gameInfo.ticket = this.gameInfo.maxTicket;
            }
            else if (this.gameInfo.lastTime.month < date.getMonth()) {
                this.gameInfo.ticket = this.gameInfo.maxTicket;
            }
            else if (this.gameInfo.lastTime.day < date.getDay()) {
                this.gameInfo.ticket = this.gameInfo.maxTicket;
            }
            else if (this.gameInfo.lastTime.hour < date.getHours()) {
                this.gameInfo.ticket = this.gameInfo.maxTicket;
                let hour = date.getHours() - this.gameInfo.lastTime.hour;
                minute = date.getMinutes() - this.gameInfo.lastTime.minute;
                minute += hour * 60;
            }
            else if (this.gameInfo.lastTime.minute < date.getMinutes()) {
                minute = date.getMinutes() - this.gameInfo.lastTime.minute;
                while (minute >= 30 && this.gameInfo.ticket < this.gameInfo.maxTicket) {
                    this.addTicket(this.loopAddTicketValue);
                    minute -= 30;
                }
                minute = date.getMinutes() - this.gameInfo.lastTime.minute;
            }
            else if (this.gameInfo.lastTime.second < date.getSeconds()) {
            }
            this.gameInfo.lastTime.year = date.getFullYear();
            this.gameInfo.lastTime.month = date.getMonth();
            this.gameInfo.lastTime.day = date.getDay();
            this.gameInfo.lastTime.hour = date.getHours();
            this.gameInfo.lastTime.minute = date.getMinutes();
            this.gameInfo.lastTime.second = date.getSeconds();
        }
        loadJson() {
            var arr = [];
            Object.keys(this.gameConfig.loadJson).forEach((key) => {
                arr.push(this.gameConfig.loadJson[key]);
            });
            if (arr.length > 0) {
                Laya.loader.load(arr, Laya.Handler.create(this, () => {
                    this.loadView();
                }));
            }
            else {
                this.loadView();
            }
        }
        loadView() {
            Object.keys(this.gameConfig.loadJson).forEach((key) => {
                this.jsonData[key] = Laya.loader.getRes(this.gameConfig.loadJson[key]);
            });
            var arr = [];
            Object.keys(this.gameConfig.loadui).forEach((key) => {
                arr.push(this.gameConfig.loadui[key]);
            });
            if (arr.length > 0) {
                fgui.UIPackage.loadPackage(arr, Laya.Handler.create(this, () => {
                    this.OnEnterGame();
                }));
            }
            else {
                this.OnEnterGame();
            }
        }
        SaveData() {
            if (Util.isMobil) {
                sdk.data = this.gameInfo;
                sdk.postData();
            }
            let date = new Date();
            this.gameInfo.offlineTime.year = date.getFullYear();
            this.gameInfo.offlineTime.month = date.getMonth();
            this.gameInfo.offlineTime.day = date.getDay();
            this.gameInfo.offlineTime.hour = date.getHours();
            this.gameInfo.offlineTime.minute = date.getMinutes();
            this.gameInfo.offlineTime.second = date.getSeconds();
            SDKChannel$1.SaveData(this.gameInfo, this._gameType);
            Util.Log("保存数据", this.gameInfo);
        }
        getJsonData(name) {
            return this.jsonData[name];
        }
        addTicket(ticket) {
            if (this.gameInfo.ticket + ticket < 0) {
                return false;
            }
            this.gameInfo.ticket += ticket;
            if (this.gameInfo.ticket >= this.gameInfo.maxTicket) {
                this.isLoopAddTicket = false;
                Laya.timer.clear(this, this.loopAddTicket);
            }
            else if (this.isLoopAddTicket == false) {
                this.isLoopAddTicket = true;
                Laya.timer.loop(this.loopAddTicketTimeGap, this, this.loopAddTicket);
            }
            this.SaveData();
            this.SendMessage(GameMessage.GameMessage_UpdateUserInfo);
            return true;
        }
        loopAddTicket() {
            this.addTicket(this.loopAddTicketValue);
        }
        setCurrentRole(index) {
            let list = GameController$1.resourceManager.getRoleAllPath(this.gameInfo.currentRole);
            this.gameInfo.currentRole.id += index;
            if (this.gameInfo.currentRole.id < 0 || this.gameInfo.currentRole.id >= list.length) {
                if (this.gameInfo.currentRole.type == RoleType.ghost) {
                    this.gameInfo.currentRole.type = RoleType.child;
                }
                else {
                    this.gameInfo.currentRole.type = RoleType.ghost;
                }
                if (this.gameInfo.currentRole.id < 0) {
                    list = GameController$1.resourceManager.getRoleAllPath(this.gameInfo.currentRole);
                    this.gameInfo.currentRole.id = list.length - 1;
                }
                else {
                    this.gameInfo.currentRole.id = 0;
                }
            }
        }
        isHaveRole(role = this.gameInfo.currentRole) {
            if (role.type == RoleType.ghost) {
                return this.gameInfo.ghost.indexOf(role.id) != -1;
            }
            else {
                return this.gameInfo.child.indexOf(role.id) != -1;
            }
        }
        InitMusic() {
            GameManager$1.musicManager.SetState(this.gameInfo.music, this.gameInfo.audio);
        }
        PlayMusic(musiPath, vol = 0.5) {
            GameManager$1.musicManager.playMusic(musiPath, vol);
        }
        setGameInfo(typ, val) {
            this.gameInfo[typ] = val;
        }
        setMusic() {
            this.gameInfo.music = this.gameInfo.music ? 0 : 1;
            this.InitMusic();
        }
        setAudio() {
            this.gameInfo.audio = this.gameInfo.audio ? 0 : 1;
            this.InitMusic();
        }
        setVibrate() {
            this.gameInfo.vibrate = this.gameInfo.vibrate ? 0 : 1;
        }
    }

    class GameScene3D extends RabManager {
        OnInit() {
        }
        get scene3D() {
            return this._scene3D;
        }
        onLoad3dScene(url, callback) {
            if (url == "") {
                let scene3D = new Laya.Scene3D();
                scene3D.name = "scene3D";
                let camera = (scene3D.addChild(new Laya.Camera(0, 0.1, 100)));
                camera.name = "camera";
                camera.transform.translate(new Laya.Vector3(0, 1, 0));
                camera.transform.rotate(new Laya.Vector3(0, 0, 0), true, false);
                camera.clearFlag = Laya.CameraClearFlags.DepthOnly;
                var directionLight = scene3D.addChild(new Laya.DirectionLight());
                directionLight.name = "directionLight";
                directionLight.color = new Laya.Vector3(0.6, 0.6, 0.6);
                directionLight.transform.worldMatrix.setForward(new Laya.Vector3(1, -1, 0));
                callback && callback(scene3D);
            }
            else {
                if (this.scene3D) {
                    this.onShowScene();
                    callback && callback();
                }
                else {
                    Util.Log("3d场景加载成功");
                    this._scene3D = Laya.loader.getRes(url);
                    this._node.addChild(this._scene3D);
                    this.camera = this._scene3D.getChildByName("Main Camera");
                    let gameroom = this._scene3D.getChildByName("gameroom");
                    if (gameroom) {
                        let SkyDome = gameroom.getChildByName("SkyDome");
                        if (SkyDome) {
                            SkyDome.active = false;
                        }
                    }
                    callback && callback();
                }
            }
        }
        onShowScene() {
            if (this._scene3D) {
                this._scene3D.active = true;
            }
        }
        onHideScene() {
            if (this._scene3D) {
                this._scene3D.active = false;
            }
        }
        onRemoveScene() {
            if (this._scene3D) {
                this._scene3D.removeSelf();
                this._scene3D.destroy(true);
                this._scene3D = null;
            }
        }
        openSky() {
        }
        onLoadSkyBox(mat) {
            var skyRenderer = this.scene3D.skyRenderer;
            skyRenderer.mesh = Laya.SkyBox.instance;
            skyRenderer.material = mat;
        }
    }

    class GameManager {
        constructor() {
            this.managerList = new Map();
        }
        addManager(c, node) {
            if (!this.managerList.has(c)) {
                let obj = new c(node);
                this.managerList.set(c, obj);
                return obj;
            }
            else {
                console.log("管理器已经有了：");
            }
            return this.managerList.get(c);
        }
        getManager(c) {
            if (this.managerList.has(c)) {
                return this.managerList.get(c);
            }
            return null;
        }
        removeManager(c) {
            if (this.managerList.has(c)) {
                this.managerList.get(c).onDestroy();
                this.managerList.delete(c);
            }
            return null;
        }
        get uimanager() {
            return this.getManager(UIManager);
        }
        get musicManager() {
            return this.getManager(MusicManager);
        }
        get gameScene3D() {
            return this.getManager(GameScene3D);
        }
        get gameLogicManager() {
            return this.getManager(GameLogicManager);
        }
        get fsmManager() {
            return this.getManager(FsmManager);
        }
    }
    var GameManager$1 = new GameManager();

    class Engine {
        constructor() {
            this.onInit();
        }
        onInit() {
            this.sceneNode = new Laya.Sprite();
            this.uiNode = new Laya.Sprite();
            this.topUiNode = new Laya.Sprite();
            Laya.stage.addChild(this.sceneNode);
            Laya.stage.addChild(this.uiNode);
            Laya.stage.addChild(this.topUiNode);
            fgui.GRoot.inst.displayObject.zOrder = 2;
            fgui.GRoot.inst.width = Laya.stage.designWidth;
            fgui.GRoot.inst.height = Laya.stage.designHeight;
            fairygui.UIConfig.packageFileExtension = 'txt';
            this.uiNode.addChild(fgui.GRoot.inst.displayObject);
            GameManager$1.addManager(MusicManager);
            GameManager$1.addManager(UIManager, this.uiNode);
            GameManager$1.addManager(ViewConfig);
            GameManager$1.addManager(GameLogicManager);
            GameManager$1.addManager(FsmManager);
            GameManager$1.addManager(GameScene3D, this.sceneNode);
            GameManager$1.uimanager.onCreateView(ViewConfig.InitLoadView);
        }
    }

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(1334, 750, null, Laya.Handler.create(this, this.initMain));
            else {
                Laya.init(1334, 750, Laya["WebGL"]);
                this.initMain();
            }
        }
        initMain() {
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = Laya.Stage.SCALE_FIXED_HEIGHT;
            Laya.stage.screenMode = "horizontal";
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Config.useRetinalCanvas = true;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            new Engine();
        }
    }
    new Main();

}());
