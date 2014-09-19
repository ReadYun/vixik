/**
 * Name        : init.js
 * Description : 网站初始化steal加载脚本
 *
 * Create-time : 2012-12-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

//优先级加载CSS
steal('bootstrap2/css/bootstrap.css'                    ,//Bootstrap2
      'jquery/ui/themes/base/jquery-ui.css'                 ,//jQueryUI
      'public/style/vixik-ui.custom.css'                    ,//统一VixiK样式
      'public/plugin/Buttons/css/buttons.css'               ,//botton按钮样式
      'public/plugin/Buttons/css/font-awesome.min.css'      ,//fontAwesome字体样式
      'public/plugin/Buttons/css/font-awesome-ie7.min.css'   //fontAwesome for IE7
) ;

//加载统一JS
steal('jquery')                                          //jQuery主文件
.then('jquery/ui/jquery-ui.js'                          ,//jQueryUI 
      'bootstrap2/js/bootstrap.min.js'                  ,//Bootstrap2
      'jquery/ui/i18n/jquery.ui.datepicker-zh-CN.js'  
)

//加载JMVC基础类
steal('jquery/class',
      'jquery/model',
      'jquery/view',
      'jquery/controller',
      'jquery/view/ejs'
) ;

//加载项目静态文件
steal('public/style/vixik-base.css'          ,//统一基础样式表
      'public/script/vixik.config.js'        ,//vixik配置脚本
      'public/script/vixik.func.core.js'     ,//vixik核心函数
      'public/script/vixik.func.proj.js'     ,//vixik项目函数
      'public/plugin'                        ,//各种插件
      'public/lib'                            //各种功能库
) ;

//steal('less/less-1.3.1.min.js') ;

