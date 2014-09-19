<?php

/**
 * Name        : PublicAction.class.php
 * Type        : Class
 * Description : 网站公共模板
 *
 * Create-time : 2012-8-24 14:43:24
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */
header("Content-type:text/html;charset=utf-8");

class PublicAction extends Action{

   /* 统一页面头部文档的元信息声明
    * ---------------------------------------- */
    public function meta(){
        $this -> display() ;
    }
   /* 统一页面头部文档的样式声明
    * ---------------------------------------- */
    public function style(){
        $this -> display() ;
    }
   /* 统一页面头部文档的样式声明
    * ---------------------------------------- */
    public function script(){
        $this -> display() ;
    }

   /* 页面顶部显示导航栏
    * ---------------------------------------- */
    public function topBar(){
        $user_code = cookie('user_code') ;
        $user1     = userInfoFind($user_code) ;
        
        $this -> assign('user1', $user) ;
        $this -> display() ;
    }

   /* 页面底部显示
    * ---------------------------------------- */
    public function footer(){
        $this -> display() ;
    }

   /* 主要搜索栏
    * ---------------------------------------- */
    public function mainSearch(){
        $this -> display() ;
    }

   /* 迷你搜索栏
    * ---------------------------------------- */
    public function miniSearch(){
        $this -> display() ;
    }

   /* 页面头部
    * ---------------------------------------- */
    public function header(){
        $this -> display() ;
    }
}

?>