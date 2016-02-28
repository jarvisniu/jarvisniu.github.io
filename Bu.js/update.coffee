###
更新Bu.js流程

手动方案
1. 复制build和examples过来
2. 删除这俩里面的所有gitignore
3. 移出index.html
4. hashPath = location.hash.replace("#!/", ""); => "" 改为 "examples/"
5. logo.src = "../logo.png" -> "./logo.png"
6. 删除examples里所有jade
7. 删除examples/lib/**/*.coffee
8. 删除examples/vue/**/*.styl

Gulp方案
1. 复制examples/*.html|*.js|, examples/assets/**/*.*
###
