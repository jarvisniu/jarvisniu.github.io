###
自动更新Bu.js示例的脚本
1. 删除这里除logo.png, run8080.bat和update.coffee之外的所有文件
2. 复制examples和src
3. 移动index.html和style到root
4. hashPath = location.hash.replace("#!/", ""); => "" 改为 "examples/"
5. logo.src = "../logo.png" -> "./logo.png"
6. 删除所有.gitignore
7, 删除 examples/.jade, examples/vue/.styl
###
