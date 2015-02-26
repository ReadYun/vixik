<?php

/**
 * @Name        : userAction.php
 * @Type        : Function
 * @Desc        : 用户行为相关函数库
 *
 * @Create-time : 2012-8-21
 * @Author      : ReadYun
 * @Copyright   : VixiK
 * @Version     : 1.0.00
 */
header("Content-type:text/html;charset=utf-8");

/*
 * @Name   : userCreate
 * @Desc   : 创建用户函数
 * @Param  : array    $user_info  用户基本信息
 * @Return : number   $user_code  调查编码
 */
function userCreate($user_info){
    // 用户基本信息数据整理
    $user_code = M(TB_BAS_USER_INFO) -> max('user_code') + 1 ;    // 新建用户编码
    $user_info['user_code']   = $user_code ;
    $user_info['user_nick']   = $user_info['user_name'] ;
    $user_info['create_time'] = date('Y-m-d H:i:s') ;
    $user_info['user_type']   = 6 ;    // 默认普通用户类型

    $user['user_code'] = $user_code ;

    // 用户账户信息数据整理
    $user_accout = array(
                'user_code'     => $user_code ,
                'user_score'    => 0 ,
                'user_level'    => 0 ,
                'user_coins'    => 0 ,
                'login_time'    => $user_info['create_time'] ,
                'publish_times' => 0 ,
                'answer_times'  => 0
            ) ;

    // 新用户相关数据写入对应数据表
    if(    insertTable(TB_BAS_USER_INFO,        $user_info) 
        && insertTable(TB_BAS_USER_ACCOUT,      $user_accout)
        && insertTable(TB_BAS_USER_EXTEND_INFO, $user)
        && insertTable(TB_BAS_USER_INTEREST,    $user)){

            // 创建用户成功直接生成新用户cookie
            cookie('user_code', $user_info['user_code'], 360000);
            cookie('user_name', $user_info['user_name'], 360000);
            cookie('user_nick', $user_info['user_nick'], 360000);
            cookie('user_pwd',  $user_info['user_pwd'],  360000);

            // 返回数据
            return $user_code ;
    }else{
        return false ;
    }
}

/*
 * @Name   : userInfoFind
 * @Desc   : 用户信息汇总查询
 * @Params : number  $user_code   用户编码
 * @Params : string  $user_name   用户名称
 * @Params : stirng  $user_email  用户电邮
 * @Params : string  $user_pwd    用户密码
 * @Return : array   $data        用户基本信息
 */
function userInfoFind(){
    $condition = func_get_args()[0] ;               // 取参数：查询条件
    $user_code = func_get_args()[0]['user_code'] ;  // 取参数：用户编码
    $user_md5  = func_get_args()[0]['user_md5'] ;   // 取参数：用户MD5码

    // 确定能查询到用户基本信息，再汇总其他信息并处理隐私信息
    if($user = M(TB_BAS_USER_INFO) -> where("user_code = $user_code") -> find()){
        if($accout = M(TB_BAS_USER_ACCOUT) -> where("user_code = ".$user['user_code']) -> find()){
            $user = array_merge($user, $accout) ;

            // 查询用户等级值对应的等级描述
            $user['user_level_desc']   = M(TB_DET_USER_LEVEL) -> where("user_level_value=".$user['user_level']) -> getField('user_level_desc') ;
            $user['follow_user_cnt']   = M(TB_BAS_USER_FOLLOW_USER)   -> where("user_code = '$user_code'")   -> count() ;  // 关注用户数统计
            $user['user_follow_cnt']   = M(TB_BAS_USER_FOLLOW_USER)   -> where("follow_code = '$user_code'") -> count() ;  // 被用户关注数统计
            $user['follow_survey_cnt'] = M(TB_BAS_USER_FOLLOW_SURVEY) -> where("user_code = '$user_code'")   -> count() ;  // 关注调查统计

            // 如果未通过MD5校验，还需要剔除用户隐私信息
            if(!$user_md5 || $user_md5 !== MD5($user['user_code'].$user['user_pwd'])){
                // 用户隐私属性列表（可维护）
                $private = array('user_email','identity_card','sure_name','user_address','mobile_phone','fix_phone') ;
                for($i = 0; $i < count($private); $i++){
                    unset($user[$private[$i]]) ;        
                }
            }

            // 从汇总的用户信息中剔除用户密码后输出
            unset($user['user_pwd']) ;
            return $user ;
        }else{
            return false ;
        }
    }else{
        return false ;
    }
}

