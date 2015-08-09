/*    file name: jsButtonLib-v1.0.js
      Library for js button table for input.
      version: 1.0

      Include in <head> as:
        <script type="text/javascript" src="/Script/jsButtonLib-v1.0.js"></script>

      26/06/2012 12/07/2012 by Y Duan */

var Sumup=0;                                      // for SumupInp

function FormStart(action,method,enctype)         // form start line
{                         // enctype is 'multipart/form-data' for file input type
      var str;

      str='<form';
      if (action) str += ' action="'+action+'"';
      if (method) str += ' method="'+method+'"';
      if (enctype) str += ' enctype="'+enctype+'"';
      
      return str+'>';
}
function FormEnd()                                // form end line
{
      return '</form>';
}

function ListBox(wid,cs,cap,pr,na,va,tx,chg,def,size)   // list box for single select
{                                 // wid,cs,na,va,tx must exist
      var i,j,k,w,w1,str="";      // let chg=DoNothing() if no chg

      if (cap) str += '<p>'+cap+'</p>';
      str += '<center><table class="button" style="width:'+wid+'px;">'  // wid
            +'<tbody class="block"><tr>';         // without scroll bar

      w=cs.split(":");            // cs is cols rate, 1st col is pr if pr>0
      nc=w.length;                // num of columes, 1 or 2
      for (i=j=0; i<nc; i++) {
        w[i]=parseFloat(w[i]);
        j += w[i];                                // total
      }
      if (pr) {
        k=(wid-1-nc)/j, --nc;                     // scaller, with pr
        i=Math.round(k*w[0]), j -= w[0];
        wid -= i, w[0]=w[1];                      // kick off w[0]
        str += '<th class="right" style="width:'+i+'px;">'+pr+':&nbsp</th>';
      }
      k=(wid-1-nc)/j;                             // scaller, without pr
      w1='style="width:'+Math.round(k*w[0])+'px;"';
      str += '<td class="left" '+w1+'><select '+w1+' name="'+na+'" onChange="';

      str += (chg) ? chg+';"' : 'TextInpChg(this);" textInp="0"';  // select:input

      if (size) str += ' size="'+size+'"';
      str += '>';

      for (i=0; i<va.length; i++) {
        str += '<option value="'+va[i]+'"';
        if (def && !(def-i-1)) str += ' selected';

        str += '>'+tx[i];
      }
      return str+'</select></td></tr></tbody></table></center>';
}
function DoNothing() { return; }                  // do nothing, for no chk in list box
function TextInpChg(ele)
{
      ele.setAttribute('textInp',1);              // change indicator
}

