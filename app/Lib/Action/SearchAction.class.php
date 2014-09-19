<?php

/**
 * @Name        : SearchAction.class.php
 * @Type        : Class
 * @Description : 搜索模块：所有搜索相关功能实现
 *
 * @Create-time : 2013-9-1
 * @Author      : ReadYun
 * @Copyright   : VixiK
 * @Version     : 1.0.00
 */

header("Content-type:text/html;charset=utf-8");

class searchAction extends Action{

    /* 问卷模块首页
     * ---------------------------------------- */
    public function index(){
        $type  = $_GET['type'] ;
        $words = $_GET['words'] ;

        if(!$type){
            $type = 'survey' ;
        }

        if($words){
            $title = $words ;
        }else{
            $title = '问卷/问题/用户' ;
            cookie('search_words', null) ;
        }

        $this -> assign('type',  $type) ;
        $this -> assign('words', $words) ;
        $this -> assign('title', $title) ;
        $this -> display() ; 
    }

    /* 问卷模块首页
     * ---------------------------------------- */
    public function index_old(){
        $type = $_GET['type'] ;

        if(!$type){
            $type = 'survey' ;
            cookie('search_word', null) ;
        }else{
            $word = cookie('search_word') ;
        }

        if($word){
            $title = $word ;
        }else{
            $title = '问卷/问题/用户' ;            
        }

        $this -> assign('type', $type) ;
        $this -> assign('word', $word) ;
        $this -> assign('title', $title) ;
        $this -> display() ;   
    }
}

?>
