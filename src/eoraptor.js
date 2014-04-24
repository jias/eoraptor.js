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
    name: 'eoraptor.js',
    version: '#VERSION#',
    compile: compile,
    setDelimiter: setDelimiter,
    escape: escaper,
    extract: extract,
    debug: false
};

//var delimiterReg = /\{(?!\{\{)\{\s*(.+?)\s*\}\}/g;

var THIS = 't__',
    EMPTY = '',
    OTAG = '{{',
    CTAG = '}}',
    SIGN = '=-/^#?:!>',
    signType = {
        '=': 1,
        '-': 2,
        '/': 3,
        '^': 4,
        '#': 5,
        '?': 6,
        ':': 7,
        '!': 8,
        '>': 9
    },
    charType = {
        'string': 0,
        'oTag': -1,
        'cTag': 1
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
        '7': ':',
        '8': '!',
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

// to compile a template string to callable render
// @param {string} str a template string
// @param {object} options optional
// @param {string} options.id the unique name for the template
// @param {string} options.oTag set a one-off opening tag
// TODO oTag cTag
function compile (str, options) {
    var id;
    var render;

    str = str || '';
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
            result = new Function('data', code)(data);
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
    var buffer = [], code = ['var t__=data, r__=[], e__=eoraptor.escape;\n'], item;
    for (var i=0, l=token.length; i<l; i++) {
        item = token[i];
        switch (item.type) {
            case undefined:
                buffer.push(item.str);
                break;
            case -1:
                code.push(makeText(buffer.join('')));
                buffer = [];
                break;
            case 1: 
                code.push(makeJS(buffer.join(''), item.sign));
                buffer = [];
                break;
        }
    }
    code.push(makeText(buffer.join('')));
    code.push('return r__.join("");');
    return code.join('');
}

// @return {array} token
function parse (str, oTag, cTag) {

    // console.log('%c'+str+' '+str.length, 'color:#fff;background-color:orange;');
    var oTag0 = oTag.charAt(0);
    var cTag0 = cTag.charAt(0);
    var status = {
        buffer: [],
        // 0: normal / -1: open / 1: close
        // tag: 0,
        // inTag: false,
        // 0: normal
        // -1: [' open
        // 1: '] close
        // -2: [" open
        // 2: "] close
        // when it's less than zero, the current char would must be within a sb.
        // sb: 0,
        // 0: normal
        // "'": ['
        // '"': ["
        // sbQuote: 0,
        // inSB: false,
        // 用于告知主循环可以跨过的长度
        jump: 0,
        // 收集存字符串文本，tag内的不应该收集
        // chip:'',
        // one of FLAG's chars
        sign:0,
        token: [],
        lastOTag: null
    };
    // initial stack entry
    status.entry = status.token;

    var i = 0, l = str.length, char;
    for (i= 0; i<l; i++) {
        // console.log('%cindex:'+i, 'color:green;');
        char = str.charAt(i);

        // console.log('%cinTag: '+status.inTag+' inSB: '+status.inSB+' sign: '+status.sign, 'color:#ccc;');
        if (char === oTag0) {
            var lastOTag = isOTag(str, oTag, i, status)
            if (lastOTag) {
                status.lastOTag = lastOTag;
                status.token.push(lastOTag);
                i += status.jump;
                status.jump = 0;
                continue;
            }
        }

        if (char === cTag0) {
            var lastCTag = isCTag(str, cTag, i, status);
            if (lastCTag) {
                status.token.push(lastCTag);
                status.lastOTag.type = -1;
                status.lastOTag = null;
                i += status.jump;
                status.jump = 0;
                // collect(status.token, status);
                // status.entry = status.token = [];
                continue;
            }
        }

        status.token.push({
            index: i,
            str: char
        });
        // if (!isInSB(status) && (char === oTag0 && isOTag(str, oTag, i, status))
        // || (char === cTag0 && isCTag(str, cTag, i, status))) {
        //     console.log('%c'+log.tag[status.tag]+log.sign[status.sign], 'color:#fff;background-color:red;');
        //     i += status.jump;
        //     make(status);
        //     // if it is a closing tag
        //     if (status.tag === 1) { 
        //         status.tag = 0;
        //         status.sign = 0;
        //     }
        //     resetStatus(status);
        //     continue;
        // }

        // if (char === '[' && isOSB(str, i, status)) {
        //     console.log('%c'+str.substr(i, 2), 'color:#fff;background-color:gray;');
        //     status.chip += '[' + status.sbQuote;
        //     i++;
        //     resetStatus(status);
        //     continue;
        // } else if (char === status.sbQuote && isCSB(char, str, i, status)) {
        //     console.log('%c'+str.substr(i, 2), 'color:#fff;background-color:gray;');
        //     status.chip += status.sbQuote + ']';
        //     i++;
        //     status.sb = 0;
        //     status.sbQuote = 0;
        //     resetStatus(status);
        //     continue;
        // }

        // status.chip += char;
        // console.log(status.chip);
    }
    // status.chip && makeText(status);

    // lastCollect(status.token, status);

    
    // console.log(status.token);
    // console.log(status.code.join(''));
    // return token.join('');//.replace(/[\r\t\n]/g, empty););
    return status.token;
}

// Is it the first char of an opening tag?
function isOTag (str, oTag, index, status) {
    var l = oTag.length, s = str.substr(index, l), sign = str.charAt(index+l);
    // NOTE 要保证sign有值 如果当前的index已经是字符串尾部 如'foo{{' sign为空
    if (oTag === s && sign &&SIGN.indexOf(sign) > -1) {
        status.jump = l;

        // status.lastOTag = {
        //     str: s + sign,
        //     index: index,
        //     sign: signType[str.charAt(index+l)],
        //     nodes: nodes
        // };
        // status.entry.push(status.lastOTag);
        // status.entry = nodes;
        // status.tag = -1;
        // status.inTag = true;
        // status.sign = signType[str.charAt(index+l)];
        return {
            str: s + sign,
            index: index,
            sign: signType[str.charAt(index+l)]
        };
    }
}

// Is it the first char of a closing tag?
function isCTag (str, cTag, index, status) {
    var s = str.substr(index, cTag.length);
    if (cTag === s && status.lastOTag) {
        status.jump = cTag.length - 1;

        // status.tag = 1;
        // status.inTag = false;
        return {
            str: s,
            index: index,
            type: 1,
            sign: status.lastOTag.sign
        };
    }
}

function isInTag (status) {
    return status.tag < 0;
}

// Is it the first char of an opening square bracket expression?
function isOSB (str, index, status) {
    var nextChar = str.charAt(index+1);
    if (nextChar === '"') {
        status.sb = -2;
        status.sbQuote = nextChar;
    }
    if (nextChar === "'") {
        status.sb = -1;
        status.sbQuote = nextChar;
    }
    if (status.sbQuote) {
        status.inSB = true;
        // status.chip += '[' + nextChar;
        return true;
    }
}

// Is it the first char of a closing square bracket expression?
function isCSB (char, str, index, status) {
    if (str.charAt(index+1) === ']') {
        if (char === '"') {
            status.sb = 2;
        }
        if (char === "'") {
            status.sb = 1;
        }
        status.inSB = false;
        status.jump = 1;
        return true;
    }
}

// Is the status on a position between the square bracket expression?
function isInSB (status) {
    return status.sb < 0;
}

// function collect (token, status, js) {
//     var i=0, l=token.length, item, buffer = '';
//     for (i; i<l; i++) {
//         item = token[i];
//         if (item.type === 1) {
//             buffer += item.str;
//         } else if (item.type === 2) {
//             if (!js && buffer) {
//                 status.code.push(makeText(buffer));
//                 buffer = '';
//             }
//             status.code.push(makeJS(collect(item.nodes, status, true), item.sign));
//         } else if (item.nodes) {
//             buffer += item.str;
//             if (!js && buffer) {
//                 status.code.push(makeText(buffer));
//                 buffer = '';
//             }
//             buffer += collect(item.nodes, status);
//             buffer && status.code.push(makeText(buffer));
//         }
//     }
//     !js && buffer && status.code.push(makeText(buffer));
//     return buffer;
// }

// function collect (token, status, self) {
//     var buffer = status.buffer;
//     var i=0, l=token.length, item;
//     for (i; i<l; i++) {
//         item = token[i];

//         if (item.type === 2) {
//             status.code.push(makeText(buffer.join('')));
//             buffer = [];
//         }

//         if (item.type === 1) {
//             buffer.push(item.str);
//         } else if (item.nodes) {
//             buffer.push(item.str);
//             collect(item.nodes, status, true);
//         }
//     }

//     // !self && console.log(status.buffer);
// }



// function lastCollect (token, status, self) {
//     var i=0, l=token.length, item, buffer = '';
//     for (i; i<l; i++) {
//         item = token[i];
//         if (item.type === 1) {
//             buffer += item.str;
//         } else if (item.nodes) {
//             buffer += item.str;
//             buffer += lastCollect(item.nodes, status, true);
//         }
//     }
//     !self && buffer && status.code.push(makeText(buffer));
//     return buffer;
// }

// function make (status) {
//     console.log('___make:', status.chip);

//         // 如果刚进入tag，那么之前的chip肯定是普通字符串
//         if (status.inTag) {
//             makeText(status);
//         } else {
//             makeJS(status);
//         }
        
//         status.chip = '';

// }

// status中除jump以为的值，需要保持值得对应的标识出现才恢复到0
// function resetStatus (status) {
//     status.jump = 0;
// }

function makeText (str) {
    return 'r__.push("' + str.replace(/"/g, '\\"') + '");\n';
}

// TODO: check {{=this["this"]}}
var forReg = /^t__(.+?)\s(\w+)\s?(\w+)?.*$/;
function makeJS (str, sign) {
    var str = str.replace(thisReg, THIS);
    // console.log('makeJS(\'%s\', %s)', str, log.sign[sign]);
    var code = '';
    switch (sign) {
        // =
        case 1:
            code = 'r__.push(e__('+str+'));\n';
            break;
        // -
        case 2:
            code = 'r__.push('+str+');\n';
            break;
        // /
        case 3:
            code = '}\n';
            break;
        // ^
        case 4:
            code = str.replace(forReg, function (all, list, item, key) {
                key = key || 'k__';
                return 'var '+key+', l=t__'+list+'.length, '+item+';\n'+
                'for('+key+'=0; '+key+'<l; '+key+'++){\n'+
                    item+' = t__'+list+'['+key+'];\n';
            });
            break;
        // #
        case 5:
            code = str.replace(forReg, function (all, list, item, key) {
                key = key || 'k__';
                return 'var '+key+', '+ item +';\n'+
                'for('+key+' in t__'+list+'){\n'+
                    'if(!t__'+list+'.hasOwnProperty('+key+')) return;\n'+
                    item+' = t__'+list+'['+key+'];\n';
            });
            break;
        // ?
        case 6:
            code = 'if('+str+'){';
            break;
        // :
        case 7:
            code = str.length ? '}else if('+str+'){' : '}else{';
            break;
        // !
        case 8:
            code = '';
            break;
        // >
        case 9:
            code = str.replace(/^(\w+)\s(.+)$/, function (all, name, data) {
                name = name.indexOf('-') > -1 ? '["'+name+'"]' : '.'+name;
                return 'r__.push(eoraptor'+name+'.render('+data+'));\n';
            });
            break;          
        default:
    }
    return code;
}

// ## delimiter ##

// init delimiter

// to make a new deliliter with the given opening tag and closing tag
// @param {string} oTag opening tag
// @param {string} cTag closing tag
function setDelimiter(oTag, cTag) {
    oTag = oTag || '{{';
    cTag = cTag || '}}';
}

function escapeDelimiter(str) {
    return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

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

(typeof module != 'undefined' && module.exports) ?
    (module.exports = eoraptor) :
    (typeof define === 'function' && define.amd) ?
        define('eoraptor', [], function() { return eoraptor; }) :
        (glob.eoraptor = eoraptor);
})(this);
