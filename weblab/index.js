var CDN_VUE = "http://cdn.bootcss.com/vue/2.2.2/vue.min.js";
var CDN_D3 = "http://d3js.org/d3.v3.min.js";
var CDN_THREE = "http://threejs.org/build/three.js";
var CDN_BU = "https://cdn.rawgit.com/jarvisniu/Bu.js/v0.4.0/build/bu.min.js";

var txtConsoleInput;
var preview, previewConsole, divConsoleLog;
var previewDocument, preveiwScriptLinkNew, previewScript, previewCSS;

var aceScript, aceStyle, aceHTML;

function refreshPreview() {
    previewDocument.body.innerHTML = aceHTML.session.getValue();
    divConsoleLog.innerHTML = "";

    savePage();

    refreshPreviewCSS();
    refreshPreviewCode();
}

function refreshPreviewCode() {
    previewDocument.head.removeChild(previewScript);
    previewScript = document.createElement("script");
    previewScript.innerHTML = aceScript.session.getValue();
    previewDocument.head.appendChild(previewScript);
}

function refreshPreviewCSS() {
    previewDocument.head.removeChild(previewCSS);
    previewCSS = document.createElement("style");
    previewCSS.setAttribute("type", "text/css");
    previewCSS.innerHTML = aceStyle.session.getValue();
    previewDocument.head.appendChild(previewCSS);
}

function savePage() {
    localStorage.html = aceHTML.session.getValue();
    localStorage.script = aceScript.session.getValue();
    localStorage.style = aceStyle.session.getValue();
}

function loadPage() {
    aceScript.session.setValue(localStorage.script || "");
    aceHTML.session.setValue(localStorage.html || "");
    aceStyle.session.setValue(localStorage.style || "");
}

function executeConsoleInput() {
    var inputValue, outputValue;

    inputValue = txtConsoleInput.value;
    try {
        outputValue = preview.contentWindow.eval(inputValue);
        previewConsole.log('> ' + inputValue + '<br>< ' + outputValue);
    } catch (e) {
        previewConsole.log('> ' + inputValue);
        previewConsole.error('< ' + e.message);
    }
    txtConsoleInput.value = '';
}

document.addEventListener("DOMContentLoaded", function() {
    txtConsoleInput = document.getElementById("txtConsoleInput");
    buttonConsoleClear = document.getElementById("buttonConsoleClear");
    buttonCodeImport = document.getElementById("buttonCodeImport");
    preview = document.getElementById("preview");
    divConsoleLog = document.getElementById("divConsoleLog");
    previewDocument = preview.contentWindow.document;
    previewConsole = preview.contentWindow.console;

    previewScript = document.createElement("script");
    previewDocument.head.appendChild(previewScript);
    previewCSS = document.createElement("style");
    previewDocument.head.appendChild(previewCSS);

    previewScriptLinkNew = document.createElement("script");
    previewScriptLinkNew.addEventListener("load", function() {
        refreshPreview();
        $('#modal').hide();
    });
    previewDocument.head.appendChild(previewScriptLinkNew);


    previewConsole.log = previewConsole.info = function() {
        divConsoleLog.innerHTML += "<p>" + Array.prototype.slice.call(arguments).join(", ") + "</p>";
    }
    previewConsole.error = function() {
        divConsoleLog.innerHTML += '<p class="error">' + Array.prototype.slice.call(arguments).join(", ") + "</p>";
    }
    previewConsole.warn = function() {
        divConsoleLog.innerHTML += '<p class="warn">' + Array.prototype.slice.call(arguments).join(", ") + "</p>";
    }

    aceScript = ace.edit("divCodeEditor");
    var JavaScriptMode = ace.require("ace/mode/javascript").Mode;
    aceScript.session.setMode(new JavaScriptMode());

    aceHTML = ace.edit("divHTML");
    var HTMLMode = ace.require("ace/mode/html").Mode;
    aceHTML.session.setMode(new HTMLMode());

    aceStyle = ace.edit("divStyle");
    var CSSMode = ace.require("ace/mode/css").Mode;
    aceStyle.session.setMode(new CSSMode());

    loadPage();

    aceHTML.session.on("change", refreshPreview);
    aceStyle.session.on("change", refreshPreview);
    aceScript.session.on("change", refreshPreview);

    $(txtConsoleInput).on("keyup", function(e) {
        console.log(e);
        if (e.key == 'Enter') executeConsoleInput();
    });

    $(buttonConsoleClear).click(function(e) {
        divConsoleLog.innerHTML = "";
    });

    $(buttonCodeImport).click(function(e) {
        $('#modal').show();
    });

    $('#btnCloseModal').click(function(e) {
        $('#modal').hide();
    });

    $('#radioVue').click(function(e) {
        previewScriptLinkNew.setAttribute("src", CDN_VUE);
    });

    $('#radioBu').click(function(e) {
        previewScriptLinkNew.setAttribute("src", CDN_BU);
    });

    $('#radioD3').click(function(e) {
        previewScriptLinkNew.setAttribute("src", CDN_D3);
    });

    $('#radioThree').click(function(e) {
        console.log('three', previewScriptLinkNew);
        previewScriptLinkNew.setAttribute("src", CDN_THREE);
    });
});
