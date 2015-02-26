
/**
 * @Name        : vixik.func.core.js
 * @Description : VixiK核心函数
 *
 * @Author     : ReadYun
 * @Copyright  : VixiK
 * @Version    : 1.0.00
 */


/* ------------------------------------------------- 自定义统一函数 ------------------------------------------------- */


/*
 * @Name   : replaceAll
 * @Desc   : 字符串批量替换
 * @Param  : object  data$      需要检验的数据对象
 * @Return : bool    true/false  检验结果
 */
String.prototype.replaceAll = function(str1, str2){
    return this.replace(new RegExp(str1, "gm"), str2); 
}

/*
 * @Name   : isEmptyObject
 * @Desc   : 判断一个对象是否为空对象
 * @Param  : object  obj$        需要检验的对象
 * @Return : bool    true/false  检验结果
 */
function isEmptyObject(obj$){
  for(var n in obj$){
    return false
  } 

  return true ;  
}

/*
 * @Name   : dataValidCheck（已合并到vkData库中：data_check_null）
 * @Desc   : 轻量级数据有效性校验，检验入参对象所有属性值是否为空
 * @Param  : object  data$      需要检验的数据对象
 * @Return : bool    true/false  检验结果
 */
function dataValidCheck(data$){
    var flag = true ;

    if(typeof(data$) === 'object'){  //如果入参类型还是对象，进行二次判断处理
        if($.isArray(data$)){  //数组处理
          for(var i = 0; i < data$.length; i++){
              flag = dataValidCheck(data$[i]) ;
              if(flag != true){
                  break ;
              }
          }
        }else{  //数据对象处理
          for(var ele in data$){  //遍历输出数据对象每个属性做递归判断
              flag = dataValidCheck(data$[ele]) ;
              if(flag != true){
                  break ;
              }
          }
        }
    }else{  //如果入参类型非对象，直接进行空值判断
        if(data$ === undefined || data$ === ''){    //如果有属性值为空抛出异常
          return false ;
        }
    }

    return flag ;
}

/*
 * @Name   : arraySwap
 * @Desc   : 复合数组键值互换
 * @Param  : array  srcData$    原始数据，形如{k1:v1,k2:v2,k3:v3,k4:v4,..}
 * @Return : array  newData$    清洗后的新数据，形如{v1:k1,v2:k2,v3:k3,v4:k4,..}
 */
function arraySwap(srcData$){
    var newData$ = {} ;

    $.each(srcData$, function(key, value){
        newData$[value] = key ;
    }) ;

    return newData$ ;
}

/*
 * @Name   : dataWash
 * @Desc   : 数据清洗：按规则转换提取数据
 * @Param  : array  srcData$    原始数据，形如[{k1:v1,k2:v2},{k1:v1,k2:v2},{k1:v1,k2:v2},..]
 * @Param  : array  map$        映射规则，形如{old_key1:new_key1,old_key2:new_key2,..}
 * @Return : array  newData$    清洗后的新数据，格式和原始数据一样，但key已经被替换为new_key
 */
function dataWash(srcData$, map$, type){
    var i, tmpData$,
        newData$ = [] ;

    for(i = 0; i < srcData$.length; i ++){
        tmpData$ = {} ;

        $.each(map$, function(key, value){
            if(tmpData$[value] == undefined){
              tmpData$[value] = srcData$[i][key] ;
            }
        }) ;
        newData$.push(tmpData$) ;
    }
    
    return newData$ ;
}

/*
 * @Name   : pagingData
 * @Desc   : 对入参数据按要求进行格式化分页处理
 * @Param  : array    data$     要进行分页数据处理的数组
 * @Param  : integer  limit     每页的数据条数
 * @Return : array    pagdata$  分页处理后的数据
 */
function pagingData(data$, limit){
    var pagdata$ = [],
        i        = 0 ;

    while(data$.length){
        pagdata$[i] = data$.splice(0, limit) ;
        i ++ ;
    }

    return pagdata$ ;
}

/*
 * @Name   : inArray（已合入vkData中:check_value_in）
 * @Desc   : 判断一个值是否在数组中
 * @Param  : array  array$  目标数组值
 * @Param  : mix    value  要判断的值（数值/字符串）
 * @Return : bool  flag    判断结果
 */
function inArray(array$, value){
    var flag = false ;

    for(var i = 0; i < array$.length; i++){
        if(array$[i] == value){
          flag = true ;
          break ;
        }
    }
    
    return flag ;
}

/*
 * @Name   : seqArray（已合入vkData中:create_seq_array）
 * @Desc   : 快速生成一个连续序列数组
 * @Param  : number  seq_start  指定序列开始数
 * @Param  : number  seq_end    指定序列结束数
 * @Return : array  seqData$  按要求生成的连续数列数组
 */
