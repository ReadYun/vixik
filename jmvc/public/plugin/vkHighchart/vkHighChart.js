
/**
 * @Name        : vhighchart.js
 * @Description : VixiK图表插件vhighChart（此函数需要依赖图表库HighCharts）
 *
 * @Author      : ReadYun
 * @Copyright   : VixiK
 * @Version     : 1.0.00
 */

steal('init.js')
.then(function($){  
    loadLib('highcharts') ;    // 先加载图表库HighCharts
})
.then(function($){

    // 定义命名空间vkHighChart直接调用方法
    $.fn.vkHighChart = function(data$, themes){
        var $this = this ;
        var $aa ;

        // 对HightCharts图表设置默认统一样式
        var theme_default = {

            // 图表颜色方案
            colors : ['#FF7F50','#87CEFA','#DA70D6','#32CD32','#FFD700','#33A6F2','#CC6633','#3CB371','#FF00FF','#FFF263'],

            // 名片设置
            credits : {
                enabled : false                  ,// 是否启用名片
                text : '·维新调研·'             ,// 名片内容
                href : 'http:// www.vixik.com'  ,// 名片内容超链接

                // 名片样式
                style : {
                    color : '#6BB130'                  ,// 主标题颜色
                    fontSize : '13px'                  ,// 主标题字体大小
                    fontFamily : 'STXingkai, Verdana'  ,// 主标题字体样式
                }
            },   

            // 主标题设置选项
            title : {

                // 主标题样式
                style : { 
                    color : '#333333',            // 主标题颜色
                    fontSize : '19px',            // 主标题字体大小
                    fontFamily : '宋体, Verdana'  // 主标题字体样式
                },
                margin :20    // 标题与副标题之间或者主图表区间的间距
            },

            // 副标题设置选项
            subtitle : {

                // 副标题样式
                style : { 
                    color : '#666666',            // 副标题颜色
                    fontSize : '15px',            // 副标题字体大小
                    fontFamily : '宋体, Verdana'  // 副标题字体样式
                }
            },

            // X轴设置选项
            xAxis : {
                gridLineWidth : 0,          // 网格(竖线)宽度（默认值：1）
                gridLineColor : '#CFCFCF',  // 网格(横线)颜色（默认值：#C0C0C0）
                lineWidth : 1,              // X轴基线宽度（默认值：0）
                lineColor : '#BFBFBF',      // Y轴基线颜色（默认值：#C0D0E0）
                //  tickColor : '#000',         // X轴阶色
                offset : 0,                  // X轴基线与图表间距（默认0）

                // X轴分类名称设置
                labels : {    

                    // X轴分类名称的样式style
                    style : {
                        color : '#333333',            // 副标题颜色
                        fontSize : '12px',            // 副标题字体大小
                        fontFamily : '宋体, Verdana'  // 副标题字体样式
                    }
                },

                // X轴标题设置
                title : {

                    // X轴标题样式style
                    style : {
                        color : '#0088CC',            // X轴标题颜色
                        //  fontWeight : 'normal',        // X轴字体粗细（默认值：blod）
                        fontSize : '13px',            // X轴标题字体大小
                        fontFamily : '宋体, Verdana'  // X轴标题字体样式
                    }
                }
            },

            // Y轴设置选项
            yAxis : {
                gridLineWidth : 1           ,// 网格(横线)宽度（默认值：1）
                gridLineColor : '#CFCFCF'   ,// 网格(横线)颜色（默认值：#C0C0C0）
                lineWidth     : 0           ,// Y轴基线宽度（默认值：0）
                lineColor     : '#C0D0E0'   ,// Y轴基线颜色（默认值：#C0D0E0）
                // minorTickInterval : 'auto',
                tickColor : '#000',

                // Y轴分类名称设置
                labels : {
                    style : {
                        color : '#000',
                        fontSize : '9px',
                        fontFamily : 'Verdana, sans-serif'
                    }
                },

                // Y轴标题设置
                title : {

                    // Y轴标题样式style
                    style : {
                        color      : '#0088CC'        ,// Y轴标题颜色
                        fontWeight : 'normal'         ,// Y轴字体粗细（默认值：blod）
                        fontSize   : '13px'           ,// Y轴标题字体大小
                        fontFamily : '宋体, Verdana'  ,// Y轴标题字体样式
                    },
                    margin :10    // Y轴标题与主图表间距
                }
            },

            // 数据点选项设置
            plotOptions : {
                bar : {
                    dataLabels : {
                        enabled : true
                    },
                    groupPadding : 0,
                    animation : true

                },
                line : {
                    animation : true
                },
                spline : {
                    animation : false,
                    sliced : true
                },
                column : {
                    dataLabels : {
                        enabled : true
                    },
                    animation : false
                }
            },

            // 图例选项
            //  legend : {
            //      margin : 10
            //  },

            labels : {
                style : {
                    color : '#6BB130'
                }
            }
        };

        // 先应用默认皮肤设置
        Highcharts.setOptions(theme_default);


        // 如果有需要应用外部皮肤，再加载
        if(themes){
            for(var i = 0; i < themes.length; i++){

                // 根据入参的不同类型使用不同的加载方式
                switch(typeof(themes[i])){
                    // 外部已经设置好皮肤参数，直接应用
                    case 'object' :
                        Highcharts.setOptions(themes[i]);
                        $aa = $this.highcharts(data$) ;  // 加载外部数据生成图表
                        break ;

                    // 应用插件提供的皮肤（根据入参皮肤名称加载对应的皮肤文件）
                    case 'string' :
                        steal(__JMVC_PLUGIN__ + '/vkHighchart/themes/' + themes[i] + '.js' )
                            .then(
                                function(){
                                    Highcharts.setOptions(themes[i]) ;
                                    $aa = $this.highcharts(data$) ;  // 加载外部数据生成图表
                                }) ;
                        break ;
                }
            }
        }else{
            $aa = $this.highcharts(data$) ;  // 加载外部数据生成图表
        }
    }
}) ;





