# Project Workspace Manager

This is a VS Code extension for managing and switching between project workspaces.

## Features

- Quickly switch between different projects
- Automatically save and restore project workspace states
- Support for multi-folder project configurations
- Intuitive status bar display

## Architecture

This plugin has been optimized with a modular design, primarily consisting of the following components:

### 1. Models (Data Models)
- `Project`: Defines the data structure for projects

### 2. Services (Business Logic)
- `ProjectService`: Handles project-related business logic, such as setting the current project, restoring project state, and opening projects

### 3. UI (User Interface)
- `StatusBarManager`: Manages the display and updates of status bar items
- `ProjectSelector`: Provides the project selector interface

### 4. Utils (Utility Functions)
- `workspaceUtils`: Handles reading and writing of workspace files
- `projectUtils`: Provides project-related utility functions

## Configuration

The extension uses a `*.code-workspace` file to manage projects. Here's an example configuration:

```json
{
    "folders": [
        {
            "name": "workspace",
            "path": "./"
        }
    ],
    "settings": {
        "editor.fontSize": 14
    },
    "projectManager.projectList": {
        "project1": {
            "description": "project1 description",
            "folders": [
                {
                    "name": "project1",
                    "path": "/root/work/project1"
                }
            ],
            "settings": {
                "editor.fontSize": 14
            }
        },
        "project2": {
            "description": "project2 description",
            "folders": [
                {
                    "name": "project2 main",
                    "path": "/root/work/project2"
                },
                {
                    "name": "project2 verification",
                    "path": "/root/work/project2/verification"
                }
            ]
        }
    }
}
```

In this configuration:
- `folders`: Standard VS Code workspace folders
- `projectManager.projectList`: Custom project definitions that can be quickly switched to

Each project in `projectManager.projectList` can define:
- `description`: A description of the project
- `folders`: An array of folder objects with `name` and `path`
- `settings`: Project-specific settings (optional)

## Installation and Usage

1. Install this extension in VS Code
2. The extension will automatically activate and show in the status bar
3. Click the status bar project icon to select a project to switch to

## Development

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Run tests
npm test
```

## License

MIT