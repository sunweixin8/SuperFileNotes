<div align="center">

# 👻 一个给文件及文件夹设置备注的插件 👻

<div align="left">

## 前言-（废话）

在我的日常开发中经常会遇到一些棘手的项目名称，比如【稳进提质】【浙省事】【新湘事成】这些“究极简写”及“谐音梗”。给这些文件或文件夹起名英文文件名无疑是 🤣 画上的马——顶看不顶用 😅。起拼音名，当时是能看懂了，过一段时间：“阿巴阿巴，啥呀，这是”。

也有一段时间把文件名的备注啥的以树形的结构写在 Readme.md 里面，当时看起来“嗯···挺好”，一旦有一些急事过来，临时更改或者怎么样，就会忘记更新，后面再去更新就没了头绪，理起来也很费时间，😑 费心情！😒

🎉🎉🎉 于是诞生了这个小插件 🎉🎉🎉<br><br>

## 🧧 打赏作者 🧧

#### 点击链接尽情打赏我把！[https://xiaoxiaoyang.top/?donate=true](https://xiaoxiaoyang.top/?donate=true) <br>

这个也是作者的博客，里面也有很多开发的其他工具、插件推荐、干活分享、技术分享哦~
<br>

## 插件特点-（使用方法）

✨ 给文件及文件夹设置备注，显示在资源管理器的文件名右侧。
<br> --- vscode 限制显示两个字符，移动到文件上会显示全部
<br>✨ 支持快捷键【ctrl + M】快捷添加备注。
<br> --- 快捷键支持在【键盘快捷方式】中自定义（删除备注使用快捷键容易误触产生不可逆操作，故未设置快捷键）
<br>✨ 支持一键查看所有备注
<br>✨ 推荐在【.gitignore】文件中把【.vscode】文件夹取消忽略提交，这样在多人协同项目时，都可以看到文件备注。
<br>✨ 使用方法看图 [图片查看不了？](https://marketplace.visualstudio.com/items?itemName=xiaoxiaoyang.remark)
![图片查看不了，通过链接查看https://marketplace.visualstudio.com/items?itemName=xiaoxiaoyang.remark](image/image.png)

## 已知问题

- 文件夹在特定场景下备注不会显示

  Q: 如果文件夹内的文件包含未提交的文件 或其中有文件存在错误
  vscode 会提示<b>包含强调项</b>，由于该提示权限较高，无法更改，暂时没有找到理想的解决办法<br>
  A: 提交或修改后即可正常显示。
  ![图片查看不了，通过链接查看https://marketplace.visualstudio.com/items?itemName=xiaoxiaoyang.remark](image/image1.png)

## 其他

- 备注的数据存储在/.vscode/file-notes.json 中
- 手动更改 file-notes.json 需重启 vscode 才能生效
