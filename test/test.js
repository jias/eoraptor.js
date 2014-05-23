function xit () {}
function xdescribe() {}
var ec = eoraptor.compile;

describe('no expression', function () {
    it('a', function(){
        var tpl = ec('a');
        expect(tpl.render({})).to.be('a');
    });
    it('"a "', function(){
        var tpl = ec('a ');
        expect(tpl.render({})).to.be('a ');
    });
    it('" a"', function(){
        var tpl = ec(' a');
        expect(tpl.render({})).to.be(' a');
    });
    it('" a "', function(){
        var tpl = ec(' a ');
        expect(tpl.render({})).to.be(' a ');
    });
    it('"{{=a"', function() {
        var tpl = ec('{{=a');
        expect(tpl.render({})).to.be('{{=a');
    });
    it('"a{{="', function() {
        var tpl = ec('a{{=');
        expect(tpl.render({})).to.be('a{{=');
    });
    it('"{{=a{{="', function() {
        var tpl = ec('{{=a{{=');
        expect(tpl.render({})).to.be('{{=a{{=');
    });
    it('"}}a"', function() {
        var tpl = ec('}}a');
        expect(tpl.render({})).to.be('}}a');
    });
    it('"a}}"', function() {
        var tpl = ec('a}}');
        expect(tpl.render({})).to.be('a}}');
    });
    it('"{{=}}"', function() {
        var tpl = ec('{{=}}');
        console.log(tpl.source);
        expect(tpl.render({})).to.be('{{=}}');
    });
    it('"{{= }}"', function() {
        var tpl = ec('{{= }}');
        console.log(tpl.source);
        expect(tpl.render({})).to.be('{{= }}');
    });
});



describe('variable', function () {

    beforeEach(function () {
        // eoraptor.cache = {};
    });

    // afterEach(function () {
    //     // console.log(JSON.stringify(eoraptor.cache));
    // });




    // it('eoraptor.a.source', function(){
    //     var tpl = ec('a', {id:'aTpl'});
    //     expect(tpl.source).to.be(eoraptor.aTpl.source);
    // });

    it('"{{=a}}"', function(){
        var tpl = ec('{{=a}}');
        var ret = tpl({a:'v'});
        expect(ret).to.be('v');
    });
    it('"{{= a }}"', function(){
        var tpl = ec('{{= a }}');
        var ret = tpl({a:'v'});
        expect(ret).to.be('v');
    });
    it('"{{=["a"]}}"', function(){
        var tpl = ec('{{=["a"]}}');
        var ret = tpl({
            a: 'v'
        });
        expect(ret).to.be('v');
    });
    it('"{{=[\'a\']}}"', function(){
        var tpl = ec("{{=['a']}}");
        var ret = tpl({
            a: 'v'
        });
        expect(ret).to.be('v');
    });

    it('quote escaped in template, "{{=["a\\\"a"]}}"', function(){
        var tpl = ec('{{=["a\\\"a"]}}');
        var ret = tpl({
            'a"a': 'v'
        });
        expect(ret).to.be('v');
    });
    it('"-" in template, {{=["first-name"]}}', function(){
        var tpl = ec('{{=["first-name"]}}');
        var ret = tpl({'first-name':'a'});
        expect(ret).to.be('a');
    });


    it('"a{{=b{{=c}}"', function(){
        var tpl = ec('a{{=b{{=c}}');
        var ret = tpl({
            c: 'c'
        });
        expect(ret).to.be('a{{=bc');
    });

    it('"{{{=a}}"', function(){
        var tpl = ec('{{{=a}}');
        var ret = tpl({a:'v'});
        expect(ret).to.be('{v');
    });

    it('"{{=a.b}}"', function(){
        var tpl = ec('{{=a.b}}');
        var ret = tpl({
            a: { b: 'v' }
        });
        expect(ret).to.be('v');
    });

    it('key is missing', function(){
        var tpl = ec('{{=a}}');
        var ret = tpl({});
        expect(ret).to.be('');
    });

    it('output escaped value', function(){
        var tpl = ec('{{=a}}');
        var ret = tpl({a: 'hello "eoraptor"'});
        expect(ret).to.be('hello &quot;eoraptor&quot;');
    });

    it('output unescaped value', function(){
        var tpl = ec('{{-a}}');
        var ret = tpl({a: 'hello "eoraptor"'});
        expect(ret).to.be('hello "eoraptor"');
    });

    it('output unescaped value: html', function(){
        var tpl = ec('{{-a}}');
        var ret = tpl({a:'<h1>a</h1>'});
        expect(ret).to.be('<h1>a</h1>');
    });

});

