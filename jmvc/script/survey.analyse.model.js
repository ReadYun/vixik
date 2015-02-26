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
     */
    $.Model('Survey.Analyse.Model', {
        defaults : {
            user_code   : 0   ,// 用户编码
            survey_code : 0   ,// 调查编码
            dataAction$ : {}  ,// 参与调查用户统计数据
            dataArea$   : {}  ,// 用户来源统计数据
            stats$      : {}  ,// 统计数据
            question$   : {}  ,// 统计数据
        }
    }, {
        init : function(){
            var $this       = this,
                user_code   = $this.user_code,
                survey_code = $this.survey_code ;

            this.user_prop() ;
        },

        // 手动触发模型更新事件
        trigger : function(flag, info){
            if(info){
                eval("this.attr('" + flag + "', Math.random() + '#' + info)") ;
            }else{
                eval("this.attr('" + flag + "', Math.random() + '')") ;

            }
        },

        user_prop : function(){
            var $this = this ;

            // 取调查基本数据：调查基本信息查询接口
            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : {api: 'det_table_view', tables: $.toJSON(['user_sex', 'user_age', 'user_edu', 'user_career'])},
                success : function(data$){
                    if(data$.status){
                        $this.prop$ = data$.data ;
                    }
                }
            });
        },

        survey_info : function(){
            var $this = this ;

            // 取调查基本数据：调查基本信息查询接口
            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : {api:'survey_info_find', survey_code:$this.survey_code},
                success : function(data$){
                    if(data$.status){
                        $this.survey$ = data$.data ;
                        $this.trigger('sv_info')   ;

                        // 取各问题选项基本分析数据
                        for(var i = 0; i < $this.survey$.question.length; i++){
                            $this.question$[$this.survey$.question[i].question_code] = $this.survey$.question[i] ;  // 生成对象格式的题目数据
                        }

                        $this.question_stats('prop') ;
                        $this.question_stats('item') ;
                    }
                }
            });
        },

        // 调查整体分析
        survey_stats : function(){
            var $this = this ;

            // 调查趋势统计
            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : {api:'stats_sv_trend', survey_code:$this.survey_code},   
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
                data    : {api:'stats_sv_group_cnt', survey_code:$this.survey_code},
                success : function(data$){
                    if(data$.status){
                        $this.svsUser$ = data$.data ;
                        $this.trigger('svs_group') ;      
                    }else{
                        console.log('无数据：调查参与情况分组统计') ;
                    }
                }
            });
        },

        // 题目分析数据
        question_stats : function(type){
            var $this = this,
                api$  = {survey_code : $this.survey_code} ;

            switch(type){
                case 'item' :
                    api$.api  = 'stats_qt_group_item' ;
                    break ;

                case 'prop' :
                    api$.api  = 'stats_qt_group_prop' ;
                    api$.prop = $.toJSON(['user_sex', 'user_age', 'user_edu', 'user_career']) ;
                    break ;
            }

            // 访问调查题目参与详情分组统计接口
            $.ajax({
                type    : 'post',
                url     : __API__, 
                data    : api$,    
                success : function(data$){
                    if(data$.status){
                        switch(type){
                            case 'item' :
                                $this.stats$.item$ = data$.data ;
                                $this.trigger('stats_jx') ;
                                break ;

                            case 'prop' :
                                $this.stats$.prop$ = data$.data ;
                                $this.trigger('stats_tx') ;
                                $this.trigger('stats_sx') ;
                                break ;
                        }
                    }else{
                        console.log('无数据：调查题目参与详情分组统计') ;
                    }
                }
            });

            // 访问调查主观题参与信息接口
            // $.ajax({
            //     type    : 'post',
            //     url     : __API__, 
            //     data    : {api:'text_content', survey_code:$this.survey_code,},
            //     success : function(data$){
            //         if(data$.status){   
            //             $this.textarea$ = data$.data ;
            //             $this.trigger('textarea') ;
            //         }
            //     }
            // });
        },

        sv_switch : function(){
            var $this = this ;

            // 取调查基本数据：访问调查基本信息查询接口
            if(parseInt($this.user_code)){
                $.ajax({
                    type    : 'post',
                    url     : __API__,
                    data    : {api: 'survey_action_list_select', user_code: $this.user_code},
                    success : function(data$){
                        if(data$.status){
                            $this.list$ = data$.data ;
                            $this.trigger('sv_switch') ;
                        }
                    }
                });
            }else{
                $this.list$ = false ;
                $this.trigger('sv_switch') ;
            }
        },

        // 转换数据为highchart图表库需要的格式
        data_format_hchart : function(data$, title, option){
            var ser$,
                series$ = [] ;

            $.each(data$, function(k, v){
                series$.push({name: k, y: v}) ;
                
            }) ;

            var chart$ = {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                title: {
                    text: title
                },
                tooltip: {
                    headerFormat: '<span style="font: 12px Microsoft Yahei">『{point.key}』</span><br/>',
                    pointFormat: '<br>人数统计：<b>{point.y}</b><br>{series.name}：<b>{point.percentage:.1f}%</b>',
                },
                plotOptions: {
                    pie : {
                        allowPointSelect : true,
                        cursor           : 'pointer',
                        dataLabels       : {
                            enabled        : true,
                            color          : '#666',
                            connectorColor : '#666',
                            format         : '<b>{point.name}</b>：{point.percentage:.1f} %',
                            style : {
                                fontSize   : 14          ,// 字体大小
                                fontFamily : '微软雅黑'  ,// 字体样式
                            }

                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: '属性占比',
                    data: series$,
                }]
            } ;

            // console.log(charts$) ;
            return chart$ ;
        },

        // 转换数据为highchart图表库需要的格式
        data_format_hchart1 : function(srcData$, title, option){
            var seriesElem$,
                categories$ = [],
                series$     = [],
                hcOption$   = {} ;

                console.log(title) ;
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


