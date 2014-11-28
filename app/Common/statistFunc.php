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

?>