/**
 * Name        : survey.type.js
 * Description : js for survey/type.html
 *
 * Create-time : 2012-9-26
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then('script/public.header.js')
.then(function($){  
    loadPlugin('vkHighChart', 'vkData', 'iCheck', 'vkForm', 'vkPaging') ;  // 加载所需插件
})
.then(function($){

    /*
     * 页面总模型
     *
     **/
    $.Model('Survey.Type.Model', {
        defaults : {
            dataAction$ : {}  ,// 参与问卷用户统计数据
            dataArea$   : {}   // 用户来源统计数据
        }
    }, {
        init : function(){
        },

        // 手动触发模型更新事件
        trigger : function(prop){    
            eval("this.attr('" + prop + "', Math.random())") ;
        },
		
		// 生成一定范围内随机数
        random_array : function(num, value_bas, value_ext){
        	var data$ = [] ;

        	// 生成31个一定范围内随机数
        	for(i = 0; i < num; i++){
        		data$.push(value_bas + Math.ceil(Math.random() * value_ext + Math.random() * value_ext)) ;
        	}

        	return data$ ;
        },
    }) ;

    /*
     * 调查列表模块控制器
     *
     **/
    $.Controller('Survey.Type.Ctrl.List', {
        defaults : {
            models$ : {}                       ,// 页面总模型
            $button : $('button.survey-more')  ,// 加载更多调查按钮
        }
    }, {
        init : function(){
            this.survey_list() ;
        },

        // 调查列表加载
        survey_list : function(){
        	var $this = this,
        	    $body = $('#surveyList .sv-list-body') ;
        	    page  = parseInt($body.children().size() / 10) + 1 ;  // 计算页数

        	$this.options.$button.text('更多调查加载中...') ;

            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : {api:'survey_type_list_select', type:$this.options.models$.sv_type, mode:$this.options.models$.sv_mode, page:page},
                async   : false,
                success : function(data$){
                	if(data$.status){
			            $body.append(
			                __JMVC_VIEW__ + 'survey.type.list.ejs',
			                {data:data$.data[$this.options.models$.sv_mode]}
			            ) ;

			            if(data$.data.length == 10){
			            	$this.options.$button.text('更多调查') ;
			            }else{
                			$this.options.$button.text('已列出所有调查').addClass('disabled') ;
			            }
                	}else if(page == 1){
                			$this.options.$button.text('无此类型调查').addClass('disabled') ;
                	}else{
                		$this.options.$button.text('已列出所有调查').addClass('disabled') ;
                	}
                }
            });
        },

        // 点击加载更多调查按钮
        "{$button} click" : function(el){
        	if(!el.hasClass('disabled')){
            	this.survey_list() ;
        	}
        },
    }) ;

    /*
     * 页面总控制器
     *
     **/
    $.Controller('Survey.Type.Ctrl.Main', {
        defaults : {
            models$     : {}                ,// 页面总模型
            $rankBox    : $('#rankBox')     ,// 活跃用户模块
            $surveyList : $('#surveyList')  ,// 调查列表

        }
    }, {
        init : function(){
            // 新建模型实例并初始化
            this.options.models$ = new Survey.Type.Model({
	            sv_type : this.element.attr('data-type') ,// 调查类型
	            sv_mode : this.element.attr('data-mode') ,// 查询模式
            }) ;

            // 调查列表模块控制器
            this.options.$surveyList.survey_type_ctrl_list({    
                models$ : this.options.models$,
                $main   : this.element,
            }) ;

            // 调查类型和模式显示定位
            this.element.find(".st-sub[data-type='" + this.options.models$.sv_type + "']").addClass('active') ;
            this.element.find(".sv-mode[data-mode='" + this.options.models$.sv_mode + "']").addClass('active') ;

            // 活跃用户排行榜显示初始化
            this.options.$rankBox.find('.rank-elem').each(function(){
                if($(this).attr('data-photo')){
                    $(this).find('img').attr('src', __JMVC_IMG__ + 'user/' + $(this).attr('data-code') + '.jpg') ;
                }else if($(this).attr('data-photo')){
                    $(this).find('img').attr('src', __JMVC_IMG__ + 'user/man.png') ;
                }else{
                    $(this).find('img').attr('src', __JMVC_IMG__ + 'user/woman.png') ;
                }
            }) ;
        },

        // 切换调查类型
        ".switch-type-ele click" : function(el){
            $.post(__API__, {api:'get_server_url', name:'survey/type'}, 
                function(data$){
                    if(data$.status){
                        window.location.href = data$.data + '?type=' + el.attr('data-type') ;
                    }
                }
            ) ;
        },

        // 切换调查类型
        ".st-sub click" : function(el){
            if(!el.hasClass('active')){
                var type = el.attr('data-type'),
                    mode = this.element.find('.sv-mode.active').attr('data-mode') ;

                $.post(__API__, {api:'get_server_url', name:'survey/type'}, 
                    function(data$){
                        if(data$.status){
                            window.location.href = data$.data + '?type=' + type + '&mode=' + mode ;
                        }
                    }
                ) ;
            }
        },

        // 切换调查模式
        ".sv-mode click" : function(el){
            if(!el.hasClass('active')){
                var mode = el.attr('data-mode'),
                    type = this.element.find('.st-sub.active').attr('data-type') ;

                $.post(__API__, {api:'get_server_url', name:'survey/type'}, 
                    function(data$){
                        if(data$.status){
                            window.location.href = data$.data + '?type=' + type + '&mode=' + mode ;
                        }
                    }
                ) ;
            }
        },

        // 切换调查模式
        ".action-now>button click" : function(el){
            var str,
                type = this.element.find('.st-sub.active').attr('data-type') ;

            switch(type.length){
                case 4 :
                    str = '?type=' + type ;
                    break ;
                case 5 :
                    str = '?type=' + this.element.find('.st-sub.all').attr('data-type') + '&typesub=' + type ;
                    break ;
            }

            $.post(__API__, {api:'get_server_url', name:'survey/' + el.attr('data-action')}, 
                function(data$){
                    if(data$.status){
                        window.location.href = data$.data + str ;
                    }
                }
            ) ;
        },
    }) ;

    $('#Main').survey_type_ctrl_main() ;
}) ;

