import { SkillServer } from "../DataType";

/**
 * 技能
 */
export default abstract class Skill {

    /**创建技能 */
    public abstract create (id: string, skillServer: SkillServer): void;

    /**销毁技能 */
    public abstract remove (): void;
}