function InputBox(wid,row,cs,cap,ti,pr,na,va,len,chk,clk)   // table of text input
{                                 // wid,cs,na,len[] must exist
      var i,j,k,n,wpr,w,body,str="";

      if (cap) str += '<p>'+cap+'</p>';
      str += '<center><table class="button" style="width:'+wid+'px;">'; // wid

      w=cs.split(":");            // cs is cols rate, 1st col is pr if pr>0
      nc=w.length,n=len.length;   // num of columes, num of items for input
      for (i=j=0; i<nc; i++) {
        w[i]=parseFloat(w[i]);
        j += w[i];                                // total
      }
      if (pr) {
        k=(wid-1-nc)/j, --nc;                     // scaller, with pr
        i=Math.round(k*w[0]), j -= w[0];
        wpr='style="width:'+i+'px;"', wid -= i;
        for (i=0; i<nc; i++) w[i]=w[i+1];         // kick off w[0]
      }
      if (row && n/nc>row) {                      // scroll in y
        row *= 25, wid -= 15;                     // td height: 25px
        body='<tbody class="scrolly" style="height:'+row+'px">';
      } else
        body='<tbody class="block">';             // without scroll bar

      k=(wid-1-nc)/j;                             // scaller, without pr
      for (i=0; i<nc; i++) w[i]=Math.round(k*w[i]);

      if (ti) {                                   // title
        str += '<thead class="block"><tr>';
        if (pr) str += '<th class="btnobg" '+wpr+'></th>';  // blank

        for (j=0; j<nc; j++) 
          str += '<th class="center" style="width:'+w[j]+'px;">'+ti[j]+'</th>';

        str += '</tr></thead>';
      }
      str += body, i=k=0;
      while (n) {                                 // row
        str += '<tr id="'+i+'">';                 // id will be droped, do not use it
        if (pr) str += '<th class="right" '+wpr+'>'+pr[i]+':&nbsp</th>';
        for (j=0; j<nc && n; j++,k++,n--) {
          str += '<td class="left" style="width:'+w[j]+'px;">'
                +'<input type="text" style="width:'+w[j]+'px;" name="'+na+'['+k+']"'
                +' maxlength="'+len[k]+'" onChange="TextInpChg(this);"'
                +' onKeyDown="DisEnter(event,this);"';    // for change

          if (va && va[k]) str += ' value="'+va[k]+'"';             // default value
          if (chk && chk[k]) str += ' onBlur="'+chk[k]+'(this);"';  // format check
          if (clk && clk[k]) str += ' onClick="'+clk[k]+'(this);"'; // for DTpicker

          str += ' textInp="0"/></td>';                   // initial change indicator
        }
        str += '</tr>', ++i;
      }
      return str+'</tbody></table></center>';
}

function FileSelBox(wid,cs,cap,pr,na,va)          // file select, apply enctype in form
{                                  // wid,cs,na must exist
      var i,j,k,w,w1,str="",disp=na+'Sel';

      if (cap) str += '<p>'+cap+'</p>';
      str += '<input id="'+na+'" type="file" name="'+na+'" style="visibility:hidden"'
            +' onChange="dispFileName(this);" targ textInp="0"/>'       // file selection
            +'<center><table class="button" style="width:'+wid+'px;">'; // wid
            +'<tbody class="block"><tr>';         // without scroll bar

      w=cs.split(":");            // cs is cols rate, 1st col is pr if pr>0
      nc=w.length;                // num of columes, 1 or 2
      for (i=j=0; i<nc; i++) {
        w[i]=parseFloat(w[i]);
        j += w[i];                                // total
      }
      if (pr) {
        k=(wid-1-nc)/j, --nc;                     // scaller, with pr
        i=Math.round(k*w[0]), j -= w[0];
        wid -= i, w[0]=w[1];                      // kick off w[0]
        str += '<th class="right" style="width:'+i+'px;">'+pr+':&nbsp</th>';
      }
      k=(wid-1-nc)/j;                             // scaller, without pr
      w1='style="width:'+Math.round(k*w[0])+'px;"';
      str += '<td class="left" '+w1+'><input id="'+disp+'"; '+w1+' type="text"'
            +' onKeyDown="DisEnter(event,this);" value="';

      str += (va) ? va : '请点击此处选择文件';       // default value        
      str += '" onClick="simClkOnID(this,\''+na+'\');"/></td></tr>';
   
      return str+'</tbody></table></center>';
}
function simClkOnID(ele,id)
{
      var targ=document.getElementById(id);

      targ.setAttribute('targ',ele.id), targ.click();
}
function dispFileName(ele)
{
      var na=ele.value, index=na.lastIndexOf('\\')+1;
      var i,ty=na.substr(na.lastIndexOf(".")), targ=ele.getAttribute("targ");

      if (ty==".pdf" || ty==".jpg" || ty==".png" || ty==".doc" || ty==".xls" ||
          ty==".ppt" || ty==".docx" || ty==".xlsx" || ty==".pptx" || ty==".csv") {
        document.getElementById(targ).value=na.slice(index);

        TextInpChg(ele);                          // attribution

        ty=ele.form, na=ele.name;      
        for (i=0; i<ty.length; i++) {
          if (ty.elements[i].name == na) break;
        }
        ty.elements[i+2].focus();
      } else
        confirm("请选择pdf,jpg,png,doc,docx,ppt,xls文件。");
}

