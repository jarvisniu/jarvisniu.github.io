function DateTimePicker(ele)
{
      var da,ti,yy,mm,dd,hh,mi,weeks = ["日","一","二","三","四","五","六"],
        ss,str,i,x,y,w,pRect=ele.parentNode.getBoundingClientRect();

      if (ele.readOnly) return 0;

      if (ele.value.length > 1) {
        w=ele.value.split(" ");
        da=w[0]; ti=w[1];
      } else{
        da=getCurrDate(1); ti=getCurrTime(1);
      }
      yy=new Number(da.split("/")[0]),mm=new Number(da.split("/")[1])-1,
      dd=new Number(da.split("/")[2]),hh=new Number(ti.split(":")[0]),
      mi=new Number(ti.split(":")[1]),ss=new Number(ti.split(":")[2]);
        
      divEle = document.getElementById("dtDiv");
      if (divEle != null) divEle.parentNode.removeChild(dtDiv);
      
      divEle=document.createElement("div"), divEle.setAttribute("id","dtDiv");
      divEle.style.position="absolute", divEle.style.backgroundColor="#dbdddd";
      divEle.style.border="solid 1px #AAA"; document.body.appendChild(divEle);
      
      x=ele.getBoundingClientRect().left, y=ele.getBoundingClientRect().top+24;
      //if (x>pRect.width-255) x=pRect.width+pRect.left-255-2;
      //if (y>pRect.height-228) y=pRect.height-228-2;
      divEle.style.left=x+"px", divEle.style.top=y+"px";
      //头部
      str='<div style="text-align:center;width:255px;">'
         +'<input type="button" onclick=goToday("'+ele.name+'"); value="今天">'
         +'<select id="yyI" onchange="printDate()">';
      for (i=-4; i<5; i++) {
        str += '<option value='+(yy+i)+(i==0?' selected':'')+'>'+(yy+i)+'</option>';
      }
      str += '</select><span>年</span><select id="mmI" onchange="printDate()">'
      for (i=-mm; i<12-mm; i++) {
        str +='<option value='+(mm+i)+(i==0?' selected':'')+'>'+(mm+i+1)+"</option>";
      }
      str += '</select><span>月</span><input type="button" onclick=clearDT("'+ele.name+'") value=清除>'
          +'</div><table id="tbCa" style="border:solid 1px #AAA;margin:auto;width:250px;">'
          +'<tr style="background-color:AAA;">';
      for (i=0; i<7; i++) str+='<td align="center"><label>周'+weeks[i]+'</label></td>';
      str += "</tr>";
      for (i=0; i<6; i++) {
        str += "<tr>";
        for (k=0; k<7; k++)
          str += '<td class="btntable" onclick=onClickDate("'+ele.name+'",this.innerHTML)></td>';
        str += '</tr>';
      }
      str += '</table><div style="text-align:center;"><select id=hhI>';
      for (i=0; i<24; i++) str += '<option>' + i + '</option>';
      str += '</select><span>时 </span><select id=miI>';
      for (i=0; i<60; i++) str += '<option>' + i + '</option>';
      str += '</select><span>分 </span><select id=ssI>';
      for (i=0; i<60; i++) str += '<option>' + i + '</option>';
      str += '</select><span>秒</span><input type="button" onclick=submitDT("'+ele.name+'",""); value="确定"></div>';
      divEle.innerHTML=str;
      document.getElementById("yyI").value=yy;
      document.getElementById("mmI").value=mm;
      document.getElementById("hhI").value=hh;
      document.getElementById("miI").value=mi;
      document.getElementById("ssI").value=ss;
      printDate();
}
function goToday(na)
{
    document.getElementsByName(na)[0].value=GetCurrDT(1,1);
    document.getElementById("dtDiv").parentNode.removeChild(dtDiv);
}
function clearDT(na)
{
    document.getElementsByName(na)[0].value="0";
    document.getElementById("dtDiv").parentNode.removeChild(dtDiv);
}
function onClickDate(na,ddP)
{
    if (ddP>0) { submitDT(na,ddP);}
}
function submitDT(na,ddP)
{
    var yy,mm,ddT,hh,mi,ss;
    if (ddP!=null && ddP.length > 0)
        ddT= ddP;
    else {
        var tD=new Number(document.getElementsByName(na)[0].value.split(" ")[0].split("/")[2]);
        if(tD>0)ddT=tD;
        else ddT=new Number(getCurrDate(0).split("-")[2]);
    }
    yy=document.getElementById("yyI").value;
    mm=new Number(document.getElementById("mmI").value)+1;
    hh=document.getElementById("hhI").value;
    mi=document.getElementById("miI").value;
    ss=document.getElementById("ssI").value;
    if (yy <10) yy="0"+yy; if (mm <10) mm="0"+mm; if (ddT <10) ddT="0"+ddT;
    if (hh <10) hh="0"+hh; if (mi <10) mi="0"+mi; if (ss <10) ss="0"+ss;
    document.getElementsByName(na)[0].value=yy+"/"+mm+"/"+ddT+" "+hh+":"+mi+":"+ss;
    document.getElementById("dtDiv").parentNode.removeChild(dtDiv);
}
function printDate()
{
    var str,block,dateNum,days=new Array(31,28,31,30,31,30,31,31,30,31,30,31),
        tY=document.getElementById("yyI").value,tM=document.getElementById("mmI").value;
    days[1] += (tY%100==0?(tY%400==0?1:0):(tY%4==0?1:0));
    for (i=1; i < 7; i++) {
        for (k=0; k < 7; k++) {
            block=document.getElementById("tbCa").rows[i].cells[k];
            dateNum=(i-1) * 7 + k - new Date(tY, tM, 1).getDay() + 1;
            if (dateNum>0 && dateNum <= days[tM]) str=dateNum;
            else str = "";
            block.className="btntable";
            block.innerHTML=str;
        }
    }
}