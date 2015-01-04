/**
 * Name        : survey.index.js
 * Description : js for survey/index.html
 *
 * Create-time : 2012-9-26
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then('script/public.header.js')
.then(function($){  
    loadPlugin('vkData', 'jQCloud') ;  // 加载所需插件
})
.then(function($){

    /*
     * 页面总模型
     *
     **/
    $.Model('Survey.Index.Model', {
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

        get_data : function(data$){
            var trigger, 
                $this = this,
                api$  = $.extend({api:'search_survey'}, data$ || {}) ;

            // 访问问卷参与情况统计接口
            $.ajax({
                type    : 'post',
                url     : __API__, 
                data    : api$,
                success : function(data$){
                    if(data$.status){
                        console.dir(data$.data) ;
                        $this.data$ = data$.data ;    // 搜索数据
                        $this.trigger('list_more') ;
                    }else{
                        console.log('没有符合条件的数据。。') ;
                        $this.trigger('list_no') ;
                    }
                }
            });
        },
    }) ;

    /*
     * 页面总控制器
     *
     **/
    $.Controller('Survey.Index.Ctrl.Body', {
        defaults : {
            models$     : {}                 ,// 页面总模型
            $svListMain : $('.sv-list-main') ,// 搜索内容模块
        }
    }, {
        init : function(){
        	var $this = this ;

            this.element.find('.trade-hot .th-elem').each(function(){
                $(this).find('img').attr('src', __JMVC_IMG__ + 'svtrade/' + $(this).attr('data-code') + '.jpg') ;
            }) ;

            this.options.models$.get_data() ;
        },

        "{models$} list_more" : function(){
            this.survey_list(this.options.models$.data$) ;
        },

        // 问卷列表分页
        survey_list : function(data$){
            var $this = this,
                list$ = data$.list,
                next$ = data$.next,
                page  = data$.page ;

            for(var i = 0; i < list$.length; i++){
                if(parseInt(list$[i].user_photo)){
                    list$[i].user_photo = __JMVC_IMG__ + 'user/' + list$[i].user_code + '_60.jpg' ;
                }else{
                    list$[i].user_photo = __JMVC_IMG__ + 'user/user.jpg' ;
                }
            }

            // 题目状态列表栏生成
            $this.element.find('.sv-list-main').attr('data-page', page).append(
                __JMVC_VIEW__ + 'search.list.survey.ejs',  // 题目状态列表模板路径
                {data: list$}                              // 调用快速序列生成满足题目数量序列
            ) ;

            if(!next$.length){
                $this.element.find('.sv-list-more').hide() ;
            }
        },
    }) ;

    /*
     * 页面总控制器
     *
     **/
    $.Controller('Survey.Index.Ctrl.Main', {
        defaults : {
            models$    : {}              ,// 页面总模型
            $surveyBox : $('#surveyBox') ,// 调查内容模块
            $rewardBox : $('#rewardBox') ,// 积分专区模块
            $svRecomm  : $('.sv-recomm') ,// 推荐调查模块

        }
    }, {
        init : function(){
        	var $this = this ;

            // 新建模型实例并初始化
            this.options.models$ = new Survey.Index.Model({
            }) ;


            // 搜索结果清单展示模块控制器
            this.options.$surveyBox.survey_index_ctrl_body({
                models$ : this.options.models$,
                $Main   : this.element,
            }) ;

            $this.options.$rewardBox.find('.award-elem>img').each(function(){
                $(this).attr('src', __JMVC_IMG__ + 'prize/' + $(this).attr('data-img') + '.jpg') ;
            }) ;

            // 活跃用户显示初始化
            $this.element.find('.user-hot-elem').each(function(){
                if($(this).attr('data-photo')){
                    $(this).find('img').attr('src', __JMVC_IMG__ + 'user/' + $(this).attr('data-code') + '.jpg') ;
                }else{
                    $(this).find('img').attr('src', __JMVC_IMG__ + 'user/user.jpg') ;
                }
            }) ;

            $this.sv_recomm_init() ;
            $this.tag_hot() ;
            $('body').show() ;
        },

        ".sr-sub-elem hover" : function(el){
            var code = el.addClass('active').attr('data-sr') ;
            console.log(code) ;

            this.options.models$.sr_countdown = false ;

            this.element.find('.sr-main>a.svr').removeClass('active').filter('[data-sr=' + code + ']').addClass('active') ;
            this.element.find('.sr-sub-elem').not(el).removeClass('active') ;
        },

        ".sr-sub mouseout" : function(){
            this.options.models$.sr_countdown = true ;
        },

        sv_recomm_init : function($elem){
            var code,
                $this     = this,
                $svRecomm = $this.options.$svRecomm,
                $tpl      = $svRecomm.find('.sr-main>.tpl') ;

            $svRecomm.find('.sr-sub-elem').each(function(){
                code = $(this).attr('data-sr') ;
                $svRecomm.find(".sr-main").append(
                    $tpl.clone().removeClass('tpl').addClass('svr').attr('href', $(this).attr('href')).attr('data-sr', code)
                    .find('img').attr('src', __JMVC_IMG__ + 'survey/' + code + '.jpg').end()) ;
            }) ;

            this.element.find('.sr-main>.svr').first().addClass('active') ;
            this.element.find('.sr-sub>a').first().addClass('active') ;

            $this.options.models$.sr_countdown = true ;
            $this.sr_countdown() ;
        },

        sr_countdown : function(){
            var $img, $sub,
                $this = this ;

            // 倒计时处理（间隔0.5秒处理一次）
            var cd$ = setInterval(function(){
                if($this.options.models$.sr_countdown){
                    $img = $this.options.$svRecomm.find('a.active').first() ;
                    $sub = $this.options.$svRecomm.find('.sr-sub-elem.active').first() ;

                    $this.options.$svRecomm.find('a.svr').removeClass('active') ;
                    $this.options.$svRecomm.find('.sr-sub-elem').removeClass('active') ;

                    if($sub.next().size()){
                        $img.next().addClass('active') ;
                        $sub.next().addClass('active') ;
                    }else{
                        $this.options.$svRecomm.find('a.svr').first().addClass('active') ;
                        $this.options.$svRecomm.find('.sr-sub-elem').first().addClass('active') ;
                    }
                }
            }, 4000) ;
        },

        // 调查列表显示
        sv_elem_list : function($elem){
        	var type = $elem.find('.st-sub.active').attr('data-sv-type') ;

        	// 调查清单
            $.post(__API__, {api:'survey_type_list_select', type:$elem.find('.st-sub.active').attr('data-sv-type'), pnum:8},
                function(data$){
                    if(data$.status){
				        $.each(data$.data, function(mode, value){
				        	$elem.find('.sv-' + mode).append(
				                __JMVC_VIEW__ + 'survey.index.list.ejs',
				                {data:value}
				            ) ;
				        }) ;
                    }
                }
            ) ;

            // 图表分析
	        $elem.find('.stats-body').highcharts({
	        	credits : false,
	            chart: {
	                // plotBackgroundColor: null,
	                plotBorderWidth: null,
	                plotShadow: false,
	                spacingTop: 0,
	                spacingRight: 0,
	                spacingbottom: 0,
	                width        : 300     ,// 图表长度
	                height       : 300     ,// 图表宽度
	            	borderRadius : 0       ,// 无圆角

	            },
	            title: {
	                text: null,
	            },
	            tooltip: {
	                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
	            },
	            plotOptions: {
	                pie: {
	                    allowPointSelect: true,
	                    cursor: 'pointer',
	                    dataLabels: {
		                    enabled: true,
		                    format: '<b>{point.name}</b>',
		                    distance: 10,
	                    },
	                }
	            },
	            series: [{
	                type: 'pie',
	                name: 'Browser share',
	                data: [
	                    ['公益调查',   45.0],
	                    ['时事调查',   26.8],
	                    ['民意调查',   8.5],
	                    ['环保调查',   6.2],
	                    ['文体调查',   39.7]
	                ]
	            }]
	        });
        },

        // 调查小类切换
        ".st-sub click" : function(el){
        	if(!el.hasClass('active')){
        		var $elem = el.parents('.survey-elem') ;

        		el.parent().children().removeClass('active') ;
        		el.addClass('active') ;

        		$elem.find('.tab-pane').children().remove() ;
        		this.sv_elem_list($elem) ;
        	}
        },

        // 调查查询模式切换
        "li.sv-mode click" : function(el){
        	if(!el.hasClass('more') || !el.hasClass('active')){
        		el.parents('.survey-list').find('.sv-list-body').children().removeClass('active') ;
        		el.parents('.survey-list').find('.sv-list-body').children('.sv-' + el.attr('data-sv-mode')).addClass('active') ;
        	}
        },

        // 更多同类型调查
        "li.more click" : function(el){
        	var $header = el.parents('.sh-sub'),
        	    type    = $header.find('.st-sub.active').attr('data-sv-type'),
        	    mode    = $header.find('.sv-mode.active').attr('data-sv-mode') ;

            $.post(__API__, {api:'get_server_url', name:'survey/type'}, 
                function(data$){
                    if(data$.status){
                        window.location.href = data$.data + '?type=' + type + '&mode=' + mode ;
                    }
                }
            ) ;
        },

        // 热门标签
        tag_hot : function(){
            var cond, 
                tags$   = [],
                $this   = this ;

            // 访问问卷参与情况统计接口
            $.ajax({
                type    : 'post',
                url     : __API__, 
                data    : {api:'stats_tag_hot'},
                success : function(data$){
                    if(data$.status){
                        for(var i = 0; i < data$.data.length; i++){
                            var tag$ = {} ;

                            tag$.text      = data$.data[i].tag_name ;
                            tag$.weight    = parseInt(data$.data[i].cnt) / 2 ;
                            tag$.link      = {} ;
                            tag$.link.href = data$.data[i].url_tag ;

                            tags$.push(tag$) ;
                        }

                        $this.element.find('.tag-hot .ss-body').jQCloud(tags$) ;
                    }
                }
            });
        },
    }) ;

    $('#Main').survey_index_ctrl_main() ;
}) ;

