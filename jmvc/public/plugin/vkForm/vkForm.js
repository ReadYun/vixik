
/**
 * Name        : vkForm.js
 * Description : VixiK表单插件
 * Version     : 0.3.00
 *
 * Create-time : 2014-1-25
 * Author      : ReadYun
 * Copyright   : VixiK
 */

(function($){

	/*·*·*·*·*·*·*·*·*·*·*·*·*·* 内置功能函数定义 *·*·*·*·*·*·*·*·*·*·*·*·*·*/

	/*
	 * @Name   : inArray
	 * @Desc   : 判断一个值是否在数组中
	 * @Param  : array  array$  目标数组值
	 * @Param  : mix    value   要判断的值（数值/字符串）
	 * @Return : bool   flag    判断结果  
	 */
	try{
		if(inArray instanceof Function){
		}
	}catch(e){
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
	}

	/*
	 * @Name   : dataWash
	 * @Desc   : 数据清洗：按规则转换提取数据
	 * @Param  : array   srcData$    原始数据，形如[{k1:v1,k2:v2},{k1:v1,k2:v2},{k1:v1,k2:v2},..]
	 * @Param  : array   map$        映射规则，形如{old_key1:new_key1,old_key2:new_key2,..}
	 * @Return : array   newData$    清洗后的新数据，格式和原始数据一样，但key已经被替换为new_key
	 */
	try{
		if(dataWash instanceof Function){
		}
	}catch(e){
		function dataWash(srcData$, map$){
		    var i, tmpData$ ;
		    var newData$ = [] ;

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
	}

	/*·*·*·*·*·*·*·*·*·*·*·*·*·* vkForm总对象定义 *·*·*·*·*·*·*·*·*·*·*·*·*·*/
	var vkForm$ = {} ;

	/*·*·*·*·*·*·*·*·*·*·*·*·*·* 方法清单 *·*·*·*·*·*·*·*·*·*·*·*·*·*/
	var methods = {

		/*
		 * @Name   : init
		 * @Desc   : 表单初始化
		 * @Return : $elem  表单元素衣服
		 * @Return : $name  表单元素实体
		 */
		init : function(option$){
			var default$ = {
				reset   : false   ,// 是否初始化（默认false）
				style   : null    ,// 样式定义
				event   : null    ,// 事件定义（目前有check/uncheck）
				replace : null    ,// 事件定义
				func    : null    ,// 回调函数
			} ;
			var option$ = $.extend(default$, option$ || {}) ;    // 合并自定义配置

			var $this, id, name,
			    form$ = {} ;

		 	// 定位分对象（.vk-form）
		 	if(this.filter('.vk-form').length){
		 		$this = this.filter('.vk-form') ;
		 	}else if(this.find('.vk-form').length){
		 		$this = this.find('.vk-form') ;
		 	}else{
		 		return false ;   // 如果两种方式都没有找到分对象，退出
		 	}

		 	if($this.attr('data-vkform-id')){

		 	}else{
				id               = parseInt(9999 * Math.random()) ;
				vkForm$[id]      = {} ;
				vkForm$[id].elem = {} ;
		 	}

		 	// 收集汇总各表单元素信息（.vf-elem）
		    $this.find('.vf-elem').each(function(){
				name = $(this).find('input, select, textarea').attr('name') ;

		    	if(!vkForm$[id].elem[name]){
		    		vkForm$[id].elem[name] = $(this) ;
		    	}
		    }) ;

		    // 存储传入的样式
		    if(option$.style){
		    	vkForm$[id].style = option$.style ;
				option$.style() ;
		    }

		    // 存储传入的事件
		    if(option$.event){
		    	vkForm$[id].event = option$.event ;
		    }

		    // 存储传入的replace方法
		    if(option$.replace){
		    	vkForm$[id].replace = option$.replace ;
		    }

		    // 如果有回调函数，调用之。。。
		    if(option$.func){
				option$.func() ;
		    }

		    $this.attr('data-vkform-id', id) ;

		    // 是否重置表单判定
		    if(option$.reset){
		    	$this.vkForm('reset') ;
		    }

		    return vkForm$[id] ;
		},

		// 表单元素选项清理
		clear : function(option$){
			var name, type ;

		 	// 定位分对象.vf-elem和目标元素
		 	if($(this).hasClass('vf-elem')){
				$(this).each(function(){
					$(this).find('.vf-elem-option').remove() ;
				}) ;
		 	}else{
		 		console.log('无法定位分对象或目标元素') ;
		 		return false ;
		 	}
		},

		// 恢复表单初始状态
		reset : function(option$){
			var default$ = {
				text   : ''  ,// 默认初始选项值
				select : ''  ,// 默认初始选项值
			} ;
			var option$ = $.extend(default$, option$ || {}) ;    // 合并自定义配置
			var $vfelem, $vkform, vkform$, form$, name, type, value ;

		 	// 定位目标元素.vf-elem和分对象.vf-elem
		 	if($(this).hasClass('vf-elem')){
		 		$vfelem = $(this) ;
		 		$vkform = $(this).parents('.vk-form') ;
		 	}else if($(this).hasClass('vk-form')){
		 		$vkform = $(this) ;
		 		$vfelem = $(this).find('.vf-elem') ;
		 	}

		 	try{
			 	if($vkform.length && $vfelem.length){
			 		// 如果两个对象都存在，处理过程开始
				 	// 取分对象初始化信息
					if($vkform.attr('data-vkform-id')){
						vkform$ = vkForm$[$vkform.attr('data-vkform-id')] ;
					}else{
						vkform$ = $vkform.vkForm('init') ;
					}

					$vfelem.each(function(){
						$name = $(this).find('input, select, textarea') ;
						type  = $name.attr('type') ;

						if(type === 'select'){
							if($name.find('option.init').length){
								// 如果有初始选项按照初始选项值进行匹配
								$name.attr('value', $name.find('option.init').val()) ;
							}else{
								// 否则按照默认统一初始值进行匹配
								$name.attr('value', option$.select) ;
							}
						}else if(type === 'radio' || type === 'checkbox'){
							try{
								if(vkform$.event.uncheck instanceof Function){
									vkform$.event.uncheck($name) ;
								}
							}catch(e){
								$name.attr('checked', false) ;
							}
						}else{
							$name.attr('value', option$.text) ;
						}
					}) ;
			 	}else{
			 		console.log('无法定位分对象或目标元素') ;
			 		return false ;
			 	}
		 	}catch(e){
		 		console.log('无法定位分对象或目标元素') ;
			 	return false ;
		 	}
		},

		// 表单元素匹配
		fix : function(option$){
			var default$ = {
				data$  : null    ,// 指定匹配值
				cover  : 'true'  ,// 完全覆盖匹配标志
				before : null    ,// 调用方法的来源
				after  : null    ,// 后续调用的方法
			} ;
			var option$ = $.extend(default$, option$ || {}) ;    // 合并自定义配置
			var $vkform, vkform$, $vfelem, $elem, $name, name, type, value ;


		 	// 定位目标元素.vf-elem和分对象.vf-elem
		 	if($(this).hasClass('vf-elem')){
		 		$vfelem = $(this) ;
		 		$vkform = $(this).parents('.vk-form') ;
		 	}else if($(this).hasClass('vk-form')){
		 		$vkform = $(this) ;
		 		$vfelem = $(this).find('.vf-elem') ;
		 	}else{
		 		console.log('cant find .vf-elem or .vf-elem') ;
		 		return false ;
		 	}

		 	// 取vkform对象
			if($vkform.attr('data-vkform-id')){
				vkform$ = vkForm$[$vkform.attr('data-vkform-id')] ;
			}else{
				vkform$ = $vkform.vkForm('init') ;
			}
			
			// 遍历vfelem元素进行表单赋值
			$vfelem.each(function(){
				$elem = $(this) ;
				$name = $elem.find('input, select, textarea') ;
				name  = $name.attr('name') ;
				type  = $name.attr('type') ;


				// 入参值
				if(option$.data$ instanceof Object){
					if(option$.data$[name]){
						value = option$.data$[name] ;
					}else{
						value = null ;
						console.log('目标对象要匹配的值不存在') ;
					}
				}else{
					value = option$.data$ ;
				}

				if(option$.cover){
					switch(type){
						case 'radio' : 
							if(value){
								if(vkform$.event.uncheck){
									vkform$.event.uncheck($name) ;	
								}else{
									$name.attr('checked', false) ;
								}

								// 如果有指定值，定位元素选中他
								if(vkform$.event.check){
									vkform$.event.check($name.filter('[value=' + value + ']')) ;
								}else{
									$name.filter('[value=' + value + ']').attr('checked', true) ;
								}
							}else{
								return false ;
							}
							break ;

						case 'checkbox' : 
							if(value){
								if(vkform$.event.uncheck){
									vkform$.event.uncheck($name) ;	
								}else{
									$name.attr('checked', false) ;
								}

								// 如果有指定值，定位元素选中他
								if(typeof value == 'string'){
									value = value.split(',') ;
								}

								// checkbox表单的初始值必须是数组类型
								for(var i = 0; i < value.length; i++){
									if(vkform$.event.check){
										vkform$.event.check($name.filter('[value=' + value[i] + ']')) ;
									}else{
										$name.filter('[value=' + value[i] + ']').attr('checked', true) ;
									}
								}
							}else{
								return false ;
							}
							break ;

						case 'select' : 
							if(value){
								if($name.find('option[value=' + value + ']').length){
									$name.attr('value', value) ;

									// 表单赋值后隐藏默认初始选项
									if($elem.attr('data-vf-opt-init') === 'hide'){
										if($elem.find('option').not('option.init').length){
											$elem.find('option.init').hide() ;
										}
									}
								}else{
									// 如果找不到值对应的选项并且前置不是replace方法，调用replace方法刷新元素选项
									if(option$.before !== 'replace'){
										$elem.vkForm('replace', {fix$:option$.data$, before:'fix', after:'fix'}) ;
										return false ;
									}
								}
							}else{
								if($name.find('option.init').length){
									// 如果有初始选项按照初始选项值进行匹配
									$name.attr('value', $name.find('option.init').val()) ;
								}else{
									// 否则按照默认统一初始值进行匹配
									$name.attr('value', '') ;
								}

								return false ;
							}
							break ;

						default : 
								if($name.attr('data-input-suffix')){
									value = value + $name.attr('data-input-suffix') ;
								}
								$name.attr('value', value) ;
							break ;
					}
				}else{  
					// 非覆盖方式匹配更新数据：如果目标元素有非初始值，不再重新匹配数据
					switch(type){  
						case 'radio' :
							if(value && $name.filter(':checked').length == 0){
								if(vkform$.event.uncheck){
									vkform$.event.uncheck($name) ;	
								}else{
									$name.attr('checked', false) ;
								}

								// 如果有指定值，定位元素选中他
								if(value){
									if(vkform$.event.check){
										vkform$.event.check($name.filter('[value=' + value + ']')) ;
									}else{
										$name.filter('[value=' + value + ']').attr('checked', true) ;
									}
								}
							}else{
								return false ;
							}
							break ;

						case 'checkbox' :
							if(value && $name.filter(':checked').length == 0){
								if(vkform$.event.uncheck){
									vkform$.event.uncheck($name) ;	
								}else{
									$name.attr('checked', false) ;
								}

								// checkbox表单的初始值必须是数组类型
								for(var i = 0; i < value.length; i++){
									if(vkform$.event.check){
										vkform$.event.check($name.filter('[value=' + value[i] + ']')) ;
									}else{
										$name.filter('[value=' + value[i] + ']').attr('checked', true) ;
									}
								}
							}else{
								return false ;							
							}
							break ;

						case 'select' :
							// 如果元素值不存在或者其值并非其选项列表中的一个选项，说明该select表单需要做数据匹配
							if($elem.find('option[value=' + $name.val() + ']').length == 0){
								if(value){
									if($name.find('option[value=' + value + ']').length){
										$name.attr('value', value) ;

										// 表单赋值后隐藏默认初始选项
										if($elem.attr('data-vf-opt-init') === 'hide'){
											if($elem.find('option').not('option.init').length){
												$elem.find('option.init').hide() ;
											}
										}
									}else{
										// 如果找不到值对应的选项并且前置不是replace方法，调用replace方法刷新元素选项
										if(option$.before !== 'replace'){
											$elem.vkForm('replace', {fix$:value, before:'fix', after:'fix'}) ;
											return false ;
										}
									}
								}else{
									if($name.find('option.init').length){
										// 如果有初始选项按照初始选项值进行匹配
										$name.attr('value', $name.find('option.init').val()) ;
									}else{
										// 否则按照默认统一初始值进行匹配
										$name.attr('value', '') ;
									}

									return false ;
								}
							}
							break ;

						default :
							console.log($elem) ;
							if($elem.val() == ''){
								$name.attr('value', value) ;
							}
							break ;
					}					
				}

				// 如果元素还有对应的兄弟元素，在匹配完成后要重置对应兄弟子元素的选项
				if($elem.attr('data-vf-sub')){
					$('[data-vf-name=' + $elem.attr('data-vf-sub') + ']').attr('data-rep-para', value) ;
					$('[data-vf-name=' + $elem.attr('data-vf-sub') + ']').vkForm('replace', {fix$:option$.data$}) ;
				}
			}) ;
		},

		// 更新表单元素对象的选项
		replace : function(option$){
			var default$ = {
					type   : this.attr('data-vf-replace')  ,// replace方式
					data$  : null                          ,// 要替换的表单选项数据集合：[{val:xxx, tag:xxx}, {val:xxx, tag:xxx}, ...]
					fix$   : null                          ,// 替换完成后要重新匹配的数据
					func   : null                          ,// 回调函数
					before : null                          ,// 调用方法的来源
					after  : null                          ,// 后续调用的方法
				} ;
			var option$ = $.extend(default$, option$ || {}) ;    // 合并自定义配置

			var data$, $vkform, vkform$, $name, $option, condition, table, key, type, name, $tpl, $target,
			    $this = this ;

		 	// 定位分对象（.vk-form）
		 	if(this.filter('.vk-form').length){
		 		$vkform = this.filter('.vk-form') ;
		 	}else if(this.parents('.vk-form').length){
		 		$vkform = this.parents('.vk-form') ;
		 	}else{
		 		console.log('无法定位分对象') ;
		 		return false ;   // 如果两种方式都没有找到分对象，退出
		 	}

			if($vkform.attr('data-vkform-id')){
				vkform$ = vkForm$[$vkform.attr('data-vkform-id')] ;
			}else{
				vkform$ = $vkform.vkForm('init') ;
			}

			// this对应的是含有.vf-elem的目标表单元素主对象
			// 确认定位表单元素
		 	if(this.filter('input, select').length){
		 		$name = this.filter('input, select') ;
		 	}else if(this.find('input, select').length){
		 		$name = this.find('input, select') ;
		 	}else{
		 		console.log('无法定位到目标元素') ;
		 		return false ;   // 如果找不到分对象下的表单元素，退出
		 	}
			
			type    = $name.attr('type') ;
			name    = $name.attr('name') ;
			$tpl    = this.find('.vf-elem-option-tpl') ;
			$target = $tpl.parent() ;

			// 重置处理前置
			if(!option$.data$ && option$.type){
				switch(option$.type){
					case 'ajax' :  // Ajax方式处理
						this.vkForm('replace_ajax', {fix$:option$.fix$}) ;
						break ;
					case 'func' :  // 函数方式处理
						if(vkform$.replace[name] instanceof Function){
							eval('vkform$.replace.' + name + '(this)') ;
						}else if(vkform$.replace.common instanceof Function){
							vkform$.replace.common(this) ;
						}else{
							console.log('找不到可以调用的replace功能函数') ;
						}
						break ;
					default :
						data$ = option$.data$ ;
						break ;
				}				
			}else{
				data$ = option$.data$ ;
			}

			if(data$){
				// 如果有传入的实际值。。进行重置处理
				// 移除所有非初始/模板选项
				$target.children('.vf-elem-option').remove() ;

				// 指定参数值替换方式优先级最高，最先判定处理
				// 倒序插入数据化后的选项元素
				for(var i = 0; i < data$.length; i++){
					$option = $tpl.clone().removeClass('vf-elem-option-tpl init').addClass('vf-elem-option') ;  // 复制模板选项
	            
					if(type === 'select'){
						// select类型表单处理
						$option.attr('value', data$[i].val).text(data$[i].tag) ;
					}else{
						// 非select类型表单处理
						if($option.filter('input').length){
							$option.filter('input').attr('value', data$[i].val) ;
						}else{
							$option.find('input').attr('value', data$[i].val) ;
						}

						// 选项标记赋值（.vf-elem-option-tag）
						if($option.find('.vf-elem-option-tag').length){
							$option.find('.vf-elem-option-tag').text(data$[i].tag) ;
						}else{
							$option.find('input').after(data$[i].tag) ;
						}
					}
					      												 
					$target.append($option).show() ;    // 插入目标元素

					// 更新样式
					if(vkform$.style){
						vkform$.style($target) ;
					}
				}
			}else{
				return false ;  // 否则退出
			}

			// 替换完成后重新初始化表单
			if(option$.fix$){
				this.vkForm('fix', {data$:option$.fix$}) ;
			}

			// 如果目标元素还有子元素，还需要再清理子元素选项
			if(this.attr('data-vf-sub')){
				$('.vf-elem[data-vf-name=' + this.attr('data-vf-sub') +']').find('.vf-elem-option').remove() ;
			}

		    // 如果有回调函数，调用之。。。
		    if(option$.func){
				option$.func() ;
		    }

		    // 显示重置的选项元素和目标主对象（稍加延迟）
            setTimeout(function(){
				$target.children('.vf-elem-option').show() ;
				$this.show() ;
            }, 10) ;
		},
        
        // select选项更新
        replace_ajax : function(option$){
        	var default$ = {
					fix$      : null                                                           ,// 要重新匹配的数据
	        		condition : this.attr('data-rep-condition')                                ,// 查询条件生成
	        		url       : this.attr('data-rep-url')                                      ,// 要查询的ajax服务器地址
	        		api       : this.attr('data-rep-api')                                      ,// 要查询的接口名称
	        		table     : this.attr('data-rep-table')                                    ,// 要查询的表名
	        		key       : this.attr('data-rep-key')                                      ,// 要查询的字段名
	        		para      : this.attr('data-rep-para')                                     ,// 传入的查询值
	        		map$      : {val:this.attr('data-rep-val'),tag:this.attr('data-rep-tag')}  ,// 生成的字段转换关系
					before    : null                                                           ,// 调用方法的来源
					after     : null                                                           ,// 后续调用的方法
	        	} ;
			var option$ = $.extend(default$, option$ || {}) ;  // 引入自定义属性

			var $this = this,
			    name  = $this.find('input, select').attr('name') ;

			// 查询条件生成
			if(!option$.condition){
				if(option$.para){
	            	option$.condition = option$.key + ' = ' + option$.para ;
				}
			}

			if(option$.url && option$.table && option$.condition){
	            $.ajax({
	                type    : 'post',
	                url     : option$.url, 
	                data    : {api:option$.api, table:option$.table, condition:option$.condition},
	                async   : false,   
	                success : function(data$){
	                	if(data$.status){
							// 解析服务器返回值转换成要求格式参数再去调用replace方法
		                    $this.vkForm('replace', {data$:dataWash(data$.data, arraySwap(option$.map$)), fix$:option$.fix$}) ;
	                	}
	                }
	            });
			}else{
				console.log('表单元素[' + name + ']：Ajax参数不满足要求，请检查配置') ;
				console.log(option$) ;
				return false ;
			}
        },

		get_value : function(option$){
			// 默认属性定义
			var default$ = {
					get_type    : 1        ,// 数据收集方式（默认方式1）
					get_null    : true     ,// 是否取空值
					check_null  : 0        ,// 是否校验空值（0:不校验；1:只校验必选项；2:校验全部选项包括可选项）
					key_list    : []       ,// 其他字段列表
					alias_name  : 'name'   ,// name别名
					alias_value : 'value'  ,// value别名
				} ;
			var option$ = $.extend(default$, option$ || {}) ;  // 引入自定义属性

			// 方法变量
			var $vkform, vkform$, $vfelem, $vfele, $elem, $elem, elem$, name, type, vflag, value, suffix, val_init, error,
			    reg    = /^\s*$/,  // 空字符串正则规则
			    data0$ = {},
			    data$  = {} ;

		 	// 定位目标元素.vf-elem和分对象.vf-elem
		 	if($(this).hasClass('vf-elem')){
		 		$vkform = $(this).parents('.vk-form') ;
		 		$vfelem = $(this) ;
		 	}else if($(this).hasClass('vk-form')){
		 		$vkform = $(this) ;
		 		$vfelem = $(this).find('.vf-elem') ;
		 	}else{
		 		console.log('无法定位分对象或目标元素') ;
		 		return false ;
		 	}

	 		// 如果两个对象都存在，处理过程开始
		 	// 取vkform分对象初始化信息
			if($vkform.attr('data-vkform-id')){
				vkform$ = vkForm$[$vkform.attr('data-vkform-id')] ;
			}else{
				vkform$ = $vkform.vkForm('init') ;
			}

			// 定义总数据类型
			if(parseInt(option$.get_type) === 1){
				data$.data = {} ;
			}else{
				data$.data = [] ;
			}
			
			$vfelem.each(function(){
				if(!$(this).attr('data-not-get')){    // 排除有不取数据标识的元素
					$vfele       = $(this) ;
					$elem        = $(this).find('input, select, textarea') ;
					name         = $elem.attr('name') ;
					type         = $elem.attr('type') ;
					data0$[name] = [] ;
					elem$        = {} ;

					//遍历元素下的表单对象取值
					$elem.each(function(){
						if(type === 'radio' || type === 'checkbox'){
							if($(this).attr('checked') === 'checked'){
								data0$[name].push($(this).val()) ;
		                    }
						}else if(type === 'select'){
							val_init = $(this).find('option.init').val() ;
                                                                  
		                    if($(this).val() && $(this).val() != val_init){
								data0$[name].push($(this).val()) ;
		                    }
						}else{
							value  = $(this).val() ;
							suffix = $(this).attr('data-input-suffix') ;

							if(value){
								if(suffix && value.substring(value.length - suffix.length, value.length) == suffix){
									data0$[name].push(value.substring(0, value.length - suffix.length)) ;
								}else{
									data0$[name].push(value) ;
								}
							}
						}
					}) ;

					elem$ = {} ;

					// 先通过校验（只需要校验data0$的数据），再整理收集数据
					// 数据校验（0:不校验；1:只校验必选项；2:校验全部选项包括可选项）
					if(data0$[name].length === 0){
						switch(parseInt(option$.check_null)){
							// 只校验必选项；非严格校验，必选项为空剔出，可选项跳过校验
							case 1 :
								if($(this).attr('data-elem-type') === 'required'){
									data$.status = false ;
									data$.info   = name ;

									error = true ;
									return false ;
								}
								break ;

							// 校验全部选项包括可选项：严格校验，所有元素值为空即剔出
							case 2 : 
								data$.status = false ;
								data$.info   = name ;

								error = true ;
								return false ;
								break ;
						}

						// 空值通过校验，收集数据
						if(option$.get_null){
							switch(parseInt(option$.get_type)){
								case 1 :
									if(!data$.data[name]){
										data$.data[name] = '' ;
									}
									break ;

								case 2 :
									if(!data$.data[name]){
										elem$[option$.alias_name]  = name ;
										elem$[option$.alias_value] = '' ;

									}
									data$.data.push(elem$) ;
									break ;

								case 3 :
									if(!data$.data[option$.alias_value]){
										elem$[option$.alias_value] = data0$[name] ;
										data$.data.push(elem$) ;
									}

									if(option$.key_list.length > 0){
										for(var k = 0; k < option$.key_list.length; k++){
							                elem$[option$.key_list[k]] = $elem.attr('data-' + option$.key_list[k]) ;
										}
									}
									data$.data.push(elem$) ;
									break ;
							}
						}
					}else{
	            		// 根据不同的取值方式收集数据
						switch(parseInt(option$.get_type)){
							case 1 :
								data$.data[name] = data0$[name].join(',') ;
								break ;

							// 把name和value以别名的方式顺序存储到数组结果里
							case 2 :
								for(var i = 0; i < data0$[name].length; i++){
									elem$ = {} ;
									elem$[option$.alias_name]  = name ;
									elem$[option$.alias_value] = data0$[name][i] ;
									data$.data.push(elem$) ;
								}
								break ;

							// 包含外部字段每个元素单独提出整理数据
							case 3 :
								elem$[option$.alias_value] = data0$[name] ;

								if(option$.key_list.length > 0){
									for(var k = 0; k < option$.key_list.length; k++){
						                elem$[option$.key_list[k]] = $vfele.attr('data-' + option$.key_list[k]) ;
									}
								}
								data$.data.push(elem$) ;
								break ;
						}
				 	}
				}
			}) ;

			// 如果以上都没有问题。。就可以输出汇总后的表单数据	
			if(error){
				return data$ ;
			}else{
				if(option$.get_type){
					data$.status = true ;
					data$.info   = vkform$ ;
					return data$ ;	
				}else{
					data$.status = true ;
					data$.info   = vkform$ ;
					data$.data   = data0$ ;
					return data$ ;
				}
			}
		},
	} ;

	// 定义命名空间vkForm直接调用方法
	$.fn.vkForm = function(method, data){
    	if (methods[method]) {  
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1)) ;

			}else if(typeof method === 'object' || !method) {  
				return methods.init.apply(this, arguments) ;  
			}else {  
				$.error('方法 ' +  method + ' 不存在！') ;  
		}
	}

	/*·*·*·*·*·*·*·*·*·*·*·*·*·* 事件处理 *·*·*·*·*·*·*·*·*·*·*·*·*·*/

    // 双击输入框清空内容
	$('input[type=text], textarea').live('dblclick', function(){
        $(this).attr('value', '') ;
	}) ;

    // 点击输入框如果有配置后缀属性（data-input-suffix）,去除输入值的后缀
	$('input[type=text], textarea').live('click', function(){
		var value  = $(this).val() ;
		var suffix = $(this).attr('data-input-suffix') ;

		if(value && suffix && value.substring(value.length - suffix.length, value.length) == suffix){
			$(this).attr('value', value.substring(0, value.length - suffix.length)) ;
		}
	}) ;

    // 离开输入框如果有配置后缀属性（data-input-suffix）,给输入值加上后缀
	$('input[type=text], textarea').live('blur', function(){
		var value  = $(this).val() ;
		var suffix = $(this).attr('data-input-suffix') ;

		if(value && suffix && value.substring(value.length - suffix.length, value.length) != suffix){
			$(this).attr('value', value + suffix) ;
		}
	}) ;

	// 打开select选项时隐藏init选项
	$('select').live('click', function(){
		if($(this).attr('data-vf-opt-init') == 'hide'){
			if($(this).find('option').not('option.init').length){
				$(this).find('option.init').hide() ;
			}
		}
	}) ;

	// select值变更时同步其对应的子元素选项
	$('select').live('change', function(){
		var sub = $(this).parents('.vf-elem').attr('data-vf-sub') ;

        if(sub){
            $('.vf-elem[data-vf-name=' + sub +']').attr('data-rep-para', $(this).val()).vkForm('replace') ;
        }
	}) ;

})(jQuery) ;
