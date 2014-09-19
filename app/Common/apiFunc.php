<?php

/**
 * Name        : apiFunctions.php
 * Type        : Function
 * Description : 接口函数库
 *
 * Create-time : 2014-4-14 17:52:24
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

header("Content-type:text/html;charset=utf-8");

/*
* @Name   : api_param_check
* @Desc   : 接口参数校验
* @Param  : array  $param   接口参数（包括接口名称）
* @Return : array  $result  校验后的结果
*/
function api_param_check($param){
    // 取接口参数规则配置表函数对应规则
    $api    = $param['api'] ;
    $config = M(TB_API_PARAM_CHECK_CONFIG) -> where("api_name = '$api'") -> select() ;

    // 解析返回的规则数据
    if(count($config) > 0){
        // 根据规则进行校验
        for($i = 0; $i < count($config); $i++){
            $para = $config[$i] ;

            // 必选项校验，如未输入必选项退出返回错误信息
            if($para['param_must'] && (!array_key_exists($para['param_name'], $param) || $param[$para['param_name']] == NULL)){
                return array (
                    'data'   => '-9001'                                                            ,// 错误代码
                    'info'   => "接口" . $api . "的必选参数（" . $para['param_name'] . "）未输入"  ,// 错误信息
                    'status' => 0                                                                  ,// 返回状态
                ) ;
            }

            // 参数类型转换
            if($param[$para['param_name']]){
                switch($para['param_type']){
                    case 'md5' : 
                        // MD5密码解析
                        $data[$para['param_name']] = MD5($param[$para['param_name']]) ;
                        break ;
                    case 'json' : 
                        // JSON格式解析
                        $data[$para['param_name']] = json_decode($param[$para['param_name']], true) ;
                        break ;
                    default :
                        $data[$para['param_name']] = $param[$para['param_name']] ;
                        break ;
                }
            }
        }

        return array (
            'data'   => $data                 ,// 汇总参数
            'info'   => "接口参数校验通过"    ,// 返回信息
            'status' => 1                     ,// 返回状态
        ) ;
    }else{
        // 要调用的接口不存在退出返回错误信息
        return array (
            'data'   => '-9000'                   ,// 错误代码
            'info'   => "接口" . $api . "未配置"  ,// 错误信息
            'status' => 0                         ,// 返回状态
        ) ;
    }
}


/*
* @Name   : api_right_check
* @Desc   : 接口权限校验
* @Param  : json    user_info     用户信息(昵称、密码、邮件)
* @Return : number  $survey_code  新用户编码
*/
function api_right_check($api){
    return array (
        'data'   => $api                ,// 接口信息
        'info'   => "接口权限校验通过"  ,// 返回信息
        'status' => 1                   ,// 返回状态
    ) ;
}

/**************************************** 用户模块接口 ****************************************/

