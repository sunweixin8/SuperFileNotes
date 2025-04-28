<div align="center">

# 👻 一个给文件及文件夹设置备注的插件 👻

<div align="left">

## 注意！！
“Super File Notes” 已弃用，因 <b>vscode插件规则更改</b> ，不得不启用一个新的拓展ID，以后仅维护这一个更新[“new Super File Notes”](https://marketplace.visualstudio.com/items/?itemName=xiaoxiaoyang.super-file-notes)。

## 前言-（废话）

在我的日常开发中经常会遇到一些棘手的项目名称，比如【稳进提质】【浙省事】【新湘事成】这些“究极简写”及“谐音梗”。给这些文件或文件夹起名英文文件名无疑是 🤣 画上的马——顶看不顶用 😅。起拼音名，当时是能看懂了，过一段时间：“阿巴阿巴，啥呀，这是”。

也有一段时间把文件名的备注啥的以树形的结构写在 Readme.md 里面，当时看起来“嗯···挺好”，一旦有一些急事过来，临时更改或者怎么样，就会忘记更新，后面再去更新就没了头绪，理起来也很费时间，😑 费心情！😒

🎉🎉🎉 于是诞生了这个小插件 🎉🎉🎉<br><br>

## 🔒 兼容性 🔒

💻 最近有 Mac 用户反应了一些问题。先对 Mac 用户说一声抱歉！因为作者我目前手上没有 Mac 电脑，所以暂时无法进行适配，望谅解！
<br>
💻 Windows 用户可以正常使用

## 🧧 打赏作者 🧧

#### 点击链接尽情打赏我把！[https://xiaoxiaoyang.top/?donate=true](https://xiaoxiaoyang.top/?donate=true) <br>

这个也是作者的博客，里面也有很多开发的其他工具、插件推荐、干活分享、技术分享哦~
<br>
创作不易，请支持原创！

## 📖 插件特点&使用方法 📖

✨ 给 📄 文件及 📁 文件夹设置 `备注` ，显示在资源管理器的 `文件名右侧` 。
<br> --- vscode 限制显示两个字符，移动到文件上会显示全部
<br>✨ 支持快捷键 `ctrl + M` 快捷添加备注。
<br> --- 快捷键支持在 `键盘快捷方式` 中自定义（删除备注使用快捷键容易误触产生不可逆操作，故未设置快捷键）
<br>✨ 支持查看单条备注
<br>✨ 支持一键查看所有备注
<br>✨ 支持 `文件` `文件夹` 重命名后`同步备注`
<br>✨ 支持 `文件` `文件夹` 移动位置后`同步备注`
<br>✨ 推荐在 `.gitignore` 文件中把 `.vscode` 文件夹取消忽略提交，这样在多人协同项目时，都可以看到文件备注。
<br>✨ 使用方法看图 [图片查看不了？](https://marketplace.visualstudio.com/items?itemName=xiaoxiaoyang.remark)
![操作图示](image/image.png)

## 注意事项

- 💀 使用 `windows 文件管理器` / `mac 访达`（而非 VSCode）进行文件移动，这种情况下 VSCode 事件无法捕捉到，会导致备注失效。`So：请尽量在 vscode 内操作文件。`

## 已知问题

- 💀 文件夹在特定场景下备注不会显示

  Q: 如果文件夹内的文件包含未提交的文件 或其中有文件存在错误（git）
  vscode 会提示 `包含强调项` ，由于该提示权限较高，无法更改，暂时没有找到理想的解决办法<br>
  A: 可 `右击查看备注` 或 `git提交修改后` 即可正常显示。
  ![错误图示：图片查看不了，通过链接查看https://marketplace.visualstudio.com/items?itemName=xiaoxiaoyang.remark](image/image1.png)

## 其他

- 备注的数据存储在`/.vscode/file-notes.json` 中
- 手动更改 `file-notes.json` 需重启 vscode 才能生效
