	/**
 * Name        : main.js
 * Description : js for Public/mainsearch.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){

    /*
     *  页面总控制器
     *
     **/
    $.Controller('Test.Main', {
        defaults : {
            models$         : {}                         ,//页面总模型
            $cavItemStat    : $('canvas.item-stat')      ,//问卷题目统计图表对象
            $cavActiveStat  : $('canvas.active-stat')    ,//问卷活动统计图表对象
            $itemAlysBtn    : $('#linkItemAnalyse')       //问卷发布设置模块
        }
    }, {
        init : function(){
			console.log('aaaa') ;

			this.require_init() ;
			this.chart_test1() ;
			this.chart_test2() ;
        }, 

        require_init : function(){
			require.config({
				baseUrl : __JMVC_PLUGIN__ , 
			    packages: [
			        {
			            name: 'echarts',
			            location: 'echarts/src',      
			            main: 'echarts'
			        },
			        {
			            name: 'zrender',
			            location: 'zrender/src',
			            main: 'zrender'
			        }
			    ]
			});
        },

        chart_test1 : function(){
			var $chart1 = $('#chart1')[0] ;

            var option1$ = {
                tooltip : {
                    trigger: 'axis'
                },
                legend: {
                    data:['蒸发量','降水量']
                },
                toolbox: {
                    show : false,
                    feature : {
                        mark : true,
                        dataView : {readOnly: false},
                        magicType:['line', 'bar'],
                        restore : true,
                        saveAsImage : true
                    }
                },
                calculable : true,
                xAxis : [
                    {
                        type : 'category',
                        data : ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
                    }
                ],
                yAxis : [
                    {
                        type : 'value',
                        splitArea : {show : true}
                    }
                ],
                series : [
                    {
                        name:'蒸发量',
                        type:'bar',
                        data:[2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3]
                    },
                    {
                        name:'降水量',
                        type:'bar',
                        data:[2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3]
                    }
                ]
            };

            this.echarts($chart1, option1$) ;
        },

        chart_test2 : function(){
			var $this = this ;

		    require(
			    [
			        'echarts'
			    ],
		        function(ec) {
					var $chart2 = $('#chart2')[0] ;

					var option2$ = {
					    tooltip : {
					        show: false,
					        formatter: "{a} <br/>{b} : {c} ({d}%)"
					    },
					    legend: {
					        orient : 'vertical',
					        x : 'left',
					        data:['直达','营销广告','搜索引擎','邮件营销','联盟广告','视频广告','百度','谷歌','必应','其他']
					    },
					    toolbox: {
					        show : false,
					        feature : {
					            mark : true,
					            dataView : {readOnly: false},
					            restore : true,
					            saveAsImage : true
					        }
					    },
					    calculable : true,
					    series : [
					        {
					            name:'访问来源',
					            type:'pie',
					            center : [300, 200],
					            radius : 80,
					            itemStyle : {
					                normal : {
					                    label : {
					                        position : 'inner',
					                        formatter : function(a,b,c,d) {return (d - 0).toFixed(0) + ' %'},
					                    },
					                    labelLine : {
					                        show : false
					                    }
					                }
					            },
					            data:[
					                {value:335, name:'直达'},
					                {value:679, name:'营销广告'},
					                {
					                    value:1548,
					                    name:'搜索引擎',
					                    itemStyle : {
					                        normal : {
					                            label : {
					                                show : false
					                            }
					                        },
					                        emphasis : {
					                            label : {
					                                show : true,
					                                formatter : "{b} : {d}%",
					                                position : 'inner'
					                            }
					                        }
					                    }
					                }
					            ]
					        },
					        {
					            name:'访问来源',
					            type:'pie',
					            center : [300, 200],
					            radius : [110, 140],
					            data:[
					                {value:335, name:'haha'},
					                {value:310, name:'邮件营销'},
					                {value:234, name:'联盟广告'},
					                {value:135, name:'视频广告'},
					                {
					                    value:1048,
					                    name:'百度',
					                    itemStyle : {
					                        normal : {
					                            color : (function(){
					                                var zrColor = require('zrender/tool/color');
					                                return zrColor.getRadialGradient(
					                                    300, 200, 110, 300, 200, 140,
					                                    [[0, 'rgba(255,255,0,1)'],[1, 'rgba(30,144,250,1)']]
					                                )
					                            })(),
					                            label : {
					                                textStyle : {
					                                    color : 'rgba(30,144,255,0.8)',
					                                    align : 'center',
					                                    baseline : 'middle',
					                                    fontFamily : '微软雅黑',
					                                    fontSize : 30,
					                                    fontWeight : 'bolder'
					                                }
					                            },
					                            labelLine : {
					                                length : 80,
					                                lineStyle : {
					                                    color : '#f0f',
					                                    width : 3,
					                                    type : 'dotted'
					                                }
					                            }
					                        }
					                    }
					                },
					                {value:251, name:'谷歌'},
					                {
					                    value:102,
					                    name:'必应',
					                    itemStyle : {
					                        normal : {
					                            label : {
					                                show : false
					                            },
					                            labelLine : {
					                                show : false
					                            }
					                        },
					                        emphasis : {
					                            label : {
					                                show : true
					                            },
					                            labelLine : {
					                                show : true,
					                                length : 180
					                            }
					                        }
					                    }
					                },
					                {value:147, name:'其他'}
					            ]
					        },
					        {
					            name:'访问来源',
					            type:'pie',
					            startAngle: 90,
					            center : [650, 200],
					            radius : [80, 120],
					            itemStyle :　{
					                normal : {
					                    label : {
					                        show : false
					                    },
					                    labelLine : {
					                        show : false
					                    }
					                },
					                emphasis : {
					                    color: (function(){
					                        var zrColor = require('zrender/tool/color');
					                        return zrColor.getRadialGradient(
					                            650, 200, 80, 650, 200, 120,
					                            [[0, 'rgba(255,255,0,1)'],[1, 'rgba(255,0,0,1)']]
					                        )
					                    })(),
					                    label : {
					                        show : true,
					                        position : 'center',
					                        formatter : "{d}%",
					                        textStyle : {
					                            color : 'red',
					                            fontSize : '30',
					                            fontFamily : '微软雅黑',
					                            fontWeight : 'bold'
					                        }
					                    }
					                }
					            },
					            data:[
					                {value:335, name:'haha'},
					                {value:310, name:'邮件营销'},
					                {value:234, name:'联盟广告'},
					                {value:135, name:'视频广告'},
					                {value:1548, name:'搜索引擎'}
					            ]
					        }
					    ]
					};

	            	$this.echarts($chart2, option2$) ;
		        }
		    );
        },

        echarts : function($chart, option$){
			var chart ;
			var chart_type = option$.series[0].type ;


	    	require(
			    [
			        'echarts',
			        // 'echarts/chart/line',
			        // 'echarts/chart/bar',
			        // 'echarts/chart/scatter',
			        // 'echarts/chart/k',
			        // 'echarts/chart/pie',
			        // 'echarts/chart/map',
			        // 'echarts/chart/force'
			        'echarts/chart/' + chart_type
			    ],
		        function(ec) {
		            chart = ec.init($chart);
		            chart.setOption(option$);
	        	}
	        ) ;
        }
    }) ;

    $('#main').test_main() ;

}) ;
