<?php

/**
 * @Desc       : surveyFunc.php
 * @Type       : Function
 * @Desc       : 调查行为相关函数库
 * @Createtime : 2012-8-14 18:14:09
 * @Author     : ReadYun
 * @Copyright  : VixiK
 * @Version    : 1.0.00
 */

header("Content-type:text/html;charset=utf-8");

/*
 * @Name   : surveyCreate
 * @Desc   : 创建调查
 * @Param  : integer  $user_code    用户编码
 * @Return : integer  $survey_code  调查编码
 */
function surveyCreate($user_code){
    $user = M(TB_BAS_USER_INFO) -> where("user_code = '$user_code'") -> find() ;

    $surveyInfo['survey_code']  = M(TB_BAS_SURVEY_INFO) -> max('survey_code') + 1 ;  // 新建调查编码
    $surveyInfo['user_code']    = $user['user_code'] ;                               // 获取用户编码
    $surveyInfo['user_nick']    = $user['user_nick'] ;                               // 获取用户名称
    $surveyInfo['create_time']  = $state_time = date('Y-m-d H:i:s') ;                // 获取创建时间和状态更新时间
    $surveyInfo['survey_state'] = 0 ;                                                // 初始调查状态为临时无效
    $surveyInfo['recomm_grade'] = $user['user_type'] ;                               // 推荐等级默认和用户等级相同

    $res = insertTable(TB_BAS_SURVEY_INFO, $surveyInfo) ;  // 调用快速插表函数

    if($res){
        return $surveyInfo['survey_code'] ;
    }else{
        return false ;
    }
}

/*
 * @Name   : surveyBaseInfoFind（合并到surveyInfoSelect）
 * @Desc   : 调查信息查询
 * @Param  : integer  $survey_code  调查编码
 * @Return : array    $data         调查信息汇总数据（基本信息/题目统计/答题统计/关注统计）
 */
function surveyInfoFind($survey_code){
$survey = M(TB_BAS_SURVEY_INFO) -> where("survey_code = '$survey_code'") -> find() ;

    if($survey){
        $survey['answer_count'] = M(TB_BAS_SURVEY_ACTION)      -> where("survey_code = '$survey_code'") -> count() ;  // 参与统计
        $survey['follow_count'] = M(TB_BAS_USER_FOLLOW_SURVEY) -> where("follow_code = '$survey_code'") -> count() ;  // 收藏统计
        $survey['share_count']  = M(TB_BAS_USER_SHARE_SURVEY)  -> where("share_code = '$survey_code'")  -> count() ;  // 分享统计

        return $survey ;
    }else{
        return false ;
    }
}

/*
 * @Name   : surveyInfoSelect
 * @Desc   : 调查信息查询
 * @Param  : integer  $survey_code  调查编码
 * @Return : array    $survey       调查信息汇总数据（基本信息/题目统计/答题统计）
 */
function surveyInfoSelect($survey_code, $url){
    $survey['info'] = M(TB_BAS_SURVEY_INFO) -> where("survey_code = '$survey_code'") -> find() ;

    if($survey['info']){
        // $survey['info']['survey_desc'] = str_replace("\n", "<br/>", $survey['info']['survey_desc']) ;           // 调查说明输出前换行符转换
        $survey['url']['url_user']    = U('user/user/visit')       . '?code=' . $survey['info']['user_code'] ;    // 调查创建者访问地址
        $survey['url']['url_create']  = U('survey/survey/create')  . '?code=' . $survey['info']['survey_code'] ;  // 调查参与地址
        $survey['url']['url_visit']   = U('survey/survey/visit')   . '?code=' . $survey['info']['survey_code'] ;  // 调查参与地址
        $survey['url']['url_answer']  = U('survey/survey/answer')  . '?code=' . $survey['info']['survey_code'] ;  // 调查参与地址
        $survey['url']['url_analyse'] = U('survey/survey/analyse') . '?code=' . $survey['info']['survey_code'] ;  // 调查分析地址

        $survey['stats']['answer_count'] = M(TB_BAS_SURVEY_ACTION)      -> where("survey_code = '$survey_code'") -> count() ;  // 参与统计
        $survey['stats']['follow_count'] = M(TB_BAS_USER_FOLLOW_SURVEY) -> where("follow_code = '$survey_code'") -> count() ;  // 收藏统计
        $survey['stats']['share_count']  = M(TB_BAS_USER_SHARE_SURVEY)  -> where("share_code = '$survey_code'")  -> count() ;  // 分享统计

        $option   = optionInfoSelect($survey_code) ;
        $question = M(TB_BAS_QUESTION_INFO) -> where("survey_code = '$survey_code'") -> order('question_code') -> select() ; 

        // 自定义推荐规则查询
        if($survey['info']['recomm_type'] == 2){
            $survey['recommend'] = M(TB_BAS_SURVEY_RECOMMEND_RULE) -> where("survey_code = '$survey_code'") -> select() ;
        }

        for($q = 0; $q < count($question); $q++){
            $survey['question'][$q] = $question[$q] ;

            if($question[$q]['question_type'] != 'textarea'){
                for($o = 0, $i = 0; $o < count($option); $o++){
                    if($question[$q]['question_code'] == $option[$o]['question_code']){
                        $survey['question'][$q]['option'][$i] = 
                            arrayExtract($option[$o], array('option_code','option_name','option_seq','option_type')) ;
                        $i++ ;
                    }
                }
            }
        }

        return $survey ;
    }else{
        return false ;
    }
}

