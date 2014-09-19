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
            survey$     : {}  ,// 调查总信息
            dataAction$ : {}  ,// 参与调查用户统计数据
            dataArea$   : {}  ,// 用户来源统计数据
        }
    }, {
        init : function(){
            var models$     = this,
                user_code   = models$.user_code,
                survey_code = models$.survey_code ;

            // 取调查基本数据：访问调查基本信息查询接口
            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : {api:'survey_info_find', survey_code:survey_code},
                async   : false,
                success : function(data$){
                    if(data$.status){
                        models$.survey$ = data$.data ;
                    }
                }
            });

            // 取调查统计数据：调查参与情况统计接口
            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : {api:'stats_sv_action_cnt', survey_code:survey_code},   
                async   : false,   
                success : function(data$){
                    if(data$.status){
                        models$.dataAction$.data = data$.data ;    // 调查参与数据 
                        models$.chart_action(models$.dataAction$.data) ;    // 转换图表参数数据

                        models$.dataAction$.user_sum = arrayKeySum(models$.dataAction$.data, 'count') ;
                        models$.dataAction$.date_cnt = arrayKeyCount(models$.dataAction$.data, 'date', 'distinct') ;
                        models$.dataAction$.user_ave = parseInt(models$.dataAction$.user_sum / models$.dataAction$.date_cnt) ;
                    }else{
                        console.log('无数据：调查参与情况统计') ;
                    }
                }
            });

            // 访问调查参与情况分组统计接口
            $.ajax({
                type    : 'post',
                url     : __API__, 
                data    : {api:'stats_sv_group_cnt', survey_code:survey_code, condition:$.toJSON(['user_sex','area_province'])},   
                async   : false,   
                success : function(data$){
                    if(data$.status){
                        models$.dataArea$.data = data$.data ;    // 调查参与数据 

                        var data_sex  = arrayFilter(models$.dataArea$.data, 'user_sex') ;
                        var map$      = {area_province:"name",count:"value"} ;
                        var data_sex$ = {} ;

                        // 按照配置Map重新映射data_sex数据
                        $.each(data_sex, function(key, value){
                            data_sex$[key] = [] ;
                            for(i = 0; i < data_sex[key].length; i++){
                                data_sex$[key][i] = arrayShine(data_sex[key][i], map$) ;
                            }
                        }) ;

                        // 统计需要的各种值
                        models$.dataArea$.area_cnt$  = arrayKeySumGroup(models$.dataArea$.data, 'area_province', 'count') ;  // 按地域统计参与用户数
                        models$.dataArea$.max_cnt$   = arrayMaxObj(models$.dataArea$.area_cnt$) ;  // 最多参与用户地域数据对象
                        models$.dataArea$.male_cnt   = arrayKeySum(data_sex$['男'], 'value') ;     // 男性参与用户数
                        models$.dataArea$.female_cnt = arrayKeySum(data_sex$['女'], 'value') ;     // 女性参与用户数

                        // 转换图表参数数据
                        models$.chart_area(data_sex$) ;       
                    }else{
                        console.log('无数据：调查参与情况分组统计') ;
                    }
                }
            });

            // 访问调查题目参与详情分组统计接口
            $.ajax({
                type    : 'post',
                url     : __API__, 
                data    : {api:'stats_qt_group_cnt', survey_code:survey_code, condition:$.toJSON(['user_sex','user_career','user_edu'])},    
                async   : true,   
                success : function(data$){
                    if(data$.status){   
                        models$.question$ = arrayFilter(data$.data, 'question_code') ;
                        models$.trigger('flag_question') ;   
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
                async   : true,   
                success : function(data$){
                    if(data$.status){   
                        models$.textarea$ = data$.data ;
                        models$.trigger('flag_textarea') ;
                    }
                }
            });
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
                    data    : {api:'survey_list_select', user_code:user_code},
                    async   : false,
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
        
        chart_action : function(srcData$){
            var data$,
                $this = this,
                $Def  = $.Deferred() ;

            var wait = function($Def){
                data$ = arrayTrans(srcData$) ;   // 对后台数据库取出的结果进行键值类型转换

                $this.dataAction$.chartAction$ = {
                    tooltip : {
                        trigger: 'axis'
                    },
                    toolbox: {
                        show : false,
                        x : 'right',
                        y : 'bottom',
                        feature : {
                            restore : true
                        }
                    },
                    xAxis : [
                        {
                            type : 'category',
                            data : data$.date
                        }
                    ],
                    yAxis : [
                        {
                            type : 'value',
                            axisLabel : {
                                formatter: '{value}'
                            }
                        }
                    ],
                    series : [
                        {
                            name: '参与人数',
                            type: 'bar',
                            barWidth : 20,
                            data: data$.count
                        }
                    ]
                };

                $Def.resolve() ;
                return $Def ;
            }

            $.when(wait($Def)).then(function(){
                $this.trigger('flag_action') ;                
            }) ;

        }, 

        chart_area : function(srcData$){
            var data_nan$   = srcData$['男'],
                data_nv$    = srcData$['女'],
                max_val_nan = parseInt(arrayMaxVal(arrayTrans(data_nan$).value)),
                max_val_nv  = parseInt(arrayMaxVal(arrayTrans(data_nv$).value)),
                max_val     = parseInt((max_val_nan + max_val_nv) * 1.2) ;

            this.dataArea$.chartArea$ = {
                tooltip : {
                    trigger : 'item'
                },
                toolbox: {
                    show : false
                },
                legend: {
                    orient : '宋体',
                    x      : 'right',
                    data   : ['男性','女性']
                },
                dataRange: {
                    min        : 0,
                    max        : max_val,
                    text       : ['高','低'],
                    calculable : true,
                    textStyle  : {
                        color : 'orange'
                    }
                },
                series : [
                    {
                        name    : '男性',
                        type    : 'map',
                        mapType : 'china',
                        data    : data_nan$
                    },
                    {
                        name      : '女性',
                        type      : 'map',
                        mapType   : 'china',
                        itemStyle : {
                            normal : {color:'#da70d6'}    // for legend
                        },
                        data : data_nv$
                    }
                ]
            }

            this.trigger('flag_area') ;
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