function userInfoFind1(){
    $condition = func_get_args()[0] ;  // 取参数：查询条件

    if($condition){
        $dtBasUserInfo = M(TB_BAS_USER_INFO) -> where($condition) -> find() ;
    }

    // 确定能查询到用户基本信息，再汇总其他信息并处理隐私信息
    if($dtBasUserInfo){
        $user_code = $dtBasUserInfo['user_code'] ;
        $dtBasUserAccout     = M(TB_BAS_USER_ACCOUT)      -> where("user_code = '$user_code'") -> find() ;
        if($dtBasUserAccout && $dtBasUserInterest && $dtBasUserExtendInfo){
            $user = array_merge($dtBasUserInfo, $dtBasUserAccout, $dtBasUserInterest, $dtBasUserExtendInfo) ;
            
            $user_level = $user['user_level'] ;
            $level = M(TB_DET_USER_LEVEL) -> where("user_level_value = '$user_level'") -> find() ;    // 查询用户等级值对应的等级描述

            $user['user_level_desc'] = $level['user_level_desc'] ;   

            $user['follow_survey_cnt'] = M(TB_BAS_USER_FOLLOW_SURVEY) -> where("user_code = '$user_code'") -> count() ;  // 关注调查统计
            $user['follow_user_cnt']   = M(TB_BAS_USER_FOLLOW_USER)   -> where("user_code = '$user_code'") -> count() ;  // 关注用户统计

            // 自有权限判断：无用户密码或密码不匹配，需要剔除隐私信息
            if(!$condition['user_pwd'] || $condition['user_pwd'] !== $user['user_pwd']){
                $user['user_self'] = false ;
                $private = array('user_pwd','user_email','identity_card','sure_name','user_address','mobile_phone','fix_phone') ;  // 隐私列表
                for($i = 0; $i < count($private); $i++){
                    unset($user[$private[$i]]) ;
                }
            }else{
                $user['user_self'] = true ;
            }

            // 从汇总的用户信息中剔除用户密码后输出
            return $user ;
        }else{
            return false ;
        }
    }else{
        return false ;
    }
}

/*
 * @Name   : userInfoUpdate
 * @Desc   : 修改用户基本信息
 * @Params : number   $user_code  用户编码
 * @Params : string   $user_md5   用户MD5码
 * @Params : array    $data       要更新的用户信息
 * @Return : boolean  trun/false  成功与否标志
 */
function userInfoUpdate($user_code, $user_md5, $data){
    // 先校验用户权限
    if($user_pwd = M(TB_BAS_USER_INFO) -> where("user_code = $user_code") -> getField('user_pwd')){
        if($user_md5 !== MD5("$user_code".$user_pwd)){
            return false ;
        }
    }

    // 通过校验后更新用户信息
    $condition["user_code"] = $user_code ;
    if(updateTable(TB_BAS_USER_INFO ,$data, $condition, 'cover')){
        return true ;
    }else{
        return false ;
    }
}

// 老的用户信息更新方式。。把用户信息分到不同的（info/extend_info/interest）
function userInfoUpdate_old($type, $user_code, $data){
    $table = constant('TB_BAS_USER_' . strtoupper($type)) ;    // 取动态常量对应的目标表名
    $condition["user_code"] = $user_code ;

    // 更新用户基本信息表
    if(updateTable($table, $data, $condition, 'cover')){
        return true ;
    }else{
        return false ;
    }
}

/*
 * @Name   : userAccoutAlter
 * @Desc   : 用户账户信息修改
 * @Params : number   $user_code  用户编码
 * @Params : array    $data       用户账户信息
 * @Return : boolean  trun/false  成功与否标志
 */
function userAccoutAlter($user_code, $data){
    $condition["user_code"] = $user_code ;

    // 更新用户基本信息表
    if(updateTable(TB_BAS_USER_ACCOUT, $data, $condition, 'cover')){
        return true ;
    }else{
        return false ;
    }
}

/*
 * @Name   : userAccoutUpdate
 * @Desc   : 更新用户账户信息表(追加)
 * @Params : number   $user_code  用户编码
 * @Params : array    $data       用户账户信息
 * @Return : boolean  trun/false  更新成功与否标志
 */
function userAccoutUpdate($user_code, $data){
    $condition["user_code"] = $user_code ;

    // 更新用户基本信息表(追加数据)
    if(updateTable(TB_BAS_USER_ACCOUT ,$data, $condition, 'add')){
        return true ;
    }else{
        return false ;
    }
}

/*
 * @Name   : userActionUpdate
 * @Desc   : 用户行为同步更新账户信息
 * @Params : string   $user_code     用户编码
 * @Params : string   $action_code   行为编码
 * @Params : number   $action_value  行为值
 * @Return : boolean  trun/false     更新成功与否标志
 */