function InpAreaBox(wid,row,cs,cap,pr,na,va,len,resize)  // table of textarea
{                                  // wid,row,cs,na,len must exist
      var i,j,k,w,w1,str="";

      if (cap) str += '<p>'+cap+'</p>';
      str += '<center><table class="button" style="width:'+wid+'px;">'; // wid
            +'<tbody class="block"><tr>';         // without scroll bar

      w=cs.split(":");            // cs is cols rate, 1st col is pr if pr>0
      nc=w.length;                // num of columes, 1 or 2
      for (i=j=0; i<nc; i++) {
        w[i]=parseFloat(w[i]);
        j += w[i];                                // total
      }
      if (pr) {
        k=(wid-1-nc)/j, --nc;                     // scaller, with pr
        i=Math.round(k*w[0]), j -= w[0];
        wid -= i, w[0]=w[1];                      // kick off w[0]
        str += '<th class="right" style="width:'+i+'px;">'+pr+':&nbsp</th>';
      }
      k=(wid-1-nc)/j;                             // scaller, without pr
      w1='style="width:'+Math.round(k*w[0])+'px;';// no end " for resize
      str += '<td class="left" '+w1+'">'
            +'<textarea name="'+na+'" rows="'+row+'" onChange="TextInpChg(this);"'
            +' onKeyDown="DisEnter(event,this);" onBlur="ChkStr(this);"'
            +' maxlength="'+len+'" '+w1;

      str += (resize) ? '">' : 'resize:none">';

      if (va) str += va;                          // default value
      return str+'</textarea></td></tr></tbody></table></center>';
}
function SumupInp(wid,row,cs,cap,ti,pr,va,def,attr)  // table of checkbox input
{                                  // wid,cs,va[],def[] must exist
      var i,j,k,n,wpr,w,body,str="";

      if (cap) str += '<p>'+cap+'</p>';
      str += '<center><table class="button" style="width:'+wid+'px;">'; // wid

      w=cs.split(":");            // cs is cols rate, 1st col is pr if pr>0
      nc=w.length,n=va.length;    // num of columes, num of items for input
      for (i=j=0; i<nc; i++) {
        w[i]=parseFloat(w[i]);
        j += w[i];                                // total
      }
      if (pr) {
        k=(wid-1-nc)/j, --nc;                     // scaller, with pr
        i=Math.round(k*w[0]), j -= w[0];
        wpr='style="width:'+i+'px;"', wid -= i;
        for (i=0; i<nc; i++) w[i]=w[i+1];         // kick off w[0]
      }
      if (row && n/nc>row) {                      // scroll in y
        row *= 25, wid -= 15;                     // td height: 25px
        body='<tbody class="scrolly" style="height:'+row+'px">';
      } else
        body='<tbody class="block">';             // without scroll bar

      k=(wid-1-nc)/j;                             // scaller, without pr
      for (i=0; i<nc; i++) w[i]=Math.round(k*w[i]);

      if (ti) {                                   // title
        str += '<thead class="block"><tr>';
        if (pr) str += '<th class="btnobg" '+wpr+'></th>';  // blank

        for (j=0; j<nc; j++) 
          str += '<th class="center" style="width:'+w[j]+'px;">'+ti[j]+'</th>';

        str += '</tr></thead>';
      }
      str += body, i=k=0;
      while (n) {                                 // row
        str += '<tr>';
        if (pr) str += '<th class="right" '+wpr+'>'+pr[i]+':&nbsp</th>';
        for (j=0; j<nc && n; j++,k++,n--) {
          str += '<td class="leftInd" style="width:'+w[j]+'px;">'
                +'<input type="checkbox" value='+va[k]; 

          if (def && def[k]) str += ' checked';
          if (attr) str +=  ' textInp="0"';

          str += ' onClick="SumupClk(this);"/></td>';
        }
        str += '</tr>', ++i;
      }
      str += '</tbody></table></center>';

      return str+'<input type="hidden" name="Sumup" value="'+Sumup+'">';
}
function SumupClk(ele)                  // summary up for input by checkbox
{
      if (ele.checked)
        Sumup += parseInt(ele.value);
      else
        Sumup -= parseInt(ele.value);

      document.getElementsByName('Sumup')[0].value=Sumup;
      if (ele.getAttribute('textInp')) ele.setAttribute('textInp',1);
}

