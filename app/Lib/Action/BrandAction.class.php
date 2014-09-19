<?php

/**
 * Name        : BrandAction.class.php
 * Type        : Class
 * Description : 品牌模块：所有品牌相关功能实现
 *
 * Create-time : 2012-11-13
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

header("Content-type:text/html;charset=utf-8");

class brandAction extends Action{

    /* 品牌模块首页
     * ---------------------------------------- */
    public function index(){

        $this->display() ;
    }
}
?>
