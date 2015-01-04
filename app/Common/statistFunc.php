<?php

/**
 * Name        : surveyAnalyse.php
 * Type        : Function
 * Description : 问卷统计相关函数库
 *
 * Create-time : 2012-8-14 17:52:24
 * Author      : ReadYun
 * Copyright   : VixiK
 * Version     : 1.0.00
 */

header("Content-type:text/html;charset=utf-8");

/*
 * @Name   : surveyTypeStats
 * @Desc   : 调查类型统计
 * @Return : array   $data  统计数据
 */
function surveyTypeStats(){
    $sql = "select x.survey_type_code, x.survey_type_desc, x.survey_type_sub_code, x.survey_type_sub_desc,
            case when sum(cnt) is null then 0 else sum(cnt) end cnt
            from (
                select b.*, a.survey_type_desc from tb_det_survey_type a, tb_det_survey_type_sub b
                where a.survey_type_code = b.survey_type_code) x
            left outer join (
                select survey_type, survey_type_sub, count(1) cnt
                from tb_bas_survey_info where survey_state >= 2
                group by survey_type, survey_type_sub) y
            on x.survey_type_sub_code = y.survey_type_sub
            group by x.survey_type_desc, x.survey_type_sub_desc " ;

    return M() -> query($sql) ;
}

/*
 * @Name   : surveyTrendStats
 * @Desc   : 调查趋势统计
 * @Param  : number  survey_code  调查编码
 * @Return : array   $data        统计数据
 */
function surveyTrendStats($survey_code){
    $sql = "select date(end_time) end_date , count(1) cnt 
            from tb_bas_survey_action where survey_code = $survey_code 
            group by end_date order by end_date " ;
    $res['data'] = M() -> query($sql) ;

    $sql = "select sum(cnt) cnt_sum, count(1) cnt_count, round(avg(cnt)) cnt_avg, max(cnt) cnt_max, min(cnt) cnt_min
            from (
              select date(end_time) end_date , count(1) cnt 
              from tb_bas_survey_action where survey_code = 10000303 
              group by end_date order by end_date ) t " ;
    $res['stats'] = M() -> query($sql)[0] ;

    return $res ;
}

/*
 * name   : 问卷基本信息统计
 * params : 问卷编码
 * return : {问题总数,单选题数,多选题数,主观题数}
 */
function userInfoCompleteStats($survey_code){
    $model= new Model() ;
    $sql="select
                count(*) all_cnt ,
                sum(case when a.question_prop='radio' then 1 else 0 end) radio_cnt ,
                sum(case when a.question_prop='checkbox' then 1 else 0 end) checkbox_cnt ,
                sum(case when a.question_prop='textarea' then 1 else 0 end) textarea_cnt
            from tb_bas_question_info a , tb_bas_survey_question <b></b>    
            where a.question_code=b.question_code
            and b.survey_code='$survey_code'" ;
    $svCnt=$model->query($sql) ;
    
    return $svCnt ;
}


/*
* @Name   : surveyPropStats
* @Desc   : 调查属性汇总统计
* @Param  : string  conditon   查询条件（必选）
* @Param  : string  type       查询类型（必选）
* @Return : array   stats      统计结果
*/
function surveyPropStats($param){
    $param['type'] ? $target = $param['type'] : $target = "survey" ;
    $param['cond'] ? $cond   = $param['cond'] : $cond   = "1 = 1"  ;

    $tbBasSurveyInfo    = M(TB_BAS_SURVEY_INFO)     -> getTableName() ;
    $tbBasQuestionInfo  = M(TB_BAS_QUESTION_INFO)   -> getTableName() ;
    $tbBasTagInfo       = M(TB_BAS_TAG_INFO)        -> getTableName() ;
    $tbDetSurveyState   = M(TB_DET_SURVEY_STATE)    -> getTableName() ;
    $tbDetSurveyType    = M(TB_DET_SURVEY_TYPE)     -> getTableName() ;
    $tbDetSurveyTypeSub = M(TB_DET_SURVEY_TYPE_SUB) -> getTableName() ;
    $tbDetSurveyTrade   = M(TB_DET_SURVEY_TRADE)    -> getTableName() ;

    // 非调查类型需要关联目标表
    if($target != 'survey'){
        $table = ", " . M(constant('TB_BAS_' . strtoupper($target) . '_INFO')) -> getTableName() . " t " ;
        $cond  = "a.survey_code = t.survey_code and $cond " ;

        // 基本数量统计
        $sql   = "select count(1) cnt from $tbBasSurveyInfo a $table where $cond" ;
        $stats = M() -> query($sql)[0] ;
    } 

    switch($param['order']){
        case 'cnt' :
            $order = "order by cnt desc" ;
            break ;

        default :
            $order = "order by 1, 2" ;
            break ;
    }

    $cfg = array(
        // 按调查状态统计
        'sv_state'    => "select b.survey_state_code state_code, b.state_desc_sketch state_desc, count(1) cnt 
                            from $tbBasSurveyInfo a, $tbDetSurveyState b $table
                            where a.survey_state = b.survey_state_code and $cond
                            group by b.survey_state_code, b.state_desc_sketch $order ". $param['limit'],
        // 按调查大类统计
        'sv_type'     => "select b.survey_type_code type_code, b.survey_type_name type_name, count(1) cnt
                            from $tbBasSurveyInfo a, $tbDetSurveyType b $table
                            where a.survey_type = b.survey_type_code and $cond
                            group by b.survey_type_code, b.survey_type_name order $order ". $param['limit'],
        // 按调查小类统计
        'sv_type_sub' => "select b.survey_type_code type_code, b.survey_type_name type_name, b.survey_type_sub_code type_sub_code, 
                            b.survey_type_sub_name type_sub_name, count(1) cnt
                            from $tbBasSurveyInfo a, $tbDetSurveyTypeSub b $table
                            where a.survey_type_sub = b.survey_type_sub_code and $cond
                            group by b.survey_type_sub_code, b.survey_type_sub_code $order  ". $param['limit'],
        // 按调查行业统计
        'sv_trade'    => "select b.survey_trade_code trade_code, b.survey_trade_name trade_name, count(1) cnt
                            from $tbBasSurveyInfo a, $tbDetSurveyTrade b $table
                            where a.survey_trade = b.survey_trade_code and $cond
                            group by b.survey_trade_code, b.survey_trade_name $order  ". $param['limit'],
    ) ;

    if($param['prop']){
        $stats[$param['prop']] = M() -> query($cfg[$param['prop']]) ;
    }else{
        foreach ($cfg as $key => $value) {
            if($query = M() -> query($value)){
                $stats[$key] = $query ;
            }
        }        
    }

    return $stats ;
}

?>