function ButtonSubmit(wid,na,va,chk)              // button submit with chk
{                             // chk: 0,no chk; >0,num of input request; <0,del
      var i,str;

      str='<table style="width:'+wid+'px" class="button"><tr><th>';
      for (i=0; i<va.length; i++) {
        str += '&nbsp&nbsp<input type="submit" name="'+na+'" value="'+va[i]+'"';
        if (chk && chk[i]) str += ' onClick="ChkTextInp(this,'+chk[i]+');"';

        str += '>';
      }
      return str+'</th></tr></table>';
}
function ChkTextInp(ele,k)
{                             // k: 0,no chk; >0,num of input request; <0,del
      var i,tx,form=ele.form;
                                                  // modify : input
      if (k < 0) {                                // delete button
        if (confirm("删除后无法恢复，你真的确定你要删除吗？")) return true;
      } else if (k) {                             // k=0: no check
        for (i=0; i<form.length; i++) {           // form elements
          if (form.elements[i].type == "submit") break;       // till submit button
          if ((tx=form.elements[i].getAttribute("textInp"))=="0" || !tx) continue;

          if (!(--k)) return true;
        }
        confirm("输入的数据不完整, 或修改的数据无变化, 不能提交。");
      }
      form.action="#";                            // no input, reload form
}

function HiddenBox(na,va)                         // Hidden input
{                                                 // va[] must exist
      var i,str='';

      for (i=0; i<va.length; i++)                 // num of ids
        str += '<input type="hidden" name="'+na+'['+i+']" value="'+va[i]+'">';

      return str;
}

function ChkInt(obj)
{
      var reg=/^[+-]?\d+$/;                       // judge integer

      if (!obj.value) return;       // disable chk if empty, temperate use, till find new way
      if (!reg.test(obj.value)) confirm("整数格式错误，有效格式: 0,6,+6,-6"),obj.focus();
}
function ChkUsInt(obj)
{
      var reg=/^[+]?\d+$/;                        // judge unsigned int

      if (!obj.value) return;       // disable chk if empty, temperate use, till find new way
      if (!reg.test(obj.value)) confirm("正整数格式错误，有效格式: 0,6,+6"),obj.focus();
}
function ChkReal(obj)
{
      var reg=/^[+-]?(\.?\d+|(0|[1-9]\d*)\.?)\d*$/; // judge float: 0,.0,0.,0.0

      if (!obj.value) return;       // disable chk if empty, temperate use, till find new way
      if (!reg.test(obj.value))
        confirm("实数格式错误，有效格式: 0,.0, 0., 0.0, -6.0"),obj.focus();
}
function ChkUsReal(obj)
{
      var reg=/^[+]?(\.?\d+|(0|[1-9]\d*)\.?)\d*$/;  // judge unsigned float

      if (!obj.value) return;       // disable chk if empty, temperate use, till find new way
      if (!reg.test(obj.value))
        confirm("正实数格式错误，有效格式: 0, .0, 0., 0.0, +6.0"),obj.focus();
}
function ChkLength(obj)
{
      var reg=/^(\.?\d+|(0|[1-9]\d*)([+-]\d{3})?\.?)\d*$/;

      if (!obj.value) return;       // disable chk if empty, temperate use, till find new way
      if (!reg.test(obj.value))
        confirm("桩号格式错误, 有效格式: 0+008, 1+008.2, 1-008.2, 8.2, 8"),obj.focus();
}
function ChkDateTime9099(obj)
{
      var reg=/^(199\d|20\d{2})\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

      if (!obj.value) return;       // disable chk if empty, temperate use, till find new way
      if (!reg.test(obj.value))
        confirm("日期时间格式: YYYY/MM/DD hh:mm:ss, 如 1990/12/30 23:59:00"),obj.focus();
}
function ChkDateTime(obj)
{                                   // allow '0' as dt
      var reg=/^(0|(\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):[0-5]\d:[0-5]\d))$/;

      if (!obj.value) return;       // disable chk if empty, temperate use, till find new way
      if (!reg.test(obj.value))
        confirm("日期时间格式: YYYY/MM/DD hh:mm:ss, 如 1990/12/30 23:59:00"),obj.focus();
}
function ChkDate9099(obj)
{
      var reg=/^(199\d|20\d{2})\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;

      if (!obj.value) return;       // disable chk if empty, temperate use, till find new way
      if (!reg.test(obj.value))
        confirm("日期格式: YYYY/MM/DD, 如 1990/12/30"),obj.focus();
}