describe('array', function () {

    xit('normal', function(){
        var tpl = ec('{{^list}}'+
              'D'+
            '{{/}}');
        var ret = tpl({
            list: ['a', 'b', 'c']
        });
        console.log('___',tpl.source);
        expect(ret).to.be('a0b1c2');
    });

    it('defining your own "item" and "key" for array iterating', function(){
        var tpl = ec('{{^list item key}}'+
              '{{=&item}}{{=&key}}'+
            '{{/}}');
        var ret = tpl({
            list: ['a', 'b', 'c']
        });
        console.log(tpl.source);
        expect(ret).to.be('a0b1c2');
    });

    it('key with "-"', function(){
        var tpl = ec('{{^["list-foo"] item key}}'+
              '{{=&item}}{{=&key}}'+
            '{{/}}');
        var ret = tpl({
            'list-foo': ['a', 'b', 'c']
        });
        expect(ret).to.be('a0b1c2');
    });

    it('outer variable within an iteration', function(){
        var tpl = ec('{{^list item key}}'+
              '<i>{{=foo}} {{=&item}}</i>'+
            '{{/}}');
        var ret = tpl({
            foo: 'foo',
            list: ['a', 'b', 'c']
        });
        expect(ret).to.be(
            '<i>foo a</i>'+
            '<i>foo b</i>'+
            '<i>foo c</i>'
        );
    });

    it('nested array', function(){
        var tpl = ec('{{^sections section}}'+
            '<li class="key">{{=&section.key}}</li>'+
            '{{^&section.citys city}}'+
                '<li class="city">{{=&city}}</li>'+
            '{{/}}'+
        '{{/}}');
        var ret = tpl({
            sections: [
                {
                    key: 'A',
                    citys: [
                        '鞍山',
                        '安庆'
                    ]
                },
                {
                    key: 'B',
                    citys: [
                        '北京',
                        '保定'
                    ]
                }
            ]
        });
        // console.log(tpl.source);
        expect(ret).to.be(
            '<li class="key">A</li>'+
            '<li class="city">鞍山</li>'+
            '<li class="city">安庆</li>'+
            '<li class="key">B</li>'+
            '<li class="city">北京</li>'+
            '<li class="city">保定</li>'
        );
    });

    // TODO: filter: isArray
    xit('items with different type', function(){
        var tpl = ec('{{^list item}}'+
            '{{?&item|isArray}}'+
                '<li class="city">{{=&item[0]}}</li>'+
            '{{:}}'+
                '<li class="key">{{=&item}}</li>'+
            '{{/}}'+
        '{{/}}');
        var ret = tpl({
            list: [
                'A',
                ['鞍山'],
                ['安庆'],
                'B',
                ['北京'],
                ['保定']
            ]
        });
        console.log(tpl.source);
        expect(ret).to.be(
            '<li class="key">A</li>'+
            '<li class="city">鞍山</li>'+
            '<li class="city">安庆</li>'+
            '<li class="key">B</li>'+
            '<li class="city">北京</li>'+
            '<li class="city">保定</li>'
        );
    });

    it('global array', function () {
        window.list = ['a', 'b', 'c'];
        var tpl = ec('{{^&list item key}}{{=&item}}{{=&key}}{{/}}');
        console.log(tpl.source);
        var ret = tpl({});
        expect(ret).to.be('a0b1c2');
    });

});

describe('object', function () {

    it('normal', function(){
        var tpl = ec('{{#a item key}}'+
              '<li>{{=&key}}:{{=&item}}</li>'+
            '{{/}}');

        var ret = tpl({
            a: {
              x: 'X',
              y: 'Y'
            }
        });

        expect(ret).to.be(
            '<li>x:X</li>'+
            '<li>y:Y</li>'
        );
    });

    xit('<%this.name%>', function(){
        eoraptor.setDelimiter('<%', '%>');
        var tpl = ec('<%this.name%>');
        // console.log(tpl.source);
        expect(tpl.render({name:'eoraptor.js'})).to.be('eoraptor.js');
        eoraptor.setDelimiter();
    });

    xit('{{{', function(){
        // 连续出现了多次'{', 应该正确的识别出靠内的表达式{{code}}
        var tpl = ec('function(){'+
            '{{=this.code}}'+
        '}');
        // console.log(tpl.source.replace(/[\r\t\n]/g, ''));
        expect(tpl.source.replace(/[\r\t\n]/g, '')).to.be('function (data) {var t__=data, r__=[], e__=eoraptor.escape;r__.push("function(){");r__.push(e__(t__.code));r__.push("}");return r__.join("");}');
    });


});


describe('if elseif else', function () {
    it('if like true', function(){
        var tpl = ec('{{?foo}}foo{{/}}');
        var ret = tpl({
            foo: 1
        });
        expect(ret).to.be('foo');
    });

    it('if like false', function(){
        var tpl = ec('{{!foo}}foo{{/}}');
        var ret = tpl({
            foo: 0
        });
        expect(ret).to.be('foo');
    });
});

