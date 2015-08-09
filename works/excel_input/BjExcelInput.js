        function ExcelInput (wid, hig, prw, cw, cap, ti, pr, da, dab, dar, na) // Table similar to Excel
        {   // wid: width of table, hig: hight of table, prw: width of prompt, cw: colom width
            // cap: caption text, ti: title string array, pr: prompt string array, da: data, dab: data at the bottom, dar: data on the right
            var str, nx, ny, rw, divc;
            nx=ti.length, ny=pr.length, rw=cw*nx+50;
            widc=wid-3-prw-(dar ? cw : 0); hig=hig-27-(dab ? 26 : 0);

            str ='<div style="width: '+wid+'px;" ><table class="excel">';
            if (cap) str +='<caption style="text-align: left;">'+cap+'</caption>';
            str += '<tbody><tr><td><div style="width:'+prw+'px;"></div></td>'
                +'<td id="tabTop">'+ExcelRow("divExcelTop", ti, widc, rw, cw)+'</td>';
            if (dar) str += '<td><div style="width:'+(cw-0)+'px;">合计</div></td>';
            str += '</tr><tr>'
                +'<td id="tabLeft">'+ExcelCol("divExcelLeft", pr, hig)+'</td>'
                +'<td id="tabMiddle" style="background-color: white;">'
                +ExcelMid("divExcelMiddle", da, widc, hig, cw, nx, ny, da, na)+'</td>';
            if(dar)str += '<td id="tabRight">'+ ExcelCol("divExcelRight", dar, hig)+'</td>';
            str += '</tr>';
            if (dab) {
                str += '<tr><td>合计</td><td id="tabBottom">'
                +(dab ? ExcelRow("divExcelBottom", dab, widc, rw, cw):"")+'</td>';
                if(dar) str += '<td></td>';
                str += '</tr>';
            }
            str += '</tbody></table><div>';
            return str;
        }
        function OnExcelCellChange(ele)
        {
            var t,ix,iy,tbody,tr,td,tds2,sumx=0,sumy=0;

            td=ele.parentNode;tr=td.parentNode;tbody=tr.parentNode;
            trs=Array.prototype.slice.call(tbody.children);
            tds=Array.prototype.slice.call(tr.children);
            ix=tds.indexOf(td);iy=trs.indexOf(tr);
            for (i=0;i<tds.length;i++) t=parseInt(tds[i].childNodes[0].value),sumx+=(isNaN(t)?0:t);
            for (i=0;i<trs.length;i++) t=parseInt(trs[i].childNodes[ix].childNodes[0].value),sumy+=(isNaN(t)?0:t);
            // console.log(sumx, sumy, ix, iy);
            tbody=tbody.parentNode.parentNode.parentNode.parentNode.parentNode;
            if(tbody.children[2])
                tbody.children[2].children[1].children[0].children[0].children[0].children[0].children[ix].innerText=sumy;
            if(tbody.children[1].children[2])
                tbody.children[1].children[2].children[0].children[0].children[0].children[iy].children[0].innerText=sumx;
        }
        function ExcelSyncScroll(divMid)
        {
            var divTbody, divBottom, divLeft, divTop, divRight;

            divTbody=divMid.parentNode.parentNode.parentNode;
            divTop=divTbody.childNodes[0].childNodes[1].childNodes[0];
            divLeft=divTbody.childNodes[1].childNodes[0].childNodes[0];
            divRight=divTbody.childNodes[1];
            if (divRight.childNodes.length>2)
                divRight=divRight.childNodes[2].childNodes[0];
            else
                divRight=null;
            if (divTbody.childNodes.length>2)
                divBottom=divTbody.childNodes[2].childNodes[1].childNodes[0];
            else
                divBottom=null;
            divTop.scrollLeft=divMid.scrollLeft;
            divLeft.scrollTop=divMid.scrollTop;
            if (divBottom) divBottom.scrollLeft =divMid.scrollLeft;
            if (divRight) divRight.scrollTop=divMid.scrollTop;
        }
        function ExcelMid(id, data, wid, hig, cw, nx, ny, da, na)
        {
            var str, i;

            str = '<div id="divExcelMiddle" onscroll="ExcelSyncScroll(this);" style="width: '
                + wid+'px; height:'+hig+'px; overflow: scroll; position: relative; left: 0px;">'
                + '<table style="width:'+(cw*nx)+'px; border: none;"><tbody>';
            for (i=0; i<ny; i++) {
                str += '<tr>';
                for (j=0; j<nx; j++){
                    str += '<td style="width:'+(cw+1)+'px; height: 26px; background-color: white; border: none;'
                         + (j?"":"border-left:none;") + (i?"":"border-top:none;")
                         //+ '"><input type="text" value="'+da[i*nx+j]+'" style="margin: 0; width:'+(cw-2)+'px;"></input></td>';
                         + '">'+iTextInp(70, 0, na+"["+(i*nx+j)+"]", da[i*nx+j], 4, null, null, "OnExcelCellChange")+'</td>';
                }
                str += '</tr>';
            }
            str += '</tbody></table></div>';
            return str;
        }
        function ExcelRow(id, data, wid, swid, cw)
        {
            var str, i;

            str = '<div id="'+id+'" style="width:'+wid+'px; overflow: hidden;">'
                + '<table style="width:'+swid+'px; border: none;"><tbody><tr>';
            for (i=0; i<data.length; i++) {
                str += '<td style="width:'+(cw)+'px; border-top:none;border-bottom:none;'+(i?'':'border-left:none;')
                     + '">' + data[i] + '</td>';
            }
            str += '<td style="border: none;"><div style="width:'+(cw-1)+'px;"></div></td>'
                 + '</tr></tbody></table></div>';
            return str;
        }
        function ExcelCol(id, data, hig)
        {
            var str, i;

            str = '<div id="'+id+'" style="width:100%; height:'+hig+'px; overflow: hidden;">'
                + '<table style="width:100%; height: 1px; border: none;"><tbody>';
            for(i=0; i<data.length; i++){
                str += '<tr><td style="border: none; border-bottom: solid 1px #C0C0C0;'
                     + 'height: 26px;">'+data[i]+'</td></tr>';
            }
            str += '<tr><td style="height:50px; border: none;"></td></tr></tbody></table></div>';
            return str;
        }