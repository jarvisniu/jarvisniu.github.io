/*    file name: iButtonLib-v4.0.js
      Library for js iButton table for input.
      version: 4.0

      iListBox: chg,def to def,chg
      iTextInp: add chg at end
      iTextareaInp: add chg bef resize

      26/06/2012 12/07/2012 16/04/2013 31/05/2013 5/09/2013 by Y Duan */

function iRadioBox(wid,na,va,tx,def,chg,clk)
{                   // wid,na,va[] must exist, use 'TextInpChg' as chg for input
      var i,nc,w,str='',r=na,k0=0;                // def is value in va[]

      if ((i=na.indexOf('[')) > 0) {              // -1, no '[' in na
        j=na.indexOf(']',i+1);                    // []
        k=na.substring(i+1,j);                    // string in []
        k0=parseInt(k), r=na.substring(0,i);
      }
      nc=tx.length;
      w='<span style="display:inline-block;width:'+Math.round((wid-20)/nc)+'px;">';
      for (i=0; i<nc; i++,k0++) {
        str += w+'<input type="radio" id="'+r+k0+'" name="'+na+'" value="'+va[i]+'"';
 
        if (!(def+i) || def==va[i]) str += ' checked';   // !def&!i,def=va[i]
        if (chg) str += ' onChange="'+chg+'(this);" textInp="0"';
        if (clk) str += ' onClick="'+clk+'(this);"';

        str += '/>&nbsp<label for="'+r+k0+'">'+tx[i]+'</label></span>';
      }

      return str;
}

function iCheckBox(id,na,va,tx,def,chg,clk)
{                   // va must exist. id or na must exist if tx exist
      var str;      // use 'TextInpChg' as chg for input; va, def in bit

      if (tx && !id) id=na;                       // no id? use na as id

      str='<input type="checkbox" value="'+va+'"';

      if (id && tx) str += ' id="'+id+'"';
      if (na) str += ' name="'+na+'"';
      if (va & def) str += ' checked';
      if (chg) str += ' onChange="'+chg+'(this);" textInp="0"';
      if (clk) str += ' onClick="'+clk+'(this);"';

      str += (tx) ? '/>&nbsp<label for="'+id+'">'+tx+'</label>' : '/>';

      return str;
}

function iImgBox(id,src)
{                   // id must exist
      var str;

      str='<img id="'+id+'" height="100%"';
      str += (src) ? ' src="'+src+'">' : '>';

      return str;
}

function iListBox(wid,na,va,tx,def,chg,size,clr)  // list box for single select
{                                 // na,va[],tx[] must exist; chg='TextInpChg'
      var i,str;                  // attribution only for chg>0, clr[] for bkg color

      str='<select id="'+na+'" name="'+na+'" onKeyDown="DisEnter(event,this);"';

      if (wid) str += ' style="width:'+wid+'px;"';
      if (chg) str += ' onChange="'+chg+'(this);" textInp="0"'; // TextInpChg
      if (size) str += ' size="'+size+'"';

      str += '/><option value="'+va[0]+'"';
      if (clr) str += ' style="background:'+clr[0]+';"';
      if (!def || def==va[0]) str += ' selected'; // no default, use 1st
      str += '>'+tx[0]+'</option>';

      for (i=1; i<va.length; i++) {
        str += '<option value="'+va[i]+'"';

        if (clr) str += ' style="background:'+clr[i]+';"';
        if (def == va[i]) str += ' selected';

        str += '>'+tx[i]+'</option>';
      }
      return str+'</select>';
}

function iTextInp(wid,id,na,va,len,chk,clk,chg)       // text input
{                                 // id/na exist; clk(); chg='Sumup(this)'
      var str;                    // attribution only for len>0

      str='<input type="text" onKeyDown="DisEnter(event,this);"';

      if (wid) str += ' style="width:'+wid+'px;"';
      if (id) str += ' id="'+id+'"';
      if (na) str += ' name="'+na+'"';
      if (va) str += ' value="'+va+'"';           // default value
      if (!chg) {
        if (len > 0)
          str += ' maxlength="'+len+'" onChange="TextInpChg(this);" textInp="0"';
        else if (len < 0)
          str += ' maxlength="'+(-len)+'"';
      } else {
        if (chg.indexOf('(') < 0) chg += '(this)';      // -1 for no '(' in chg

        if (len > 0) 
          str += ' maxlength="'+len+'" onChange="TextInpChg(this);'+chg+';" textInp="0"';
        else (len < 0)
          str += ' maxlength="'+(-len)+'" onChange="'+chg+';"';
      }
      if (chk) {
        if (chk.indexOf('(') < 0) chk += '(this)';      // -1, no '(' in chk
        str += ' onBlur="'+chk+';"';                    // format check, with para
      }
      if (clk) {
        if (clk.indexOf('(') < 0) clk += '(this)';
        str += ' onClick="'+clk+';"';                   // for DTpicker(this)
      }

      return str+'/>';
}

