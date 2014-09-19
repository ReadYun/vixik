
/**
 * @Name        : vkchart.js
 * @Description : VixiK图标插件vkChart
 *
 * @Author      : ReadYun
 * @Copyright   : VixiK
 * @Version     : 1.0.00
 */

steal('init.js')
.then(function($){

    /* ================================================= *
     *
     * 轻量级调用ECharts图表库的插件
     * 此函数需要依赖两个JS库：ECharts/ZRender
     * 而必须使用Require.js来调用这两个库
     * 使用这插件的js引用形如：
     * <script type="text/javascript" src="PATH/require.js?" data-main="/xxx.js"></script>
     *
     * ================================================= */

    //require初始化引入图表库
    require.config({
        baseUrl : __JMVC_LIB__ , 
        packages: [
            {
                name: 'echarts',
                location: 'echarts/src',      
                main: 'echarts.js'
            },
            {
                name: 'zrender',
                location: 'zrender/src',
                main: 'zrender.js'
            }
        ]
    });

    /*
     * @Name   : 图表插件功能
     * @Param  : $dom    $chart     图表对象
     * @Param  : object  option$    参数项
     * @Param  : number  times      图表载入延时时间（秒）
     */
    $.vkchart = $.fn.vkchart = function($chart, option$, times){
        var chart ;
        var chart_type = option$.series[0].type ;
        var time_out = 1000 ;

        if(times){
            time_out = times * 1000 ;
        }

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
                chart = ec.init($chart[0]);
                chart.showLoading({
                    text      : '图表数据加载中......',
                    effect    : 'spin',
                    textStyle : {
                        fontFamily : '宋体',
                        fontSize   : 25
                    }
                });

                clearTimeout(loadingChart);

                var loadingChart = setTimeout(function(){
                    chart.setOption(option$);
                }, time_out) ;
            }
        ) ;
    }
}) ;





