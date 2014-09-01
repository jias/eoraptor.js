## TODO

* customizable output filter plugin
* performance testing and comparision

* official site


## variables

```
{{name}}       escaped
{{name|raw}}   unescaped
{{first-name}} special-normal character
{{N\\.A\\.}}   dot character in the key
```

## if/elseif/else

```
{{?typeIs3}}
33
{{:typeIs4}}
44
{{:}}
55
{{/}}
```

## `Array > A > ^`

```
var data = {
    list: [
        {
            title: 'alinw',
            list: [
                {
                    title: 'search'
                },
                {
                    title: 'dialog'
                }
            ]
        }
    ]
};

{{^list|xxx group}}
	<li>
		<h2>{{title}}</h2>
        {{^list ui}}
        	输出上一层的标题：{{&group.title}}
        	如果当前item意外纯在'&group.title'链，那么使用&ui强调当前item
        	如：{{&ui.&group.title}}
        	当前item的父作用域可以省略$ui，只在有冲突时或多层嵌套时才使用。
        	{{title}} === {{&ui.title}}
        	
        	当前item的内置属性包括，不要担心性能问题，所有属性在内部都是get方法
        	{{&ui.&index}} 从0开始的索引
        	{{&ui.&count}} 从1开始的索引
        	{{&ui.&first}} 是否是第1个item
        	{{&ui.&last}}  是否是最后1个item
        {{/}}
    </li>
{{/}}
</ul>
```

##  `Hash > H > #`

```html
{{#book item key}}
    {{&key}}:{{&item}}
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
{{=this['a\\\'b']}} ok
```






