/*  filename: jsDrawLib.js
    Core lib for jsDrawlib
 
    Created by BJ Niu 2013-03-27 Modified 2013-04-05 Based on Dr.Wei
*/

/*
    @fmH : Canvas高度
    @fmW : Canvas宽度
*/
var i,j;
var margin=50;
var Unit="";
var multipleLine=false;

var isMouseDown=false;                  //鼠标是否按在画布上
var isMouseOnReset=false;               //鼠标是否按在重置按钮上
var idx=0;                              //画第几条线

var pointMouse=new Object();            //记录鼠标随时的位置
var pointMouseDown=new Object();        //记录鼠标按下的位置
var pointMouseUp=new Object();          //记录鼠标松开的位置
var pointMousePan=new Object();         //记录鼠标平移的位置
var isPanCanvas=false;                  //是否在执行平移
var drawXdeltaPerPx=0;
var drawYdeltaPerPx=0;

var catchLineIndex=-1;                  //捕捉到第几条线
var catchPointIndex =-1;                //捕捉到第几个点

var Xmax,Xmin,Ymax,Ymin;                //X、Y方向的最大、最小值
var Xdelta,Ydelta;                      //坐标轴上单段刻度代表的值
var Records=Array();                    //图上要画几条线，线数为Nb
var Clr=Array();                        //线条的颜色

var needReset=false;                    //是否需要重置按钮
var sizeResetX=80;                      //重置按钮的宽
var sizeResetY=27;                      //重置按钮的高
function posResetX(){return fmW-margin - 80.5;}//Y位置
var posResetY=7.5;                      //重置按钮的Y位置


