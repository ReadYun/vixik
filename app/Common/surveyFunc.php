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
    $surveyInfo['recomm_grade'] = $user['user_type'] ;                               // 推荐等级默认和用户等级相同
    $surveyInfo['create_time']  = $state_time = date('Y-m-d H:i:s') ;                // 获取创建时间和状态更新时间
    $surveyInfo['survey_state'] = 0 ;                                                // 初始调查状态为临时无效

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
function surveyInfoSelect($survey_code, $base){
    $tbBasUserInfo      = M(TB_BAS_USER_INFO)       -> getTableName() ;
    $tbBasSurveyInfo    = M(TB_BAS_SURVEY_INFO)     -> getTableName() ;
    $tbDetSurveyTypeSub = M(TB_DET_SURVEY_TYPE_SUB) -> getTableName() ;
    $tbDetSurveyTrade   = M(TB_DET_SURVEY_TRADE)    -> getTableName() ;

    // 先更新下调查状态
    surveyState($survey_code) ;

    if($base){
        $survey['info'] = M(TB_BAS_SURVEY_INFO) -> where("survey_code = $survey_code") -> find() ;
    }else{
        $sql = "select t0.*, t1.survey_type_name, t1.survey_type_sub_name, t2.survey_trade_name
                from ( 
                  select a.*, b.user_nick, b.user_photo,  date_relative_now(a.start_time) start_date
                  from $tbBasSurveyInfo a, $tbBasUserInfo b
                  where a.user_code = b.user_code and survey_code = $survey_code) t0
                left outer join $tbDetSurveyTypeSub t1 on t0.survey_type_sub = t1.survey_type_sub_code
                left outer join $tbDetSurveyTrade   t2 on t0.survey_trade    = t2.survey_trade_code " ;
        $survey['info'] = M() -> query($sql)[0] ;
    }

    if($survey['info']){
        // $survey['info']['survey_descs']  = str_replace("\n", "<br/>", $survey['info']['survey_desc']) ;                   // 调查说明输出前换行符转换
        $survey['url']['url_user']       = U('user/user/visit')       . '?code='  . $survey['info']['user_code'] ;        // 调查创建者访问地址
        $survey['url']['url_create']     = U('survey/survey/create')  . '?code='  . $survey['info']['survey_code'] ;      // 调查创建地址
        $survey['url']['url_visit']      = U('survey/survey/visit')   . '?code='  . $survey['info']['survey_code'] ;      // 调查访问地址
        $survey['url']['url_answer']     = U('survey/survey/answer')  . '?code='  . $survey['info']['survey_code'] ;      // 调查参与地址
        $survey['url']['url_analyse']    = U('survey/survey/analyse') . '?code='  . $survey['info']['survey_code'] ;      // 调查分析地址
        $survey['url']['url_type']       = U('survey/survey/type')    . '?type='  . $survey['info']['survey_type'] ;      // 调查归属大类地址
        $survey['url']['url_type_sub']   = U('survey/survey/type')    . '?type='  . $survey['info']['survey_type_sub'] ;  // 调查归属小类地址
        $survey['url']['url_trade']      = U('survey/survey/trade')   . '?trade=' . $survey['info']['survey_type'] ;      // 调查行业地址
        
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
 * @Name   : surveyState
 * @Desc   : 调查状态处理
 * @Param  : integer  $survey_code   调查编码
 * @Return : integer  $survey_state  调查最新状态
 */
function surveyState($survey_code){
    $survey               = M(TB_BAS_SURVEY_INFO) -> where("survey_code = '$survey_code'") -> find() ;
    $data['survey_state'] = $survey['survey_state'] ;

    if($survey['survey_state'] == 3){
        switch($survey['end_type']){
            // 按人数结束
            case 1 :
                // 统计如已参与调查人数大于（或等于）设定人数，活动结束
                if(M(TB_BAS_SURVEY_ACTION) -> where("survey_code = '$survey_code'") -> count() >= $survey['end_value']){
                    $data['survey_state'] = 4 ;
                    $data['state_time']   = $data['end_time'] = date('Y-m-d H:i:s') ;

                    M(TB_BAS_SURVEY_INFO) -> where("survey_code = '$survey_code'") -> setField($data) ;
                }
                break ;

            case 2 :  // 按日期结束
                $now        = date('Y-m-d H:i:s') ;
                $length_day = $survey['end_value'] ;
                $start_time = $survey['start_time'] ;
                $end_time   = date('Y-m-d H:i:s', strtotime("$start_time + $length_day day")) ;

                // 计算如已当前时间超出（或等于）设定的结束时间，活动结束
                if($now >= $end_time){
                    $data['survey_state'] = 4 ;
                    $data['state_time']   = $data['end_time'] = date('Y-m-d H:i:s') ;

                    M(TB_BAS_SURVEY_INFO) -> where("survey_code = '$survey_code'") -> setField($data) ;
                }
                break ;
        }
    }

    return $data['survey_state'] ;
}

/*
 * @Name   : surveyDelete
 * @Desc   : 调查信息删除
 * @Param  : integer  $survey_code  调查编码
 * @Param  : string   $type         调查删除方式（undo/clean）
 * @Return : NULL
 */
function surveyDelete($survey_code, $type){
    switch($type){
        case 'undo' :  // 部分回退：保留调查基本信息，其他相关信息全部删除
            M(TB_BAS_TAG_INFO)        -> where("survey_code = $survey_code") -> delete() ;
            M(TB_BAS_QUESTION_OPTION) -> where("survey_code = $survey_code") -> delete() ;
            M(TB_BAS_QUESTION_INFO)   -> where("survey_code = $survey_code") -> delete() ;
            break ;

        case 'clean' :  // 全部清除：删除所有和目标调查相关数据
            M(TB_BAS_TAG_INFO)        -> where("survey_code = $survey_code") -> delete() ;
            M(TB_BAS_QUESTION_OPTION) -> where("survey_code = $survey_code") -> delete() ;
            M(TB_BAS_QUESTION_INFO)   -> where("survey_code = $survey_code") -> delete() ;
            M(TB_BAS_SURVEY_ACTION)   -> where("survey_code = $survey_code") -> delete() ;
            M(TB_BAS_QUESTION_ACTION) -> where("survey_code = $survey_code") -> delete() ;
            M(TB_BAS_SURVEY_INFO)     -> where("survey_code = $survey_code") -> delete() ;
            break ;
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
    $stats['question_count'] = $stats['qt_cnt_xz'] = $stats['qt_cnt_zg'] = $stats['qt_cnt_pf'] = 0 ;

    $tbBasQuestionInfo = M(TB_BAS_QUESTION_INFO) -> getTableName() ;

    $sql = "select survey_code, question_class, count(question_code) count from $tbBasQuestionInfo
            where survey_code = $survey_code group by survey_code, question_class" ;
    $question = M() -> query($sql) ;

    for($i = 0; $i < count($question); $i++){
        switch(intval($question[$i]['question_class'])){
            case 1 :
                $stats['qt_cnt_xz'] += $question[$i]['count'] ;
                break ;

            case 2 :
                $stats['qt_cnt_zg'] += $question[$i]['count'] ;
                break ;

            case 3 :
                $stats['qt_cnt_pf'] += $question[$i]['count'] ;
                break ;
        }

        $stats['question_count'] += $question[$i]['count'] ;
    }

    return $stats ;
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
// function surveyQuestionDelete($survey_code){
//     // $tbBasQuestionInfo   = M(TB_BAS_QUESTION_INFO)   -> getTableName() ;
//     // $tbBasQuestionOption = M(TB_BAS_QUESTION_OPTION) -> getTableName() ;

//     $cond = "survey_code = $survey_code" ;

//     // // 删除题目选项表对应调查编码相关数据

//     //              ;
//     // // $sql =  "delete from $tbBasQuestionOption where question_code in( ".
//     // //         "    select question_code from $tbBasQuestionInfo where survey_code = $survey_code)" ;
//     // // $res1 = M() -> execute($sql) ;

//     // // // 删除题目详情表对应调查编码相关数据
//     // // $sql = "delete from $tbBasQuestionInfo where survey_code = $survey_code" ;
//     // // $res2 = M() -> execute($sql) ;
 
//     // 如果删除题目成功更新调查统计信息
//     if(M(TB_BAS_QUESTION_OPTION) -> where($cond) -> delete() && M(TB_BAS_QUESTION_INFO) -> where($cond) -> delete()){
//         if(surveyStatistUpdate($survey_code)){
//             return true ;
//         }else{
//             return false ;
//         }
//     }else{
//         return false ;
//     }
// }

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
    $data['create_coins'] = $action_1003['update_value'] + $action_1004['update_value'] * $data['question_count'] + $action_1005['update_value'] ;
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

                updateTable(TB_BAS_QUESTION_INFO, array('answer_num'=>1), array('question_code'=>$qt_action['question_code']), 'add') ;
            }
        }

        return true ;
    }else{
        return false ;
    }
}

