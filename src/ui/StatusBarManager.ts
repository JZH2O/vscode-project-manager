import * as vscode from 'vscode';
import { getProjectList } from '../utils/projectUtils';
import { ProjectService } from '../services';

/**
 * 状态栏管理器
 */
export class StatusBarManager {
    private static instance: StatusBarManager;
    private projectSelector: vscode.StatusBarItem;

    private constructor() {
        // 创建项目选择器状态栏项，模仿Copilot的样式
        this.projectSelector = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.projectSelector.command = 'project-workspace-manager.selectProject';
    }

    /**
     * 获取StatusBarManager单例实例
     * @returns StatusBarManager实例
     */
    public static getInstance(): StatusBarManager {
        if (!StatusBarManager.instance) {
            StatusBarManager.instance = new StatusBarManager();
        }
        return StatusBarManager.instance;
    }

    /**
     * 显示状态栏项
     */
    public show(): void {
        this.projectSelector.show();
    }

    /**
     * 隐藏状态栏项
     */
    public hide(): void {
        this.projectSelector.hide();
    }

    /**
     * 更新项目列表显示
     */
    public updateProjectList(): void {
        const projects = getProjectList();
        const projectService = ProjectService.getInstance();
        const currentProject = projectService.getCurrentProject();
        
        // 根据是否有项目和当前项目状态更新状态栏显示
        if (currentProject) {
            this.projectSelector.text = `$(folder-active) ${currentProject.name}`;
            this.projectSelector.tooltip = `Project Workspace Manager\n当前项目: ${currentProject.name}\n项目描述: ${currentProject.description}\n`;
        } else if (projects.length > 0) {
            this.projectSelector.text = `$(folder) ${projects.length} 个项目`;
            this.projectSelector.tooltip = `Project Workspace Manager\n${projects.length} 个项目可用\n`;
        } else {
            this.projectSelector.text = "$(folder) 选择项目";
            this.projectSelector.tooltip = "Project Workspace Manager\n暂无项目\n";
        }
    }

    /**
     * 获取状态栏项
     * @returns 状态栏项
     */
    public getStatusBarItem(): vscode.StatusBarItem {
        return this.projectSelector;
    }
}