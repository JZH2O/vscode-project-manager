import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export const CURRENT_PROJECT_KEY = 'currentProject';

/**
 * 获取当前工作区的配置对象
 * @returns 当前工作区的配置对象
 */
export function getCurrentWorkspaceConfig() {
    // 首先检查是否打开了 .code-workspace 文件
    const workspaceFile = vscode.workspace.workspaceFile?.path;
    if (workspaceFile) {
        return workspaceFile;
    }
    
    // 方法1: 使用 VS Code API 获取当前工作区文件
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
        // 通常第一个文件夹是根目录
        const rootPath = workspaceFolders[0].uri.path;
        return rootPath;
    }
    return null;
}

/**
 * 获取工作区文件路径
 * @returns 工作区文件的完整路径
 */
export function getWorkspaceFilePath(): string {

    // 获取当前工作区配置
    const workspaceConfig = getCurrentWorkspaceConfig();
    // 如果工作区配置中包含了路径，则在该路径下查找.code-workspace文件
    if (workspaceConfig) {
        // 如果未找到实际的.code-workspace文件，回退到原来的逻辑
        return path.join(workspaceConfig);
    }
    
    // 如果仍然没有工作区文件夹，返回空字符串或抛出错误
    throw new Error('无法确定工作区根路径，当前未打开任何工作区');
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