function ChkName(obj)                             // check name, start with char
{
      var reg=/^[A-Za-z]+[A-Za-z0-9]*(-[A-Za-z0-9]+|_[A-Za-z0-9]+)?$/;  // F8_03 or F8-03

      if (!obj.value) return;       // disable chk if empty, temperate use, till find new way
      if (!reg.test(obj.value)) confirm("名称请勿以数字开始，'－'和'_'开始和结尾"),obj.focus();
}
function ChkStr(obj)                              // no "<,>,\"
{
      var reg=/[^<>\\\\]/;

      if (!obj.value) return;       // disable chk if empty, temperate use, till find new way
      if (!reg.test(obj.value)) confirm("请勿输入'<','>','\'字符"),obj.focus();
}
function ChkVector(obj)
{                                   // judge float: 0,1,.123
      var reg=/^[+-]?([01]\.?|0?\.\d+),[+-]?([01]\.?|0?\.\d+),[+-]?([01]\.?|0?\.\d+)$/;

      if (!obj.value) return;       // disable chk if empty, temperate use, till find new way
      if (!reg.test(obj.value))
        confirm("向量格式错误，有效格式: '0,1,0','0,-1,0','-.5,.5,0.5'"),obj.focus();
}

function ChkIntE(obj) { if (obj.value) return ChkInt(obj); }        // with empty
function ChkUsIntE(obj) { if (obj.value) return ChkUsInt(obj); }
function ChkRealE(obj) { if (obj.value) return ChkReal(obj); }
function ChkUsRealE(obj) { if (obj.value) return ChkUsReal(obj); }
function ChkLengthE(obj) { if (obj.value) return ChkLength(obj); }
function ChkNameE(obj) { if (obj.value) return ChkName(obj); }
function ChkStrE(obj) { if (obj.value) return ChkStr(obj); }
function ChkVectorE(obj) { if (obj.value) return ChkVector(obj); }

function DisEnter(evt,ele)                        // no key ENTER in text input box
{                                                 // tested for onKeyDwon,onKeyPress
      var i,form,na;

      if (evt.keyCode-13) return true;            // not a Enter

      if (evt.preventDefault)                     // DOM model
        evt.preventDefault(), evt.stopPropagation();
      else                                        // IE model
        evt.returnValue=false, evt.cancelBubble=true;
      
      form=ele.form, na=ele.name;      
      for (i=0; i<form.length; i++) {
        if (form.elements[i].type != "text") continue;

        if (form.elements[i].name == na) {
          form.elements[i+1].focus();
          return false;
        }
      }
      return false;                               // legacy event model, not make sense
}

