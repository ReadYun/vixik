/**
 * Name        : survey.analyse.model.js
 * Description : js for survey/analyse.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){

    /*
     * 页面总模型
     *
     **/
    $.Model('Survey.Analyse.Model', {
        defaults : {
            user_code   : 0   ,// 用户编码
            survey_code : 0   ,// 调查编码
            dataAction$ : {}  ,// 参与调查用户统计数据
            dataArea$   : {}  ,// 用户来源统计数据
        }
    }, {
        init : function(){
            var $this       = this,
                user_code   = $this.user_code,
                survey_code = $this.survey_code ;

            if(parseInt(survey_code) > 10000000){
                // 取调查基本数据：调查基本信息查询接口
                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api:'survey_info_find', survey_code:survey_code},
                    success : function(data$){
                        if(data$.status){
                            $this.survey$ = data$.data ;
                            $this.trigger('sv_info') ;

                            // // 针对当前的调查状态做处理
                            // $this.survey_state($this.options.survey$.survey_state) ;
                        }
                    }
                });

                // 调查趋势统计
                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api:'stats_sv_trend', survey_code:survey_code},   
                    success : function(data$){
                        if(data$.status){
                            $this.svsTrend$ = data$.data ;
                            $this.trigger('svs_trend') ;
                        }else{
                            console.log('无数据：调查趋势统计') ;
                        }
                    }
                });

                // 访问调查参与情况分组统计接口
                $.ajax({
                    type    : 'post',
                    url     : __API__, 
                    data    : {api:'stats_sv_group_cnt', survey_code:survey_code},
                    success : function(data$){
                        if(data$.status){
                            $this.svsUser$ = data$.data ;
                            $this.trigger('svs_user') ;      
                        }else{
                            console.log('无数据：调查参与情况分组统计') ;
                        }
                    }
                });

                // 访问调查题目参与详情分组统计接口
                $.ajax({
                    type    : 'post',
                    url     : __API__, 
                    data    : { api         : 'stats_qt_group_prop', 
                                survey_code : survey_code, 
                                prop        : $.toJSON(['user_sex', 'user_age', 'user_career', 'user_edu'])
                              },    
                    success : function(data$){
                        if(data$.status){   
                            $this.question$ = arrayFilter(data$.data, 'question_code') ;
                            $this.trigger('stats_qt_group_prop') ;   
                        }else{
                            console.log('无数据：调查题目参与详情分组统计') ;
                        }
                    }
                });

                // 访问调查主观题参与信息接口
                $.ajax({
                    type    : 'post',
                    url     : __API__, 
                    data    : {api:'text_content', survey_code:survey_code,},
                    success : function(data$){
                        if(data$.status){   
                            $this.textarea$ = data$.data ;
                            $this.trigger('textarea') ;
                        }
                    }
                });
            }
        },

        // 手动触发模型更新事件
        trigger : function(prop){    
            eval("this.attr('" + prop + "', Math.random())") ;
        },

        survey_list : function(user_code){
            var $this = this ;
            // 取调查基本数据：访问调查基本信息查询接口
            if(user_code > 0){
                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api:'survey_action_list_select', user_code:user_code},
                    success : function(data$){
                        if(data$.status){
                            $this.list$ = data$.data ;
                            $this.trigger('sv_list') ;
                        }
                    }
                });
            }else{
                $this.list$ = '' ;
                $this.trigger('sv_list') ;
            }
        },

        // 转换数据为highchart图表库需要的格式
        data_format_hchart : function(srcData$, title, option){
            var seriesElem$,
                categories$ = [],
                series$     = [],
                hcOption$   = {} ;

            if(option == 0){
                // 所有选项分析
                $.each(srcData$, function(key, value$){
                    seriesElem$      = {} ;
                    seriesElem$.name = key ;
                    seriesElem$.data = [] ;

                    $.each(value$, function(k, v){
                        categories$.push(k) ;
                        seriesElem$.data.push(v) ;
                    }) ;

                    series$.push(seriesElem$) ;
                }) ;

                hcOption$ = {
                    chart : {
                        type : 'bar'  ,// 图表类型
                        width: 720    ,// 图表宽度
                    },
                    title : {
                        text : title
                    },
                    xAxis : {
                        categories : categories$,
                        labels : {
                            style : {
                                fontFamily: '微软雅黑',  // X轴字体样式

                            },
                        },

                    },
                    yAxis : {
                        min : 0,
                        title : {
                            text : ' ',  // 留出一个空位可以让标题占据一个有效行，正好分隔了Y轴和下面的图示内容
                        }
                    },
                    legend : {
                        backgroundColor : '#FFFFFF',
                        reversed        : true
                    },
                    plotOptions : {
                        series : {
                            stacking   : 'normal',
                            pointWidth : '40'
                        }
                    },
                    series : series$
                } ;
            }else{
                // 单独选项分析
                $.each(srcData$, function(key, value$){
                    seriesElem$ = [] ;
                    seriesElem$.push(key) ;

                    if(srcData$[key][option] == undefined){
                        seriesElem$.push(0) ;
                    }else{
                        seriesElem$.push(srcData$[key][option]) ;
                    }
                    series$.push(seriesElem$) ;
                }) ;

                hcOption$ = {
                    chart : {
                        plotBackgroundColor : null,
                        plotBorderWidth     : null,
                        plotShadow          : false
                    },
                    title : {
                        text : option
                    },
                    tooltip : {
                        pointFormat : '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions : {
                        pie : {
                            allowPointSelect : true,
                            cursor           : 'pointer',
                            dataLabels       : {
                                enabled        : true,
                                color          : '#666',
                                connectorColor : '#666',
                                format         : '<b>{point.name}</b>: {point.percentage:.1f} %',
                                style : {
                                    fontSize   : 14          ,// 字体大小
                                    fontFamily : '微软雅黑'  ,// 字体样式
                                }

                            }
                        }
                    },
                    series : [{
                        type : 'pie',
                        name : '属性占比',
                        data : series$
                    }]
                } ;
            }
            return hcOption$ ;
        }
    }) ;
}) ;


