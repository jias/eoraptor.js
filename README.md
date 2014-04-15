# eoraptor.js

A mini expression javascript template engine without any dependence. Compatible with client-side and server-side.

## Features

1. Cleaner grammer than `mustache`.
1. Without `with` statement in compiled function, recognized performance problems will be shielded.
1. More detailed error logging.
1. Build-in `index` support when iterating an array.
1. Build-in `else if` support.
1. TODO: Customizable output filter plugin.
1. More useful partial template than `mustache`.
1. Matching [eoraptor-jst](https://www.npmjs.org/package/eoraptor-jst) tool in npm package.

## Unit test

A quick glance at the [unit test](http://jias.github.io/eoraptor.js/test/test.html) maybe the most direct way to dive in.

## Usage

#### Client-side

Including the eoraptor engine by script tag.

```html
<script src="path/to/eoraptor.min.js"></script>
```

The classic `hello world` example achieved through a variety of ways.

###### Method 1：Compiling a template from a string parameter.

```js
var hw = eoraptor.compile("Hello {{this.name}}!");
hw({"name": "world"});
// "Hello world!"
```
Usually, this method is more suitable for compiling a pretty simple template.

###### Method 2：Compiling templates from the script tags, with a `text/x-eoraptor` type and an unique `id` property.

```html
<script type="text/x-eoraptor" id="hw">
Hello {{this.name}}!
</script>
<script>
eoraptor.extract();
eoraptor.hw({"name": "world"});
// "Hello world!"
</script>
```

###### Method 3: Including the precompiled file which contains all template functions and rendering directly without calling`eoraptor.compile()` or `exraptor.extract()` api.

```html
<script src="path/to/eoraptor-precompiled.js"></script>
<script>
eoraptor.hw({"name": "world"});
</script>
</html>
```

The name of `eoraptor-precompiled.js` file and the namespace of all templaltes，`eoraptor` in the example above, would be any other word as you like(a declaration in options of pre-compiling tool), and the content in the file would look like this:

```js
(function () {
    // NOTE: The reality would be more complex than here
    var ns = this["namespaceYouLike"] || {};

    ns["hw"] = function (data){
        var t__ = data, r__ = [];
        r__.push("Hello ");
        r__.push(t__.name);
        r__.push("!");
        return r__.join("");
    };
    // more functions
    // ns["foo"] = function (data) {};
    // ...
});
```

NOTE: The reality of `namespace declaration` would be more complex than here, more details will be found in pre-compiling section.

## API

#### Compiling and caching a template

`eoraptor.compile(template)` / `eoraptor.compile(id, template)`

* template: the template string.
* id: a unique name will be used as the `key` for inner cache. If none, the `template` itself will be used instead.

In order to improve the performance of compiling, this method will save a cache for every template string, when the same template is passed in, it will skip the parsing step and return the cache directly.

The method returns a compiled `renderable` function with two properties, the `render` property is a reference to the function itself which takes one parameter as the context data. The `source` property is only the string form of the `render`, used by the pre-compile tool.

Demo:

```js
var fooTpl = eoraptor.compile('foo','{{this.foo}}');
// method 1
fooTpl.render(data);
// method 2
fooTpl(data);
// method 3
eoraptor.foo(data);
```

#### Compiling templates from script tags

`eoraptor.compile()` / `eoraptor.extract()`

When the `compile` method is called with zero parameter, it will get the same effect of `extract` method, that all script tags with a "text/x-eoraptor" type and an unique id property will be processed as individual template definitions.

Demo:

```html
<script id="sayMorning" type="text/x-eoraptor">
Good morning, {{this.name}}!
</script>
<script id="sayAfternoon" type="text/x-eoraptor">
Good afternoon, {{this.name}}!
</script>

<script type="text/javascript">
eoraptor.compile();
eoraptor.sayMorning; // "function"
eoraptor.sayAfternoon; // "function"
</script>
```

After calling the `extract`, the script tag will be added a `compiled` attribute, so it would be ignored in next calling.

```html
<script id="sayMorning" type="text/x-eoraptor" compiled="1">
Good morning, {{this.name}}!
</script>
```

#### Setting delimeter

`eoraptor.setDelimeter(start, end)`

* start: optional, the start flag for delimeter, default to '{{'.
* end: optional, the start flag for delimeter, default to '}}'.

Demo:

```js
eoraptor.setDelimiter('<%', '%>');
var tpl = eoraptor.compile('<%this.name%>');
tpl({"name": "eoraptor.js"});
// "eoraptor.js"
```

## Template

#### variable

`{{this.key}}` / `{{this["key"]}}`

* key: required, the direct value of the `key` in context data.

> Under the hood, the function returned by `eoraptor.compile()` is builded without `with` statement, so the expression needs to start with `this.` prefix and it will not throw errors like `underscore`.

Demo: output the value of the `key` in context data.

```js
var tpl = eoraptor.compile("{{this.name}}");
tpl.render({"name": "eoraptor.js"});
// "eoraptor.js"
```

Demo: if there is no such `key` in context data.

```js
var tpl = eoraptor.compile("{{this.name}}");
tpl.render({});
// "" empty string
```

#### html-escaped variable:

`{{@this.key}}` / `{{@this["key"]}}`

* key: required, the direct value of the `key` in context data.

demo: output the html-escaped value of the `key` in context data.

```js
var tpl = eoraptor.compile("{{@this.name}}");
tpl.render({"name": "<h1> eoraptor.js </h1>"});
// "&lt;h1&gt; eoraptor.js &lt;/h1&gt;"
```

#### if block:

START with: `{{#anyValue}}` / `{{#this.key}}` / `{{#this["key"]}}` / `{{#anyValue vs anyValue}}`

* anyValue: any value of any types like `foo`, `true`, `[]`, `{}`, etc.
* key: required, the direct value of the `key` in context data.
* vs: available comparation flags contains `==`, `===`, `!=`, `!==`, `>=`, `<=`, `>`, `<`

END with: `{{/}}`

Demo: To determine whether the `if()` is like `true`, comparing by `==`.

```js
var data = {"foo": 1};
var tpl = eoraptor.compile("{{#this.foo}}like true{{/}}");
tpl.render(data);
// "like true"
```

Demo: To determine whether the `if()` is `true`, comparing by `===`.

```js
var data = {"foo": 1};
var tpl = eoraptor.compile("{{#this.foo===true}}is true{{/}}");
tpl.render(data);
// "" empty string
```

#### else if block:

START with: `{{^anyValue}}` / `{{^this.key}}` / `{{^this["key"]}}` / `{{^anyValue vs anyValue}}`

* anyValue: any value of any types like `foo`, `true`, `[]`, `{}`, etc.
* key: the direct value of the `key` in context data.
* vs: available comparation flags contains `==`, `===`, `!=`, `!==`, `>=`, `<=`, `>`, `<`

END with: `{{/}}`

Demo:

```js
var tpl = eoraptor.compile("the number is {{#this.number === 1}}"+
    "one"+
"{{^this.number === 2}}"+
    "two"+
"{{/}}");
tpl.render({"number": 2});
// "the number is two"
```

#### else block:

START with: `{{^}}`

END with: `{{/}}`

Demo:

```js
var tpl = eoraptor.compile("the number is {{#this.number === 1}}"+
    "one"+
"{{^}}"+
    "unknown"+
"{{/}}");
tpl.render({});
// "the number is unknown"
```

#### iteration block:

`{{#this.key currentItem[ currentKey]}}`

* key: required, the direct value of the `key` in context data.
* currentItem: required, assign a variable to represent the current item in an iterative process.
* currentKey: optional, default to `k__`, assign a variable to represent the current key in an iterative process. It will be a `number` value(like 0, 1, 2, etc.) or a `string` value determined by the iterative object, say, `array` or `object`.

Demo: traversal of an array

```js
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
```

Demo: enumerating an object

```js
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
```

#### comment block 

`{{!comment}}`

* comment, any word for the commit.

Demo:

```js
var tpl = eoraptor.compile("{{!hello}}eoraptor.js");
tpl.render(); // "eoraptor.js"
```

#### end of a block

`{{/}}`

Demo: if - elseif - else - end

```js
    var tpl = eoraptor.compile(
        "{{#this.status === 1}}"+
            "one"+
        "{{^this.status === 2}}"+
            "two"+
        "{{^}}"+
            "unknown"+
        "{{/}}");
```

#### partial template

`{{>partialName[ partialContext]}}`

* partialName: required, the name of partial template
* partialContext: optional, the data context for partial template function

Most of time, each UI compontent in the page is coded by several people, and everyone has the responsibility to keep their code clean, so the `key` in the partial template may be the same as each other. As you will see in the code lower, both templates, `navi` and `slider`, have the `list` key, so it will not work correctly with a public context data.

> Unless changing `list` into `naviList` and `sliderList`, but it's clearly violates the reused principle.

At this time, we can resolve the `key` conflict by assignasing an independent context data to partial template when defining a combined one.

Compiling two partial templates for later use, say `navi` and `slider`:

```js
eoraptor.compile('navi', '<ul>{{#this.list item}}'+
    '<li>{{item.text}}</li>'+
'{{/}}</ul>');

eoraptor.compile('slider', '<ul>{{#this.list item}}'+
    '<li>{{item.img}}</li>'+
'{{/}}</ul>');
```

Below we compile and render a combined template, including two partial templates defined above.

```js
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
```

## License

The JavaScript Templates script is released under the [MIT license](http://opensource.org/licenses/MIT).

## Author

@gnosaij / [www.joy-studio.com](http://www.joy-studio.com)


## Changelog

* 2014-04-03
  - add `extract` method
* 2014-04-01
  - add `eoraptor-jst` support
* 2014-03-21
  - initial version

