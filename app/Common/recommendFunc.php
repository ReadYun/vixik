<?php

/**
 * Name        : recommendFunc.php
 * Type        : Function
 * Description : 推荐功能函数库
 *
 * Create-time : 2014/4/19 1:07
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

header("Content-type:text/html;charset=utf-8");

/*
 * @Name   : recommendCreate
 * @Desc   : 调查推荐规则生成
 * @Param  : integer  $survey_code       调查编码
 * @Param  : array    $recommend         推荐规则
 * @Return : integer  $recommend_code    规则编码
 */
function recommendCreate($survey_code, $rule, $number){
    // 先删除旧推荐规则
    M(TB_BAS_SURVEY_RECOMMEND)      -> where("survey_code = '$survey_code'") -> delete() ;
    M(TB_BAS_SURVEY_RECOMMEND_RULE) -> where("survey_code = '$survey_code'") -> delete() ;

    // 根据调查状态确定推荐规则初状态
    $recommend['recommend_state'] = M(TB_BAS_SURVEY_INFO) -> where("survey_code = '$survey_code'") -> getField('survey_state') ;

    // 生成推荐信息
    $recommend['survey_code']      = $survey_code ;         // 调查编码
    $recommend['recommend_grade']  = 1 ;                    // 推荐优先级
    $recommend['recommend_number'] = $number ;              // 推荐数量
    $recommend['state_time']       = date('Y-m-d H:i:s') ;  // 状态时间

    // 生成推荐规则信息
    // 插入推荐规则表
    if(insertTable(TB_BAS_SURVEY_RECOMMEND, $recommend)){
        for($i = 0; $i < sizeof($rule); $i++){
            $data['survey_code'] = $survey_code ;              // 调查编码
            $data['rule_key']    = $rule[$i]['rule_key'] ;     // 推荐规则字段
            $data['rule_logic']  = $rule[$i]['rule_logic'] ;   // 推荐规则逻辑
            $data['rule_value']  = $rule[$i]['rule_value'] ;   // 推荐规则对应值
            $data['rule_sql']    = $rule[$i]['rule_sql'] ;     // 推荐规则对应SQL语句
            $data['state_time']  = $recommend['state_time'] ;  // 状态时间

            // 插入推荐规则表
            if(!insertTable(TB_BAS_SURVEY_RECOMMEND_RULE, $data)){
                return false ;
            }
        }
        return true ;
    }else{
        return false ;
    }
}

/*
 * @Name   : surveyRecommendUser
 * @Desc   : 向调查推荐用户
 * @Param  : integer  $survey_code  调查编码
 * @Return : integer  $user_num     生成用户数
 */
function surveyRecommendUser($survey_code){
    // 取调查对应的推荐级别
    $recommend    = M(TB_BAS_SURVEY_RECOMMEND) -> where("survey_code = '$survey_code'") -> find() ;
    $recomm_grade = $recommend['recommend_grade'] ;
    $limit        = $recommend['recommend_number'] ;

    // 定义推荐用户清单表    
    $tbBasSurveyRecommendUser = M(TB_BAS_SURVEY_RECOMMEND_USER) -> getTableName() ;

    // 清除已有目标调查对应的用户清单
    M(TB_BAS_SURVEY_RECOMMEND_USER) -> where("survey_code = '$survey_code'") -> delete() ;

    while($recomm_grade <= 5){
        // 不同推荐级别执行不同操作
        switch($recomm_grade){
            // 用户自定义推荐
            case '1' : 
                // 生成满足规则的用户插入推荐用户清单表
                $rule = M(TB_BAS_SURVEY_RECOMMEND_RULE) -> where("survey_code = '$survey_code'") -> select() ;

                if($rule){
                    for($i = 0; $i < count($rule); $i++){
                        $condition = $condition . ' and ' . $rule[$i]['rule_sql'] ;
                    }
                }
                $condition = substr($condition, 4) ;
                $table = M(TB_BAS_USER_INFO) -> getTableName() ;
                break ;
            
            // 查找用户已经设置过的兴趣调查类型是同类型的用户进行推荐
            case '2' : 
                $condition = "survey_type like '%". $survey_type . "%'" ;
                $table     = M(TB_BAS_USER_INTEREST) -> getTableName() ;
                break ;
                
            // 查找参与过同类型调查活动的用户进行推荐
            case '3' : 
                $tbBasSurveyInfo = M(TB_BAS_SURVEY_INFO) -> getTableName() ;

                $condition = "exists (select survey_code from $tbBasSurveyInfo c where a.survey_code=c.survey_code and c.survey_type = $survey_type)" ;
                $table     = M(TB_BAS_SURVEY_ACTION) -> getTableName() ;
                break ;
                
            // 通过调查类型与用户属性关系表分析出调查类型对应的目标用户属性（待完善关系表后再开发）
            case '4' : 
                $condition = "1 <> 1" ;
                $table     = M(TB_BAS_USER_INTEREST) -> getTableName() ;
                break ;

            // 从未推荐过的有效用户中随机选取剩余数量用户
            case '5' : 
                $condition = "1 = 1" ;
                $table     = M(TB_BAS_USER_INFO) -> getTableName() ;
                break ;
        }

        // 推荐用户清单生成
        $state_time = date('Y-m-d H:i:s') ;
        $state_code = 1 ;

        // 执行SQL语句，插入推荐用户清单表
        $sql =  "insert into $tbBasSurveyRecommendUser ".
                "select distinct $survey_code, user_code, $recomm_grade, $state_code, '$state_time' ".
                "from $table a ".
                "   where $condition ".
                "   and not exists ( ".
                "   select user_code from $tbBasSurveyRecommendUser b ".
                "   where a.user_code = b.user_code ".
                "   and b.survey_code = $survey_code) ".
                "order by rand() limit $limit" ;
        M() -> execute($sql) ;

        $user_cnt = M(TB_BAS_SURVEY_RECOMMEND_USER) -> where("survey_code = '$survey_code'") -> count() ;
        $limit    = $limit - $user_cnt ;

        // 判断是否继续推荐
        if($limit <= 0){
            return true ;
        }else{
            $recomm_grade ++ ;   
        }
    }

    return true ;
}