function inidraw(StrP,NP,NbP,idxP,uP)
{
    idx=idxP-1;
    if (idx==-1) multipleLine=true;
    dealData(StrP,NP,NbP);
    iniColor();
    Unit=uP;
}
function draw()
{
    addEvents();
    canvas=document.getElementById('jsCanvas');
    ctx=canvas.getContext('2d');
    setYMaxMin();
    redraw();
}
function addEvents(){
    canvas=document.getElementById('jsCanvas');
    canvas.onmousemove=canvas_onMouseMove;
    canvas.onmousedown=canvas_onMouseDown;
    canvas.onmouseup=canvas_onMouseUp;
    canvas.oncontextmenu=function(){return(false)};
    canvas.onmouseout=canvas_onMouseOut;
    canvas.onmousewheel=canvas_onMouseWheel;
}
function canvas_onMouseDown(e)
{
    isMouseDown=true;
    if (e.button==2) isPanCanvas=true;
    else isPanCanvas=false;
    
    pointMouseDown.X=e.clientX-8;
    pointMouseDown.Y=e.clientY-8;
    pointMousePan.X=e.clientX-8;
    pointMousePan.Y=e.clientY-8;
    redraw();
}
function canvas_onMouseMove(e)
{
    pointMouse.X=e.clientX-8;
    pointMouse.Y=e.clientY-8;
    
    //执行平移操作
    if(isPanCanvas)
    {
        var Xvalue=(pointMouse.X-pointMousePan.X)*drawXdeltaPerPx;
        var Yvalue=(pointMouse.Y-pointMousePan.Y)*drawYdeltaPerPx;
        Xmin-=Xvalue; Xmax-=Xvalue;
        Ymin-=Yvalue; Ymax-=Yvalue;
        pointMousePan.X=e.clientX-8;
        pointMousePan.Y=e.clientY-8;
        needReset=true;
    }
        
    if (pointMouse.X>posResetX() && pointMouse.X < posResetX() + sizeResetX 
        && pointMouse.Y > posResetY && pointMouse.Y < posResetY+sizeResetY )
        isMouseOnReset=true;
    else
        isMouseOnReset=false;
        
    catchPoint();
    redraw();
}
function canvas_onMouseUp(e)
{
    isMouseDown=false;
    pointMouseUp.X=e.clientX-8;
    pointMouseUp.Y=e.clientY-8;
    
    if (isMouseOnReset) setYMaxMin();
    if (!isClose(pointMouseUp.Y, pointMouseDown.Y,5) 
        && !isClose(pointMouseUp.X, pointMouseDown.X,5) 
        && !isPanCanvas)zoomCanvas();
    isPanCanvas=false;
    redraw();
}
function canvas_onMouseOut(e)
{
    isMouseDown=false;
    indexMouseOnSwitch=-1;
    redraw();
}
function canvas_onMouseWheel(e)
{
    //获取鼠标坐标百分比
    var perMouseX = (pointMouse.X-margin)/(fmW-margin*2);
    var perMouseY = (pointMouse.Y-margin)/(fmH-margin*2);
    
    //获取鼠标位置对应的值
    var mouseValueX = Math.round(Xmin + (Xmax-Xmin)*perMouseX);
    var mouseValueY = Ymax + (Ymin-Ymax)*perMouseY;
    if(e.wheelDelta > 0){
        //计算放大后的四个边值
        Ymax=(4*Ymax+mouseValueY)/5;
        Ymin=(4*Ymin+mouseValueY)/5;
        Xmax=(4*Xmax+mouseValueX)/5;
        Xmin=(4*Xmin+mouseValueX)/5;
    } else {
        //计算缩小后的四个边值
        Ymax=(Ymax*5-mouseValueY)/4;
        Ymin=(Ymin*5-mouseValueY)/4;
        Xmax=(Xmax*5-mouseValueX)/4;
        Xmin=(Xmin*5-mouseValueX)/4;
    }
    Ydelta=(Ymax-Ymin)*50/fmH;
    Xdelta=(Xmax-Xmin)*100/fmW;
    modifyYMaxMin();
    drawXdeltaPerPx=toValueX(2)-toValueX(1);
    drawYdeltaPerPx=toValueY(2)-toValueY(1);
    needReset=true;
    redraw();
    //alert(toDate(mouseValueX));
}
function iniColor(){
    Clr[0]="rgb(255, 0, 0)";
    Clr[1]="rgb(0, 255, 0)";
    Clr[2]="rgb(0, 0, 255)";
    
    Clr[3]="rgb(0, 128, 128)";
    Clr[4]="rgb(128, 0, 128)";
    Clr[5]="rgb(128, 128, 0)";
    
    Clr[6]="rgb(128, 64, 64)";
    Clr[7]="rgb(64, 128, 64)";
    Clr[8]="rgb(64, 64, 128)";
    
    Clr[9]="rgb(192, 64, 0)";
    Clr[10]="rgb(192, 0, 64)";
    Clr[11]="rgb(64, 192, 0)";
    Clr[12]="rgb(0, 192, 64)";
    Clr[13]="rgb(64, 0, 192)";
    Clr[14]="rgb(0, 64, 192)";
}
function redraw()
{
    ctx.font="14px Simsun";
    ctx.clearRect(0,0,fmW,fmH);
    drawLine();
    clearMargin();        //清空外边界
    drawZoomRect();        //画缩放框
    if (needReset) drawResetButton();    //重置按钮
    drawGrid();        //刻度及网格
    drawUnit();        //画单位
    drawCatchPoint();    //显示鼠标所指的点信息
}

