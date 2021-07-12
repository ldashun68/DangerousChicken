/**
 * 大小
 * @author Rabbit
 */
export default class Size {

    private _w:number;
    private _h:number;
    
    /**
     * 
     * @param w 
     * @param h 
     */
    constructor(w:number,h:number)
    {
        this._w = w;
        this._h = h;
    }

    /**
     * 宽度
     */
    public get Width():number
    {
        return this._w;
    }

    /**
     * 高度
     */
    public get Height():number
    {
        return this._h;
    }
}
