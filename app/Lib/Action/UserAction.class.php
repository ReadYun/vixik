<?php

/*
 * Name        : UserAction.class.php
 * Type        : Class
 * Description : 用户模块：所有用户相关功能实现
 *
 * Create-time : 2012-7-13, 4:06:49
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

header("Content-type:text/html;charset=utf-8") ;

class UserAction extends Action {
    /* 前置方法
     * ---------------------------------------- */
    public function _initialize(){
        //  用户权限校验
        R('Api/user_verify') ;
    }
    
    /* 用户管理首页
     * ---------------------------------------- */
    public function index(){
        $page = '个人中心' ;

        // 取用户各种属性
        $UserCareer    = M(TB_DET_USER_CAREER   )  -> select() ;  // 用户职业
        $UserEdu       = M(TB_DET_USER_EDU      )  -> select() ;  // 用户学历
        $UserIncome    = M(TB_DET_USER_INCOME   )  -> select() ;  // 用户收入分类
        $UserCharacter = M(TB_DET_USER_CHARACTER)  -> select() ;  // 用户性格类型
        $UserAffection = M(TB_DET_USER_AFFECTION)  -> select() ;  // 用户感情状态
        $UserStature   = M(TB_DET_USER_STATURE  )  -> select() ;  // 用户身材类型
        $UserHobby     = M(TB_DET_USER_HOBBY    )  -> select() ;  // 用户性格类型
        $UserIndustry  = M(TB_DET_INDUSTRY_CLASS)  -> select() ;  // 行业大类
        $AreaProvince  = M(TB_DET_AREA_PROVINCE )  -> select() ;  // 省级地域
        $surveyType    = M(TB_DET_SURVEY_TYPE)     -> select() ;
        $surveyTypeSub = M(TB_DET_SURVEY_TYPE_SUB) -> select() ;

        // 取用户信息
        $user = userInfoFind(array('user_code'=>cookie('user_code'), 'user_md5'=>cookie('user_md5'))) ;

        // 查询用户等级值对应的等级描述                    
        $user['user_level_desc'] = M(TB_DET_USER_LEVEL) -> where("user_level_value=".$user['user_level']) -> getField('user_level_desc') ;

        // 模版变量定义
        $this -> assign('user',       $user         ) ;
        $this -> assign('group',      $group        ) ;
        $this -> assign('career',     $UserCareer   ) ;
        $this -> assign('edu',        $UserEdu      ) ;
        $this -> assign('income',     $UserIncome   ) ;
        $this -> assign('character',  $UserCharacter) ;
        $this -> assign('affection',  $UserAffection) ;
        $this -> assign('stature',    $UserStature  ) ;
        $this -> assign('hobby',      $UserHobby    ) ;
        $this -> assign('industry',   $UserIndustry ) ;
        $this -> assign('province',   $AreaProvince ) ;
        $this -> assign('svtype',     $surveyType   ) ;
        $this -> assign('svtype_sub', $surveyTypeSub) ;
        $this -> assign('page',         $page) ;
        $this -> assign('path',         vkPath($page)) ;

        $this -> display() ;

    }

    /* 访问查看用户信息
     * ---------------------------------------- */
    public function visit(){
        $page        = '用户访问' ;
        $user_code = $_GET['code'] ;

        $this -> assign('page', $page) ;
        $this -> assign('path', vkPath($page, $user_code)) ;

        if($user = userInfoFind(array('user_code'=>$_GET['code']))){
            $this -> assign('user', $user) ;
            $this -> display() ;
        }else{
            $this -> error("无法访问该用户，返回个人中心", U('user/index')) ;
        }
    }

    /* 用户注册页面
     * ---------------------------------------- */
    public function regist(){
        cookie('client_ip', $_SERVER['REMOTE_ADDR'], 3600) ;    // 取注册页面IP地址存入COOKIE

        $dtDetAreaProvince = M(TB_DET_AREA_PROVINCE) -> select() ;  // 取省级地域信息
        $dtDetUserEdu      = M(TB_DET_USER_EDU)      -> select() ;  // 取学历维表信息
        $dtDetUserCareer   = M(TB_DET_USER_CAREER)   -> select() ;  // 取职业维表信息

        $this -> assign('province', $dtDetAreaProvince) ;
        $this -> assign('edu',      $dtDetUserEdu) ;
        $this -> assign('career',   $dtDetUserCareer) ;
        $this -> display() ;
    }

    /* 用户注册提交信息处理
     * ---------------------------------------- */
    public function registSubmit(){
        $type = $_POST['regist_type'] ;

        switch($type){
            case '10' :    // 基本资料注册新用户
                $data_bas = json_decode($_POST['data_bas'], true) ;

                $user_code = userCreate($data_bas) ;

                echo $user_code ;
                break ;

            case '01' :    // 已注册用户完善资料
                $user_code = $_POST['user_code'] ;
                $data_exp = json_decode($_POST['data_exp'], true) ;

                $user_code = userInfoAlter($user_code, $data_exp) ;
                $data_score = array('user_score'=>200) ;
                $user_code = userAccoutAlter($user_code, $data_score) ;

                echo $user_code ;
                break ;

            case '11' :    // 完整资料注册新用户
                $data_bas = json_decode($_POST['data_bas'], true) ;
                $data_exp = json_decode($_POST['data_exp'], true) ;

                $user_code = userCreate($data_bas) ;
                $user_code = userInfoAlter($user_code, $data_exp) ;
                $data_score = array('user_score'=>200) ;
                $user_code = userAccoutAlter($user_code, $data_score) ;

                echo $user_code ;
                break ;
        }
    }
}