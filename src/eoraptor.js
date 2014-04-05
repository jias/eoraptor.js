/**!
 * eoraptor.js
 * Copyright (c) 2014 gnosaij
 * Licensed under MIT (https://github.com/Jias/eoraptor.js/blob/master/LICENSE)
 * A tiny super-easy javascript template engine without any dependence.
 * @author gnosaij | http://jias.github.io | http://www.joy-studio.com
 * @version #VERSION#
 * @link http://www.joy-studio.com/javascript/my-eoraptorjs-template-engine-in-javascript.html
 */
(function(glob) {

var delimiterReg = /\{(?!\{\{)\{\s*(.+?)\s*\}\}/g;

var eoraptor = {
    name: 'eoraptor.js',
    version: '1.1.0',
    compile: compile,
    escape: escaper,
    query: query,
    setDelimiter: setDelimiter
};

var thisReg = /\bthis\b/g,
    thisAlt = 't__',
    flags = '#^/@!>',
    eachReg = /^t__(.+?)\s(\w+)\s?(\w+)?.*$/, // see unit test
    escapeReg = /[&<>"']/g,
    empty = '',
    escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
    },
    trim = empty.trim ? function (str) {
        return str.trim();
    } : function (str) {
        return str.replace(/^\s+/, empty).replace(/\s+$/, empty);
    };

function compile() {
    var args = arguments, name, tpl;
    
    if (args.length === 1) {
        name = tpl = args[0];
    } else {
        name = args[0];
        tpl = args[1];
    }

    if (eoraptor[name]) {
        return eoraptor[name];
    }

    var match = null,
        code = 'var t__=data, r__=[];\n',
        pos = 0;

    while(match = delimiterReg.exec(tpl)) {
        code += parseString(tpl.slice(pos, match.index));
        code += parseJS(match[1], true);
        pos = match.index + match[0].length;
    }

    code += parseString(tpl.substr(pos, tpl.length - pos));

    code = (code + 'return r__.join("");');//.replace(/[\r\t\n]/g, empty);

    var render = function (data) {
        var result;
        try {
            result = new Function('data', 'var e__=eoraptor.escape;' + code)(data);
        } catch(err) {
            console.error(err.message + " from data and tpl below:");
            console.log(data);
            console.log(tpl);
        }
        return result;            
    };

    render.render = render;
    render.source = 'function (data) {\n' + code + '\n}';
    return eoraptor[name] = render;
} // compile

var squareBracketReg = /[\[\]]/g,
    quoteContentReg = /(?:"(.*?)")/g,
    quoteContentReg2 = /(?:'(.*?)')/g,
    squareBracketAndContentReg = /(\[.*?\])/g,
    parenthesesAndContentReg = /(\(.*?\))/g,
    ifReg = /^[^\s]+\s*([!=><]{1,3}\s*[^\s]+)?$/,
    squareBracketRemover = function (all, match) {
        return match.replace(squareBracketReg, empty);
    }

// console.log(isIf('a("ab==0")')); => true
// console.log(isIf("a['[122 '] === b[ '55]' ]")); => true
// step1. delete '[' and ']' between "" and ''
// step2. delete '[xxx]'
// step3. delete '(xxx)'
function isIf (str) {
    str = str.replace(quoteContentReg, squareBracketRemover)
        .replace(quoteContentReg2, squareBracketRemover)
        .replace(squareBracketAndContentReg, empty)
        .replace(parenthesesAndContentReg, empty);
    return ifReg.test(str);
}

function setDelimiter(start, end) {
    start = start || '{{';
    end = end || '}}';
    delimiterReg = new RegExp(
        escapeDelimiter(start.charAt(0))+ 
        '(?!'+escapeDelimiter(start)+')'+
        escapeDelimiter(start.substr(1))+ 
        '\\s*(.+?)\\s*'+ 
        escapeDelimiter(end)
    , 'g');
}

// from mustache.js
function escapeDelimiter(str) {
    return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

// replacer callback for escaper
function escapeCallback(match) {
    return escapeMap[match];
}

// escape html chars
// NOTE: 'escape' is reserved word in javascript
function escaper(string) {
    return string == null ? empty : empty + string.replace(escapeReg, escapeCallback);
}

function parseJS(str) {

    // turn 'this'(point to data) to 't__' globally
    str = str.replace(thisReg, thisAlt);

    var firstChar = str[0];

    if (flags.indexOf(firstChar) === -1) {
        return 'r__.push(' + str + ');\n';
    } 

    var code = empty;

    // @foo => foo
    str = str.substr(1);
    switch (firstChar) {
        case '@':
            code ='r__.push(e__(' + str + '));\n';
            break;
        case '#':
            if (isIf(str)) {
                code = 'if('+str+'){\n';
            } else {
                code = str.replace(eachReg, function (all, list, value, key) {
                    key = key || 'k__';
                    return 'var '+key+', '+ value +';\n'+
                    'for('+key+' in t__'+list+'){\n'+
                        'if(!t__'+list+'.hasOwnProperty('+key+')) return;\n'+
                        value+' = t__'+list+'['+key+'];\n';
                });
            }
            break;
        case '^':
            if (!str) {
                code = '}else{\n';
            } else {
                code = '}else if('+str+'){\n';
            }
            break;
        case '/':
            code = '}\n';
            break;
        case '>':
            code = str.replace(/^(\w+)\s(.+)$/, function (all, name, data) {
                name = name.indexOf('-') > -1 ? '["'+name+'"]' : '.'+name;
                return 'r__.push(eoraptor'+name+'.render('+data+'));\n';
            });
            break;
        case '!':
        default:
            break;
    }
        
    return code;
}

function parseString (str) {
    return str != empty ? 'r__.push("' + str.replace(/"/g, '\\"') + '");\n' : empty;
}

// get templates from the script tags in document.
function query() {
    var scripts = document.getElementsByTagName('script'),
        script;
    for (var i = 0, l = scripts.length; i < l; i++) {
        script = scripts[i];
        if (!script.getAttribute('compiled') && script.id && script.innerHTML && script.type === 'text/html') {
            compile(script.id, trim(script.innerHTML));
            script.setAttribute('compiled','1');
        }
    }
}

(typeof module != 'undefined' && module.exports) ?
    (module.exports = eoraptor) :
    (typeof define === 'function' && define.amd) ?
        define('eoraptor', [], function() { return eoraptor; }) :
        (glob.eoraptor = eoraptor);
})(this);