function seqArray(seq_start, seq_end){
    var seqData$ = [],
        n = seq_start ;

    for(var i = 0; i < seq_end; i++){
        seqData$[i] = n++ ;
    }
    
    return seqData$ ;
}

/*
 * @Name   : arrayValOnly（已合入vkData中:array_filter_duplicate）
 * @Desc   : 数组去重
 * @Param  : array  arrayData$  原始一维数组
 * @Return : array  arrayData$  去重后的新数组
 */
function arrayValOnly(arrayData$){
    var value ;

    arrayData$.sort() ;

    for(i = 0; i < arrayData$.length; i++){
        if(arrayData$[i] !== value){
          value = arrayData$[i] ;
        }else{        
          arrayData$.splice(i, 1);  
          i-- ;
        }
    }

    return arrayData$ ;
}

/*
 * @Name   : arrayExtract（已合入vkData中:array_filter_appoint）
 * @Desc   : 抽取目标一维关联数组中指定键名的数据组成新一维关联数组
 * @Param  : array  assoc_array$  目标关联数组（一维关联数组）
 * @Param  : array  key_array$    指定键名组成的数组
 * @Return : array  new_array$    抽取后的新关联数组
 */
function arrayExtract(assoc_array$, key_array$){
    var new_array$ = {} ;
    for(n = 0; n < key_array$.length; n++){
        new_array$[key_array$[n]] = assoc_array$[key_array$[n]] ;
    }

    return new_array$ ;
}

/*
 * @Name   : arrayTrans（已合入vkData中:array_select_trans）
 * @Desc   : 这样表达更清楚吧：array[i][key->value] ---转换---> array[key][value[i]]
 * @Param  : array  src_array$  原始数组
 * @Return : array  new_array$  抽取后的新数组
 */
function arrayTrans(src_array$){
    var new_array$ = {} ;
    
    for(i = 0; i < src_array$.length; i++){
        $.each(src_array$[i], function(key, value){
          if(new_array$[key] == undefined){
              new_array$[key] = [] ;
          }
          new_array$[key].push(value) ;
        }) ;
    }
    return new_array$ ;
}

/*
 * @Name   : arrayFilter（已合入vkData中:martix_filter_key）
 * @Desc   : 把多维关联数组按某一属性分组重组为新数组
 * @Param  : array   src_array$  原始数组
 * @Param  : string  filter_key  目标属性名称
 * @Return : array   new_array$  抽取后的新数组
 */
function arrayFilter(src_array$, filter_key){
    var f_key,
        new_array$ = {} ;
    
    for(var i = 0; i < src_array$.length; i++){
        f_key = src_array$[i][filter_key] ;
        if(new_array$[f_key] == undefined){
          new_array$[f_key] = [] ;
        }
        new_array$[f_key].push(src_array$[i]) ;  
    }

    return new_array$ ;
}

/*
 * @Name   : arrayShine（已合入vkData中:array_select_shine）
 * @Desc   : 把原数组对象（一维关联数组）按映射规则组成新的属性对应的数组
 * @Param  : array  src_array$  原始数组
 * @Param  : array  map$        映射规则
 * @Return : array  new_array$  抽取后的新数组
 */
function arrayShine(src_array$, map$){
    var n_key,
        new_array$ = {} ;
    
    $.each(map$, function(key, value){
        n_key = map$[key] ;
        if(new_array$[n_key] == undefined){
          new_array$[n_key] = src_array$[key] ;
        }
    }) ;

    return new_array$ ;
}

/*
 * @Name   : arrayMaxVal（已合入vkData中:array_select_max_val）
 * @Desc   : 查找一维数组最大值
 * @Param  : array  src_array$  原始数组
 * @Return : number  max_value  最大值
 */
function arrayMaxVal(src_array$){
    var max_value = 0 ;

    for(var i = 0; i < src_array$.length; i++){
        if(src_array$[i] > max_value){
          max_value = src_array$[i] ;
        }
    }

    return max_value ;
}

/*
 * @Name   : arrayMaxObj
 * @Desc   : 查找关联数组最大值
 * @Param  : array  srcData$  原始对象数据
 * @Return : object  maxData$  最大值对象
 */
function arrayMaxObj(srcData$){
    var maxData$     = {} ;
        maxData$.val = 0  ;

    $.each(srcData$, function(key, value){
        if(maxData$.val < value){
          maxData$.key = key ;
          maxData$.val = value ;
        }
    }) ;

    return maxData$ ;
}

/*
 * @Name   : arrayKeySum
 * @Desc   : 多维关联数组指定属性值求和
 * @Param  : mix     srcData$  原始对象数据（形如srcData$[i].{...}）
 * @Param  : string  sum_key    要求和的数据属性
 * @Return : number  sum_value  求和的值
 */
