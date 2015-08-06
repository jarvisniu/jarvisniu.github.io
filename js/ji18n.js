
/* Jarvis's i18n: A micro i18n framework.
 * @author Jarvis Niu - www.jarvisniu.com
 */
function Ji18n(data) {
    var self = this;
    var lang;               // selected language
    var dataLangs = [];     // languages provided
    var enLang;             // English language provided
    var nonEnLang;          // non-English language provided

    var TAG_ATTR = "ji18n"; // the attribute added to the binding tag

    this.lang = "";

    function init() {
        // collect language provided in data
        for (var i in data) {
            if (i.indexOf("_") < 0) {
                var item  = data[i];
                for (var j in item) {
                    if (!nonEnLang && j != "en") nonEnLang = j;
                    if (!enLang && j.substring(0, 2) == "en") enLang = j;
                    dataLangs.push(j);
                }
                break;
            }
        }
        self.lang = lang = detectLang(data);
        // walk through when loaded
        document.addEventListener("DOMContentLoaded", function() {
            walk();
            renderTitle();
            renderBody();
        });
    }

    // map from key to value
    function _(key) {
        if (data[key] !== undefined) {
            if (data[key][lang] !== undefined) {
                return data[key][lang];
            } else {
                return key;
            }
        } else {
            console.warn("Language data missing key: " + key);
            return key;
        }
    }

    /* detect the most suitable language, order:
     *   1. last setting in localStorage
     *   2. common user languages that data provided
     *   3. data["__default__"]
     *   4. "en"
     *   5. non-English language provided
     */
    function detectLang(data) {
        var _lang = load();
        if (_lang) return _lang;


        if (navigator || navigator.languages) {
            var navLangs = navigator.languages;
            for (var i in navLangs) {
                if (dataLangs.indexOf(navLangs[i]) > -1) {
                    return navLangs[i];
                }
            }
        } else {
            console.error("You browser doesn't support language detection.");
        }
        return data["__default__"] || enLang || nonEnLang;
    }

    // convert the template marks to <span> tags
    function processText(t) {
        var html = t.parentNode.innerHTML;
        var templates = html.match(/{{ *[A-z|0-9_-]+ *}}/g);
        if (html.length > 0 && templates) {
            var templatesVars = [];
            for (var i in templates) {
                templatesVars[i] = templates[i].replace(/{{ */, "").replace(/ *}}/, "");
            }
            for (var i in templates) {
                var n = templates[i];
                var nv = templatesVars[i];
                html = html.replace(n, '<span ji18n="' + nv + '">' + _(nv) + '</span>');
            }
            t.parentNode.innerHTML = html;
        }
    }

    // walk through the dom tree once to replace the marks
    function walk(dom) {
        dom = dom || document.body;
        var childs = dom.childNodes;
        for (var i in childs) {
            var n = childs[i];
            if (n instanceof HTMLElement) walk(n);
            if (n instanceof Text ) processText(n);
        }
    }

    // provide the avialable languages to allow the user to swtich
    this.avialableLangs = function () {
        return dataLangs;
    };

    // switch the language to the specific one
    this.switch = function(l) {
        if (dataLangs.indexOf(l) > -1)
            lang = l;
        else
            lang = lang == enLang ? nonEnLang : enLang;
        renderBody();
        renderTitle();
        save(lang);
        this.lang = lang;
    };

    // render the <body>
    function renderBody() {
        var items = document.querySelectorAll("[ji18n]");
        for (var i = 0; i < items.length; i++) {
            items[i].innerHTML = _(items[i].getAttribute("ji18n"));
        }
    }

    // render the <title>
    function renderTitle() {
        if (data["__title__"]) document.title = _("__title__");
    }

    // save the language to local storage
    function save(l) {
        if (localStorage) {
            localStorage.ji18n = l;
        }
    }

    // load the language from local storage
    function load() {
        if (localStorage && localStorage.ji18n) {
            return localStorage.ji18n;
        }
    }

    init();
}
