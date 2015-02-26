
/**
 * Name        : vkData.js
 * Description : VixiK数据处理功能库
 *
 * Create-time : 2013-6-13, 4:18:17
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

(function($){
	// 方法清单
	var methods = {

		// ---------------------------------------------------------------------------------- Array

		/*
		 * @Name   : array_check_value_in
		 * @Desc   : 判断一个值是否在数组（一维）中
		 * @Param  : array  data$       目标数组
		 * @Param  : mix    value       要判断的值（数值/字符串）
		 * @Return : bool   ture/false  判断结果
		 */
		array_check_value_in : function(param$){
			var data$ = param$.data$ ;
			var value  = param$.value ;
			var flag   = false ;

		    for(var i = 0; i < data$.length; i++){
		        if(data$[i] == value){
		            flag = true ;
		            break ;
		        }
		    }
		    
		    return flag ;
		},

		/*
		 * @Name   : array_create_seq
		 * @Desc   : 快速生成一个连续序列数组
		 * @Param  : number  start   指定序列起点
		 * @Param  : number  length  指定序列长度
		 * @Param  : number  max     序列最大值（可选）
		 * @Return : array   seq$    生成的连续数列数组
		 */
		array_create_seq : function(param$){
		    var seq$ = [] ;

		    for(var i = 0; i < param$.length; i++){
		        if(param$.start > param$.max){
		        	break ;
		        }
		        
		        seq$[i] = param$.start++ ;
		    }
		    
		    return seq$ ;
		},

		/*
		 * @Name   : filter_array_duplicate
		 * @Desc   : 一维数组去重
		 * @Param  : array  data$  原始一维数组
		 * @Return : array  data$  去重后的新数组
		 */
		array_filter_duplicate : function(param$){
		    var value,
		        data$ = (param$.data$).sort() ;

		    for(i = 0; i < data$.length; i++){
		        if(data$[i] !== value){
		        	value = data$[i] ;
		        }else{
		        	data$.splice(i, 1) ;
		        	i-- ;
		        }
		    }

		    return data$ ;
		},

		/*
		 * @Name   : array_filter_appoint
		 * @Desc   : 抽取目标一维关联数组中指定键名的数据组成新一维关联数组
		 * @Param  : array  src_data$  目标关联数组（一维关联数组）
		 * @Param  : array  key$       指定键名组成的数组
		 * @Return : array  new_data$  抽取后的新关联数组
		 */
		array_filter_appoint : function(param$){
		    var new_data$ = {} ;

		    for(n = 0; n < key$.length; n++){
		        new_data$[key$[n]] = src_data$[key$[n]] ;
		    }

		    return new_data$ ;
		},

		/*
		 * @Name   : array_select_trans
		 * @Desc   : 这样表达更清楚吧：array[i][key->value] ---转换---> array[key][value[i]]
		 * @Param  : array  src_data$  原始数组
		 * @Return : array  new_data$  抽取后的新数组
		 */
		array_select_trans : function(param$){
		    var new_data$ = {} ;
		    
		    for(i = 0; i < param$.src_data$.length; i++){
		        $.each(param$.src_data$[i], function(key, value){
					if(new_data$[key] == undefined){
					  new_data$[key] = [] ;
					}
					new_data$[key].push(value) ;
		        }) ;
		    }

		    return new_data$ ;
		},

		/*
		 * @Name   : array_select_shine
		 * @Desc   : 把原数组对象（一维关联数组）按映射规则组成新的属性对应的数组
		 * @Param  : array  src_data$  原始数组
		 * @Param  : array  map$       映射规则
		 * @Return : array  new_data$  抽取后的新数组
		 */
		array_select_shine : function(param$){
		    var n_key ;
		    var new_data$ = {} ;
		    
		    $.each(param$.map$, function(key, value){
		        n_key = map$[key] ;

		        if(new_data$[n_key] == undefined){
		          new_data$[n_key] = param$.src_data$[key] ;
		        }
		    }) ;

		    return new_data$ ;
		},

		/*
		 * @Name   : array_select_max_val
		 * @Desc   : 查找一维数组最大值
		 * @Param  : array   data$  原始数组
		 * @Return : number  value  最大值
		 */
		array_select_max_val : function(data$){
		    var value = 0 ;

		    for(var i = 0; i < data$.length; i++){
		        if(data$[i] > value){
		          value = data$[i] ;
		        }
		    }

		    return value ;
		},

		// ---------------------------------------------------------------------------------- Martix 

		/*
		 * @Name   : matrix_filter_wash
		 * @Desc   : 数据清洗：按规则转换提取数据
		 * @Param  : array  src_data$  原始数据，形如[{k1:v1,k2:v2},{k1:v1,k2:v2},{k1:v1,k2:v2},..]
		 * @Param  : array  map$       映射规则，形如{old_key1:new_key1,old_key2:new_key2,..}
		 * @Return : array  new_data$  清洗后的新数据，格式和原始数据一样，但key已经被替换为new_key
		 */
		matrix_filter_wash : function(param$){
		    var i, tmpData$ ;
		    var new_data$ = [] ;

		    for(i = 0; i < param$.src_data$.length; i++){
		        tmpData$ = {} ;

		        $.each(param$.map$, function(key, value){
		            if(tmpData$[value] == undefined){
		              tmpData$[value] = param$.src_data$[i][key] ;
		            }
		        }) ;
		        new_data$.push(tmpData$) ;
		    }

		    return new_data$ ;
		},

		/*
		 * @Name   : matrix_filter_key
		 * @Desc   : 把多维关联数组按某一属性分组重组为新数组
		 * @Param  : array   src_data$  原始数组
		 * @Param  : string  key        目标属性名称
		 * @Return : array   new_data$  抽取后的新数组
		 */
		matrix_filter_key : function(param$){
		    var f_key ;
		    var new_data$ = {} ;
		    
		    for(var i = 0; i < param$.src_data$.length; i++){
		        f_key = param$.src_data$[i][param$.key] ;

		        if(new_data$[f_key] == undefined){
		          new_data$[f_key] = [] ;
		        }

		        new_data$[f_key].push(param$.src_data$[i]) ;  
		    }

		    return new_data$ ;
		},

		/*
		 * @Name   : array_include
		 * @Desc   : 一维关联数组包含判断（判断一个数组是否包含于另一数组中：data2包换data1）
		 * @Param  : array   data1$      包含判断母数据
		 * @Param  : array   data2$      包含判断子数据
		 * @Param  : array   strict      是否严格比较（默认非严格比较值）
		 * @Return : bool    true/false  比较结果（包含/未包换）
		 */
		array_include : function(param$){
			var default$ = {strict : false},                  //  默认非严格比较
			    param$   = $.extend(default$, param$ || {}),  //  合并自定义配置
			    flag     = true ;

			//  先用data1$去比较data2$
	        $.each(param$.data2$, function(key, value){
	        	if(value == ''){
	        		value = null ;
	        	}

	        	if(value != param$.data1$[key]){
	        		return flag = false ;
	        	}else if(param$.strict && value !== param$.data1$[key]){
	        		return flag = false ;
	        	}
	        }) ;

		    //  返回比较结果
		    return flag ;
		},

		/*
		 * @Name   : array_compare
		 * @Desc   : 一维关联数组比较
		 * @Param  : array   data1$      数据1
		 * @Param  : array   data2$      数据2
		 * @Param  : array   strict      是否严格比较（默认非严格比较值）
		 * @Return : bool    true/false  比较结果
		 */
		array_compare : function(param$){
			var default$ = {strict : false} ;                  //  默认非严格比较
			var param$   = $.extend(default$, param$ || {}) ;  //  合并自定义配置
			var flag     = true ;

			//  先用data1$去比较data2$
	        $.each(param$.data1$, function(key, value){
	        	if(param$.data2$[key] && param$.data1$[key] == param$.data2$[key]){
	        		if(param$.strict && param$.data1$ !== param$.data2$){
		        		return flag = false ;
	        		}
	        	}else{
	        		return flag = false ;
	        	}
	        }) ;

			//  先用data2$去比较data1$
	        if(flag){
		        $.each(param$.data2$, function(key, value){
		        	if(param$.data1$[key] && param$.data1$[key] == param$.data2$[key]){
		        		if(param$.strict && param$.data1$ !== param$.data2$){
	        				return flag = false ;
		        		}
		        	}else{
	        			return flag = false ;
		        	}
		        }) ;
	        }

		    //  返回比较结果
		    return flag ;
		},

		/*
		 * @Name   : matrix_compare
		 * @Desc   : 多维关联数组比较
		 * @Param  : array   data1$      数据1
		 * @Param  : array   data2$      数据2
		 * @Param  : array   strict      是否严格比较（默认非严格比较值）
		 * @Return : bool    true/false  比较结果
		 */
		matrix_compare : function(param$){
			var default$ = {strict : false} ;                  //  默认非严格比较
			var param$   = $.extend(default$, param$ || {}) ;  //  合并自定义配置
			var flag     = true ;                              //  返回标志位

			//  先用data1$去比较data2$
	        $.each(param$.data1$, function(key, value){
	        	if(param$.data2$[key]){
	        		//  判断数据类型
	        		if(param$.data1$[key] instanceof Object){
	        			if(!$.vkData('matrix_compare', {data1$:param$.data1$[key], data2$:param$.data2$[key], strict:param$.strict})){
	        				return flag = false ;
	        			}
	        		}else if(param$.data1$[key] == param$.data2$[key]){
		        		if(param$.strict && param$.data1$ !== param$.data2$){
			        		return flag = false ;
		        		}
		        	}else{
		        		return flag = false ;
		        	}
	        	}else{
	        		return flag = false ;
	        	}
	        }) ;

			//  先用data2$去比较data1$
	        if(flag){
		        $.each(param$.data2$, function(key, value){
		        	if(param$.data1$[key]){
		        		//  判断数据类型
		        		if(param$.data2$[key] instanceof Object){
		        			if(!$.vkData('matrix_compare', {data1$:param$.data2$[key], data2$:param$.data1$[key], strict:param$.strict})){
		        				return flag = false ;
		        			}
		        		}else if(param$.data1$[key] == param$.data2$[key]){
			        		if(param$.strict && param$.data1$ !== param$.data2$){
				        		return flag = false ;
			        		}
			        	}else{
			        		return flag = false ;
			        	}
		        	}else{
		        		return flag = false ;
		        	}
		        }) ;
	        }

		    //  返回比较结果
		    return flag ;
		},

		// ---------------------------------------------------------------------------------- Data

		/*
		 * @Name   : data_check_null
		 * @Desc   : 轻量级数据有效性校验，检验入参对象所有属性值是否为空
		 * @Param  : array  data$   目标数据
		 * @Return : bool   status  校验结果(true/false)
		 * @Return : mix    data    随从数据(校验通过返回原始数据；不通过返回空值对应的key)
		 */
		data_check_null : function(data$){
			var flag$ = {status:true, data:data$} ;
			var flag  = true ;
			var n = 0 ;

		    // 如果入参类型还是对象，进行二次判断处理
		    if(typeof(data$) === 'object'){
		        if($.isArray(data$)){  // 数组处理
					for(var k = 0; k < data$.length; k++){
						flag = $.vkData('data_check_null', data$[k]) ;
						if(flag.status != true){
							flag$ = {status:false, data:k} ;
						  	break ;
						}
					}
		        }else{  // 对象处理
					for(var k in data$){  // 遍历输出数据对象每个属性做递归判断
						n ++ ;
						flag = $.vkData('data_check_null', data$[k]) ;
						if(flag.status != true){
							flag$ = {status:false, data:k} ;
						  	break ;
						}
					}

					// 空对象判断
					if(!n){
						flag$ = {status:false, data:{}}
					}
		        }
		    }else{  // 如果入参类型非对象，直接进行空值判断
		        if(data$ === undefined || data$ === ''){    // 如果有属性值为空抛出异常
		          return false ;
		        }
		    }

		    return flag$ ;
		},

		/*
		 * @Name   : data_complete_judge
		 * @Desc   : 数据完整性判定
		 * @Param  : array  data$  目标数据
		 * @Param  : array  key$   要判定的数据字段名
		 * @Return : array  res$   判定结果
		 */
		data_complete_judge : function(param$){
			var nkey$ = [],
		        n     = 0 ;

		    if(param$.key$ && param$.key$.length){
		    	//  有传入要判定的数据字段范围参数时处理方式
		    	for(var i = 0; i < param$.key$.length; i++){
		    		if(param$.data$[param$.key$[i]] == undefined || param$.data$[param$.key$[i]] == ''){
		    			nkey$.push(param$.key$[i]) ;
		    		}else{
		    			n++ ;
		    		}
		    	}
		    }else{
		    	//  只传入目标数据时处理方式
			    $.each(param$.data$, function(key, value){
		    		if(value !== undefined && value !== ''){
		    			n++ ;
		    		}else{
		    			nkey$.push(key) ;
		    		}
			    }) ;
		    }

		    return {tote : param$.key$.length  ,//  属性总个数
		    		num  : n                   ,//  有值的属性个数
		    	    key$ : nkey$               ,//  无值的属性名称列表
		    	} ;
		},

		/*
		 * @Name   : data_filter_key
		 * @Desc   : 抽取数据中指定键名的数据组成数组数据
		 * @Param  : array  sData$  目标数据
		 * @Param  : array  key$    指定键名组成的数组
		 * @Return : array  nData$  抽取后的新数据
		 */
		data_filter_key : function(param$){
		    var nData$ = {} ;

		    for(var i = 0; i < param$.sData$.length; i++){
			    for(var k = 0; k < param$.key$.length; k++){
			    	if(!nData$[param$.key$[k]]){
			    		nData$[param$.key$[k]] = [] ;
			    	}
			    	nData$[param$.key$[k]].push(param$.sData$[i][param$.key$[k]]) ;
			    }	
		    }

		    return nData$ ;
		},

		/*
		 * @Name   : data_select_filter
		 * @Desc   : 数据查询
		 * @Param  : matrix  data$   原始对象数据（形如data$[i].{...}）
		 * @Param  : array   where$  筛选条件（[{k:v}, {条件属性:条件值}], {},...）
		 * @Return : mix     value$  查询结果
		 */
		data_select_filter : function(param$){
			var flag, vflag ;
			var value$ = [] ;

            var isArray = function(obj) { 
                return Object.prototype.toString.call(obj) === '[object Array]' ;
            } ;

		    // 如果有条件参数，做条件判断处理
		    if(param$.data$){
				if(param$.where$){
					for(var i = 0; i < param$.data$.length; i++){
						flag = true ;

		        		for(var w = 0; w < param$.where$.length; w++){
					        $.each(param$.where$[w], function(wk, wv){
			        			if($.isArray(wv)){
			        				vflag = false ;
			        				
			        				for(var v = 0; v < wv.length; v++){
			        					if(param$.data$[i][wk] == wv[v]){
			        						vflag = true ;
			        						break ;
			        					}
			        				}

			        				if(vflag){
			        					flag = true ;
			        				}else{
			        					flag = false ;
			        				}
			        			}else{
				        			if(param$.data$[i][wk] != wv){
				        				flag = false ;
				        			}	
			        			}
					        }) ;
		        		}

		        		if(flag){
		        			value$.push(param$.data$[i]) ;
		        		}
					}
				}else{
					value$ = param$.data$ ;
				}
				return value$ ;
		    }else{
		    	return false ;
		    }
		},

		/*
		 * @Name   : data_select_sum
		 * @Desc   : 数据指定属性值求和
		 * @Param  : matrix  data$   原始对象数据（形如data$[i].{...}）
		 * @Param  : string  key     要求和的数据属性
		 * @Param  : array   where$  筛选条件（[k:条件属性, v:条件值][][]..）
		 * @Param  : array   group   要分组的属性（两种类型）
		 * @Return : mix     value$  求和的值
		 */
		data_select_sum : function(param$){
		    var value$, flag, group, group_main, group_sub, wflag ;

			if(param$.group){
				value$ = {} ;
			}else{
				value$ = 0 ;				
			}


		    for(var i = 0; i < param$.data$.length; i++){
	        	flag = true ;

	        	// 如果有条件参数，做条件判断处理
	        	if(param$.where$){
	        		for(var w = 0; w < param$.where$.length; w++){

				        $.each(param$.where$[w], function(wk, wv){
		        			if($.isArray(wv)){
		        				wflag = false ;
		        				
		        				for(var v = 0; v < wv.length; v++){
		        					if(param$.data$[i][wk] == wv[v]){
		        						wflag = true ;
		        						break ;
		        					}
		        				}

		        				if(wflag){
		        					flag = true ;
		        				}else{
		        					flag = false ;
		        				}
		        			}else{
			        			if(param$.data$[i][wk] != wv){
			        				flag = false ;
			        			}	
		        			}
				        }) ;
	        		}
	        	}

        		if(flag){
        			if(param$.group){
        				if($.isArray(param$.group)){
        					group_main = param$.data$[i][param$.group[0]] ;
        					group_sub  = param$.data$[i][param$.group[1]] ;

					        if(value$[group_main] == undefined){
					          value$[group_main] = {} ;
					        }

					        if(value$[group_main][group_sub] == undefined){
					          value$[group_main][group_sub] = parseInt(param$.data$[i][param$.key]) ;
					        }else{
					          value$[group_main][group_sub] += parseInt(param$.data$[i][param$.key]) ;
					        }
        				}else{
							group = param$.data$[i][param$.group] ;

							if(value$[group] == undefined){
							  value$[group] = 0 ;
							}
							value$[group] += parseInt(param$.data$[i][param$.key]) ;
        				}
        			}else{
          				value$ += parseInt(param$.data$[i][param$.key]) ;          				
        			}
        		}
		    }

		    return value$ ;
		},

		/*
		 * @Name   : data_select_count
		 * @Desc   : 数据计数
		 * @Param  : matrix  data$   原始对象数据（形如srcData$[i].{...}）
		 * @Param  : string  key     要求和的数据属性
		 * @Param  : array   where$  筛选条件（[k:条件属性, v:条件值][][]..）
		 * @Param  : array   group   要分组的属性
		 * @Return : mix     value$  求和的值
		 */
		data_select_count : function(param$){
		    var value$, flag, group ;

			if(param$.group){
				value$ = {} ;
			}else{
				value$ = 0 ;	
			}

		    for(var i = 0; i < param$.data$.length; i++){
	        	flag = true ;

	        	// 如果有条件参数，做条件判断处理
	        	if(param$.where$){
	        		for(var w = 0; w < param$.where$.length; w++){
	        			if(param$.data$[i][param$.where$[w]['k']] != param$.where$[w]['v']){
	        				flag = false ;
	        				break ;
	        			}
	        		}
	        	}

        		if(flag){
        			if(param$.group){
						group = param$.data$[i][param$.group] ;

						if(value$[group] == undefined){
						  value$[group] = 0 ;
						}
						value$[group]++ ;
        			}else{
          				value$++ ;
        			}
        		}
		    }

		    return value$ ;
		},

		/*
		 * @Name   : data_delete
		 * @Desc   : 数据计数
		 * @Param  : matrix  data$   原始对象数据（形如srcData$[i].{...}）
		 * @Param  : array   where$  筛选条件（[k:条件属性, v:条件值][][]..）
		 * @Return : mix     data$   处理后的结果数组
		 */
		data_delete : function(param$){
		    var flag ;

		    for(var i = 0; i < param$.data$.length; i++){
	        	// 对满足条件的数组做删除处理
	        	if(param$.where$){
	        		flag = true ;

	        		for(var w = 0; w < param$.where$.length; w++){
	        			if(param$.data$[i][param$.where$[w]['k']] != param$.where$[w]['v']){
	        				flag = false ;
	        				break ;
	        			}
	        		}
	        	}

        		if(flag){
        			param$.data$.splice(i, 1) ;
        		}
		    }

		    return param$.data$ ;
		},

		/*
		 * @Name   : method
		 * @Desc   : 方法名称
		 * @Param  : array  array$      参数集
		 * @Return : bool   ture/false  返回值
		 */
		method : function(param$){
        	/* 参数说明
        	var param$ = {
        		url     : 要查询的ajax服务器地址
        		table   : 要查询的目标表名
        		bro_key : 兄对象要ajax访问接口查询字段
                map$    : 接口查询到的数据转换为子对象
        	} ;*/

        	// 默认设置
			var default$ = {
				selectVal : ''  ,// select默认初始选项值
				textVal   : ''  ,// text/textarea默认初始选项值
			} ;
			var param$ = $.extend(default$, param$ || {}) ;    // 合并自定义配置

			// 方法功能
			console.log('method') ;

		    return false ;
		},
	} ;

	// 定义命名空间vkData直接调用方法
	$.vkData = function(method, data){
    	if (methods[method]) {  
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1)) ;

			}else if(typeof method === 'object' || !method) {  
				return methods.init.apply(this, arguments) ;  
			}else {  
				$.error('方法 ' +  method + ' 不存在！') ;  
		}  
	}

})(jQuery) ;
