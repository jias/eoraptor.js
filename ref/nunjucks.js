// Browser bundle of nunjucks 1.1.0 

(function() {

    var logStyle = 'background-color:orange; color: #fff;'
    var modules = {};
    // file: object.js
    (function() {

        // A simple class system, more documentation to come

        function extend(cls, name, props) {
            // This does that same thing as Object.create, but with support for IE8
            var F = function() {};
            F.prototype = cls.prototype;
            var prototype = new F();

            var fnTest = /xyz/.test(function() {
                xyz;
            }) ? /\bparent\b/ : /.*/;
            props = props || {};

            for (var k in props) {
                var src = props[k];
                var parent = prototype[k];

                // ... 用fnTest.test(src)方法在测试src回调中是否有parent关键字！相当不严谨！
                if (typeof parent == "function" &&
                    typeof src == "function" &&
                    fnTest.test(src)) {
                    // ... 写得晦涩难懂
                    prototype[k] = (function(src, parent) {
                        return function() {
                            // Save the current parent method
                            var tmp = this.parent;

                            // Set parent to the previous method, call, and restore
                            this.parent = parent;
                            var res = src.apply(this, arguments);
                            this.parent = tmp;

                            return res;
                        };
                    })(src, parent);
                } else {
                    prototype[k] = src;
                }
            }

            prototype.typename = name;

            var new_cls = function() {
                if (prototype.init) {
                    prototype.init.apply(this, arguments);
                }
            };

            new_cls.prototype = prototype;
            new_cls.prototype.constructor = new_cls;

            new_cls.extend = function(name, props) {
                if (typeof name == "object") {
                    props = name;
                    name = "anonymous";
                }
                return extend(new_cls, name, props);
            };

            return new_cls;
        }
        console.log('object.js');
        console.dir(extend(Object, "Object", {}));
        modules['object'] = extend(Object, "Object", {});
    })();
    // file: lib.js
    (function() {
        var ArrayProto = Array.prototype;
        var ObjProto = Object.prototype;

        var escapeMap = {
            '&': '&amp;',
            '"': '&quot;',
            "'": '&#39;',
            "<": '&lt;',
            ">": '&gt;'
        };

        var escapeRegex = /[&"'<>]/g;

        var lookupEscape = function(ch) {
            return escapeMap[ch];
        };

        var exports = modules['lib'] = {};

        // ...
        // withPrettyErrors('path', 'xxx', function () {
        //     捕获回调函数中的任何错误
        // })
        exports.withPrettyErrors = function (path, withInternals, func) {
            try {
                return func();
            } catch (e) {
                if (!e.Update) {
                    // not one of ours, cast it
                    e = new exports.TemplateError(e);
                }
                e.Update(path);

                // Unless they marked the dev flag, show them a trace from here
                if (!withInternals) {
                    var old = e;
                    e = new Error(old.message);
                    e.name = old.name;
                }

                throw e;
            }
        };

        exports.TemplateError = function(message, lineno, colno) {
            var err = this;

            if (message instanceof Error) { // for casting regular js errors
                err = message;
                message = message.name + ": " + message.message;
            } else {
                if (Error.captureStackTrace) {
                    Error.captureStackTrace(err);
                }
            }

            err.name = 'Template render error';
            err.message = message;
            err.lineno = lineno;
            err.colno = colno;
            err.firstUpdate = true;

            err.Update = function(path) {
                var message = "(" + (path || "unknown path") + ")";

                // only show lineno + colno next to path of template
                // where error occurred
                if (this.firstUpdate) {
                    if (this.lineno && this.colno) {
                        message += ' [Line ' + this.lineno + ', Column ' + this.colno + ']';
                    } else if (this.lineno) {
                        message += ' [Line ' + this.lineno + ']';
                    }
                }

                message += '\n ';
                if (this.firstUpdate) {
                    message += ' ';
                }

                this.message = message + (this.message || '');
                this.firstUpdate = false;
                return this;
            };

            return err;
        };

        exports.TemplateError.prototype = Error.prototype;

        exports.escape = function(val) {
            return val.replace(escapeRegex, lookupEscape);
        };

        exports.isFunction = function(obj) {
            return ObjProto.toString.call(obj) == '[object Function]';
        };

        exports.isArray = Array.isArray || function(obj) {
            return ObjProto.toString.call(obj) == '[object Array]';
        };

        exports.isString = function(obj) {
            return ObjProto.toString.call(obj) == '[object String]';
        };

        exports.isObject = function(obj) {
            return ObjProto.toString.call(obj) == '[object Object]';
        };

        exports.groupBy = function(obj, val) {
            var result = {};
            var iterator = exports.isFunction(val) ? val : function(obj) {
                return obj[val];
            };
            for (var i = 0; i < obj.length; i++) {
                var value = obj[i];
                var key = iterator(value, i);
                (result[key] || (result[key] = [])).push(value);
            }
            return result;
        };

        exports.toArray = function(obj) {
            return Array.prototype.slice.call(obj);
        };

        exports.without = function(array) {
            var result = [];
            if (!array) {
                return result;
            }
            var index = -1,
                length = array.length,
                contains = exports.toArray(arguments).slice(1);

            while (++index < length) {
                if (exports.indexOf(contains, array[index]) === -1) {
                    result.push(array[index]);
                }
            }
            return result;
        };

        exports.extend = function(obj, obj2) {
            for (var k in obj2) {
                obj[k] = obj2[k];
            }
            return obj;
        };

        exports.repeat = function(char_, n) {
            var str = '';
            for (var i = 0; i < n; i++) {
                str += char_;
            }
            return str;
        };

        exports.each = function(obj, func, context) {
            if (obj == null) {
                return;
            }

            if (ArrayProto.each && obj.each == ArrayProto.each) {
                obj.forEach(func, context);
            } else if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    func.call(context, obj[i], i, obj);
                }
            }
        };

        exports.map = function(obj, func) {
            var results = [];
            if (obj == null) {
                return results;
            }

            if (ArrayProto.map && obj.map === ArrayProto.map) {
                return obj.map(func);
            }

            for (var i = 0; i < obj.length; i++) {
                results[results.length] = func(obj[i], i);
            }

            if (obj.length === +obj.length) {
                results.length = obj.length;
            }

            return results;
        };

        exports.asyncIter = function(arr, iter, cb) {
            var i = -1;

            function next() {
                i++;

                if (i < arr.length) {
                    iter(arr[i], i, next, cb);
                } else {
                    cb();
                }
            }

            next();
        };

        exports.asyncFor = function(obj, iter, cb) {
            var keys = exports.keys(obj);
            var len = keys.length;
            var i = -1;

            function next() {
                i++;
                var k = keys[i];

                if (i < len) {
                    iter(k, obj[k], i, len, next);
                } else {
                    cb();
                }
            }

            next();
        };

        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
        exports.indexOf = Array.prototype.indexOf ?
            function(arr, searchElement, fromIndex) {
                return Array.prototype.indexOf.call(arr, searchElement, fromIndex);
            } :
            function(arr, searchElement, fromIndex) {
                var length = this.length >>> 0; // Hack to convert object.length to a UInt32

                fromIndex = +fromIndex || 0;

                if (Math.abs(fromIndex) === Infinity) {
                    fromIndex = 0;
                }

                if (fromIndex < 0) {
                    fromIndex += length;
                    if (fromIndex < 0) {
                        fromIndex = 0;
                    }
                }

                for (; fromIndex < length; fromIndex++) {
                    if (arr[fromIndex] === searchElement) {
                        return fromIndex;
                    }
                }

                return -1;
            };

        if (!Array.prototype.map) {
            Array.prototype.map = function() {
                throw new Error("map is unimplemented for this js engine");
            };
        }

        exports.keys = function(obj) {
            if (Object.prototype.keys) {
                return obj.keys();
            } else {
                var keys = [];
                for (var k in obj) {
                    if (obj.hasOwnProperty(k)) {
                        keys.push(k);
                    }
                }
                return keys;
            }
        }
    })();
    // file: nodes.js
    (function() {
        // ... 这个util是undefined!!??
        var util = modules["util"];
        var lib = modules["lib"];
        var Object = modules["object"];

        function traverseAndCheck(obj, type, results) {
            if (obj instanceof type) {
                results.push(obj);
            }

            if (obj instanceof Node) {
                obj.findAll(type, results);
            }
        }

        // ... 创建所有节点的超类
        var Node = Object.extend("Node", {
            // ... init方法有第三个参数 是一个数组 
            init: function(lineno, colno) {
                this.lineno = lineno;
                this.colno = colno;

                // ... 初始化时会将节点的fields中指定的键的值设置为该数组
                // ... var p = new Pair(lineno, colno, [child1, child2])
                // ... p.key = p.value = [child1, child2] // 因为 p.fields = ['key', 'value']
                var fields = this.fields;
                for (var i = 0, l = fields.length; i < l; i++) {
                    var field = fields[i];

                    // The first two args are line/col numbers, so offset by 2
                    var val = arguments[i + 2];

                    // Fields should never be undefined, but null. It makes
                    // testing easier to normalize values.
                    if (val === undefined) {
                        val = null;
                    }

                    this[field] = val;
                }
            },

            findAll: function(type, results) {
                results = results || [];

                if (this instanceof NodeList) {
                    var children = this.children;

                    for (var i = 0, l = children.length; i < l; i++) {
                        traverseAndCheck(children[i], type, results);
                    }
                } else {
                    var fields = this.fields;

                    for (var i = 0, l = fields.length; i < l; i++) {
                        traverseAndCheck(this[fields[i]], type, results);
                    }
                }

                return results;
            },

            iterFields: function(func) {
                lib.each(this.fields, function(field) {
                    func(this[field], field);
                }, this);
            }
        });

        console.log('___Node Class___');
        console.dir(Node);

        // Abstract nodes
        var Value = Node.extend("Value", {
            fields: ['value']
        });

        // Concrete nodes
        var NodeList = Node.extend("NodeList", {
            fields: ['children'],

            init: function(lineno, colno, nodes) {
                this.parent(lineno, colno, nodes || []);
            },

            addChild: function(node) {
                this.children.push(node);
            }
        });

        var Root = NodeList.extend("Root");
        var Literal = Value.extend("Literal");
        var Symbol = Value.extend("Symbol");
        var Group = NodeList.extend("Group");

        // ... 大跌眼镜啊
        var Array = NodeList.extend("Array");
        var Pair = Node.extend("Pair", {
            fields: ['key', 'value']
        });
        var Dict = NodeList.extend("Dict");
        var LookupVal = Node.extend("LookupVal", {
            fields: ['target', 'val']
        });
        var If = Node.extend("If", {
            fields: ['cond', 'body', 'else_']
        });
        var IfAsync = If.extend("IfAsync");
        var InlineIf = Node.extend("InlineIf", {
            fields: ['cond', 'body', 'else_']
        });
        var For = Node.extend("For", {
            fields: ['arr', 'name', 'body', 'else_']
        });
        var AsyncEach = For.extend("AsyncEach");
        var AsyncAll = For.extend("AsyncAll");
        var Macro = Node.extend("Macro", {
            fields: ['name', 'args', 'body']
        });
        var Caller = Macro.extend("Caller");
        var Import = Node.extend("Import", {
            fields: ['template', 'target', 'withContext']
        });
        var FromImport = Node.extend("FromImport", {
            fields: ['template', 'names', 'withContext'],

            init: function(lineno, colno, template, names, withContext) {
                this.parent(lineno, colno,
                    template,
                    names || new NodeList(), withContext);
            }
        });
        var FunCall = Node.extend("FunCall", {
            fields: ['name', 'args']
        });
        var Filter = FunCall.extend("Filter");
        var FilterAsync = Filter.extend("FilterAsync", {
            fields: ['name', 'args', 'symbol']
        });
        var KeywordArgs = Dict.extend("KeywordArgs");
        var Block = Node.extend("Block", {
            fields: ['name', 'body']
        });
        var Super = Node.extend("Super", {
            fields: ['blockName', 'symbol']
        });
        var TemplateRef = Node.extend("TemplateRef", {
            fields: ['template']
        });
        var Extends = TemplateRef.extend("Extends");
        var Include = TemplateRef.extend("Include");
        var Set = Node.extend("Set", {
            fields: ['targets', 'value']
        });
        var Output = NodeList.extend("Output");
        var TemplateData = Literal.extend("TemplateData");
        var UnaryOp = Node.extend("UnaryOp", {
            fields: ['target']
        });
        var BinOp = Node.extend("BinOp", {
            fields: ['left', 'right']
        });
        var In = BinOp.extend("In");
        var Or = BinOp.extend("Or");
        var And = BinOp.extend("And");
        var Not = UnaryOp.extend("Not");
        var Add = BinOp.extend("Add");
        var Sub = BinOp.extend("Sub");
        var Mul = BinOp.extend("Mul");
        var Div = BinOp.extend("Div");
        var FloorDiv = BinOp.extend("FloorDiv");
        var Mod = BinOp.extend("Mod");
        var Pow = BinOp.extend("Pow");
        var Neg = UnaryOp.extend("Neg");
        var Pos = UnaryOp.extend("Pos");
        var Compare = Node.extend("Compare", {
            fields: ['expr', 'ops']
        });
        var CompareOperand = Node.extend("CompareOperand", {
            fields: ['expr', 'type']
        });

        var CustomTag = Node.extend("CustomTag", {
            init: function(lineno, colno, name) {
                this.lineno = lineno;
                this.colno = colno;
                this.name = name;
            }
        });

        var CallExtension = Node.extend("CallExtension", {
            fields: ['extName', 'prop', 'args', 'contentArgs'],

            init: function(ext, prop, args, contentArgs) {
                this.extName = ext._name || ext;
                this.prop = prop;
                this.args = args || new NodeList();
                this.contentArgs = contentArgs || [];
                this.autoescape = ext.autoescape;
            }
        });

        var CallExtensionAsync = CallExtension.extend("CallExtensionAsync");

        // Print the AST in a nicely formatted tree format for debuggin
        function printNodes(node, indent) {
            indent = indent || 0;

            // This is hacky, but this is just a debugging function anyway
            function print(str, indent, inline) {
                var lines = str.split("\n");

                for (var i = 0; i < lines.length; i++) {
                    if (lines[i]) {
                        if ((inline && i > 0) || !inline) {
                            for (var j = 0; j < indent; j++) {
                                util.print(" ");
                            }
                        }
                    }

                    if (i === lines.length - 1) {
                        util.print(lines[i]);
                    } else {
                        util.puts(lines[i]);
                    }
                }
            }

            print(node.typename + ": ", indent);

            if (node instanceof NodeList) {
                print('\n');
                lib.each(node.children, function(n) {
                    printNodes(n, indent + 2);
                });
            } else if (node instanceof CallExtension) {
                print(node.extName + '.' + node.prop);
                print('\n');

                if (node.args) {
                    printNodes(node.args, indent + 2);
                }

                if (node.contentArgs) {
                    lib.each(node.contentArgs, function(n) {
                        printNodes(n, indent + 2);
                    });
                }
            } else {
                var nodes = null;
                var props = null;

                node.iterFields(function(val, field) {
                    if (val instanceof Node) {
                        nodes = nodes || {};
                        nodes[field] = val;
                    } else {
                        props = props || {};
                        props[field] = val;
                    }
                });

                if (props) {
                    print(util.inspect(props, true, null) + '\n', null, true);
                } else {
                    print('\n');
                }

                if (nodes) {
                    for (var k in nodes) {
                        printNodes(nodes[k], indent + 2);
                    }
                }

            }
        }

        // var t = new NodeList(0, 0,
        //                      [new Value(0, 0, 3),
        //                       new Value(0, 0, 10),
        //                       new Pair(0, 0,
        //                                new Value(0, 0, 'key'),
        //                                new Value(0, 0, 'value'))]);
        // printNodes(t);

        modules['nodes'] = {
            Node: Node,
            Root: Root,
            NodeList: NodeList,
            Value: Value,
            Literal: Literal,
            Symbol: Symbol,
            Group: Group,
            Array: Array,
            Pair: Pair,
            Dict: Dict,
            Output: Output,
            TemplateData: TemplateData,
            If: If,
            IfAsync: IfAsync,
            InlineIf: InlineIf,
            For: For,
            AsyncEach: AsyncEach,
            AsyncAll: AsyncAll,
            Macro: Macro,
            Caller: Caller,
            Import: Import,
            FromImport: FromImport,
            FunCall: FunCall,
            Filter: Filter,
            FilterAsync: FilterAsync,
            KeywordArgs: KeywordArgs,
            Block: Block,
            Super: Super,
            Extends: Extends,
            Include: Include,
            Set: Set,
            LookupVal: LookupVal,
            BinOp: BinOp,
            In: In,
            Or: Or,
            And: And,
            Not: Not,
            Add: Add,
            Sub: Sub,
            Mul: Mul,
            Div: Div,
            FloorDiv: FloorDiv,
            Mod: Mod,
            Pow: Pow,
            Neg: Neg,
            Pos: Pos,
            Compare: Compare,
            CompareOperand: CompareOperand,

            CallExtension: CallExtension,
            CallExtensionAsync: CallExtensionAsync,

            printNodes: printNodes
        };
    })();
    // file: runtime.js
    (function() {
        var lib = modules["lib"];
        var Obj = modules["object"];

        // Frames keep track of scoping both at compile-time and run-time so
        // we know how to access variables. Block tags can introduce special
        // variables, for example.
        var Frame = Obj.extend({
            init: function(parent) {
                this.variables = {};
                this.parent = parent;
            },

            // ... set('foo.bar', 'fb')
            set: function(name, val, resolveUp) {
                // Allow variables with dots by automatically creating the
                // nested structure
                var parts = name.split('.');
                var obj = this.variables;
                var frame = this;

                if (resolveUp) {
                    if ((frame = this.resolve(parts[0]))) {
                        frame.set(name, val);
                        return;
                    }
                    frame = this;
                }

                for (var i = 0; i < parts.length - 1; i++) {
                    var id = parts[i];

                    if (!obj[id]) {
                        obj[id] = {};
                    }
                    obj = obj[id];
                }

                obj[parts[parts.length - 1]] = val;
            },

            // ... get只能读取当前frame实例set进去的值
            get: function(name) {
                var val = this.variables[name];
                if (val !== undefined && val !== null) {
                    return val;
                }
                return null;
            },

            // ... 除了能读取当前frame实例set进去的值 还能读取parent中的值
            lookup: function(name) {
                var p = this.parent;
                var val = this.variables[name];
                if (val !== undefined && val !== null) {
                    return val;
                }
                return p && p.lookup(name);
            },

            // ... todo 目的何在
            resolve: function(name) {
                var p = this.parent;
                var val = this.variables[name];
                if (val != null) {
                    return this;
                }
                return p && p.resolve(name);
            },

            push: function() {
                return new Frame(this);
            },

            pop: function() {
                return this.parent;
            }
        });

        function makeMacro(argNames, kwargNames, func) {
            return function() {
                var argCount = numArgs(arguments);
                var args;
                var kwargs = getKeywordArgs(arguments);

                if (argCount > argNames.length) {
                    args = Array.prototype.slice.call(arguments, 0, argNames.length);

                    // Positional arguments that should be passed in as
                    // keyword arguments (essentially default values)
                    var vals = Array.prototype.slice.call(arguments, args.length, argCount);
                    for (var i = 0; i < vals.length; i++) {
                        if (i < kwargNames.length) {
                            kwargs[kwargNames[i]] = vals[i];
                        }
                    }

                    args.push(kwargs);
                } else if (argCount < argNames.length) {
                    args = Array.prototype.slice.call(arguments, 0, argCount);

                    for (var i = argCount; i < argNames.length; i++) {
                        var arg = argNames[i];

                        // Keyword arguments that should be passed as
                        // positional arguments, i.e. the caller explicitly
                        // used the name of a positional arg
                        args.push(kwargs[arg]);
                        delete kwargs[arg];
                    }

                    args.push(kwargs);
                } else {
                    args = arguments;
                }

                return func.apply(this, args);
            };
        }

        function makeKeywordArgs(obj) {
            obj.__keywords = true;
            return obj;
        }

        function getKeywordArgs(args) {
            var len = args.length;
            if (len) {
                var lastArg = args[len - 1];
                if (lastArg && lastArg.hasOwnProperty('__keywords')) {
                    return lastArg;
                }
            }
            return {};
        }

        function numArgs(args) {
            var len = args.length;
            if (len === 0) {
                return 0;
            }

            var lastArg = args[len - 1];
            if (lastArg && lastArg.hasOwnProperty('__keywords')) {
                return len - 1;
            } else {
                return len;
            }
        }

        // A SafeString object indicates that the string should not be
        // autoescaped. This happens magically because autoescaping only
        // occurs on primitive string objects.
        function SafeString(val) {
            if (typeof val != 'string') {
                return val;
            }

            this.val = val;
        }

        SafeString.prototype = Object.create(String.prototype);
        SafeString.prototype.valueOf = function() {
            return this.val;
        };
        SafeString.prototype.toString = function() {
            return this.val;
        };

        function copySafeness(dest, target) {
            if (dest instanceof SafeString) {
                return new SafeString(target);
            }
            return target.toString();
        }

        function markSafe(val) {
            var type = typeof val;

            if (type === 'string') {
                return new SafeString(val);
            } else if (type !== 'function') {
                return val;
            } else {
                return function() {
                    var ret = val.apply(this, arguments);

                    if (typeof ret === 'string') {
                        return new SafeString(ret);
                    }

                    return ret;
                };
            }
        }

        // ... 运行时对模板返回的字符串做最后一道处理
        // ... 处理特殊值 + escape
        function suppressValue(val, autoescape) {
            val = (val !== undefined && val !== null) ? val : "";

            if (autoescape && typeof val === "string") {
                val = lib.escape(val);
            }

            return val;
        }

        // ... 从obj对象上
        function memberLookup(obj, val) {
            obj = obj || {};

            if (typeof obj[val] === 'function') {
                return function() {
                    return obj[val].apply(obj, arguments);
                };
            }

            return obj[val];
        }

        function callWrap(obj, name, args) {
            if (!obj) {
                throw new Error('Unable to call `' + name + '`, which is undefined or falsey');
            } else if (typeof obj !== 'function') {
                throw new Error('Unable to call `' + name + '`, which is not a function');
            }

            return obj.apply(this, args);
        }

        // ... 运行时查找name
        // ... todo frame参数是干什么的
        function contextOrFrameLookup(context, frame, name) {
            // debugger;
            var val = frame.lookup(name);
            // ... 注释掉的原代码
            // return (val !== undefined && val !== null) ?
            //     val :
            //     // 从当前的作用域查找
            //     context.lookup(name);

            // ... 分解的代码
            if (val !== undefined && val !== null) {

            } else {
                val = context.lookup(name);
            }
            return val;
        }

        function handleError(error, lineno, colno) {
            if (error.lineno) {
                return error;
            } else {
                return new lib.TemplateError(error, lineno, colno);
            }
        }

        function asyncEach(arr, dimen, iter, cb) {
            if (lib.isArray(arr)) {
                var len = arr.length;

                lib.asyncIter(arr, function(item, i, next) {
                    switch (dimen) {
                        case 1:
                            iter(item, i, len, next);
                            break;
                        case 2:
                            iter(item[0], item[1], i, len, next);
                            break;
                        case 3:
                            iter(item[0], item[1], item[2], i, len, next);
                            break;
                        default:
                            item.push(i, next);
                            iter.apply(this, item);
                    }
                }, cb);
            } else {
                lib.asyncFor(arr, function(key, val, i, len, next) {
                    iter(key, val, i, len, next);
                }, cb);
            }
        }

        function asyncAll(arr, dimen, func, cb) {
            var finished = 0;
            var len;
            var outputArr;

            function done(i, output) {
                finished++;
                outputArr[i] = output;

                if (finished == len) {
                    cb(null, outputArr.join(''));
                }
            }

            if (lib.isArray(arr)) {
                len = arr.length;
                outputArr = new Array(len);

                if (len == 0) {
                    cb(null, '');
                } else {
                    for (var i = 0; i < arr.length; i++) {
                        var item = arr[i];

                        switch (dimen) {
                            case 1:
                                func(item, i, len, done);
                                break;
                            case 2:
                                func(item[0], item[1], i, len, done);
                                break;
                            case 3:
                                func(item[0], item[1], item[2], i, len, done);
                                break;
                            default:
                                item.push(i, done);
                                func.apply(this, item);
                        }
                    }
                }
            } else {
                var keys = lib.keys(arr);
                len = keys.length;
                outputArr = new Array(len);

                if (len == 0) {
                    cb(null, '');
                } else {
                    for (var i = 0; i < keys.length; i++) {
                        var k = keys[i];
                        func(k, arr[k], i, len, done);
                    }
                }
            }
        }

        modules['runtime'] = {
            Frame: Frame,
            makeMacro: makeMacro,
            makeKeywordArgs: makeKeywordArgs,
            numArgs: numArgs,
            suppressValue: suppressValue,
            memberLookup: memberLookup,
            contextOrFrameLookup: contextOrFrameLookup,
            callWrap: callWrap,
            handleError: handleError,
            isArray: lib.isArray,
            keys: lib.keys,
            SafeString: SafeString,
            copySafeness: copySafeness,
            markSafe: markSafe,
            asyncEach: asyncEach,
            asyncAll: asyncAll
        };
    })();
    // file: lexer.js
    (function() {
        var lib = modules["lib"];

        var whitespaceChars = " \n\t\r";
        var delimChars = "()[]{}%*-+/#,:|.<>=!";
        var intChars = "0123456789";

        var BLOCK_START = "{%";
        var BLOCK_END = "%}";
        var VARIABLE_START = "{{";
        var VARIABLE_END = "}}";
        var COMMENT_START = "{#";
        var COMMENT_END = "#}";

        var TOKEN_STRING = "string";
        var TOKEN_WHITESPACE = "whitespace";
        var TOKEN_DATA = "data";
        var TOKEN_BLOCK_START = "block-start";
        var TOKEN_BLOCK_END = "block-end";
        var TOKEN_VARIABLE_START = "variable-start";
        var TOKEN_VARIABLE_END = "variable-end";
        var TOKEN_COMMENT = "comment";
        var TOKEN_LEFT_PAREN = "left-paren";
        var TOKEN_RIGHT_PAREN = "right-paren";
        var TOKEN_LEFT_BRACKET = "left-bracket";
        var TOKEN_RIGHT_BRACKET = "right-bracket";
        var TOKEN_LEFT_CURLY = "left-curly";
        var TOKEN_RIGHT_CURLY = "right-curly";
        var TOKEN_OPERATOR = "operator";
        var TOKEN_COMMA = "comma";
        var TOKEN_COLON = "colon";
        var TOKEN_PIPE = "pipe";
        var TOKEN_INT = "int";
        var TOKEN_FLOAT = "float";
        var TOKEN_BOOLEAN = "boolean";
        var TOKEN_SYMBOL = "symbol";
        var TOKEN_SPECIAL = "special";
        var TOKEN_REGEX = "regex";

        function token(type, value, lineno, colno) {
            return {
                type: type,
                value: value,
                lineno: lineno,
                colno: colno
            };
        }

        // ... 词法分析器(核心功能是提取器)
        function Tokenizer(str, tags) {
            this.str = str;
            this.index = 0;
            this.len = str.length;
            this.lineno = 0;
            this.colno = 0;

            this.in_code = false;

            tags = tags || {};
            this.tags = {
                BLOCK_START: tags.blockStart || BLOCK_START,
                BLOCK_END: tags.blockEnd || BLOCK_END,
                VARIABLE_START: tags.variableStart || VARIABLE_START,
                VARIABLE_END: tags.variableEnd || VARIABLE_END,
                COMMENT_START: tags.commentStart || COMMENT_START,
                COMMENT_END: tags.commentEnd || COMMENT_END
            };
        }

        // ... 词法分析的核心方法
        Tokenizer.prototype.nextToken = function() {
            // debugger;
            var lineno = this.lineno;
            var colno = this.colno;
            if (this.in_code) {
                // Otherwise, if we are in a block parse it as code
                var cur = this.current();
                var tok;

                if (this.is_finished()) {
                    // We have nothing else to parse
                    return null;
                } 
                // ... 如果是引号 表示字符串的开始
                // ... todo 如何处理foo's的情况
                else if (cur == "\"" || cur == "'") {
                    // We've hit a string
                    return token(TOKEN_STRING, this.parseString(cur), lineno, colno);
                } 
                // ... 如果是空白字符
                else if ((tok = this._extract(whitespaceChars))) {
                    // We hit some whitespace
                    return token(TOKEN_WHITESPACE, tok, lineno, colno);
                } 
                // ... blockend 如果匹配 则结束in_code状态
                else if ((tok = this._extractString(this.tags.BLOCK_END)) ||
                    (tok = this._extractString('-' + this.tags.BLOCK_END))) {
                    // Special check for the block end tag
                    //
                    // It is a requirement that start and end tags are composed of
                    // delimiter characters (%{}[] etc), and our code always
                    // breaks on delimiters so we can assume the token parsing
                    // doesn't consume these elsewhere
                    this.in_code = false;
                    return token(TOKEN_BLOCK_END, tok, lineno, colno);
                } 
                // ... variable end 如果匹配 则结束in_code状态
                else if ((tok = this._extractString(this.tags.VARIABLE_END))) {
                    // Special check for variable end tag (see above)
                    this.in_code = false;
                    return token(TOKEN_VARIABLE_END, tok, lineno, colno);
                } 
                // ... 这种正则的情况文档中没用提到 先不分析
                else if (cur === 'r' && this.str.charAt(this.index + 1) === '/') {
                    // Skip past 'r/'.
                    this.forwardN(2);

                    // Extract until the end of the regex -- / ends it, \/ does not.
                    var regexBody = '';
                    while (!this.is_finished()) {
                        if (this.current() === '/' && this.previous() !== '\\') {
                            this.forward();
                            break;
                        } else {
                            regexBody += this.current();
                            this.forward();
                        }
                    }

                    // Check for flags.
                    // The possible flags are according to https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/RegExp)
                    var POSSIBLE_FLAGS = ['g', 'i', 'm', 'y'];
                    var regexFlags = '';
                    while (!this.is_finished()) {
                        var isCurrentAFlag = POSSIBLE_FLAGS.indexOf(this.current()) !== -1;
                        if (isCurrentAFlag) {
                            regexFlags += this.current();
                            this.forward();
                        } else {
                            break;
                        }
                    }

                    return token(TOKEN_REGEX, {
                        body: regexBody,
                        flags: regexFlags
                    }, lineno, colno);
                } 
                // ... 如果是任何一种delimChars "()[]{}%*-+/#,:|.<>=!"
                // ... todo find case
                else if (delimChars.indexOf(cur) != -1) {
                    // We've hit a delimiter (a special char like a bracket)
                    this.forward();
                    var complexOps = ['==', '!=', '<=', '>=', '//', '**'];
                    var curComplex = cur + this.current();
                    var type;

                    if (lib.indexOf(complexOps, curComplex) !== -1) {
                        this.forward();
                        cur = curComplex;
                    }

                    switch (cur) {
                        case "(":
                            type = TOKEN_LEFT_PAREN;
                            break;
                        case ")":
                            type = TOKEN_RIGHT_PAREN;
                            break;
                        case "[":
                            type = TOKEN_LEFT_BRACKET;
                            break;
                        case "]":
                            type = TOKEN_RIGHT_BRACKET;
                            break;
                        case "{":
                            type = TOKEN_LEFT_CURLY;
                            break;
                        case "}":
                            type = TOKEN_RIGHT_CURLY;
                            break;
                        case ",":
                            type = TOKEN_COMMA;
                            break;
                        case ":":
                            type = TOKEN_COLON;
                            break;
                        case "|":
                            type = TOKEN_PIPE;
                            break;
                        default:
                            type = TOKEN_OPERATOR;
                    }

                    return token(type, cur, lineno, colno);
                } 
                // ... 当前的字符就是个普通字符
                else {
                    // We are not at whitespace or a delimiter, so extract the
                    // text and parse it
                    // ... 取出最小的连续的字符单元
                    // ... note 这里注意要提取的一定是连续的字符单元 即遇到空白时也要停止提取
                    // ... 
                    // ... todo "foo bar"
                    tok = this._extractUntil(whitespaceChars + delimChars);

                    // ... 如果是纯数字
                    // ... todo case
                    if (tok.match(/^[-+]?[0-9]+$/)) {
                        if (this.current() == '.') {
                            this.forward();
                            var dec = this._extract(intChars);
                            return token(TOKEN_FLOAT, tok + '.' + dec, lineno, colno);
                        } else {
                            return token(TOKEN_INT, tok, lineno, colno);
                        }
                    } 
                    // ... 如果是布尔单词
                    else if (tok.match(/^(true|false)$/)) {
                        return token(TOKEN_BOOLEAN, tok, lineno, colno);
                    } 
                    // ... 只要in_code的状态是true 则普通的字符串都是symbol
                    else if (tok) {
                        return token(TOKEN_SYMBOL, tok, lineno, colno);
                    } else {
                        throw new Error("Unexpected value while parsing: " + tok);
                    }
                }
            } else {
                // Parse out the template text, breaking on tag
                // delimiters because we need to look for block/variable start
                // tags (don't use the full delimChars for optimization)
                // ... 这个地方不需要反复拼接 可以优化到while之前
                // ... {{{#
                var beginChars = (this.tags.BLOCK_START.charAt(0) +
                    this.tags.VARIABLE_START.charAt(0) +
                    this.tags.COMMENT_START.charAt(0) +
                    this.tags.COMMENT_END.charAt(0));
                var tok;

                if (this.is_finished()) {
                    return null;
                } 
                // 
                else if ((tok = this._extractString(this.tags.BLOCK_START + '-')) ||
                    (tok = this._extractString(this.tags.BLOCK_START))) {
                    this.in_code = true;
                    return token(TOKEN_BLOCK_START, tok, lineno, colno);
                } else if ((tok = this._extractString(this.tags.VARIABLE_START))) {
                    this.in_code = true;
                    return token(TOKEN_VARIABLE_START, tok, lineno, colno);
                } else {
                    tok = '';
                    var data;
                    var in_comment = false;

                    if (this._matches(this.tags.COMMENT_START)) {
                        in_comment = true;
                        // ...? 待分析如何处理注释
                        tok = this._extractString(this.tags.COMMENT_START);
                    }

                    // Continually consume text, breaking on the tag delimiter
                    // characters and checking to see if it's a start tag.
                    //
                    // We could hit the end of the template in the middle of
                    // our looping, so check for the null return value from
                    // _extractUntil
                    while ((data = this._extractUntil(beginChars)) !== null) {
                        tok += data;

                        if ((this._matches(this.tags.BLOCK_START) ||
                                this._matches(this.tags.VARIABLE_START) ||
                                this._matches(this.tags.COMMENT_START)) &&
                            !in_comment) {
                            // If it is a start tag, stop looping
                            break;
                        } else if (this._matches(this.tags.COMMENT_END)) {
                            if (!in_comment) {
                                throw new Error("unexpected end of comment");
                            }
                            tok += this._extractString(this.tags.COMMENT_END);
                            break;
                        } else {
                            // It does not match any tag, so add the character and
                            // carry on
                            tok += this.current();
                            this.forward();
                        }
                    }

                    if (data === null && in_comment) {
                        throw new Error("expected end of comment, got end of file");
                    }

                    // ... token方法只做了简单包装
                    // ...     function token(type, value, lineno, colno) {
                    // ...         return {
                    // ...             type: type,
                    // ...             value: value,
                    // ...             lineno: lineno,
                    // ...             colno: colno
                    // ...         };
                    // ...     }
                    return token(in_comment ? TOKEN_COMMENT : TOKEN_DATA, tok, lineno, colno);
                }
            }

            throw new Error("Could not parse text");
        };

        // ... 提取两个引号之间的字符串
        // ... 遇到"时调用parseString('"') 遇到'时调用parseString("'")
        Tokenizer.prototype.parseString = function(delimiter) {
            this.forward();

            var lineno = this.lineno;
            var colno = this.colno;
            var str = "";

            // ... 只要是没结束且下一个字符不是目标引号 就一直收集下去
            while (!this.is_finished() && this.current() != delimiter) {
                var cur = this.current();

                if (cur == "\\") {
                    this.forward();
                    switch (this.current()) {
                        case "n":
                            str += "\n";
                            break;
                        case "t":
                            str += "\t";
                            break;
                        case "r":
                            str += "\r";
                            break;
                        default:
                            str += this.current();
                    }
                    this.forward();
                } else {
                    str += cur;
                    this.forward();
                }
            }

            this.forward();
            return str;
        };

        // ... 验证从当前index开始的若干个字符是否匹配指定的str，返回布尔值
        // ... 核心方法.slice
        Tokenizer.prototype._matches = function(str) {
            // ... 如果剩余的字符长度已经小于str的长度，就不用在匹配了
            if (this.index + str.length > this.len) {
                return null;
            }

            var m = this.str.slice(this.index, this.index + str.length);
            return m == str;
        };

        // ... 从当前index开始的字符开始查找，如果匹配了指定的str，则返回str，并更新index
        Tokenizer.prototype._extractString = function(str) {
            if (this._matches(str)) {
                this.index += str.length;
                return str;
            }
            return null;
        };

        // ... 提取从当前位置开始 到能和charString中的字符匹配的字符之间的字符串集合
        Tokenizer.prototype._extractUntil = function(charString) {
            // Extract all non-matching chars, with the default matching set
            // to everything
            return this._extractMatching(true, charString || "");
        };

        // ... 提取从当前位置开始且和charString中的字符匹配的字符串集合
        Tokenizer.prototype._extract = function(charString) {
            // Extract all matching chars (no default, so charString must be
            // explicit)
            return this._extractMatching(false, charString);
        };

        // ... 当breakOnMatch为true时，从当前index开始一直向前查找，
        // ... 直到遇到charString中的一个字符停止，
        // ... 返回从起始index到停止时刻index之间的所有字符
        // ... eg   _extractMatching(true, '{') + '123{' = '123'
        // ... 当breakOnMatch为false时，从当前index开始一直向前查找，每一个
        // ... 字符都需要和charString中的一个字符匹配，直到发现第一个不匹配的字符时停止
        // ... 返回从起始index开始匹配到的所有字符
        // ... eg   _extractMatching(false, '123') + '123{' = '123'
        Tokenizer.prototype._extractMatching = function(breakOnMatch, charString) {
            // Pull out characters until a breaking char is hit.
            // If breakOnMatch is false, a non-matching char stops it.
            // If breakOnMatch is true, a matching char stops it.

            if (this.is_finished()) {
                return null;
            }

            var first = charString.indexOf(this.current());

            // Only proceed if the first character doesn't meet our condition
            if ((breakOnMatch && first == -1) ||
                (!breakOnMatch && first != -1)) {
                var t = this.current();
                this.forward();

                // And pull out all the chars one at a time until we hit a
                // breaking char
                var idx = charString.indexOf(this.current());

                while (((breakOnMatch && idx == -1) ||
                        (!breakOnMatch && idx != -1)) && !this.is_finished()) {
                    t += this.current();
                    this.forward();

                    idx = charString.indexOf(this.current());
                }

                return t;
            }

            return "";
        };

        Tokenizer.prototype.is_finished = function() {
            return this.index >= this.len;
        };

        Tokenizer.prototype.forwardN = function(n) {
            for (var i = 0; i < n; i++) {
                this.forward();
            }
        };

        // ... 将指针移到下一个位置 注意同时更新lineno和colno
        Tokenizer.prototype.forward = function() {
            this.index++;
            // ... 换行情况
            if (this.previous() == "\n") {
                this.lineno++;
                this.colno = 0;
            } else {
                this.colno++;
            }
        };

        Tokenizer.prototype.back = function() {
            this.index--;

            if (this.current() == "\n") {
                this.lineno--;

                var idx = this.src.lastIndexOf("\n", this.index - 1);
                if (idx == -1) {
                    this.colno = this.index;
                } else {
                    this.colno = this.index - idx;
                }
            } else {
                this.colno--;
            }
        };

        // ... 返回index位置的那个字符
        Tokenizer.prototype.current = function() {
            if (!this.is_finished()) {
                return this.str.charAt(this.index);
            }
            return "";
        };

        // ... 返回index前一个位置的那个字符
        Tokenizer.prototype.previous = function() {
            return this.str.charAt(this.index - 1);
        };

        // var tt = new Tokenizer('Hi {{tpl|safe}}!');
        // var tt = new Tokenizer('{{"abc}}!');
        // var tt = new Tokenizer("{%if foo%}bar{%endif%}");
        // var nextT
        // while(nextT = tt.nextToken()){
        //     console.log(nextT);
        // }

        modules['lexer'] = {
            lex: function(src, tags) {
                return new Tokenizer(src, tags);
            },

            TOKEN_STRING: TOKEN_STRING,
            TOKEN_WHITESPACE: TOKEN_WHITESPACE,
            TOKEN_DATA: TOKEN_DATA,
            TOKEN_BLOCK_START: TOKEN_BLOCK_START,
            TOKEN_BLOCK_END: TOKEN_BLOCK_END,
            TOKEN_VARIABLE_START: TOKEN_VARIABLE_START,
            TOKEN_VARIABLE_END: TOKEN_VARIABLE_END,
            TOKEN_COMMENT: TOKEN_COMMENT,
            TOKEN_LEFT_PAREN: TOKEN_LEFT_PAREN,
            TOKEN_RIGHT_PAREN: TOKEN_RIGHT_PAREN,
            TOKEN_LEFT_BRACKET: TOKEN_LEFT_BRACKET,
            TOKEN_RIGHT_BRACKET: TOKEN_RIGHT_BRACKET,
            TOKEN_LEFT_CURLY: TOKEN_LEFT_CURLY,
            TOKEN_RIGHT_CURLY: TOKEN_RIGHT_CURLY,
            TOKEN_OPERATOR: TOKEN_OPERATOR,
            TOKEN_COMMA: TOKEN_COMMA,
            TOKEN_COLON: TOKEN_COLON,
            TOKEN_PIPE: TOKEN_PIPE,
            TOKEN_INT: TOKEN_INT,
            TOKEN_FLOAT: TOKEN_FLOAT,
            TOKEN_BOOLEAN: TOKEN_BOOLEAN,
            TOKEN_SYMBOL: TOKEN_SYMBOL,
            TOKEN_SPECIAL: TOKEN_SPECIAL,
            TOKEN_REGEX: TOKEN_REGEX
        };
    })();
    // file: parser.js
    (function() {
        var lexer = modules["lexer"];
        var nodes = modules["nodes"];
        var Object = modules["object"];
        var lib = modules["lib"];

        // ... 语法分析工具
        // ... 语法分析工具的分析过程依赖了词法分析工具(Tokenizer)
        var Parser = Object.extend({
            init: function(tokens) {
                // ... 这个属性的命名不好，该属性指向一个Tokenizer的实例，应该命名为"tokenizer"
                this.tokens = tokens;
                // ... 存放预读出来的下一个token值
                this.peeked = null;
                this.breakOnBlocks = null;
                this.dropLeadingWhitespace = false;

                this.extensions = [];
            },

            // ... 预读下一个token
            // ... note 这里是Parser的nextToken方法 内部调用了tokenizer的nextToken方法
            // ... note withWhitespace是undifined时 则如果下一个token是空白字符 则返回下下个token
            nextToken: function(withWhitespace) {
                var tok;

                // 如果已经有缓存的预读
                if (this.peeked) {
                    if (!withWhitespace && this.peeked.type == lexer.TOKEN_WHITESPACE) {
                        this.peeked = null;
                    } else {
                        tok = this.peeked;
                        this.peeked = null;
                        return tok;
                    }
                }

                tok = this.tokens.nextToken();

                // ... 默认如果下一个tokens是空白字符 则返回下下个token
                // ... 当withWhitespace为true时 即nextToken(true) 则不考虑是否是空白字符
                if (!withWhitespace) {
                    while (tok && tok.type == lexer.TOKEN_WHITESPACE) {
                        tok = this.tokens.nextToken();
                    }
                }

                return tok;
            },

            // ... 预读下一个token并缓存
            // ... note 当peekToken反复调用时 指针不会继续前进
            peekToken: function() {
                this.peeked = this.peeked || this.nextToken();
                return this.peeked;
            },

            // ... 将指定的token存在peeked属性上
            pushToken: function(tok) {
                if (this.peeked) {
                    throw new Error("pushToken: can only push one token on between reads");
                }
                this.peeked = tok;
            },

            fail: function(msg, lineno, colno) {
                if ((lineno === undefined || colno === undefined) && this.peekToken()) {
                    var tok = this.peekToken();
                    lineno = tok.lineno;
                    colno = tok.colno;
                }
                if (lineno !== undefined) lineno += 1;
                if (colno !== undefined) colno += 1;

                throw new lib.TemplateError(msg, lineno, colno);
            },

            skip: function(type) {
                var tok = this.nextToken();
                if (!tok || tok.type != type) {
                    this.pushToken(tok);
                    return false;
                }
                return true;
            },

            expect: function(type) {
                var tok = this.nextToken();
                if (tok.type !== type) {
                    this.fail('expected ' + type + ', got ' + tok.type,
                        tok.lineno,
                        tok.colno);
                }
                return tok;
            },

            skipValue: function(type, val) {
                var tok = this.nextToken();
                if (!tok || tok.type != type || tok.value != val) {
                    this.pushToken(tok);
                    return false;
                }
                return true;
            },

            skipWhitespace: function() {
                return this.skip(lexer.TOKEN_WHITESPACE);
            },

            skipSymbol: function(val) {
                return this.skipValue(lexer.TOKEN_SYMBOL, val);
            },

            advanceAfterBlockEnd: function(name) {
                if (!name) {
                    var tok = this.peekToken();

                    if (!tok) {
                        this.fail('unexpected end of file');
                    }

                    if (tok.type != lexer.TOKEN_SYMBOL) {
                        this.fail("advanceAfterBlockEnd: expected symbol token or " +
                            "explicit name to be passed");
                    }

                    name = this.nextToken().value;
                }

                var tok = this.nextToken();

                if (tok && tok.type == lexer.TOKEN_BLOCK_END) {
                    if (tok.value.charAt(0) === '-') {
                        this.dropLeadingWhitespace = true;
                    }
                } else {
                    this.fail("expected block end in " + name + " statement");
                }
            },

            advanceAfterVariableEnd: function() {
                if (!this.skip(lexer.TOKEN_VARIABLE_END)) {
                    this.fail("expected variable end");
                }
            },

            parseFor: function() {
                var forTok = this.peekToken();
                var node;
                var endBlock;

                if (this.skipSymbol('for')) {
                    node = new nodes.For(forTok.lineno, forTok.colno);
                    endBlock = 'endfor';
                } else if (this.skipSymbol('asyncEach')) {
                    node = new nodes.AsyncEach(forTok.lineno, forTok.colno);
                    endBlock = 'endeach';
                } else if (this.skipSymbol('asyncAll')) {
                    node = new nodes.AsyncAll(forTok.lineno, forTok.colno);
                    endBlock = 'endall';
                } else {
                    this.fail("parseFor: expected for{Async}", forTok.lineno, forTok.colno);
                }

                node.name = this.parsePrimary();

                if (!(node.name instanceof nodes.Symbol)) {
                    this.fail('parseFor: variable name expected for loop');
                }

                var type = this.peekToken().type;
                if (type == lexer.TOKEN_COMMA) {
                    // key/value iteration
                    var key = node.name;
                    node.name = new nodes.Array(key.lineno, key.colno);
                    node.name.addChild(key);

                    while (this.skip(lexer.TOKEN_COMMA)) {
                        var prim = this.parsePrimary();
                        node.name.addChild(prim);
                    }
                }

                if (!this.skipSymbol('in')) {
                    this.fail('parseFor: expected "in" keyword for loop',
                        forTok.lineno,
                        forTok.colno);
                }

                node.arr = this.parseExpression();
                this.advanceAfterBlockEnd(forTok.value);

                node.body = this.parseUntilBlocks(endBlock, 'else');

                if (this.skipSymbol('else')) {
                    this.advanceAfterBlockEnd('else');
                    node.else_ = this.parseUntilBlocks(endBlock);
                }

                this.advanceAfterBlockEnd();

                return node;
            },

            parseMacro: function() {
                var macroTok = this.peekToken();
                if (!this.skipSymbol('macro')) {
                    this.fail("expected macro");
                }

                var name = this.parsePrimary(true);
                var args = this.parseSignature();
                var node = new nodes.Macro(macroTok.lineno,
                    macroTok.colno,
                    name,
                    args);

                this.advanceAfterBlockEnd(macroTok.value);
                node.body = this.parseUntilBlocks('endmacro');
                this.advanceAfterBlockEnd();

                return node;
            },

            parseCall: function() {
                // a call block is parsed as a normal FunCall, but with an added
                // 'caller' kwarg which is a Caller node.
                var callTok = this.peekToken();
                if (!this.skipSymbol('call')) {
                    this.fail("expected call");
                }

                var callerArgs = this.parseSignature(true) || new nodes.NodeList();
                var macroCall = this.parsePrimary();

                this.advanceAfterBlockEnd(callTok.value);
                var body = this.parseUntilBlocks('endcall');
                this.advanceAfterBlockEnd();

                var callerName = new nodes.Symbol(callTok.lineno,
                    callTok.colno,
                    'caller');
                var callerNode = new nodes.Caller(callTok.lineno,
                    callTok.colno,
                    callerName,
                    callerArgs,
                    body);

                // add the additional caller kwarg, adding kwargs if necessary
                var args = macroCall.args.children;
                if (!(args[args.length - 1] instanceof nodes.KeywordArgs)) {
                    args.push(new nodes.KeywordArgs());
                }
                var kwargs = args[args.length - 1];
                kwargs.addChild(new nodes.Pair(callTok.lineno,
                    callTok.colno,
                    callerName,
                    callerNode));

                return new nodes.Output(callTok.lineno,
                    callTok.colno, [macroCall]);
            },

            parseWithContext: function() {
                var tok = this.peekToken();

                var withContext = null;

                if (this.skipSymbol('with')) {
                    withContext = true;
                } else if (this.skipSymbol('without')) {
                    withContext = false;
                }

                if (withContext !== null) {
                    if (!this.skipSymbol('context')) {
                        this.fail('parseFrom: expected context after with/without',
                            tok.lineno,
                            tok.colno);
                    }
                }

                return withContext;
            },

            parseImport: function() {
                var importTok = this.peekToken();
                if (!this.skipSymbol('import')) {
                    this.fail("parseImport: expected import",
                        importTok.lineno,
                        importTok.colno);
                }

                var template = this.parseExpression();

                if (!this.skipSymbol('as')) {
                    this.fail('parseImport: expected "as" keyword',
                        importTok.lineno,
                        importTok.colno);
                }

                var target = this.parsePrimary();

                var withContext = this.parseWithContext();

                var node = new nodes.Import(importTok.lineno,
                    importTok.colno,
                    template,
                    target,
                    withContext);

                this.advanceAfterBlockEnd(importTok.value);

                return node;
            },

            parseFrom: function() {
                var fromTok = this.peekToken();
                if (!this.skipSymbol('from')) {
                    this.fail("parseFrom: expected from");
                }

                var template = this.parsePrimary();

                if (!this.skipSymbol('import')) {
                    this.fail("parseFrom: expected import",
                        fromTok.lineno,
                        fromTok.colno);
                }

                var names = new nodes.NodeList(),
                    withContext;

                while (1) {
                    var nextTok = this.peekToken();
                    if (nextTok.type == lexer.TOKEN_BLOCK_END) {
                        if (!names.children.length) {
                            this.fail('parseFrom: Expected at least one import name',
                                fromTok.lineno,
                                fromTok.colno);
                        }

                        // Since we are manually advancing past the block end,
                        // need to keep track of whitespace control (normally
                        // this is done in `advanceAfterBlockEnd`
                        if (nextTok.value.charAt(0) == '-') {
                            this.dropLeadingWhitespace = true;
                        }

                        this.nextToken();
                        break;
                    }

                    if (names.children.length > 0 && !this.skip(lexer.TOKEN_COMMA)) {
                        this.fail('parseFrom: expected comma',
                            fromTok.lineno,
                            fromTok.colno);
                    }

                    var name = this.parsePrimary();
                    if (name.value.charAt(0) == '_') {
                        this.fail('parseFrom: names starting with an underscore ' +
                            'cannot be imported',
                            name.lineno,
                            name.colno);
                    }

                    if (this.skipSymbol('as')) {
                        var alias = this.parsePrimary();
                        names.addChild(new nodes.Pair(name.lineno,
                            name.colno,
                            name,
                            alias));
                    } else {
                        names.addChild(name);
                    }

                    withContext = this.parseWithContext();
                }

                return new nodes.FromImport(fromTok.lineno,
                    fromTok.colno,
                    template,
                    names,
                    withContext);
            },

            parseBlock: function() {
                var tag = this.peekToken();
                if (!this.skipSymbol('block')) {
                    this.fail('parseBlock: expected block', tag.lineno, tag.colno);
                }

                var node = new nodes.Block(tag.lineno, tag.colno);

                node.name = this.parsePrimary();
                if (!(node.name instanceof nodes.Symbol)) {
                    this.fail('parseBlock: variable name expected',
                        tag.lineno,
                        tag.colno);
                }

                this.advanceAfterBlockEnd(tag.value);

                node.body = this.parseUntilBlocks('endblock');

                if (!this.peekToken()) {
                    this.fail('parseBlock: expected endblock, got end of file');
                }

                this.advanceAfterBlockEnd();

                return node;
            },

            parseTemplateRef: function(tagName, nodeType) {
                var tag = this.peekToken();
                if (!this.skipSymbol(tagName)) {
                    this.fail('parseTemplateRef: expected ' + tagName);
                }

                var node = new nodeType(tag.lineno, tag.colno);
                node.template = this.parseExpression();

                this.advanceAfterBlockEnd(tag.value);
                return node;
            },

            parseExtends: function() {
                return this.parseTemplateRef('extends', nodes.Extends);
            },

            parseInclude: function() {
                return this.parseTemplateRef('include', nodes.Include);
            },

            parseIf: function() {
                var tag = this.peekToken();
                var node;

                // ... 初始化If节点实例 具有conf/body/eles_属性 初始值都是null
                if (this.skipSymbol('if') || this.skipSymbol('elif')) {
                    node = new nodes.If(tag.lineno, tag.colno);
                } else if (this.skipSymbol('ifAsync')) {
                    node = new nodes.IfAsync(tag.lineno, tag.colno);
                } else {
                    this.fail("parseIf: expected if or elif",
                        tag.lineno,
                        tag.colno);
                }

                node.cond = this.parseExpression();
                this.advanceAfterBlockEnd(tag.value);
                // debugger;
                // ... if的内容都收集到body属性中
                // ... node.body是NodeList的实例
                node.body = this.parseUntilBlocks('elif', 'else', 'endif');
                var tok = this.peekToken();

                switch (tok && tok.value) {
                    // ... else if语法解析后其实是在eles里在嵌套一层if语法
                    // ... if (x) {X} elif (y) {Y} else {Z}
                    // ... >> if (x) {X} else { if (y) {Y} else {Z} }
                    case "elif":
                        node.else_ = this.parseIf();
                        break;
                    case "else":
                        this.advanceAfterBlockEnd();
                        node.else_ = this.parseUntilBlocks("endif");
                        this.advanceAfterBlockEnd();
                        break;
                    case "endif":
                        node.else_ = null;
                        this.advanceAfterBlockEnd();
                        break;
                    default:
                        this.fail('parseIf: expected endif, else, or endif, ' +
                            'got end of file');
                }

                return node;
            },

            parseSet: function() {
                var tag = this.peekToken();
                if (!this.skipSymbol('set')) {
                    this.fail('parseSet: expected set', tag.lineno, tag.colno);
                }

                var node = new nodes.Set(tag.lineno, tag.colno, []);

                var target;
                while ((target = this.parsePrimary())) {
                    node.targets.push(target);

                    if (!this.skip(lexer.TOKEN_COMMA)) {
                        break;
                    }
                }

                if (!this.skipValue(lexer.TOKEN_OPERATOR, '=')) {
                    this.fail('parseSet: expected = in set tag',
                        tag.lineno,
                        tag.colno);
                }

                node.value = this.parseExpression();
                this.advanceAfterBlockEnd(tag.value);

                return node;
            },

            // ... 提取完整的block语句
            // ... 在parseNodes方法中 如过发现当先tok是block start 
            // ... 则紧接着就会进入该方法 提取完整的block语句
            parseStatement: function() {
                var tok = this.peekToken();
                var node;

                // ... block start的下一个token必须是symbol
                if (tok.type != lexer.TOKEN_SYMBOL) {
                    this.fail('tag name expected', tok.lineno, tok.colno);
                }

                if (this.breakOnBlocks &&
                    lib.indexOf(this.breakOnBlocks, tok.value) !== -1) {
                    return null;
                }

                // ... 分发到具体的分支语句进行解析
                switch (tok.value) {
                    case 'raw':
                        return this.parseRaw();
                    case 'if':
                    case 'ifAsync':
                        return this.parseIf();
                    case 'for':
                    case 'asyncEach':
                    case 'asyncAll':
                        return this.parseFor();
                    case 'block':
                        return this.parseBlock();
                    case 'extends':
                        return this.parseExtends();
                    case 'include':
                        return this.parseInclude();
                    case 'set':
                        return this.parseSet();
                    case 'macro':
                        return this.parseMacro();
                    case 'call':
                        return this.parseCall();
                    case 'import':
                        return this.parseImport();
                    case 'from':
                        return this.parseFrom();
                    default:
                        if (this.extensions.length) {
                            for (var i = 0; i < this.extensions.length; i++) {
                                var ext = this.extensions[i];
                                if (lib.indexOf(ext.tags || [], tok.value) !== -1) {
                                    return ext.parse(this, nodes, lexer);
                                }
                            }
                        }
                        this.fail('unknown block tag: ' + tok.value, tok.lineno, tok.colno);
                }

                return node;
            },

            parseRaw: function() {
                this.advanceAfterBlockEnd();
                var str = '';
                var begun = this.peekToken();

                while (1) {
                    // Passing true gives us all the whitespace tokens as
                    // well, which are usually ignored.
                    var tok = this.nextToken(true);

                    if (!tok) {
                        this.fail("expected endraw, got end of file");
                    }

                    if (tok.type == lexer.TOKEN_BLOCK_START) {
                        // We need to look for the `endraw` block statement,
                        // which involves a lookahead so carefully keep track
                        // of whitespace
                        var ws = null;
                        var name = this.nextToken(true);

                        if (name.type == lexer.TOKEN_WHITESPACE) {
                            ws = name;
                            name = this.nextToken();
                        }

                        if (name.type == lexer.TOKEN_SYMBOL &&
                            name.value == 'endraw') {
                            this.advanceAfterBlockEnd(name.value);
                            break;
                        } else {
                            str += tok.value;
                            if (ws) {
                                str += ws.value;
                            }
                            str += name.value;
                        }
                    } else if (tok.type === lexer.TOKEN_STRING) {
                        str += '"' + tok.value + '"';
                    } else {
                        str += tok.value;
                    }
                }


                var output = new nodes.Output(
                    begun.lineno,
                    begun.colno, [new nodes.TemplateData(begun.lineno, begun.colno, str)]
                );

                return output;
            },

            parsePostfix: function(node) {
                var tok = this.peekToken();

                while (tok) {
                    if (tok.type == lexer.TOKEN_LEFT_PAREN) {
                        // Function call
                        node = new nodes.FunCall(tok.lineno,
                            tok.colno,
                            node,
                            this.parseSignature());
                    } else if (tok.type == lexer.TOKEN_LEFT_BRACKET) {
                        // Reference
                        var lookup = this.parseAggregate();
                        if (lookup.children.length > 1) {
                            this.fail('invalid index');
                        }

                        node = new nodes.LookupVal(tok.lineno,
                            tok.colno,
                            node,
                            lookup.children[0]);
                    } else if (tok.type == lexer.TOKEN_OPERATOR && tok.value == '.') {
                        // Reference
                        this.nextToken();
                        var val = this.nextToken();

                        if (val.type != lexer.TOKEN_SYMBOL) {
                            this.fail('expected name as lookup value, got ' + val.value,
                                val.lineno,
                                val.colno);
                        }

                        // Make a literal string because it's not a variable
                        // reference
                        var lookup = new nodes.Literal(val.lineno,
                            val.colno,
                            val.value);

                        node = new nodes.LookupVal(tok.lineno,
                            tok.colno,
                            node,
                            lookup);
                    } else {
                        break;
                    }

                    tok = this.peekToken();
                }

                return node;
            },

            parseExpression: function() {
                var node = this.parseInlineIf();
                return node;
            },

            parseInlineIf: function() {
                var node = this.parseIn();
                if (this.skipSymbol('if')) {
                    var cond_node = this.parseIn();
                    var body_node = node;
                    node = new nodes.InlineIf(node.lineno, node.colno);
                    node.body = body_node;
                    node.cond = cond_node;
                    if (this.skipSymbol('else')) {
                        node.else_ = this.parseIn();
                    } else {
                        node.else_ = null;
                    }
                }

                return node;
            },

            parseIn: function() {
                var node = this.parseOr();
                while (1) {
                    // check if the next token is 'not'
                    var tok = this.nextToken();
                    if (!tok) {
                        break;
                    }
                    var invert = tok.type == lexer.TOKEN_SYMBOL && tok.value == 'not';
                    // if it wasn't 'not', put it back
                    if (!invert) {
                        this.pushToken(tok);
                    }
                    if (this.skipSymbol('in')) {
                        var node2 = this.parseOr();
                        node = new nodes.In(node.lineno,
                            node.colno,
                            node,
                            node2);
                        if (invert) {
                            node = new nodes.Not(node.lineno,
                                node.colno,
                                node);
                        }
                    } else {
                        // if we'd found a 'not' but this wasn't an 'in', put back the 'not'
                        if (invert) {
                            this.pushToken(tok);
                        }
                        break;
                    }
                }
                return node;
            },

            parseOr: function() {
                var node = this.parseAnd();
                while (this.skipSymbol('or')) {
                    var node2 = this.parseAnd();
                    node = new nodes.Or(node.lineno,
                        node.colno,
                        node,
                        node2);
                }
                return node;
            },

            parseAnd: function() {
                var node = this.parseNot();
                while (this.skipSymbol('and')) {
                    var node2 = this.parseNot();
                    node = new nodes.And(node.lineno,
                        node.colno,
                        node,
                        node2);
                }
                return node;
            },

            parseNot: function() {
                var tok = this.peekToken();
                if (this.skipSymbol('not')) {
                    return new nodes.Not(tok.lineno,
                        tok.colno,
                        this.parseNot());
                }
                return this.parseCompare();
            },

            // ... 解析表达式
            parseCompare: function() {
                var compareOps = ['==', '!=', '<', '>', '<=', '>='];
                var expr = this.parseAdd();
                var ops = [];

                while (1) {
                    var tok = this.nextToken();

                    if (!tok) {
                        break;
                    } else if (lib.indexOf(compareOps, tok.value) !== -1) {
                        ops.push(new nodes.CompareOperand(tok.lineno,
                            tok.colno,
                            this.parseAdd(),
                            tok.value));
                    } else {
                        this.pushToken(tok);
                        break;
                    }
                }

                if (ops.length) {
                    return new nodes.Compare(ops[0].lineno,
                        ops[0].colno,
                        expr,
                        ops);
                } else {
                    return expr;
                }
            },

            parseAdd: function() {
                var node = this.parseSub();
                while (this.skipValue(lexer.TOKEN_OPERATOR, '+')) {
                    var node2 = this.parseSub();
                    node = new nodes.Add(node.lineno,
                        node.colno,
                        node,
                        node2);
                }
                return node;
            },

            parseSub: function() {
                var node = this.parseMul();
                while (this.skipValue(lexer.TOKEN_OPERATOR, '-')) {
                    var node2 = this.parseMul();
                    node = new nodes.Sub(node.lineno,
                        node.colno,
                        node,
                        node2);
                }
                return node;
            },

            parseMul: function() {
                var node = this.parseDiv();
                while (this.skipValue(lexer.TOKEN_OPERATOR, '*')) {
                    var node2 = this.parseDiv();
                    node = new nodes.Mul(node.lineno,
                        node.colno,
                        node,
                        node2);
                }
                return node;
            },

            parseDiv: function() {
                var node = this.parseFloorDiv();
                while (this.skipValue(lexer.TOKEN_OPERATOR, '/')) {
                    var node2 = this.parseFloorDiv();
                    node = new nodes.Div(node.lineno,
                        node.colno,
                        node,
                        node2);
                }
                return node;
            },

            parseFloorDiv: function() {
                var node = this.parseMod();
                while (this.skipValue(lexer.TOKEN_OPERATOR, '//')) {
                    var node2 = this.parseMod();
                    node = new nodes.FloorDiv(node.lineno,
                        node.colno,
                        node,
                        node2);
                }
                return node;
            },

            parseMod: function() {
                var node = this.parsePow();
                while (this.skipValue(lexer.TOKEN_OPERATOR, '%')) {
                    var node2 = this.parsePow();
                    node = new nodes.Mod(node.lineno,
                        node.colno,
                        node,
                        node2);
                }
                return node;
            },

            parsePow: function() {
                var node = this.parseUnary();
                while (this.skipValue(lexer.TOKEN_OPERATOR, '**')) {
                    var node2 = this.parseUnary();
                    node = new nodes.Pow(node.lineno,
                        node.colno,
                        node,
                        node2);
                }
                return node;
            },

            // ... 解析一元运算符 如5++
            parseUnary: function(noFilters) {
                var tok = this.peekToken();
                var node;

                if (this.skipValue(lexer.TOKEN_OPERATOR, '-')) {
                    node = new nodes.Neg(tok.lineno,
                        tok.colno,
                        this.parseUnary(true));
                } else if (this.skipValue(lexer.TOKEN_OPERATOR, '+')) {
                    node = new nodes.Pos(tok.lineno,
                        tok.colno,
                        this.parseUnary(true));
                } else {
                    node = this.parsePrimary();
                }

                if (!noFilters) {
                    node = this.parseFilter(node);
                }

                return node;
            },

            parsePrimary: function(noPostfix) {
                var tok = this.nextToken();
                var val = null;
                var node = null;

                if (!tok) {
                    this.fail('expected expression, got end of file');
                } else if (tok.type == lexer.TOKEN_STRING) {
                    val = tok.value;
                } else if (tok.type == lexer.TOKEN_INT) {
                    val = parseInt(tok.value, 10);
                } else if (tok.type == lexer.TOKEN_FLOAT) {
                    val = parseFloat(tok.value);
                } else if (tok.type == lexer.TOKEN_BOOLEAN) {
                    if (tok.value == "true") {
                        val = true;
                    } else if (tok.value == "false") {
                        val = false;
                    } else {
                        this.fail("invalid boolean: " + tok.value,
                            tok.lineno,
                            tok.colno);
                    }
                } else if (tok.type == lexer.TOKEN_REGEX) {
                    val = new RegExp(tok.value.body, tok.value.flags);
                }

                if (val !== null) {
                    node = new nodes.Literal(tok.lineno, tok.colno, val);
                } else if (tok.type == lexer.TOKEN_SYMBOL) {
                    node = new nodes.Symbol(tok.lineno, tok.colno, tok.value);

                    if (!noPostfix) {
                        node = this.parsePostfix(node);
                    }
                } else {
                    // See if it's an aggregate type, we need to push the
                    // current delimiter token back on
                    this.pushToken(tok);
                    node = this.parseAggregate();
                }

                if (node) {
                    return node;
                } else {
                    this.fail('unexpected token: ' + tok.value,
                        tok.lineno,
                        tok.colno);
                }
            },

            parseFilter: function(node) {
                while (this.skip(lexer.TOKEN_PIPE)) {
                    var tok = this.expect(lexer.TOKEN_SYMBOL);
                    var name = tok.value;

                    while (this.skipValue(lexer.TOKEN_OPERATOR, '.')) {
                        name += '.' + this.expect(lexer.TOKEN_SYMBOL).value;
                    }

                    node = new nodes.Filter(
                        tok.lineno,
                        tok.colno,
                        new nodes.Symbol(tok.lineno,
                            tok.colno,
                            name),
                        new nodes.NodeList(
                            tok.lineno,
                            tok.colno, [node])
                    );

                    if (this.peekToken().type == lexer.TOKEN_LEFT_PAREN) {
                        // Get a FunCall node and add the parameters to the
                        // filter
                        var call = this.parsePostfix(node);
                        node.args.children = node.args.children.concat(call.args.children);
                    }
                }

                return node;
            },

            parseAggregate: function() {
                var tok = this.nextToken();
                var node;

                switch (tok.type) {
                    case lexer.TOKEN_LEFT_PAREN:
                        node = new nodes.Group(tok.lineno, tok.colno);
                        break;
                    case lexer.TOKEN_LEFT_BRACKET:
                        node = new nodes.Array(tok.lineno, tok.colno);
                        break;
                    case lexer.TOKEN_LEFT_CURLY:
                        node = new nodes.Dict(tok.lineno, tok.colno);
                        break;
                    default:
                        return null;
                }

                while (1) {
                    var type = this.peekToken().type;
                    if (type == lexer.TOKEN_RIGHT_PAREN ||
                        type == lexer.TOKEN_RIGHT_BRACKET ||
                        type == lexer.TOKEN_RIGHT_CURLY) {
                        this.nextToken();
                        break;
                    }

                    if (node.children.length > 0) {
                        if (!this.skip(lexer.TOKEN_COMMA)) {
                            this.fail("parseAggregate: expected comma after expression",
                                tok.lineno,
                                tok.colno);
                        }
                    }

                    if (node instanceof nodes.Dict) {
                        // TODO: check for errors
                        var key = this.parsePrimary();

                        // We expect a key/value pair for dicts, separated by a
                        // colon
                        if (!this.skip(lexer.TOKEN_COLON)) {
                            this.fail("parseAggregate: expected colon after dict key",
                                tok.lineno,
                                tok.colno);
                        }

                        // TODO: check for errors
                        var value = this.parseExpression();
                        node.addChild(new nodes.Pair(key.lineno,
                            key.colno,
                            key,
                            value));
                    } else {
                        // TODO: check for errors
                        var expr = this.parseExpression();
                        node.addChild(expr);
                    }
                }

                return node;
            },

            parseSignature: function(tolerant, noParens) {
                var tok = this.peekToken();
                if (!noParens && tok.type != lexer.TOKEN_LEFT_PAREN) {
                    if (tolerant) {
                        return null;
                    } else {
                        this.fail('expected arguments', tok.lineno, tok.colno);
                    }
                }

                if (tok.type == lexer.TOKEN_LEFT_PAREN) {
                    tok = this.nextToken();
                }

                var args = new nodes.NodeList(tok.lineno, tok.colno);
                var kwargs = new nodes.KeywordArgs(tok.lineno, tok.colno);
                var kwnames = [];
                var checkComma = false;

                while (1) {
                    tok = this.peekToken();
                    if (!noParens && tok.type == lexer.TOKEN_RIGHT_PAREN) {
                        this.nextToken();
                        break;
                    } else if (noParens && tok.type == lexer.TOKEN_BLOCK_END) {
                        break;
                    }

                    if (checkComma && !this.skip(lexer.TOKEN_COMMA)) {
                        this.fail("parseSignature: expected comma after expression",
                            tok.lineno,
                            tok.colno);
                    } else {
                        var arg = this.parseExpression();

                        if (this.skipValue(lexer.TOKEN_OPERATOR, '=')) {
                            kwargs.addChild(
                                new nodes.Pair(arg.lineno,
                                    arg.colno,
                                    arg,
                                    this.parseExpression())
                            );
                        } else {
                            args.addChild(arg);
                        }
                    }

                    checkComma = true;
                }

                if (kwargs.children.length) {
                    args.addChild(kwargs);
                }

                return args;
            },

            parseUntilBlocks: function( /* blockNames */ ) {
                var prev = this.breakOnBlocks;
                this.breakOnBlocks = lib.toArray(arguments);

                var ret = this.parse();

                this.breakOnBlocks = prev;
                return ret;
            },

            // ... 进行语法分析 即把词法分析器提取出来的token(简单的object对象)转化成对应类型的Node类的实例
            // ... note 语法分析过程和词法分析过程(即token提取)是同时步进的。
            //     语法分析器使用词法分析器对字符流中包含的token进行提取和预取，并马上进行分析处理。
            parseNodes: function() {
                var tok;
                var buf = [];

                // ... note 在分析当前token的同时还预读了下一个token 只是为了判断"是否要删除
                //          当前token的value的右边空白字符"
                // ... tip  预读的下一个token存在了peeked属性上
                    // debugger;
                while ((tok = this.nextToken())) {
                
                    if (tok.type == lexer.TOKEN_DATA) {
                        var data = tok.value;
                        var nextToken = this.peekToken();
                        var nextVal = nextToken && nextToken.value;

                        // If the last token has "-" we need to trim the
                        // leading whitespace of the data. This is marked with
                        // the `dropLeadingWhitespace` variable.
                        if (this.dropLeadingWhitespace) {
                            // TODO: this could be optimized (don't use regex)
                            data = data.replace(/^\s*/, '');
                            this.dropLeadingWhitespace = false;
                        }

                        // Same for the succeding block start token
                        // ... 看下一个token是不是"{{-" 如果是 则删除当前token的value的右边空白字符
                        if (nextToken &&
                            nextToken.type == lexer.TOKEN_BLOCK_START &&
                            nextVal.charAt(nextVal.length - 1) == '-') {
                            // TODO: this could be optimized (don't use regex)
                            data = data.replace(/\s*$/, '');
                        }

                        // ... 对模板中原始字符串的处理
                        // buf.push(new nodes.Output(tok.lineno,
                        //     tok.colno, [new nodes.TemplateData(tok.lineno,
                        //         tok.colno,
                        //         data)])); // 原代码
                        
                        // ... 分解的代码
                        var __nTplData = new nodes.TemplateData(tok.lineno, tok.colno, data);
                        var __nOutput = new nodes.Output(tok.lineno, tok.colno, [__nTplData]);
                        buf.push(__nOutput);
                    } else if (tok.type == lexer.TOKEN_BLOCK_START) {
                        var n = this.parseStatement();
                        if (!n) {
                            break;
                        }
                        buf.push(n);
                    } else if (tok.type == lexer.TOKEN_VARIABLE_START) {
                        // ... to make sure 找出接下来的完整表达式
                        // ... 该表达式整体作为一个token
                        var e = this.parseExpression();
                        this.advanceAfterVariableEnd();
                        buf.push(new nodes.Output(tok.lineno, tok.colno, [e]));
                    } else if (tok.type != lexer.TOKEN_COMMENT) {
                        // Ignore comments, otherwise this should be an error
                        this.fail("Unexpected token at top-level: " +
                            tok.type, tok.lineno, tok.colno);
                    }
                }

                return buf;
            },

            parse: function() {
                return new nodes.NodeList(0, 0, this.parseNodes());
            },

            // ... 创建语法树
            parseAsRoot: function() {
                // ... 将原代码拆分
                // ... 语法分析的正式开始
                // ... 返回AST的节点数组 即[node1, node2, ...] 其中每个node
                // ... 都是nodes.js模块中定义的不同类型的Node类的一个实例
                var astNodes = this.parseNodes(); // 拆分的代码
                debugger;
                // ... 创建语法树永远的根节点
                var ast = new nodes.Root(0, 0, astNodes); // 拆分的代码
                return ast; // 拆分的代码
                // return new nodes.Root(0, 0, this.parseNodes()); // 原代码
            }
        });

        // var util = modules["util"];

        // var l = lexer.lex('{%- if x -%}\n hello {% endif %}');
        // var t;
        // while((t = l.nextToken())) {
        //     console.log(util.inspect(t));
        // }

        // var p = new Parser(lexer.lex('{% if not x %}foo{% endif %}'));
        // var n = p.parseAsRoot();
        // nodes.printNodes(n);

        modules['parser'] = {
            parse: function(src, extensions, lexerTags) {
                // var p = new Parser(lexer.lex(src, lexerTags)); // 原代码

                // ...step1 lexer.lex() 返回的是一个Tokenizer类的示例
                // ...note 在创建Tokenizer类的实例时，并没有对字符流进行分析
                var tokenizer = lexer.lex(src, lexerTags); // 分解的代码
                // ...step2 创建词法解析器的实例
                // ...note 在实例化词法解析器时，并没有执行具体的解析行为
                var p = new Parser(tokenizer); // 分解的代码

                if (extensions !== undefined) {
                    p.extensions = extensions;
                }
                return p.parseAsRoot();
            }
        };
    })();
    // file: transformer.js
    (function() {
        var nodes = modules["nodes"];
        var lib = modules["lib"];

        var sym = 0;

        function gensym() {
            return 'hole_' + sym++;
        }

        // ...? 写入时复制
        // copy-on-write version of map
        function mapCOW(arr, func) {
            var res = null;

            for (var i = 0; i < arr.length; i++) {
                var item = func(arr[i]);

                if (item !== arr[i]) {
                    if (!res) {
                        res = arr.slice();
                    }

                    res[i] = item;
                }
            }

            return res || arr;
        }

        function walk(ast, func, depthFirst) {
            if (!(ast instanceof nodes.Node)) {
                return ast;
            }

            if (!depthFirst) {
                var astT = func(ast);

                if (astT && astT !== ast) {
                    return astT;
                }
            }

            if (ast instanceof nodes.NodeList) {
                var children = mapCOW(ast.children, function(node) {
                    return walk(node, func, depthFirst);
                });

                if (children !== ast.children) {
                    ast = new nodes[ast.typename](ast.lineno, ast.colno, children);
                }
            } else if (ast instanceof nodes.CallExtension) {
                var args = walk(ast.args, func, depthFirst);

                var contentArgs = mapCOW(ast.contentArgs, function(node) {
                    return walk(node, func, depthFirst);
                });

                if (args !== ast.args || contentArgs !== ast.contentArgs) {
                    ast = new nodes[ast.typename](ast.extName,
                        ast.prop,
                        args,
                        contentArgs);
                }
            } else {
                var props = ast.fields.map(function(field) {
                    return ast[field];
                });

                var propsT = mapCOW(props, function(prop) {
                    return walk(prop, func, depthFirst);
                });

                if (propsT !== props) {
                    ast = new nodes[ast.typename](ast.lineno, ast.colno);

                    propsT.forEach(function(prop, i) {
                        ast[ast.fields[i]] = prop;
                    });
                }
            }

            return depthFirst ? (func(ast) || ast) : ast;
        }

        function depthWalk(ast, func) {
            return walk(ast, func, true);
        }

        function _liftFilters(node, asyncFilters, prop) {
            var children = [];

            var walked = depthWalk(prop ? node[prop] : node, function(node) {
                if (node instanceof nodes.Block) {
                    return node;
                } else if ((node instanceof nodes.Filter &&
                        lib.indexOf(asyncFilters, node.name.value) !== -1) ||
                    node instanceof nodes.CallExtensionAsync) {
                    var symbol = new nodes.Symbol(node.lineno,
                        node.colno,
                        gensym());

                    children.push(new nodes.FilterAsync(node.lineno,
                        node.colno,
                        node.name,
                        node.args,
                        symbol));
                    return symbol;
                }
            });

            if (prop) {
                node[prop] = walked;
            } else {
                node = walked;
            }

            if (children.length) {
                children.push(node);

                return new nodes.NodeList(
                    node.lineno,
                    node.colno,
                    children
                );
            } else {
                return node;
            }
        }

        function liftFilters(ast, asyncFilters) {
            return depthWalk(ast, function(node) {
                if (node instanceof nodes.Output) {
                    return _liftFilters(node, asyncFilters);
                } else if (node instanceof nodes.For) {
                    return _liftFilters(node, asyncFilters, 'arr');
                } else if (node instanceof nodes.If) {
                    return _liftFilters(node, asyncFilters, 'cond');
                } else if (node instanceof nodes.CallExtension) {
                    return _liftFilters(node, asyncFilters, 'args');
                }
            });
        }

        function liftSuper(ast) {
            return walk(ast, function(blockNode) {
                if (!(blockNode instanceof nodes.Block)) {
                    return;
                }

                var hasSuper = false;
                var symbol = gensym();

                blockNode.body = walk(blockNode.body, function(node) {
                    if (node instanceof nodes.FunCall &&
                        node.name.value == 'super') {
                        hasSuper = true;
                        return new nodes.Symbol(node.lineno, node.colno, symbol);
                    }
                });

                if (hasSuper) {
                    blockNode.body.children.unshift(new nodes.Super(
                        0, 0, blockNode.name, new nodes.Symbol(0, 0, symbol)
                    ));
                }
            });
        }

        function convertStatements(ast) {
            return depthWalk(ast, function(node) {
                if (!(node instanceof nodes.If) &&
                    !(node instanceof nodes.For)) {
                    return;
                }

                var async = false;
                walk(node, function(node) {
                    if (node instanceof nodes.FilterAsync ||
                        node instanceof nodes.IfAsync ||
                        node instanceof nodes.AsyncEach ||
                        node instanceof nodes.AsyncAll ||
                        node instanceof nodes.CallExtensionAsync) {
                        async = true;
                        // Stop iterating by returning the node
                        return node;
                    }
                });

                if (async) {
                    if (node instanceof nodes.If) {
                        return new nodes.IfAsync(
                            node.lineno,
                            node.colno,
                            node.cond,
                            node.body,
                            node.else_
                        );
                    } else if (node instanceof nodes.For) {
                        return new nodes.AsyncEach(
                            node.lineno,
                            node.colno,
                            node.arr,
                            node.name,
                            node.body,
                            node.else_
                        );
                    }
                }
            });
        }

        function cps(ast, asyncFilters) {
            return convertStatements(liftSuper(liftFilters(ast, asyncFilters)));
        }

        function transform(ast, asyncFilters, name) {
            return cps(ast, asyncFilters || []);
        }

        // var parser = modules["parser"];
        // var src = 'hello {% foo %}{% endfoo %} end';
        // var ast = transform(parser.parse(src, [new FooExtension()]), ['bar']);
        // nodes.printNodes(ast);


        modules['transformer'] = {
            transform: transform
        };
    })();
    // file: compiler.js
    (function() {
        var lib = modules["lib"];
        var parser = modules["parser"];
        var transformer = modules["transformer"];
        var nodes = modules["nodes"];
        var Object = modules["object"];
        var Frame = modules["runtime"].Frame;

        // These are all the same for now, but shouldn't be passed straight
        // through
        var compareOps = {
            '==': '==',
            '!=': '!=',
            '<': '<',
            '>': '>',
            '<=': '<=',
            '>=': '>='
        };

        // A common pattern is to emit binary operators
        function binOpEmitter(str) {
            return function(node, frame) {
                this.compile(node.left, frame);
                this.emit(str);
                this.compile(node.right, frame);
            };
        }

        // Generate an array of strings
        function quotedArray(arr) {
            return '[' +
                lib.map(arr, function(x) {
                    return '"' + x + '"';
                }) +
                ']';
        }

        var Compiler = Object.extend({
            init: function() {
                this.codebuf = [];
                this.lastId = 0;
                this.buffer = null;
                this.bufferStack = [];
                this.isChild = false;
                // ...todo 看看都有什么情况
                this.scopeClosers = '';
            },

            fail: function(msg, lineno, colno) {
                if (lineno !== undefined) lineno += 1;
                if (colno !== undefined) colno += 1;

                throw new lib.TemplateError(msg, lineno, colno);
            },

            pushBufferId: function(id) {
                this.bufferStack.push(this.buffer);
                this.buffer = id;
                this.emit('var ' + this.buffer + ' = "";');
            },

            popBufferId: function() {
                this.buffer = this.bufferStack.pop();
            },

            emit: function(code) {
                this.codebuf.push(code);
            },

            emitLine: function(code) {
                this.emit(code + "\n");
            },

            emitLines: function() {
                lib.each(lib.toArray(arguments), function(line) {
                    this.emitLine(line);
                }, this);
            },

            emitFuncBegin: function(name) {
                // ... 注意buffer
                this.buffer = 'output';
                this.scopeClosers = '';
                this.emitLine('function ' + name + '(env, context, frame, runtime, cb) {');
                this.emitLine('var lineno = null;');
                this.emitLine('var colno = null;');
                // ... 使用buffer
                this.emitLine('var ' + this.buffer + ' = "";'); 
                this.emitLine('try {');
            },

            emitFuncEnd: function(noReturn) {
                if (!noReturn) {
                    this.emitLine('cb(null, ' + this.buffer + ');');
                }

                this.closeScopeLevels();
                this.emitLine('} catch (e) {');
                this.emitLine('  cb(runtime.handleError(e, lineno, colno));');
                this.emitLine('}');
                this.emitLine('}');
                this.buffer = null;
            },

            addScopeLevel: function() {
                this.scopeClosers += '})';
            },

            closeScopeLevels: function() {
                this.emitLine(this.scopeClosers + ';');
                this.scopeClosers = '';
            },

            withScopedSyntax: function(func) {
                var scopeClosers = this.scopeClosers;
                this.scopeClosers = '';

                func.call(this);

                this.closeScopeLevels();
                this.scopeClosers = scopeClosers;
            },

            makeCallback: function(res) {
                var err = this.tmpid();

                return 'function(' + err + (res ? ',' + res : '') + ') {\n' +
                    'if(' + err + ') { cb(' + err + '); return; }';
            },

            tmpid: function() {
                this.lastId++;
                return 't_' + this.lastId;
            },

            _bufferAppend: function(func) {
                this.emit(this.buffer + ' += runtime.suppressValue(');
                func.call(this);
                this.emit(', env.autoesc);\n');
            },

            _compileChildren: function(node, frame) {
                var children = node.children;
                for (var i = 0, l = children.length; i < l; i++) {
                    this.compile(children[i], frame);
                }
            },

            _compileAggregate: function(node, frame, startChar, endChar) {
                if (startChar) {
                    this.emit(startChar);
                }

                for (var i = 0; i < node.children.length; i++) {
                    if (i > 0) {
                        this.emit(',');
                    }

                    this.compile(node.children[i], frame);
                }

                if (endChar) {
                    this.emit(endChar);
                }
            },

            _compileExpression: function(node, frame) {
                // TODO: I'm not really sure if this type check is worth it or
                // not.
                this.assertType(
                    node,
                    nodes.Literal,
                    nodes.Symbol,
                    nodes.Group,
                    nodes.Array,
                    nodes.Dict,
                    nodes.FunCall,
                    nodes.Caller,
                    nodes.Filter,
                    nodes.LookupVal,
                    nodes.Compare,
                    nodes.InlineIf,
                    nodes.In,
                    nodes.And,
                    nodes.Or,
                    nodes.Not,
                    nodes.Add,
                    nodes.Sub,
                    nodes.Mul,
                    nodes.Div,
                    nodes.FloorDiv,
                    nodes.Mod,
                    nodes.Pow,
                    nodes.Neg,
                    nodes.Pos,
                    nodes.Compare,
                    nodes.NodeList
                );
                this.compile(node, frame);
            },

            assertType: function(node /*, types */ ) {
                var types = lib.toArray(arguments).slice(1);
                var success = false;

                for (var i = 0; i < types.length; i++) {
                    if (node instanceof types[i]) {
                        success = true;
                    }
                }

                if (!success) {
                    this.fail("assertType: invalid type: " + node.typename,
                        node.lineno,
                        node.colno);
                }
            },

            compileCallExtension: function(node, frame, async) {
                var name = node.extName;
                var args = node.args;
                var contentArgs = node.contentArgs;
                var autoescape = typeof node.autoescape === 'boolean' ? node.autoescape : true;
                var transformedArgs = [];

                if (!async) {
                    this.emit(this.buffer + ' += runtime.suppressValue(');
                }

                this.emit('env.getExtension("' + node.extName + '")["' + node.prop + '"](');
                this.emit('context');

                if (args || contentArgs) {
                    this.emit(',');
                }

                if (args) {
                    if (!(args instanceof nodes.NodeList)) {
                        this.fail('compileCallExtension: arguments must be a NodeList, ' +
                            'use `parser.parseSignature`');
                    }

                    lib.each(args.children, function(arg, i) {
                        // Tag arguments are passed normally to the call. Note
                        // that keyword arguments are turned into a single js
                        // object as the last argument, if they exist.
                        this._compileExpression(arg, frame);

                        if (i != args.children.length - 1 || contentArgs.length) {
                            this.emit(',');
                        }
                    }, this);
                }

                if (contentArgs.length) {
                    lib.each(contentArgs, function(arg, i) {
                        if (i > 0) {
                            this.emit(',');
                        }

                        if (arg) {
                            var id = this.tmpid();

                            this.emitLine('function(cb) {');
                            this.emitLine('if(!cb) { cb = function(err) { if(err) { throw err; }}}');
                            this.pushBufferId(id);

                            this.withScopedSyntax(function() {
                                this.compile(arg, frame);
                                this.emitLine('cb(null, ' + id + ');');
                            });

                            this.popBufferId();
                            this.emitLine('return ' + id + ';');
                            this.emitLine('}');
                        } else {
                            this.emit('null');
                        }
                    }, this);
                }

                if (async) {
                    var res = this.tmpid();
                    this.emitLine(', ' + this.makeCallback(res));
                    this.emitLine(this.buffer + ' += runtime.suppressValue(' + res + ', ' + autoescape + ' && env.autoesc);');
                    this.addScopeLevel();
                } else {
                    this.emit(')');
                    this.emit(', ' + autoescape + ' && env.autoesc);\n');
                }
            },

            compileCallExtensionAsync: function(node, frame) {
                this.compileCallExtension(node, frame, true);
            },

            compileNodeList: function(node, frame) {
                this._compileChildren(node, frame);
            },

            compileLiteral: function(node, frame) {
                if (typeof node.value == "string") {
                    var val = node.value.replace(/\\/g, '\\\\');
                    val = val.replace(/"/g, '\\"');
                    val = val.replace(/\n/g, "\\n");
                    val = val.replace(/\r/g, "\\r");
                    val = val.replace(/\t/g, "\\t");
                    this.emit('"' + val + '"');
                } else {
                    this.emit(node.value.toString());
                }
            },

            compileSymbol: function(node, frame) {
                var name = node.value;
                var v;

                if ((v = frame.lookup(name))) {
                    this.emit(v);
                } else {
                    this.emit('runtime.contextOrFrameLookup(' +
                        'context, frame, "' + name + '")');
                }
            },

            compileGroup: function(node, frame) {
                this._compileAggregate(node, frame, '(', ')');
            },

            compileArray: function(node, frame) {
                this._compileAggregate(node, frame, '[', ']');
            },

            compileDict: function(node, frame) {
                this._compileAggregate(node, frame, '{', '}');
            },

            compilePair: function(node, frame) {
                var key = node.key;
                var val = node.value;

                if (key instanceof nodes.Symbol) {
                    key = new nodes.Literal(key.lineno, key.colno, key.value);
                } else if (!(key instanceof nodes.Literal &&
                        typeof key.value == "string")) {
                    this.fail("compilePair: Dict keys must be strings or names",
                        key.lineno,
                        key.colno);
                }

                this.compile(key, frame);
                this.emit(': ');
                this._compileExpression(val, frame);
            },

            compileInlineIf: function(node, frame) {
                this.emit('(');
                this.compile(node.cond, frame);
                this.emit('?');
                this.compile(node.body, frame);
                this.emit(':');
                if (node.else_ !== null)
                    this.compile(node.else_, frame);
                else
                    this.emit('""');
                this.emit(')');
            },

            compileIn: function(node, frame) {
                this.emit('(');
                this.compile(node.right, frame);
                this.emit('.indexOf(');
                this.compile(node.left, frame);
                this.emit(') !== -1)');
            },

            compileOr: binOpEmitter(' || '),
            compileAnd: binOpEmitter(' && '),
            compileAdd: binOpEmitter(' + '),
            compileSub: binOpEmitter(' - '),
            compileMul: binOpEmitter(' * '),
            compileDiv: binOpEmitter(' / '),
            compileMod: binOpEmitter(' % '),

            compileNot: function(node, frame) {
                this.emit('!');
                this.compile(node.target, frame);
            },

            compileFloorDiv: function(node, frame) {
                this.emit('Math.floor(');
                this.compile(node.left, frame);
                this.emit(' / ');
                this.compile(node.right, frame);
                this.emit(')');
            },

            compilePow: function(node, frame) {
                this.emit('Math.pow(');
                this.compile(node.left, frame);
                this.emit(', ');
                this.compile(node.right, frame);
                this.emit(')');
            },

            compileNeg: function(node, frame) {
                this.emit('-');
                this.compile(node.target, frame);
            },

            compilePos: function(node, frame) {
                this.emit('+');
                this.compile(node.target, frame);
            },

            compileCompare: function(node, frame) {
                this.compile(node.expr, frame);

                for (var i = 0; i < node.ops.length; i++) {
                    var n = node.ops[i];
                    this.emit(' ' + compareOps[n.type] + ' ');
                    this.compile(n.expr, frame);
                }
            },

            compileLookupVal: function(node, frame) {
                this.emit('runtime.memberLookup((');
                this._compileExpression(node.target, frame);
                this.emit('),');
                this._compileExpression(node.val, frame);
                this.emit(', env.autoesc)');
            },

            _getNodeName: function(node) {
                switch (node.typename) {
                    case 'Symbol':
                        return node.value;
                    case 'FunCall':
                        return 'the return value of (' + this._getNodeName(node.name) + ')';
                    case 'LookupVal':
                        return this._getNodeName(node.target) + '["' +
                            this._getNodeName(node.val) + '"]';
                    case 'Literal':
                        return node.value.toString().substr(0, 10);
                    default:
                        return '--expression--';
                }
            },

            compileFunCall: function(node, frame) {
                // Keep track of line/col info at runtime by settings
                // variables within an expression. An expression in javascript
                // like (x, y, z) returns the last value, and x and y can be
                // anything
                this.emit('(lineno = ' + node.lineno +
                    ', colno = ' + node.colno + ', ');

                this.emit('runtime.callWrap(');
                // Compile it as normal.
                this._compileExpression(node.name, frame);

                // Output the name of what we're calling so we can get friendly errors
                // if the lookup fails.
                this.emit(', "' + this._getNodeName(node.name).replace(/"/g, '\\"') + '", ');

                this._compileAggregate(node.args, frame, '[', '])');

                this.emit(')');
            },

            compileFilter: function(node, frame) {
                var name = node.name;
                this.assertType(name, nodes.Symbol);

                this.emit('env.getFilter("' + name.value + '").call(context, ');
                this._compileAggregate(node.args, frame);
                this.emit(')');
            },

            compileFilterAsync: function(node, frame) {
                var name = node.name;
                this.assertType(name, nodes.Symbol);

                var symbol = node.symbol.value;
                frame.set(symbol, symbol);

                this.emit('env.getFilter("' + name.value + '").call(context, ');
                this._compileAggregate(node.args, frame);
                this.emitLine(', ' + this.makeCallback(symbol));

                this.addScopeLevel();
            },

            compileKeywordArgs: function(node, frame) {
                var names = [];

                lib.each(node.children, function(pair) {
                    names.push(pair.key.value);
                });

                this.emit('runtime.makeKeywordArgs(');
                this.compileDict(node, frame);
                this.emit(')');
            },

            compileSet: function(node, frame) {
                var ids = [];

                // Lookup the variable names for each identifier and create
                // new ones if necessary
                lib.each(node.targets, function(target) {
                    var name = target.value;
                    var id = frame.lookup(name);

                    if (id == null) {
                        id = this.tmpid();

                        // Note: This relies on js allowing scope across
                        // blocks, in case this is created inside an `if`
                        this.emitLine('var ' + id + ';');
                    }

                    ids.push(id);
                }, this);

                this.emit(ids.join(' = ') + ' = ');
                this._compileExpression(node.value, frame);
                this.emitLine(';');

                lib.each(node.targets, function(target, i) {
                    var id = ids[i];
                    var name = target.value;

                    this.emitLine('frame.set("' + name + '", ' + id + ', true);');

                    // We are running this for every var, but it's very
                    // uncommon to assign to multiple vars anyway
                    this.emitLine('if(!frame.parent) {');
                    this.emitLine('context.setVariable("' + name + '", ' + id + ');');
                    if (name.charAt(0) != '_') {
                        this.emitLine('context.addExport("' + name + '");');
                    }
                    this.emitLine('}');
                }, this);
            },

            compileIf: function(node, frame, async) {
                this.emit('if(');
                this._compileExpression(node.cond, frame);
                this.emitLine(') {');

                this.withScopedSyntax(function() {
                    this.compile(node.body, frame);

                    if (async) {
                        this.emit('cb()');
                    }
                });

                if (node.else_) {
                    this.emitLine('}\nelse {');

                    this.withScopedSyntax(function() {
                        this.compile(node.else_, frame);

                        if (async) {
                            this.emit('cb()');
                        }
                    });
                } else if (async) {
                    this.emitLine('}\nelse {');
                    this.emit('cb()');
                }

                this.emitLine('}');
            },

            compileIfAsync: function(node, frame) {
                this.emit('(function(cb) {');
                this.compileIf(node, frame, true);
                this.emit('})(function() {');
                this.addScopeLevel();
            },

            emitLoopBindings: function(node, arr, i, len) {
                var bindings = {
                    index: i + ' + 1',
                    index0: i,
                    revindex: len + ' - ' + i,
                    revindex0: len + ' - ' + i + ' - 1',
                    first: i + ' === 0',
                    last: i + ' === ' + len + ' - 1',
                    length: len
                };

                for (var name in bindings) {
                    this.emitLine('frame.set("loop.' + name + '", ' + bindings[name] + ');');
                }
            },

            compileFor: function(node, frame) {
                // Some of this code is ugly, but it keeps the generated code
                // as fast as possible. ForAsync also shares some of this, but
                // not much.

                var i = this.tmpid();
                var len = this.tmpid();
                var arr = this.tmpid();
                frame = frame.push();

                this.emitLine('frame = frame.push();');

                this.emit('var ' + arr + ' = ');
                this._compileExpression(node.arr, frame);
                this.emitLine(';');

                this.emit('if(' + arr + ') {');

                // If multiple names are passed, we need to bind them
                // appropriately
                if (node.name instanceof nodes.Array) {
                    this.emitLine('var ' + i + ';');

                    // The object could be an arroy or object. Note that the
                    // body of the loop is duplicated for each condition, but
                    // we are optimizing for speed over size.
                    this.emitLine('if(runtime.isArray(' + arr + ')) {'); {
                        this.emitLine('var ' + len + ' = ' + arr + '.length;');
                        this.emitLine('for(' + i + '=0; ' + i + ' < ' + arr + '.length; ' + i + '++) {');

                        // Bind each declared var
                        for (var u = 0; u < node.name.children.length; u++) {
                            var tid = this.tmpid();
                            this.emitLine('var ' + tid + ' = ' + arr + '[' + i + '][' + u + ']');
                            this.emitLine('frame.set("' + node.name.children[u].value + '", ' + arr + '[' + i + '][' + u + ']' + ');');
                            frame.set(node.name.children[u].value, tid);
                        }

                        this.emitLoopBindings(node, arr, i, len);
                        this.withScopedSyntax(function() {
                            this.compile(node.body, frame);
                        });
                        this.emitLine('}');
                    }

                    this.emitLine('} else {'); {
                        // Iterate over the key/values of an object
                        var key = node.name.children[0];
                        var val = node.name.children[1];
                        var k = this.tmpid();
                        var v = this.tmpid();
                        frame.set(key.value, k);
                        frame.set(val.value, v);

                        this.emitLine(i + ' = -1;');
                        this.emitLine('var ' + len + ' = runtime.keys(' + arr + ').length;');
                        this.emitLine('for(var ' + k + ' in ' + arr + ') {');
                        this.emitLine(i + '++;');
                        this.emitLine('var ' + v + ' = ' + arr + '[' + k + '];');
                        this.emitLine('frame.set("' + key.value + '", ' + k + ');');
                        this.emitLine('frame.set("' + val.value + '", ' + v + ');');

                        this.emitLoopBindings(node, arr, i, len);
                        this.withScopedSyntax(function() {
                            this.compile(node.body, frame);
                        });
                        this.emitLine('}');
                    }

                    this.emitLine('}');
                } else {
                    // Generate a typical array iteration
                    var v = this.tmpid();
                    frame.set(node.name.value, v);

                    this.emitLine('var ' + len + ' = ' + arr + '.length;');
                    this.emitLine('for(var ' + i + '=0; ' + i + ' < ' + arr + '.length; ' +
                        i + '++) {');
                    this.emitLine('var ' + v + ' = ' + arr + '[' + i + '];');
                    this.emitLine('frame.set("' + node.name.value + '", ' + v + ');');

                    this.emitLoopBindings(node, arr, i, len);

                    this.withScopedSyntax(function() {
                        this.compile(node.body, frame);
                    });

                    this.emitLine('}');
                }

                this.emitLine('}');
                if (node.else_) {
                    this.emitLine('if (!' + len + ') {');
                    this.compile(node.else_, frame);
                    this.emitLine('}');
                }

                this.emitLine('frame = frame.pop();');
            },

            _compileAsyncLoop: function(node, frame, parallel) {
                // This shares some code with the For tag, but not enough to
                // worry about. This iterates across an object asynchronously,
                // but not in parallel.

                var i = this.tmpid();
                var len = this.tmpid();
                var arr = this.tmpid();
                var asyncMethod = parallel ? 'asyncAll' : 'asyncEach';
                frame = frame.push();

                this.emitLine('frame = frame.push();');

                this.emit('var ' + arr + ' = ');
                this._compileExpression(node.arr, frame);
                this.emitLine(';');

                if (node.name instanceof nodes.Array) {
                    this.emit('runtime.' + asyncMethod + '(' + arr + ', ' +
                        node.name.children.length + ', function(');

                    lib.each(node.name.children, function(name) {
                        this.emit(name.value + ',');
                    }, this);

                    this.emit(i + ',' + len + ',next) {');

                    lib.each(node.name.children, function(name) {
                        var id = name.value;
                        frame.set(id, id);
                        this.emitLine('frame.set("' + id + '", ' + id + ');');
                    }, this);
                } else {
                    var id = node.name.value;
                    this.emitLine('runtime.' + asyncMethod + '(' + arr + ', 1, function(' + id + ', ' + i + ', ' + len + ',next) {');
                    this.emitLine('frame.set("' + id + '", ' + id + ');');
                    frame.set(id, id);
                }

                this.emitLoopBindings(node, arr, i, len);

                this.withScopedSyntax(function() {
                    var buf;
                    if (parallel) {
                        buf = this.tmpid();
                        this.pushBufferId(buf);
                    }

                    this.compile(node.body, frame);
                    this.emitLine('next(' + i + (buf ? ',' + buf : '') + ');');

                    if (parallel) {
                        this.popBufferId();
                    }
                });

                var output = this.tmpid();
                this.emitLine('}, ' + this.makeCallback(output));
                this.addScopeLevel();

                if (parallel) {
                    this.emitLine(this.buffer + ' += ' + output + ';');
                }

                if (node.else_) {
                    this.emitLine('if (!' + arr + '.length) {');
                    this.compile(node.else_, frame);
                    this.emitLine('}');
                }

                this.emitLine('frame = frame.pop();');
            },

            compileAsyncEach: function(node, frame) {
                this._compileAsyncLoop(node, frame);
            },

            compileAsyncAll: function(node, frame) {
                this._compileAsyncLoop(node, frame, true);
            },

            _compileMacro: function(node, frame) {
                var args = [];
                var kwargs = null;
                var funcId = 'macro_' + this.tmpid();

                // Type check the definition of the args
                lib.each(node.args.children, function(arg, i) {
                    if (i === node.args.children.length - 1 &&
                        arg instanceof nodes.Dict) {
                        kwargs = arg;
                    } else {
                        this.assertType(arg, nodes.Symbol);
                        args.push(arg);
                    }
                }, this);

                var realNames = lib.map(args, function(n) {
                    return 'l_' + n.value;
                });
                realNames.push('kwargs');

                // Quoted argument names
                var argNames = lib.map(args, function(n) {
                    return '"' + n.value + '"';
                });
                var kwargNames = lib.map((kwargs && kwargs.children) || [],
                    function(n) {
                        return '"' + n.key.value + '"';
                    });

                // We pass a function to makeMacro which destructures the
                // arguments so support setting positional args with keywords
                // args and passing keyword args as positional args
                // (essentially default values). See runtime.js.
                frame = frame.push();
                this.emitLines(
                    'var ' + funcId + ' = runtime.makeMacro(',
                    '[' + argNames.join(', ') + '], ',
                    '[' + kwargNames.join(', ') + '], ',
                    'function (' + realNames.join(', ') + ') {',
                    'frame = frame.push();',
                    'kwargs = kwargs || {};',
                    'if (kwargs.hasOwnProperty("caller")) {',
                    'frame.set("caller", kwargs.caller); }'
                );

                // Expose the arguments to the template. Don't need to use
                // random names because the function
                // will create a new run-time scope for us
                lib.each(args, function(arg) {
                    this.emitLine('frame.set("' + arg.value + '", ' +
                        'l_' + arg.value + ');');
                    frame.set(arg.value, 'l_' + arg.value);
                }, this);

                // Expose the keyword arguments
                if (kwargs) {
                    lib.each(kwargs.children, function(pair) {
                        var name = pair.key.value;
                        this.emit('frame.set("' + name + '", ' +
                            'kwargs.hasOwnProperty("' + name + '") ? ' +
                            'kwargs["' + name + '"] : ');
                        this._compileExpression(pair.value, frame);
                        this.emitLine(');');
                    }, this);
                }

                var bufferId = this.tmpid();
                this.pushBufferId(bufferId);

                this.withScopedSyntax(function() {
                    this.compile(node.body, frame);
                });

                frame = frame.pop();
                this.emitLine('frame = frame.pop();');
                this.emitLine('return new runtime.SafeString(' + bufferId + ');');
                this.emitLine('});');
                this.popBufferId();

                return funcId;
            },

            compileMacro: function(node, frame) {
                var funcId = this._compileMacro(node, frame);

                // Expose the macro to the templates
                var name = node.name.value;
                frame.set(name, funcId);

                if (frame.parent) {
                    this.emitLine('frame.set("' + name + '", ' + funcId + ');');
                } else {
                    if (node.name.value.charAt(0) != '_') {
                        this.emitLine('context.addExport("' + name + '");');
                    }
                    this.emitLine('context.setVariable("' + name + '", ' + funcId + ');');
                }
            },

            compileCaller: function(node, frame) {
                // basically an anonymous "macro expression"
                this.emit('(function (){');
                var funcId = this._compileMacro(node, frame);
                this.emit('return ' + funcId + ';})()');
            },

            compileImport: function(node, frame) {
                var id = this.tmpid();
                var target = node.target.value;

                this.emit('env.getTemplate(');
                this._compileExpression(node.template, frame);
                this.emitLine(', ' + this.makeCallback(id));
                this.addScopeLevel();

                this.emitLine(id + '.getExported(' +
                    (node.withContext ? 'context.getVariables(), frame.push(), ' : '') +
                    this.makeCallback(id));
                this.addScopeLevel();

                frame.set(target, id);

                if (frame.parent) {
                    this.emitLine('frame.set("' + target + '", ' + id + ');');
                } else {
                    this.emitLine('context.setVariable("' + target + '", ' + id + ');');
                }
            },

            compileFromImport: function(node, frame) {
                var importedId = this.tmpid();

                this.emit('env.getTemplate(');
                this._compileExpression(node.template, frame);
                this.emitLine(', ' + this.makeCallback(importedId));
                this.addScopeLevel();

                this.emitLine(importedId + '.getExported(' +
                    (node.withContext ? 'context.getVariables(), frame.push(), ' : '') +
                    this.makeCallback(importedId));
                this.addScopeLevel();

                lib.each(node.names.children, function(nameNode) {
                    var name;
                    var alias;
                    var id = this.tmpid();

                    if (nameNode instanceof nodes.Pair) {
                        name = nameNode.key.value;
                        alias = nameNode.value.value;
                    } else {
                        name = nameNode.value;
                        alias = name;
                    }

                    this.emitLine('if(' + importedId + '.hasOwnProperty("' + name + '")) {');
                    this.emitLine('var ' + id + ' = ' + importedId + '.' + name + ';');
                    this.emitLine('} else {');
                    this.emitLine('cb(new Error("cannot import \'' + name + '\'")); return;');
                    this.emitLine('}');

                    frame.set(alias, id);

                    if (frame.parent) {
                        this.emitLine('frame.set("' + alias + '", ' + id + ');');
                    } else {
                        this.emitLine('context.setVariable("' + alias + '", ' + id + ');');
                    }
                }, this);
            },

            compileBlock: function(node, frame) {
                if (!this.isChild) {
                    var id = this.tmpid();

                    this.emitLine('context.getBlock("' + node.name.value + '")' +
                        '(env, context, frame, runtime, ' + this.makeCallback(id));
                    this.emitLine(this.buffer + ' += ' + id + ';');
                    this.addScopeLevel();
                }
            },

            compileSuper: function(node, frame) {
                var name = node.blockName.value;
                var id = node.symbol.value;

                this.emitLine('context.getSuper(env, ' +
                    '"' + name + '", ' +
                    'b_' + name + ', ' +
                    'frame, runtime, ' +
                    this.makeCallback(id));
                this.emitLine(id + ' = runtime.markSafe(' + id + ');');
                this.addScopeLevel();
                frame.set(id, id);
            },

            compileExtends: function(node, frame) {
                if (this.isChild) {
                    this.fail('compileExtends: cannot extend multiple times',
                        node.template.lineno,
                        node.template.colno);
                }

                var k = this.tmpid();

                this.emit('env.getTemplate(');
                this._compileExpression(node.template, frame);
                this.emitLine(', true, ' + this.makeCallback('parentTemplate'));

                this.emitLine('for(var ' + k + ' in parentTemplate.blocks) {');
                this.emitLine('context.addBlock(' + k +
                    ', parentTemplate.blocks[' + k + ']);');
                this.emitLine('}');

                this.addScopeLevel();
                this.isChild = true;
            },

            compileInclude: function(node, frame) {
                var id = this.tmpid();
                var id2 = this.tmpid();

                this.emit('env.getTemplate(');
                this._compileExpression(node.template, frame);
                this.emitLine(', ' + this.makeCallback(id));
                this.addScopeLevel();

                this.emitLine(id + '.render(' +
                    'context.getVariables(), frame.push(), ' + this.makeCallback(id2));
                this.emitLine(this.buffer + ' += ' + id2);
                this.addScopeLevel();
            },

            compileTemplateData: function(node, frame) {
                this.compileLiteral(node, frame);
            },

            // ... 编译字符串的值 和 变量的值
            compileOutput: function(node, frame) {
                var children = node.children;
                for (var i = 0, l = children.length; i < l; i++) {
                    // TemplateData is a special case because it is never
                    // autoescaped, so simply output it for optimization
                    // ... 原字符串部分
                    if (children[i] instanceof nodes.TemplateData) {
                        if (children[i].value) {
                            this.emit(this.buffer + ' += ');
                            this.compileLiteral(children[i], frame);
                            this.emitLine(';');
                        }
                    } 
                    // ... 变量值
                    else {
                        // ...? 这是取变量的方法吗
                        this.emit(this.buffer + ' += runtime.suppressValue(');
                        this.compile(children[i], frame);
                        this.emit(', env.autoesc);\n');
                    }
                }
            },

            // ... 编译根节点
            compileRoot: function(node, frame) {
                // ...? 目的是
                if (frame) {
                    this.fail("compileRoot: root node can't have frame");
                }

                frame = new Frame();
                // ... 生成函数的开始部分代码
                // 
                // function root(env, context, frame, runtime, cb) {
                //     var lineno = null;
                //     var colno = null;
                //     var output = "";
                //     try {
                this.emitFuncBegin('root');
                this._compileChildren(node, frame);
                if (this.isChild) {
                    this.emitLine('parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);');
                }
                this.emitFuncEnd(this.isChild);

                // When compiling the blocks, they should all act as top-level code
                this.isChild = false;

                // ...? 查找当前的节点中的Block节点 待分析
                var blocks = node.findAll(nodes.Block);
                for (var i = 0; i < blocks.length; i++) {
                    var block = blocks[i];
                    var name = block.name.value;

                    this.emitFuncBegin('b_' + name);

                    var tmpFrame = new Frame();
                    this.compile(block.body, tmpFrame);
                    this.emitFuncEnd();
                }

                this.emitLine('return {');
                for (var i = 0; i < blocks.length; i++) {
                    var block = blocks[i];
                    var name = 'b_' + block.name.value;
                    this.emitLine(name + ': ' + name + ',');
                }
                this.emitLine('root: root\n};');
            },

            compile: function(node, frame) {
                var _compile = this["compile" + node.typename];
                if (_compile) {
                    _compile.call(this, node, frame);
                } else {
                    this.fail("compile: Cannot compile node: " + node.typename,
                        node.lineno,
                        node.colno);
                }
            },

            getCode: function() {
                return this.codebuf.join('');
            }
        });

        // var c = new Compiler();
        // var src = '{% asyncEach i in arr %}{{ i }}{% else %}empty{% endeach %}';
        // var ast = transformer.transform(parser.parse(src));
        // nodes.printNodes(ast);
        // c.compile(ast);
        // var tmpl = c.getCode();
        // console.log(tmpl);

        modules['compiler'] = {
            // ... 编译流程入口
            compile: function(src, asyncFilters, extensions, name, lexerTags) {
                // ...todo step in new Compiler()
                var c = new Compiler();

                // Run the extension preprocessors against the source.
                // ... 此处的extension就是通过env.addExtension方法添加的扩展
                // ... todo 待分析 extension的preprocess
                if (extensions && extensions.length) {
                    for (var i = 0; i < extensions.length; i++) {
                        if ('preprocess' in extensions[i]) {
                            src = extensions[i].preprocess(src, name);
                        }
                    }
                }

                // ... 此处将源代码分解为三部来写 方便分析
                // ... step1: parser.parse 语法分析生成语法树
                // ... note 词法提取包含在语法分析内部，两种行为在内部是并行进行的。
                var __ast = parser.parse(src, extensions, lexerTags);
                console.log('%c parser.parse ', logStyle);
                console.log(__ast);

                // ... step2: transformer.transform
                var __ast2 = transformer.transform(__ast, asyncFilters, name);
                console.log('%c transformer.transform ', logStyle);
                console.log(__ast2);

                // ... step3: compiler.compile
                c.compile(__ast2);

                // ... 源代码开始
                // c.compile(transformer.transform(parser.parse(src, extensions, lexerTags),
                //     asyncFilters,
                //     name));
                // ... 源代码结束

                return c.getCode();
            },

            Compiler: Compiler
        };
    })();
    // file: filters.js
    (function() {
        var lib = modules["lib"];
        var r = modules["runtime"];

        var filters = {
            abs: function(n) {
                return Math.abs(n);
            },

            batch: function(arr, linecount, fill_with) {
                var res = [];
                var tmp = [];

                for (var i = 0; i < arr.length; i++) {
                    if (i % linecount === 0 && tmp.length) {
                        res.push(tmp);
                        tmp = [];
                    }

                    tmp.push(arr[i]);
                }

                if (tmp.length) {
                    if (fill_with) {
                        for (var i = tmp.length; i < linecount; i++) {
                            tmp.push(fill_with);
                        }
                    }

                    res.push(tmp);
                }

                return res;
            },

            capitalize: function(str) {
                var ret = str.toLowerCase();
                return r.copySafeness(str, ret.charAt(0).toUpperCase() + ret.slice(1));
            },

            center: function(str, width) {
                width = width || 80;

                if (str.length >= width) {
                    return str;
                }

                var spaces = width - str.length;
                var pre = lib.repeat(" ", spaces / 2 - spaces % 2);
                var post = lib.repeat(" ", spaces / 2);
                return r.copySafeness(str, pre + str + post);
            },

            'default': function(val, def) {
                return val ? val : def;
            },

            dictsort: function(val, case_sensitive, by) {
                if (!lib.isObject(val)) {
                    throw new lib.TemplateError("dictsort filter: val must be an object");
                }

                var array = [];
                for (var k in val) {
                    // deliberately include properties from the object's prototype
                    array.push([k, val[k]]);
                }

                var si;
                if (by === undefined || by === "key") {
                    si = 0;
                } else if (by === "value") {
                    si = 1;
                } else {
                    throw new lib.TemplateError(
                        "dictsort filter: You can only sort by either key or value");
                }

                array.sort(function(t1, t2) {
                    var a = t1[si];
                    var b = t2[si];

                    if (!case_sensitive) {
                        if (lib.isString(a)) {
                            a = a.toUpperCase();
                        }
                        if (lib.isString(b)) {
                            b = b.toUpperCase();
                        }
                    }

                    return a > b ? 1 : (a == b ? 0 : -1);
                });

                return array;
            },

            escape: function(str) {
                if (typeof str == 'string' ||
                    str instanceof r.SafeString) {
                    return lib.escape(str);
                }
                return str;
            },

            safe: function(str) {
                return r.markSafe(str);
            },

            first: function(arr) {
                return arr[0];
            },

            groupby: function(arr, attr) {
                return lib.groupBy(arr, attr);
            },

            indent: function(str, width, indentfirst) {
                width = width || 4;
                var res = '';
                var lines = str.split('\n');
                var sp = lib.repeat(' ', width);

                for (var i = 0; i < lines.length; i++) {
                    if (i == 0 && !indentfirst) {
                        res += lines[i] + '\n';
                    } else {
                        res += sp + lines[i] + '\n';
                    }
                }

                return r.copySafeness(str, res);
            },

            join: function(arr, del, attr) {
                del = del || '';

                if (attr) {
                    arr = lib.map(arr, function(v) {
                        return v[attr];
                    });
                }

                return arr.join(del);
            },

            last: function(arr) {
                return arr[arr.length - 1];
            },

            length: function(arr) {
                return arr !== undefined ? arr.length : 0;
            },

            list: function(val) {
                if (lib.isString(val)) {
                    return val.split('');
                } else if (lib.isObject(val)) {
                    var keys = [];

                    if (Object.keys) {
                        keys = Object.keys(val);
                    } else {
                        for (var k in val) {
                            keys.push(k);
                        }
                    }

                    return lib.map(keys, function(k) {
                        return {
                            key: k,
                            value: val[k]
                        };
                    });
                } else {
                    throw new lib.TemplateError("list filter: type not iterable");
                }
            },

            lower: function(str) {
                return str.toLowerCase();
            },

            random: function(arr) {
                return arr[Math.floor(Math.random() * arr.length)];
            },

            replace: function(str, old, new_, maxCount) {
                if (old instanceof RegExp) {
                    return str.replace(old, new_);
                }

                var res = str;
                var last = res;
                var count = 1;
                res = res.replace(old, new_);

                while (last != res) {
                    if (count >= maxCount) {
                        break;
                    }

                    last = res;
                    res = res.replace(old, new_);
                    count++;
                }

                return r.copySafeness(str, res);
            },

            reverse: function(val) {
                var arr;
                if (lib.isString(val)) {
                    arr = filters.list(val);
                } else {
                    // Copy it
                    arr = lib.map(val, function(v) {
                        return v;
                    });
                }

                arr.reverse();

                if (lib.isString(val)) {
                    return r.copySafeness(val, arr.join(''));
                }
                return arr;
            },

            round: function(val, precision, method) {
                precision = precision || 0;
                var factor = Math.pow(10, precision);
                var rounder;

                if (method == 'ceil') {
                    rounder = Math.ceil;
                } else if (method == 'floor') {
                    rounder = Math.floor;
                } else {
                    rounder = Math.round;
                }

                return rounder(val * factor) / factor;
            },

            slice: function(arr, slices, fillWith) {
                var sliceLength = Math.floor(arr.length / slices);
                var extra = arr.length % slices;
                var offset = 0;
                var res = [];

                for (var i = 0; i < slices; i++) {
                    var start = offset + i * sliceLength;
                    if (i < extra) {
                        offset++;
                    }
                    var end = offset + (i + 1) * sliceLength;

                    var slice = arr.slice(start, end);
                    if (fillWith && i >= extra) {
                        slice.push(fillWith);
                    }
                    res.push(slice);
                }

                return res;
            },

            sort: function(arr, reverse, caseSens, attr) {
                // Copy it
                arr = lib.map(arr, function(v) {
                    return v;
                });

                arr.sort(function(a, b) {
                    var x, y;

                    if (attr) {
                        x = a[attr];
                        y = b[attr];
                    } else {
                        x = a;
                        y = b;
                    }

                    if (!caseSens && lib.isString(x) && lib.isString(y)) {
                        x = x.toLowerCase();
                        y = y.toLowerCase();
                    }

                    if (x < y) {
                        return reverse ? 1 : -1;
                    } else if (x > y) {
                        return reverse ? -1 : 1;
                    } else {
                        return 0;
                    }
                });

                return arr;
            },

            string: function(obj) {
                return r.copySafeness(obj, obj);
            },

            title: function(str) {
                var words = str.split(' ');
                for (var i = 0; i < words.length; i++) {
                    words[i] = filters.capitalize(words[i]);
                }
                return r.copySafeness(str, words.join(' '));
            },

            trim: function(str) {
                return r.copySafeness(str, str.replace(/^\s*|\s*$/g, ''));
            },

            truncate: function(input, length, killwords, end) {
                var orig = input;
                length = length || 255;

                if (input.length <= length)
                    return input;

                if (killwords) {
                    input = input.substring(0, length);
                } else {
                    var idx = input.lastIndexOf(' ', length);
                    if (idx === -1) {
                        idx = length;
                    }

                    input = input.substring(0, idx);
                }

                input += (end !== undefined && end !== null) ? end : '...';
                return r.copySafeness(orig, input);
            },

            upper: function(str) {
                return str.toUpperCase();
            },

            urlencode: function(obj) {
                var enc = encodeURIComponent;
                if (lib.isString(obj)) {
                    return enc(obj);
                } else {
                    var parts;
                    if (lib.isArray(obj)) {
                        parts = obj.map(function(item) {
                            return enc(item[0]) + '=' + enc(item[1]);
                        })
                    } else {
                        parts = [];
                        for (var k in obj) {
                            if (obj.hasOwnProperty(k)) {
                                parts.push(enc(k) + '=' + enc(obj[k]));
                            }
                        }
                    }
                    return parts.join('&');
                }
            },

            urlize: function(str, length, nofollow) {
                if (isNaN(length)) length = Infinity;

                var noFollowAttr = (nofollow === true ? ' rel="nofollow"' : '');

                // For the jinja regexp, see
                // https://github.com/mitsuhiko/jinja2/blob/f15b814dcba6aa12bc74d1f7d0c881d55f7126be/jinja2/utils.py#L20-L23
                var puncRE = /^(?:\(|<|&lt;)?(.*?)(?:\.|,|\)|\n|&gt;)?$/;
                // from http://blog.gerv.net/2011/05/html5_email_address_regexp/
                var emailRE = /^[\w.!#$%&'*+\-\/=?\^`{|}~]+@[a-z\d\-]+(\.[a-z\d\-]+)+$/i;
                var httpHttpsRE = /^https?:\/\/.*$/;
                var wwwRE = /^www\./;
                var tldRE = /\.(?:org|net|com)(?:\:|\/|$)/;

                var words = str.split(/\s+/).filter(function(word) {
                    // If the word has no length, bail. This can happen for str with
                    // trailing whitespace.
                    return word && word.length;
                }).map(function(word) {
                    var matches = word.match(puncRE);


                    var possibleUrl = matches && matches[1] || word;


                    // url that starts with http or https
                    if (httpHttpsRE.test(possibleUrl))
                        return '<a href="' + possibleUrl + '"' + noFollowAttr + '>' + possibleUrl.substr(0, length) + '</a>';

                    // url that starts with www.
                    if (wwwRE.test(possibleUrl))
                        return '<a href="http://' + possibleUrl + '"' + noFollowAttr + '>' + possibleUrl.substr(0, length) + '</a>';

                    // an email address of the form username@domain.tld
                    if (emailRE.test(possibleUrl))
                        return '<a href="mailto:' + possibleUrl + '">' + possibleUrl + '</a>';

                    // url that ends in .com, .org or .net that is not an email address
                    if (tldRE.test(possibleUrl))
                        return '<a href="http://' + possibleUrl + '"' + noFollowAttr + '>' + possibleUrl.substr(0, length) + '</a>';

                    return word;

                });

                return words.join(' ');
            },

            wordcount: function(str) {
                var words = (str) ? str.match(/\w+/g) : null;
                return (words) ? words.length : null;
            },

            'float': function(val, def) {
                var res = parseFloat(val);
                return isNaN(res) ? def : res;
            },

            'int': function(val, def) {
                var res = parseInt(val, 10);
                return isNaN(res) ? def : res;
            }
        };

        // Aliases
        filters.d = filters['default'];
        filters.e = filters.escape;

        modules['filters'] = filters;
    })();
    // file: globals.js
    // ... 内置的全局函数
    (function() {

        function cycler(items) {
            var index = -1;
            this.current = null;

            return {
                reset: function() {
                    index = -1;
                    this.current = null;
                },

                next: function() {
                    index++;
                    if (index >= items.length) {
                        index = 0;
                    }

                    this.current = items[index];
                    return this.current;
                },
            };

        }

        function joiner(sep) {
            sep = sep || ',';
            var first = true;

            return function() {
                var val = first ? '' : sep;
                first = false;
                return val;
            };
        }

        var globals = {
            range: function(start, stop, step) {
                if (!stop) {
                    stop = start;
                    start = 0;
                    step = 1;
                } else if (!step) {
                    step = 1;
                }

                var arr = [];
                for (var i = start; i < stop; i += step) {
                    arr.push(i);
                }
                return arr;
            },

            // lipsum: function(n, html, min, max) {
            // },

            cycler: function() {
                return cycler(Array.prototype.slice.call(arguments));
            },

            joiner: function(sep) {
                return joiner(sep);
            }
        }

        modules['globals'] = globals;
    })();
    // file: loader.js
    (function() {
        var Obj = modules["object"];
        var lib = modules["lib"];

        var Loader = Obj.extend({
            on: function(name, func) {
                this.listeners = this.listeners || {};
                this.listeners[name] = this.listeners[name] || [];
                this.listeners[name].push(func);
            },

            emit: function(name /*, arg1, arg2, ...*/ ) {
                var args = Array.prototype.slice.call(arguments, 1);

                if (this.listeners && this.listeners[name]) {
                    lib.each(this.listeners[name], function(listener) {
                        listener.apply(null, args);
                    });
                }
            }
        });

        modules['loader'] = Loader;
    })();
    // file: web-loaders.js
    (function() {
        var Loader = modules["loader"];

        var WebLoader = Loader.extend({
            init: function(baseURL, neverUpdate) {
                // It's easy to use precompiled templates: just include them
                // before you configure nunjucks and this will automatically
                // pick it up and use it
                this.precompiled = window.nunjucksPrecompiled || {};

                this.baseURL = baseURL || '';
                this.neverUpdate = neverUpdate;
            },

            getSource: function(name) {
                if (this.precompiled[name]) {
                    return {
                        src: {
                            type: "code",
                            obj: this.precompiled[name]
                        },
                        path: name
                    };
                } else {
                    var src = this.fetch(this.baseURL + '/' + name);
                    if (!src) {
                        return null;
                    }

                    return {
                        src: src,
                        path: name,
                        noCache: !this.neverUpdate
                    };
                }
            },

            fetch: function(url, callback) {
                // Only in the browser please
                var ajax;
                var loading = true;
                var src;

                if (window.XMLHttpRequest) { // Mozilla, Safari, ...
                    ajax = new XMLHttpRequest();
                } else if (window.ActiveXObject) { // IE 8 and older
                    ajax = new ActiveXObject("Microsoft.XMLHTTP");
                }

                ajax.onreadystatechange = function() {
                    if (ajax.readyState === 4 && (ajax.status === 0 || ajax.status === 200) && loading) {
                        loading = false;
                        src = ajax.responseText;
                    }
                };

                url += (url.indexOf('?') === -1 ? '?' : '&') + 's=' +
                    (new Date().getTime());

                // Synchronous because this API shouldn't be used in
                // production (pre-load compiled templates instead)
                ajax.open('GET', url, false);
                ajax.send();

                return src;
            }
        });

        modules['web-loaders'] = {
            WebLoader: WebLoader
        };
    })();
    // file: loaders.js
    (function() {
        if (typeof window === 'undefined' || window !== this) {
            modules['loaders'] = modules["node-loaders"];
        } else {
            modules['loaders'] = modules["web-loaders"];
        }
    })();
    // file: environment.js
    (function() {
        var path = modules["path"];
        var lib = modules["lib"];
        var Obj = modules["object"];
        var lexer = modules["lexer"];
        var compiler = modules["compiler"];
        var builtin_filters = modules["filters"];
        var builtin_loaders = modules["loaders"];
        var runtime = modules["runtime"];
        var globals = modules["globals"];
        var Frame = runtime.Frame;

        // ... 运行环境类
        // ... 用户根据不同的需求，以不同的参数创建不同的运行环境实例
        // ... 如：envFoo的loader从以foo为根目录加载模板 而envBar则以bar为根目录
        // ... 这样在用一个页面可以同时使用多种配置的环境
        // ... 在浏览器端通常情况下都不需要多个运行环境
        var Environment = Obj.extend({
            init: function(loaders, opts) {
                opts = opts || {};
                // The dev flag determines the trace that'll be shown on errors.
                // If set to true, returns the full trace from the error point,
                // otherwise will return trace starting from Template.render
                // (the full trace from within nunjucks may confuse developers using
                //  the library)
                // defaults to false
                // ... 简单的说 dev为true时会抛出所有错误 
                // ... 为false时 只会抛出render方法被调用以后的错误
                this.dev = !!opts.dev;
                this.lexerTags = opts.tags;

                // The autoescape flag sets global autoescaping. If true,
                // every string variable will be escaped by default.
                // If false, strings can be manually escaped using the `escape` filter.
                // defaults to false
                this.autoesc = !!opts.autoescape;

                // ... 挂载loaders 类型为数组
                // ... 如果没有传入自定义的loaders 则根据执行环境(node/browser)挂载对应的loaders
                if (!loaders) {
                    // The filesystem loader is only available client-side
                    if (builtin_loaders.FileSystemLoader) {
                        this.loaders = [new builtin_loaders.FileSystemLoader('views')];
                    } else {
                        this.loaders = [new builtin_loaders.WebLoader('/views')];
                    }
                } else {
                    this.loaders = lib.isArray(loaders) ? loaders : [loaders];
                }

                this.initCache();
                this.filters = {};
                this.asyncFilters = [];
                this.extensions = {};
                this.extensionsList = [];

                for (var name in builtin_filters) {
                    this.addFilter(name, builtin_filters[name]);
                }
            },

            // ... 待分析
            initCache: function() {
                // Caching and cache busting
                var cache = {};

                lib.each(this.loaders, function(loader) {
                    if (typeof loader.on === 'function') {
                        loader.on('update', function(template) {
                            cache[template] = null;
                        });
                    }
                });

                this.cache = cache;
            },

            // ... 扩展功能的核心方法之一
            // ... 添加一个名为 name 的扩展，ext 为一个对象
            // ... todo 分析runtime的调用细节
            addExtension: function(name, extension) {
                extension._name = name;
                this.extensions[name] = extension;
                this.extensionsList.push(extension);
            },

            getExtension: function(name) {
                return this.extensions[name];
            },

            // ... 添加一个全局变量，可以在所有模板使用。
            // ... 注意：这个会覆盖已有的 name 变量。
            addGlobal: function(name, value) {
                globals[name] = value;
            },

            // ... 添加名为 name 的自定义过滤器，func 为调用的函数，如果过滤器需要异步的，async 应该为 true 
            // ... 简单地把filters.js里的filters都复制到this.filters名称空间下
            // ... demo
            // ... var nunjucks = require('nunjucks');
            // ... var env = new nunjucks.Environment();
            // ... env.addFilter('shorten', function(str, count) {
            // ...     return str.slice(0, count || 5);
            // ... });
            // ... {# Show the first 5 characters #}
            // ... A message for you: {{ message|shorten }}
            // ... {# Show the first 20 characters #}
            // ... A message for you: {{ message|shorten(20) }}
            addFilter: function(name, func, async) {
                var wrapped = func;

                if (async) {
                    this.asyncFilters.push(name);
                }
                this.filters[name] = wrapped;
            },

            // ... 获取指定名字的filter函数
            getFilter: function(name) {
                if (!this.filters[name]) {
                    throw new Error('filter not found: ' + name);
                }
                return this.filters[name];
            },

            // ... @param name {string} 指定要加载的文件名称
            getTemplate: function(name, eagerCompile, cb) {
                if (name && name.raw) {
                    // this fixes autoescape for templates referenced in symbols
                    name = name.raw;
                }

                if (lib.isFunction(eagerCompile)) {
                    cb = eagerCompile;
                    eagerCompile = false;
                }

                if (typeof name !== 'string') {
                    throw new Error('template names must be a string: ' + name);
                }

                var tmpl = this.cache[name];

                if (tmpl) {
                    if (eagerCompile) {
                        tmpl.compile();
                    }

                    if (cb) {
                        cb(null, tmpl);
                    } else {
                        return tmpl;
                    }
                } else {
                    var syncResult;

                    lib.asyncIter(this.loaders, function(loader, i, next, done) {
                        function handle(src) {
                            if (src) {
                                done(src);
                            } else {
                                next();
                            }
                        }

                        if (loader.async) {
                            loader.getSource(name, function(err, src) {
                                if (err) {
                                    throw err;
                                }
                                handle(src);
                            });
                        } else {
                            handle(loader.getSource(name));
                        }
                    }, function(info) {
                        if (!info) {
                            var err = new Error('template not found: ' + name);
                            if (cb) {
                                cb(err);
                            } else {
                                throw err;
                            }
                        } else {
                            var tmpl = new Template(info.src, this,
                                info.path, eagerCompile);

                            if (!info.noCache) {
                                this.cache[name] = tmpl;
                            }

                            if (cb) {
                                cb(null, tmpl);
                            } else {
                                syncResult = tmpl;
                            }
                        }
                    }.bind(this));

                    return syncResult;
                }
            },

            // ... 和Node端的express框架对接
            express: function(app) {
                var env = this;

                function NunjucksView(name, opts) {
                    this.name = name;
                    this.path = name;
                    this.defaultEngine = opts.defaultEngine;
                    this.ext = path.extname(name);
                    if (!this.ext && !this.defaultEngine) throw new Error('No default engine was specified and no extension was provided.');
                    if (!this.ext) this.name += (this.ext = ('.' !== this.defaultEngine[0] ? '.' : '') + this.defaultEngine);
                }

                NunjucksView.prototype.render = function(opts, cb) {
                    env.render(this.name, opts, cb);
                };

                app.set('view', NunjucksView);
            },

            // ... @param name {string} 指定要加载的文件名称
            render: function(name, ctx, cb) {
                if (lib.isFunction(ctx)) {
                    cb = ctx;
                    ctx = null;
                }

                // We support a synchronous API to make it easier to migrate
                // existing code to async. This works because if you don't do
                // anything async work, the whole thing is actually run
                // synchronously.
                var syncResult = null;

                this.getTemplate(name, function(err, tmpl) {
                    if (err && cb) {
                        cb(err);
                    } else if (err) {
                        throw err;
                    } else {
                        tmpl.render(ctx, cb || function(err, res) {
                            if (err) {
                                throw err;
                            }
                            syncResult = res;
                        });
                    }
                });

                return syncResult;
            },

            renderString: function(src, ctx, cb) {
                var tmpl = new Template(src, this);
                return tmpl.render(ctx, cb);
            }
        });

        var Context = Obj.extend({
            // ... ctx是运行时render方法透传的模板数据
            // ...todo blocks是编译时分析出来的xxx
            init: function(ctx, blocks) {
                this.ctx = ctx;
                // ... this.blocks = {xxx: []}
                this.blocks = {};
                this.exported = [];

                for (var name in blocks) {
                    this.addBlock(name, blocks[name]);
                }
            },

            // ... 查找指定key的值
            // ... 如果指定的key没有找到，但指定的key是globals的功能 返回对应的功能
            lookup: function(name) {
                // This is one of the most called functions, so optimize for
                // the typical case where the name isn't in the globals
                if (name in globals && !(name in this.ctx)) {
                    return globals[name];
                } else {
                    return this.ctx[name];
                }
            },

            setVariable: function(name, val) {
                this.ctx[name] = val;
            },

            getVariables: function() {
                return this.ctx;
            },

            addBlock: function(name, block) {
                this.blocks[name] = this.blocks[name] || [];
                this.blocks[name].push(block);
            },

            getBlock: function(name) {
                if (!this.blocks[name]) {
                    throw new Error('unknown block "' + name + '"');
                }

                return this.blocks[name][0];
            },

            getSuper: function(env, name, block, frame, runtime, cb) {
                var idx = lib.indexOf(this.blocks[name] || [], block);
                var blk = this.blocks[name][idx + 1];
                var context = this;

                if (idx == -1 || !blk) {
                    throw new Error('no super block available for "' + name + '"');
                }

                blk(env, context, frame, runtime, cb);
            },

            addExport: function(name) {
                this.exported.push(name);
            },

            getExported: function() {
                var exported = {};
                for (var i = 0; i < this.exported.length; i++) {
                    var name = this.exported[i];
                    exported[name] = this.ctx[name];
                }
                return exported;
            }
        });

        // Compile the given string into a reusable nunjucks Template object.
        // ... nunjucts.compile 内部实例化该类
        // ... @src string|object 模板字符串
        // ...      如果是object 形如 {type: 'code', obj: { root: root }}
        // ...      如果是{type: 'string', obj: 'foofoo'} 这和string格式一样
        // ... todo @env 如果不传 则内部指定默认的env
        // ... @path
        // ... @eagerCompile 是否马上执行编译
        var Template = Obj.extend({
            init: function(src, env, path, eagerCompile) {
                this.env = env || new Environment();

                if (lib.isObject(src)) {
                    switch (src.type) {
                        case 'code':
                            this.tmplProps = src.obj;
                            break;
                        case 'string':
                            this.tmplStr = src.obj;
                            break;
                    }
                } else if (lib.isString(src)) {
                    this.tmplStr = src;
                } else {
                    throw new Error("src must be a string or an object describing " +
                        "the source");
                }

                this.path = path;

                if (eagerCompile) {
                    lib.withPrettyErrors(this.path, this.env.dev, this._compile.bind(this));
                } else {
                    this.compiled = false;
                }
            },
            // var t = nunjucks.compile('Hi {{tpl}}!');
            // t.render({ tpl: "James" });  ctx 是 { tpl: "James" }
            render: function(ctx, frame, cb) {
                // ... 如果是 .render(function () {})
                if (typeof ctx === 'function') {
                    cb = ctx;
                    ctx = {};
                } 
                // ...? 什么场景使用了frame
                else if (typeof frame === 'function') {
                    cb = frame;
                    frame = null;
                }

                return lib.withPrettyErrors(this.path, this.env.dev, function() {
                    // debugger;
                    this.compile();

                    // ... 当前作用域不是简单的Object对象，是Context类的实例，并且整合了blocks对象
                    // ...todo 整合了blocks对象的情景分析
                    var context = new Context(ctx || {}, this.blocks);
                    var syncResult = null;

                    frame = frame || new Frame()
// debugger;
                    this.rootRenderFunc(this.env, context, frame, runtime, cb || function(err, res) {
                        if (err) {
                            throw err;
                        }
                        syncResult = res;
                    });

                    return syncResult;
                }.bind(this));
            },

            getExported: function(ctx, frame, cb) {
                if (typeof ctx === 'function') {
                    cb = ctx;
                    ctx = {};
                }

                if (typeof frame === 'function') {
                    cb = frame;
                    frame = null;
                }

                this.compile();

                // Run the rootRenderFunc to populate the context with exported vars
                var context = new Context(ctx || {}, this.blocks);
                this.rootRenderFunc(this.env,
                    context,
                    frame || new Frame(),
                    runtime,
                    function() {
                        cb(null, context.getExported());
                    });
            },

            compile: function() {
                if (!this.compiled) {
                    this._compile();
                }
            },

            _compile: function() {
                var props;

                if (this.tmplProps) {
                    props = this.tmplProps;
                } else {
                    // ... 进入编译流程
                    // ... 返回编译后的字符串形式的函数
                    var source = compiler.compile(this.tmplStr,
                        this.env.asyncFilters,
                        this.env.extensionsList,
                        this.path,
                        this.env.lexerTags);
                    console.log('%c source ', logStyle);
                    console.log(source);
                    var func = new Function(source);
                    props = func();
                }

                this.blocks = this._getBlocks(props);
                // ... 编译后的主体函数
                // ... note 编译后还有若干其他辅助函数 如 todo
                this.rootRenderFunc = props.root;
                this.compiled = true;
            },

            _getBlocks: function(props) {
                var blocks = {};

                for (var k in props) {
                    // ... 这是在寻找什么情况
                    if (k.slice(0, 2) == 'b_') {
                        blocks[k.slice(2)] = props[k];
                    }
                }

                return blocks;
            }
        });

        // test code
        // var src = '{% macro foo() %}{% include "include.html" %}{% endmacro %}{{ foo() }}';
        // var env = new Environment(new builtin_loaders.FileSystemLoader('../tests/templates', true), { dev: true });
        // console.log(env.renderString(src, { name: 'poop' }));

        modules['environment'] = {
            Environment: Environment,
            Template: Template
        };
    })();
    var nunjucks;

    var lib = modules["lib"];
    var env = modules["environment"];
    var compiler = modules["compiler"];
    var parser = modules["parser"];
    var lexer = modules["lexer"];
    var runtime = modules["runtime"];
    var Loader = modules["loader"];
    var loaders = modules["loaders"];
    var precompile = modules["precompile"];

    nunjucks = {};
    nunjucks.Environment = env.Environment;
    nunjucks.Template = env.Template;

    nunjucks.Loader = Loader;
    nunjucks.FileSystemLoader = loaders.FileSystemLoader;
    nunjucks.WebLoader = loaders.WebLoader;

    nunjucks.compiler = compiler;
    nunjucks.parser = parser;
    nunjucks.lexer = lexer;
    nunjucks.runtime = runtime;

    // A single instance of an environment, since this is so commonly used

    var e;
    nunjucks.configure = function(templatesPath, opts) {
        opts = opts || {};
        if (lib.isObject(templatesPath)) {
            opts = templatesPath;
            templatesPath = null;
        }

        var noWatch = 'watch' in opts ? !opts.watch : false;
        var loader = loaders.FileSystemLoader || loaders.WebLoader;
        e = new env.Environment(new loader(templatesPath, noWatch), opts);

        if (opts && opts.express) {
            e.express(opts.express);
        }

        return e;
    };

    // ...
    nunjucks.compile = function(src, env, path, eagerCompile) {
        if (!e) {
            nunjucks.configure();
        }
        return new nunjucks.Template(src, env, path, eagerCompile);
    };

    nunjucks.render = function(name, ctx, cb) {
        if (!e) {
            nunjucks.configure();
        }

        return e.render(name, ctx, cb);
    };

    nunjucks.renderString = function(src, ctx, cb) {
        if (!e) {
            nunjucks.configure();
        }

        return e.renderString(src, ctx, cb);
    };

    if (precompile) {
        nunjucks.precompile = precompile.precompile;
        nunjucks.precompileString = precompile.precompileString;
    }

    nunjucks.require = function(name) {
        return modules[name];
    };

    if (typeof define === 'function' && define.amd) {
        define(function() {
            return nunjucks;
        });
    } else {
        window.nunjucks = nunjucks;
        if (typeof module !== 'undefined') module.exports = nunjucks;
    }

})();