function userActionUpdate($user_code, $action_code, $action_value){
    // 取行为规则
    $action = M(TB_DET_USER_ACTION_CONFIG) -> where("action_code = $action_code") -> select() ;
    for($i = 0; $i < count($action); $i++){
        // 可变更新值取对应的实际值
        if(!$action[$i]['update_value']){
            $condition = $action[$i]['code_column'].' = '.$action_value ;
            $value     = M($action[$i]['table_name']) -> where("$condition") -> find() ;
            $action[$i]['update_value'] = $value[$action[$i]['value_column']] ;
        }

        // 计算需要更新的值
        $data[$action[$i]['update_type']] = $action[$i]['update_value'] * $action[$i]['update_logic'] ;
    }

    // 更新用户账户信息表中的金币积分等级
    if(userAccoutUpdate($user_code, $data)){
        // 写日志必要字段赋值
        $log['user_code']    = $user_code ;             // 用户编码
        $log['action_time']  = date('Y-m-d H:i:s') ;    // 行为发生时间
        $log['action_code']  = $action_code ;           // 行为编码
        $log['action_value'] = $action_value ;          // 行为值

        // 对需要写日志的行为做处理
        for($i = 0; $i < count($action); $i++){
            if($action[$i]['write_log'] == 1){
                $condition = $action[$i]['code_column'].' = '.$action_value ;
                $value     = M($action[$i]['table_name']) -> where("$condition") -> find() ;

                $log['action_name']  = $value[$action[$i]['desc_column']] ;    // 行为名称
                $log['action_type']  = $action[$i]['update_type'] ;  // 行为类型
                $log['change_value'] = $action[$i]['update_value'] * $action[$i]['update_logic'] ;

                // 数据写入日志表
                if(!insertTable(TB_BAS_USER_ACTION_LOG, $log)){
                    return false ;
                }
            }
        }

        // 判断是否需要更新用户等级
        $userAccout = M(TB_BAS_USER_ACCOUT) -> where("user_code = '$user_code'") -> find() ;    // 取当前用户账户信息
        $condition  = "score_lower_value <= ". $userAccout['user_score'] . " and score_upper_value >= ". $userAccout['user_score'] ;
        $level      = M(TB_DET_USER_LEVEL) -> where($condition) -> find() ;    // 取需要的积分规则
        
        // 如果计算出的最新等级与之前等级不同，更新用户最新等级
        if($level['user_level_value'] != $userAccout['user_level']){
            $accout['user_level'] = $level['user_level_value'] ;
            if(!userAccoutAlter($user_code, $accout)){
                return false ;
            }
        }
    }else{
        return false ;
    }

    // 所有更新顺利完成返回true
    return true ;
}


/*
 * @Name   : userFollowQuery
 * @Desc   : 用户关注与收藏信息查询
 * @Params : string   $follow_type   查询类型(user/survey)
 * @Params : string   $query_type    查询方式类型(select/count)
 * @Params : string   $query_code    查询对象编码(user_code/follow_code)
 * @Return : array    $data          查询结果数据
 */
function userFollowQuery($follow_type, $query_type, $query_code){
    // 生成动态常量目标表名
    $table = constant('TB_BAS_USER_FOLLOW_' . strtoupper($follow_type)) ;   

    // 生成动态查询条件
    $condition = implode(' and ', arrayImplode($query_code, '=', "", "'")) ;

    // 生成动态查询方式并得到数据
    $data = M($table) -> where($condition) -> $query_type() ;

    // 返回数据
    return $data ;
}

/*
 * @Name   : userFollowUpdate
 * @Desc   : 用户关注与收藏信息更新
 * @Params : number  $user_code    用户编码
 * @Params : string  $follow_type  更新对象类型(user/survey)
 * @Params : string  $follow_code  更新对象编码
 * @Params : string  $update_type  更新方式类型(add/del)
 * @Return : string  $data         更新后的目标信息
 */
function userFollowUpdate($user_code, $follow_type, $follow_code, $update_type){
    // 生成动态目标表名
    $table = constant('TB_BAS_USER_FOLLOW_' . strtoupper($follow_type)) ;

    // 必须用户编码和对象编码都有效才能执行更新操作
    if($user_code && $follow_code){
        // 根据不同的更新类型执行不同的操作
        switch($update_type){
            case 'add' :
                if(!userFollowQuery($follow_type, 'count', array('user_code'=>$user_code, 'follow_code'=>$follow_code))){
                    $data = array(
                                'user_code'    => $user_code           ,// 用户编码
                                'follow_code'  => $follow_code         ,// 目标编码
                                'follow_time'  => date('Y-m-d H:i:s')  ,// 更新时间
                                'follow_state' => 1                     // 更新状态
                            ) ;
                    $flag = insertTable($table, $data) ;
                }else{
                    $flag = 1 ;
                }
                break ;

            case 'del' :
                $condition = array(
                                'user_code'   => $user_code    ,// 用户编码
                                'follow_code' => $follow_code   // 目标编码
                            ) ;
                $flag = deleteTable($table, $condition) ;
                break ;
        }
    }else{
        return false ;
    }

    return $flag ;

    // // 更新完成返回最新的关注/收藏查询数据
    // if($flag){
    //     return userFollowQuery($follow_type , 'count', array('user_code'=>$user_code)) ;
    // }else{
    //     return false ;
    // }
}

?>