function FindArryHostInd(host,arr,ind)
{                         // find arr in host by index start from 0, -1 if not exist
      var i,j,n,tr=Array();

      n=host.length;
      for (i=0; i<n; i++) tr[host[i]]=i+1;        // 0 for no exist in host

      n=arr.length;
      for (i=0; i<n; i++) ind[i] = (j=tr[arr[i]]) ? j-1 : -1;
}

function FindIdInd(id,k)
{                         // find index of k in id
      var i,n;

      n=id.length;
      for (i=0; i<n; i++) {                       // find k in id[]
        if (id[i] == k) return i+1;               // 0 means k is not exist in id
      }
      return 0;                                   // not exist
}

function FormDefault(rid,form,id)
{                         // fill default data from ViewTab, rid=0,1
      var domw=parent.frames["ViewTab"];
      var i,j,k,n,nb,ele,id1=Array(),str=Array(),ind=Array();

      ele=form.elements[0];                       // ele start
      if (rid) {                                  // modify exist
        ele.value=domw.na, ele.readOnly=true, ele.className="read";   // read only

        n=domw.n, nb=domw.nb, id1=domw.id, str=domw.str;  // data source
        FindArryHostInd(id,id1,ind);                      // index in id for id1

        for (i=i1=0; i<n; i++) {                  // i1 start from the 2nd in str
          if (ind[i] < 0)                         // not exist in form
            i1 += nb;
          else {
            k=1+(nb-1)*ind[i], ++i1;              // 1 for dt, nb is item length in str
            for (j=1; j<nb; j++) form.elements[k++].value=str[i1++];
          }
        }
      } else
        ele.focus();
}

function FormInfoVa(va)
{                         // default infor data from ViewTab 
      var i,j,n,domw=parent.frames["ViewTab"];

      va[0]=domw.na, n=domw.n;                    // name
      for (i=0,j=1; i-n; i++,j++) va[j]=domw.str[i];
      
      return domw.cur;                            // id
}

function SetFormFocus(rid,ele)
{                         // set form focus on ele, rid=0,1
      if (rid)                                    // modify exist
        ele.readOnly=true, ele.className="read";  // read only
      else
        ele.focus();
}
function SetFormRead(ele)
{                         // set form read only
      ele.readOnly=true, ele.className="read";    // read only
}

function iButtonSubmit(na,va)                     // inline submit button
{
      return '<input type="submit" name="'+na+'" value="'+va+'">';
}
function iClkButton(na,va,clk)                    // inline click button
{                                 // va,clk must exist
      return '<input type="button" name="'+na+'" value="'+va
            +'" onClick="'+clk+'(this);"/>';
}
function iListBox(na,va,tx,chg,def,size)   // list box for single select
{                                 // na,va,tx must exist
      var i,j,k,w,w1,str;

      str='<select name="'+na+'"';
      if (chg) str += ' onChange="'+chg+'(this);"';
      if (size) str += ' size="'+size+'"';
      str += '/>';

      for (i=0; i<va.length; i++) {
        str += '<option value="'+va[i]+'"';
        if (def == va[i]) str += ' selected';

        str += '>'+tx[i];
      }
      return str+'</select>';
}
function iClkTable(wid,row,cs,ti,pr,na,va,clk)   // inline click table
{                                 // wid,cs,na must exist
      var i,j,k,n,wpr,w,body,str;

      str='<table class="button" style="width:'+wid+'px;">'; // wid

      w=cs.split(":");            // cs is cols rate, 1st col is pr if pr>0
      nc=w.length,n=na.length;    // num of columes, num of items for input
      for (i=j=0; i<nc; i++) {
        w[i]=parseFloat(w[i]);
        j += w[i];                                // total
      }
      if (pr) {
        k=(wid-1-nc)/j, --nc;                     // scaller, with pr
        i=Math.round(k*w[0]), j -= w[0];
        wpr='style="width:'+i+'px;"', wid -= i;
        for (i=0; i<nc; i++) w[i]=w[i+1];         // kick off w[0]
      }
      if (row && n/nc>row) {                      // scroll in y
        row *= 25, wid -= 15;                     // td height: 25px
        body='<tbody class="scrolly" style="height:'+row+'px">';
      } else
        body='<tbody class="block">';             // without scroll bar

      k=(wid-1-nc)/j;                             // scaller, without pr
      for (i=0; i<nc; i++) w[i]=Math.round(k*w[i]);

      if (ti) {                                   // title
        str += '<thead class="block"><tr>';
        if (pr) str += '<th class="btnobg" '+wpr+'></th>';  // blank

        for (j=0; j<nc; j++) 
          str += '<th class="center" style="width:'+w[j]+'px;">'+ti[j]+'</th>';

        str += '</tr></thead>';
      }
      str += body, i=k=0;
      while (n) {                                 // row
        str += '<tr>';
        if (pr) str += '<th class="right" '+wpr+'>'+pr[i]+':&nbsp</th>';
        for (j=0; j<nc && n; j++,k++,n--) {
          str += '<td class="left" style="width:'+w[j]+'px;" name="'+na+'['+k+']"';

          if (va && va[k]) str += ' value="'+va[k]+'"';   // default value
          if (clk) str += ' onClick="'+clk+'(this);"';

          str += '/></td>';
        }
        str += '</tr>', ++i;
      }
      return str+'</tbody></table></center>';
}




