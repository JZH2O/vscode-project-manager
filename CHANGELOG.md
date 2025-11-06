# Changelog

## [1.1.0] - 2024-11-03

### Changed

- Changed project list storage from global settings to work.code-workspace file
- Added support for project group management
- Removed projectManager.projectList configuration item

## [1.2.0] - 2024-11-03

### Added

- Support for adding multiple folders to a single project
- Project configuration supports folders field to specify multiple folders included in the project
- Multiple folders can be selected when adding a project

### Improved

- Preserved existing folders configuration in work.code-workspace file
- Optimized project selection and opening logic to support multi-folder projects

## 1.0.0

- Initial release
- Implemented project adding, selection, and opening functionality
- Supported managing project list through VS Code settings