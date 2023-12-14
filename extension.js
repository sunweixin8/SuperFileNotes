const vscode = require('vscode');
const RenderNote = require('./utils/setNote.js');
const delNote = require('./utils/delNote.js');
const writeFile = require('./utils/writeFile.js');
const historyNote = require('./utils/historyNote.js');

async function activate(context) {
	let disposedList = [];

	// 打开项目，读取历史
	try {
		let historyList = await historyNote();
		// console.log(historyList);
		historyList.forEach((x) => {
			let registration = RenderNote(context, x);
			disposedList.push({
				path: x.path,
				registration: registration,
			});
		});
	} catch (error) {
		vscode.window.showInformationMessage('恢复备注时出现了异常', error);
	}

	// 注册命令 'addRemark'
	let addRemark = vscode.commands.registerCommand('addRemark', async (uri) => {
		// 如果没有选择文件或文件夹，显示错误信息
		if (!uri || !uri.fsPath) {
			return;
		}

		// 获取当前打开的工作区
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders.length == 0) {
			vscode.window.showInformationMessage('当前没有工作区');
		} else if (workspaceFolders.length > 1) {
			vscode.window.showInformationMessage('当前工作区过多');
		}

		// 项目路径
		const projectPath = workspaceFolders[0].uri.fsPath;
		// 获取当前点击的绝对路径
		const absolutePath = uri.fsPath;
		// 获取当前点击的相对路径
		const relativePath = vscode.workspace.asRelativePath(uri.fsPath);
		// console.table({
		// 	项目路径: projectPath,
		// 	当前点击的绝对路径: absolutePath,
		// 	当前点击的相对路径: relativePath,
		// });
		if (projectPath == relativePath) {
			vscode.window.showInformationMessage('不能在根目录备注');
			return;
		}

		// 显示输入框，等待用户输入
		const userInput = await vscode.window.showInputBox({
			placeHolder: '输入备注...',
			prompt: '请输入:',
			value: '', // 初始值为空
		});

		// 检查用户是否输入了内容
		if (userInput == undefined) {
			// 用户取消了输入
			vscode.window.showInformationMessage('取消输入');
			return;
		}

		let createTime = new Date().toLocaleString().substring(2);
		let INFO = {
			text: userInput,
			path: absolutePath,
			time: createTime,
		};
		//设置单条
		let registration = RenderNote(context, INFO);
		// 存储
		writeFile(INFO);
		disposedList.push({
			path: absolutePath,
			registration: registration,
		});
	});
	// 注册命令 'delRemark'
	let delRemark = vscode.commands.registerCommand('delRemark', async (uri) => {
		// 如果没有选择文件或文件夹，显示错误信息
		if (!uri || !uri.fsPath) {
			return;
		}

		// // 获取文件信息
		// const fileInfo = await vscode.workspace.fs.stat(uri);
		// const fileInfoTypeName = fileInfo.type ==1?'文件':'文件夹';

		// 获取当前打开的工作区
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders.length == 0) {
			vscode.window.showInformationMessage('当前没有工作区');
		} else if (workspaceFolders.length > 1) {
			vscode.window.showInformationMessage('当前工作区过多');
		}

		// 项目路径
		const projectPath = workspaceFolders[0].uri.fsPath;
		// 获取当前点击的绝对路径
		const absolutePath = uri.fsPath;
		// 获取当前点击的相对路径
		const relativePath = vscode.workspace.asRelativePath(uri.fsPath);
		// console.table({
		// 	项目路径: projectPath,
		// 	当前点击的绝对路径: absolutePath,
		// 	当前点击的相对路径: relativePath,
		// });
		if (projectPath == relativePath) {
			vscode.window.showInformationMessage('不能在根目录备注');
			return;
		}

		// 弹出确认框
		const response = await vscode.window.showInformationMessage('确定要删除?', { modal: true }, '确定');
		if (response === '确定') {
			delNote(absolutePath, disposedList);
			vscode.window.showInformationMessage('已清除');
		}
	});

	// 将命令注册到上下文中
	context.subscriptions.push(addRemark, delRemark);
}

//当你的扩展被停用时，这个方法被调用
function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