/*
 * @Name   : userRecommendSurvey 
 * @Desc   : 向用户推荐调查
 * @Param  : number   $user_code     用户编码
 * @Param  : number   $recomm_grade  推荐优先级
 * @Param  : number   $limIt         推荐数量
 * @Return : number   $survey_code   推荐调查编码
 */
function userRecommendSurvey($user_code, $recomm_grade, $limit){
    $tbBasSurveyInfo          = M(TB_BAS_SURVEY_INFO)           -> getTableName() ;
    $tbBasSurveyRecommendUser = M(TB_BAS_SURVEY_RECOMMEND_USER) -> getTableName() ;

    if(!$user_code || $user_code < 10000000){    // 非登录用户随机推荐一个有效调查
        $sql =  "select survey_code from $tbBasSurveyInfo a ".
                "where survey_state = 3 ".
                "order by rand() limit 1" ;
        $survey_code = M() -> query($sql)[0]['survey_code'] ;
    }else{
        // 登录用户按推荐规则进行推荐
        if($recomm_grade <= 5){
            // 按推荐规则顺序查找调查
            switch($recomm_grade){
                // 推荐清单中该用户还未参与过的调查
                case '1' : 
                    $condition = '1 = 1' ;
                    break ;

                // 确认用户设置的兴趣调查类型，再查找同类型的有效调查推荐
                case '2' : 
                    $interest  = M(TB_BAS_USER_INTEREST) -> where("user_code = '$user_code'") -> find() ;
                    $condition = "survey_type in (" . $interest['survey_type'] . ")" ;
                    break ;
                    
                // 查找用户已参与的调查，取参与较多的调查类型对应的调查
                case '3' : 
                    $tbBasSurveyAction = M(TB_BAS_SURVEY_ACTION) -> getTableName() ;

                    $sql =  "select a.survey_type , count(1) ".
                            "from $tbBasSurveyInfo a , $tbBasSurveyAction b ".
                            "where a.survey_code = b.survey_code ".
                            "and a.user_code <> $user_code ".
                            "and b.user_code = $user_code ".
                            "group by a.survey_type order by count(1) desc limit 1" ;
                    $condition = "survey_type in (" . M() -> query($sql)[0]['survey_type'] . ")" ;
                    break ;
                    
                // 通过调查类型与用户属性关系表分析出的该用户属性对应的调查类型（待完善关系表后再开发）
                case '4' : 
                    $condition = "1 <> 1" ;
                    break ;

                // 从用户未参与的调查中随机抽取调查，按调查推荐优先级抽取调查
                case '5' : 
                    $condition = "1 = 1" ;
                    break ;

                // 从用户未参与的调查中随机抽取调查，按调查推荐优先级抽取调查
                default : 
                    $condition = "1 = 1" ;
                    break ;
            }

            // 推荐条件生成
            $recommend['user_code'] = $user_code ;
            $recommend['condition'] = $condition ;

            // $survey_code = recommendTo($recommend, $limit) ;
            // 已知用户推荐调查
            if($user_code){
                $user = M(TB_BAS_SURVEY_RECOMMEND_USER) -> where("user_code = '$user_code' and state_code in(1,2)") -> find() ;

                if($user){
                    // 先查找调查推荐表中的可推荐调查
                    return $user['survey_code'] ; 
                }else{
                    // 如果上面推荐表中找不到再根据入参条件查找调查信息表活动状态的调查
                    $tbBasSurveyInfo = M(TB_BAS_SURVEY_INFO) -> getTableName() ;

                    $sql =  "select survey_code from $tbBasSurveyInfo a ".
                            // "where survey_state = 3 and user_code <> $user_code ".  
                            "where survey_state = 3 ".  // 先把非自己创建条件去掉测试用
                            "and $condition and not exists ( ".
                            "   select survey_code from $tbBasSurveyRecommendUser b ".
                            "   where a.survey_code = b.survey_code and b.user_code = $user_code) ".
                            "order by rand() limit 1" ;
                    // $user = M() -> query($sql) ;

                    if($survey_code = M() -> query($sql)[0]['survey_code']){
                        return $survey_code ;
                    }
                }
            }

            if(!$survey_code){
                $recomm_grade ++ ;
                $survey_code = userRecommendSurvey($user_code, $recomm_grade, $limit) ;
            }
        }else{
            return 0 ;        
        }
    }

    return $survey_code ;
}

