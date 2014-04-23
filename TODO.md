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
{{=this.name}} escaped
{{-this.name}} unescaped
```

#### if - else if - else

```html
{{?this.status === 1}}

{{:this.status === 2}}

{{:}}

{{/}}
```

#### 遍历数组 `Array > A > ^`

```html
{{^this.list item key}}
    {{=item.name}}:{{=item.age}}
{{/}}
```

#### 遍历对象  `Hash > H > #`

```html
{{#this.book item key}}
    {{=key}}:{{=item}}
{{/}}
```

#### 注释

```html
{{!xxx}}
{{!}}
```

#### 子模板

```html
{{>partialName this.slider}}
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
{{=this.options}}
{{^this.list item key}}
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
{{=this.setting}}
{{^this.list item key}}
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
{{>p1 this.p1 options=this.setting}}
{{>p1 this.p2 setting=this.setting}}
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




