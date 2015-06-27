## TODO

* customizable output filter plugin
* performance testing and comparision
* official site

## 前导符号含义说明

|符号|含义|示例|
|-|-|-|
|无符号|当前作用域下的键值|{{xxx}}|
|?|相当于 if (xxx like true) 语句|{{?xxx}}|
|:|相当于 else 语句|{{:}}|
|:xxx|相当于 else if(xxx like true) 语句|{{:xxx}}|
|/|相当于任意JS代码块的结束符|{{/}}|
|/xxx|同上，含义完全一样|{{/if}}|
|^|遍历数组|{{^list}}{{xxx}}{{/}}|
|#|遍历Hash对象|{{#book}}|
|&|对遍历过程中当前item的引用 + 当前item的内置属性的引用|{{&item.name}}|
|~|多语言|{{~yes}}|
|>|子模板|{{>item}}|
|!|注释内容|{{!xxx}}|

## 还没有使用的前导符号

|符号|含义|示例|
|-|-|-|
|@|未使用|未使用|
|%|未使用|未使用|
|*|未使用|未使用|
|-|未使用|未使用|
|<|未使用|未使用|
|"|未使用|未使用|
|'|未使用|未使用|
|;|未使用|未使用|

## 禁止使用的前导符号

|符号|含义|示例|
|-|-|-|
|$|未使用|未使用|
|_|未使用|未使用|


## 非前导符号含义说明

|符号|含义|示例|
|-|-|-|
|一个竖线|管道符号|{{xxx一个竖线nl2br}}|
|\\|转义下一个字符|{{a\\\'b}}|
|＝|赋值|{{>slide list=slideList}}|
|.|作用域的下一层|{{book.price}}|





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
3
{{:typeIs4}}
4
{{:}}
5
{{/}}

if (a===true)
{{? a|is}}

if (a==true)
{{? a|like}}


if (a===1 || a===2)
{{? a|is 1 2}}

if (a==1 || a==2)
{{? a|like 1 2}}


if (a===1 && b===2)
{{? a|showButton 1 b 2}}
E.filter('showButton', function (a, v1, b, v2) {
    return a===v1 && b===v2;
})



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

{{^list parent}}
	<li>
		<h2>{{title}}</h2>
        {{^list child}}
        	输出上一层的标题：{{&parent.title}} 相当于 {{../title}}
        	如果当前item意外纯在'&parent.title'链，那么使用&child强调当前item
        	如：{{&child.&group.title}}
        	当前item的父作用域可以省略&child，只在有冲突时或多层嵌套时才使用。
        	{{title}} === {{&child.title}}
        	
        	当前item的内置属性包括，不要担心性能问题，所有属性在内部都是get方法
        	{{&child.&index}} 从0开始的索引
        	{{&child.&count}} 从1开始的索引
        	{{?&child.&first}} 是否是第1个item
        	{{?&child.&last}}  是否是最后1个item
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

#### 多语言

```html
{{$yes}} 相当于handlebars的 {{i18n 'yes'}}
{{$yes}}
```

#### 管道

```html
{{xxx|nl2br}} \n转换成<br/>
{{xxx|fn}} 取this.xxx()的返回值
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

## 参考

* http://mozilla.github.io/nunjucks/