describe('partial', function () {
    xit('partial', function(){
        // data for navi partial template
        // {
        //     list: [
        //         {
        //             text: 'foo'
        //         },
        //         {
        //             text: 'boo'
        //         }
        //     ]
        // }

        // define the 'navi' partial template
        ec('<ul>{{^this.list item}}'+
            '<li>{{=item.text}}</li>'+
        '{{/}}</ul>', {id:'navi'});

        // data for slider partial template
        // {
        //     list: [
        //         {
        //             img: '1.jpg'
        //         },
        //         {
        //             img: '2.jpg'
        //         }
        //     ]
        // }

        // define 'slider' partial template
        ec('<ul>{{^this.list item}}'+
            '<li>{{=item.img}}</li>'+
        '{{/}}</ul>', {id:'slider'});

        // group data with the same format for each part above
        var data = {
            navi: {
                list: [
                    {
                        text: 'foo'
                    },
                    {
                        text: 'boo'
                    }
                ]
            },
            slider: {
                list: [
                    {
                        img: '1.jpg'
                    },
                    {
                        img: '2.jpg'
                    }
                ]
            }
        };

        // group template
        var tpl = ec('<p>navi:</p>'+
            '{{>navi this.navi}}'+
            '<p>slider:</p>'+
            '{{>slider this.slider}}');

        // console.log(tpl.source);

        expect(tpl.render(data)).to.be('<p>navi:</p><ul><li>foo</li><li>boo</li></ul><p>slider:</p><ul><li>1.jpg</li><li>2.jpg</li></ul>');

    });
});

describe('extract', function () {
    it('extract from script', function(){
        eoraptor.extract();
        expect(typeof eoraptor.t1).to.be('function');
        expect(typeof eoraptor.t2).to.be('function');
    });    
});

xdescribe('inner-system test', function () {
    var ec = eoraptor.compile;
    var eachReg = /^t__(.+?)\s(\w+)\s?(\w+)?.*$/;

    it('eoraptor.template is function', function () {
        expect(ec).to.be.a('function');
    });

    it('eachReg this.a b', function(){
        var m1 = 't__.a b'.match(eachReg);
        expect(m1[0]).to.be("t__.a b");
        expect(m1[1]).to.be(".a");
        expect(m1[2]).to.be("b");
    });

    it('eachReg this.a.a b', function(){
        var m1 = 't__.a.a b'.match(eachReg);
        expect(m1[0]).to.be("t__.a.a b");
        expect(m1[1]).to.be(".a.a");
        expect(m1[2]).to.be("b");
    });

    it('eachReg this["a"] b', function(){
        var m1 = 't__["a"] b'.match(eachReg);
        expect(m1[0]).to.be('t__["a"] b');
        expect(m1[1]).to.be('["a"]');
        expect(m1[2]).to.be("b");
    });

    it('eachReg this["a"].a b', function(){
        var m1 = 't__["a"].a b'.match(eachReg);
        expect(m1[0]).to.be('t__["a"].a b');
        expect(m1[1]).to.be('["a"].a');
        expect(m1[2]).to.be("b");
    });

    it('eachReg this.a["a"] b', function(){
        var m1 = 't__.a["a"] b'.match(eachReg);
        expect(m1[0]).to.be('t__.a["a"] b');
        expect(m1[1]).to.be('.a["a"]');
        expect(m1[2]).to.be("b");
    });

    it('eachReg this["a"]["a"] b', function(){
        var m1 = 't__["a"]["a"] b'.match(eachReg);
        expect(m1[0]).to.be('t__["a"]["a"] b');
        expect(m1[1]).to.be('["a"]["a"]');
        expect(m1[2]).to.be("b");
    });

    it('eachReg this["a-a"] b', function(){
        var m1 = 't__["a-a"] b'.match(eachReg);
        expect(m1[0]).to.be('t__["a-a"] b');
        expect(m1[1]).to.be('["a-a"]');
        expect(m1[2]).to.be("b");
    });

});

xdescribe('pipe filter test', function () {

    var t = eoraptor.compile('{{#this.list item}}{{item}}{{/}}');
    // console.log(t.source);
    // console.log(t({list: ['ccc', 'ddd']}));

//    var pipeReg = /\s?\|\s?[a-zA-Z]+:.+)$/;
//    var reg = /\|[a-zA-Z]+/g;
//    var t1 = "name['|cat']|cat:'abc'|omit:40";
//    var t2 = "name['|cat:'] | omit:40 | format:yyyy-mm-dd";
//    t2 = "'yyyy-mm\'-dd'";

//    var t3 = t2.replace(/'.*?'/g, '_');
//    console.log(t3);
//
//    var t = eoraptor.compile('{{--this.name}}');
//    console.log(t.source);
//    console.log(t({name:2}));

//    console.log("----------")
//    while (match = reg.exec(t1)) {
//
//        console.log(match);
//    }
});