/*
 * @Name   : surveyInfoAlter
 * @Desc   : 调查信息修改
 * @Param  : integer  $survey_code  调查编码
 * @Param  : array    $data         调查信息更新数据
 * @Return : integer  $survey_code  调查编码
 */
function surveyInfoAlter($survey_code, $data){
    $condition['survey_code'] = $survey_code ;

    // dump('------------------------------------------') ;
    // dump($survey_code) ;
    // dump($data) ;

    // 更新调查基本信息表
    if(updateTable(TB_BAS_SURVEY_INFO, $data, $condition, 'cover')){
        return $survey_code ;
    }else{
        return false ;
    }
}

/*
 * @Name   : surveyQuestionSum
 * @Desc   : 调查题目信息汇总
 * @Param  : integer  $survey_code  调查编码
 * @Return : array    $qt_statist   调查题目汇总信息
 */
function surveyQuestionSum($survey_code){
    $qt_statist['question_num'] = $qt_statist['radio_num'] = $qt_statist['checkbox_num'] = $qt_statist['textarea_num'] = 0 ;

    $tbBasQuestionInfo = M(TB_BAS_QUESTION_INFO) -> getTableName() ;

    $sql =  "select survey_code, question_type, count(question_code) count ".
            "from $tbBasQuestionInfo ".
            "where survey_code = $survey_code ".
            "group by survey_code, question_type" ;
    $question = M() -> query($sql) ;

    if($question){
        for($i = 0; $i < count($question); $i++){
            $type_num = $question[$i]['question_type'] . '_num' ;
            $qt_statist["$type_num"] = $question[$i]['count'] ;
        } ;

        $qt_statist['question_num'] = $qt_statist['radio_num'] + $qt_statist['checkbox_num'] + $qt_statist['textarea_num'] ;        
    } ;

    return $qt_statist ;
}

/*
 * @Name   : surveyQuestionAlter
 * @Desc   : 调查题目信息修改
 * @Param  : integer  $user_code    用户编码
 * @Param  : integer  $survey_code  调查编码
 * @Param  : array    $question     调查题目（包含选项）信息
 * @Return : bool     true/false    修改成功标志位
 */