/*
 * @Name   : recommendTo
 * @Desc   : 随机生成推荐用户/调查（带废弃，功能分拆到独立的推荐函数中）
 * @Params : array    $recommend  推荐条件
 * @Params : number   $limit      生成用户数量
 * @Return : boolean  trun/false  更新成功与否标志
 */
function recommendTo($recommend, $limit){
    dump($recommend) ;
    dump($limit) ;
    $condition   = $recommend['condition'] ;
    $user_code   = $recommend['user_code'] ;
    $survey_code = $recommend['survey_code'] ;

    $tbBasSurveyRecommendUser = M(TB_BAS_SURVEY_RECOMMEND_USER) -> getTableName() ;

    // 已知调查推荐用户
    if($survey_code){
        $recommend_code  = $recommend['recommend_code'] ;
        $recommend_grade = $recommend['recommend_grade'] ;
        $table           = $recommend['table'] ;
        $state_code      = 1 ;
        $state_time      = date('Y-m-d H:i:s') ;

        $tbUser = M($table) -> getTableName() ;

        $sql =  "insert into $tbBasSurveyRecommendUser ".
                "select distinct $survey_code, user_code, $recommend_code, $recommend_grade, $state_code, '$state_time' ".
                "from $tbUser a ".
                "   where $condition ".
                "   and not exists ( ".
                "   select user_code from $tbBasSurveyRecommendUser b ".
                "   where a.user_code = b.user_code ".
                "   and b.survey_code = $survey_code) ".
                "order by rand() limit $limit" ;
        M() -> execute($sql) ;
        $user_cnt = M(TB_BAS_SURVEY_RECOMMEND_USER) -> where("survey_code = '$survey_code'") -> count() ;

        return $user_cnt ;
    }

    // 已知用户推荐调查
    if($user_code){
        $user = M(TB_BAS_SURVEY_RECOMMEND_USER) -> where("user_code = '$user_code' and state_code in(1,2)") -> find() ;

        if($user){    // 先查找调查推荐表中的可推荐调查
            return $user['survey_code'] ; 
        }else{    // 如果上面推荐表中找不到再根据入参条件查找调查信息表活动状态的调查
            $tbBasSurveyInfo = M(TB_BAS_SURVEY_INFO) -> getTableName() ;
            $sql =  "select survey_code ".
                    "from $tbBasSurveyInfo a ".
                    "where survey_state = 3 ".
                    "and $condition ".
                    "and not exists ( ".
                    "   select survey_code from $tbBasSurveyRecommendUser b ".
                    "   where a.survey_code = b.survey_code ".
                    "   and b.user_code = $user_code) ".
                    "order by rand() limit 1" ;
            $user = M() -> query($sql) ;

            return $user[0]['survey_code'] ;
        }
    }
}

?>