/*
 * @Name   : surveyListSelect
 * @Desc   : 调查清单查询
 * @Param  : string  $cond    查询条件（可选）
 * @Param  : string  $filter  条件筛选（可选）
 * @Param  : string  $order   结果排序（可选）
 * @Param  : number  $page    数据页码（可选）
 * @Param  : number  $pages   数据全量页码（可选）
 * @Param  : number  $pnum    数据量（可选）
 * @Return : json    $data    查询到的数据
 */
function surveyListSelect($param){
    $order  = $param['order'] ;   // 取参数：查询类型
    $page   = $param['page'] ;    // 取参数：查询页码
    $pages  = $param['pages'] ;   // 取参数：查询页码
    $pnum   = $param['pnum'] ;    // 取参数：数据量
    $param['cond'] ? $cond = $param['cond'] : $cond = '1 = 1' ;    // 取参数：查询条件

    // 排序方式
    $order  ? $order  = " order by $order " : $order  = " order by start_time desc " ;

    // 默认数据量设置
    $pnum ? $pnum : $pnum = 20 ;

    // 计算要查询的数据量
    if($page){
        // 分页查询
        $data['page'] = $page ;
        $limit        = "limit " . $page * $pnum . ", $pnum" ;
        $next         = "limit " . ($page + 1) * $pnum . ", 1" ;
    }elseif($pages){
        // 全页查询
        $data['page'] = $pages ;
        $limit        = "limit " . ($pages + 1) * $pnum ;
        $next         = "limit " . ($pages + 1) * $pnum . ", 1" ;
    }else{
        // 默认查询
        $data['page'] = 0 ;
        $limit        = "limit $pnum" ;
        $next         = "limit $pnum, 1" ;
    }

    $url_us_visit       = U('user/visit')          ;
    $url_sv_visit       = U('survey/survey/visit') ;
    $url_sv_type        = U('survey/survey/type')  ;
    $url_sv_trade       = U('survey/survey/trade') ;

    $tbBasSurveyInfo    = M(TB_BAS_SURVEY_INFO)        -> getTableName() ;
    $tbBasUserInfo      = M(TB_BAS_USER_INFO)          -> getTableName() ;
    $tbDetSurveyType    = M(TB_DET_SURVEY_TYPE)        -> getTableName() ;
    $tbDetSurveyTypeSub = M(TB_DET_SURVEY_TYPE_SUB)    -> getTableName() ;
    $tbDetSurveyTrade   = M(TB_DET_SURVEY_TRADE)       -> getTableName() ;
    $tbDetSurveyState   = M(TB_DET_SURVEY_STATE)       -> getTableName() ;

    $sql = array(
        'list' =>
           "select t1.* , t2.survey_trade_name survey_trade from (
            select a.survey_name, a.question_num, b.state_desc_sketch survey_state, date_relative_now(a.start_time) start_date, 
                ifnull(a.answer_num, 0) answer_num, d.user_code, d.user_photo, d.user_nick, 
                ifnull(replace(replace(replace(a.survey_desc, '&nbsp;', ' '), '<br>' ,' '), '  ', ' '), '无调查说明')  survey_desc,
                c.survey_type_name survey_type, c.survey_type_sub_name survey_type_sub, a.survey_trade, 
                concat('$url_us_visit?code=',  d.user_code)       url_us_visit,
                concat('$url_sv_visit?code=',  a.survey_code)     url_sv_visit,
                concat('$url_sv_type?type=',   a.survey_type)     url_sv_type,
                concat('$url_sv_type?type=',   a.survey_type_sub) url_sv_type_sub,
                concat('$url_sv_trade?trade=', a.survey_trade)     url_sv_trade
            from $tbBasSurveyInfo a, $tbDetSurveyState b, $tbDetSurveyTypeSub c, $tbBasUserInfo d
            where a.survey_state = b.survey_state_code and a.survey_type_sub = c.survey_type_sub_code
            and a.user_code = d.user_code and $cond $order $limit) t1
            left outer join  $tbDetSurveyTrade t2
            on t1.survey_trade = t2.survey_trade_code",
        'list1' =>
           "select a.survey_name, a.question_num, b.state_desc_sketch survey_state, date_relative_now(a.start_time) start_date, 
                ifnull(a.answer_num, 0) answer_num, e.user_code, e.user_photo, e.user_nick, 
                ifnull(replace(replace(replace(a.survey_desc, '&nbsp;', ' '), '<br>' ,' '), '  ', ' '), '无调查说明')  survey_desc,
                c.survey_type_name survey_type, c.survey_type_sub_name survey_type_sub, d.survey_trade_name survey_trade, 
                concat('$url_us_visit?code=',  e.user_code)       url_us_visit,
                concat('$url_sv_visit?code=',  a.survey_code)     url_sv_visit,
                concat('$url_sv_type?type=',   a.survey_type)     url_sv_type,
                concat('$url_sv_type?type=',   a.survey_type_sub) url_sv_type_sub,
                concat('$url_sv_trade?trade=', a.survey_code)     url_sv_trade
            from $tbBasSurveyInfo a, $tbDetSurveyState b, $tbDetSurveyTypeSub c, $tbDetSurveyTrade d, $tbBasUserInfo e
            where a.survey_state = b.survey_state_code and a.survey_type_sub = c.survey_type_sub_code
            and a.survey_trade = d.survey_trade_code and a.user_code = e.user_code and $cond $order $limit",
        'next' =>
           "select a.survey_name
            from $tbBasSurveyInfo a, $tbDetSurveyState b, $tbDetSurveyTypeSub c, $tbDetSurveyTrade d, $tbBasUserInfo e
            where a.survey_state = b.survey_state_code and a.survey_type_sub = c.survey_type_sub_code
            and a.survey_trade = d.survey_trade_code and a.user_code = e.user_code and $cond $order $next",
    ) ;

    $data['list'] = M() -> query($sql['list']) ;
    if(!$data['list'] && !$data['page']){
        return false ;
    }else{
        $data['next'] = M() -> query($sql['next']) ;

        return $data ;
    }
}

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