(function(){

var eoraptor = {
    name: 'eoraptor.js',
    version: '#VERSION#',
    _: {
        e: escaper,
        v: value
    }
};

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

// ## value ##
var EMPTY = '';
var FUNCTION = 'function';
function value(v, data) {
    return typeof v === FUNCTION ? v.apply(data, [data]) : (EMPTY + v || EMPTY);
}

var __ = eoraptor._;


this["tpl"] = this["tpl"] || {};

var ns=this["tpl"], e_=__.e, v_=__.v;


ns["a"] = function (data) {
var d_=data, r_=[];
var k_, l_=d_.list.length, item;
for(k_=0; k_<l_; k_++){
item = d_.list[k_];
r_.push("<i>");
r_.push(e_(v_(item, d_)));
r_.push("</i>");
}
return r_.join("");
};

ns["b"] = function (data) {
var d_=data, r_=[];
r_.push(e_(v_(d_.b, d_)));
r_.push(ns.a(d_.a));
return r_.join("");
};

})();