function surveyQuestionAlter($user_code, $survey_code, $question){
    $state_time   = date('Y-m-d H:i:s') ;    // 状态更新时间
    $question_num = count($question) ;       // 题目数量

    for($i_question = 0; $i_question < $question_num; $i_question++){
        if($question[$i_question]['option']){
            $qt_info['survey_code']     = $survey_code ;
            $qt_info['question_code']   = M(TB_BAS_QUESTION_INFO) -> max('question_code') + 1 ;    // 题目编码
            $qt_info['question_seq']    = $question[$i_question]['question_seq'] ;      // 题目序号
            $qt_info['question_name']   = $question[$i_question]['question_name'] ;     // 题目题目
            $qt_info['question_type']   = $question[$i_question]['question_type'] ;     // 题目类型
            $qt_info['question_option'] = $question[$i_question]['question_option'] ;   // 题目选项
            $qt_info['custom_option']   = $question[$i_question]['custom_option'] ;     // 自定义选项标志位
            $qt_info['create_time']     = date('Y-m-d H:i:s') ;                         // 创建时间
            // $qt_info['is_bank']         = 0 ;    // 暂时默认不属于题库等加入题库功能再改造此接口

            // 插入题目信息表
            if(insertTable(TB_BAS_QUESTION_INFO, $qt_info)){
                for($i_option = 0; $i_option < count($question[$i_question]['option']); $i_option ++){
                    $qt_opt['survey_code']   = $qt_info['survey_code'] ;                                     // 调查编码
                    $qt_opt['question_code'] = $qt_info['question_code'] ;                                   // 题目编码
                    $qt_opt['question_type'] = $qt_info['question_type'] ;                                   // 题目类型
                    $qt_opt['option_name']   = $question[$i_question]['option'][$i_option]['option_name'] ;  // 选项名称
                    $qt_opt['option_seq']    = $question[$i_question]['option'][$i_option]['option_seq'] ;   // 选项排序
                    $qt_opt['option_type']   = 1 ;                                                           // 选项类型（默认为1:普通选项）
                    $qt_opt['option_state']  = 1 ;                                                           // 选项状态（默认为1:有效）
                    $qt_opt['create_user']   = $user_code ;                                                  // 选项创建用户
                    $qt_opt['create_time']   = date('Y-m-d H:i:s') ;                                         // 选项创建时间

                    // 选项编码：（题目编码.选项类型.选项序号）
                    $qt_opt['option_code']   = strval($qt_opt['question_code']).strval($qt_opt['option_type']).strval($qt_opt['option_seq']) ;

                    // 插入题目选项内容
                    $res = insertTable(TB_BAS_QUESTION_OPTION, $qt_opt) ;
                } ;
            }else{
                return false ;
            }
        }
    } ;

    // 如更新调查题目信息成功则更新调查统计信息
    if($res){    
        if(surveyStatistUpdate($survey_code)){
            return true ;
        }
    }else{
        return false ;
    }
}

/*
 * @Name   : surveyQuestionDelete
 * @Desc   : 调查题目信息删除
 * @Param  : integer  $survey_code  调查编码
 * @Return : bool     true/false    删除成功标志位
 */
function surveyQuestionDelete($survey_code){
    $tbBasQuestionInfo   = M(TB_BAS_QUESTION_INFO)   -> getTableName() ;
    $tbBasQuestionOption = M(TB_BAS_QUESTION_OPTION) -> getTableName() ;

    // 删除题目选项表对应调查编码相关数据
    $sql =  "delete from $tbBasQuestionOption where question_code in( ".
            "    select question_code from $tbBasQuestionInfo where survey_code = $survey_code)" ;
    $res1 = M() -> execute($sql) ;

    // 删除题目详情表对应调查编码相关数据
    $sql = "delete from $tbBasQuestionInfo where survey_code = $survey_code" ;
    $res2 = M() -> execute($sql) ;
 
    // 如果删除题目成功更新调查统计信息
    if($res1 === false || $res2 === false){
        return false ;
    }else{
        if(surveyStatistUpdate($survey_code)){
            return true ;
        }else{
            return false ;
        }
    }
}

/*
 * @Name   : surveyStatistUpdate
 * @Desc   : 调查统计信息更新
 * @Param  : integer  $survey_code  调查编码
 * @Return : bool     true/false    信息更新结果标志
 */
function surveyStatistUpdate($survey_code){
    $data   = surveyQuestionSum($survey_code) ;
    $survey = M(TB_BAS_SURVEY_INFO) -> where("survey_code = '$survey_code'") -> find() ;

    // 取创建调查相关行为需要的金币值
    $action_1003 =  M(TB_DET_USER_ACTION_CONFIG) -> where("action_code=1003 and update_type='user_coins'") -> find() ;
    $action_1004 =  M(TB_DET_USER_ACTION_CONFIG) -> where("action_code=1004 and update_type='user_coins'") -> find() ;
    if($survey['recomm_type'] > 0){
        $action_1005 = M(TB_DET_USER_ACTION_CONFIG) -> where("action_code=1005 and update_type='user_coins'") -> find() ;
    }else{
        $action_1005 = 0 ;
    }

    // 创建调查所需金币数
    $data['create_coins'] = $action_1003['update_value'] + $action_1004['update_value'] * $data['question_num'] + $action_1005['update_value'] ;
    $data['answer_coins'] = $data['create_coins'] / 10 ;

    // 参与调查可获得金币数
    $condition['survey_code'] = $survey_code ;

    if(updateTable(TB_BAS_SURVEY_INFO, $data, $condition, 'cover')){
        return true ;
    }else{
        return false ;
    }
}

