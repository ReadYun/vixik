/*
 * jQuery下json数据各种处理方法
 *
 */

/**
 * @see 将json字符串转换为对象
 * @param json字符串
 * @return 返回object,array,string等对象
 *
 */
jQuery.extend({
    evalJSON: function(strJson) {
        return eval("(" + strJson + ")") ;
    }
});

/**
 * @see 将javascript数据类型转换为json字符串
 * @param 待转换对象,支持object,array,string,function,number,boolean,regexp
 * @return 返回json字符串
 *
 */

(function($){
    /*
     * $.type()
     * 判断JSON对象各种类型
     */
    $.type = function(o) {
        var _toS = Object.prototype.toString;
        var _types = {
            'undefined': 'undefined',
            'number': 'number',
            'boolean': 'boolean',
            'string': 'string',
            '[object Function]': 'function',
            '[object RegExp]': 'regexp',
            '[object Array]': 'array',
            '[object Date]': 'date',
            '[object Error]': 'error'
        } ;
        return _types[typeof o] || _types[_toS.call(o)] || (o ? 'object' : 'null');
    };
    /*
     * 特殊字符串处理
     *
     */
    var $specialChars = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\' };
    var $replaceChars = function(chr) {
        return $specialChars[chr] || '\\u00' + Math.floor(chr.charCodeAt() / 16).toString(16) + (chr.charCodeAt() % 16).toString(16);
    };
    /*
     * $.toJSON()
     * JSON对象/数组类型/转换为JSON格式字符串
     */
    $.toJSON = function(this$){
        var s=[] ;
        switch($.type(this$)){
            case 'undefined':
                return 'undefined' ;
                break ;
            case 'null':
                return 'null';
                break;
            case 'number':
            case 'boolean':
            case 'date':
            case 'function':
                return this$.toString();
                break;
            case 'string':
                return '"' + this$.replace(/[\x00-\x1f\\"]/g, $replaceChars) + '"';
                break;
            case 'array':
                for (var i = 0, l = this$.length; i < l; i++) {
                    s.push($.toJSON(this$[i]));
                }
                return '[' + s.join(',') + ']';
                break;
            case 'error':
            case 'object':
                for (var p in this$) {
                    s.push('"'+p + '":' + $.toJSON(this$[p]));
                }
                return '{' + s.join(',') + '}';
                break;
            default:
                return '';
                break;
        }
    } ;
    /*
     * $.evalJSON()
     * JSON字符串解析
     */
    $.evalJSON = function(s) {
        if ($.type(s) != 'string' || !s.length) return null;
        return eval('(' + s + ')');
    };
})(jQuery) ;



/*jQuery.extend({
    toJSON: function(object) {
        var type = typeof object ;
        if ('object' == type) {
            if (Array == object.constructor) type = 'array' ;
            else if (RegExp == object.constructor) type = 'regexp' ;
            else type = 'object';
        }
        switch (type) {
            case 'undefined':
            case 'unknown':
                return ;
                break ;
            case 'function':
            case 'boolean':
            case 'regexp':
                return object.toString() ;
                break ;
            case 'number':
                return isFinite(object) ? object.toString() : 'null' ;
                break ;
            case 'string':
                return '"' + object.replace(/(\\|\")/g, "\\$1").replace(/\n|\r|\t/g, function() {
                var a = arguments[0] ;
                return (a == '\n') ? '\\n': (a == '\r') ? '\\r': (a == '\t') ? '\\t': ""
                }) + '"' ;
                break ;
            case 'object':
                if (object === null) return 'null' ;
                var results = [] ;
                for (var property in object) {
                var value = jQuery.toJSON(object[property]) ;
                if (value !== undefined) results.push(jQuery.toJSON(property) + ':' + value) ;
            }
            return '{' + results.join(',') + '}' ;
            break ;
            case 'array':
                var results = [] ;
                for (var i = 0; i < object.length; i++) {
                var value = jQuery.toJSON(object[i]) ;
                if (value !== undefined) results.push(value) ;
                }
                return '[' + results.join(',') + ']' ;
                break ;
        }
    }
});*/