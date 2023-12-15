const vscode = require('vscode');
const fs = require('fs');
const $config = require('./config.js');

/**
 * @param {*} noteObj 文件内容
 */
async function writeFile(noteObj) {
	// 获取文件名
	const fileName = $config.jsonName;
	// 获取当前打开的工作区根目录
	const rootPath = $config.projectPathFull;

	// 判断 .vscode 文件夹是否存在
	let dirPath = rootPath + '.vscode';
	if (!fs.existsSync(dirPath)) {
		// 创建 .vscode 文件夹
		fs.mkdirSync(dirPath);
	}

	// 拼接完整的文件路径
	const filePath = vscode.Uri.file(rootPath + '.vscode/' + fileName);

	let absolutePath = filePath.fsPath;
	let newContent = null;
	// 检查文件是否已存在
	if (fs.existsSync(absolutePath)) {
		// 文件已存在,写入新内容到文件
		// 读取old文件内容
		const fileContent = fs.readFileSync(absolutePath, 'utf-8');
		newContent = JSON.parse(fileContent);

		if (newContent instanceof Array) {
			newContent.push(noteObj);
			newContent = JSON.stringify(newContent);
			fs.writeFileSync(absolutePath, newContent);
			return;
		} else {
			vscode.window.showInformationMessage(`出现了异常写入失败，请检查${absolutePath}文件`);
			return;
		}
	}

	// 创建新文件
	newContent = [noteObj];
	newContent = JSON.stringify(newContent);
	fs.writeFileSync(absolutePath, newContent);
}
module.exports = writeFile;
