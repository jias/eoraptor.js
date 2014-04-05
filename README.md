# eoraptor.js

A tiny, super-easy javascript template engine without any dependence.

## Features

1. Cleaner grammer than `mustache`.
1. Without `with` statement in compiled function, recognized performance problems will be shielded.
1. More detailed error logging.
1. Build-in `index` support when iterating an array.
2. Build-in `else if` support.
1. TODO: Customizable output filter plugin(0%).
1. More useful partial template than `mustache`.
1. Matching [eoraptor-jst](https://www.npmjs.org/package/eoraptor-jst) tool in npm package.

## Unit test

A quick glance at the [unit test](http://jias.github.io/eoraptor.js/test/test.html) maybe the most direct way to dive in.

## Overview

#### Base

Compiling and rendering in browser runtime:

Demo: 

    <!DOCTYPE html>
    <html>
    <body>
        <script src="path/to/eoraptor.js"></script>
        <script>
            var helloTplFn = eoraptor.compile("Hello {{this.name}}!");
            console.log(helloTplFn({"name": "world"}));
            console.log(helloTplFn.source);
        </script>
    </body>
    </html>

#### Advanced

Rendering directly with the template function that has been pre-compiled before. 

Demo: 

    <!DOCTYPE html>
    <html>
    <body>
        <script src="path/to/eoraptor.js"></script>
        <script src="path/to/eoraptor.render.js"></script>
        <script>
            console.log(eoraptor.helloTplFn({"name": "world"}));
        </script>
    </body>
    </html>

The name of `eoraptor.render.js` file would be any other word as you like when pre-compile building in nodejs, and the content in it would look like this:

    // content in eoraptor.render.js
    (function () {
        var eo = eoraptor;
        eo.helloTplFn = function (data){
            var t__=data, r__=[];
            r__.push("Hello ");
            r__.push(t__.name);
            r__.push("!");
            return r__.join("");
        };
        // other pre-compiled function
        // ...
    });
    
The `key` of a render template is get from the template file's name.

    // content in helloTplFn.js
    Hello {{this.name}}!


## API

#### Compiling and caching a template

`eoraptor.compile(template)` / `eoraptor.compile(name, template)`

* template: the template string.
* name: the name will be used as the `key` of eorapter.cache. 

The method returns an `template function` with two properties:

    function render(data) {...};
    render.render = render;
    render.source = 'function(data) {...}';
    return render;

The `render` function(and it's `render` method) is a compiled template function which takes one parameter as the context data. The `source` is only the string form of the `render` function, used by the pre-compile tool.

Demo:

    var tpl = eoraptor.compile('...');
    // method 1
    tpl.render(data);
    // method 2
    tpl(data);

#### Setting delimeter

`eoraptor.setDelimeter(start, end)`

* start: optional, the start flag for delimeter, default to '{{'.
* end: optional, the start flag for delimeter, default to '}}'.

Demo:

    eoraptor.setDelimiter('<%', '%>');
    var tpl = eoraptor.compile('<%this.name%>');
    tpl({"name": "eoraptor.js"});
    // "eoraptor.js"

#### Initailizing complex templates from script tags and caching them

`eoraptor.query()`

Demo:

    <!DOCTYPE html>
    <html>
    <body>
        <script src="path/to/eoraptor.js"></script>
        <script id="t1" type="text/html">
        <ul>
            {{#this.book item key}}
                <li>{{key}}:{{item}}</li>
            {{/}}
        </ul>
        </script>
        <script>
            eoraptor.query();
            eoraptor.t1({
                book: {
                    author: 'tim',
                    price: '$9.00'
                }
            });
        </script>
    </body>
    </html>

After calling the `query`, the script tag will be added a `compiled` attribute, so it would be ignored in next calling.

    <script id="t1" type="text/html" compiled="1">
    <ul>
        {{#this.book item key}}
            <li>{{key}}:{{item}}</li>
        {{/}}
    </ul>
    </script>

## Template

#### variable

`{{this.key}}` / `{{this["key"]}}`

* key: required, the direct value of the `key` in context data.

> Under the hood, the function returned by `eoraptor.compile()` is builded without `with` statement, so the expression needs to start with `this.` prefix and it will not throw errors like `underscore`.

Demo: output the value of the `key` in context data. 

    var tpl = eoraptor.compile("{{this.name}}");
    tpl.render({"name": "eoraptor.js"}); 
    // "eoraptor.js"

Demo: if there is no such `key` in context data.

    var tpl = eoraptor.compile("{{this.name}}");
    tpl.render({}); 
    // "" empty string


#### html-escaped variable: 

`{{@this.key}}` / `{{@this["key"]}}`

* key: required, the direct value of the `key` in context data.

demo: output the html-escaped value of the `key` in context data. 

    var tpl = eoraptor.compile("{{@this.name}}");
    tpl.render({"name": "<h1> eoraptor.js </h1>"}); 
    // "&lt;h1&gt; eoraptor.js &lt;/h1&gt;"


#### if block: 

START with: `{{#anyValue}}` / `{{#this.key}}` / `{{#this["key"]}}` / `{{#anyValue vs anyValue}}`

* anyValue: any value of any types like `foo`, `true`, `[]`, `{}`, etc.
* key: required, the direct value of the `key` in context data.
* vs: available comparation flags contains `==`, `===`, `!=`, `!==`, `>=`, `<=`, `>`, `<`

END with: `{{/}}`

Demo: To determine whether the `if()` is like `true`, comparing by `==`.

    var data = {"foo": 1};
    var tpl = eoraptor.compile("{{#this.foo}}like true{{/}}");
    tpl.render(data); 
    // "like true"

Demo: To determine whether the `if()` is `true`, comparing by `===`.

    var data = {"foo": 1};
    var tpl = eoraptor.compile("{{#this.foo===true}}is true{{/}}");
    tpl.render(data); 
    // "" empty string

    
#### else if block: 

START with: `{{^anyValue}}` / `{{^this.key}}` / `{{^this["key"]}}` / `{{^anyValue vs anyValue}}`

* anyValue: any value of any types like `foo`, `true`, `[]`, `{}`, etc.
* key: the direct value of the `key` in context data.
* vs: available comparation flags contains `==`, `===`, `!=`, `!==`, `>=`, `<=`, `>`, `<`

END with: `{{/}}`

Demo:

    var tpl = eoraptor.compile("the number is {{#this.number === 1}}"+
        "one"+
    "{{^this.number === 2}}"+
        "two"+
    "{{/}}");
    tpl.render({"number": 2}); 
    // "the number is two"


#### else block: 

START with: `{{^}}`

END with: `{{/}}`

Demo:

    var tpl = eoraptor.compile("the number is {{#this.number === 1}}"+
        "one"+
    "{{^}}"+
        "unknown"+
    "{{/}}");
    tpl.render({}); 
    // "the number is unknown"


#### iteration block: 

`{{#this.key currentItem[ currentKey]}}`

* key: required, the direct value of the `key` in context data.
* currentItem: required, assign a variable to represent the current item in an iterative process.
* currentKey: optional, default to `k__`, assign a variable to represent the current key in an iterative process. It will be a `number` value(like 0, 1, 2, etc.) or a `string` value determined by the iterative object, say, `array` or `object`.

Demo: traversal of an array

    var data = {
        name: "eoraptor",
        features: [
            "simple",
            "standalone"
        ]
    };
    var tpl = eoraptor.compile("<ul>"+
        "{{#this.features item key}}"+
            "<li>{{key}}. {{this.name}} is {{item}}</li>"+
        "{{/}}"+
    "</ul>");
    tpl.render(data); 
    // "<ul><li>0. eoraptor is simple</li><li>1. eoraptor is standalone</li></ul>"

Demo: enumerating an object

    var data = {
        features: {
            "grammer": "simple",
            "dependency": "standalone"
        }
    };
    var tpl = eoraptor.compile("<ul>"+
        "{{#this.features item key}}"+
            "<li>{{key}}:{{item}}</li>"+
        "{{/}}"+
    "</ul>");
    tpl.render(data); 
    // "<ul><li>grammer:simple</li><li>dependency:standalone</li></ul>"


#### comment block 

`{{!comment}}`

* comment, any word for the commit.

Demo: 

    var tpl = eoraptor.compile("{{!hello}}eoraptor.js");
    tpl.render(); // "eoraptor.js"

   
#### end of a block 

`{{/}}`

Demo: if - elseif - else - end

    var tpl = eoraptor.compile(
        "{{#this.status === 1}}"+
            "one"+
        "{{^this.status === 2}}"+
            "two"+
        "{{^}}"+
            "unknown"+
        "{{/}}");


#### partial template 

`{{>partialName[ partialContext]}}`

* partialName: required, the name of partial template
* partialContext: optional, the data context for partial template function

Most of time, each UI compontent in the page is coded 
by several people, and everyone has the responsibility to keep their code clean, so the `key` in the partial template may be the same as each other. As you will see in the code lower, both templates, `navi` and `slider`, have the `list` key, so it will not work correctly with a public context data.

> Unless changing `list` into `naviList` and `sliderList`, but it's clearly violates the reused principle.

At this time, we can resolve the `key` conflict by assignasing an independent context data to partial template when defining a combined one.
    
Compiling two partial templates for later use, say `navi` and `slider`:

    eoraptor.compile('navi', '<ul>{{#this.list item}}'+
        '<li>{{item.text}}</li>'+
    '{{/}}</ul>');
    
    eoraptor.compile('slider', '<ul>{{#this.list item}}'+
        '<li>{{item.img}}</li>'+
    '{{/}}</ul>');

Below we compile and render a combined template, including two partial templates defined above. 

    var tpl = eoraptor.compile(
        '<p>navi:</p>'+
        '{{>navi this.navi}}'+
        '<p>slider:</p>'+
        '{{>slider this.slider}}'
    );
        
    tpl.render({
        navi: {
            list: [
                {text: 'foo'}, {text: 'boo'}
            ]
        },
        slider: {
            list: [
                {img: '1.jpg'}, {img: '2.jpg'}
            ]
        }
    });
    // output:
    //   <p>navi:</p>
    //   <ul><li>foo</li><li>boo</li></ul>
    //   <p>slider:</p>
    //   <ul><li>1.jpg</li><li>2.jpg</li></ul>


## License

The JavaScript Templates script is released under the [MIT license](http://opensource.org/licenses/MIT).

## Author

@gnosaij / [www.joy-studio.com](http://www.joy-studio.com)


## Updates

* 2014-04-03
  - version 1.1.0
  - add `query` method
* 2014-04-01
  - add `eoraptor-jst` support
* 2014-03-21
  - initial version 1.0.0