function addZero(tmp){
      return (tmp < 10) ? "0"+tmp : tmp;
}
function getCurrDate(df)
{	                        // current date string. 0: 2012-03-26; 1: 2012/03/26
      var d=new Date(), yy=d.getYear()+1900;
      var mm=addZero(d.getMonth()+1), dd=addZero(d.getDate());

      return (!df) ? yy+"-"+mm+"-"+dd : yy+"/"+mm+"/"+dd;
}
function getCurrTime(ss)
{                         // current time string, 0: 12:05; 1: 12:05:34
      var d=new Date(), hh=addZero(d.getHours());
      var mm=addZero(d.getMinutes()), ss=addZero(d.getSeconds());

      return (!ss) ? hh+":"+mm : hh+":"+mm+":"+ss;
}
function GetCurrDT(df,ss)
{                         // get curr date time string
      return getCurrDate(df)+" "+getCurrTime(ss);
}

function chgDTbox(name)
{
      var va=document.getElementById("date").value.replace(/\-/g, "/");
      var dtDiv=document.getElementById("dtDiv");
      var ele=document.getElementsByName(name)[0];

      if (va > "0") va += ' '+document.getElementById("time").value;

      ele.value=va, ele.setAttribute('textInp',1);  // change indicator;
      dtDiv.parentNode.removeChild(dtDiv);    //delete DTpicker
}