/*
 * @Name   : questionInfoSelect
 * @Desc   : 调查题目信息查询
 * @Param  : integer  $survey_code  调查编码
 * @Return : array    $question     调查题目
 */
function questionInfoSelect($survey_code){
    $tbBasSurveyInfo   = M(TB_BAS_SURVEY_INFO)   -> getTableName() ;
    $tbBasQuestionInfo = M(TB_BAS_QUESTION_INFO) -> getTableName() ;

    $sql =  "select b.question_seq, b.question_code, b.question_name, b.question_type ".
            "from $tbBasSurveyInfo a , $tbBasQuestionInfo b ".
            "where a.survey_code = b.survey_code and a.survey_code = $survey_code ".
            "order by b.question_seq" ;
    $question = M() -> query($sql) ;

    if($question){
        return $question ;
    }else{
        return false ;
    }
}

/*
 * @Name   : optionInfoSelect
 * @Desc   : 题目选项信息查询
 * @Param  : integer  $survey_code  调查编码
 * @Return : array    $option       调查选项信息
 */
function optionInfoSelect($survey_code){
    $tbBasSurveyInfo     = M(TB_BAS_SURVEY_INFO)     -> getTableName() ;
    $tbBasQuestionInfo   = M(TB_BAS_QUESTION_INFO)   -> getTableName() ;
    $tbBasQuestionOption = M(TB_BAS_QUESTION_OPTION) -> getTableName() ;

    $sql =  "select a.survey_name,b.question_code,b.question_name,b.question_type,c.option_name,c.option_code,c.option_seq,c.option_type ".
            "from $tbBasSurveyInfo a, $tbBasQuestionInfo b, $tbBasQuestionOption c ".
            "where a.survey_code = b.survey_code and b.question_code = c.question_code and a.survey_code = $survey_code ".
            "order by b.question_seq, c.option_type, c.option_code" ;
    $option = M() -> query($sql) ;

    if($option){
        return $option ;
    }else{
        return false ;
    }
}

/*
 * @Name   : surveyActionAdd
 * @Desc   : 用户参与调查信息新增
 * @Param  : array  $survey     调查基本信息
 * @Param  : array  $question   调查题目信息
 * @Return : bool   true/false  新增成功标志位
 */
function surveyActionAdd($survey, $question){
    if($survey['user_code'] && $survey['survey_code']){
        $qt_action['user_code']   = $user_code   = $survey['user_code'] ;
        $qt_action['survey_code'] = $survey_code = $survey['survey_code'] ;

        // 先删除该用户之前参与过此调查的信息
        // 目前只有一次性调查形式，可以直接做删除，以后如果有周期性调查，此处的处理方式要改
        M(TB_BAS_SURVEY_RECOMMEND_RULE) -> where("survey_code = '$survey_code' and user_code = '$user_code'") -> delete() ;
        M(TB_BAS_SURVEY_ACTION)         -> where("survey_code = '$survey_code' and user_code = '$user_code'") -> delete() ;
        M(TB_BAS_QUESTION_ACTION)       -> where("survey_code = '$survey_code' and user_code = '$user_code'") -> delete() ;

        // 调查参与详情
        if(insertTable(TB_BAS_SURVEY_ACTION, $survey)){
            // 更新调查信息参与次数+1
            updateTable(TB_BAS_SURVEY_INFO, array('answer_num'=>1), array('survey_code'=>$survey['survey_code']), 'add') ;
        }else{
            return false ;
        }

        // 调查答题详情
        for($i_question = 0; $i_question < count($question); $i_question++){
            if($question[$i_question]['option']){
                $qt_action['question_code'] = $question[$i_question]['question_code'] ;
                $qt_action['question_type'] = $question[$i_question]['question_type'] ;
                $qt_action['question_seq']  = $question[$i_question]['question_seq'] ;

                for($i_option = 0; $i_option < count($question[$i_question]['option']); $i_option++){
                    $option = $qt_action['option_code'] = $question[$i_question]['option'][$i_option] ;

                    // 不同的题目类型不同的处理方式
                    if($qt_action['question_type'] === 'textarea'){
                        // 主观题参与去除选项个性信息，只保留option_name即填写的内容
                        unset($qt_action['option_code']) ;
                        unset($qt_action['option_type']) ;
                        unset($qt_action['option_seq']) ;
                        $qt_action['option_name'] = $option ;  // 选项名称
                    }else{
                        // 非主观题（单选、多选）正常处理
                        // 取选项其他相关数据
                        $option = M(TB_BAS_QUESTION_OPTION) -> where("option_code = '$option'") -> find() ;
                        $qt_action['option_name'] = $option['option_name'] ;  // 选项名称
                        $qt_action['option_seq']  = $option['option_seq'] ;   // 选项序号
                        $qt_action['option_type'] = $option['option_type'] ;  // 选项类型
                    }

                    // 插入用户答题详情表
                    if(!$qt_action['option_name'] || !insertTable(TB_BAS_QUESTION_ACTION, $qt_action)){
                        return false ;
                    }
                }
            }
        }

        return true ;
    }else{
        return false ;
    }
}

