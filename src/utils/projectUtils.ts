import * as vscode from 'vscode';
import { Project } from '../models';
import { readWorkspaceConfig } from './workspaceUtils';

/**
 * 从工作区文件获取项目列表
 * @returns 项目数组
 */
export function getProjectListFromWorkspace(): Project[] {
    try {
        const workspaceConfig = readWorkspaceConfig();
        
        // 检查是否有 projectManager.projectList 配置
        if (workspaceConfig && workspaceConfig["projectManager.projectList"]) {
            // 将对象形式的项目列表转换为数组形式
            const projectGroups = workspaceConfig["projectManager.projectList"];
            const projects: Project[] = [];
            
            for (const groupName in projectGroups) {
                const group = projectGroups[groupName];
                // 处理新的对象结构
                if (group && group.hasOwnProperty('folders') && Array.isArray(group.folders)) {
                    // 为项目组创建一个主项目条目
                    const mainProject: Project = {
                        name: groupName,
                        description: group.description || ''
                    };
                    
                    // 如果有多个文件夹，添加 folders 属性
                    if (group.folders && group.folders.length > 0) {
                        mainProject.folders = group.folders;
                    }
                    
                    projects.push(mainProject);
                }
            }
            
            return projects;
        }
    } catch (error) {
        console.error('读取工作区文件时出错:', error);
    }
    
    return [];
}

/**
 * 从配置获取项目列表（兼容旧版本）
 * @returns 项目数组
 */
export function getProjectListFromConfig(): Project[] {
    const config = vscode.workspace.getConfiguration('projectManager');
    return config.get('projectList', []);
}

/**
 * 获取项目列表
 * @returns 项目数组
 */
export function getProjectList(): Project[] {
    // 优先从工作区文件获取项目列表
    const workspaceProjects = getProjectListFromWorkspace();
    if (workspaceProjects.length > 0) {
        return workspaceProjects;
    }
    
    // 如果工作区文件中没有项目列表，则从配置中获取（兼容旧版本）
    return getProjectListFromConfig();
}

/**
 * 获取项目的文件夹配置
 * @param project 项目对象
 * @returns 文件夹数组
 */
export function getProjectFolders(project: Project): Array<{name: string, path: string}> {
    // 如果项目有 folders 属性，则使用其中的第一个文件夹
    if (project.folders && project.folders.length > 0) {
        return project.folders;
    }
    
    // 默认返回空数组
    return [];
}