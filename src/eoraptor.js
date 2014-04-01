/*
 * @module eoraptor
 * @author gnosaij <http://www.joy-studio.com>
 * @idea http://www.joy-studio.com/javascript/my-eoraptorjs-template-engine-in-javascript.
 * @references
 *   1. http://ejohn.org/blog/javascript-micro-templating/
 *   2. http://krasimirtsonev.com/blog/article/Javascript-template-engine-in-just-20-line
 *   3. https://github.com/janl/mustache.js/
 *   4. http://www.yajet.net/yajet/doc/yajet.html
 */
(function(glob) {

var delimiterReg = /\{\{\s*(.+?)\s*\}\}/g;

var eoraptor = {
    name: 'eoraptor.js',
    version: '1.0.0',
    compile: compile,
    escape: ee,
    cache: {},
    setDelimiter: setDelimiter
};

var thisReg = /\bthis\b/g,
    thisAlt = 't__',
    flags = '#^/@!>',
    eachReg = /^t__(.+?)\s(\w+)\s?(\w+)?.*$/, // see unit test
    escapeReg = /[&<>"']/g,
    escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
    };

function compile() {
    var args = arguments, name, tpl;
    
    if (args.length === 1) {
        name = tpl = args[0];
    } else {
        name = args[0];
        tpl = args[1];
    }

    if (eoraptor.cache[name]) {
        return eoraptor.cache[name];
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

    code = (code + 'return r__.join("");');//.replace(/[\r\t\n]/g, '');

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
    return eoraptor.cache[name] = render;
} // compile

function isIf (str) {
    // "a['[122 '] === b[ '55]' ]" => "a === b"
    // 1) delete '[' and ']' between "" and ''
    // 2) delete '[xxx]'
    var noBracketStr = str.replace(/(?:"(.*?)")/g, function (all, m) {
        return m.replace(/[\[\]]/g, '');
    }).replace(/(?:'(.*?)')/g, function (all, m) {
        return m.replace(/[\[\]]/g, '');
    }).replace(/(\[.*?\])/g, '');
    return /^[^\s]+\s*([!=><]{1,3}\s*[^\s]+)?$/.test(noBracketStr);
}

function setDelimiter(start, end) {
    start = start || '{{';
    end = end || '}}';
    delimiterReg = new RegExp(escapeDelimiter(start) + 
    '\\s*(.+?)\\s*' + escapeDelimiter(end), 'g')
}

// thanks mustache.js
function escapeDelimiter(str) {
    return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

// replacer callback for ee
function rr(match) {
    return escapeMap[match];
}

// escape html chars
// NOTE: 'escape' is reserved word in javascript
function ee(string) {
    return string == null ? '' : ''+string.replace(escapeReg, rr);
}

function parseJS(str) {

    // turn 'this'(point to data) to 't__' globally
    str = str.replace(thisReg, thisAlt);

    var firstChar = str[0];

    if (flags.indexOf(firstChar) === -1) {
        return 'r__.push(' + str + ');\n';
    } 

    var code = '';

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
                return 'r__.push(eoraptor.cache'+name+'.render('+data+'));\n';
            });
            break;
        case '!':
        default:
            break;
    }
        
    return code;
}

function parseString (str) {
    return str != '' ? 'r__.push("' + str.replace(/"/g, '\\"') + '");\n' : '';
}

(typeof module != 'undefined' && module.exports) ?
    (module.exports = eoraptor) :
    (typeof define === 'function' && define.amd) ?
        define('eoraptor', [], function() { return eoraptor; }) :
        (glob.eoraptor = eoraptor);
})(this);