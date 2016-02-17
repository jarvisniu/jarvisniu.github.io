###
自动更新Bu.js示例的脚本
1. 删除这里除update.coffee和run8080.bat之外的所有文件
2. 复制examples, lib, logo.png和src内的除.jade, .styl和.gitignore
3. 移动index.html和style到root
4. hashPath = location.hash.replace("#!/", ""); => "" 改为 "examples/"
###