function arrayKeySum(srcData$, sum_key){
    var sum_value = 0 ;

    for(var i = 0; i < srcData$.length; i++){
        if(srcData$[i][sum_key]){
          sum_value += parseInt(srcData$[i][sum_key]) ;  
        }
    }

    return sum_value ;
}

/*
 * @Name   : arrayKeySumGroup
 * @Desc   : 数组对象属性值分类求和
 * @Param  : mix     srcData$  原始对象数据（形如srcData$[i].{...}）
 * @Param  : string  group_key  要分类的属性
 * @Param  : string  sum_key    要求和的数据属性
 * @Return : object  sumData$  分类求和后的数据
 */
function arrayKeySumGroup(srcData$, group_key, sum_key){
    var group_value,
        sumData$ = {} ;

    for(var i = 0; i < srcData$.length; i++){
        if(srcData$[i][sum_key]){
          group_value = srcData$[i][group_key] ;

          if(sumData$[group_value] == undefined){
              sumData$[group_value] = 0 ;
          }
          sumData$[group_value] += parseInt(srcData$[i][sum_key]) ;
        }
    }
    
    return sumData$ ;
}

/*
 * @Name   : arrayKeyCount
 * @Desc   : 数组对象属性值计数
 * @Param  : mix     srcData$     原始对象数据（形如srcData$[i].{...}）
 * @Param  : string  count_key    要求和的数据属性
 * @Param  : string  count_type  计数类型（distinct/indistinct）
 * @Return : number  count_value  求和的值
 */
function arrayKeyCount(srcData$, count_key, count_type){
    var count     = 0,
        key_array = [] ;

    for(var i = 0; i < srcData$.length; i++){
        if(srcData$[i][count_key]){
          if(count_type === 'distinct'){
              if(inArray(key_array, srcData$[i][count_key]) == false){
                  key_array.push(srcData$[i][count_key]) ;
                  count ++ ;
              }
          }else{
              count ++ ;
          }
        }
    }

    return count ;
}

/* ------------------------------------------------- 项目专用函数 ------------------------------------------------- */

/*
 * @Name   : optionSumGroup
 * @Desc   : 问题选项分组汇总（废弃功能合并到$.vkData('data_select_sum')）
 * @Param  : array  srcData$  原始数据
 * @Param  : array  key_group  分类字段
 * @Param  : string  key_count  汇总字段
 * @Return : array  newData$  汇总后数据
 */
function optionSumGroup(srcData$, key_group, key_count){
    var option, key, value, str_eval,
        newData$ = {},
        value$   = [] ;
    
    for(i = 0; i < srcData$.length; i++){
        key    = srcData$[i][key_group] ;
        option = srcData$[i]['option_name'] ;

        if(newData$[key] == undefined){
          newData$[key] = {} ;
        }

        if(newData$[key][option] == undefined){
          newData$[key][option] = parseInt(srcData$[i][key_count]) ;
        }else{
          newData$[key][option] += parseInt(srcData$[i][key_count]) ;
        }
    }
    
    return newData$ ;
}

/*
 * @Name   : url_search_to_array
 * @Desc   : URL参数提取（转换为键值对数组）
 * @Param  : string  search_str  URL参数序列字符串
 * @Return : array  search_arr  URL参数键值对数组
 */

function url_search_to_array(search_str){
    var data_str, data_arr, i, 
        search_arr = {} ;

    //先分解参数序列为参数数组
    search_str.indexOf('?') == 0 ? data_str = search_str.substring(1) : data_str = search_str ;
    data_arr = decodeURI(data_str).split('&') ;  //解码并分割参数

    //再分别提取各数组元素键值对
    for(i = 0; i < data_arr.length; i++){
        search_arr[data_arr[i].split('=')[0]] = data_arr[i].split('=')[1].replace("%20", ' ') ;
    }
    
    return search_arr ;
}

/* ------------------------------------------------- 页面功能函数jQuery ------------------------------------------------- */

$.fn.setCursorPosition = function(position){ 
  if(this.lengh == 0) return this ; 

  return $(this).setSelection(position, position) ; 
} 

$.fn.setSelection = function(selectionStart, selectionEnd) { 
  if(this.lengh == 0) return this; 

  var input = this[0]; 

  if(input.createTextRange){ 
    var range = input.createTextRange() ;

    range.collapse(true) ; 
    range.moveEnd('character', selectionEnd) ; 
    range.moveStart('character', selectionStart) ; 
    range.select() ;
  }else if(input.setSelectionRange){ 
    input.focus() ; 
    input.setSelectionRange(selectionStart, selectionEnd) ; 
  } 

  return this; 
} 

$.fn.focusEnd = function(){ 
  this.setCursorPosition(this.val().length) ; 
}


/*
 * @Name   : 函数名称
 * @Desc   : 函数说明描述
 * @Param  : array  src_array$  入参
 * @Return : array  new_array$  出参
 */
function func(){

}





