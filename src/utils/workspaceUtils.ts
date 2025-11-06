import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Project } from '../models';

export const WORKSPACE_FILE = 'work.code-workspace';
export const CURRENT_PROJECT_KEY = 'currentProject';

/**
 * 获取工作区文件路径
 * @returns 工作区文件的完整路径
 */
export function getWorkspaceFilePath(): string {
    // 从配置中获取工作区文件路径
    const config = vscode.workspace.getConfiguration('projectManager');
    const workspacePath: string = config.get('workspacePath', '');
    
    // 如果配置了路径且不为空，则使用配置的路径
    if (workspacePath && workspacePath.trim() !== '') {
        return workspacePath.trim();
    }
    
    // 否则使用默认路径
    return path.join(vscode.workspace.rootPath || '', WORKSPACE_FILE);
}

/**
 * 读取工作区配置
 * @returns 工作区配置对象
 */
export function readWorkspaceConfig(): any {
    const workspaceFilePath = getWorkspaceFilePath();
    if (fs.existsSync(workspaceFilePath)) {
        const workspaceContent = fs.readFileSync(workspaceFilePath, 'utf8');
        return JSON.parse(workspaceContent);
    }
    return null;
}

/**
 * 写入工作区配置
 * @param config 工作区配置对象
 */
export function writeWorkspaceConfig(config: any): void {
    const workspaceFilePath = getWorkspaceFilePath();
    fs.writeFileSync(workspaceFilePath, JSON.stringify(config, null, 4));
}