function catchPoint(){
    var from=0,to=Nb-1;
    catchPointIndex =-1;
    catchPointIndex =-1;
    
    if (!multipleLine) from=idx,to=idx+1;
    for (j=from; j<to; j++) {
        for (i=0; i<N; i++) {
            if(isClose(toDrawY(Records[i].Ys[j]),pointMouse.Y,8)
                && isClose(toDrawX(Records[i].X),pointMouse.X,8)){
                catchLineIndex=j;
                catchPointIndex =i;
                break;
            }
        }
    }
}
function isClose(n1,n2,pri)
{
    if(n1-n2>-pri && n1-n2<pri)return true;
    else return false;
}
function dealData(){
    for (j=0; j<N; j++) {
        Records[j] = new Object();
        Records[j].DT=Str[j*Nb];
        Records[j].X=toMs(Str[j*Nb]);
        Records[j].Ys=Array();
        for (i=1; i<Nb; i++) {
            Records[j].Ys[i-1] = new Number(Str[j*Nb+i]);
        }
    }
}
function setYMaxMin()
{
    Ymin=9999999999999;
    Ymax=-999999999999;
    Xmin=9999999999999;
    Xmax=-999999999999;
    for(j=0;j<N;j++){
        Xmin=Math.min(Xmin,Records[j].X);
        Xmax=Math.max(Xmax,Records[j].X);
        var from=0,to=Nb-1;
        if (!multipleLine) from=idx,to=idx+1;
        for (i=from; i<to; i++) {
            Ymin=Math.min(Ymin,Records[j].Ys[i]);
            Ymax=Math.max(Ymax,Records[j].Ys[i]);
        }
    }
    Ydelta=(Ymax-Ymin)*50/fmH;
    Xdelta=(Xmax-Xmin)*100/fmW;
    modifyYMaxMin();
    needReset=false;
    drawXdeltaPerPx=toValueX(2)-toValueX(1);
    drawYdeltaPerPx=toValueY(2)-toValueY(1);
}
function modifyYMaxMin()
{
    Ydelta=Ydelta.toExponential(0);    //近似Delta为一位
    var strSplits=Ydelta.split("e");
    if (strSplits[0]>2) strSplits[0]="5";
    Ydelta=new Number(strSplits[0]+"e"+strSplits[1]);
    var YmaxT=Math.round(Ymax/Ydelta)*Ydelta;
    var YminT=Math.round(Ymin/Ydelta)*Ydelta;
    
    if(Ymax > YmaxT || Math.abs(Ymax - YmaxT)<0.000001)
        Ymax=YmaxT+Ydelta;
    else
        Ymax=YmaxT;
        
    if(Ymin < YminT || Math.abs(Ymin - YminT)<0.000001)
        Ymin=YminT-Ydelta;
    else if(Ymin > YminT)
        Ymin=YminT;
}
function zoomCanvas()
{
    Ymin=Math.min(toValueY(pointMouseDown.Y),toValueY(pointMouseUp.Y));
    Ymax=Math.max(toValueY(pointMouseDown.Y),toValueY(pointMouseUp.Y));
    Ydelta=(Ymax-Ymin)*50/fmH;
    
    Xmin=Math.min(toValueX(pointMouseDown.X),toValueX(pointMouseUp.X));
    Xmax=Math.max(toValueX(pointMouseDown.X),toValueX(pointMouseUp.X));
    Xdelta=(Xmax-Xmin)*100/fmW;
    modifyYMaxMin();
    drawXdeltaPerPx=toValueX(2)-toValueX(1);
    drawYdeltaPerPx=toValueY(2)-toValueY(1);
    needReset=true;
}
function drawGrid()
{
    ctx.strokeStyle="rgb(0,0,0)";
    //画坐标系外边框
    ctx.strokeRect(margin,margin,fmW-margin*2,fmH-margin*2);
    
    ctx.strokeStyle="rgba(0,0,0,0.5)";
    //画Y轴刻度
    var countY=Math.round((Ymax-Ymin)/Ydelta)+1;
    var needFix=0;
    if(Ydelta.toString().indexOf(".")>0)needFix=Ydelta.toString().length-2;
    for (i=0; i<countY; i++)
    {
        ctx.beginPath();
        ctx.moveTo(margin,toDrawY(Ymin+Ydelta*i));
        ctx.lineTo(fmW-margin*1,toDrawY(Ymin+Ydelta*i));
        ctx.stroke();
        var thisStr=pre(i*Ydelta+parseFloat(Ymin))
        if(needFix)thisStr=thisStr.toFixed(needFix);
        thisStr=thisStr.toString();
        ctx.fillText(thisStr,(6-thisStr.length)*7,toDrawY(Ymin+Ydelta*i)+4);
    }
    //画X轴刻度
    var countX=Math.ceil((Xmax-Xmin)/Xdelta);
    Xdelta = (Xmax-Xmin)/countX;
    for (i=0; i<countX+1; i++)
    {
        ctx.beginPath();
        ctx.moveTo(toDrawX(Xmin+Xdelta*i),margin);
        ctx.lineTo(toDrawX(Xmin+Xdelta*i),fmH-margin);
        ctx.stroke();
        var thisDTvalue=i*Xdelta+parseFloat(Xmin);
        if (Xdelta>86400000 && Xdelta<86400000*365)
        {
            ctx.fillText(toDate(thisDTvalue),toDrawX(Xmin+Xdelta*i)-30,fmH - margin/2-0);
        }
        else if (Xdelta<86400000)
        {
            ctx.fillText(toDate(thisDTvalue),toDrawX(Xmin+Xdelta*i)-30,fmH - margin/2-0);
            ctx.fillText(toTime(thisDTvalue),toDrawX(Xmin+Xdelta*i)-28,fmH-5);
        }
        else if (Xdelta>86400000*365)
        {
            ctx.fillText(toYear(thisDTvalue),toDrawX(Xmin+Xdelta*i)-28,fmH-5);
        }
    }
}
function drawUnit()
{
    ctx.fillText(Unit,margin-30,margin-25);
}
function drawLine(){
    //绘制拐点与折线
    ctx.lineWidth=2;
    ctx.fillStyle = "rgb(0, 0, 0)";
    var from=0,to=Nb-1;
    if (!multipleLine) from=idx,to=idx+1;
    for(j=from; j<to; j++){
        ctx.strokeStyle = Clr[j];
        ctx.beginPath();
        for (var i=0; i<N; i++) {
            var drawX = toDrawX(Records[i].X);
            var drawY = toDrawY(Records[i].Ys[j]);
            ctx.lineTo(drawX,drawY);
            ctx.fillRect(drawX-2,drawY-2,4,4);
        }
        ctx.stroke();
    }
    ctx.lineWidth=1;
}
function drawResetButton()
{
    if (isMouseDown)
        ctx.fillStyle="rgba(0,0,0,0.4)";
    else
        ctx.fillStyle="rgba(0,0,0,0.2)";
        
    if (isMouseOnReset)
    {
        ctx.fillRect(posResetX(),posResetY,sizeResetX,sizeResetY);
    }
    
    ctx.strokeStyle="rgba(0,0,0,0.9)";
    ctx.strokeRect(posResetX(),posResetY,sizeResetX,sizeResetY);
    
    ctx.fillStyle="rgba(0,0,0,1)";
    ctx.fillText("重置",posResetX()+25,posResetY+18);
}
function drawZoomRect()
{
    if (!isMouseDown || isPanCanvas)return;
    ctx.strokeStyle="rgba(0,0,0,0.9)";
    ctx.strokeRect(pointMouseDown.X,pointMouseDown.Y,
        pointMouse.X-pointMouseDown.X,pointMouse.Y-pointMouseDown.Y);
}
function clearMargin()
{
    ctx.clearRect(0,0,fmW,margin-2);
    ctx.clearRect(0,0,margin-2,fmH);
    ctx.clearRect(fmW-margin*1+2,0,margin*1-2,fmH);
    ctx.clearRect(0,fmH-margin+2,fmW,margin-2);
}
function drawCatchPoint()
{
    if (catchPointIndex<0 || isMouseDown) return;
    var catchPointX=toDrawX(Records[catchPointIndex].X);
    var catchPointY=toDrawY(Records[catchPointIndex].Ys[catchLineIndex]);
    ctx.strokeStyle="rgb(0,0,0)";
    //把坐标针对框进行修正
    if (catchPointX>(fmW-margin*2-110)) catchPointX-=110;
    if (catchPointY>(fmH-margin*2-55)) catchPointY-=55;
    ctx.fillStyle="rgba(192,192,192,0.8)";
    ctx.fillRect(catchPointX,catchPointY,108,53);
    ctx.strokeRect(catchPointX,catchPointY,108,53);
    ctx.fillStyle="rgba(0,0,0,1)";
    ctx.fillText(Records[catchPointIndex].Ys[catchLineIndex], catchPointX+16,catchPointY+22);
    ctx.fillText(Records[catchPointIndex].DT.substring(0,10), catchPointX+16,catchPointY+43);
}
function toMs(t) {
    var dt=new Date(t);
    return dt.getTime();
}
function toDate(ms) {
    var dt=new Date(ms);
    return(dt.getYear()+1900+"/"+(dt.getMonth()+1)+"/"+dt.getDate());
}
function toYear(ms) {
    var dt=new Date(ms);
    return(dt.getYear()+1900);
}
function toTime(ms) {
    var dt=new Date(ms);
    return(dt.getHours()+":"+(dt.getMinutes())+":"+dt.getSeconds());
}
function toDrawX(valueX)
{
    return (fmW - margin*2)*(valueX-Xmin)/(Xmax-Xmin)+margin;
}
function toDrawY(valueY)
{
    return (fmH-margin)-(fmH - margin*2)*(valueY-Ymin)/(Ymax-Ymin);
}
function toValueX(drawX)
{
    return Math.floor((drawX-margin)*(Xmax-Xmin)/(fmW - margin*2)+Xmin);
}
function toValueY(drawY)
{
    return (fmH-margin-drawY)*(Ymax-Ymin)/(fmH - margin*2)+Ymin;
}
function pre(a)
{
    return parseFloat(a.toPrecision(5));
}