// /*
//  * @Name   : questionActionAdd
//  * @Desc   : 用户答题详情信息新增（废弃：功能合并到surveyActionAdd）
//  * @Param  : array  $data       用户答题信息
//  * @Return : bool   true/false  新增成功标志位
//  */
// function questionActionAdd($data){
//     $qt_action['user_code']   = 999 ; // cookie('user_code') ;
//     $qt_action['survey_code'] = 999 ; // cookie('survey_code') ;

//     for($i_question = 0; $i_question < count($data); $i_question++){
//         $qt_action['question_code'] = $data[$i_question]['question_code'] ;
//         $qt_action['question_type'] = $data[$i_question]['question_type'] ;
//         $qt_action['question_seq']  = $data[$i_question]['question_seq'] ;

//         for($i_option = 0; $i_option < count($data[$i_question]['option$']); $i_option++){
//             $qt_action['option_name'] = $data[$i_question]['option$'][$i_option] ;

//             if($qt_action['option_name'] != null){
//                 $res = insertTable(TB_BAS_QUESTION_ACTION, $qt_action) ;  // 插入用户答题详情表                
//             }
//         }
//     }

//     if($res){
//         return true ;
//     }else{
//         return false ;
//     }
// }

/*
 * @Name   : recommendCreate
 * @Desc   : 调查推荐规则生成
 * @Param  : integer  $survey_code       调查编码
 * @Param  : array    $recommend         推荐规则
 * @Return : integer  $recommend_code    规则编码
 */
function recommendCreate1($survey_code, $rule, $number){
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

        return $recommend['recommend_code'] ;
    }else{
        return false ;
    }
}

/*
 * @Name   : surveyRecommendUser
 * @Desc   : 向调查推荐用户
 * @Param  : integer  $survey_code   调查编码
 * @Param  : integer  $recomm_grade  推荐优先级
 * @Param  : integer  $limIt         推荐用户数
 * @Return : integer  $user_num      生成用户数
 */
