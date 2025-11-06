import * as vscode from 'vscode';
import { Project } from '../models';
import { getProjectList } from '../utils/projectUtils';
import { ProjectService } from '../services';

/**
 * 项目选择器类
 */
export class ProjectSelector {
    /**
     * 显示项目选择器
     * @param context VS Code扩展上下文
     */
    public static async show(context?: vscode.ExtensionContext): Promise<void> {
        // 获取项目列表
        const projects = getProjectList();
        
        if (projects.length === 0) {
            vscode.window.showInformationMessage('未找到项目配置，请在 work.code-workspace 文件中手动添加项目配置');
            return;
        }

        // 创建项目选择列表，模仿Copilot的样式
        interface ProjectItem extends vscode.QuickPickItem {
            project?: Project;
            action?: 'open' | 'refresh';
        }
        
        // 添加特殊操作项
        const actionItems: ProjectItem[] = [
            { 
                label: "$(refresh) 刷新项目列表", 
                description: "重新加载项目列表",
                action: 'refresh',
                alwaysShow: true
            }
        ];
        
        const projectService = ProjectService.getInstance();
        const currentProject = projectService.getCurrentProject();
        
        // 创建项目项
        const projectItems: ProjectItem[] = projects.map(project => ({
            label: currentProject && currentProject.name === project.name ? 
                   "$(pass-filled) " + project.name : 
                   "$(folder) " + project.name,
            description: project.description,
            detail: currentProject && currentProject.name === project.name ? 
                    "当前活动项目" : 
                    "点击打开项目",
            project: project
        }));

        // 合并项目项和操作项
        const items: ProjectItem[] = [...projectItems, { label: "", kind: vscode.QuickPickItemKind.Separator }, ...actionItems];

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: '选择项目或操作',
            matchOnDescription: true,
            matchOnDetail: true
        });

        if (selected) {
            if (selected.action === 'refresh') {
                // 触发项目列表更新事件
                vscode.commands.executeCommand('project-workspace-manager.projectListUpdated');
                vscode.window.showInformationMessage('项目列表已刷新');
            } else if (selected.project) {
                projectService.openProject(selected.project, context);
            }
        }
    }
}