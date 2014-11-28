<?php
return array(
    //'配置项'=>'配置值'

    /*数据库设置*/
    'DB_TYPE'   => 'mysql',      // 数据库类型
	'DB_HOST'   => 'localhost',  // 服务器地址
	'DB_NAME'   => 'vixik',      // 数据库名
	'DB_USER'   => 'root',       // 用户名
	'DB_PWD'    => 'zhiyun',     // 密码
	'DB_PORT'   => '3306',       // 端口
	'DB_PREFIX' => 'tb_',        // 数据库表前缀

    /*模板路径配置*/
    TMPL_PARSE_STRING => array(
        '__ROOT__'   => '/vixik',                            //服务器根目录
        '__APP__'    => __ROOT__ . '/app',                   //项目主目录
        '__APPTPL__' => __APP__  . '/Tpl',                   //项目模板文件路径
        '__APPCMN__' => __APP__  . '/Common',                //项目公共文件路径
        '__JMVC__'   => __ROOT__ . '/jmvc',                  //项目JMVC文件路径
        '__PUBLIC__' => __JMVC__ . '/public',                //项目JMVC文件路径
        '__COM__'    => 'http://localhost/vixik/index.php',  //网站根目录（本地）
        // '__COM__'    => 'http://readyun.gicp.net/vixik/index.php',  //网站根目录（花生壳）
    ),

    /*项目函数库加载设置*/
    'LOAD_EXT_FILE' => 'userFunc,surveyFunc,apiFunc,recommendFunc,statistFunc,',

    /* URL设置 */
    'URL_CASE_INSENSITIVE'  => true,   // 默认false 表示URL区分大小写 true则表示不区分大小写
    'URL_MODEL'             => 1,      // URL访问模式,可选参数0、1、2、3,代表以下四种模式：
                                       // 0 (普通模式); 1 (PATHINFO 模式); 2 (REWRITE  模式); 3 (兼容模式) 
    'URL_HTML_SUFFIX'       => '',     // URL伪静态后缀设置

);
?>