const vscode = require('vscode');
const fs = require('fs');
const $config = require('./config.js');

async function historyNote() {
	// 获取文件名
	const fileName = $config.jsonName;

	// 获取当前打开的工作区根目录
	const rootPath = vscode.workspace.rootPath;
	if (!rootPath) {
		vscode.window.showErrorMessage('没有打开任何工作区.');
		return;
	}
	// 判断 .vscode 文件夹是否存在
	let dirPath = rootPath + '/.vscode';
	if (!fs.existsSync(dirPath)) {
		// 创建 .vscode 文件夹
		fs.mkdirSync(dirPath);
	}

	// 拼接完整的文件路径
	const filePath = vscode.Uri.file(rootPath + '/.vscode/' + fileName);

	let absolutePath = filePath.fsPath;

	// 检查文件是否已存在
	if (fs.existsSync(absolutePath)) {
		// 文件已存在,写入新内容到文件
		// 读取old文件内容
		const fileContent = fs.readFileSync(absolutePath, 'utf-8');
		let list = JSON.parse(fileContent);
		return list;
	}
	return [];
}
module.exports = historyNote;
