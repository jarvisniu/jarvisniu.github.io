var CDN_D3 = "http://d3js.org/d3.v3.min.js";
var CDN_THREE = "http://threejs.org/build/three.js";
var CDN_BU = "https://cdn.rawgit.com/jarvisniu/Bu.js/v0.4.0/build/bu.min.js";

var txtConsoleInput;
var preview, previewConsole, divConsoleLog;
var previewDocument, preveiwScriptLink, previewScript, previewCSS;

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

    previewScriptLink = document.createElement("script");
    previewScriptLink.addEventListener("load", refreshPreview);
    previewScriptLink.setAttribute("src", CDN_BU);
    previewDocument.head.appendChild(previewScriptLink);


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

    txtConsoleInput.addEventListener("keyup", function(e) {
        if (e.keyIdentifier == 'Enter') executeConsoleInput();
    });

    buttonConsoleClear.addEventListener('click', function(e) {
        divConsoleLog.innerHTML = "";
    });

    buttonCodeImport.addEventListener('click', function(e) {
        alert("Sorry, the script import function is in developing...");
    });
});
