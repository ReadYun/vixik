
--------------------------------------------------------查询问卷基本信息

select * from tb_bas_survey_info a , tb_bas_survey_statist b
where a.survey_code = b.survey_code and a.survey_code = 10000109 ;

--------------------------------------------------------查询问卷问题信息

select * from tb_bas_survey_question a , tb_bas_question_info b , tb_bas_question_option c
where a.question_code = b.question_code and b.question_code = c.question_code and a.survey_code = 10000126
order by a.question_serial , c.order_id ;

--------------------------------------------------------查询用户基本信息

select * from tb_bas_user_info a , tb_bas_user_action b
where a.user_code = b.user_code and a.user_code = 10000000 ;

--------------------------------------------------------常规查询语句

select * from tb_bas_user_info ;
select * from tb_bas_user_action ;
select * from tb_bas_survey_info order by survey_code desc;
select * from tb_bas_survey_statist where survey_code = 10000106 ;
select * from tb_bas_survey_action ;
select * from tb_bas_survey_question order by survey_code desc ;
select * from tb_bas_question_info where question_code=100077;
select * from tb_bas_question_option order by question_code desc ;
select * from tb_bas_survey_action ;
select * from tb_bas_question_action ;

--------------------------------------------------------临时查询语句

select * from wbuser_member ;