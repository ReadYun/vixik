/*
 * @Document    : index.js
 * @Description : js for Index/index.html
 *
 * @Created on  : 2012-20-20
 * @Author      : ReadYun
 * @Copyright   : VixiK
 */

steal('init.js')
.then('script/public.header.js')
.then(function($){  
    loadPlugin('vkHighChart') ;  // 加载所需插件
})
.then(function($){

    /*
     * 页面总模型
     *
     **/
    $.Model('Home.Index.Model', {
        defaults : {
            dataAction$ : {}  ,// 参与调查用户统计数据
            dataArea$   : {}   // 用户来源统计数据
        }
    }, {
        init : function(){
        	this.publish_data() ;
        	this.partake_data() ;

        	//  console.log(this.random_array(31, 200)) ;
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

        publish_data : function(){
        	var date$  = [] , 
        	    model$ = this,
        	    date   = moment().add('d', -31) ;

        	// 生成最近31天日期数组
        	while(date.format('MM-DD') != moment().format('MM-DD')){
        		date$.push(date.format('MM-DD')) ;
        		date = date.add('d', 1) ;
        	}

        	data$ = model$.random_array(31, 50, 350) ;

        	model$.publish$ = {
	            chart: {
	                type         : 'area'  ,// 图表类型
	                width        : 450     ,// 图表长度
	                height       : 300     ,// 图表宽度
	            	marginRight  : 20      ,// 右边距
	            	borderRadius : 0       ,// 无圆角
	            },
	            title: {
	                text: ''
	            },
	            subtitle: {
	                text  : '最近一个月发布调查活动数量统计',
	                style : {fontSize:'19px', color:'#666'},
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
	                name: '调查调查',
	                data: data$
	            	}]
	        } ;
        },

        partake_data : function(){
        	var date$  = [], 
        	    data$  = [],
        	    model$ = this,
        	    date   = moment().add('d', -31) ;

        	// 生成最近31天日期数组
        	while(date.format('MM-DD') != moment().format('MM-DD')){
        		date$.push(date.format('MM-DD')) ;
        		date = date.add('d', 1) ;
        	}

        	for(var i = 0; i < 5; i++){
        		data$.push(model$.random_array(31, 600, 300)) ;
        	}

        	model$.partake$ = {
	            chart: {
	                type         : 'area'  ,// 图表类型
	                width        : 450     ,// 图表宽度
	                height       : 300     ,// 图表高度
	            	marginRight  : 20      ,// 右边距
	            	borderRadius : 0       ,// 无圆角

	            },
	            title: {
	                text: ''
	            },
	            subtitle: {
	                text  : '最近一个月参与调查活动用户统计',
	                style : {fontSize:'19px', color:'#666'},
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
	                shared: true
	            },
	            plotOptions: {
	                area: {
	                    stacking: 'normal',
	                    lineColor: '#FFF',
	                    lineWidth: 0.3,
	                    marker: {
	                    	enabled: false,
	                        lineWidth: 0.3,
	                        lineColor: '#FFF'
	                    }
	                }
	            },
	            series: [
	            	{
		                name: '工人',
		                data: data$[0]
	            	}, 
	            	{
		                name: '农民',
		                data: data$[1]
		            }, 
		            {
		                name: '地主',
		                data: data$[2]
		            }, 
		            {
		                name: '学生',
		                data: data$[3]
		            }, 
		            {
		                name: '工程师',
		                data: data$[4]
	            	}]
        	}
        }
    }) ;


    /*
     *  调查类型控制器
     *
     **/
    $.Controller('Home.Index.Ctrl.St', {
        defaults : {
            models$    : {}               ,// 页面总模型
            $actionBox : $('#actionBox')  ,// 调查行动模块
        }
    }, {
        init : function(){
        	var type$, stats$, elem$, cnt,
        		$this = this,
        		cnt = 0 ;

				browserData  = [],
				versionsData = [],   	

        		typeData$    = [],
		        typeSubData$ = [],
		        colors       = Highcharts.getOptions().colors ;

            $.post(__API__, {api:'stats_survey_type_cnt', action:'publish'}, 
                function(data$){
                	// stats$ = data$.data.publish ;
                	stats$ = data$.data ;  // 先用造的数据来整

		            $.post(__API__, {api:'det_data_select', table:'survey_type', condition:'1=1'}, 
		                function(data$){
	                    	type$ = data$.data ;

	                    	// 数据处理
	                    	for(var t = 0; t < type$.length; t++){
	                    		elem$ = {
	                    			y     : 0,
	                    			color : colors[t],
	                    			drilldown : {
						                categories : [],
						                data       : [],
						                color      : colors[t]
	                    			}
	                    		} ;

	                    		for(var s = 0; s < stats$.length; s++){
	                    			if(stats$[s].survey_type_code == type$[t].survey_type_code){
										cnt    += parseInt(stats$[s].cnt) ;
										elem$.y = parseInt(elem$.y) + parseInt(stats$[s].cnt) ;

	                    				elem$.drilldown.categories.push(stats$[s].survey_type_sub_name) ;
	                    				elem$.drilldown.data.push(parseInt(stats$[s].cnt)) ;
	                    			}
	                    		}

	                    		for(var e = 0; e < elem$.drilldown.data.length; e++){
						            typeSubData$.push({
						                name  : elem$.drilldown.categories[e],
						                y     : elem$.drilldown.data[e],
						                rate  : ((elem$.drilldown.data[e] / elem$.y) * 100).toFixed(2),
						                color : Highcharts.Color(elem$.color).brighten(0.2 - (e / elem$.drilldown.data.length) / 5).get()
						            });
	                    		}

	                    		typeData$.push({
	                    			name  : type$[t].survey_type_name,
	                    			y     : elem$.y,
	                    			rate  : ((elem$.y / cnt) * 100).toFixed(2),
	                    			color : elem$.color
	                    		}) ;
	                    	}

	                    	for(var t = 0; t < typeData$.length; t++){
	                    		typeData$[t].rate = ((typeData$[t].y / cnt) * 100).toFixed(2) ;
	                    	}

	                    	// 图表生成
				        	$this.element.find('.sv-type-chart').vkHighChart(
				        		{
							        chart: {
							            type: 'pie',
	            						borderRadius : 0       ,// 无圆角
							        },
							        title: {
							            text  : '丰富多样的调查类型，总有一款适合你',
							            style : {fontSize:'29px', color:'#666'},
							        },
							        yAxis: {
							            title: {
							                text: 'Total percent market share'
							            }
							        },
							        plotOptions: {
							            pie: {
							                shadow: false,
							                center: ['50%', '50%'],
							            }
							        },
							        tooltip: {
							            valueSuffix: ''
							        },
							        series: [{
							            name: '已发布调查',
							            data: typeData$,
							            size: '60%',
							            dataLabels: {
							                formatter: function () {
							                    return this.y > 5 ? this.point.name + '<br />' + this.point.rate + '%' : null ;
							                },
							                color: '#333',
							                distance: -30,
							            	style : {fontFamily: '微软雅黑', fontSize: '12px'},
							            }
							        }, {
							            name: '已发布调查',
							            data: typeSubData$,
							            size: '80%',
							            innerSize: '60%',
							            dataLabels: {
							                formatter: function () {
							                    // display only if larger than 1
							                    return this.y > 1 ? '<b>' + this.point.name + ':</b> ' + this.point.rate + '%': null ;
							                },
							                color: '#666'
							            }
							        }]
				        		},
				        		[{credits : {enabled : false}}]
				        	) ;
		                }
		            ) ;
                }
            ) ;
        },
    }) ;

    /*
     * 调查行动控制器
     *
     **/
    $.Controller('Home.Index.Ctrl.Action', {
        defaults : {
            models$    : {}               ,// 页面总模型
            $actionBox : $('#actionBox')  ,// 调查行动模块
        }
    }, {
        init : function(){
        	this.highchart() ;
        },

        highchart : function(){
        	var data$, model, eval_str,
        	    $this = this ;

        	var theme$ = {
	            // 图表颜色方案
	            //  colors : ['#3399FF','#FF7F50','#87CEFA','#DA70D6','#32CD32','#FFD700','#33A6F2','#CC6633','#3CB371','#FF00FF','#FFF263'],

	            // 名片设置
	            credits : {
	                enabled : false
	            }
        	}

			this.element.find('.highchart').each(function(){
				model    = $(this).attr('data-model') ;
				eval_str = 'data$ = $this.options.models$.' + model ;
				eval(eval_str) ;

				$(this).vkHighChart(data$) ;
				// $(this).vkHighChart(data$, ['gray', theme$]) ;
			}) ;
        }, 

        "button click" : function(el){
        	window.location.href = el.attr('href') ;
        }
    }) ;

    /*
     *  页面总控制器
     *
     **/
    $.Controller('Home.Index.Ctrl.Main', {
        defaults : {
            models$     : {}                ,// 页面总模型
            $mainSearch : $('#mainSearch')  ,// 主搜索栏
            $actionBox  : $('#actionBox')   ,// 调查行动模块
            $surveyType : $('#surveyType')  ,// 调查类型模块
        }
    }, {
        init : function(){
        	this.options.$mainSearch.val('') ;

            // 新建模型实例并初始化
            this.options.models$ = new Home.Index.Model({    
            }) ;

            // 调查行动模块控制器
            this.options.$actionBox.home_index_ctrl_action({
                models$ : this.options.models$
            }) ;

            // 调查类型模块控制器
            this.options.$surveyType.home_index_ctrl_st({
                models$ : this.options.models$
            }) ;
            
            this.element.addClass('active') ;
        },

        "{$liAllStats} click" : function(){
            this.element.find('div.tab-pane').addClass('active') ;
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

    $('#Main').home_index_ctrl_main() ;
}) ;