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
    loadPlugin('vkHighChart', 'vkData', 'iCheck', 'vkForm', 'vkPaging') ;  // 加载所需插件
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
        	this.chart() ;
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

        chart : function(){
        	this.chart$ = {
		        chart: {
		            plotBackgroundColor: null,
		            plotBorderWidth: 0,
		            plotShadow: false,
		        },
		        title: {
		            text: null,
		        },
		        tooltip: {
		            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		        },
		        plotOptions: {
		            pie: {
		                dataLabels: {
		                    // enabled: true,
		                    distance: -40,
		                    style: {
		                        fontWeight: 'bold',
		                        color: '#666',
		                        padding: 110,
		                    }
		                },
		                // center: ['50%', '55%']
		            }
		        },
		        series: [{
		            type: 'pie',
		            name: 'Browser share',
		            innerSize: '50%',
		            data: [
		                ['公益调查', 45.0],
		                ['民意调查', 26.8],
		                ['环保调查', 12.8],
		                ['时事调查', 8.5],
		                ['文体调查', 6.2],
		            ]
		        }]
        	} ;
        },

        publish_data : function(){
        	var model$ = this ;
        	var date = moment().add('d', -31) ;
        	var date$ = [] , data$ = [] , i ;

        	// 生成最近31天日期数组
        	while(date.format('MM-DD') != moment().format('MM-DD')){
        		date$.push(date.format('MM-DD')) ;
        		date = date.add('d', 1) ;
        	}

        	data$ = model$.random_array(31, 50, 200) ;

        	model$.publish$ = {
	            chart: {
	                type         : 'area'  ,// 图表类型
	                width        : 450     ,// 图表长度
	                height       : 250     ,// 图表宽度
	            	marginRight  : 20      ,// 右边距
	            	borderRadius : 0       ,// 无圆角
	            },
	            title: {
	                text: ''
	            },
	            subtitle: {
	                text: '最近一个月发布调查活动数量统计'
	            },
	            xAxis: {
	                categories : date$ ,
	                tickInterval : 6
	            },
	            yAxis: {
	                title: {
	                    text: ''
	                },
	                labels: {
	                    formatter: function() {
	                        return this.value ;
	                    }
	                }
	            },
	            tooltip: {
	                pointFormat: '<b style="color:yellow">{point.y:,.0f}</b> 个调查活动发布'
	            },
	            plotOptions: {
	                area: {
	                    marker: {
	                        enabled: true,
	                        symbol: 'circle',
	                        radius: 2,
	                        states: {
	                            hover: {
	                                enabled: true
	                            }
	                        }
	                    }
	                }
	            },
	            series: [{
	                name: '问卷调查',
	                data: data$
	            	}]
	        } ;
        },
    }) ;

    /*
     *  页面总控制器
     *
     **/
    $.Controller('Survey.Index.Ctrl.Main', {
        defaults : {
            models$     : {}                ,// 页面总模型
        }
    }, {
        init : function(){
        	var $this = this ;

            // 新建模型实例并初始化
            this.options.models$ = new Survey.Index.Model({    
            }) ;

            // 各调查大类分别初始化
            this.element.find('.survey-elem').each(function(){
	        	$(this).find('.st-sub').first().addClass('active') ;
	        	$(this).find('.sv-list-body').children().first().addClass('active') ;
				$this.sv_elem_list($(this)) ;

				$()
            }) ;
        },

        sv_elem_chart : function($elem){
        	
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

        // 监控搜索框输入并且回车提交搜索请求
        "{$mainSearch} keydown" : function(el, ev){
            var type = 'survey' ;

            if(ev.keyCode == 13 && el.val()){
                $.post(
                    __API_SEARCH_GO__, 
                    {type:type,words:el.val()},function(url){
                        window.location.href = url ;
                    }
                ) ;
            }
        },
    }) ;

    $('#Main').survey_index_ctrl_main() ;
}) ;

