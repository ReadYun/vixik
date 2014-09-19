<?php

/**
 * Name        : AdminAction.class.php
 * Type        : Class
 * Description : 用户管理模块
 *
 * Create-time : 2012-8-13, 4:06:49
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */
header("Content-type:text/html;charset=utf-8");

class AdminAction extends Action{
    public function index(){
        /*
         * 用户管理模块首页
         */

        $this->display() ;
    }
}

?>