/**
 * 项目接口定义
 */
export interface Project {
    /**
     * 项目名称
     */
    name: string;
    
    /**
     * 项目描述
     */
    description: string;
    
    /**
     * 项目文件夹数组（可选）
     */
    folders?: Array<{
        /**
         * 文件夹名称
         */
        name: string;
        
        /**
         * 文件夹路径
         */
        path: string;
    }>;
    
    /**
     * 项目特定设置（可选）
     */
    settings?: { [key: string]: any };
}