function surveyRecommendUser1($survey_code, $recomm_grade, $limit){
    // 取调查对应的推荐级别
    $recomm_grade = M(TB_BAS_SURVEY_RECOMMEND) -> where("survey_code = '$survey_code'") -> getField('recomm_grade') ;

    // 清除已有目标调查对应的用户清单
    M(TB_BAS_SURVEY_RECOMMEND_USER) -> where("survey_code = '$survey_code'") -> delete() ;

    while($recomm_grade <= 5){
        // 不同推荐级别执行不同操作
        switch($recomm_grade){
            // 用户自定义推荐
            case '1' : 
                // 生成满足规则的用户插入推荐用户清单表
                $recommend_code = $recomm_rule[0]['recommend_code'] ;
                $condition      = $recomm_rule[0]['condition_sqlstr'] ;

                if($recomm_rule){
                    for($i = 1; $i < count($recomm_rule); $i++){
                        $condition = $condition . ' and ' . $recomm_rule[$i]['condition_sqlstr'] ;
                    }
                }
                $table = TB_BAS_USER_INFO ;
                break ;
            
            // 查找用户已经设置过的兴趣调查类型是同类型的用户进行推荐
            case '2' : 
                $condition = "survey_type like '%". $survey_type . "%'" ;
                $table     = TB_BAS_USER_INTEREST ;
                break ;
                
            // 查找参与过同类型调查活动的用户进行推荐
            case '3' : 
                $tbBasSurveyInfo = M(TB_BAS_SURVEY_INFO) -> getTableName() ;

                $condition = "exists (select survey_code from $tbBasSurveyInfo c where a.survey_code=c.survey_code and c.survey_type = $survey_type)" ;
                $table = TB_BAS_SURVEY_ACTION ;
                break ;
                
            // 通过调查类型与用户属性关系表分析出调查类型对应的目标用户属性（待完善关系表后再开发）
            case '4' : 
                $condition = "1 <> 1" ;
                $table = TB_BAS_USER_INTEREST ;
                break ;

            // 从未推荐过的有效用户中随机选取剩余数量用户
            case '5' : 
                $condition = "1 = 1" ;
                $table = TB_BAS_USER_INFO ;
                break ;
        }

        // 推荐条件生成
        $recommend['survey_code']     = $survey_code ;
        $recommend['recommend_grade'] = $recomm_grade ;
        $recommend['condition']       = $condition ;
        $recommend['table']           = $table ;

        // 推荐用户清单生成





        $user_cnt = recommendTo($recommend, $limit) ;  // 传入推荐条件生成推荐用户
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
 * @Name   : customOptionManager
 * @Desc   : 自定义选项管理（到期判定/下线处理）
 * @Param  : number  $survey_code  调查编码
 * @Param  : number  $day          自定义选项临时有效天数
 * @Return : bool    true/false    处理成功或失败标志
 */
function customOptionManager($survey_code, $day){
    import('ORG.Util.Date');    // 导入日期类

    $now                 = new Date() ;
    $tbBasQuestionOption = M(TB_BAS_QUESTION_OPTION) -> getTableName() ;
    $tbBasQuestionAction = M(TB_BAS_QUESTION_ACTION) -> getTableName() ;

    // 取出目标调查中需要到期判定的临时自定义选项信息
    $sql = "select a.* from $tbBasQuestionOption a ".
           "where option_state = 2 and create_time <= date_add(create_time, interval $day day)" ;
    $option = M() -> query($sql) ;

    // 如果存在自定义选项，遍历判断选项
    if($option){
        for($i = 0; $i < count($option); $i++){
            // 统计目标选项的选择数量
            $sql = "select count(1) count from $tbBasQuestionAction ".
                   "where survey_code = $survey_code ".
                   "and question_code = ".$option[$i]['question_code']." ".
                   "and option_name = '".$option[$i]['option_name']."' ".
                   "limit 1" ;
            $cnt_custom = M() -> query($sql) ;

            // 计算出当前题目所有有效选项的最小选择数量
            $sql = "select b.option_name, count(1) count from $tbBasQuestionAction a, $tbBasQuestionOption b ".
                   "where a.survey_code = b.survey_code and a.question_code = b.question_code and a.option_name = b.option_name ".
                   "and b.option_state = 1 and b.survey_code = $survey_code ".
                   "and b.question_code = ".$option[$i]['question_code']." ".
                   "group by option_name order by count limit 1" ;
            $cnt_option = M() -> query($sql) ;

            // 自定义选项判定处理（转正/下线）
            $data = $option[$i] ;
            if($cnt_option[0]['count'] > 0){
                if($cnt_custom[0]['count'] = 1 || $cnt_custom[0]['count'] < $cnt_option[0]['count']){
                    // 如果自定义选项数量小于当前题目有效选项最小选择数量，此自定义选项下线
                    $data['option_state'] = $data['option_seq'] = 0 ;
                }else{
                    // 如果自定义选项数量大于当前题目有效选项最小选择数量，此自定义选项转正
                    $data['option_state'] = 1 ;
                }

                // 对目标自定义选项的状态处理后更新到数据库中
                M(TB_BAS_QUESTION_OPTION) -> where($option[$i]) -> save($data) ;
            }else{
                if($cnt_custom[0]['count'] = 1){
                    // 如果自定义选项数量小于当前题目有效选项最小选择数量，此自定义选项下线
                    $data['option_state'] = $data['option_seq'] = 0 ;
                }else{
                    // 如果自定义选项数量大于当前题目有效选项最小选择数量，此自定义选项转正
                    $data['option_state'] = 1 ;
                }

                // 对目标自定义选项的状态处理后更新到数据库中
                M(TB_BAS_QUESTION_OPTION) -> where($option[$i]) -> save($data) ;                   
            }
        }
    }
}

?>