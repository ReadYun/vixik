<?php

/**
 * @Name        : GetcodingBehavior.class.php
 * @Type        : Class
 * @Description : $_GET 编码 解决url中文问题
 *
 * @Create-time : 2013-9-1
 * @Author      : ReadYun
 * @Copyright   : VixiK
 * @Version     : 1.0.00
 */

header("Content-type:text/html;charset=utf-8");

class GetcodingBehavior extends Behavior{

    public function run(&$params) {
        
        foreach ($_GET as $k=>$v){
            if(!is_array($v)){
                if (!mb_check_encoding($v, 'utf-8')){
                    // $_GET[$k] = iconv('gbk', 'utf-8', $v);
                    $word = mb_convert_encoding($v, "UTF-8", "gb2312") ;
                }
            }else{
                foreach ($_GET['_URL_'] as $key=>$value){
                    if (!mb_check_encoding($value, 'utf-8')){
                        // $_GET['_URL_'][$key] = iconv('gbk', 'utf-8', $value);
                        $_GET['_URL_'][$key] = mb_convert_encoding($value, "UTF-8", "gb2312") ;
                    }
                }
            }
        }
        
    }
}

?>