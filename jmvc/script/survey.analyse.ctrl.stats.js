/**
 * Name        : survey.analyse.svstats.js
 * Description : js for survey/analyse.html
 *
 * Create-time : 2012-8-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

steal('init.js')
.then(function($){  
    loadPlugin('vkHighChart', 'vkData', /*'vkEChart',*/ 'vkForm') ;  // 加载所需插件
})
.then(function($){

    /*
     * 整体分析模块控制器
     *
     **/
    $.Controller('Survey.Analyse.Ctrl.Sv.Stats', {
        defaults : {
            models$     : {}                ,// 页面总模型
            $itemStats  : $('#itemStats')   ,// 调查题目数量统计模块DOM
            $trendStats : $('#trendStats')  ,// 参与趋势概览统计模块DOM
            $areaStats  : $('#areaStats')   ,// 用户地域分布统计模块DOM
            $userStats  : $('#userStats')   ,// 用户属性分布统计模块DOM
        }
    }, {
        init : function(){
            // 考虑到同步加载的时差问题，初始就做一次统计功能
            if(this.options.models$.svsTrend$){
                this.stats_trend() ;
            }
            if(this.options.models$.svsUser$){
                this.stats_user() ;
            }
            if(this.options.models$.question$){
                this.stats_item() ;
            }

            this.element.find('#userStats .ssb-side>div').first().addClass('active') ;
            this.element.find('#userStats .stats-graphs>div').first().addClass('active') ;
        },

        // 调查趋势统计模型更新触发
        "{models$} svs_trend" : function(){
            this.stats_trend() ;
        },

        // 用户属性统计模型更新触发
        "{models$} svs_user" : function(){
            this.stats_user() ;
        },

        // 用户属性分布分析
        ".ssb-side>div.user-prop-elem mouseover" : function(el){
            var prop = el.addClass('active').attr('data-prop') ;

            // 侧边导航刷新
            this.element.find('.ssb-side>div').removeClass('active') ;
            this.element.find('.stats-graphs>div').removeClass('active') ;
            this.element.find('.stats-graphs>.sg-' + prop).addClass('active') ;
        },

        // 调查题目统计
        stats_item : function(){
            var elem_num, ratio, title,
                $itemGraphs  = this.options.$itemStats.find('div.stats-graphs'),
                $line        = $itemGraphs.find('div.graphs-line') ;
                question_num = parseInt($itemGraphs.attr('data-question-num')),

            $.each($line, function(){
                elem_num = parseInt($(this).attr('data-elem-num')) ;

                if(elem_num > 0){
                    ratio = Math.round((elem_num * 1000 / question_num)) / 10 + '%';
                    $(this).css('width', ratio) ;
                }else{
                    ratio = '0%' ;
                    $(this).css('width', '3px') ;
                }

                title = $(this).attr('title') + ' ' + ratio ;
                $(this).attr('title', title) ;
            }) ;

            $itemGraphs.css('background','#FFD700') ;
        }, 

        // 参与趋势概述统计
        stats_trend : function(){
            var $this  = this,
                date$  = [],
                data$  = [],
                svsTrend$ = $this.options.models$.svsTrend$ ;

            if(svsTrend$){
                // 汇总结果展示
                $this.options.$trendStats.find('.day>.stats-value').text(svsTrend$.stats.cnt_count) ;
                $this.options.$trendStats.find('.sum>.stats-value').text(svsTrend$.stats.cnt_sum) ;
                $this.options.$trendStats.find('.avg>.stats-value').text(svsTrend$.stats.cnt_avg) ;

                // 整理数据
                if(svsTrend$.length){
                    for(var i = 0; i < svsTrend$.data.length; i++){
                        date$.push(svsTrend$.data[i].end_date.substr(6)) ;
                        data$.push(parseInt(svsTrend$.data[i].cnt)) ;
                    }

                    // 生成图表
                    this.options.$trendStats.find('.stats-graphs').vkHighChart({
                        chart: {
                            type         : 'area'  ,// 图表类型
                            width        : 680     ,// 图表长度
                            height       : 350     ,// 图表宽度
                            marginRight  : 10      ,// 右边距
                        },
                        title: {
                            text: '',
                            stype:{margin:'0'},
                        },
                        subtitle: {
                            text  : svsTrend$.data[0].end_date + ' 至 ' + svsTrend$.data[svsTrend$.data.length-1].end_date,
                            style : {fontSize:'19px', color:'#666', margin:'0'},
                        },
                        xAxis: {
                            categories : date$,
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
                            pointFormat: '<b style="color:#333;font-weight:900">{point.y:,.0f}</b> 人参与调查'
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
                            name: '参与调查人数',
                            data: data$
                            }]
                    }) ;
                }
            }            
        },

        // 用户地域分布分析
        stats_area : function(srcData$){
            var sum        = 0,
                series$    = [],
                $this      = this,
                $areaStats = $this.options.$areaStats,
                svsUser$   = $this.options.models$.svsUser$ ;

            if(svsUser$){
                // 最多最少统计展示
                $areaStats.find('.stats-value.most-province').text(svsUser$.area.province[0].province_name) ;
                $areaStats.find('.stats-value.most-city').text(svsUser$.area.city[0].city_name) ;
                $areaStats.find('.stats-value.least-province').text(svsUser$.area.province[svsUser$.area.province.length-1].province_name) ;
                $areaStats.find('.stats-value.least-city').text(svsUser$.area.city[svsUser$.area.city.length-1].city_name) ;

                // 按EChart图表格式整理数据
                if(svsUser$.area.province.length){
                    for(var i = 0; i < svsUser$.area.province.length; i++){
                        if(svsUser$.area.province[i].cnt == null){
                            svsUser$.area.province[i].cnt = 0
                        }else{
                            sum += parseInt(svsUser$.area.province[i].cnt) ;
                        }

                        series$.push({name:svsUser$.area.province[i].province_name, value:parseInt(svsUser$.area.province[i].cnt)}) ;
                    }

                    // 图表生成
                    $.vkEChart($areaStats.find('.stats-graphs'), {
                        title : {
                            text: '',
                            subtext: '',
                        },
                        tooltip : {
                            trigger: 'item'
                        },
                        dataRange: {
                            min: 0,
                            max: sum,
                            x: 'right',
                            y: 'bottom',
                            text:['高','低'],           // 文本，默认为数值文本
                            calculable : true
                        },
                        toolbox: {
                            show: false,
                            orient : 'vertical',
                            x: 'right',
                            y: 'center',
                            feature : {
                                mark : {show: true},
                                dataView : {show: true, readOnly: false},
                                restore : {show: true},
                                saveAsImage : {show: true}
                            }
                        },
                        series : [
                            {
                                name: '参与调查人数',
                                type: 'map',
                                mapType: 'china',
                                roam: false,
                                itemStyle:{
                                    normal:{label:{show:true}},
                                    emphasis:{label:{show:true}}
                                },
                                data:series$
                            },
                        ]
                    }) ;                    
                }
            }
        },

        // 用户属性分布分析
        stats_user : function(){
            var $target, series$, sum, 
                $this    = this,
                svsUser$ = $this.options.models$.svsUser$ ;

            if(svsUser$){
                $.each(svsUser$, function(key, value){

                    if(key != 'area'){
                        sum = $.vkData('data_select_sum', {
                            data$ : value.cnt, 
                            key   : 'cnt', 
                        }) ;

                        $target = $this.options.$userStats.find('.sg-' + key) ;
                        series$ = [] ;

                        for(var i = 0; i < value.cnt.length; i++){
                            series$.push([value.cnt[i]['user_' + key + '_desc'], parseInt(value.cnt[i]['cnt'])]) ;
                        }

                        $target.vkHighChart({
                            chart : {
                                plotBackgroundColor : null,
                                plotBorderWidth     : null,
                                plotShadow          : false,
                                width               : 680     ,// 图表长度
                                height              : 350     ,// 图表宽度
                            },
                            title : {
                                text : ''
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
                                data : series$,
                            }]
                        }) ;
                    }

                }) ;
            }
        },
    }) ;

    /*
     * 题目分析模块控制器
     *
     **/
    $.Controller('Survey.Analyse.Ctrl.Qt.Stats', {
        defaults : {
            models$      : {}                       ,// 页面总模型
            $question    : $('div.question')        ,// 调查所有题目DOM
        },
        // listensTo : ["question_stats"]
    }, {
        init : function(){
            var $this = this ;

            // 调查题目显示select初始化
            $this.element.find('select').attr('value', 0) ;

            // 初始化用户属性分析的两个select选项
            $.each(this.options.$question, function(){
                if($(this).hasClass('qt-stats')){
                    var $selectProp   = $(this).find('select.prop-select'),
                        $selectOption = $(this).find('select.option-select'),
                        prop          = $selectProp.find('option').eq(0).val(),
                        option        = $selectOption.find('option').eq(0).val() ;

                    $selectProp.attr('value', prop) ;
                    $selectOption.attr('value', option) ;

                    // 图表初始化
                    $this.stats_sx($(this)) ;
                    $this.stats_jx($(this)) ;
                }
            }) ;
        }, 

        // 取到调查题目参与数据触发题目分析报表
        "{models$} stats_qt_group_prop" : function(){
            var quesiton_code,
                $this = this ;

            // 分别对每个题目进行分析
            $.each($this.options.$question, function(){
                if($(this).attr('data-question-type') == 'textarea'){
                    question_code = $(this).attr('data-question-code') ;
                }else{
                    $this.stats_opt($(this)) ;  // 先完成各题目选项整体分析报表
                    $this.stats_sx($(this)) ;   // 然后初始化用户属性分析报表
                }
            }) ;
        },

        // 取到主观题目参与数据触发主观题数据匹配
        "{models$} textarea" : function(){
            var $this = this ;

            // 主观题数据列表初始化第一次
            $.each($this.options.models$.textarea$, function(k, v){
                $this.textarea_list(k, 0) ;
            }) ;
        },

        // 调查题目选择变更
        "select.qt-select change" : function(el){
            var $target ;

            // 先关闭所有主观题的参与内容显示
            this.options.$question.find('.qt-text').removeClass('active') ;

            // 再进一步判断处理
            if(el.val() == 0){
                this.element.removeClass('single') ;
                this.options.$question.show() ;
            }else{
                $target = this.options.$question.filter('[data-question-code=' + el.val() + ']') ;

                this.element.addClass('single') ;
                this.options.$question.hide() ;
                $target.show() ;

                // 若切换的是主观题，显示其参与内容
                if($target.attr('data-question-type') == 'textarea' && $target.find('.qt-text').hasClass('data')){
                    // 目标题目显示参与的内容
                    $target.find('.qt-text').addClass('active') ;
                }
            }

            // 滚动页面到头
            window.scrollTo(0, 0) ;
        },

        // 点击查看主观题详情
        ".text-init click" : function(el){
            var question_code = el.parents('.question').attr('data-question-code') ;

            this.element.find('select.qt-select').attr('value', question_code).trigger('change') ;
        },

        // 分析类型切换
        ".item-graphs-header>.tab click" : function(el){
            el.parents('.item-graphs').find('.item-graphs-body>div').removeClass('active') ;
            el.parents('.item-graphs').find('.item-graphs-body>.item-graphs-' + el.attr('data-type')).addClass('active') ;
        },

        // 目标选项变更
        "li.option-select>select change" : function(el){
            this.stats_sx(el.parents('.question.qt-stats')) ;
            this.stats_jx(el.parents('.question.qt-stats')) ;
        },

        // 用户属性筛选条件变更
        ".item-graphs-sx>select change" : function(el){
            this.stats_sx(el.parents('.question.qt-stats')) ;
        },

        // 用户属性筛选条件变更
        ".item-graphs-jx>select change" : function(el){
            console.log('item-graphs-jx') ;
            this.stats_jx(el.parents('.question.qt-stats')) ;
        },

        // 加载更多主观题参与内容
        ".tf-button>button click" : function(el){
            var idx           = parseInt(el.parents('.qt-text').attr('data-idx')) + 1,
                question_code = el.parents('.question').attr('data-question-code') ;

            this.textarea_list(question_code, idx) ;
        },

        // 题目选项分析
        stats_opt : function($question){
            $.each($question.find('div.stats-line'), function(){
                $(this).progressbar({value:parseFloat($(this).attr('data-value'))}) ;
            }) ;
        },

        // 用户属性分析
        stats_sx : function($question){
            var models$ = this.options.models$ ;

            if(models$.question$){
                var data$,
                    $graphs       = $question.find('.item-graphs-sx'),
                    $highchart    = $graphs.find('.highchart'),
                    $nochart      = $graphs.find('.nochart'),
                    user_prop     = $graphs.find('select').val(),
                    option        = $question.find('select.option-select').val(),
                    question_code = $question.attr('data-question-code'),
                    question_name = $question.attr('data-question-name'),
                    option_num    = parseInt($question.find('td.choose-num[data-option=' + option + ']').text()) ;

                // 根据目标选项是否有选择数据决定处理方式
                if(option_num > 0 || option == 0){
                    if(models$.question$[question_code]){
                        // 按照属性筛选数据
                        data$ = $.vkData('data_select_sum', {
                            data$ : models$.question$[question_code], 
                            key   : 'cnt', 
                            group : [user_prop, 'option_name']}
                        ) ;
                        
                        // 转换数据并生成图表
                        $highchart.vkHighChart(models$.data_format_hchart(data$, question_name, option)) ;
                    }

                    $nochart.hide() ;
                    $highchart.show() ;
                }else{
                    $highchart.hide() ;
                    $nochart.show() ;
                }
            }
        },

        // 交叉题目分析
        stats_jx : function($question){
            var stats$,
                $this         = this,
                models$       = $this.options.models$,
                survey_code   = $this.options.models$.survey_code,
                $graphs       = $question.find('.item-graphs-jx'),
                $highchart    = $graphs.find('.highchart'),
                $nochart      = $graphs.find('.nochart'),
                group_item    = $graphs.find('select.item').val(),
                option        = $question.find('select.option-select').val(),
                question_code = $question.attr('data-question-code'),
                question_name = $question.attr('data-question-name') ;

            // 取调查基本数据：调查基本信息查询接口
            $.ajax({
                type    : 'post',
                url     : __API__,
                data    : { api         : 'stats_qt_group_item',
                            survey_code : survey_code,
                            target_qt   : question_code,
                            group_qt    : group_item,
                          },
                success : function(data$){
                    if(data$.status){
                        // 按照属性筛选数据
                        if(option){
                            stats$ = $.vkData('data_select_sum', {
                                data$  : data$.data, 
                                key    : 'cnt', 
                                where$ : [{tgt_opt_name:option}],
                                group  : ['grp_opt_name', 'tgt_opt_name']}
                            ) ;
                        }else{
                            stats$ = $.vkData('data_select_sum', {
                                data$ : data$.data, 
                                key   : 'cnt', 
                                group : ['grp_opt_name', 'tgt_opt_name']}
                            ) ;
                        }
                        
                        // 转换数据并生成图表
                        $highchart.vkHighChart(models$.data_format_hchart(stats$, question_name, option)) ;

                        $nochart.hide() ;
                        $highchart.show() ;
                    }else{
                        $highchart.hide() ;
                        $nochart.show() ;
                    }
                }
            });
        },

        // 主观题内容列表加载
        textarea_list : function(question_code, idx){
            var data$     = [],
                num       = 10,   // 每次加载的数据量
                textarea$ = this.options.models$.textarea$[question_code],
                $textarea = this.options.$question.filter('[data-question-code=' + question_code + ']').find('.qt-text').addClass('data') ;

            // 处理目标数据
            for(var i = 0; i < num; i++, idx++){
                $textarea.find('.tf-desc span').text(parseInt(idx + 1) + '/' + textarea$.length) ;
                data$.push(textarea$[idx]) ;

                // 判断性别确定性别头像（1:男/2:女）
                if(data$[i].sex == 2){
                    data$[i].photo =  __JMVC_IMG__ + 'user/woman.png' ;
                }else{
                    data$[i].photo =  __JMVC_IMG__ + 'user/man.png' ;
                }

                if(idx == textarea$.length - 1){
                    $textarea.find('.tf-desc>button').text('已显示全部' + textarea$.length + '条记录') ;
                    $textarea.find('.tf-button>button').hide() ;
                    break ;
                }
            }

            // 列表生成
            $textarea.attr('data-idx', idx - 1).find('.text-list').append(
                __JMVC_VIEW__ + 'survey.analyse.textarea.list.ejs',
                {data:data$}
            ) ;
        },

        // 按用户属性分析选项
        // prop_stats : function($question){
        //     var data$,
        //         models$       = this.options.models$,
        //         $highchart    = $question.find('div.highchart'),
        //         $nochart      = $question.find('div.nochart'),
        //         user_prop     = $question.find('select.prop-select').val(),
        //         option        = $question.find('select.option-select').val(),
        //         question_code = $question.attr('data-question-code'),
        //         question_name = $question.attr('data-question-name'),
        //         option_num    = parseInt($question.find('td.choose-num[data-option=' + option + ']').text()) ;

        //     // 根据目标选项是否有选择数据决定处理方式
        //     if(option_num > 0 || option == 0){
        //         // 按照属性筛选数据
        //         data$ = $.vkData('data_select_sum', {
        //             data$ : models$.question$[question_code], 
        //             key   : 'count', 
        //             group : [user_prop, 'option_name']}
        //         ) ;
                
        //         // 转换数据并生成图表
        //         $highchart.vkHighChart(models$.data_format_hchart(data$, question_name, option)) ;

        //         $nochart.hide() ;
        //         $highchart.show() ;
        //     }else{
        //         $highchart.hide() ;
        //         $nochart.show() ;
        //     }
        // },
    }) ;
}) ;


