<?php

/**
 * Name        : IndexAction.class.php
 * Type        : Class
 * Description : VixiK网站入口文件
 *
 * Create-time : 2012-06-15 14:43:24
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */
header("Content-type:text/html;charset=utf-8");

class IndexAction extends Action {
    /* 前置方法
     * ---------------------------------------- */
    public function _initialize(){
        // 用户权限校验
        R('Api/user_verify') ;
    }

    /* 首页问卷清单列表(待完善。。)
     * ---------------------------------------- */
    public function index(){
        $model = M() ;
        $limit = 8 ;

        $BasSurveyInfo   = 'BasSurveyInfo' ;
        $tbBasSurveyInfo = M($BasSurveyInfo) -> getTableName() ;

        //自定义SQL查询
        $sql="select
                  case when length(survey_name)>20 then concat(left(survey_name,18),'...') else survey_name end survey_name,
                  survey_code
              from $tbBasSurveyInfo
              where survey_state='3'
              order by state_time desc
              limit $limit" ;
        $survey = $model -> query($sql) ;
        $this -> assign('list', $survey) ;

        $this -> display() ;
    }
    
    // public function loginVerify(){
    //     $type      = $_POST['type'] ;
    //     $user_nick = $_POST['nick'] ;
        
    //     switch($type){
    //         case 1:    //验证用户名
    //             $res = M($BasUserInfo) -> where("user_nick = $user_nick") -> count() ;
    //             echo $res ;
    //             break ;
    //         case 2:    //验证密码
    //             $user_pwd = MD5($_POST['password']) ;
    //             $res = M($BasUserInfo) -> where("user_nick = $user_nick and user_pwd = $user_pwd") -> find() ;
    //             cookie('user_code', $res['user_code'], 360000) ;
    //             cookie('user_nick', $res['user_nick'], 360000) ;
    //             cookie('user_pwd', $res['user_pwd'], 360000) ;
    //             echo $res['user_code'] ;
    //             break ;
    //     } ;
    // }
}