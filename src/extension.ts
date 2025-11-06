import * as vscode from 'vscode';
import { Project } from './models';
import { ProjectService } from './services';
import { StatusBarManager } from './ui';
import { ProjectSelector } from './ui/ProjectSelector';
import { getProjectList } from './utils/projectUtils';

export function activate(context: vscode.ExtensionContext) {
    console.log('Project Workspace Manager 插件已激活');

    // 获取服务实例
    const projectService = ProjectService.getInstance();
    const statusBarManager = StatusBarManager.getInstance();

    // 从全局状态恢复当前项目
    projectService.restoreCurrentProject(context);

    // 显示状态栏项
    statusBarManager.show();
    context.subscriptions.push(statusBarManager.getStatusBarItem());

    // 注册命令
    let selectProjectDisposable = vscode.commands.registerCommand('project-workspace-manager.selectProject', () => {
        ProjectSelector.show(context);
    });
    
    let refreshDisposable = vscode.commands.registerCommand('project-workspace-manager.refreshProjects', () => {
        statusBarManager.updateProjectList();
    });
    
    // 注册项目列表更新事件
    let projectListUpdatedDisposable = vscode.commands.registerCommand('project-workspace-manager.projectListUpdated', () => {
        statusBarManager.updateProjectList();
    });

    context.subscriptions.push(selectProjectDisposable);
    context.subscriptions.push(refreshDisposable);
    context.subscriptions.push(projectListUpdatedDisposable);

    // 初始化项目列表
    statusBarManager.updateProjectList();

    // 监听配置变化
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('projectManager')) {
            statusBarManager.updateProjectList();
        }
    }));
}

// 此处 intentionally 留空，因为我们已经将这些函数移到了单独的模块中

// Project接口已移至models/Project.ts文件中

export function deactivate() {
    console.log('Project Workspace Manager 插件已停用');
}