function chgDateBox(name)
{
      var va=document.getElementById("date").value.replace(/\-/g, "/");
      var dtDiv=document.getElementById("dtDiv");
      var ele=document.getElementsByName(name)[0];

      ele.value=va, ele.setAttribute('textInp',1);  // change indicator;
      dtDiv.parentNode.removeChild(dtDiv);    //delete DTpicker
}
var inpEl,divEl;selDate=new Date();
function calendar(objInp,objDiv)
{
    if (inpEl==null) {
		inpEl=objInp; divEl=objDiv;
		divEl.style.border="solid 1px #AAA";
	}
    produceDate((objInp.value.length==19) ? new Date(objInp.value) : new Date() );
    divEl.className="show";
}
function Rtn()
{                   //返回到Textbox框
    var yyT,mmT,ddT,hhT,miT,ssT;
    
    selDate.setHours(document.getElementById("hhI").value);
    selDate.setMinutes(document.getElementById("mmI").value);
    selDate.setSeconds(document.getElementById("ssI").value);
    yyT=selDate.getFullYear(); mmT=selDate.getMonth()+1; ddT= selDate.getDate();
    hhT=selDate.getHours(); miT=selDate.getMinutes(); ssT=selDate.getSeconds();
    if (yyT <10) yyT="0"+yyT; if (mmT <10) mmT="0"+mmT; if (ddT <10) ddT="0"+ddT;
    if (hhT <10) hhT="0"+hhT; if (miT <10) miT="0"+miT; if (ssT <10) ssT="0"+ssT;
    inpEl.value=yyT+"/"+mmT+"/"+ddT+" "+hhT+":"+miT+":"+ssT;
    divEl.className="hide";
}
function isLeap(year)
{                   //判断是不是闰年，是返回1，不是返回0
    return (year%100==0?(year%400==0?1:0):(year%4==0?1:0));
}
function calendarStrHead()
{
    var i,str="<div style='text-align:center;width:270px;'>";
    var tM=selDate.getMonth(),tY=selDate.getFullYear();
    var weeks=["日","一","二","三","四","五","六"];
    
    str += "<input type='button' onclick='selDate=new Date();Rtn();' value='今天'>"
          +"<select onchange='selDate.setFullYear(this.value);produceDate(selDate) '>";
    for (i=-4; i < 5; i++) {
        str += "<option value=" + (tY+i) 
		      +(i==0 ? " selected" : "") + ">" + (tY+i) + "</option>";
    }
    str += '</select>年'
         + '<select onchange="selDate.setMonth(this.value);produceDate(selDate) ">'
    for (i=-tM;i<12-tM;i++) {
        str +='<option value='+(tM+i)+(i==0?' selected':'')+'>'+(tM+i+1)+"</option>";
    }
    str += '</select>月<input type="button" onclick=inpEl.value="0";'
	      +'divEl.className="hide"; value=清除>'
          +'</div><table style="border:solid 1px #AAA;margin:auto;width:250px;">'
          +'<tr style="background-color:"EEE;">';
    for (i=0; i<7; i++) str += '<td align="center"><label>周'+weeks[i]+'</label></td>';
    return str + "</tr>";
}
function calendarStrEnd()
{
    var str='<div style="border-width:0px;margin:auto;width:248px;">'
            +iSelectHMS(0,23,'hhI','时 ')+iSelectHMS(0,59,'mmI','分 ')
            +iSelectHMS(0,59,'ssI','秒');
    return str+'<input type="button" onclick="Rtn();" value="确定"></div>';
}
function produceDate(paramDate)
{
    var currY,currM,firstday,trNum,dateNum,days,str=calendarStrHead();
    if (paramDate ==null || paramDate.length<9) paramDate=new Date();
    selDate=paramDate, currY=selDate.getFullYear(), currM=selDate.getMonth();
    firstday=new Date(currY, currM, 1).getDay();
    days = new Array(31, 28 + isLeap(currY) , 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
    trNum = Math.ceil((days[currM] + firstday) / 7);
    for (i=0; i < trNum; i++) {
        str+="<tr>";
        for (k=0; k < 7; k++) {
            dateNum=i * 7 + k - firstday + 1, date_str="";
//            str+='<td onmouseover=this.className="read";'
            str+='<td class="btntable"';
            if (dateNum > 0&&dateNum <= days[currM]) {
                str+=' onclick="selDate.setDate(this.firstChild.innerHTML);Rtn();" ';
                date_str=dateNum;
            }
            if (selDate.getDate()==dateNum&&currM==selDate.getMonth())str+='class="read"';
            str += '><label>' + date_str + '</label></td>';
        }
        str+='</tr>';
    }
    divEl.innerHTML=str + '</table>' + calendarStrEnd();
    document.getElementById("hhI").value=selDate.getHours();
    document.getElementById("mmI").value=selDate.getMinutes();
    document.getElementById("ssI").value=selDate.getSeconds();
}
function iSelectHMS(from,to,id,unit)
{                       //构建选择时、分、秒的下拉框
    var i,strList='<select id='+id+'>';
    for (i=from; i<to+1; i++) strList += '<option>' + i + '</option>';
    return strList + '</select>' + unit;
}