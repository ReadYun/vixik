<?php

/**
 * Name        : ShopAction.class.php
 * Type        : Class
 * Description : 商城模块：所有商城相关功能实现
 *
 * Create-time : 2012-11-13
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

header("Content-type:text/html;charset=utf-8");

class shopAction extends Action{

    /* 积分商城模块首页
     * ---------------------------------------- */
    public function index(){

        $this->display() ;
    }
}
?>
