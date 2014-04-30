function xit () {}
function xdescribe() {}
describe('usage test', function () {
    var ec = eoraptor.compile;

    beforeEach(function () {
        // eoraptor.cache = {};
    });

    // afterEach(function () {
    //     // console.log(JSON.stringify(eoraptor.cache));
    // });

    it('no expression: foo', function(){
        var tpl = ec('foo');
        expect(tpl.render({})).to.be('foo');
    });
    it(' no expression: " foo "', function(){
        var tpl = ec(' foo ');
        expect(tpl.render({})).to.be(' foo ');
    });
    it('variable: a{{=b{{=c}}', function(){
        var tpl = ec('a{{=b{{=c}}');
        var ret = tpl({
            c: 'c'
        });
        expect(ret).to.be('a{{=bc');
    });


    it('eoraptor.foo.source', function(){
        var tpl = ec('foo', {id:'fooTpl'});
        expect(tpl.source).to.be(eoraptor.fooTpl.source);
    });

    it('variable: {{=foo}}', function(){
        var tpl = ec('{{=foo}}');
        var ret = tpl({foo:'v'});
        expect(ret).to.be('v');
    });
    it('variable: {{= foo }}', function(){
        var tpl = ec('{{= foo }}');
        var ret = tpl({foo:'v'});
        expect(ret).to.be('v');
    });
    it('variable: {{=["foo"]}}', function(){
        var tpl = ec('{{=["foo"]}}');
        var ret = tpl({
            foo: 'v'
        });
        expect(ret).to.be('v');
    });
    it("variable: {{=['foo']}}", function(){
        var tpl = ec("{{=['foo']}}");
        var ret = tpl({
            foo: 'v'
        });
        expect(ret).to.be('v');
    });

    it('variable: {{=["foo\\\"foo"]}}', function(){
        var tpl = ec('{{=["foo\\\"foo"]}}');
        var ret = tpl({
            'foo"foo': 'v'
        });
        expect(ret).to.be('v');
    });
    it('key with "-": {{=["first-name"]}}', function(){
        var tpl = ec('{{=["first-name"]}}');
        var ret = tpl({'first-name':'foo'});
        expect(ret).to.be('foo');
    });


    it('variable: "{{=foo.boo}}"', function(){
        var tpl = ec('{{=foo.boo}}');
        var ret = tpl({
            foo: { boo: 'v' }
        });
        expect(ret).to.be('v');
    });

    it('{{=foo}}, no such key', function(){
        var tpl = ec('{{=foo}}');
        var ret = tpl({});
        expect(ret).to.be('');
    });

    it('escape', function(){
        var tpl = ec('{{=foo}}');
        var ret = tpl({foo: 'hello "eoraptor"'});
        expect(ret).to.be('hello &quot;eoraptor&quot;');
    });

    it('no-escape', function(){
        var tpl = ec('{{-foo}}');
        var ret = tpl({foo: 'hello "eoraptor"'});
        expect(ret).to.be('hello "eoraptor"');
    });

    it('html', function(){
        var tpl = ec('{{-foo}}');
        var ret = tpl({foo:'<h1>foo</h1>'});
        expect(ret).to.be('<h1>foo</h1>');
    });

    it('w:{{=w}}, h:{{=h}}', function(){
        var tpl = ec('w:{{=w}}, h:{{=h}}');
        var ret = tpl({
            w:10,
            h:20
        });
        // console.log(tpl.source);
        expect(ret).to.be('w:10, h:20');
    });

    it('iterate an array', function(){
        var tpl = ec('{{^list item key}}'+
              '<i>{{=&item}}</i>'+
            '{{/}}');
        var ret = tpl({
            list: ['a', 'b', 'c']
        });
        expect(ret).to.be('<i>a</i><i>b</i><i>c</i>');
    });

    it('iterate an array, key with "-"', function(){
        var tpl = ec('{{^["list-foo"] item key}}'+
              '<i>{{=&item}}</i>'+
            '{{/}}');
        var ret = tpl({
            'list-foo': ['a', 'b', 'c']
        });
        expect(ret).to.be('<i>a</i><i>b</i><i>c</i>');
    });

    it('output variable in iteration', function(){
        var tpl = ec('{{^list item key}}'+
              '<i>{{=foo}} {{=&item}}</i>'+
            '{{/}}');
        var ret = tpl({
            foo: 'foo',
            list: ['a', 'b', 'c']
        });
        expect(ret).to.be('<i>foo a</i><i>foo b</i><i>foo c</i>');
    });

    it('iterate an object', function(){
        var tpl = ec('<ul>'+
            '{{#devDependencies version moudle}}'+
              '<li>{{=&moudle}}:{{=&version}}</li>'+
            '{{/}}'+
        '</ul>');

        var ret = tpl({
            "devDependencies": {
              "grunt-contrib-uglify": "latest",
              "grunt-contrib-watch": "latest"
            }
        });

        var result = '<ul>'+
            '<li>grunt-contrib-uglify:latest</li>'+
            '<li>grunt-contrib-watch:latest</li>'+
        '</ul>';
        expect(ret).to.be(result);
    });

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


    // it('if "foo"==true', function(){
    //     var data = {
    //         foo: 'foo'
    //     };
    //     var tpl = '{{?foo}}foo{{/}}';
    //     var result = 'foo';
    //     // console.log(ec(tpl).source);
    //     expect(ec(tpl).render(data)).to.be(result);
    // });

    // it('if ""==true', function(){
    //     var data = {
    //         foo: ''
    //     };
    //     var tpl = '{{?this.foo}}foo{{/}}';
    //     var result = '';
    //     // console.log(ec(tpl).source);
    //     expect(ec(tpl).render(data)).to.be(result);
    // });

    // it('if null==true', function(){
    //     var data = {
    //         foo: null
    //     };
    //     var tpl = '{{?this.foo}}foo{{/}}';
    //     var result = '';
    //     // console.log(ec(tpl).source);
    //     expect(ec(tpl).render(data)).to.be(result);
    // });

    // it('if undefined==true', function(){
    //     var data = {
    //         foo: undefined
    //     };
    //     var tpl = '{{?this.foo}}foo{{/}}';
    //     var result = '';
    //     // console.log(ec(tpl).source);
    //     expect(ec(tpl).render(data)).to.be(result);
    // });

    // it('if undefined==true', function(){
    //     var data = {};
    //     var tpl = '{{?this.foo}}foo{{/}}';
    //     var result = '';
    //     // console.log(ec(tpl).source);
    //     expect(ec(tpl).render(data)).to.be(result);
    // });

    // it('if false', function(){
    //     var data = {
    //         foo: false
    //     };
    //     var tpl = '{{?this.foo}}foo{{/}}';
    //     var result = '';
    //     // console.log(ec(tpl).source);
    //     expect(ec(tpl).render(data)).to.be(result);
    // });

    // it('if ===value', function(){
    //     var data = {
    //         foo: 'show'
    //     };
    //     var tpl = '{{?this.foo === "show"}}foo{{/}}';
    //     var result = 'foo';
    //     // console.log(ec(tpl).source);
    //     expect(ec(tpl).render(data)).to.be(result);
    // });

    // it('if !==value', function(){
    //     var data = {
    //         foo: 'show'
    //     };
    //     var tpl = '{{?this.foo !== "show"}}{{/}}';
    //     var result = '';
    //     // console.log(ec(tpl).source);
    //     expect(ec(tpl).render(data)).to.be(result);
    // });

    // it('if else', function(){
    //     var data = {
    //         foo: false
    //     };
    //     var tpl = '{{?this.foo}}'+
    //         'foo'+
    //     '{{:}}'+
    //         'boo'+
    //     '{{/}}';
    //     var result = 'boo';
    //     // console.log(ec(tpl).source);
    //     expect(ec(tpl).render(data)).to.be(result);
    // });

    xit('{{?this.number === 1}}', function(){
        var tpl = "the number is {{?this.number === 1}}"+
            "one"+
        "{{:}}"+
            "unknown"+
        "{{/}}";
        // console.log(ec(tpl).source);
        expect(ec(tpl).render({})).to.be('the number is unknown');
    });

    xit('{{?this.foo === "x"}}', function(){
        var data = {
            foo: 'foo'
        };
        var tpl = '{{?this.foo === "x"}}'+
            'x'+
        '{{:this.foo === "foo"}}'+
            'foo'+
        '{{:}}'+
            'y'+
        '{{/}}';
        var result = 'foo';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    xit('comments', function(){
        var data = {
            foo: 'foo'
        };
        var tpl = '{{=this.foo}}{{!ignore}}';
        var result = 'foo';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    xit('none tag flag', function(){
        var tpl = '{{@this.foo}}';
        expect(ec(tpl).render()).to.be(tpl);
    });

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

    xit('extract from script', function(){
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
