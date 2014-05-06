* customizable output filter plugin
* performance testing and comparision

* official site


#### 定义模板

method 1: compile('xxx')

```js
eoraptor.compile('name', '{{=this.name}}');
```

method 2: compile()

```html
<script id="name" type="text/x-eoraptor">
{{=this.name}}
</script>
<script>
eoraptor.compile();
</script>
```


#### 变量

```html
{{=name}} escaped
{{=name|uppercase}}
{{=[first-name]}}
{{=[first-name]|uppercase}}
{{=~item.name}}
```

#### if - else if - else

```html
{{?this.status === 1}}

{{?this.status === this.foo}}
{{?status === foo}} v vs v

{{?status === "foo"}} v vs str

{{?status === @true|@false|@null|@undefined|@123}} v vs 

{{?status === true}} if (this.status === true)
{{?status === true}} if (this.status === this["true"])
{{?status === "true"}} if (this.status === "true")
{{?status === 1}} if (this.status === 1)
{{?status === "1"}} if (this.status === "1")
{{?status === ?}} if (this.status === this["1"])


{{?this.status === 1}}

{{:this.status === 2}}

{{:}}

{{/}}




```

模板只应该关心变量是什么，而不应该关心变量是怎么来的。

```js
{{?typeIs3}}
33
{{:typeIs4}}
44
{{:}}
55
{{/}}

// render
if (t__.typeIs3()) {
	r__.push("33");
} else if (t__.typeIs4()) {
	r__.push("44");
} else {
	r__.push("55");
}
```

```js
{
   type: 3,
   typeIs3: function (ctx) {
       return ctx.type === 3;
   },
   typeIs4: function (ctx) {
	   return ctx.type ===4;
   }
}
```

#### 遍历数组 `Array > A > ^`

```js
var data = {
	list : [
    	{
        	title: xxx,
            keywords: [xxx, xxx, ...]
        },
        ...
    ]
}

<ul>
{{^list item key}}
	<li {{?@item.first}}class="first"{{/}}>
		<h2>{{=item.title}}</h2>
        {{^item.keywords word}}
        	{{=word}}
            {{!@word.last}},{{/}}
        {{/}}
    </li>
{{/}}
</ul>
```

```html
{{^list item key}}
    {{=item.name}}:{{=item.age}}
    {{?&item.isFirst}}
    	first
    {{/}}
    {{}}
    {{=list.length}}
{{/}}
```

#### 遍历对象  `Hash > H > #`

```html
{{#book item key}}
    {{=key}}:{{=item}}
{{/}}
```

#### 注释

```html
{{!xxx}}
```

#### 子模板

```html
{{>partialName slider}}
```

p1 data:

```js
var p1 = {
	options: 'options',
    list: [
    	{
        	name: 'item1'
        }
    ]
}
```

p1 template:

```html
{{=options}}
{{^list item key}}
	{{=item.name}}
{{/}}
```

p2 data:

```js
var p1 = {
	setting: 'setting',
    list: [
    	{
        	name: 'item1'
        }
    ]
}
```

p2 template:

```html
{{=setting}}
{{^list item key}}
	{{=item.name}}
{{/}}
```

p1 + p2 data

```js
var p1_2 = {
	setting: 'setting',
    p1: {
        list: [
    		{
        		name: 'item1'
        	}
    	]
    }
    p2: {
        list: [
    		{
        		name: 'item1'
        	}
    	]
    }
}
```

```html
{{>p1 p1 options=setting}}
{{>p1 p2 setting=setting}}
```

#### 管道

```html
{{=this.xxx|nl2br}} \n转换成<br/>
{{=this.xxx|fn}} 取this.xxx()的返回值
```

#### 特殊情况处理

如果数据的`key`的值包括特殊的字符，如

```js
var data = {
    "a'b" : 'has quote'
}
```

这个时候在定义模板时，应该注意转义的写法

```html
{{=this["a'b"]}} ok
{{=this['a\\\'b']}} ok
{{=this['a\'b']}} bad
```


```html
{{^this.list item key}}
	{{?item.img}}
    	{{?item.state==1}}
        	img and state 1
        {{/}}
        {{?item.state==2}}
        	img and state 2
        {{/}}
    {{:}}
    	{{>textItem}}
    {{/}}
{{/}}
```




