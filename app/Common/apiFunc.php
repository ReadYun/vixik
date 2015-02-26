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

                    case 'number' : 
                        // number格式解析
                        $data[$para['param_name']] = strval($param[$para['param_name']]) ;
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
        // 用户编码和MD5码可长期保留在cookie中
        cookie('user_code', $user_code,                                       360000) ;
        cookie('user_md5',  MD5($user_code . func_get_args()[0]['user_pwd']), 360000) ;

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
* @Param  : json    action      用户行为（必选）
* @Return : json    user        查询结果
*/
function api_user_action_verify(){
    $user_code = func_get_args()[0]['user_code'] ;  // 取参数：用户编码
    $target    = func_get_args()[0]['target'] ;     // 取参数：目标编码
    $action    = func_get_args()[0]['action'] ;     // 取参数：用户行为

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
        'follow_user' => array(
            'table' => TB_BAS_USER_FOLLOW_USER,
            'cond'  => "user_code = $user_code and follow_code = $target",
        ),
    ) ;

    for($i = 0; $i < count($action); $i++){
        if($cfg[$action[$i]]){
            $data[$action[$i]] = M($cfg[$action[$i]]['table']) -> where($cfg[$action[$i]]['cond']) -> count() ;
        }else{
            $data[$action[$i]] = false ;
        }
    }

    return array (
        'data'   => $data                             ,// 调查信息
        'info'   => "success:api_user_action_verify"  ,// 成功信息
        'status' => 1                                 ,// 返回状态
    ) ;
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
    
    foreach($data as $key => $value){
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
* @Name   : api_user_follow_svprop_select
* @Desc   : 用户关注调查属性查询接口
* @Params : number   $user_code     用户编码（可选）
* @Params : string   $svprop_type   关注调查属性类型（survey_type/survey_type_sub/survey_trade）（可选）
* @Params : number   $svprop_value  关注调查属性值（可选）
* @Return : json     $data          查询结果
*/
function api_user_follow_svprop_select(){
    $cond  = func_get_args()[0] ;    // 取参数：用户编码

    if($data = M(TB_BAS_USER_FOLLOW_SVPROP) -> where($cond) -> select()){
        return array (
            'data'   => $data                                   ,// 查询结果
            'info'   => "success:api_user_follow_svprop_select" ,// 成功信息
            'status' => 1                                       ,// 返回状态

        ) ;
    }else{
        return array (
            'data'   => 0                                       ,// 错误代码
            'info'   => "failed:api_user_follow_svprop_select"  ,// 错误信息
            'status' => 0                                       ,// 返回状态
        ) ;
    }
}   

/*
 * @Name   : api_user_follow_svprop_update
 * @Desc   : 用户关注调查属性更新接口
 * @Params : string   $update_type   更新方式（必选）
 * @Params : number   $user_code     用户编码（必选）
 * @Params : string   $svprop_type   调查属性类型（必选）
 * @Params : number   $svprop_value  调查属性值（必选）
 * @Return : boolean  true/false     更新结果
 */
function api_user_follow_svprop_update(){
    $data   = func_get_args()[0] ;
    $action = $data['update_type'] ;

    unset($data['update_type']) ;

    switch($action){
        case 'add' :
            // dump(M(TB_BAS_USER_FOLLOW_SVPROP) -> data($data) -> count()) ;
            if(!M(TB_BAS_USER_FOLLOW_SVPROP) -> where($data) -> count()){
                $data['follow_time'] =  date('Y-m-d H:i:s') ;
                $res = M(TB_BAS_USER_FOLLOW_SVPROP) -> data($data) -> add() ;
            }
            break ;

        case 'del' :
            $res = M(TB_BAS_USER_FOLLOW_SVPROP) -> where($data) -> delete() ;
            break ;

        default :
            $res = false ;
            break ;
    }

    if($res){
        return array (
            'data'   => true                                     ,// 更新结果
            'info'   => "success:api_user_follow_svprop_update"  ,// 成功信息
            'status' => 1                                        ,// 返回状态

        ) ;
    }else{
        return array (
            'data'   => false                                   ,// 更新结果
            'info'   => "failde:api_user_follow_svprop_update"  ,// 失败信息
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
* @Param  : json    question      题目信息（必选）
* @Return : number  $survey_code  新调查编码
*/
function api_survey_create(){
    $user_code    = func_get_args()[0]['user_code'] ;    // 取参数：用户编码
    $survey_code  = func_get_args()[0]['survey_code'] ;  // 取参数：调查编码
    $info         = func_get_args()[0]['info'] ;         // 取参数：调查信息
    $question     = func_get_args()[0]['question'] ;     // 取参数：题目信息

    if($user_code){
        // 因为前台自动保存方式有可能传入空值调查名称，所以给一个默认值以方便用户管理调查
        if($info['survey_name'] == null){
            $info['survey_name'] = '未命名草稿' ;
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
            surveyDelete($survey_code, 'undo') ;  // 更新前清理调查

            // 调查标签处理
            if($info['survey_tag']){
                for($t = 0; $t < count($info['survey_tag']); $t++){
                    $tag = array(
                        'tag_name'        => $info['survey_tag'][$t], 
                        'survey_code'     => $survey_code, 
                        'survey_type'     => $info['survey_type'], 
                        'survey_type_sub' => $info['survey_type_sub'], 
                        'survey_trade'    => $info['survey_trade'], 
                    ) ;

                    if(!insertTable(TB_BAS_TAG_INFO, $tag)){
                        surveyDelete($survey_code, 'clean') ;  // 更新失败删除所有调查相关信息
                        return array (
                            'data'   => false                   ,// 错误编码
                            'info'   => "更新调查标签信息失败"  ,// 错误信息
                            'status' => 0                       ,// 返回状态
                        ) ;
                    }
                }

                // 转换标签数组为为字符串格式
                $info['survey_tag'] = implode(',', $info['survey_tag']) ;
            }else{
                $info['survey_tag'] = null ;
            }

            if(!surveyInfoAlter($survey_code, $info)){
                surveyDelete($survey_code, 'clean') ;  // 更新失败删除所有调查相关信息
                return array (
                    'data'   => false                   ,// 错误编码
                    'info'   => "更新调查基本信息失败"  ,// 错误信息
                    'status' => 0                       ,// 返回状态
                ) ;
            }
        }

        // 更新调查题目信息
        if($question){
            if(!surveyQuestionAlter($user_code, $survey_code, $question)){
                surveyDelete($survey_code, 'clean') ;  // 更新失败删除所有调查相关信息
                return array (
                    'data'   => false               ,// 错误编码（没有传入任何有效参数）
                    'info'   => "更新题目信息失败"  ,// 错误信息
                    'status' => 0                   ,// 返回状态
                ) ;
            }
        }

        // 如果调查状态是发布状态，还要更新用户账户相关信息
        if(intval($info['survey_state']) == 2){
            if(!userActionUpdate($user_code, 1002, $survey_code)){
                surveyDelete($survey_code, 'clean') ;  // 更新失败删除所有调查相关信息
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

        // 目前发布调查即立即开始
        // 以后要加入审核制度。。低级别调查或者有敏感词的调查需审核
        if(intval($data['survey_state'])  == 2){
            $data['survey_state'] = 3 ;
            $data['start_time']   = $data['state_time'] = date('Y-m-d H:i:s') ;

            // 如更新调查题目信息成功则更新调查统计信息
            if(!surveyStatistUpdate($survey_code)){
                return false ;
            }
        }

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
    $is_base     = func_get_args()[0]['is_base'] ;      // 取参数：是否只取基本信息

    if($survey_code){
        $survey = surveyInfoSelect($survey_code, $is_base) ;

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
            // 删除目标调查相关题目信息
            if(surveyQuestionDelete($survey_code)){
                // 更新目标调查相关题目信息
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
// function api_survey_type_list_select1(){
//     $type = func_get_args()[0]['type'] ;  // 取参数：调查类型
//     $mode = func_get_args()[0]['mode'] ;  // 取参数：调查模式
//     $page = func_get_args()[0]['page'] ;  // 取参数：查询页码
//     $pnum = func_get_args()[0]['pnum'] ;  // 取参数：数据量

//     $data               = array() ;
//     $url_user           = U('user/user/visit') ;
//     $url_visit          = U('survey/survey/visit') ;
//     $url_type           = U('survey/survey/type') ;
//     $url_trade          = U('survey/survey/trade') ;
//     $tbBasUserInfo      = M(TB_BAS_USER_INFO)       -> getTableName() ;
//     $tbBasSurveyInfo    = M(TB_BAS_SURVEY_INFO)     -> getTableName() ;
//     $tbDetSurveyTypeSub = M(TB_DET_SURVEY_TYPE_SUB) -> getTableName() ;
//     $tbDetSurveyTrade   = M(TB_DET_SURVEY_TRADE)    -> getTableName() ;

//     // 判断调查类型设计调查类型条件（默认第一个调查类型1001）
//     switch(strlen($type)){
//         case 4 :
//             if(M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_code = $type") -> find()){
//                 $and = "and a.survey_type = $type " ;
//             }else{
//                 $and = "and a.survey_type = 1001 " ; 
//             }
//             break ;

//         case 5 :
//             if(M(TB_DET_SURVEY_TYPE_SUB) -> where("survey_type_sub_code = $type") -> find()){
//                 $and = "and a.survey_type_sub = $type " ;
//             }else{
//                 $and = "and a.survey_type = 1001 " ; 
//             }
//             break ;

//         default :
//             $and = "and a.survey_type = 1001 " ;
//             break ;
//     }

//     $modes = array(
//         // 最新问卷：开始时间.DESC -> 推荐等级.ASC -> 参与次数.ASC
//         'new' => array(
//             'order' => "order by a.start_time desc, a.recomm_grade, a.answer_count "
//         ),
//         // 参与人数.DESC -> 结束时间.DESC -> 开始时间.DESC
//         'hot' => array(
//             'order' => "order by a.answer_count desc, a.end_time desc, a.start_time desc "
//         ),
//         // 推荐等级.ASC -> 结束时间.DESC -> 参与人数.ASC
//         'rec' => array(
//             'order' => "order by a.recomm_grade, a.end_time desc, a.answer_count "
//         ),
//     ) ;

//     $mode ? $data[$mode] = $modes[$type] : $data = $modes  ;
//     $page ? $page : $page = 1  ;
//     $pnum ? $pnum : $pnum = 10 ;
//     $limit = "limit " . strval(($page - 1) * $pnum) . ", $pnum" ;  // 计算页码
    
//     foreach ($data as $key => $cond) {
//         $sql =  "select distinct a.survey_code, a.survey_name, a.survey_desc, a.user_code, a.user_nick, b.user_photo, a.question_count, ".
//                 "c.survey_type_name, c.survey_type_code, c.survey_type_sub_code, c.survey_type_sub_name, ".
//                 "d.survey_trade_code, d.survey_trade_name, date_relative_now(a.start_time) start_date, ".
//                 "concat('$url_user?code=', a.user_code) url_user, concat('$url_visit?code=', a.survey_code) url_visit, ". 
//                 "concat('$url_type?type=', a.survey_type) url_type, concat('$url_type?type=', a.survey_type_sub) url_type_sub, ". 
//                 "concat('$url_trade?trade=', a.survey_trade) url_trade ". 
//                 "from $tbBasSurveyInfo a, $tbBasUserInfo b, $tbDetSurveyTypeSub c, $tbDetSurveyTrade d ".
//                 "where a.user_code = b.user_code and a.survey_type_sub = c.survey_type_sub_code and a.survey_trade = d.survey_trade_code ".
//                 "and survey_state > 0 ". $and. $cond['order']. $limit ;  // 开发时用这个
//                 // "and survey_state > 1, a.start_time is not null ". $and. $order. $limit ;  // 正式时用这个
//         if($query = M() -> query($sql)){
//             $survey[$key] = $query ;
//         }
//     }

//     // 返回查询结果
//     if(count($survey)){
//         return array (
//             'data'   => $survey                                ,// 调查信息
//             'info'   => "success:api_survey_type_list_select"  ,// 成功信息
//             'status' => 1                                      ,// 返回状态
//             'type'   => 'json'                                 ,// 数据类型
//         ) ;
//     }else{
//         return array (
//             'data'   => 0                                     ,// 错误代码
//             'info'   => "failed:api_survey_type_list_select"  ,// 错误信息
//             'status' => 0                                     ,// 返回状态
//         ) ;
//     }
// }

// function api_survey_list_select(){
//     $param['filter'] = func_get_args()[0]['filter'] ;  // 取参数：查询条件
//     $param['order']  = func_get_args()[0]['order'] ;   // 取参数：查询排序
//     $param['page']   = func_get_args()[0]['page'] ;    // 取参数：查询页码
//     $param['pages']  = func_get_args()[0]['pages'] ;   // 取参数：查询页码
//     $param['pnum']   = func_get_args()[0]['pnum'] ;    // 取参数：数据量

//     if($survey = surveyListSelect($param)){
//         return array (
//             'data'   => $survey                           ,// 返回数据
//             'info'   => "success:api_survey_list_select"  ,// 成功信息
//             'status' => 1                                 ,// 返回状态
//         ) ;
//     }else{
//         return array (
//             'data'   => false                            ,// 错误代码
//             'info'   => "failed:api_survey_list_select"  ,// 错误信息
//             'status' => 0                                ,// 返回状态
//         ) ;
//     }
// }

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
    $tbBasUserInfo         = M(TB_BAS_USER_INFO)          -> getTableName() ;
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
            'table' => "," . $tbBasSurveyAction . " t",
            'cond'  => "and a.survey_code = t.survey_code and a.survey_state > 1 and t.user_code = $user ",
            'order' => 't.end_time desc ',
        ),
        // 关注的调查
        'follow' => array(
            'table' => "," . $tbBasUserFollowSurvey . " t",
            'cond'  => "and a.survey_code = t.follow_code and a.survey_state > 1 and t.user_code = $user ",
            'order' => 't.follow_time desc ',
        ),
    ) ;

    // 根据入参查询
    $type ? $data[$type] = $action[$type] : $data = $action  ;
    
    foreach ($data as $key => $value) {
        $sql = "select distinct a.survey_code, a.survey_name, a.survey_desc, a.user_code, b.user_nick, a.question_count, d.survey_type_name, 
                a.survey_state, c.state_desc_sketch survey_state_desc, date(a.create_time) create_date, date(a.start_time) start_date, 
                concat('$url_user?code=', a.user_code) url_user, concat('$url_create?code=', a.survey_code) url_create, 
                concat('$url_visit?code=', a.survey_code) url_visit, concat('$url_answer?code=', a.survey_code) url_answer, 
                concat('$url_analyse?code=', a.survey_code) url_analyse, concat('$url_type?type=', a.survey_type) url_type 
                from $tbBasSurveyInfo a, $tbBasUserInfo b, $tbDetSurveyState c, $tbDetSurveyType d". $value['table'].
                " where a.user_code = b.user_code and a.survey_state = c.survey_state_code and a.survey_type = d.survey_type_code ". $value['cond'].
                " order by " . $value['order'] ;
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

                $sql = "select 
                            a.survey_code, a.survey_name, a.state_time, a.survey_state, d.state_desc_sketch survey_state_desc, 
                            date(a.start_time) start_date, concat('$url_action?code=', a.survey_code) url_action, 
                            concat('$url_alter?code=', a.survey_code) url_alter, concat('$url_analyse?code=', a.survey_code) url_analyse 
                        from $tbBasSurveyInfo a, $tbBasUserInfo b, $tbBasSurveyAction c, $tbDetSurveyState d 
                        where a.user_code = b.user_code and a.survey_code = c.survey_code and a.survey_state = d.survey_state_code 
                        and $condition_us and $condition_sv order by a.end_time desc" ;
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
* @Param  : json     question     题目信息
* @Return : boolean  true/false   汇总结果提交成功或失败标志
*/
function api_survey_answer_submit(){
    $survey      = func_get_args()[0]['survey'] ;    // 取参数：调查信息
    $question    = func_get_args()[0]['question'] ;  // 取参数：调查信息
    $user_code   = cookie('user_code') ;
    $survey_code = $survey['survey_code'] ;

    // 先判断调查状态
    if(surveyState($survey_code) == 4){
        return array (
            'data'   => '调查已结束'                       ,// 错误代码
            'info'   => "failed:api_survey_answer_submit"  ,// 错误信息
            'status' => 0                                  ,// 返回状态
        ) ;
    }

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
* @Param  : number  question_code  对应题目编码
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

        // 先删除该题目下此用户创建过的选项（如果有）
        $condition = "question_code = " . $question_code . " and option_type = 2" . " and create_user='$user_code'" ;
        M(TB_BAS_QUESTION_OPTION) -> where($condition) -> delete() ;

        // 生成选项编码
        $condition           = "question_code = " . $question_code . " and option_type = 2" ;
        $data['option_seq']  = M(TB_BAS_QUESTION_OPTION) -> where($condition) -> max('option_seq') + 1 ;                      // 选项序号
        $data['option_code'] = strval($data['question_code']) . strval($data['option_type']) . strval($data['option_seq']) ;  // 选项编码

        // 整理好的数据插入题目选项清单表
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
* @Name   : api_survey_comment_submit
* @Desc   : 调查评论提交
* @Param  : number  user_code     用户编码（必选）
* @Param  : number  survey_code   调查编码（必选）
* @Param  : string  comment_txt   评论内容（必选）
* @Return : bool    true/flase    更新结果标志
*/
function api_survey_comment_submit(){
    $data                 = func_get_args()[0] ;
    $data['comment_time'] = date('Y-m-d H:i:s') ;  // 选项创建时间


    if(M(TB_BAS_SURVEY_COMMENT) -> add($data)){
        return array (
            'data'   => true                                 ,// 数据信息
            'info'   => "success:api_survey_comment_submit"  ,// 成功信息
            'status' => 1                                    ,// 返回状态
        ) ;
    }else{
        return array (
            'data'   => false                               ,// 错误信息
            'info'   => "failed:api_survey_comment_submit"  ,// 错误信息
            'status' => 0                                   ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_survey_comment_list_select
* @Desc   : 调查评论查询
* @Param  : number  survey_code   调查编码（必选）
* @Param  : number  page          查询页码（可选）
* @Param  : number  pnum          数据量（可选）
* @Return : json    list          查询结果
*/
function api_survey_comment_list_select(){
    $survey_code = func_get_args()[0]['survey_code'] ;  // 取参数：调查编码
    $page        = func_get_args()[0]['page'] ;         // 取参数：查询页码
    $pnum        = func_get_args()[0]['pnum'] ;         // 取参数：数据量

    $page ? $page : $page = 1  ;
    $pnum ? $pnum : $pnum = 10 ;
    $limit = "limit " . strval(($page - 1) * $pnum) . ", $pnum" ;  // 计算页码

    $tbBasSurveyComment = M(TB_BAS_SURVEY_COMMENT) -> getTableName() ;
    $tbBasUserInfo      = M(TB_BAS_USER_INFO)      -> getTableName() ;
    $user_visit         = U('user/user/visit') ;

    // Ta的其他调查
    $sql = "select a.user_code, b.user_nick, b.user_photo, concat('$user_visit?code=', a.user_code) url_user, 
            date_relative_now(a.comment_time) comment_time, a.comment_txt
            from $tbBasSurveyComment a, $tbBasUserInfo b
            where a.user_code = b.user_code 
            and a.survey_code = $survey_code 
            order by a.comment_time desc $limit" ;
    $list = M() -> query($sql) ;

    if($list){
        return array (
            'data'   => $list                                     ,// 数据信息
            'info'   => "success:api_survey_comment_list_select"  ,// 成功信息
            'status' => 1                                         ,// 返回状态
        ) ;
    }else{
        return array (
            'data'   => false                                    ,// 错误信息
            'info'   => "failed:api_survey_comment_list_select"  ,// 错误信息
            'status' => 0                                        ,// 返回状态
        ) ;
    }

// "select survey_code, replace(replace(replace(survey_name, '&nbsp;', ' '), '<br>' ,' '), '  ', ' ')  survey_name,
//             concat('$sv_visit?code=', survey_code) survey_visit 
//             from $tbBasSurveyInfo where user_code = $sv_user and survey_code <> $survey_code and survey_state = 3 
//             order by start_time desc limit 10 " ;

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
            $sql =  "select distinct a.survey_code, a.survey_name, a.survey_desc, a.user_code, a.user_nick, a.question_count, c.survey_type_desc, ".
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
}

/*
* @Name   : api_stats_sv_trend
* @Desc   : 调查趋势统计
* @Param  : number  $survey_code  调查编码（必选）
* @Return : json    $data         统计结果
*/
function api_stats_sv_trend(){
    $survey_code = func_get_args()[0]['survey_code'] ;  // 取参数：调查编码

    if($survey_code){
        return array (
            'data'   => surveyTrendStats($survey_code)    ,// 数据信息
            'info'   => "success:api_stats_survey_trend"  ,// 成功信息
            'status' => 1                                 ,// 返回状态
            'type'   => 'json'                            ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => false                            ,// 错误编码
            'info'   => "failed:api_stats_survey_trend"  ,// 错误信息
            'status' => 0                                ,// 返回状态
        ) ;
    }
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
* @Param  : number  $survey_code  调查编码（必选）
* @Param  : string  type          调查类型（可选）
* @Return : json    $stats        统计结果
*/
function api_stats_sv_group_cnt(){
    $survey_code = func_get_args()[0]['survey_code'] ;  // 取参数：调查编码
    $prop        = func_get_args()[0]['prop'] ;         // 取参数：用户属性

    if(!M(TB_BAS_SURVEY_INFO) -> where("survey_code = $survey_code") -> find()){
        return array (
            'data'   => 0                                ,// 错误代码
            'info'   => "failed:api_stats_sv_group_cnt"  ,// 错误信息
            'status' => 0                                ,// 返回状态
        ) ; 
    }

    $tbBasSurveyAction = M(TB_BAS_SURVEY_ACTION)  -> getTableName() ;
    $tbBasUserInfo     = M(TB_BAS_USER_INFO)      -> getTableName() ;
    $tbDetUserSex      = M(TB_DET_USER_SEX)       -> getTableName() ;
    $tbDetUserAge      = M(TB_DET_USER_AGE)       -> getTableName() ;
    $tbDetUserEdu      = M(TB_DET_USER_EDU)       -> getTableName() ;
    $tbDetUserCareer   = M(TB_DET_USER_CAREER)    -> getTableName() ;

    $user = array(
        // 创建的调查
        'sex' => array(
            'tab' => TB_DET_USER_SEX,
            'sql' => array(
                'cnt' => "select c.user_sex_code, c.user_sex_desc, count(1) cnt
                            from $tbBasSurveyAction a, $tbBasUserInfo b, $tbDetUserSex c 
                            where a.user_code = b.user_code 
                            and b.user_sex = c.user_sex_code
                            and a.survey_code = $survey_code 
                            group by c.user_sex_code, c.user_sex_desc order by 1"
            )
        ),
        'age' => array(
            'tab' => TB_DET_USER_AGE,
            'sql' => array(
                'cnt' => "select c.user_age_code, c.user_age_desc, count(1) cnt
                            from $tbBasSurveyAction a, $tbBasUserInfo b, $tbDetUserAge c 
                            where a.user_code = b.user_code 
                            and b.user_age_section = c.user_age_code
                            and a.survey_code = $survey_code  
                            group by c.user_age_code, c.user_age_desc order by 1"
            )
        ),
        'edu' => array(
            'tab' => TB_DET_USER_EDU,
            'sql' => array(
                'cnt' => "select c.user_edu_code, c.user_edu_desc, count(1) cnt
                            from $tbBasSurveyAction a, $tbBasUserInfo b, $tbDetUserEdu c 
                            where a.user_code = b.user_code 
                            and b.user_edu = c.user_edu_code
                            and a.survey_code = $survey_code  
                            group by c.user_edu_code, c.user_edu_desc order by 1"
            )
        ),
        'career' => array(
            'tab' => TB_DET_USER_CAREER,
            'sql' => array(
                'cnt' => "select c.user_career_code, c.user_career_desc, count(1) cnt
                            from $tbBasSurveyAction a, $tbBasUserInfo b, $tbDetUserCareer c 
                            where a.user_code = b.user_code 
                            and b.user_career = c.user_career_code
                            and a.survey_code = $survey_code  
                            group by c.user_career_code, c.user_career_desc order by 1"
            )
        ),
        'area' => array(
            'tab' => TB_DET_USER_CAREER,
            'sql' => array(
                'city' => "select t1.area_city_code city_code, t1.area_city_sname city_name, sum(cnt) cnt 
                            from tb_det_area_map t1 left outer join (
                              select c.area_city_code, count(1) cnt
                              from tb_bas_survey_action a, tb_bas_user_info b, tb_det_area_map c 
                              where a.user_code = b.user_code 
                              and b.area_city = c.area_city_code
                              and a.survey_code = 10000303 
                              group by c.area_province_code) t2
                            on t1.area_city_code = t2.area_city_code
                            group by t1.area_city_code, t1.area_city_sname order by cnt desc, city_code desc",

                'province' => "select t1.area_province_code province_code, t1.area_province_sname province_name, sum(cnt) cnt 
                                from tb_det_area_map t1 left outer join (
                                  select c.area_city_code, count(1) cnt
                                  from tb_bas_survey_action a, tb_bas_user_info b, tb_det_area_map c 
                                  where a.user_code = b.user_code 
                                  and b.area_city = c.area_city_code
                                  and a.survey_code = 10000303 
                                  group by c.area_province_code) t2
                                on t1.area_city_code = t2.area_city_code
                                group by t1.area_province_code, t1.area_province_sname order by cnt desc, province_code desc",
            )
        ),
    ) ;

    $prop ? $props[$prop] = $user[$prop] : $props = $user ;

    foreach ($props as $k => $s) {
        $stats[$k]['det'] = M($s['tab']) -> select() ;
        foreach($s['sql'] as $sk => $sp){
            $stats[$k][$sk] = M() -> query($sp) ;
        }
    }

    // 返回查询结果
    return array (
        'data'   => $stats                            ,// 调查信息
        'info'   => "success:api_stats_sv_group_cnt"  ,// 成功信息
        'status' => 1                                 ,// 返回状态
        'type'   => 'json'                            ,// 数据类型
    ) ;
}

function api_stats_sv_group_cnt1(){
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
 * @Name   : api_stats_qt_group_prop
 * @Desc   : 调查答题情况分组统计（用户属性分析）
 * @Param  : number  $survey_code    调查编码（必选）
 * @Param  : number  $question_code  题目编码（可选）
 * @Param  : array   $prop           用户属性（必选）
 * @Return : json    $data           统计结果
 */
function api_stats_qt_group1(){
    $survey_code   = func_get_args()[0]['survey_code'] ;    // 取参数：调查编码

    $question_code = func_get_args()[0]['question_code'] ;  // 取参数：题目编码
    $option_code   = func_get_args()[0]['option_code'] ;  // 取参数：题目编码
    $prop_code     = func_get_args()[0]['prop_code'] ; 
    $type          = func_get_args()[0]['type'] ; 

    $tbBasUserInfo       = M(TB_BAS_USER_INFO)       -> getTableName() ;
    $tbBasQuestionAction = M(TB_BAS_QUESTION_ACTION) -> getTableName() ;

    if($type == 'option'){
        $prop_name = $type ;
        $relation  = M(TB_BAS_PROP_DET_RELATION) -> where("bas_table_name = 'BasUserInfo' and prop_name = '$prop_name'") -> find() ;
        $prop_bas  = $relation['bas_prop_name'] ;
        $prop_det  = $relation['det_prop_name'] ;
        $prop_desc = $relation['det_prop_desc'] ;
        $table     = M($relation['det_table_name']) -> getTableName() ;

        array_push($props, "t$i.".$det_prop_desc." $prop_name") ;      // 生成目标字段数组
        array_push($group, "t$i.".$det_prop_desc) ;                    // 生成分组字段数组
        array_push($table, $tbDetName . " t$i") ;                      // 生成维表表名数组
        $and = " and a.$bas_prop_name = t$i.$det_prop_name". $and ;    // 生成条件字符串

        $sql = "select b.question_code, b.option_code, b.option_name, t.$prop_bas, t.$prop_desc, 
                case when question_type = '32' then sum(option_value) else count(1) end stats
                from $tbBasUserInfo a , $tbBasQuestionAction b, $table t 
                where a.user_code = b.user_code and a.$prop_bas = t.$prop_det and b.survey_code = $survey_code 
                group by b.question_code, b.option_code, b.option_name, t.$prop_bas, t.$prop_desc 
                order by b.option_code" ;
    }else{

    }

    $data = M() -> query($sql) ;
    dump($data) ;
}

/*
 * @Name   : api_stats_qt_group_prop
 * @Desc   : 调查答题情况分组统计（用户属性分析）
 * @Param  : number  $survey_code    调查编码（必选）
 * @Param  : number  $question_code  题目编码（可选）
 * @Param  : json    $prop           用户属性（可选）
 * @Return : json    $data           统计结果
 */
function api_stats_qt_group_prop(){
    $survey_code   = func_get_args()[0]['survey_code'] ;    // 取参数：调查编码
    $question_code = func_get_args()[0]['question_code'] ;  // 取参数：题目编码
    $prop          = func_get_args()[0]['prop'] ;           // 取参数：用户属性

    $tbBasUserInfo       = M(TB_BAS_USER_INFO)       -> getTableName() ;
    $tbBasQuestionAction = M(TB_BAS_QUESTION_ACTION) -> getTableName() ;

    if($prop){
        $props = $table = $group = array() ;

        for($i = 0; $i < count($prop); $i++){
            $prop_name      = $prop[$i] ;
            $relation       = M(TB_BAS_PROP_DET_RELATION) -> where("bas_table_name = 'BasUserInfo' and prop_name = '$prop_name'") -> find() ;
            $det_table_name = $relation['det_table_name'] ;
            $bas_prop_name  = $relation['bas_prop_name'] ;
            $det_prop_name  = $relation['det_prop_name'] ;
            $det_prop_desc  = $relation['det_prop_desc'] ;
            $tbDetName      = M($det_table_name) -> getTableName() ;

            array_push($props, "t$i.".$det_prop_desc." $prop_name") ;      // 生成目标字段数组
            array_push($group, "t$i.".$det_prop_desc) ;                    // 生成分组字段数组
            array_push($table, $tbDetName . " t$i") ;                      // 生成维表表名数组
            $and = " and a.$bas_prop_name = t$i.$det_prop_name". $and ;    // 生成条件字符串
        }

        $props = implode(',', $props).', ' ;  // 连接数组生成目标字段字符串
        $group = ','. implode(',', $group) ;  // 连接数组生成分组字段字符串
        $table = ','. implode(',', $table) ;  // 连接数组生成维表表名字符串
    }

    // 题目编码是可选项，如果指定编码就统计目标题目，如果没指定，统计目标调查的所有题目
    if($question_code){
        $and = "and b.question_code = $question_code". $and ;
    }else{
        $and = "and b.survey_code = $survey_code". $and ;
    }

    $sql = "select b.question_code, b.option_code, b.option_name, $props 
            case when question_type = '32' then sum(option_value) else count(1) end stats
            from $tbBasUserInfo a , $tbBasQuestionAction b $table 
            where a.user_code = b.user_code and b.survey_code = $survey_code $and 
            group by b.question_code, b.option_code, b.option_name $group 
            order by b.option_code" ;
    $data = M() -> query($sql) ;

    if($data){
        $stats = array() ;
        for($i = 0; $i < count($data); $i++){
            if($stats[$data[$i]['question_code']] == null){
                $stats[$data[$i]['question_code']] = array() ;
            }

            array_push($stats[$data[$i]['question_code']], $data[$i]) ;
        }

        return array (
            'data'   => $stats                             ,// 数据信息
            'info'   => "success:api_stats_qt_group_prop"  ,// 成功信息
            'status' => 1                                  ,// 返回状态
            'type'   => 'json'                             ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => false                             ,// 错误编码
            'info'   => "failed:api_stats_qt_group_prop"  ,// 错误信息
            'status' => 0                                 ,// 返回状态
        ) ;
    }
}

/*
 * @Name   : api_stats_qt_group_item
 * @Desc   : 调查答题情况分组统计（交叉题目分析）
 * @Param  : number  $survey_code    调查编码（必选）
 * @Param  : number  $question_code  问题编码（可选）
 * @Return : json    $stats          统计结果
 */
function api_stats_qt_group_item(){
    $survey_code   = func_get_args()[0]['survey_code'] ;    // 取参数：调查编码
    $question_code = func_get_args()[0]['question_code'] ;  // 取参数：题目编码

    $tbBasQuestionAction = M(TB_BAS_QUESTION_ACTION) -> getTableName() ;

    if($question_code){
        $and = " and a.question_code = $question_code and b.survey_code = $survey_code " ;
    }else{
        $and = " and a.survey_code = $survey_code and b.survey_code = $survey_code " ;
    }

    $sql = "select a.question_code tgt_qt_code, a.option_code tgt_opt_code, a.option_name tgt_opt_name, 
                   b.question_code grp_qt_code, b.option_code grp_opt_code, b.option_name grp_opt_name, 
                   case when a.question_type = '32' then sum(a.option_value) else count(1) end stats
            from $tbBasQuestionAction a , $tbBasQuestionAction b
            where a.user_code = b.user_code $and 
            group by a.question_code, a.option_code, a.option_name, b.question_code, b.option_code, b.option_name" ;
    $data = M() -> query($sql) ;

    if($data){
        $stats = array() ;
        for($i = 0; $i < count($data); $i++){
            if($stats[$data[$i]['tgt_qt_code']] == null){
                $stats[$data[$i]['tgt_qt_code']] = array() ;
            }

            array_push($stats[$data[$i]['tgt_qt_code']], $data[$i]) ;
        }

        return array (
            'data'   => $stats                             ,// 数据信息
            'info'   => "success:api_stats_qt_group_item"  ,// 成功信息
            'status' => 1                                  ,// 返回状态
            'type'   => 'json'                             ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => false                             ,// 错误编码
            'info'   => "failed:api_stats_qt_group_item"  ,// 错误信息
            'status' => 0                                 ,// 返回状态
        ) ;
    }
}

/*
 * @Name   : api_stats_qt_group_item
 * @Desc   : 调查答题情况分组统计（交叉题目分析）
 * @Param  : number  $survey_code   调查编码（必选）
 * @Param  : number  $target_qt     目标题目编码（必选）
 * @Param  : number  $target_opt    目标选项编码（可选）
 * @Param  : number  $group_qt      交叉题目编码（必选）
 * @Return : json    $data          统计结果
 */
function api_stats_qt_group_item1(){
    $survey_code = func_get_args()[0]['survey_code'] ;  // 取参数：调查编码
    $target_qt   = func_get_args()[0]['target_qt'] ;    // 取参数：目标题目编码
    $target_opt  = func_get_args()[0]['target_opt'] ;   // 取参数：目标选项编码
    $group_qt    = func_get_args()[0]['group_qt'] ;     // 取参数：交叉题目编码

    $tbBasQuestionAction = M(TB_BAS_QUESTION_ACTION) -> getTableName() ;    

    // 目标选项是可选项，如果指定目标选项就直接统计目标选项，如果没指定，统计目标题目的所有选项
    $target_opt ? $and = " and a.option_code = $target_opt " : $and = " and 1 = 1 " ;

    $sql = "select a.question_code tgt_qt_code, a.option_code tgt_opt_code, a.option_name tgt_opt_name, 
                   b.question_code grp_qt_code, b.option_code grp_opt_code, b.option_name grp_opt_name, 
                   count(1) cnt 
            from $tbBasQuestionAction a , $tbBasQuestionAction b
            where a.user_code = b.user_code ". $and. "
            and a.survey_code = $survey_code and a.question_code = $target_qt 
            and b.survey_code = $survey_code and b.question_code = $group_qt 
            group by a.question_code, a.option_code, a.option_name, b.question_code, b.option_code, b.option_name" ;
    $data = M() -> query($sql) ;

    if($data){
        $stats = array() ;

        for($i = 0; $i < count($data); $i++){
            if($stats[$data[$i]['tgt_qt_code']]){
                $stats[$data[$i]['tgt_qt_code']][0] = $data[$i] ;
            }else{
                array_push($stats[$data[$i]['tgt_qt_code']], $data[$i]) ;
                
            }
        }
    }


    // 返回结果
    if($data && count($data) > 0){
        return array (
            'data'   => $data                              ,// 数据信息
            'info'   => "success:api_stats_qt_group_item"  ,// 成功信息
            'status' => 1                                  ,// 返回状态
            'type'   => 'json'                             ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => false                             ,// 错误编码
            'info'   => "failed:api_stats_qt_group_item"  ,// 错误信息
            'status' => 0                                 ,// 返回状态
        ) ;
    }
}

/*
 * @Name   : api_stats_tag_hot
 * @Desc   : 热门标签统计
 * @Param  : string  cond          查询条件（可选）
 * @Return : json    $survey_info  调查基本信息
 */
function api_stats_tag_hot(){
    $cond = func_get_args()[0]['cond'] ;  // 取参数：调查编码

    $tbBasTagInfo = M(TB_BAS_TAG_INFO) -> getTableName() ;
    $url_tag      = U('survey/survey/tag') ;

    if(func_get_args()[0]['cond']){
        // $where = "where ". func_get_args()[0]['cond'] ;
    }

    // 热门标签统计
    $sql = "select tag_name, count(1) cnt, concat('$url_tag?tag=', tag_name) url_tag
            from $tbBasTagInfo $where group by tag_name, url_tag order by cnt desc limit 20" ;

    if($tag = M() -> query($sql)){
        return array (
            'data'   => $tag                        ,// 调查信息
            'info'   => "success:api_stats_tag_hot" ,// 成功信息
            'status' => 1                           ,// 返回状态
            'type'   => 'json'                      ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => 0                          ,// 错误代码
            'info'   => "failed:api_stats_tag_hot" ,// 错误信息
            'status' => 0                          ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_text_content
* @Desc   : 主观题参与内容查询
* @Param  : number  $survey_code    调查编码（可选）
* @Param  : number  $question_code  题目编码（可选）
* @Return : json    $data           目标调查的所有主观题参与内容
*/
function api_text_content(){
    $survey_code  = func_get_args()[0]['survey_code'] ;   // 取参数：调查编码
    $queston_code = func_get_args()[0]['queston_code'] ;  // 取参数：题目编码

    $tbBasQuestionAction = M(TB_BAS_QUESTION_ACTION) -> getTableName() ;
    $tbBasUserInfo       = M(TB_BAS_USER_INFO)       -> getTableName() ;
    $tbDetAreaMap        = M(TB_DET_AREA_MAP)        -> getTableName() ;
    $tbDetUserEdu        = M(TB_DET_USER_EDU)        -> getTableName() ;
    $tbDetUserCareer     = M(TB_DET_USER_CAREER)     -> getTableName() ;

    if($question_code){
        $condition = "a.question_code = $question_code and a.question_type = 'textarea'" ;
    }elseif($survey_code){
        $condition = "a.survey_code = $survey_code and a.question_type = 'textarea'" ;
    }else{
        return array (
            'data'   => -1                         ,// 错误编码（没有传入任何有效参数）
            'info'   => "failed:api_text_content"  ,// 错误信息
            'status' => 0                          ,// 返回状态
        ) ;
    }

    // 取数据
    $sql = "select t0.survey_code, t0.question_code, t0.option_name, t0.user_sex sex, t0.user_age age, 
                   t1.area_province_sname province, t1.area_city_sname city, t2.user_edu_desc edu, t3.user_career_desc career 
            from ( 
              select a.survey_code, a.question_code, a.option_name, b.*
              from $tbBasQuestionAction a, $tbBasUserInfo b
              where a.user_code = b.user_code and $condition) t0
            left outer join $tbDetAreaMap t1 on t0.area_city = t1.area_city_seq
            left outer join $tbDetUserEdu t2 on t0.user_edu  = t2.user_edu_code
            left outer join $tbDetUserCareer t3 on t0.user_career = t3.user_career_code ";
    $text = M() -> query($sql) ;

    if($text){
        // 数据分组
        for($i = 0; $i < count($text); $i++){
            if(!$data[$text[$i]['question_code']]){
                $data[$text[$i]['question_code']] = array() ;
            }
            array_push($data[$text[$i]['question_code']], $text[$i]) ;
        }
    }

    // 返回结果
    if($data && count($data) > 0){
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

function api_det_table_view(){
    $tables = func_get_args()[0]['tables'] ;  // 取参数：参数表简称
    $data   = array() ;

    for($i = 0; $i < count($tables); $i++){
        $data[$tables[$i]] = M(constant('TB_DET_'.strtoupper($tables[$i]))) -> select() ;
    }

    if(count($data)){
        return array (
            'data'   => $data                          ,// 维表数据
            'info'   => "success:api_det_table_view"  ,// 成功信息
            'status' => 1                              ,// 返回状态
            'type'   => 'json'                         ,// 数据类型
        ) ;
    }else{
        return array (
            'data'   => false                         ,// 错误编码
            'info'   => "failed:api_det_table_view"  ,// 失败信息
            'status' => 0                             ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_search_survey
* @Desc   : 搜索调查接口
* @Param  : string  $words   搜索关键字（必选）
* @Param  : string  $filter  条件筛选（可选）
* @Param  : string  $order   结果排序（可选）
* @Param  : number  $page    数据页码（可选）
* @Param  : number  $pages   数据全量页码（可选）
* @Param  : number  $pnum    数据量（可选）
* @Return : json    $data    查询到的数据
*/   
function api_search_survey(){
    $param['order'] = func_get_args()[0]['order'] ;   // 取参数：搜索类型
    $param['pages'] = func_get_args()[0]['pages'] ;   // 取参数：查询页码
    $param['page']  = func_get_args()[0]['page'] ;    // 取参数：查询页码
    $param['pnum']  = func_get_args()[0]['pnum'] ;    // 取参数：数据量

    // 筛选方式整理
    if(func_get_args()[0]['words']){
        $param['cond'] = "survey_state in(3,4) and survey_name like '%" . str_replace(' ', '%', func_get_args()[0]['words']) . "%' " ;
    }else{
        $param['cond'] = "1 = 1" ;
    }

    // 筛选方式整理
    if(func_get_args()[0]['filter']){
        $param['cond'] = $param['cond'] . " and " . func_get_args()[0]['filter'] ;
    }

    if($search = surveyListSelect($param)){
        return array (
            'data'   => $search                      ,// 返回数据
            'info'   => "success:api_search_survey"  ,// 成功信息
            'status' => 1                            ,// 返回状态
        ) ;
    }else{
        return array (
            'data'   => false                       ,// 错误代码
            'info'   => "failed:api_search_survey"  ,// 错误信息
            'status' => 0                           ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_search_question
* @Desc   : 搜索问题接口
* @Param  : string  $words   搜索关键字（必选）
* @Param  : string  $filter  条件筛选（可选）
* @Param  : string  $order   结果排序（可选）
* @Param  : number  $page    数据页码（可选）
* @Param  : number  $pages   数据全量页码（可选）
* @Param  : number  $pnum    数据量（可选）
* @Return : json    $data    查询到的数据
*/   
function api_search_question(){
    $words  = func_get_args()[0]['words'] ;   // 取参数：搜索字符
    $filter = func_get_args()[0]['filter'] ;  // 取参数：搜索筛选
    $order  = func_get_args()[0]['order'] ;   // 取参数：搜索排序
    $page   = func_get_args()[0]['page'] ;    // 取参数：查询页码
    $pages  = func_get_args()[0]['pages'] ;   // 取参数：查询全页码
    $pnum   = func_get_args()[0]['pnum'] ;    // 取参数：数据量

    // 搜索筛选排序相关信息    
    $filter ? $filter = " and $filter "     : $filter = "" ;
    $order  ? $order  = " order by $order " : $order  = " order by start_time desc " ;

    // 默认数据量设置
    $pnum ? $pnum : $pnum = 20 ;

    // 计算要查询的数据量
    if($page){
        // 分页查询
        $search['page'] = $page ;
        $limit          = "limit " . $page * $pnum . ", $pnum" ;
        $next           = "limit " . ($page + 1) * $pnum . ", 1" ;
    }elseif($pages){
        // 全页查询
        $search['page'] = $pages ;
        $limit          = "limit " . ($pages + 1) * $pnum ;
        $next           = "limit " . ($pages + 1) * $pnum . ", 1" ;
    }else{
        // 默认查询
        $search['page'] = 0 ;
        $limit          = "limit $pnum"  ;
        $next           = "limit $pnum, 1" ;
    }

    $url_us_visit = U('user/visit') ;
    $url_sv_visit = U('survey/survey/visit') ;
    $url_sv_type  = U('survey/survey/type')  ;
    $url_sv_trade = U('survey/survey/trade') ;

    $tbBasSurveyInfo        = M(TB_BAS_SURVEY_INFO)         -> getTableName() ;
    $tbBasUserInfo          = M(TB_BAS_USER_INFO)           -> getTableName() ;
    $tbDetSurveyType        = M(TB_DET_SURVEY_TYPE)         -> getTableName() ;
    $tbDetSurveyTypeSub     = M(TB_DET_SURVEY_TYPE_SUB)     -> getTableName() ;
    $tbDetSurveyTrade       = M(TB_DET_SURVEY_TRADE)        -> getTableName() ;
    $tbDetSurveyState       = M(TB_DET_SURVEY_STATE)        -> getTableName() ;
    $tbBasQuestionInfo      = M(TB_BAS_QUESTION_INFO)       -> getTableName() ;
    $tbDetQuestionClassType = M(TB_DET_QUESTION_CLASS_TYPE) -> getTableName() ;

    $cond = "and question_name like '%".str_replace(' ', '%', $words)."%' " ;

    $sql = array(
        'list' =>
            "select a.survey_name, a.question_count, a.survey_name, t.question_name, b.state_desc_sketch survey_state, 
                f.question_class_desc question_class, f.question_type_desc question_type, date_relative_now(a.start_time) start_date, 
                ifnull(t.answer_count, 0) answer_count, e.user_code, e.user_photo, e.user_nick, 
                c.survey_type_name survey_type, c.survey_type_sub_name survey_type_sub, d.survey_trade_name survey_trade, 
                concat('$url_us_visit?code=',  e.user_code)       url_us_visit,
                concat('$url_sv_visit?code=',  a.survey_code)     url_sv_visit,
                concat('$url_sv_type?type=',   a.survey_type)     url_sv_type,
                concat('$url_sv_type?type=',   a.survey_type_sub) url_sv_type_sub,
                concat('$url_sv_trade?trade=', a.survey_trade)     url_sv_trade
            from $tbBasSurveyInfo a, $tbDetSurveyState b, $tbDetSurveyTypeSub c, 
                 $tbDetSurveyTrade d, $tbBasUserInfo e, $tbDetQuestionClassType f, $tbBasQuestionInfo t
            where a.survey_state = b.survey_state_code and a.survey_type_sub = c.survey_type_sub_code
            and a.survey_trade = d.survey_trade_code and a.user_code = e.user_code 
            and a.survey_code = t.survey_code and t.question_type = f.question_type_code and a.survey_state in(3,4) 
            $cond $filter $order $limit",
        'next' =>
            "select a.survey_name
            from $tbBasSurveyInfo a, $tbDetSurveyState b, $tbDetSurveyTypeSub c, $tbDetSurveyTrade d, $tbBasUserInfo e
            where a.survey_state = b.survey_state_code and a.survey_type_sub = c.survey_type_sub_code
            and a.survey_trade = d.survey_trade_code and a.user_code = e.user_code and a.survey_state in(3,4) 
            $cond $filter $order $next",
    ) ;

    $search['list'] = M() -> query($sql['list']) ;

    if(!$search['list'] && !$search['page']){
        return array (
            'data'   => false                         ,// 错误代码
            'info'   => "failed:api_search_question"  ,// 错误信息
            'status' => 0                             ,// 返回状态
        ) ;
    }else{
        $search['next'] = M() -> query($sql['next']) ;

        return array (
            'data'   => $search                        ,// 返回数据
            'info'   => "success:api_search_question"  ,// 成功信息
            'status' => 1                              ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_search_user
* @Desc   : 搜索用户接口
* @Param  : string  $words   搜索关键字（必选）
* @Param  : string  $filter  条件筛选（可选）
* @Param  : string  $order   结果排序（可选）
* @Param  : number  $page    数据页码（可选）
* @Param  : number  $pages   数据全量页码（可选）
* @Param  : number  $pnum    数据量（可选）
* @Return : json    $data    查询到的数据
*/   
function api_search_user(){
    $words  = func_get_args()[0]['words'] ;   // 取参数：搜索字符
    $filter = func_get_args()[0]['filter'] ;  // 取参数：搜索筛选
    $order  = func_get_args()[0]['order'] ;   // 取参数：搜索排序
    $page   = func_get_args()[0]['page'] ;    // 取参数：查询页码
    $pages  = func_get_args()[0]['pages'] ;   // 取参数：查询全页码
    $pnum   = func_get_args()[0]['pnum'] ;    // 取参数：数据量

    // 搜索筛选排序相关信息    
    $filter ? $filter = " and $filter "     : $filter = "" ;
    $order  ? $order  = " order by $order " : $order  = " order by user_score desc " ;

    // 默认数据量设置
    $pnum ? $pnum : $pnum = 20 ;

    // 计算要查询的数据量
    if($page){
        // 分页查询
        $search['page'] = $page ;
        $limit          = "limit " . $page * $pnum . ", $pnum" ;
        $next           = "limit " . ($page + 1) * $pnum . ", 1" ;
    }elseif($pages){
        // 全页查询
        $search['page'] = $pages ;
        $limit          = "limit " . ($pages + 1) * $pnum ;
        $next           = "limit " . ($pages + 1) * $pnum . ", 1" ;
    }else{
        // 默认查询
        $search['page'] = 0 ;
        $limit          = "limit $pnum"  ;
        $next           = "limit $pnum, 1" ;
    }

    $url_us_visit = U('user/visit') ;
    $url_sv_visit = U('survey/survey/visit') ;
    $url_sv_type  = U('survey/survey/type')  ;
    $url_sv_trade = U('survey/survey/trade') ;

    $tbBasUserInfo         = M(TB_BAS_USER_INFO)          -> getTableName() ;
    $tbBasUserAccout       = M(TB_BAS_USER_ACCOUT)        -> getTableName() ;
    $tbDetUserLevel        = M(TB_DET_USER_LEVEL)         -> getTableName() ;
    $tbBasUserActionLog    = M(TB_BAS_USER_ACTION_LOG)    -> getTableName() ;
    $tbDetUserActionConfig = M(TB_DET_USER_ACTION_CONFIG) -> getTableName() ;

    $cond = "and user_nick like '%".str_replace(' ', '%', $words)."%' " ;

    $sql = array(
        'list' =>
            "select a.user_code, a.user_nick, a.user_photo, b.publish_times, b.answer_times, user_level_desc user_level
            from $tbBasUserInfo a, $tbBasUserAccout b, $tbDetUserLevel c
            where a.user_code = b.user_code and b.user_level = c.user_level_value $cond $filter $order $limit",
        'next' =>
            "select a.user_code from $tbBasUserInfo a, $tbBasUserAccout b where a.user_code = b.user_code $cond $filter $order $next",
    ) ;

    $search['list'] = M() -> query($sql['list']) ;

    if(!$search['list'] && !$search['page']){
        return array (
            'data'   => false                     ,// 错误代码
            'info'   => "failed:api_search_user"  ,// 错误信息
            'status' => 0                         ,// 返回状态
        ) ;
    }else{
        $search['next'] = M() -> query($sql['next']) ;

        for($i = 0; $i < count($search['list']); $i++){
            $user_code = $search['list'][$i]['user_code'] ;

            $sql = "select 
                        date_relative_now(a.action_time) action_time, a.action_name, b.action_desc, 
                        concat('$url_sv_visit?code=', a.action_value) url_sv_action
                    from $tbBasUserActionLog a , $tbDetUserActionConfig b
                    where a.action_code = b.action_code and a.user_code = $user_code
                    order by a.action_time desc limit 1" ;

            if($action = M() -> query($sql)[0]){
                $search['list'][$i] = array_merge($search['list'][$i], $action) ;
            }else{
                $search['list'][$i]['action_time'] = '暂无任何动态...' ;
            }
        }

        return array (
            'data'   => $search                    ,// 返回数据
            'info'   => "success:api_search_user"  ,// 成功信息
            'status' => 1                          ,// 返回状态
        ) ;
    }
}

/*
* @Name   : api_search_main
* @Desc   : 问题调查接口
* @Param  : string  $words   搜索关键字（必选）
* @Param  : string  $type    搜索类型（必选）
* @Param  : string  $filter  条件筛选（可选）
* @Param  : string  $order   结果排序（可选）
* @Param  : number  $page    数据页码（可选）
* @Param  : number  $pages   数据全量页码（可选）
* @Param  : number  $pnum    数据量（可选）
* @Return : json    $data    查询到的数据
*/   
function api_search_main(){
    $words  = func_get_args()[0]['words'] ;   // 取参数：搜索字符
    $type   = func_get_args()[0]['type'] ;    // 取参数：搜索类型
    $filter = func_get_args()[0]['filter'] ;  // 取参数：搜索类型
    $order  = func_get_args()[0]['order'] ;   // 取参数：搜索类型
    $page   = func_get_args()[0]['page'] ;    // 取参数：查询页码
    $pages  = func_get_args()[0]['pages'] ;   // 取参数：查询页码
    $pnum   = func_get_args()[0]['pnum'] ;    // 取参数：数据量

    // 搜索筛选排序相关信息
    if($type == 'user'){

    }else{
        $filter ? $filter = " and $filter "     : $filter = "" ;
        $order  ? $order  = " order by $order " : $order  = " order by start_time desc " ;
    }

    // 默认数据量设置
    $pnum ? $pnum : $pnum = 20 ;

    // 计算要查询的数据量
    if($page){
        // 分页查询
        $search['page'] = $page ;
        $limit          = "limit " . $page * $pnum . ", $pnum" ;
        $next           = "limit " . ($page + 1) * $pnum . ", 1" ;
    }elseif($pages){
        // 全页查询
        $search['page'] = $pages ;
        $limit          = "limit " . ($pages + 1) * $pnum ;
        $next           = "limit " . ($pages + 1) * $pnum . ", 1" ;
    }else{
        // 默认查询
        $search['page'] = 0 ;
        $limit          = "limit $pnum"  ;
        $next           = "limit $pnum, 1" ;
    }

    $url_us_visit = U('user/visit') ;
    $url_sv_visit = U('survey/survey/visit') ;
    $url_sv_type  = U('survey/survey/type')  ;
    $url_sv_trade = U('survey/survey/trade') ;
    
    $tbBasSurveyInfo        = M(TB_BAS_SURVEY_INFO)         -> getTableName() ;
    $tbBasQuestionInfo      = M(TB_BAS_QUESTION_INFO)       -> getTableName() ;
    $tbDetQuestionClassType = M(TB_DET_QUESTION_CLASS_TYPE) -> getTableName() ;
    $tbBasTagInfo           = M(TB_BAS_TAG_INFO)            -> getTableName() ;
    $tbBasUserInfo          = M(TB_BAS_USER_INFO)           -> getTableName() ;
    $tbBasUserAccout        = M(TB_BAS_USER_ACCOUT)         -> getTableName() ;
    $tbDetSurveyType        = M(TB_DET_SURVEY_TYPE)         -> getTableName() ;
    $tbDetSurveyTypeSub     = M(TB_DET_SURVEY_TYPE_SUB)     -> getTableName() ;
    $tbDetSurveyTrade       = M(TB_DET_SURVEY_TRADE)        -> getTableName() ;
    $tbDetUserLevel         = M(TB_DET_USER_LEVEL)          -> getTableName() ;
    $tbDetSurveyState       = M(TB_DET_SURVEY_STATE)        -> getTableName() ;
    $tbBasUserActionLog     = M(TB_BAS_USER_ACTION_LOG)     -> getTableName() ;
    $tbDetUserActionConfig  = M(TB_DET_USER_ACTION_CONFIG)  -> getTableName() ;

    // if($type == 'user'){
    //     $cond = "and user_nick like '%".str_replace(' ', '%', $words)."%' " ;
    // }else{
    //     $cond = "and " . $type . "_name like '%".str_replace(' ', '%', $words)."%' " ;
    // }


    $cfg = array(
        'survey' => array(  // 搜索调查
            'list' =>
                "select a.survey_name, a.question_count, b.state_desc_sketch survey_state, date_relative_now(a.start_time) start_date, 
                    ifnull(a.answer_count, 0) answer_count, e.user_code, e.user_photo, e.user_nick, 
                    replace(replace(replace(a.survey_desc, '&nbsp;', ' '), '<br>' ,' '), '  ', ' ') survey_desc,
                    c.survey_type_name survey_type, c.survey_type_sub_name survey_type_sub, d.survey_trade_name survey_trade, 
                    concat('$url_us_visit?code=',  e.user_code)       url_us_visit,
                    concat('$url_sv_visit?code=',  a.survey_code)     url_sv_visit,
                    concat('$url_sv_type?type=',   a.survey_type)     url_sv_type,
                    concat('$url_sv_type?type=',   a.survey_type_sub) url_sv_type_sub,
                    concat('$url_sv_trade?trade=', a.survey_code)     url_sv_trade
                from $tbBasSurveyInfo a, $tbDetSurveyState b, $tbDetSurveyTypeSub c, 
                     $tbDetSurveyTrade d, $tbBasUserInfo e
                where a.survey_state = b.survey_state_code and a.survey_type_sub = c.survey_type_sub_code
                and a.survey_trade = d.survey_trade_code and a.user_code = e.user_code and a.survey_state in(3,4) 
                $cond $filter $order $limit",
            'next' =>
                "select a.survey_name
                from $tbBasSurveyInfo a, $tbDetSurveyState b, $tbDetSurveyTypeSub c, $tbDetSurveyTrade d, $tbBasUserInfo e
                where a.survey_state = b.survey_state_code and a.survey_type_sub = c.survey_type_sub_code
                and a.survey_trade = d.survey_trade_code and a.user_code = e.user_code and a.survey_state in(3,4) 
                $cond $filter $order $next",
        ),

        'question' => array(  // 搜索问题
            'list' =>
                "select a.survey_name, a.question_count, a.survey_name, t.question_name, b.state_desc_sketch survey_state, 
                    f.question_class_desc question_class, f.question_type_desc question_type, date_relative_now(a.start_time) start_date, 
                    ifnull(t.answer_count, 0) answer_count, e.user_code, e.user_photo, e.user_nick, 
                    c.survey_type_name survey_type, c.survey_type_sub_name survey_type_sub, d.survey_trade_name survey_trade, 
                    concat('$url_us_visit?code=',  e.user_code)       url_us_visit,
                    concat('$url_sv_visit?code=',  a.survey_code)     url_sv_visit,
                    concat('$url_sv_type?type=',   a.survey_type)     url_sv_type,
                    concat('$url_sv_type?type=',   a.survey_type_sub) url_sv_type_sub,
                    concat('$url_sv_trade?trade=', a.survey_code)     url_sv_trade
                from $tbBasSurveyInfo a, $tbDetSurveyState b, $tbDetSurveyTypeSub c, 
                     $tbDetSurveyTrade d, $tbBasUserInfo e, $tbDetQuestionClassType f, $tbBasQuestionInfo t
                where a.survey_state = b.survey_state_code and a.survey_type_sub = c.survey_type_sub_code
                and a.survey_trade = d.survey_trade_code and a.user_code = e.user_code 
                and a.survey_code = t.survey_code and t.question_type = f.question_type_code and a.survey_state in(3,4) 
                $cond $filter $order $limit",
            'next' =>
                "select a.survey_name
                from $tbBasSurveyInfo a, $tbDetSurveyState b, $tbDetSurveyTypeSub c, $tbDetSurveyTrade d, $tbBasUserInfo e
                where a.survey_state = b.survey_state_code and a.survey_type_sub = c.survey_type_sub_code
                and a.survey_trade = d.survey_trade_code and a.user_code = e.user_code and a.survey_state in(3,4) 
                $cond $filter $order $next",
        ),

        'user' => array(  // 搜索用户
            'list' =>
                "select a.user_code, a.user_nick, a.user_photo, b.publish_times, b.answer_times, user_level_desc user_level
                from $tbBasUserInfo a, $tbBasUserAccout b, $tbDetUserLevel c
                where a.user_code = b.user_code and b.user_level = c.user_level_value $cond $filter $order $limit",
            'next' =>
                "select a.user_code from $tbBasUserInfo a, $tbBasUserAccout b 
                where a.user_code = b.user_code $cond $filter $order $next",
        ),
    ) ;

    $search['list'] = M() -> query($cfg[$type]['list']) ;

    if(!$search['list'] && !$search['page']){
        return array (
            'data'   => false                     ,// 错误代码
            'info'   => "failed:api_search_main"  ,// 错误信息
            'status' => 0                         ,// 返回状态
        ) ;
    }else{
        $search['next'] = M() -> query($cfg[$type]['next']) ;

        // 搜索用户单独处理：取用户最新动态
        if($type == 'user'){
            for($i = 0; $i < count($search['list']); $i++){
                $user_code = $search['list'][$i]['user_code'] ;

                $sql = "select 
                            date_relative_now(a.action_time) action_time, a.action_name, b.action_desc, 
                            concat('$url_sv_visit?code=', a.action_value) url_sv_action
                        from $tbBasUserActionLog a , $tbDetUserActionConfig b
                        where a.action_code = b.action_code and a.user_code = $user_code
                        order by a.action_time desc limit 1" ;

                if($action = M() -> query($sql)[0]){
                    $search['list'][$i] = array_merge($search['list'][$i], $action) ;
                }else{
                    $search['list'][$i]['action_time'] = '暂无任何动态...' ;
                }
            }
        }

        return array (
            'data'   => $search                    ,// 返回数据
            'info'   => "success:api_search_main"  ,// 成功信息
            'status' => 1                          ,// 返回状态
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

        // 以上都没有题目返回Ajax数据（JSON）
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

    // 以上都没有题目返回成功状态和数据
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