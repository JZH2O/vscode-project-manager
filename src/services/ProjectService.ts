import * as vscode from 'vscode';
import { Project } from '../models';
import { 
    getWorkspaceFilePath, 
    readWorkspaceConfig, 
    writeWorkspaceConfig,
    CURRENT_PROJECT_KEY
} from '../utils';
import { getProjectFolders } from '../utils/projectUtils';

export class ProjectService {
    private static instance: ProjectService;
    private globalSettings: any = {}; // 保存原始的全局设置
    private isGlobalSettingsInitialized = false; // 标记是否已经初始化过全局设置
    private currentProject: Project | null = null; // 保存当前选中的项目

    private constructor() {}

    /**
     * 获取ProjectService单例实例
     * @returns ProjectService实例
     */
    public static getInstance(): ProjectService {
        if (!ProjectService.instance) {
            ProjectService.instance = new ProjectService();
        }
        return ProjectService.instance;
    }

    /**
     * 设置当前项目
     * @param project 项目对象
     * @param context VS Code扩展上下文
     */
    public setCurrentProject(project: Project, context?: vscode.ExtensionContext): void {
        this.currentProject = project;
        
        // 如果有上下文对象，保存当前项目到全局状态
        if (context) {
            context.globalState.update(CURRENT_PROJECT_KEY, project);
        }
    }

    /**
     * 获取当前项目
     * @returns 当前项目对象或null
     */
    public getCurrentProject(): Project | null {
        return this.currentProject;
    }

    /**
     * 从全局状态恢复当前项目
     * @param context VS Code扩展上下文
     */
    public restoreCurrentProject(context: vscode.ExtensionContext): void {
        const savedProject = context.globalState.get<Project | null>(CURRENT_PROJECT_KEY, null);
        if (savedProject) {
            this.currentProject = savedProject;
        }
    }

    /**
     * 打开项目
     * @param project 项目对象
     * @param context VS Code扩展上下文
     */
    public openProject(project: Project, context?: vscode.ExtensionContext): void {
        // 更新当前项目状态
        this.setCurrentProject(project, context);
        
        // 更新 work.code-workspace 文件
        this.updateWorkspaceFile(project);
        
        // 打开工作区文件
        const workspaceFilePath = getWorkspaceFilePath();
        const uri = vscode.Uri.file(workspaceFilePath);
        vscode.commands.executeCommand('vscode.openFolder', uri, false); // false 表示不在新窗口中打开
        
        // 在工作区打开后再次更新状态栏，确保显示正确
        setTimeout(() => {
            // 触发项目列表更新事件
            vscode.commands.executeCommand('project-workspace-manager.projectListUpdated');
        }, 1000);
    }

    /**
     * 更新工作区文件
     * @param project 项目对象
     */
    public updateWorkspaceFile(project: Project): void {
        let workspaceConfig: any = {};
        try {
            const existingConfig = readWorkspaceConfig();
            if (existingConfig) {
                workspaceConfig = existingConfig;
                
                // 只在第一次读取时保存全局设置
                if (!this.isGlobalSettingsInitialized) {
                    this.globalSettings = workspaceConfig.settings || {};
                    this.isGlobalSettingsInitialized = true;
                }
            } else {
                // 如果文件不存在，创建基本结构
                workspaceConfig = {
                    folders: [
                        {
                            name: "workspace",
                            path: "./"
                        }
                    ],
                    settings: {}
                };
                
                // 保存原始的全局设置
                if (!this.isGlobalSettingsInitialized) {
                    this.globalSettings = {};
                    this.isGlobalSettingsInitialized = true;
                }
            }
        } catch (error) {
            console.error('读取现有工作区配置时出错:', error);
            // 如果读取出错，使用默认配置
            workspaceConfig = {
                folders: [
                    {
                        name: "workspace",
                        path: "./"
                    }
                ],
                settings: {}
            };
            
            // 保存原始的全局设置
            if (!this.isGlobalSettingsInitialized) {
                this.globalSettings = {};
                this.isGlobalSettingsInitialized = true;
            }
        }
        
        // 确保基本结构存在
        if (!workspaceConfig.folders) {
            workspaceConfig.folders = [];
        }
        
        // 添加项目文件夹
        const projectFolders = [];
        
        // 如果项目在 projectManager.projectList 中有多个文件夹配置，则添加它们
        let foundProjectFolders = false;
        let projectSettings = {};
        try {
            const fullWorkspaceConfig = readWorkspaceConfig();
            
            if (fullWorkspaceConfig && fullWorkspaceConfig["projectManager.projectList"]) {
                const projectGroups = fullWorkspaceConfig["projectManager.projectList"];
                
                // 查找当前项目
                for (const groupName in projectGroups) {
                    const group = projectGroups[groupName];
                    // 检查组是否包含与当前项目同名的项目
                    if (group && groupName === project.name && group.hasOwnProperty('folders') && Array.isArray(group.folders)) {
                        // 添加所有文件夹（包括主项目文件夹）
                        group.folders.forEach((folder: any) => {
                            projectFolders.push({
                                name: folder.name,
                                path: folder.path
                            });
                        });
                        foundProjectFolders = true;
                        
                        // 获取项目特定的设置
                        if (group.settings && typeof group.settings === 'object') {
                            projectSettings = group.settings;
                        }
                        
                        // 找到匹配项后跳出循环
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('读取项目文件夹配置时出错:', error);
        }
        
        // 如果没有在 projectManager.projectList 中找到项目文件夹配置，则添加主项目文件夹
        if (!foundProjectFolders) {
            const folders = getProjectFolders(project);
            if (folders.length > 0) {
                projectFolders.push({
                    name: folders[0].name,
                    path: folders[0].path
                });
            }
            // 如果项目没有 folders 属性，这里可能需要特殊处理
            // 因为我们现在没有 path 字段，所以可能需要从其他地方获取路径信息
        }
        
        // 更新工作区配置中的文件夹部分，保留其他所有配置
        // 移除现有的项目文件夹，但保留 "workspace" 文件夹
        workspaceConfig.folders = workspaceConfig.folders.filter((folder: any) => 
            folder.name === "workspace" || folder.path === "./"
        );
        
        // 添加项目文件夹
        projectFolders.forEach(folder => {
            // 避免重复添加
            const exists = workspaceConfig.folders.some((f: any) => f.path === folder.path);
            if (!exists) {
                workspaceConfig.folders.push(folder);
            }
        });
        
        // 合并全局设置与项目特定设置
        // 项目特定的设置会覆盖全局设置
        workspaceConfig.settings = { ...this.globalSettings, ...projectSettings };
        
        // 将工作区配置写入文件
        writeWorkspaceConfig(workspaceConfig);
    }
}