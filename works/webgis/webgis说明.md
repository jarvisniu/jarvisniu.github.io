WebGL三维地形显示技术
===================

## 文件

### JS库文件

#### BjCameraController.js
响应鼠标操作，控制相机（pMatrix与mvMatrix的变换）。

#### BjFile.js
从后台加载文件的接口函数，以及文件名、文件路径处理函数。

#### BjWebGL.js
对着色器、缓存、材质的封装。

#### Geography.js
地理坐标、图块索引、局部坐标之间的相互转换。

#### svgCompass.js
指北针控件。

#### TaskScheduler.js
任务调度器。目的是为了把集中的任务分解、延迟执行，来提升页面刷新频率，也就是流畅度。

### basic.html文件

该文件中包含了两个未保存到js文件中的两个类：


#### TileNode

保存一个地图块所涉及的所有信息。
其中包括：纹理、顶点位置Buffer、异步加载高程纹理的一些函数。


#### TileBuffer

TileNode管理器。它的职能有：

1. 向`DrawScene()`函数提供`TileNode`。
2. 当第一次索取某个TileNode时，拿出该TileNode的父TileNode的四分之一临时顶替。然后去后台加载需要的块，完成后再马上通知DrawScene()再次刷新。
3. 缓存所有已经加载的TileNode。缓存的优势在于：当用户由1级放大到2级，再回到1级的时候，不需要再从后台读取。这种操作往往是很常见的，因此很有必要这样做。

## 原理

具体细节请参考PPT。
本框架为了提高WebGL显示地形的流畅度采用了以下技术（缺一不可）：

1. 异步加载
2. 补间动画
3. LOD
4. 任务调度

其中第四项任务调度在PPT中未提及，在此特别做出解释：

这里的任务调度仅仅指将多个原本需要一起执行的任务拆散、然后排成队列依次延时执行。留出CPU空隙供刷新页面，提升流畅性。

本例在两个地方用到了这个模块：

#### 1.发起图片加载请求

原来写法：

    textureImage["src"] = getTileImageFileName(x, y, z);

用调度器延迟执行的写法：

    taskScheduler.addTask(textureImage, "src", getTileImageFileName(x, y, z));

#### 2.发起加载高程请求

原来写法：

    loadUrlAsync(url, createTerrain, [x, y, z]);

用调度器延迟执行的写法：

    taskScheduler.addTask(loadUrlAsync, [url, createTerrain, [x, y, z]]);
    