function iTextInp0(wid,id,na,va,len,chk,clk,chg)       // text input add onchange fun 
                                                       // jinhu 
{                                 // id/na exist; clk()
      var str;                    // attribution only for len>0

      str='<input type="text" onKeyDown="DisEnter(event,this);"';
      if (id) str += ' id="'+id+'"';
      if (na) str += ' name="'+na+'"';
      if (va) str += ' value="'+va+'"';           // default value
      if (wid) str += ' style="width:'+wid+'px;"';
      if (len) str += ' maxlength="'+len+'" onChange="TextInpChg(this);'+chg+';" textInp="0"';
/*       if (len) str += ' maxlength="'+len+'" onChange="TextInpChg(this);'; */
/*       if (chg) str += chg+';" textInp="0"' */
      if (chk) {
        if (chk.indexOf('(') > 0)                 // -1, no '(' in chk
          str += ' onBlur="'+chk+'"';             // format check, with para
        else
          str += ' onBlur="'+chk+'(this);"';      // format check        
      }
      if (clk) str += ' onClick="'+clk+';"';      // for DTpicker(this)

      return str+'/>';
}


function iFileSel(wid,na,targ,chg)                // file selection
{                                 // na must exist; wid/targ only one
      var str;                    // targ: targ id for display file selected
                                  // attribution only for chg>0
      str='<input type="file" id="'+na+'" name="'+na+'"';

      if (wid)
        str += ' style="width:'+wid+'px;"';
      else if (targ)                              // display on targ id
        str += ' style="visibility:hidden" targ="'+targ+'"';

      if (chg) str += ' onChange="'+chg+'(this);" textInp="0"'; // disp file name

      return str+'/>';
}

function iTextareaInp(wid,row,na,va,len,chg,resize)
{                                 // wid,na must exist; chg: 0,1
      var str;                    // attribution only for len>0

      str='<textarea id="'+na+'" name="'+na+'" onKeyDown="DisEnter(event,this);"'
          +' onBlur="ChkStr(this);" style="width:'+wid+'px;';
      str += (resize) ? '"' : 'resize:none"';

      if (row) str += ' rows="'+row+'"';
      if (len) str += ' maxlength="'+len+'"';
      if (chg) str += ' onChange="TextInpChg(this);" textInp="0"';

      str += '>';
      if (va) str += va;                          // default value

      return str+'</textarea>';
}

function iHiddenInp(na,va)
{                                                 // id for change value
      return '<input type="hidden" id="'+na+'" name="'+na+'" value="'+va+'">';
}


function iButtonSubmit(na,va,clk)                 // inline submit button
{
      var str;
      
      str='<input type="submit" name="'+na+'" value="'+va+'"';
      if (clk) str += ' onClick="return '+clk+';"';

      return str+'>';
}
function iClkButton(va,clk)                       // inline click button
{                                 // va,clk must exist
      return '<input type="button" value="'+va+'" onClick="'+clk+';"/>';
}

function iTable(wid,row,nc,id,cap,ti,clk)         // table of button with onclick
{                                 // wid,row,nc,id,clk must exist
      var i,j,w,str;

      w=' style="width:'+Math.round((wid-1-nc)/nc)+'px;"';      
      str='<center><table id="'+id+'" style="width:'+wid+'px">';
      if (cap) str += '<caption>'+cap+'</caption>';

      if (ti) {                                   // title
        str += '<thead class="block"><tr>';
        for (i=0; i<nc; i++) str += '<th class="center"'+w+'>'+ti[i]+'</th>';
        str += '</tr></thead>';
      }
      str += '<tbody class="block">';
      for (i=0; i<row; i++) {
        str += '<tr>';
        for (j=0; j<nc; j++) 
          str += '<td class="btntable"'+w+' onClick="'+clk+';"></td>';

        str += '</tr>';
      }
      return str+'</tbody></table></center>';
}

function TextInpChg(ele)                          // input indicator
{
      if (ele.getAttribute('textInp')) ele.setAttribute('textInp',1);
}

function DisEnter(evt,ele)                        // no key ENTER in text input box
{                                                 // tested for onKeyDwon,onKeyPress
      var i,form,na;

      if (evt.keyCode-13) return true;            // not a Enter

      form=ele.form, na=ele.name;
      if (!form || !na) return true;              // no form or no name

      if (evt.preventDefault)                     // DOM model
        evt.preventDefault(), evt.stopPropagation();
      else                                        // IE model
        evt.returnValue=false, evt.cancelBubble=true;
      
      for (i=0; i<form.length; i++) {
        if (form.elements[i].name == na) {
          while (form.elements[i+1].type == "hidden") ++i;  // bypass the hidden

          form.elements[i+1].focus();
          return false;
        }
      }
      return false;                               // legacy event model, not make sense
}

function SetCheckBoxDefault(id)
{                         // set value from kth ele in form
      var i=0;
      
      while (i < va.length) document.getElementById(id[i++]).checked=true;
}

function CreateDivEle(ele,id)
{                         // id: div ele id
      var x,y,divEle;

      if (!(divEle=document.getElementById(id))) {
        divEle=document.createElement("div"), divEle.setAttribute("id",id);
        divEle.style.position="absolute", divEle.style.backgroundColor="#dbdddd"; // "#f0f0f0"
        divEle.style.border="solid 1px #AAA"; document.body.appendChild(divEle);
                                                  // the position of dtPicker
        x=ele.getBoundingClientRect().left, y=ele.getBoundingClientRect().top+25;      
        divEle.style.left=x+"px", divEle.style.top=y+"px";
        divEle.ele=ele;                           // record the ele come from
      }
      return divEle;
}
function QuitDivEle(id)
{
      divEle=document.getElementById(id);
      divEle.parentNode.removeChild(divEle);
      divEle.ele.focus();                         // focus on the ele come from
}

