/**!
 * eoraptor.js
 * Copyright (c) 2014 gnosaij
 * Licensed under MIT (https://github.com/Jias/eoraptor.js/blob/master/LICENSE)
 * #DESCRIPTION#
 * @author gnosaij | http://jias.github.io | http://www.joy-studio.com
 * @version #VERSION#
 * @update #UPDATE#
 * @link http://www.joy-studio.com/javascript/my-eoraptorjs-template-engine-in-javascript.html
 */
(function(glob) {

var eoraptor = {
    name: 'eoraptorjs',
    version: '#VERSION#',
    compile: compile,
    // setDelimiter: setDelimiter,
    escape: escaper,
    extract: extract,
    debug: false,
    _: {
        e: escaper,
        v: value
    }
};

var cid = 0;

//var delimiterReg = /\{(?!\{\{)\{\s*(.+?)\s*\}\}/g;

var EMPTY = '',
    DOT = '.',
    DATA = 'd_',
    OTAG = '{{',
    CTAG = '}}',
    LSB = '[',
    RSB = ']',
    SQ = "'", // single quote
    DQ = '"', // double quote
    SIGN = '=-/^#?:!>',
    // signType = {
    //     '=': 1,
    //     '-': 2,
    //     '/': 3,
    //     '^': 4,
    //     '#': 5,
    //     '?': 6,
    //     '!': 7,
    //     ':': 8,
    //     '>': 9
    // },
    tokenType = {
        'oTag': -1,
        'cTag': 1,
        'oSB1': -2,
        'cSB1': 2,
        'oSB2': -3,
        'cSB2': 3
    }

// DEBUGG START
var log = {
    tag: {
        '-1': '{{',
        '1': '}}'
    },
    sign: {
        '1': '=',
        '2': '-',
        '3': '/',
        '4': '^',
        '5': '#',
        '6': '?',
        '7': '!',
        '8': ':',
        '9': '>'
    }
};
// DEBUGG END

var nodeEnv = typeof process === 'object' && typeof process.versions === 'object',
    thisReg = /\bthis\b/g,

    trim = EMPTY.trim ? function (str) {
        return str.trim();
    } : function (str) {
        return str.replace(/^\s+/, EMPTY).replace(/\s+$/, EMPTY);
    };

// ## compile ##

var codePrefix = 'var ns=eoraptor, __=ns._, e_=__.e, v_=__.v;\n';

// to compile a template string to callable render
// @param {string} str a template string
// @param {object} options optional
// @param {string} options.id the unique name for the template
// @param {string} options.oTag set a one-off opening tag
// TODO oTag cTag
function compile (str, options) {
    var id;
    var render;

    str = str || EMPTY;
    options = options || {};

    id = options.id || str;

    render = eoraptor[id];
    if (render) {
        return render;
    }

    var oTag = options.oTag || OTAG;
    var cTag = options.cTag || CTAG;

    var code = build(parse(str, oTag, cTag));

    render = function (data) {
        var result;
        try {

            result = new Function('data', codePrefix + code)(data);
        } catch(err) {
            console.error('"' +err.message + '" from data and tpl below:');
            console.log(data);
            console.log(str);
        }
        return result;
    };

    render.render = render;
    render.source = 'function (data) {\n' + code + '\n}';
    return eoraptor[id] = render;
}

function build (token) {
    var buffer = [];
    // TODO: optimize the code prefix when in pre-compiled file.
    var code = [
        'var d_=data, r_=[];\n'
        ];
    var i, l, item, sign, trimedBuffer;
    for (i=0, l=token.length; i<l; i++) {
        item = token[i];
        switch (item.type) {
            case undefined:
                buffer.push(item.str);
                break;
            case -1:
                buffer.length && code.push(makeText(buffer.join('')));
                buffer = [];
                break;
            case 1:
                sign = item.sign;
                trimedBuffer = trim(buffer.join(''));
                // 只有/和:允许内容为空
                if (!trimedBuffer && sign !== '/' && sign !== ':') {
                    // TODO: 这里写死了oTag和cTag，要换成可配置的值
                    code.push(makeText('{{'+sign+buffer.join('')+'}}'));
                } else {
                    code.push(makeJS(trimedBuffer, sign));
                }
                buffer = [];
                break;
        }
    }
    buffer.length && code.push(makeText(buffer.join('')));
    code.push('return r_.join("");');
    return code.join('');
}

// @return {array} token
function parse (str, oTag, cTag) {

    // console.log('%c'+str+' '+str.length, 'color:#fff;background-color:orange;');
    var oTag0 = oTag.charAt(0);
    var cTag0 = cTag.charAt(0);
    var buffer = [], token = [];
    var status = {
        lastOTag: null,
        lastOSB: null
    };

    var i = 0, l = str.length, char, lastOTag, lastCTag, lastOSB, lastCSB;
    for (i= 0; i<l; i++) {
        // console.log('%cindex:'+i, 'color:green;');
        char = str.charAt(i);

        // console.log('%cinTag: '+status.inTag+' inSB: '+status.inSB+' sign: '+status.sign, 'color:#ccc;');

        if (char === oTag0 && (lastOTag = isOTag(str, oTag, i))) {
            status.lastOTag = lastOTag;
            token.push(lastOTag);
            i += lastOTag.jump;
        } else if (status.lastOTag && char === cTag0 
            && (lastCTag = isCTag(str, cTag, i))) {
            lastCTag.sign = status.lastOTag.sign;
            token.push(lastCTag);
            status.lastOTag.type = -1;
            status.lastOTag = null;
            i += lastCTag.jump;
        } else if (char === LSB && (lastOSB = isOSB(str, i))) {
            status.lastOSB = lastOSB;
            token.push(lastOSB);
            i += lastOSB.jump;
        } else if (status.lastOSB && char === status.lastOSB.quote 
            && (lastCSB = isCSB(str, i, status.lastOSB.quote))) {
            token.push(lastCSB);
            // status.lastOSB.type = -2;
            status.lastOSB = null;
            i += lastCSB.jump;
        } else if (char === '\\') {
            token.push({
                index: i,
                str: '\\' + str.charAt(i+1)
            });
            i++;
        } else {
            token.push({
                index: i,
                str: char
            });            
        }
    }
    // status.chip && makeText(status);

    // lastCollect(status.token, status);

    
    // console.log(token, token.length);
    // console.log(status.code.join(''));
    // return token.join('');//.replace(/[\r\t\n]/g, empty););
    return token;
}

// Is it the first char of an opening tag?
function isOTag (str, oTag, index) {
    var l = oTag.length, s = str.substr(index, l), sign = str.charAt(index+l);
    // NOTE 要保证sign有值 如果当前的index已经是字符串尾部 如'foo{{' sign为空
    if (oTag === s && sign && SIGN.indexOf(sign) > -1) {
        return {
            str: s + sign,
            index: index,
            // sign: signType[str.charAt(index+l)], // TODO: delete
            sign: str.charAt(index+l),
            // ignore the last oTag charts and the sign char,
            // l(oTag.length) - 1(oTag's first char) + 1(sign's char)
            jump: l
        };
    }
}

// Is it the first char of a closing tag?
function isCTag (str, cTag, index) {
    var l = cTag.length, s = str.substr(index, l);
    if (cTag === s) {
        return {
            str: s,
            index: index,
            type: 1,
            jump: l - 1
        };
    }
}

function isInTag (status) {
    return status.tag < 0;
}

// Is it the first char of an opening square bracket expression?
function isOSB (str, index) {
    var quote = str.charAt(index+1);
    if (quote === DQ || quote === SQ) {
        return {
            str: LSB + quote,
            index: index,
            quote: quote,
            jump: 1
        };
    }
}

// Is it the first char of a closing square bracket expression?
function isCSB (str, index, quote) {
    if (str.charAt(index+1) === RSB) {
        return {
            str: quote + RSB,
            index: index,
            quote: quote,
            jump: 1
        };
    }
}

// Is the status on a position between the square bracket expression?
function isInSB (status) {
    return status.sb < 0;
}

function makeText (str) {
    return 'r_.push("' + str.replace(/"/g, '\\"') + '");\n';
}

// TODO: check {{=this["this"]}}
var forReg = /^(.+?)\s(\w+)\s?(\w+)?.*$/;
function makeJS (str, sign) {
    // console.log('makeJS(\'%s\', %s)', str, log.sign[sign]);
    var code = '';

    
    switch (sign) {
        // `=` output html-escaped value
        // str        code
        // ————————————————————
        // foo        d_.foo 
        // ["f-o"]    d_["f-o"]
        // &foo       foo
        // &["f-o"]   window["f-o"]   !!!TODO!!!
        case '=':
            str = joiner(str);
            code = 'r_.push(e_(v_(' + str + ', d_)));\n';
            break;
        // `-` output un-escape value
        case '-':
            str = joiner(str);
            code = 'r_.push(v_(' + str + ', d_));\n';
            break;
        // `/` output an ending right-brace of `for` iteration
        case '/':
            code = '}\n';
            break;
        // `^` beginning a `for` iteration which is used for an array data
        case '^':
            code = str.replace(forReg, function (all, list, item, key) {
                list = joiner(list);
                key = key || 'k'+ cid +'_';
                return 'var '+key+', l'+ cid +'_='+list+'.length, '+item+';\n'+
                'for('+key+'=0; '+key+'<l'+ cid +'_; '+key+'++){\n'+
                    item+' = '+list+'['+key+'];\n';
            });
            if (str === code) {
                console.error('wrong grammer with template ^' + str);
                code = 'if(0){';
            }
            cid++;
            break;
        // `#` beginning a `for` iteration which is used for a hash data
        case '#':
            code = str.replace(forReg, function (all, list, item, key) {
                list = joiner(list);
                key = key || 'k'+ cid +'_';
                return 'var '+key+', '+ item +';\n'+
                'for('+key+' in '+list+'){\n'+
                    'if(!'+list+'.hasOwnProperty('+key+')) return;\n'+
                    item+' = '+list+'['+key+'];\n';
            });
            cid++;
            break;
        // ?
        case '?':
            code = 'if('+joiner(str)+'){';
            break;
        // !
        case '!':
            code = 'if(!'+joiner(str)+'){';
            break;
        // :
        case ':':
            code = str.length ? '}else if('+joiner(str)+'){' : '}else{';
            break;
        // >
        case '>':
            code = str.replace(/^(\w+)(?:\s(.+))?$/, function (all, name, dataKey) {
                name = name.indexOf('-') > -1 ? '["'+name+'"]' : DOT+name;
                dataKey = dataKey ? joiner(dataKey) : 'd_';
                return 'r_.push(ns'+name+'('+dataKey+'));\n';
            });
            break;
        default:
    }
    return code;
}

function joiner (str) {
    var ret;
    if (str.charAt(0) === '&') {
        ret = str.substr(1)
    } else {
        ret = DATA + (str.charAt(0) !== '[' ? DOT : EMPTY) + str;
    }
    return ret;
}

// ## delimiter ##

// init delimiter

// to make a new deliliter with the given opening tag and closing tag
// @param {string} oTag opening tag
// @param {string} cTag closing tag
// function setDelimiter(oTag, cTag) {
//     oTag = oTag || '{{';
//     cTag = cTag || '}}';
// }

// function escapeDelimiter(str) {
//     return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
// }

// ## escaper ##

var escapeReg = /[&<>"']/g,
    escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
    };

// callback for escaper replacement
function escapeCallback(match) {
    return escapeMap[match];
}

// escape html chars
// NOTE: 'escape' is reserved word in javascript
function escaper(str) {
    return str == null ? EMPTY : EMPTY + String(str).replace(escapeReg, escapeCallback);
}

// ## escaper ##

// get templates from the script tags in document.
function extract() {
    var scripts = document.getElementsByTagName('script'),
        script;
    for (var i = 0, l = scripts.length; i < l; i++) {
        script = scripts[i];
        if (!script.getAttribute('compiled') && script.id && script.innerHTML && script.type === 'text/x-eoraptor') {
            compile(script.id, trim(script.innerHTML));
            script.setAttribute('compiled','1');
        }
    }
}

var FUNCTION = 'function';
function value(v, data) {
    return typeof v === FUNCTION ? v.apply(data, [data]) : 
        v === 0 ? '0' : (v || EMPTY);
}

(typeof module != 'undefined' && module.exports) ?
    (module.exports = eoraptor) :
    (typeof define === 'function' && define.amd) ?
        define('eoraptor', [], function() { return eoraptor; }) :
        (glob.eoraptor = eoraptor);
})(this);
