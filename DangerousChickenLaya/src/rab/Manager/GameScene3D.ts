import Util from "../Util";
import { RabManager } from "./RabManager";


/**
 * 游戏管理器
 * @author Rabbit
 */
export default class GameScene3D extends RabManager {

    /**3D场景 */
    public _scene3D: Laya.Scene3D;
    public camera:Laya.Camera;

    protected OnInit() {
       
    }

    public get scene3D():Laya.Scene3D
    {
        return this._scene3D;
    }

    /**
     * 3d场景加载
     */
    public onLoad3dScene(url:string, callback: Function) {
        if (url == "") {
            //添加3D场景
            let scene3D = new Laya.Scene3D();
            scene3D.name = "scene3D";
            //添加照相机
            let camera = (scene3D.addChild(new Laya.Camera(0, 0.1, 100))) as Laya.Camera;
            camera.name = "camera";
            camera.transform.translate(new Laya.Vector3(0, 1, 0));
            camera.transform.rotate(new Laya.Vector3(0, 0, 0), true, false);
            camera.clearFlag = Laya.CameraClearFlags.DepthOnly;
            //添加方向光
            var directionLight: Laya.DirectionLight = scene3D.addChild(new Laya.DirectionLight()) as Laya.DirectionLight;
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
                this.camera = this._scene3D.getChildByName("Main Camera")as Laya.Camera;

                let gameroom = this._scene3D.getChildByName("gameroom")
                if(gameroom)
                {
                    let SkyDome:Laya.Sprite3D = gameroom.getChildByName("SkyDome") as Laya.Sprite3D
                    if(SkyDome)
                    {
                        SkyDome.active = false;
                    }
                }

                //天空盒
                // Laya.BaseMaterial.load("skybox/skybox2/skyBox.lmat", Laya.Handler.create(this, this.onLoadSkyBox));

                callback && callback();
            }
        }
    }

    public onShowScene()
    {
        if(this._scene3D)
        {
            this._scene3D.active = true;
        }
    }

    public onHideScene()
    {
        if(this._scene3D)
        {
            this._scene3D.active = false;
        }
    }

    public onRemoveScene()
    {
        if(this._scene3D)
        {
            this._scene3D.removeSelf();
            this._scene3D.destroy(true);
            this._scene3D = null;
        }
    }

    public openSky()
    {
        
    }

    onLoadSkyBox(mat: Laya.SkyBoxMaterial)
    {
        //如果没有在.lmat里设置着色，可在此设置,否则场景会黑漆漆的
        //mat.tintColor = new Laya.Vector4(0.5, 0.5, 0.5, 0.5)         
        //获取场景的天空渲染器
        var skyRenderer: Laya.SkyRenderer = this.scene3D.skyRenderer;
        //附上天空盒
        skyRenderer.mesh = Laya.SkyBox.instance;
        //设置材质
        skyRenderer.material = mat;
        // //模拟动态
        // Laya.timer.frameLoop(1, this, () => {
        // 	//曝光度
        // 	this.scene.skyRenderer.material.exposure = Math.sin(exposureNumber += 0.01) + 1;
        // 	//材质旋转
        // 	this.scene.skyRenderer.material.rotation += 0.1;
        // });
    }
}