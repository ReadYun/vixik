/**
 * Name        : init.js
 * Description : 网站初始化steal加载脚本
 *
 * Create-time : 2012-12-14 18:14:09
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

//顺序加载jQuery库
steal('jquery')
.then('jquery/jquery-ui-1.8.custom.min.js')
.then('jquery/jquery.json-1.0.js')
.then('jquery/jquery.cookie.js');

//顺序加载官方JS库
steal('common/script/vixik.config.js')
.then('common/script/vixik.custom.js')
.then('common/script/vixik-ui.custom.js') ;

//初始化加载统一官方JS库
steal('common/script/vixik.config.js',
      'common/script/vixik.custom.js',
      'common/script/vixik-ui.custom.js'
) ;


//顺序加载统一JS库
steal('jquery',
      'jquery/jquery-ui-1.8.custom.min.js',
      'jquery/jquery.json-1.0.js',
      'jquery/jquery.cookie.js'
) ;