const vscode = require('vscode');
const $config = require('./config.js');

class MyFileDecorationProvider {
	constructor(INFO) {
		this.text = INFO.text;
		this.path = INFO.path;
		this.time = INFO.time;
	}

	provideFileDecoration(uri, token) {
		// 项目路径
		const projectPath = $config.projectPathFull;

		// 创建一个文件装饰对象
		// console.log(uri);
		let relativePath = uri.fsPath.replace(projectPath, '').replace('\\', '/');
		// console.log(relativePath, this.path);
		if (relativePath == this.path) {
			// console.log(relativePath, this.path, this.text, '--------------------------------------------');
			let option = {
				badge: this.text.substring(0, 2),
				tooltip: `
\r\n♐备注: ${this.text}
♐备注时间: ${this.time}\r\n
`,
			};
			return option;
		}
		return null;
	}
}
function RenderNote(context, INFO) {
	// 注册文件装饰提供者
	const fileDecorationProvider = new MyFileDecorationProvider(INFO);
	const registration = vscode.window.registerFileDecorationProvider(fileDecorationProvider);
	context.subscriptions.push(registration);

	// 当文件资源视图可见时，触发更新
	vscode.window.onDidChangeVisibleTextEditors(() => {});

	// 返回对象，方便后续操作
	return registration;
}
module.exports = RenderNote;
