describe('inner-system test', function () {
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


describe('usage test', function () {
    var ec = eoraptor.compile;

    beforeEach(function () {
        // eoraptor.cache = {};
    });

    // afterEach(function () {
    //     // console.log(JSON.stringify(eoraptor.cache));
    // });

    it('eoraptor.js', function(){
        var tpl = ec('eoraptor.js');
        // console.log(tpl.source);
        expect(tpl.render({})).to.be('eoraptor.js');
    });

    it('eoraptor.foo.source', function(){
        var fooTpl = ec('foo', 'eoraptor.js');
        // console.log(tpl.source);
        expect(fooTpl.source).to.be(eoraptor.foo.source);
    });

    it(' eoraptor.js ', function(){
        var tpl = ec(' eoraptor.js ');
        // console.log(tpl.source);
        expect(tpl.render({})).to.be(' eoraptor.js ');
    });

    it('{{this.name}}', function(){
        expect(ec('{{this.name}}').render({name:'eoraptor.js'})).to.be('eoraptor.js');
    });

    it('{{ this.name }}', function(){
        var tpl = ec('{{    this.name }}');
        // console.log(tpl.source);
        expect(tpl.render({name:'eoraptor.js'})).to.be('eoraptor.js');
    });

    it('{{this.name}}, no such key', function(){
        // console.log(ec('{{this.name}}').source);
        expect(ec('{{this.name}}').render({})).to.be('');
    });

    it('{{}},quote value', function(){
        // console.log(ec('{{this.name}}').source);
        expect(ec('{{this.name}}').render({name:'hello "eoraptor"'})).to.be('hello "eoraptor"');
    });

    it('{{}},quote key', function(){
        // console.log(ec('{{this["first-name"]}}').source);
        expect(ec('{{this["first-name"]}}').render({'first-name':'hello "eoraptor"'})).to.be('hello "eoraptor"');
    });  

    it('{{}},quote string', function(){
        // console.log(ec('hello "eoraptor"').source);
        expect(ec('hello "eoraptor"').render()).to.be('hello "eoraptor"');
    });   

    it('{{}},html', function(){
        expect(ec('{{this.name}}').render({name:'<h1>eoraptor</h1>'})).to.be('<h1>eoraptor</h1>');
    });

    it('{{}} + "-"', function(){
        // console.log(ec('{{this["first-name"]}}').source);
        expect(ec('{{this["first-name"]}}').render({'first-name':'<h1>eoraptor</h1>'}))
        .to.be('<h1>eoraptor</h1>');
    });

    it('w:{{this.w}}, h:{{this.h}}', function(){
        expect(ec('w:{{this.w}}, h:{{this.h}}').render({
            w:10,
            h:20
        })).to.be('w:10, h:20');
    });

    it('{{@}}', function(){
        expect(ec('{{@this.name}}').render({name:'eoraptor'})).to.be('eoraptor'); 
    });

    it('{{@}} + html', function(){
        expect(ec('{{@this.name}}').render({name:'<h1>eoraptor</h1>'})).to.be('&lt;h1&gt;eoraptor&lt;/h1&gt;'); 
    });

    it('array', function(){
        var data = {
            features: [
                'NO "with"',
                'precompiler'
            ]
        };

        var tpl = '<ul>'+
            '{{#this.features item key}}'+
              '<li>{{key}}:{{item}}</li>'+
            '{{/}}'+
        '</ul>';

        var result = '<ul><li>0:NO "with"</li><li>1:precompiler</li></ul>';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    it('this.variable in block', function(){
        var data = {
            name: 'eoraptor',
            features: [
                'simple',
                'standalone'
            ]
        };

        var tpl = '<ul>'+
            '{{#this.features item}}'+
              '<li>{{this.name}} is {{item}}</li>'+
            '{{/}}'+
        '</ul>';

        var result = '<ul><li>eoraptor is simple</li><li>eoraptor is standalone</li></ul>';
        expect(ec(tpl).render(data)).to.be(result);
    });

    it('object', function(){
        var data = {
            book: {
                author: 'tim',
                price: '$9.00'
            }
        };

        var tpl = '<ul>'+
            '{{#this.book item key}}'+
              '<li>{{key}}:{{item}}</li>'+
            '{{/}}'+
        '</ul>';

        var result = '<ul><li>author:tim</li><li>price:$9.00</li></ul>';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    it('object "a-b" key', function(){
        var data = {
            'new-book': {
                author: 'tim',
                price: '$9.00'
            }
        };

        var tpl = '<ul>'+
            '{{#this["new-book"] item key aaa}}'+
              '<li>{{key}}:{{item}}</li>'+
            '{{/}}'+
        '</ul>';

        var result = '<ul><li>author:tim</li><li>price:$9.00</li></ul>';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });


    it('if true', function(){
        var data = {
            foo: true
        };
        var tpl = '{{#this.foo}}foo{{/}}';
        var result = 'foo';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    it('if 1==true', function(){
        var data = {
            foo: 1
        };
        var tpl = '{{#this.foo}}foo{{/}}';
        var result = 'foo';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    it('if "foo"==true', function(){
        var data = {
            foo: 'foo'
        };
        var tpl = '{{#this.foo}}foo{{/}}';
        var result = 'foo';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    it('if ""==true', function(){
        var data = {
            foo: ''
        };
        var tpl = '{{#this.foo}}foo{{/}}';
        var result = '';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    it('if null==true', function(){
        var data = {
            foo: null
        };
        var tpl = '{{#this.foo}}foo{{/}}';
        var result = '';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    it('if undefined==true', function(){
        var data = {
            foo: undefined
        };
        var tpl = '{{#this.foo}}foo{{/}}';
        var result = '';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    it('if undefined==true', function(){
        var data = {};
        var tpl = '{{#this.foo}}foo{{/}}';
        var result = '';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    it('if false', function(){
        var data = {
            foo: false
        };
        var tpl = '{{#this.foo}}foo{{/}}';
        var result = '';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    it('if ===value', function(){
        var data = {
            foo: 'show'
        };
        var tpl = '{{#this.foo === "show"}}foo{{/}}';
        var result = 'foo';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    it('if !==value', function(){
        var data = {
            foo: 'show'
        };
        var tpl = '{{#this.foo !== "show"}}{{/}}';
        var result = '';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    it('if else', function(){
        var data = {
            foo: false
        };
        var tpl = '{{#this.foo}}'+
            'foo'+
        '{{^}}'+
            'boo'+
        '{{/}}';
        var result = 'boo';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    it('{{#this.number === 1}}', function(){
        var tpl = "the number is {{#this.number === 1}}"+
            "one"+
        "{{^}}"+
            "unknown"+
        "{{/}}";
        // console.log(ec(tpl).source);
        expect(ec(tpl).render({})).to.be('the number is unknown');
    });

    it('{{#this.foo === "x"}}', function(){
        var data = {
            foo: 'foo'
        };
        var tpl = '{{#this.foo === "x"}}'+
            'x'+
        '{{^this.foo === "foo"}}'+
            'foo'+
        '{{^}}'+
            'y'+
        '{{/}}';
        var result = 'foo';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    it('comments', function(){
        var data = {
            foo: 'foo'
        };
        var tpl = '{{this.foo}}{{!ignore}}';
        var result = 'foo';
        // console.log(ec(tpl).source);
        expect(ec(tpl).render(data)).to.be(result);
    });

    it('partial', function(){
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
        eoraptor.compile('navi', '<ul>{{#this.list item}}'+
            '<li>{{item.text}}</li>'+
        '{{/}}</ul>');

        // data for slider  partial template
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
        eoraptor.compile('slider', '<ul>{{#this.list item}}'+
            '<li>{{item.img}}</li>'+
        '{{/}}</ul>');

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
        var tpl = eoraptor.compile('<p>navi:</p>'+
            '{{>navi this.navi}}'+
            '<p>slider:</p>'+
            '{{>slider this.slider}}');

        // console.log(tpl.source);

        expect(tpl.render(data)).to.be('<p>navi:</p><ul><li>foo</li><li>boo</li></ul><p>slider:</p><ul><li>1.jpg</li><li>2.jpg</li></ul>');
        
    });

    it('<%this.name%>', function(){
        eoraptor.setDelimiter('<%', '%>');
        var tpl = ec('<%this.name%>');
        // console.log(tpl.source);
        expect(tpl.render({name:'eoraptor.js'})).to.be('eoraptor.js');
        eoraptor.setDelimiter();
    });

    it('function(){{{code}}}', function(){
        // 连续出现了多次'{', 应该正确的识别出靠内的表达式{{code}}
        var tpl = ec('function(){'+
            '{{this.code}}'+
        '}');
        expect(tpl.source.replace(/[\r\t\n]/g, '')).to.be('function (data) {var t__=data, r__=[];r__.push("function(){");r__.push(t__.code);r__.push("}");return r__.join("");}');
    });

    it('function(){{code}}', function(){
        // 连续出现了多次'{', 应该正确的识别出靠内的表达式{{code}}
        eoraptor.setDelimiter('{', '}');
        var tpl = ec('function(){'+
            '{this.code}'+
        '}');
        eoraptor.setDelimiter();
        expect(tpl.source.replace(/[\r\t\n]/g, '')).to.be('function (data) {var t__=data, r__=[];r__.push("function(){");r__.push(t__.code);r__.push("}");return r__.join("");}');
    });

    it('query from script', function(){
        eoraptor.query();
        expect(typeof eoraptor.t1).to.be('function');
        expect(typeof eoraptor.t2).to.be('function');
    });
});

