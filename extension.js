const vscode = require('vscode');

function activate(context) {
	// 注册命令 'setRemark'
	let disposable = vscode.commands.registerCommand('setRemark', async (uri) => {
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
		// 获取当前点击的相对路径
		const relativePath = vscode.workspace.asRelativePath(uri.fsPath);
		console.table({
			项目路径: projectPath,
			当前点击的相对路径: relativePath,
		});
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

		// 创建状态栏项
		let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
		statusBarItem.text = userInput; // 设置要显示的文本
		statusBarItem.show(); // 显示状态栏项
	});

	// 将命令注册到上下文中
	context.subscriptions.push(disposable);
}

//当你的扩展被停用时，这个方法被调用
function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