/*
* @Name   : api_user_create
* @Desc   : 新建用户接口
* @Param  : string  user_name    用户名称
* @Param  : string  user_pwd     用户密码
* @Param  : string  user_email   用户电邮
* @Param  : string  creat_ip     注册IP
* @Return : number  survey_code  新用户编码
*/
function api_user_create(){
    // $user = func_get_args()[0] ;  // 取参数：用户注册信息

    if($user_code = userCreate(func_get_args()[0])){
        return array (
            'data'   => $user_code                 ,// 新建的用户编码
            'info'   => "success:api_user_create"  ,// 创建用户成功信息
            'status' => 1                          ,// 返回状态
        ) ;
    }else{
        return array (
            'data'   => 0                          ,// 错误代码
            'info'   => "success:api_user_create"  ,// 错误信息
            'status' => 0                          ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_user_count
* @Desc   : 用户数统计汇总（根据传入的查询条件SQL直接统计总用户数）
* @Param  : json    condition_key   查询条件（表字段：key=>value）
* @Param  : json    condition_sql   查询条件（SQL语句：key=>sql）
* @Return : number  user_count      查询到的用户数
*/
function api_user_count(){
    $arg    = func_get_args()[0] ;  // 取参数：统计条件
    $column = M(TB_BAS_USER_INFO) -> getDbFields() ;
    
    if(array_key_exists('condition_key', $arg)){
        // 表字段型条件需要筛选出非表字段的条件属性
        foreach($arg['condition_key'] as $key => $value){
            if(!in_array($key, $column)){
                unset($arg['condition_key'][$key]) ;
            }
        }

        // 筛选完成后重新汇总
        if(count($arg['condition_key']) > 0){
            $condition = $arg['condition_key'] ;
        }
    }else if(array_key_exists('condition_sql', $arg)){
        $condition = implode(' and ', $arg['condition_sql']) ;
    }else{
        return array (
            'data'   => 9000                ,// 错误代码
            'info'   => "找不到合适的参数"  ,// 错误信息
            'status' => 0                   ,// 返回状态
        ) ;
    }

    // 带入查询对应条件的查询用户数
    if($condition){
        $user_cnt = M(TB_BAS_USER_INFO) -> where($condition) -> count() ;
    }

    if($user_cnt != NULL){
        return array (
            'data'   => $user_cnt                 ,// 新建的用户编码
            'info'   => "success:api_user_count"  ,// 创建用户成功信息
            'status' => 1                         ,// 返回状态
        ) ;
    }else{
        return array (
            'data'   => NULL                      ,// 错误代码
            'info'   => "failed:api_user_count"   ,// 错误信息
            'status' => 0                         ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_user_info_find
* @Desc   : 用户汇总信息查询接口：包含用户基本信息和账户信息
* @Param  : number  user_code   用户编码（必选）
* @Param  : number  user_md5    用户md5码（可选）
* @Return : json    $user       用户信息汇总
*/
function api_user_info_find(){
    // 直接传入参数取用户信息
    if($user = userInfoFind(func_get_args()[0])){
        return array (
            'data'   => $user                         ,// 用户信息
            'info'   => "success:api_user_info_find"  ,// 成功信息
            'status' => 1                             ,// 返回状态
            'type'   => 'json'                        ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => 0                             ,// 错误代码
            'info'   => "failed:api_user_info_find"   ,// 错误信息
            'status' => 0                             ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_user_action_verify
* @Desc   : 用户行为验证（验证用户对某个目标行为是否进行过）
* @Param  : number  user_code   用户编码（必选）
* @Param  : number  target      目标编码（必选）
* @Param  : string  action      用户行为（必选）
* @Return : json    user        查询结果
*/
function api_user_action_verify(){
    $user_code = func_get_args()[0]['user_code'] ;  // 取参数：用户编码
    $action    = func_get_args()[0]['action'] ;     // 取参数：用户行为
    $target    = func_get_args()[0]['target'] ;     // 取参数：目标编码

    $cfg = array(
        // 创建调查
        'create_survey' => array(
            'table' => TB_BAS_SURVEY_INFO,
            'cond'  => "user_code = $user_code and survey_code = $target",
        ),
        // 参与调查
        'answer_survey' => array(
            'table' => TB_BAS_SURVEY_ACTION,
            'cond'  => "user_code = $user_code and survey_code = $target",
        ),
        // 发布的调查
        'follow_survey' => array(
            'table' => TB_BAS_USER_FOLLOW_SURVEY,
            'cond'  => "user_code = $user_code and follow_code = $target",
        ),
        // 发布的调查
        'answer_user' => array(
            'table' => TB_BAS_USER_FOLLOW_USER,
            'cond'  => "user_code = $user_code and follow_code = $target",
        ),
    ) ;

    // 返回查询结果
    if(M($cfg[$action]['table']) -> where($cfg[$action]['cond']) -> count()){
        return array (
            'data'   => 1                                 ,// 调查信息
            'info'   => "success:api_user_action_verify"  ,// 成功信息
            'status' => 1                                 ,// 返回状态
        ) ;
    }else{
        return array (
            'data'   => 0                                ,// 错误代码
            'info'   => "failed:api_user_action_verify"  ,// 错误信息
            'status' => 0                                ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_user_list_select
* @Desc   : 用户清单查询
* @Param  : number  user_code    用户编码（必选）
* @Param  : string  type         用户类型（可选）
* @Return : json    user         查询结果
*/
function api_user_list_select(){
    $user_code = func_get_args()[0]['user_code'] ;  // 取参数：用户编码
    $type      = func_get_args()[0]['type'] ;       // 取参数：调查类型

    $data                = array() ;
    $user                = array() ;
    $url_user            = U('user/user/visit') ;
    $tbBasUserInfo       = M(TB_BAS_USER_INFO)        -> getTableName() ;
    $tbBasUserAccout     = M(TB_BAS_USER_ACCOUT)      -> getTableName() ;
    $tbDetUserLevel      = M(TB_DET_USER_LEVEL)       -> getTableName() ;
    $tbBasUserFollowUser = M(TB_BAS_USER_FOLLOW_USER) -> getTableName() ;

    $cfg = array(
        // 关注的调查
        'follow' => array(
            'table' => "," . $tbBasUserFollowUser . " d",
            'cond'  => "and a.user_code = d.follow_code and d.user_code = $user_code ",
        ),
    ) ;

    if($type){
        $data[$type] = $cfg[$type] ;
    }else{
        $data = $cfg ;
    }
    
    foreach ($data as $key => $value) {
        $sql =  "select a.user_code, a.user_nick, b.*, c.user_level_desc, concat('$url_user?code=', a.user_code) url_user ". 
                "from $tbBasUserInfo a, $tbBasUserAccout b, $tbDetUserLevel c" . $value['table'] . " ".
                "where a.user_code = b.user_code and b.user_level = c.user_level_value " . $value['cond'].
                "order by b.user_level desc" ;
        if(is_array($query = M() -> query($sql))){
            $user[$key] = $query ;
        }else{
            return array (
                'data'   => 0                              ,// 错误代码
                'info'   => "failed:api_user_list_select"  ,// 错误信息
                'status' => 0                              ,// 返回状态
            ) ;  
        }
    }

    // 返回查询结果
    if($user){
        return array (
            'data'   => $user                           ,// 调查信息
            'info'   => "success:api_user_list_select"  ,// 成功信息
            'status' => 1                               ,// 返回状态
            'type'   => 'json'                          ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => 0                              ,// 错误代码
            'info'   => "failed:api_user_list_select"  ,// 错误信息
            'status' => 0                              ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_user_action_cfg_select
* @Desc   : 用户行为配置规则查询接口
* @Param  : json  action  用户行为（用户行为）
* @Return : json  $rule   查询后的规则数据
*/
function api_user_action_cfg_select(){
    $action = func_get_args()[0]['action'] ;   // 取参数：行为参数
    
    for($a = 0; $a < count($action); $a++){
        $config = M(TB_DET_USER_ACTION_CONFIG) -> where("action_code = ".$action[$a]['code']) -> select() ;

        for($i = 0; $i < count($config); $i++){
            $rule[$action[$a]['code']][$config[$i]['update_type']]['logic'] = $config[$i]['update_logic'] ;
            
            // 如果没有对应的值需要根据配置项计算出结果值
            if(!$config[$i]['update_value']){
                $condition = $config[$i]['code_column'].' = '.$action[$a]['value'] ;
                $value     = M($config[$i]['table_name']) -> where("$condition") -> find() ;

                $rule[$action[$a]['code']][$config[$i]['update_type']]['value'] = $value[$config[$i]['value_column']] ;
            }else{
                $rule[$action[$a]['code']][$config[$i]['update_type']]['value'] = $config[$i]['update_value'] ;
            }
        }
    }

    // 返回数据
    if($rule){
        return array (
            'data'   => $rule                                 ,// 行为规则配置信息
            'info'   => "success:api_user_action_cfg_select"  ,// 成功信息
            'status' => 1                                     ,// 返回状态
            'type'   => 'json'                                ,// 数据类型

        ) ;
    }else{
        return array (
            'data'   => 0                                     ,// 错误代码
            'info'   => "failed:api_user_action_cfg_select"   ,// 错误信息
            'status' => 0                                     ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_user_follow_query
* @Desc   : 用户关注信息查询接口
* @Params : string  $follow_type  查询类型（必选）（user/survey）
* @Params : string  $query_type   查询方式类型（可选）（select/count）
* @Params : number  $user_code    用户编码（可选）
* @Params : number  $query_code   查询对象编码（可选）
* @Return : json    $data         查询到的目标统计数据
*/
function api_user_follow_query(){
    $follow_type = func_get_args()[0]['follow_type'] ;  // 取参数：查询类型
    $query_type  = func_get_args()[0]['query_type'] ;   // 取参数：查询方式类型
    $user_code   = func_get_args()[0]['user_code'] ;    // 取参数：用户编码
    $follow_code = func_get_args()[0]['follow_code'] ;  // 取参数：查询对象编码

    $tbBasSurveyInfo   = M(TB_BAS_SURVEY_INFO)        -> getTableName() ;
    $tbDetSurveyState  = M(TB_DET_SURVEY_STATE)       -> getTableName() ;
    $tbBasSurveyFollow = M(TB_BAS_USER_FOLLOW_SURVEY) -> getTableName() ;

    switch($query_type){
        case 'select' :
            $sql =  "select ".
                    "    a.survey_code, a.survey_name, a.state_time, a.survey_state, c.state_desc_sketch survey_state_desc, ".
                    "    date(a.start_time) start_date, concat('$url_action?code=', a.survey_code) url_action ".
                    "from $tbBasSurveyInfo a , $tbBasSurveyFollow b , $tbDetSurveyState c ".
                    "where a.survey_code = b.follow_code ".
                    "and a.survey_state = c.survey_state_code ".
                    "and a.survey_state >= 3 ".
                    "and b.user_code = $user_code ".
                    "order by a.end_time desc" ;
            $data = M() -> query($sql) ;
            break ;

        case 'count' :
            $data = userFollowQuery($follow_type, $query_type, array('user_code' => $user_code, 'follow_code' => $follow_code)) ;
            break ;
    }

    // 返回数据
    if($data){
        return array (
            'data'   => $data                            ,// 行为规则配置信息
            'info'   => "success:api_user_follow_query"  ,// 成功信息
            'status' => 1                                ,// 返回状态
            'type'   => 'json'                           ,// 数据类型

        ) ;
    }else{
        return array (
            'data'   => 0                                ,// 错误代码
            'info'   => "failed:api_user_follow_query"   ,// 错误信息
            'status' => 0                                ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_user_info_update
* @Desc   : 用户信息更新接口
* @Param  : number   user_code      用户编码
* @Param  : string   user_md5       用户MD5码
* @Param  : json     data           要更新的用户信息
* @Return : boolean  true/false     更新成功或失败标志
*/
function api_user_info_update(){
    $user_code = func_get_args()[0]['user_code'] ;  // 取参数：用户编码
    $user_md5  = func_get_args()[0]['user_md5'] ;   // 取参数：用户MD5码
    $data      = func_get_args()[0]['data'] ;       // 取参数：要更新的用户信息

    // 如果来源数据的用户就是调查创建用户才进行更新操作
    if($user_code && $user_md5 && $data){
        if(userInfoUpdate($user_code, $user_md5, $data)){
            return array (
                'data'   => true                            ,// 返回结果
                'info'   => "success:api_user_info_update"  ,// 成功信息
                'status' => 1                               ,// 返回状态
            ) ;
        }else{
            return array (
                'data'   => false                          ,// 返回结果
                'info'   => "failed:api_user_info_update"  ,// 失败信息
                'status' => 0                              ,// 返回状态
            ) ;
        }
    }else{
        return array (
            'data'   => false                          ,// 返回结果
            'info'   => "failed:api_user_info_update"  ,// 失败信息
            'status' => 0                              ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_user_action_log_select
* @Desc   : 用户行为日志查询接口
* @Param  : number  user_code    用户编码（必选）
* @Param  : string  action_type  行为类型(score/coins)（可选）
* @Return : json    $jsonAction  用户行为信息
*/
function api_user_action_log_select(){
    $user_code   = func_get_args()[0]['user_code'] ;    // 取参数：用户编码
    $action_type = func_get_args()[0]['action_type'] ;  // 取参数：行为类型

    $data                  = array() ;
    $log                   = array() ;
    $url_visit             = U('survey/survey/visit') ;
    $tbBasUserActionLog    = M(TB_BAS_USER_ACTION_LOG)    -> getTableName() ;
    $tbDetUserActionConfig = M(TB_DET_USER_ACTION_CONFIG) -> getTableName() ;

    $cfg = array(
        // 创建的调查
        'coins' => array(
            'action' => 'user_coins',
        ),
        // 发布的调查
        'score' => array(
            'action' => 'user_score',
        ),
    ) ;

    if($action_type){
        $data[$action_type] = $cfg[$action_type] ;
    }else{
        $data = $cfg ;
    }
    
    foreach ($data as $key => $value) {
        // 取用户行为日志信息
        $sql =  "select a.* , b.action_desc, concat('$url_visit?code=', a.action_value) url_visit ".
                "from $tbBasUserActionLog a , $tbDetUserActionConfig b ".
                "where a.action_code = b.action_code ".
                "and a.action_type = '". $value['action']."' and b.update_type = '". $value['action']."' and a.user_code = $user_code ".
                "order by a.action_time desc" ;
        if($query = M() -> query($sql)){
            $log[$key] = $query ;
        }
    }

    if(count($log)){
        return array (
            'data'   => $log                                  ,// 行为规则配置信息
            'info'   => "success:api_user_action_log_select"  ,// 成功信息
            'status' => 1                                     ,// 返回状态
            'type'   => 'json'                                ,// 数据类型

        ) ;
    }else{
        return array (
            'data'   => 0                                     ,// 错误代码
            'info'   => "failed:api_user_action_log_select"   ,// 错误信息
            'status' => 0                                     ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_user_follow_update
* @Desc   : 用户关注信息更新接口
* @Params : number   $user_code    用户编码
* @Params : string   $follow_type  更新对象类型(user/survey)
* @Params : number   $follow_code  更新对象编码
* @Params : string   $update_type  更新方式类型(add/del)
* @Return : json     $data         更新后的目标统计信息
*/
function api_user_follow_update(){
    $user_code   = func_get_args()[0]['user_code'] ;      // 取参数：用户编码
    $follow_type = func_get_args()[0]['follow_type'] ;    // 取参数：更新对象类型
    $follow_code = func_get_args()[0]['follow_code'] ;    // 取参数：更新对象编码
    $update_type = func_get_args()[0]['update_type'] ;    // 取参数：更新方式类型

    if(userFollowUpdate($user_code, $follow_type, $follow_code, $update_type)){
        return array (
            'data'   => 1                                 ,// 成功标志
            'info'   => "success:api_user_follow_update"  ,// 成功信息
            'status' => 1                                 ,// 返回状态

        ) ;
    }else{
        return array (
            'data'   => 0                                 ,// 错误代码
            'info'   => "failed:api_user_follow_update"   ,// 错误信息
            'status' => 0                                 ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_user_follow_svtype_query
* @Desc   : 用户关注调查分类查询接口
* @Params : number   $user_code    用户编码（可选）
* @Params : string   $query_type   查询方式（可选）| select/count/stats 
* @Params : string   $condition    查询条件（可选）
* @Return : json     $data         查询结果
*/
function api_user_follow_svtype_query(){
    $user_code  = func_get_args()[0]['user_code'] ;    // 取参数：用户编码
    $query_type = func_get_args()[0]['query_type'] ;   // 取参数：查询方式
    $condition  = func_get_args()[0]['condition'] ;    // 取参数：查询条件

    if($data = M(TB_BAS_USER_FOLLOW_SVTYPE) -> where("user_code = $user_code") -> select()){
        return array (
            'data'   => $data                                   ,// 查询结果
            'info'   => "success:api_user_follow_svtype_query"  ,// 成功信息
            'status' => 1                                       ,// 返回状态

        ) ;
    }else{
        return array (
            'data'   => 0                                       ,// 错误代码
            'info'   => "failed:api_user_follow_svtype_query"   ,// 错误信息
            'status' => 0                                       ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_user_follow_svtype_update
* @Desc   : 用户关注调查分类更新接口
* @Params : string   $update_type  更新方式（可选）
* @Params : number   $user_code    用户编码（可选）
* @Params : string   $svtype       调查类型编码（可选）
* @Return : boolean  true/false    更新结果
*/
function api_user_follow_svtype_update(){
    $update_type = func_get_args()[0]['update_type'] ;           // 取参数：更新方式
    $user_code   = func_get_args()[0]['user_code'] ;             // 取参数：用户编码
    $svtype      = explode(',', func_get_args()[0]['svtype']) ;  // 取参数：调查类型

    $tbDetSurveyTypeSub    = M(TB_DET_SURVEY_TYPE_SUB)    -> getTableName() ;
    $tbBasUserFollowSvtype = M(TB_BAS_USER_FOLLOW_SVTYPE) -> getTableName() ;

    // 更新方式判断处理
    if($update_type == 'cover'){
        M(TB_BAS_USER_FOLLOW_SVTYPE) -> where("user_code = $user_code") -> delete() ;
    }

    // 更新关注类型
    for($i = 0; $i < count($svtype); $i++){
        switch (strlen($svtype[$i])) {
            case 4 :  // 调查小类
                $sql = "delete from $tbBasUserFollowSvtype where user_code = $user_code and svtype_sub in ( ".
                       "select survey_type_sub_code from $tbDetSurveyTypeSub where survey_type_code = ". $svtype[$i]. ") " ;
                M() -> execute($sql) ;

                $data = array('user_code' => $user_code, 'svtype_main' => $svtype[$i], 'follow_time' => date('Y-m-d H:i:s')) ;
                break ;

            case 5 :  // 调查大类
                $data = array('user_code' => $user_code, 'svtype_sub' => $svtype[$i], 'follow_time' => date('Y-m-d H:i:s')) ;
                break ;
        }

        if(!insertTable(TB_BAS_USER_FOLLOW_SVTYPE, $data)){
            return array (
                'data'   => 0                                       ,// 错误编码
                'info'   => "failed:api_user_follow_svtype_update"  ,// 错误信息
                'status' => 1                                       ,// 返回状态
            ) ;
        }
    }

    // 统计关注的调查小类按对应大类分组统计数量
    $sql = "select a.survey_type_code, count(1) cnt from $tbDetSurveyTypeSub a, $tbBasUserFollowSvtype b ".
           "where a.survey_type_sub_code = b.svtype_sub and b.user_code = $user_code group by a.survey_type_code" ;
    $stats = M() -> query($sql) ;

    // 遍历统计结果判断处理
    for($i = 0; $i < count($stats); $i++){
        // 统计目标调查大类下在维表中包含的调查小类数量
        $cnt = M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_code = ". $stats[$i]['survey_type_code']) -> count() ;

        // 如果关注的小类数量等于维表的小类数量，切换到大类关注
        if($stats[$i]['cnt'] == $cnt){
            $sql = "delete from $tbBasUserFollowSvtype where user_code = $user_code and svtype_sub in ( ".
                   "select survey_type_sub_code from $tbDetSurveyTypeSub where survey_type_code = ". $stats[$i]['survey_type_code']. ") " ;
            M() -> execute($sql) ;

            $data = array('user_code' => $user_code,'svtype_main' => $stats[$i]['survey_type_code'], 'follow_time' => date('Y-m-d H:i:s')) ;
            if(!insertTable(TB_BAS_USER_FOLLOW_SVTYPE, $data)){
                return array (
                    'data'   => 0                                       ,// 错误编码
                    'info'   => "failed:api_user_follow_svtype_update"  ,// 错误信息
                    'status' => 1                                       ,// 返回状态
                ) ;
            }
        }
    }

    return array (
        'data'   => 1                                        ,// 成功标志
        'info'   => "success:api_user_follow_svtype_update"  ,// 成功信息
        'status' => 1                                        ,// 返回状态
    ) ;
}

/**************************************** 调查模块接口 ****************************************/

/*
* @Name   : api_survey_create
* @Desc   : 新建调查接口
* @Param  : number  user_code     用户编码（必选）
* @Param  : number  survey_code   调查编码（可选）
* @Param  : number  survey_state  调查状态（必选）
* @Param  : json    info          调查信息（必选）
* @Param  : json    question      问题信息（必选）
* @Return : number  $survey_code  新调查编码
*/
function api_survey_create(){
    $user_code    = func_get_args()[0]['user_code'] ;    // 取参数：用户编码
    $survey_code  = func_get_args()[0]['survey_code'] ;  // 取参数：调查编码
    $info         = func_get_args()[0]['info'] ;         // 取参数：调查信息
    $question     = func_get_args()[0]['question'] ;     // 取参数：问题信息

    if($user_code){
        // 因为前台自动保存方式有可能传入空值调查名称，所以给一个默认值以方便用户管理调查
        if($info['survey_name'] == null){
            $info['survey_name'] = '未命名' ;
        }

        // 先判断POST的调查编码是否存在：不存在则新建调查编码，存在则修改目标调查编码的相关信息
        if(!$survey_code){
            $survey_code = surveyCreate($user_code) ;
            if(!$survey_code){
                return array (
                    'data'   => false                   ,// 错误编码
                    'info'   => "初始创建调查编码失败"  ,// 错误信息
                    'status' => 0                       ,// 返回状态
                ) ;
            }
        }

        // 更新调查基本信息
        if($info){
            // 活动时间处理
            if($info['length_day']){
                $length_day       = $info['length_day'] ;
                $start_time       = $data['start_time'] = date('Y-m-d H:i:s') ;
                $data['end_time'] = date('Y-m-d H:i:s', strtotime("$start_time + $length_day day")) ;
                unset($info['length_day']) ;
            }

            if(!surveyInfoAlter($survey_code, $info)){
                return array (
                    'data'   => false                   ,// 错误编码
                    'info'   => "更新调查基本信息失败"  ,// 错误信息
                    'status' => 0                       ,// 返回状态
                ) ;
            }
        }

        // 更新调查题目信息
        if($question){
            if(!surveyQuestionDelete($survey_code) || !surveyQuestionAlter($user_code, $survey_code, $question)){
                return array (
                    'data'   => false               ,// 错误编码
                    'info'   => "更新题目信息失败"  ,// 错误信息
                    'status' => 0                   ,// 返回状态
                ) ;
            }
        }

        // 如果调查状态是发布状态，还要更新用户账户相关信息
        if(intval($info['survey_state']) == 2){
            if(!userActionUpdate($user_code, 1002, $survey_code)){
                return array (
                    'data'   => false                   ,// 错误编码
                    'info'   => "更新用户账户信息失败"  ,// 错误信息
                    'status' => 0                       ,// 返回状态
                ) ;
            }
        }

        // 以上所有顺利完成，更新正式的最新的调查状态并返回结果
        $data['survey_state'] = $info['survey_state'] ;
        $data['state_time']   = date('Y-m-d H:i:s') ;

        if(M(TB_BAS_SURVEY_INFO) -> where("survey_code = '$survey_code'")-> save($data)){
            return array (
                'data'   => $survey_code                 ,// 调查编码
                'info'   => "success:api_survey_create"  ,// 成功信息
                'status' => 1                            ,// 返回状态
            ) ;
        }else{
            return array (
                'data'   => false                       ,// 错误编码
                'info'   => "failed:api_survey_create"  ,// 错误信息
                'status' => 0                           ,// 返回状态
            ) ;
        }
    }else{
        return array (
            'data'   => false           ,// 错误编码
            'info'   => "用户编码无效"  ,// 错误信息
            'status' => 0               ,// 返回状态
        ) ;
    }


}

/*
* @Name   : api_survey_info_find
* @Desc   : 调查信息查询接口
* @Param  : number  survey_code   调查编码
* @Return : json    $survey_info  调查基本信息
*/
function api_survey_info_find(){
    $survey_code = func_get_args()[0]['survey_code'] ;  // 取参数：调查编码
    $survey      = surveyInfoSelect($survey_code) ;

    // 返回查询结果
    if($survey){
        return array (
            'data'   => $survey                         ,// 调查信息
            'info'   => "success:api_survey_info_find"  ,// 成功信息
            'status' => 1                               ,// 返回状态
            'type'   => 'json'                          ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => 0                              ,// 错误代码
            'info'   => "failed:api_survey_info_find"  ,// 错误信息
            'status' => 0                              ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_survey_info_update
* @Desc   : 调查信息修改接口
* @Param  : number   user_code    用户编码
* @Param  : number   survey_code  调查编码
* @Param  : json     sv_info      调查基本信息
* @Param  : json     sv_item      调查题目信息
* @Return : boolean  true/false   修改成功或失败标志
*/
function api_survey_info_update(){
    $user_code   = func_get_args()[0]['user_code'] ;    // 取参数：用户编码
    $survey_code = func_get_args()[0]['survey_code'] ;  // 取参数：调查编码

    // 如果来源数据的用户就是调查创建用户才进行更新操作
    if($user_code == M(TB_BAS_SURVEY_INFO) -> where("survey_code = '$survey_code'") -> getField('user_code')){
        // 更新目标调查基本信息
        if($sv_info = func_get_args()[0]['sv_info']){   
            $sv_info['state_time'] = date('Y-m-d H:i:s') ;     // 数据更新时间

            if(!surveyInfoAlter($survey_code, $sv_info)){
                return array (
                    'data'   => -1                               ,// 错误代码
                    'info'   => "failed:api_survey_info_update"  ,// 错误信息
                    'status' => 0                                ,// 返回状态
                ) ;
            }
        }

        if($sv_item = func_get_args()[0]['sv_item']){
            // 删除目标调查相关问题信息
            if(surveyQuestionDelete($survey_code)){
                // 更新目标调查相关问题信息
                if(!surveyQuestionAlter($survey_code, $sv_item)){
                    return array (
                        'data'   => -2                               ,// 错误代码
                        'info'   => "failed:api_survey_info_update"  ,// 错误信息
                        'status' => 0                                ,// 返回状态
                    ) ;
                }
            }else{
                return array (
                    'data'   => -3                               ,// 错误代码
                    'info'   => "failed:api_survey_info_update"  ,// 错误信息
                    'status' => 0                                ,// 返回状态
                ) ;
            }
        }
        return array (
            'data'   => $survey_code                      ,// 调查编码
            'info'   => "success:api_survey_info_update"  ,// 成功信息
            'status' => 1                                 ,// 返回状态
        ) ;
    }else{
        return array (
            'data'   => 0                                ,// 错误代码
            'info'   => "failed:api_survey_info_update"  ,// 错误信息
            'status' => 0                                ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_survey_type_list_select
* @Desc   : 调查清单查询
* @Param  : string  type    调查类型（可选）（调查大类/调查小类）
* @Param  : string  mode    调查模式（可选）（new/hot/rec）
* @Param  : number  page    查询页码（可选）
* @Param  : number  pnum    数据量（可选）
* @Return : json    survey  调查清单
*/
function api_survey_type_list_select(){
    $type = func_get_args()[0]['type'] ;  // 取参数：调查类型
    $mode = func_get_args()[0]['mode'] ;  // 取参数：调查模式
    $page = func_get_args()[0]['page'] ;  // 取参数：查询页码
    $pnum = func_get_args()[0]['pnum'] ;  // 取参数：数据量

    $data               = array() ;
    $url_user           = U('user/user/visit') ;
    $url_visit          = U('survey/survey/visit') ;
    $tbBasSurveyInfo    = M(TB_BAS_SURVEY_INFO)     -> getTableName() ;
    $tbDetSurveyTypeSub = M(TB_DET_SURVEY_TYPE_SUB) -> getTableName() ;

    // 判断调查类型设计调查类型条件（默认第一个调查类型1001）
    switch(strlen($type)){
        case 4 :
            if(M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_code = $type") -> find()){
                $and = "and a.survey_type = $type " ;
            }else{
                $and = "and a.survey_type = 1001 " ; 
            }
            break ;

        case 5 :
            if(M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_sub_code = $type") -> find()){
                $and = "and a.survey_type_sub = $type " ;
            }else{
                $and = "and a.survey_type = 1001 " ; 
            }
            break ;

        default :
            $and = "and a.survey_type = 1001 " ;
            break ;
    }

    $modes = array(
        // 最新问卷：开始时间.DESC -> 推荐等级.ASC -> 参与次数.ASC
        'new' => array(
            'order' => "order by a.start_time desc, a.recomm_grade, a.answer_num "
        ),
        // 参与人数.DESC -> 结束时间.DESC -> 开始时间.DESC
        'hot' => array(
            'order' => "order by a.answer_num desc, a.end_time desc, a.start_time desc "
        ),
        // 推荐等级.ASC -> 结束时间.DESC -> 参与人数.ASC
        'rec' => array(
            'order' => "order by a.recomm_grade, a.end_time desc, a.answer_num "
        ),
    ) ;

    $mode ? $data[$mode] = $modes[$type] : $data = $modes  ;
    $page ? $page : $page = 1  ;
    $pnum ? $pnum : $pnum = 10 ;
    $limit = "limit " . strval(($page - 1) * $pnum + 1) . ", $pnum" ;  // 计算页码
    
    foreach ($data as $key => $cond) {
        $sql =  "select distinct a.survey_code, a.survey_name, a.survey_desc, a.user_nick, a.question_num, ".
                "b.survey_type_name, b.survey_type_code, b.survey_type_sub_code, b.survey_type_sub_name, ".
                "date_relative_now(a.start_time) start_date, ".
                "concat('$url_user?code=', a.user_code) url_user, concat('$url_visit?code=', a.survey_code) url_visit ". 
                "from $tbBasSurveyInfo a, $tbDetSurveyTypeSub b ".
                "where a.survey_type_sub = b.survey_type_sub_code ".
                "and survey_state > 0 ". $and. $cond['order']. $limit ;
                // "and survey_state > 1, a.start_time is not null ". $and. $order. $limit ;
                
        if($query = M() -> query($sql)){
            $survey[$key] = $query ;
        }
    }

    // 返回查询结果
    if(count($survey)){
        return array (
            'data'   => $survey                                ,// 调查信息
            'info'   => "success:api_survey_type_list_select"  ,// 成功信息
            'status' => 1                                      ,// 返回状态
            'type'   => 'json'                                 ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => 0                                     ,// 错误代码
            'info'   => "failed:api_survey_type_list_select"  ,// 错误信息
            'status' => 0                                     ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_survey_action_list_select
* @Desc   : 调查清单查询
* @Param  : number  user_code    用户编码（必选）
* @Param  : string  type         调查类型（可选）
* @Return : json    survey       查询结果
*/
function api_survey_action_list_select(){
    $user = func_get_args()[0]['user_code'] ;  // 取参数：用户编码
    $type = func_get_args()[0]['type'] ;       // 取参数：调查类型

    $data                  = array() ;
    $survey                = array() ;
    $url_user              = U('user/user/visit') ;
    $url_type              = U('survey/survey/type') ;
    $url_visit             = U('survey/survey/visit') ;
    $url_answer            = U('survey/survey/answer') ;
    $url_create            = U('survey/survey/create') ;
    $url_analyse           = U('survey/survey/analyse') ;
    $tbBasSurveyInfo       = M(TB_BAS_SURVEY_INFO)        -> getTableName() ;
    $tbDetSurveyType       = M(TB_DET_SURVEY_TYPE)        -> getTableName() ;
    $tbDetSurveyState      = M(TB_DET_SURVEY_STATE)       -> getTableName() ;
    $tbBasSurveyAction     = M(TB_BAS_SURVEY_ACTION)      -> getTableName() ;
    $tbBasUserFollowSurvey = M(TB_BAS_USER_FOLLOW_SURVEY) -> getTableName() ;

    $action = array(
        // 创建的调查
        'create' => array(
            'table' => "",
            'cond'  => "and a.survey_state >= 1 and a.user_code = $user ",
            'order' => 'a.create_time desc ',
        ),
        // 发布的调查
        'publish' => array(
            'table' => "",
            'cond'  => "and a.survey_state > 2 and a.user_code = $user ",
            'order' => 'a.create_time desc ',
        ),
        // 参与的调查
        'answer' => array(
            'table' => "," . $tbBasSurveyAction . " d",
            'cond'  => "and a.survey_code = d.survey_code and a.survey_state > 1 and d.user_code = $user ",
            'order' => 'd.end_time desc ',
        ),
        // 关注的调查
        'follow' => array(
            'table' => "," . $tbBasUserFollowSurvey . " d",
            'cond'  => "and a.survey_code = d.follow_code and a.survey_state > 1 and d.user_code = $user ",
            'order' => 'd.follow_time desc ',
        ),
    ) ;

    // 根据入参查询
    $type ? $data[$type] = $action[$type] : $data = $action  ;
    
    foreach ($data as $key => $value) {
        $sql =  "select distinct a.survey_code, a.survey_name, a.survey_desc, a.user_code, a.user_nick, a.question_num, c.survey_type_name, ".
                "a.survey_state, b.state_desc_sketch survey_state_desc, date(a.create_time) create_date, date(a.start_time) start_date, ".
                "concat('$url_user?code=', a.user_code) url_user, concat('$url_create?code=', a.survey_code) url_create, ". 
                "concat('$url_visit?code=', a.survey_code) url_visit, concat('$url_answer?code=', a.survey_code) url_answer, ".
                "concat('$url_analyse?code=', a.survey_code) url_analyse, concat('$url_type?type=', a.survey_type) url_type ".
                "from $tbBasSurveyInfo a, $tbDetSurveyState b, $tbDetSurveyType c" . $value['table'] . " ".
                "where a.survey_state = b.survey_state_code and a.survey_type = c.survey_type_code " . $value['cond'].
                "order by " . $value['order'] ;
        if($query = M() -> query($sql)){
            $survey[$key] = $query ;
        }
    }

    // 返回查询结果
    if(count($survey)){
        return array (
            'data'   => $survey                                  ,// 调查信息
            'info'   => "success:api_survey_action_list_select"  ,// 成功信息
            'status' => 1                                        ,// 返回状态
            'type'   => 'json'                                   ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => 0                                       ,// 错误代码
            'info'   => "failed:api_survey_action_list_select"  ,// 错误信息
            'status' => 0                                       ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_survey_action_select
* @Desc   : 调查参与信息查询接口（废弃）
* @Param  : string  type         查询方式（必选）
* @Param  : number  survey_code  调查编码（必选）
* @Param  : number  user_code    用户编码（必选）
* @Return : json    data         用户相关行为信息
*/
function api_survey_action_select(){
    $type        = func_get_args()[0]['type'] ;         // 取参数：查询方式
    $survey_code = func_get_args()[0]['survey_code'] ;  // 取参数：调查编码
    $user_code   = func_get_args()[0]['user_code'] ;    // 取参数：用户编码

    $url_action  = U('survey/action') ;
    $url_alter   = U('survey/alter') ;
    $url_analyse = U('survey/analyse') ;

    $condition_us = "1 = 1" ;
    $condition_sv = "1 = 1" ;

    $tbBasSurveyInfo   = M(TB_BAS_SURVEY_INFO)   -> getTableName() ;
    $tbBasSurveyAction = M(TB_BAS_SURVEY_ACTION) -> getTableName() ;
    $tbDetSurveyState  = M(TB_DET_SURVEY_STATE)  -> getTableName() ;

    switch($type){
        case 'count' : 
            $count = M(TB_BAS_SURVEY_ACTION) -> where("user_code = '$user_code' and survey_code = '$survey_code'") -> count() ;

            if($count !== NULL){
                return array (
                    'data'   => $count                              ,// 统计的数量
                    'info'   => "success:api_survey_action_select"  ,// 成功信息
                    'status' => 1                                   ,// 返回状态

                ) ;
            }else{
                return array (
                    'data'   => false                              ,// 错误代码
                    'info'   => "failed:api_survey_action_select"  ,// 错误信息
                    'status' => 0                                  ,// 返回状态

                ) ;
            }
            break ;

        case 'list' :
            if($user_code){
                $condition_sv = "b.user_code = $user_code " ;

                if($survey_code){
                    $condition_sv = "b.survey_code = $survey_code " ;
                } ;

                $sql =  "select ".
                        "    a.survey_code, a.survey_name, a.state_time, a.survey_state, c.state_desc_sketch survey_state_desc, ".
                        "    date(a.start_time) start_date, concat('$url_action?code=', a.survey_code) url_action, ".
                        "    concat('$url_alter?code=', a.survey_code) url_alter, concat('$url_analyse?code=', a.survey_code) url_analyse ".
                        "from $tbBasSurveyInfo a , $tbBasSurveyAction b , $tbDetSurveyState c ".
                        "where a.survey_code = b.survey_code ".
                        "and a.survey_state = c.survey_state_code ".
                        "and $condition_us ".
                        "and $condition_sv ". 
                        "order by a.end_time desc" ;
                $data = M() -> query($sql) ;

                if($data){
                    return array (
                        'data'   => $data                               ,// 查询到的行为数据
                        'info'   => "success:api_survey_action_select"  ,// 成功信息
                        'status' => 1                                   ,// 返回状态

                    ) ;
                }else{
                    return array (
                        'data'   => false                              ,// 错误代码
                        'info'   => "failed:api_survey_action_select"  ,// 错误信息
                        'status' => 0                                  ,// 返回状态

                    ) ;
                }
            }else{
                return array (
                    'data'   => false                              ,// 错误代码
                    'info'   => "failed:api_survey_action_select"  ,// 错误信息
                    'status' => 0                                  ,// 返回状态

                ) ;
            }

            break ;
    }

    // 返回查询结果
    if($survey){
        return array (
            'data'   => $survey                             ,// 调查信息
            'info'   => "success:api_survey_action_select"  ,// 成功信息
            'status' => 1                                   ,// 返回状态
            'type'   => 'json'                              ,// 数据类型

        ) ;
    }else{
        return array (
            'data'   => false                              ,// 错误代码
            'info'   => "failed:api_survey_action_select"  ,// 错误信息
            'status' => 0                                  ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_survey_answer_submit
* @Desc   : 调查参与答题结果提交接口
* @Param  : json     survey       调查信息
* @Param  : json     question     问题信息
* @Return : boolean  true/false   汇总结果提交成功或失败标志
*/
function api_survey_answer_submit(){
    $survey      = func_get_args()[0]['survey'] ;    // 取参数：调查信息
    $question    = func_get_args()[0]['question'] ;  // 取参数：调查信息
    $user_code   = cookie('user_code') ;
    $survey_code = $survey['survey_code'] ;

    // 新增用户参与调查详情信息
    if(empty($survey) || empty($question) || !surveyActionAdd($survey, $question)){
        return array (
            'data'   => '更新调查参与信息失败'             ,// 错误代码
            'info'   => "failed:api_survey_answer_submit"  ,// 错误信息
            'status' => 0                                  ,// 返回状态
        ) ;
    }

    // 用户参与数据更新成功，再更新用户账户相关信息
    if(!userActionUpdate($user_code, 1001, $survey_code)){
        return array (
            'data'   => '更新用户账户信息失败'             ,// 错误代码
            'info'   => "failed:api_survey_answer_submit"  ,// 错误信息
            'status' => 0                                  ,// 返回状态
        ) ;
    }

    // 全部成功更新完毕返回结果
    return array (
        'data'   => $survey_code                        ,// 调查编码
        'info'   => "success:api_survey_answer_submit"  ,// 成功信息
        'status' => 1                                   ,// 返回状态
    ) ;
}

/*
* @Name   : api_survey_custom_option_add
* @Desc   : 自定义选项增加接口
* @Param  : number  user_code      选项创建用户编码
* @Param  : number  question_code  对应问题编码
* @Param  : json    custom_option  自定义选项信息
* @Return : bool    true/false     操作成功或失败标志
*/
function api_survey_custom_option_add(){
    $user_code   = func_get_args()[0]['user_code'] ;      // 取参数：用户编码
    $survey_code = func_get_args()[0]['survey_code'] ;    // 取参数：调查编码
    $option      = func_get_args()[0]['custom_option'] ;  // 取参数：自定义选项信息

    for($i = 0; $i < count($option); $i++){
        $data                 = $option[$i] ;          // 取入参（option_name/question_code/custom_spare）
        $data['survey_code']  = $survey_code ;         // 调查编码
        $data['option_type']  = 2 ;                    // 选项类型（1:普通选项；2:自定义选项）
        $data['option_state'] = 2 ;                    // 选项状态（0:无效；1:有效；2:临时）
        $data['create_user']  = $user_code ;           // 选项创建用户
        $data['create_time']  = date('Y-m-d H:i:s') ;  // 选项创建时间

        $question_code         = $data['question_code'] ;
        $data['question_type'] = M(TB_BAS_QUESTION_INFO) -> where("question_code = $question_code") -> getField('question_type') ;

        // 先删除该问题下此用户创建过的选项（如果有）
        $condition = "question_code = " . $question_code . " and option_type = 2" . " and create_user='$user_code'" ;
        M(TB_BAS_QUESTION_OPTION) -> where($condition) -> delete() ;

        // 生成选项编码
        $condition           = "question_code = " . $question_code . " and option_type = 2" ;
        $data['option_seq']  = M(TB_BAS_QUESTION_OPTION) -> where($condition) -> max('option_seq') + 1 ;                      // 选项序号
        $data['option_code'] = strval($data['question_code']) . strval($data['option_type']) . strval($data['option_seq']) ;  // 选项编码

        // 整理好的数据插入问题选项清单表
        if(insertTable(TB_BAS_QUESTION_OPTION, $data)){
            $option[$i]['option_code'] = $data['option_code'] ;
        }else{
            return array (
                'data'   => false                          ,// 错误编码
                'info'   => "failed:survey_custom_option"  ,// 错误信息
                'status' => 0                              ,// 返回状态
            ) ;
        }
    }

    return array (
        'data'   => $option                         ,// 选项信息
        'info'   => "success:survey_custom_option"  ,// 成功信息
        'status' => 1                               ,// 返回状态
        'type'   => 'json'                          ,// 数据类型
    ) ;
}

/*
* @Name   : api_survey_recomm_create
* @Desc   : 调查推荐规则创建（目前一套调查只能生成一套规则，以后要实现单调查多规则功能需要再开发完善）
* @Param  : number  survey_code  调查编码（必选）
* @Param  : json    rule         调查推荐规则（必选）
* @Return : mix     Param        不同的处理类型对应不同的出参
*/
function api_survey_recomm_create(){
    $survey_code = func_get_args()[0]['survey_code'] ;  // 取参数：调查编码
    $rule        = func_get_args()[0]['rule'] ;         // 取参数：调查推荐规则
    $limit       = 500 ;                                // 目前给个默认固定值，未来该值可变可配置

    // 根据调查状态确定推荐规则初状态
    $survey_state = M(TB_BAS_SURVEY_INFO) -> where("survey_code = '$survey_code'") -> getField('survey_state') ;

    // 自定义推荐规则创建
    if(recommendCreate($survey_code, $rule, $limit)){
        // 如果调查活动已经开始，同时生成推荐用户
        if($survey_state == 3){
            $flag = surveyRecommendUser($survey_code) ;
        }else{
            $flag = true ;
        }
    }else{
        $flag = false ;
    }

    // 调查推荐用户
    // 待改造成：调查发布后才生成推荐用户（需要建设服务器定时推送功能）
    // $survey = M(TB_BAS_SURVEY_INFO) -> where("survey_code = '$survey_code'") -> find() ;
    // if($survey['survey_state'] >= 3){
    //     $res = surveyRecommendUser($survey_code, $recomm_type, $limit) ;                    
    // }

    // 返回结果
    if($flag){
        return array (
            'data'   => $flag                               ,// 数据信息
            'info'   => "success:api_survey_recomm_create"  ,// 成功信息
            'status' => 1                                   ,// 返回状态
        ) ;
    }else{
        return array (
            'data'   => false                              ,// 错误编码
            'info'   => "failed:api_survey_recomm_create"  ,// 错误信息
            'status' => 0                                  ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_follow_list_select
* @Desc   : 关注信息查询
* @Param  : string  type     查询类型（必选）
* @Param  : number  target   目标编码（必选）
* @Return : json    survey   查询结果
*/
function api_follow_list_select(){
    $type   = func_get_args()[0]['type'] ;    // 取参数：查询类型
    $target = func_get_args()[0]['target'] ;  // 取参数：目标编码
    
    $url_user_visit        = U('user/user/visit')       ;
    $url_survey_visit      = U('survey/survey/visit')   ;
    $url_survey_answer     = U('survey/survey/answer')  ;
    $url_survey_analyse    = U('survey/survey/analyse') ;
    $tbDetUserLevel        = M(TB_DET_USER_LEVEL)         -> getTableName() ;
    $tbDetSurveyType       = M(TB_DET_SURVEY_TYPE)        -> getTableName() ;
    $tbDetSurveyState      = M(TB_DET_SURVEY_STATE)       -> getTableName() ;
    $tbBasUserInfo         = M(TB_BAS_USER_INFO)          -> getTableName() ;
    $tbBasUserAccout       = M(TB_BAS_USER_ACCOUT)        -> getTableName() ;
    $tbBasSurveyInfo       = M(TB_BAS_SURVEY_INFO)        -> getTableName() ;
    $tbBasUserFollowUser   = M(TB_BAS_USER_FOLLOW_USER)   -> getTableName() ;
    $tbBasUserFollowSurvey = M(TB_BAS_USER_FOLLOW_SURVEY) -> getTableName() ;

    switch(func_get_args()[0]['type']){
        case 'user' :
            $sql =  "select distinct b.user_nick, c.*, d.user_level_desc, concat('$url_user_visit?code=', b.user_code) url_user ". 
                    "from $tbBasUserFollowUser a, $tbBasUserInfo b, $tbBasUserAccout c, $tbDetUserLevel d ".
                    "where a.follow_code = b.user_code and b.user_code = c.user_code and c.user_level = d.user_level_value ".
                    "and a.follow_state = 1 and a.user_code = $target ".
                    "order by a.follow_time desc " ;
            $data['follow_user'] = M() -> query($sql) ;


            $sql =  "select distinct b.user_nick, c.*, d.user_level_desc, concat('$url_user_visit?code=', b.user_code) url_user ". 
                    "from $tbBasUserFollowUser a, $tbBasUserInfo b, $tbBasUserAccout c, $tbDetUserLevel d ".
                    "where a.user_code = b.user_code and b.user_code = c.user_code and c.user_level = d.user_level_value ".
                    "and a.follow_state = 1 and a.follow_code = $target ".
                    "order by a.follow_time desc " ;
            $data['user_follow'] = M() -> query($sql) ;

            break ;

        case 'survey' :
            $sql =  "select distinct a.survey_code, a.survey_name, a.survey_desc, a.user_code, a.user_nick, a.question_num, c.survey_type_desc, ".
                    "a.survey_state, b.state_desc_sketch survey_state_desc, date(a.create_time) create_date, date(a.start_time) start_date, ".
                    "       concat('$url_user_visit?code=', a.user_code) url_user, concat('$url_survey_visit?code=', a.survey_code) url_visit, ". 
                    "       concat('$url_survey_answer?code=', a.survey_code) url_answer, concat('$url_survey_analyse?code=', a.survey_code) url_analyse ".
                    "from $tbBasSurveyInfo a, $tbDetSurveyState b, $tbDetSurveyType c, $tbBasUserFollowSurvey d " .
                    "where a.survey_state = b.survey_state_code and a.survey_type = c.survey_type_code ".
                    "and a.survey_code = d.follow_code and d.follow_state = 1 ".
                    "order by d.follow_time desc " ;
            $data = M() -> query($sql) ;

            break ;
    }

    // 返回查询结果
    if($data){
        return array (
            'data'   => $data                             ,// 调查信息
            'info'   => "success:api_follow_list_select"  ,// 成功信息
            'status' => 1                                 ,// 返回状态
            'type'   => 'json'                            ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => 0                                ,// 错误代码
            'info'   => "failed:api_follow_list_select"  ,// 错误信息
            'status' => 0                                ,// 返回状态
        ) ;
    }
}

/**************************************** 统计模块接口 ****************************************/

/*
* @Name   : api_stats_survey_type_cnt
* @Desc   : 调查类型分组统计
* @Param  : number  $type     调查类型：可以是调查大类或者调查小类
* @Param  : string  $action   行为类型：publish(创建调查)/answer(参与调查)
* @Return : json    $data     统计结果
*/
function api_stats_survey_type_cnt(){
    $type   = func_get_args()[0]['type'] ;      // 取参数：行为类型
    $action = func_get_args()[0]['action'] ;    // 取参数：行为类型

    // 要用到的表
    $tbDetSurveyTypeSub    = M(TB_DET_SURVEY_TYPE_SUB)    -> getTableName() ;
    $tbBasSurveyInfo       = M(TB_BAS_SURVEY_INFO)        -> getTableName() ;
    $tbBasSurveyAction     = M(TB_BAS_SURVEY_ACTION)      -> getTableName() ;
    $tbBasUserFollowSurvey = M(TB_BAS_USER_FOLLOW_SURVEY) -> getTableName() ;

    // 判断调查类型设计调查类型条件（默认第一个调查类型1001）
    switch(strlen($type)){
        case 4 :
            if(M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_code = $type") -> find()){
                $and['x'] = "and x.survey_type_code = $type " ;
                $and['a'] = "and a.survey_type = $type " ;
            }
            break ;

        case 5 :
            if(M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_sub_code = $type") -> find()){
                $and['x'] = "and x.survey_type_sub_code = $type " ;
                $and['a'] = "and a.survey_type_sub = $type " ;
            }
            break ;

        default :
            $and['x'] = $and['a'] = "" ;
            break ;
    }

    $cfg = array(
        // 发布的调查
        'publish' => "(select a.survey_type_sub, count(1) cnt from $tbBasSurveyInfo a ".
                     "where survey_state > 1 ". $and['a']. ") ",
        // 参与的调查
        'answer' => "(select a.survey_type_sub, count(1) cnt from $tbBasSurveyInfo a, $tbBasSurveyAction b ".
                    "where a.survey_code = b.follow_code ". $and['a'] ."group by a.survey_type_sub) ",
        // 关注的调查
        'follow' => "(select a.survey_type_sub, count(1) cnt from $tbBasSurveyInfo a, $tbBasUserFollowSurvey b ".
                    "where a.survey_code = b.follow_code ". $and['a'] ."group by a.survey_type_sub) ",
    ) ;

    // 根据入参查询
    $action ? $data[$action] = $cfg[$action] : $data = $cfg ;
    
    foreach ($data as $key => $table) {
        $sql =  "select x.survey_type_code, x.survey_type_name, x.survey_type_sub_code, x.survey_type_sub_name, ".
                "case when sum(cnt) is null then 0 else sum(cnt) end cnt ".
                "from $tbDetSurveyTypeSub x left outer join ". $table. "y ".
                "on x.survey_type_sub_code = y.survey_type_sub ".
                "where 1 = 1 ". $and['x'].
                "group by x.survey_type_sub_code order by x.survey_type_sub_code" ;
        if($query = M() -> query($sql)){
            $stats[$key] = $query ;
        }
    }

    
    $statss = M(TB_DET_SURVEY_TYPE_SUB) -> select() ;
    return array (
        'data'   => $statss                              ,// 数据信息
        'info'   => "success:api_stats_survey_type_cnt"  ,// 成功信息
        'status' => 1                                   ,// 返回状态
        'type'   => 'json'                              ,// 数据类型
    ) ;

    // 返回结果
    // if(count($stats)){
    //     return array (
    //         'data'   => $statss                              ,// 数据信息
    //         'info'   => "success:api_stats_survey_type_cnt"  ,// 成功信息
    //         'status' => 1                                   ,// 返回状态
    //         'type'   => 'json'                              ,// 数据类型
    //     ) ;
    // }else{
    //     return array (
    //         'data'   => false                               ,// 错误编码
    //         'info'   => "failed:api_stats_survey_type_cnt"  ,// 错误信息
    //         'status' => 0                                   ,// 返回状态
    //     ) ;
    // }
}

/*
* @Name   : api_stats_sv_action_cnt
* @Desc   : 调查参与情况统计
* @Param  : number  $survey_code  调查编码
* @Return : json    $jsonData     统计结果
*/
function api_stats_sv_action_cnt(){
    $survey_code = func_get_args()[0]['survey_code'] ;  // 取参数：调查编码

    $sql  = "select date_format(start_time, '%Y-%m-%d') date , count(1) count ".
            "from tb_bas_survey_action where survey_code = $survey_code ".
            "group by date order by 1" ;
    $data = M() -> query($sql) ;

    // 返回结果
    if(count($data) > 0){
        return array (
            'data'   => $data                              ,// 数据信息
            'info'   => "success:api_stats_sv_action_cnt"  ,// 成功信息
            'status' => 1                                  ,// 返回状态
            'type'   => 'json'                             ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => false                             ,// 错误编码
            'info'   => "failed:api_stats_sv_action_cnt"  ,// 错误信息
            'status' => 0                                 ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_stats_sv_group_cnt
* @Desc   : 调查参与情况分组统计
* @Param  : number  $survey_code  调查编码
* @Param  : json    $condition    查询条件：要分组的字段组成的数组
* @Return : json    $jsonData     统计结果
*/
function api_stats_sv_group_cnt(){
    $survey_code = func_get_args()[0]['survey_code'] ;  // 取参数：调查编码
    $condition   = func_get_args()[0]['condition'] ;    // 取参数：查询条件
    $prop        = $table = $group = array() ;

    $tbBasUserInfo     = M(TB_BAS_USER_INFO)     -> getTableName() ;
    $tbBasSurveyAction = M(TB_BAS_SURVEY_ACTION) -> getTableName() ;

    for($i = 0; $i < count($condition); $i++){
        $bas_prop_name  = $condition[$i] ;
        $relation       = M(TB_BAS_PROP_DET_RELATION) -> where("bas_table_name = 'BasUserInfo' and bas_prop_name = '$bas_prop_name'") -> find() ;
        $bas_prop_name  = $relation['bas_prop_name'] ;
        $det_table_name = $relation['det_table_name'] ;
        $det_prop_name  = $relation['det_prop_name'] ;
        $det_prop_desc  = $relation['det_prop_desc'] ;
        $tbDetName      = M($det_table_name) -> getTableName() ;

        array_push($prop, "t$i.".$det_prop_desc." $bas_prop_name") ;  // 生成目标字段数组
        array_push($group, "t$i.".$det_prop_desc) ;                   // 生成分组字段数组
        array_push($table, $tbDetName . " t$i") ;                     // 生成维表表名数组
        $and = " and a.$bas_prop_name = t$i.$det_prop_name". $and ;  // 生成条件字符串
    }

    $prop  = implode(',', $prop) ;     // 连接数组生成目标字段字符串
    $group = implode(',', $group) ;    // 连接数组生成分组字段字符串
    $table = implode(',', $table) ;    // 连接数组生成维表表名字符串

    $sql =  "select $prop , count(1) count ". 
            "from $tbBasUserInfo a , $tbBasSurveyAction b , $table ".
            "where a.user_code = b.user_code and b.survey_code = $survey_code $and ".
            "group by $group" ;
    $data = M() -> query($sql) ;

    // 返回结果
    if(count($data) > 0){
        return array (
            'data'   => $data                             ,// 数据信息
            'info'   => "success:api_stats_sv_group_cnt"  ,// 成功信息
            'status' => 1                                 ,// 返回状态
            'type'   => 'json'                            ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => false                            ,// 错误编码
            'info'   => "failed:api_stats_sv_group_cnt"  ,// 错误信息
            'status' => 0                                ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_stats_qt_group_cnt
* @Desc   : 调查答题情况分组统计接口
* @Param  : number  $survey_code  调查编码
* @Param  : array   $condition    要分组的字段组成的数组
* @Return : json    $jsonData     统计结果
*/
function api_stats_qt_group_cnt(){
    $survey_code   = func_get_args()[0]['survey_code'] ;    // 取参数：调查编码
    $question_code = func_get_args()[0]['question_code'] ;  // 取参数：问题编码
    $condition     = func_get_args()[0]['condition'] ;      // 取参数：查询条件
    $prop          = $table = $group = array() ;

    $tbBasUserInfo       = M(TB_BAS_USER_INFO)       -> getTableName() ;
    $tbBasQuestionAction = M(TB_BAS_QUESTION_ACTION) -> getTableName() ;

    for($i = 0; $i < count($condition); $i++){
        $bas_prop_name  = $condition[$i] ;
        $relation       = M(TB_BAS_PROP_DET_RELATION) -> where("bas_table_name = 'BasUserInfo' and bas_prop_name = '$bas_prop_name'") -> find() ;
        $det_table_name = $relation['det_table_name'] ;
        $bas_prop_name  = $relation['bas_prop_name'] ;
        $det_prop_name  = $relation['det_prop_name'] ;
        $det_prop_desc  = $relation['det_prop_desc'] ;

        $tbDetName = M($det_table_name) -> getTableName() ;

        array_push($prop, "t$i.".$det_prop_desc." $bas_prop_name") ;  // 生成目标字段数组
        array_push($group, "t$i.".$det_prop_desc) ;                   // 生成分组字段数组
        array_push($table, $tbDetName . " t$i") ;                     // 生成维表表名数组
        $and = " and a.$bas_prop_name = t$i.$det_prop_name". $and ;   // 生成条件字符串
    }

    // 问题编码是可选项，如果指定编码就统计目标问题，如果没指定，统计目标调查的所有问题
    if($question_code){
        $and = "and b.question_code = $question_code". $and ;
    }

    $prop  = implode(',', $prop) ;     // 连接数组生成目标字段字符串
    $group = implode(',', $group) ;    // 连接数组生成分组字段字符串
    $table = implode(',', $table) ;    // 连接数组生成维表表名字符串

    $sql =  "select b.question_code, b.option_name, b.option_code, $prop , count(1) count ". 
            "from $tbBasUserInfo a , $tbBasQuestionAction b , $table ".
            "where a.user_code = b.user_code and b.survey_code = $survey_code $and ".
            "group by b.option_code, $group ".
            "order by b.option_code" ;
    $data = M() -> query($sql) ;

    // 返回结果
    if(count($data) > 0){
        return array (
            'data'   => $data                             ,// 数据信息
            'info'   => "success:api_stats_qt_group_cnt"  ,// 成功信息
            'status' => 1                                 ,// 返回状态
            'type'   => 'json'                            ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => false                            ,// 错误编码
            'info'   => "failed:api_stats_qt_group_cnt"  ,// 错误信息
            'status' => 0                                ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_text_content
* @Desc   : 主观题参与内容查询
* @Param  : number  $survey_code    调查编码（可选）
* @Param  : number  $question_code  问题编码（可选）
* @Return : json    $data           目标调查的所有主观题参与内容
*/
function api_text_content(){
    $survey_code  = func_get_args()[0]['survey_code'] ;   // 取参数：调查编码
    $queston_code = func_get_args()[0]['queston_code'] ;  // 取参数：问题编码

    if($question_code){
        $condition = "question_code = $question_code and question_type = 'textarea'" ;
    }elseif($survey_code){
        $condition = "survey_code = $survey_code and question_type = 'textarea'" ;
    }else{
        return array (
            'data'   => -1                         ,// 错误编码（没有传入任何有效参数）
            'info'   => "failed:api_text_content"  ,// 错误信息
            'status' => 0                          ,// 返回状态
        ) ;
    }

    $tbBasQuestionAction = M(TB_BAS_QUESTION_ACTION) -> getTableName() ;
    $tbBasUserInfo       = M(TB_BAS_USER_INFO)       -> getTableName() ;
    $tbDetAreaCity       = M(TB_DET_AREA_CITY)       -> getTableName() ;

    // 取数据
    $sql =  "select b.user_sex, c.area_city_name user_city, a.survey_code, a.question_code, a.option_name ".
            "from $tbBasQuestionAction a, $tbBasUserInfo b, $tbDetAreaCity c ".
            "where a.user_code = b.user_code and b.area_city = c.area_city_code ".$condition ;
    $text = M() -> query($sql) ;

    // 数据分组
    for($i = 0; $i < count($text); $i++){
        if(!$data[$text[$i]['question_code']]){
            $data[$text[$i]['question_code']] = array() ;
        }
        array_push($data[$text[$i]['question_code']], $text[$i]) ;
    }

    // 返回结果
    if(count($data) > 0){
        return array (
            'data'   => $data                       ,// 数据信息
            'info'   => "success:api_text_content"  ,// 成功信息
            'status' => 1                           ,// 返回状态
            'type'   => 'json'                      ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => 0                          ,// 错误编码
            'info'   => "failed:api_text_content"  ,// 错误信息
            'status' => 0                          ,// 返回状态
        ) ;
    }
}

/**************************************** 其他模块接口 ****************************************/

/*
* @Name   : api_det_data_select
* @Desc   : 维表数据查询接口
* @Param  : string  $table      目标维表名称（必选）
* @Param  : string  $condition  查询条件（必选）
* @Return : json    $data       查询结果数据
*/
function api_det_data_select(){
    $table     = constant('TB_DET_'.strtoupper(func_get_args()[0]['table'])) ;   // 取参数：目标维表名称
    $condition = func_get_args()[0]['condition'] ;                               // 取参数：查询条件

    if($data = M($table) -> where($condition) -> select()){
        return array (
            'data'   => $data                          ,// 维表数据
            'info'   => "success:api_det_data_select"  ,// 成功信息
            'status' => 1                              ,// 返回状态
            'type'   => 'json'                         ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => false                         ,// 错误编码
            'info'   => "failed:api_det_data_select"  ,// 失败信息
            'status' => 0                             ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_search_go
* @Desc   : 搜索接口
* @Param  : string  $type  搜索类型
* @Param  : string  $word  搜索关键字
* @Return : 处理数据后直接前往搜索页面
*/   
function api_search_go(){
    $type  = func_get_args()[0]['type'] ;   // 取参数：搜索类型
    $words = func_get_args()[0]['words'] ;  // 取参数：搜索关键词
    $url   = U('search/index') ;

    if($type && $words){
        // 生成对应的搜索URL
        $url = $url . '?type=' . $type . '&words=' . $words ;

        return array (
            'data'   => $url                     ,// 搜索URL
            'info'   => "success:api_search_go"  ,// 成功信息
            'status' => 1                        ,// 返回状态
        ) ;
    }else{
        return array (
            'data'   => false                   ,// 错误代码
            'info'   => "failed:api_search_go"  ,// 错误信息
            'status' => 0                       ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_get_server_url
* @Desc   : 动态生成服务器URL地址
* @Param  : string  name  用于动态生成URL的字符串入参
* @Return : string  url   生成的URL地址
*/
function api_get_server_url(){
    $name  = func_get_args()[0]['name'] ;   // 取参数：搜索类型

    if($name){
        return array (
            'data'   => U($name)                      ,// 服务器模块页面URL
            'info'   => "success:api_get_server_url"  ,// 成功信息
            'status' => 1                             ,// 返回状态
        ) ;
    }else{
        return array (
            'data'   => false                        ,// 错误代码
            'info'   => "failed:api_get_server_url"  ,// 错误信息
            'status' => 0                            ,// 返回状态
        ) ;
    }
}


/**************************************************************************************************/


















/*
* @Name   : api_survey_recomm_user
* @Desc   : 向调查推荐用户接口
* @Param  : number  survey_code  调查编码
* @Param  : json    recommend    调查推荐规则
* @Return : number  user_cnt     推荐成功用户数
*/
function api_survey_recomm_user(){
    $survey_code = $_POST['survey_code'] ;
    $recomm_type = $_POST['recomm_type'] ;
    $recommend   = json_decode($_POST['recommend'], true) ;
    $limit       = 500 ;

    // 推荐规则创建
    if($recommend){
        $recommend_code = recommendCreate($survey_code, $recommend) ;   
    }

    // 推荐用户生成
    $user_cnt = surveyRecommendUser($survey_code, $recomm_type, $limit) ;
    echo $user_cnt ;
}




/**************************************** 其他接口 ****************************************/

/*
* @Name   : api_search
* @Desc   : 搜索接口
* @Param  : string  $type   搜索类型
* @Param  : string  $words  搜索关键字
* @Return : 处理数据后直接前往搜索页面
*/   
function api_search(){
    $type  = $_POST['type'] ;   // 搜索类型
    $words = $_POST['words'] ;  // 搜索关键字

    if($type && $words){
        $data = vkSearch($type, $words) ;
    }else{
        $data = false ; 
    }

    if(count($data) > 0){
        $this -> ajaxReturn($data, 'success', 1, 'json');
    }else{
        $this -> ajaxReturn(0, 'failed', 0);
    }
}


/*
* @Name   : api_search_main
* @Desc   : 搜索接口
* @Param  : string  $word      搜索关键字
* @Return : json    $jsonData  搜索结果数据
*/   
function api_search_main(){
    $type = $_POST['search_type'] ;
    if($_POST['search_words']){
        $word = $_POST['search_words'] ;
    }else{
        $word = cookie('search_words') ;   
    }
    
    $url_us_visit   = U('user/visit') ;
    $url_sv_action  = U('survey/survey/action') ;
    $url_sv_analyse = U('survey/survey/analyse') ;

    $table               = M(constant('TB_BAS_' . strtoupper($type) . '_INFO')) -> getTableName() ;
    $tbDetSurveyState    = M(TB_DET_SURVEY_STATE)     -> getTableName() ;
    $tbBasUserAccout     = M(TB_BAS_USER_ACCOUT)      -> getTableName() ;
    $tbBasSurveyInfo     = M(TB_BAS_SURVEY_INFO)      -> getTableName() ;
    $tbBasUserExtendInfo = M(TB_BAS_USER_EXTEND_INFO) -> getTableName() ;
    $tbDetUserLevel      = M(TB_DET_USER_LEVEL)       -> getTableName() ;
    $tbDetQuestionType   = M(TB_DET_QUESTION_TYPE)    -> getTableName() ;
    $tbDetSurveyState    = M(TB_DET_SURVEY_STATE)     -> getTableName() ;

    // 按照不同的搜索类型查询数据
    switch($type){
        case 'survey' :
            $condition = "survey_name like '%". $word . "%'" ;
            $sql =  "select a.survey_name, a.user_nick, a.question_num, date(a.start_time) start_date, ".
                    "       concat('$url_sv_action?code=', a.survey_code) url_survey_action, b.state_desc_sketch survey_state, ".
                    "       concat('$url_us_visit?code=', a.user_code) url_user_action, a.survey_desc ".
                    "from $table a, $tbDetSurveyState b ".
                    "where a.survey_state = b.survey_state_code and a.survey_state >= 3 and $condition ".
                    "order by start_date desc " ;
            break ;
        case 'question' :
            $condition = "question_name like '%". $word . "%'" ;
            $sql =  "select a.question_name, a.question_option, date(a.create_time) create_date, ".
                    "       b.survey_name, c.state_desc_sketch survey_state, d.question_type_desc question_desc, ".
                    "       concat('$url_sv_analyse?code=', b.survey_code) url_survey_analyse, ".
                    "       concat('$url_sv_action?code=', b.survey_code) url_survey_action ".
                    "from $table a, $tbBasSurveyInfo b, $tbDetSurveyState c, $tbDetQuestionType d ".
                    "where a.survey_code = b.survey_code and b.survey_state = c.survey_state_code ".
                    "and a.question_type = d.question_type_code and b.survey_state >= 3 and $condition ".
                    "order by create_date desc " ; 
            break ;
        case 'user' :
        $condition = "user_nick like '%". $words . "%'" ;
        $sql =  "select a.user_nick, b.user_desc, c.publish_times, c.answer_times, d.user_level_desc user_level, ".
                "       concat('$url_us_visit?code=', a.user_code) url_user_action ".
                "from $table a, $tbBasUserExtendInfo b, $tbBasUserAccout c, $tbDetUserLevel d ".
                "where a.user_code = b.user_code and a.user_code = c.user_code ".
                "and c.user_level = d.user_level_value and $condition ".
                "order by c.user_level desc " ;
            break ;
    }

    $data = M() -> query($sql) ;

    //  echo json_encode($data) ;
    if(count($data) > 0){
        $this -> ajaxReturn($data, 'success:api_search_main', 1, 'json') ;
    }else{
        $this -> ajaxReturn(0, 'failed:api_search_main', 0);
    }
}

/*
* @Name   : api_area_city_select
* @Desc   : 市级地域查询接口
* @Param  : number  $province  省级地域编码
* @Return : json    $jsonCity  市级地域信息
*/
function api_area_city_select(){
    $area_province_code = $_POST['province'] ;   // 取省级地域编码
    $DetAreaCity        = 'DetAreaCity' ;

    $data = M($DetAreaCity) -> where("area_province_code = '$area_province_code'") -> select() ;    // 取省级地域信息

    if($data){
        $this -> ajaxReturn($data, 'success:api_area_city_select', 1, 'json') ;
    }else{
        $this -> ajaxReturn(0, 'failed:api_area_city_select', 0);
    }
}

/*
* @Name   : api_upload_img
* @Desc   : 头像上传接口
* @Param  : string  $type      搜索类型
* @Return : 上传成功标志
*/   
function api_upload_img(){
    import('ORG.Net.UploadFile');
    $upload = new UploadFile();                     //  实例化上传类
    
    $upload -> maxSize = 1*1024*1024;                 // 设置上传图片的大小
    $upload -> allowExts = array('jpg','png','gif');  // 设置上传图片的后缀
    $upload -> uploadReplace = true;                  // 同名则替换

    // 定义上传的得到的临时图片完整路径
    $path = VK_PUB_IMG.'tmp/';
    $upload -> savePath = $path;

    if(!$upload -> upload()) {                        //  上传错误提示错误信息
        $this -> ajaxReturn('', $upload -> getErrorMsg(), 0, 'json');
    }else{                                          //  上传成功 获取上传文件信息
        $info =  $upload -> getUploadFileInfo();
        $img_name = $info[0][savename] ;
        $temp_size = getimagesize($path.$img_name) ;

        // 判断宽和高是否符合头像要求
        if($temp_size[0] < 100 || $temp_size[1] < 100){
            $this -> ajaxReturn(0, '图片宽或高不得小于100px！', 0, 'json');
        }

        // 以上都没有问题返回Ajax数据（JSON）
        $this -> ajaxReturn($img_name, $info, 1, 'json');
    }
}

/*
* @Name   : api_crop_img
* @Desc   : 图片裁剪接口
* @Param  : string  $type      搜索类型
* @Return : 上传成功标志
*/   
function api_crop_img(){
    // 图片裁剪数据
    $params = $this -> _post() ;

    $user_code = $params['code'] ;                       // 要保存图片名称（用户编码）
    $tmp_img   = $params['src'] ;                        // 临时图片名称
    $tmp_path  = VK_PUB_IMG.'tmp/'.$tmp_img ;            // 临时图片完整路径
    $save_path = VK_PUB_IMG.'user/'.$user_code.'.jpg' ;  // 要保存图片完整路径

    // 引入扩展图片库
    import('ORG.Util.Image.ThinkImage') ;
    $ThinkImage = new ThinkImage(THINKIMAGE_GD) ; 

    // 裁剪原图
    $ThinkImage -> open($tmp_path) -> crop($params['w'], $params['h'], $params['x'], $params['y']) -> save($save_path) ;

    // 生成缩略图
    $ThinkImage -> open($save_path) -> thumb(120,120, 1) -> save(VK_PUB_IMG.'user/'.$user_code.'_120.jpg') ;
    $ThinkImage -> open($save_path) -> thumb(60,60, 1) -> save(VK_PUB_IMG.'user/'.$user_code.'_60.jpg') ;

    // 删除原文件
    @unlink($tmp_path) ;

    // 以上都没有问题返回成功状态和数据
    if(updateTable(TB_BAS_USER_INFO, array('user_photo'=>1), array('user_code'=>$user_code), 'cover')){
        $this -> ajaxReturn($save_path, "success:api_crop_img", 1) ;
    }else{
        $this -> ajaxReturn(0, "failed:api_crop_img", 0) ;
    }
}

/**************************************************废弃接口**************************************************/

/*
* @Name   : api_user_accout_update
* @Desc   : 用户积分等级更新接口（以后更新积分等级都在后台进行，此接口将废弃）
* @Param  : json     action_info  用户行为信息
* @Return : boolean  true/false   更新成功或失败标志
*/
function api_user_accout_update(){
    $action     = func_get_args()[0]['action'] ;      // 取参数：用户行为
    $times_type = func_get_args()[0]['times_type'] ;  // 取参数：次数类型

    $times_type = $_POST['times_type'] ;
    $action     = json_decode($_POST['action'], true) ;  // 用户行为信息
    $action['action_time'] = date('Y-m-d H:i:s') ;    // 行为发生时间

    $user_code   = $action['user_code'] ;
    $action_code = $action['action_code'] ;

    if($times_type){
        $times_type = $times_type . '_times';   
    }

    // 取行为编码对应行为规则信息合并到用户行为信息数据中
    $actionConfig = M(TB_DET_USER_ACTION_CONFIG) -> where("action_code = '$action_code'") -> find() ;    
    $action = array_merge($actionConfig, $action) ;

    // 生成行为名称$action['action_name']
    $condition = $action['action_column'] . '=' . $action['action_value'] ;
    $dtAction = M($action['action_table']) -> where("$condition") -> find();
    $target = $action['action_target'] ;        
    $action['action_name'] = $dtAction[$target] ;

    // 取两个行为日志表表结构
    $keyBasScoreActionLog = M(TB_BAS_SCORE_ACTION_LOG) -> getDbFields() ;
    $keyBasCoinsActionLog = M(TB_BAS_COINS_ACTION_LOG) -> getDbFields() ;

    // 生成两个行为日志表对应字段的数据
    $action_score = arrayExtract($action, $keyBasScoreActionLog) ;
    $action_coins = arrayExtract($action, $keyBasCoinsActionLog) ;

    // 计算需要更新的用户积分值和金币值
    $accout_add['user_score'] = $action['score_value'] * $action['score_logic'] ;  
    $accout_add['user_coins'] = $action['coins_value'] * $action['coins_logic'] ;  

    if($times_type){
        $accout_add["$times_type"] = 1 ;            
    }

    // 更新用户账户信息表中的金币积分等级
    if(userAccoutUpdate($user_code, $accout_add)){
        if($action_score['score_value']){
            $res_sc = userActionAdd($action_score, 'score') ;    // 用户积分累计日志

            // 如果更新过用户积分，再判断是否需要更新用户等级
            $userAccout = M(TB_BAS_USER_ACCOUT) -> where("user_code = '$user_code'") -> find() ;    // 取当前用户账户信息
            $condition  = "score_lower_value <= ". $userAccout['user_score'] . " and score_upper_value >= ". $userAccout['user_score'] ;
            $userLvl    = M(TB_DET_USER_LEVEL) -> where($condition) -> find() ;    // 取需要的积分规则
            
            // 如果计算出的最新等级与之前等级不同，更新用户最新等级
            if($userLvl['user_level_value'] != $userAccout['user_level']){
                $userAc['user_level'] = $userLvl['user_level_value'] ;
                alterUserAccout($user_code, $userAc) ;
            }
        }
        if($action_coins['coins_value']){
            $res_co = userActionAdd($action_coins, 'coins') ;    // 用户金币使用日志
        }
    }

    if($res_sc && $res_co){
        $this -> ajaxReturn(1, "success", 1) ;
    }else{
        $this -> ajaxReturn(0, "failed", 0) ;
    }
}

?>