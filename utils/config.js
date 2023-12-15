const vscode = require('vscode');

// 项目路径
let projectPath = '';

// 获取当前打开的工作区
const workspaceFolders = vscode.workspace.workspaceFolders;
if (workspaceFolders) {
	if (workspaceFolders.length == 0) {
		vscode.window.showInformationMessage('当前没有工作区');
	} else if (workspaceFolders.length > 1) {
		vscode.window.showInformationMessage('当前工作区过多');
	}
	projectPath = workspaceFolders[0].uri.fsPath;
}
module.exports = {
	jsonName: 'file-note.json', //存储信息的json文件
	projectPath: projectPath, //项目路径
	projectPathFull: projectPath + '\\', //完整项目路径
};
