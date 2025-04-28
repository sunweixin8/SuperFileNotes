const vscode = require('vscode');
const RenderNote = require('./utils/setNote.js');
const delNote = require('./utils/delNote.js');
const getNote = require('./utils/getNote.js');
const writeFile = require('./utils/writeFile.js');
const historyNote = require('./utils/historyNote.js');
const $config = require('./utils/config.js');
const RemarkTreeProvider = require('./utils/treeViewProvider.js');
const path = require('path');

function alertAndCopy(message) {
	vscode.window.showInformationMessage(message, { modal: true });
}

async function activate(context) {
	// 存储对象列表
	let disposedList = [];
	// 项目路径
	const projectPath = $config.projectPathFull;

	// 初始化树视图 - Using the correct path format for the OS
	const workspaceRoot = projectPath.slice(0, -1); // Remove trailing slash/backslash
	const remarkTreeProvider = new RemarkTreeProvider(workspaceRoot);
	const treeView = vscode.window.registerTreeDataProvider('superFileNotes.remarkTreeView', remarkTreeProvider);

	// 刷新备注的函数
	async function refreshAllNotes() {
		try {
			// 清除所有现有的装饰器
			disposedList.forEach(item => {
				if (item.registration && typeof item.registration.dispose === 'function') {
					item.registration.dispose();
				}
			});
			disposedList = [];
			
			// 重新读取备注文件并应用所有备注
			let historyList = await historyNote();
			historyList.forEach((x) => {
				let registration = RenderNote(context, x);
				disposedList.push({
					path: x.path,
					registration: registration,
				});
			});
			
			// 刷新树视图
			remarkTreeProvider.refresh();
			
			vscode.window.showInformationMessage('备注已刷新');
		} catch (error) {
			console.log('文件备注插件:刷新备注时出现了异常', error);
			vscode.window.showErrorMessage('刷新备注时出现错误: ' + error.message);
		}
	}

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
		console.log('文件备注插件:恢复备注时出现了异常', error);
	}

	// 注册命令 'addRemark'
	let addRemark = vscode.commands.registerCommand('addRemark', async (uri) => {
		console.clear();
		// 获取当前活动的文本编辑器,如果有文本编辑器，获取其 URI;（快捷键触发）
		const activeEditor = vscode.window.activeTextEditor;
		if (!uri && activeEditor) {
			uri = activeEditor.document.uri;
		}

		// 如果没有选择文件或文件夹，显示错误信息
		if (!uri || !uri.fsPath) {
			return;
		}

		// 获取当前点击的相对路径
		const relativePath = vscode.workspace.asRelativePath(uri.fsPath);
		if (projectPath == relativePath) {
			vscode.window.showInformationMessage('不能在根目录备注');
			return;
		}

		// 显示输入框，等待用户输入
		const userInput = await vscode.window.showInputBox({
			placeHolder: `给【${relativePath}】输入备注...`,
			prompt: '请输入:',
			value: '', // 初始值为空
		});

		// 检查用户是否输入了内容
		if (userInput == undefined) {
			// 用户取消了输入
			console.log('文件备注插件:用户取消了输入');
			// vscode.window.showInformationMessage('取消输入');
			return;
		}

		let createTime = new Date().toLocaleString().substring(2);
		let INFO = {
			text: userInput,
			path: relativePath,
			time: createTime,
		};
		//设置单条
		let registration = RenderNote(context, INFO);
		// 存储
		writeFile(INFO);
		disposedList.push({
			path: relativePath,
			registration: registration,
		});
		
		// 刷新树视图
		remarkTreeProvider.refresh();
	});
	// 注册命令 'delRemark'
	let delRemark = vscode.commands.registerCommand('delRemark', async (uri) => {
		// 如果没有选择文件或文件夹，显示错误信息
		if (!uri || !uri.fsPath) {
			return;
		}

		// 获取当前点击的相对路径
		const relativePath = vscode.workspace.asRelativePath(uri.fsPath);
		if (projectPath == relativePath) {
			vscode.window.showInformationMessage('不能在根目录备注');
			return;
		}

		// 弹出确认框
		const response = await vscode.window.showInformationMessage(`确定要删除【${relativePath}】的所有备注?`, { modal: true }, '确定');
		if (response === '确定') {
			delNote(relativePath, disposedList);
			
			// 刷新树视图
			remarkTreeProvider.refresh();
			
			vscode.window.showInformationMessage('已清除');
		}
	});
	// 注册命令 'viewRemark'
	let viewRemark = vscode.commands.registerCommand('viewRemark', async (uri) => {
		// 如果没有选择文件或文件夹，显示错误信息
		if (!uri || !uri.fsPath) {
			return;
		}

		// 获取当前点击的相对路径
		const relativePath = vscode.workspace.asRelativePath(uri.fsPath);
		if (projectPath == relativePath) {
			vscode.window.showInformationMessage('不能在根目录备注');
			return;
		}

		let html = '';
		let historyList = await historyNote();
		historyList.forEach((x, i) => {
			if (x.path == relativePath) {
				html += `
				\r\n♐备注: ${x.text}
				♐备注时间: ${x.time}
				`;
			}
		});
		// 如果为空
		if (html.length == 0) {
			html = `【${relativePath}】未设置备注`;
		} else {
			html = `【${relativePath}】共${historyList.length}条备注\r\n` + html;
		}
		// vscode.window.showInformationMessage(html, { modal: true });
		alertAndCopy(html);
	});
	// 注册命令 'viewAllRemark'
	let viewAllRemark = vscode.commands.registerCommand('viewAllRemark', async (uri) => {
		// 如果没有选择文件或文件夹，显示错误信息
		if (!uri || !uri.fsPath) {
			return;
		}

		let html = '';
		let historyList = await historyNote();
		historyList.forEach((x, i) => {
			html += `${i + 1}.路径：${x.path}--备注:${x.text}\r\r`;
		});
		alertAndCopy(html);
	});

	// 注册命令 'refreshRemark'
	let refreshRemark = vscode.commands.registerCommand('refreshRemark', async (uri) => {
		await refreshAllNotes();
	});

	// 注册命令 'superFileNotes.refreshRemarkTree'
	let refreshRemarkTree = vscode.commands.registerCommand('superFileNotes.refreshRemarkTree', async () => {
		remarkTreeProvider.refresh();
		vscode.window.showInformationMessage('备注列表已刷新');
	});

	// 注册从树视图打开文件的命令
	let openFile = vscode.commands.registerCommand('superFileNotes.openFile', async (treeItem) => {
		if (treeItem && treeItem.filePath) {
			const uri = vscode.Uri.file(treeItem.filePath);
			await vscode.commands.executeCommand('vscode.open', uri);
		}
	});

	// 注册从树视图查看备注的命令
	let viewRemarkFromTree = vscode.commands.registerCommand('superFileNotes.viewRemarkFromTree', async (treeItem) => {
		if (treeItem && treeItem.filePath) {
			// 获取相对路径
			const relativePath = vscode.workspace.asRelativePath(treeItem.filePath);
			
			let html = '';
			let historyList = await historyNote();
			// 处理正反斜杠差异，确保能找到对应的备注
			const fileRemarks = historyList.filter(x => {
				const xPath = x.path.replace(/\\/g, '/');
				const relPath = relativePath.replace(/\\/g, '/');
				return xPath === relPath;
			});
			
			fileRemarks.forEach((x, i) => {
				html += `
				\r\n♐备注: ${x.text}
				♐备注时间: ${x.time}
				`;
			});
			
			// 如果为空
			if (fileRemarks.length === 0) {
				html = `【${relativePath}】未设置备注`;
			} else {
				html = `【${relativePath}】共${fileRemarks.length}条备注\r\n` + html;
			}
			
			alertAndCopy(html);
		}
	});

	// 注册从树视图删除备注的命令
	let deleteRemarkFromTree = vscode.commands.registerCommand('superFileNotes.deleteRemarkFromTree', async (treeItem) => {
		if (treeItem && treeItem.filePath) {
			// 获取相对路径
			const relativePath = vscode.workspace.asRelativePath(treeItem.filePath);
			
			// 弹出确认框
			const response = await vscode.window.showInformationMessage(`确定要删除【${relativePath}】的所有备注?`, { modal: true }, '确定');
			if (response === '确定') {
				// 处理正反斜杠差异
				let normalizedPath = relativePath.replace(/\\/g, '/');
				delNote(normalizedPath, disposedList);
				
				// 刷新树视图
				remarkTreeProvider.refresh();
				
				vscode.window.showInformationMessage('已清除');
			}
		}
	});

	// 注册文件重命名事件监听器
	const renameFilesDisposable = vscode.workspace.onDidRenameFiles((event) => {
		// 处理文件重命名事件
		const renamedFiles = event.files;

		renamedFiles.forEach(async (x) => {
			let newPath = x.newUri.fsPath.replace(projectPath, '').replace(/\\/g, '/');
			let oldPath = x.oldUri.fsPath.replace(projectPath, '').replace(/\\/g, '/');
			console.log('监听到了移动', { newPath, oldPath });

			let fileStat = await vscode.workspace.fs.stat(x.newUri);
			let isDir = fileStat.type === vscode.FileType.Directory;
			console.log('是否是文件夹', isDir);

			if (isDir) {
				let historyList = await historyNote();
				historyList.forEach(async (x, i) => {
					// ==0,才是正确的路径
					if (x.path.indexOf(oldPath) == 0) {
						let newNoteInfo = {
							text: x.text,
							path: x.path.replace(oldPath, newPath),
							time: x.time,
						};
						//设置新的
						let registration = RenderNote(context, newNoteInfo);
						await writeFile(newNoteInfo);
						disposedList.push({
							path: newPath,
							registration: registration,
						});
						// 删除老的
						await delNote(x.path, disposedList);
					}
				});
			} else {
				let oldNoteList = getNote(oldPath);
				// console.log('读取到了老的', oldNoteList);
				oldNoteList.forEach(async (x) => {
					let newNoteInfo = {
						text: x.text,
						path: newPath,
						time: x.time,
					};
					// console.log({ newNoteInfo });
					//设置新的
					let registration = RenderNote(context, newNoteInfo);
					await writeFile(newNoteInfo);
					disposedList.push({
						path: newPath,
						registration: registration,
					});
					// 删除老的
					await delNote(oldPath, disposedList);
				});
			}
			
			// 刷新树视图
			remarkTreeProvider.refresh();
		});
	});

	// 将命令注册添加到订阅者列表
	context.subscriptions.push(
		addRemark,
		viewRemark,
		delRemark,
		viewAllRemark,
		refreshRemark,
		refreshRemarkTree,
		openFile,
		viewRemarkFromTree,
		deleteRemarkFromTree,
		renameFilesDisposable,
		treeView
	);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
