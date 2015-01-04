
/********���������Ժ�ά���ϵ��Ӧ��********/
drop table if exists tb_sys_page_cfg ;
create table tb_sys_page_cfg
(
    page_path      varchar(16)    ,#ҳ��·��
    page_name      varchar(16)    ,#ҳ������
    nav_type       varchar(8)     ,#�������ͣ�main/sub��
    need_logo      integer        ,#�Ƿ���ҪLOGO
    need_search    integer         #�Ƿ���Ҫ������
) ;

/********���������Ժ�ά���ϵ��Ӧ��********/
drop table if exists tb_bas_prop_det_relation ;
create table tb_bas_prop_det_relation
(
    prop_name         varchar(32)    ,#��������
    bas_table_name    varchar(64)    ,#��������
    bas_prop_name     varchar(32)    ,#�������ֶ���
    det_table_name    varchar(64)    ,#ά�����
    det_prop_name     varchar(32)    ,#�������ֶ���
    det_prop_desc     varchar(32)     #�������ֶ�������
) ;

/********�û��������ñ�********/
drop table if exists tb_det_user_prop ;
create table tb_det_user_prop
(
    user_prop_name    varchar(32)    ,#�û������ֶ���
    user_prop_desc    varchar(32)    ,#�û������ֶ�����
    prop_bas_table    varchar(32)    ,#���Զ�Ӧ������
    prop_det_table    varchar(32)    ,#���Զ�Ӧά��
    prop_det_code     varchar(32)    ,#���Զ�Ӧά���ֶα���
    prop_det_desc     varchar(32)     #���Զ�Ӧά���ֶ�����
) ;

/********��ҵ����ά��********/
drop table if exists tb_det_industry_class ;
create table tb_det_industry_class
(
    industry_class_code    integer        ,#��ҵ�������
    industry_class_desc    varchar(32)     #��ҵ��������
) ;
create index tb_det_industry_class__industry_class_code on tb_det_industry_class(industry_class_code) ;

/********��ҵС��ά��********/
drop table if exists tb_det_industry_class_sub ;
create table tb_det_industry_class_sub
(
    industry_class_sub_code    integer        ,#��ҵС�����
    industry_class_sub_desc    varchar(32)    ,#��ҵС������
    industry_class_code        integer        ,#��ҵ�������
    industry_class_desc        varchar(32)     #��ҵ��������
) ;
create index tb_det_industry_class_sub__industry_class_sub_code on tb_det_industry_class_sub(industry_class_sub_code) ;

/********�û�����ά��********/
drop table if exists tb_det_user_type ;
create table tb_det_user_type
(
    user_type_code    integer        ,#�û����ͱ���
    user_type_desc    varchar(16)     #�û���������
) ;
create index tb_det_user_type__user_type_code on tb_det_user_type(user_type_code) ;

/********�û��Ա�ά��********/
drop table if exists tb_det_user_sex ;
create table tb_det_user_sex
(
    user_sex_code    integer        ,#�û��Ա����
    user_sex_desc    varchar(16)     #�û��Ա�����
) ;
create index idx_tb_det_user_sex__user_sex_code on tb_det_user_sex(user_sex_code) ;

/********�û�ְҵά��********/
drop table if exists tb_det_user_career ;
create table tb_det_user_career
(
    user_career_code    integer        ,#�û�ְҵ����
    user_career_desc    varchar(32)     #�û�ְҵ����
) ;
create index idx_tb_det_user_career__user_career_code on tb_det_user_career(user_career_code) ;


/********�û�ѧ��ά��********/
drop table if exists tb_det_user_edu ;
create table tb_det_user_edu
(
    user_edu_code    integer        ,#�û�ѧ������
    user_edu_desc    varchar(16)     #�û�ѧ������
) ;
create index idx_tb_det_user_edu__user_edu_code on tb_det_user_edu(user_edu_code) ;

/********�û��������ά��********/
drop table if exists tb_det_user_income ;
create table tb_det_user_income
(
    user_income_code    integer        ,#����������
    user_income_desc    varchar(32)     #�����������
) ;

/********�û���������ά��********/
drop table if exists tb_det_user_income_section ;
create table tb_det_user_income_section
(
    income_section_code    integer        ,#�����������
    income_section_desc    varchar(32)    ,#��������˵��
    income_lower           integer        ,#��������
    income_upper           integer        ,#��������
    section_class_desc     varchar(32)    ,#���������������
    section_class_code     integer         #��������������
) ;
create index idx_tb_det_user_income_section__income_section_code on tb_det_user_income_section(income_section_code) ;
create index idx_tb_det_user_income_section__section_class_code on tb_det_user_income_section(section_class_code) ;

/********�û�����ά��********/
drop table if exists tb_det_user_age ;
create table tb_det_user_age
(
    user_age_code    integer        ,#�������
    user_age_desc    varchar(32)    ,#����˵��
    user_age_lower   integer        ,#��������
    user_age_upper   integer         #��������
) ;
create index idx_tb_det_user_age__user_age_code on tb_det_user_age(user_age_code) ;

/********ʡ������ά��********/
drop table if exists tb_det_area_province ;
create table tb_det_area_province
(
    area_province_code     integer        ,#ʡ���������
    area_province_name     varchar(32)    ,#ʡ����������
    area_class_code        integer        ,#ʡ����������
    area_class_name        varchar(32)    ,#ʡ����������
    area_province_sname    varchar(16)     #ʡ��������
) ;

/********���е���ά��********/
drop table if exists tb_det_area_city ;
create table tb_det_area_city
(
    area_city_seq         integer        ,#���е����������
    area_city_code        integer        ,#���е������
    area_city_name        varchar(32)    ,#���е�������
    area_province_code    integer         #ʡ���������
) ;

/********������ά��********/
drop table if exists tb_det_area_map ;
create table tb_det_area_map
(
    area_city_seq          integer        ,#���е����������
    area_city_code         integer        ,#���е������
    area_city_name         varchar(32)    ,#���е�������
    area_city_sname        varchar(32)    ,#���е�����
    area_province_code     integer        ,#ʡ���������
    area_province_name     varchar(32)    ,#ʡ����������
    area_province_sname    varchar(32)    ,#ʡ��������
    area_class_code        integer        ,#ʡ����������
    area_class_name        varchar(32)    ,#ʡ����������
) ;
create index tb_det_area_map__area_city_seq      on tb_det_area_map(area_city_seq) ;
create index tb_det_area_map__area_city_code     on tb_det_area_map(area_city_code) ;
create index tb_det_area_map__area_province_code on tb_det_area_map(area_province_code) ;

/********�û��Ը�����ά��********/
drop table if exists tb_det_user_character ;
create table tb_det_user_character
(
    user_character_code    integer        ,#�û��Ը����ͱ���
    user_character_desc    varchar(32)     #�û��Ը���������
) ;

/********�û�����״̬ά��********/
drop table if exists tb_det_user_affection ;
create table tb_det_user_affection
(
    user_affection_code    integer        ,#�û�����״̬����
    user_affection_desc    varchar(32)     #�û�����״̬����
) ;

/********�û��������ά��********/
drop table if exists tb_det_user_stature ;
create table tb_det_user_stature
(
    user_stature_code    integer        ,#�û�������ͱ���
    user_stature_desc    varchar(32)     #�û������������
) ;

/********�û��Ը�����ά��********/
drop table if exists tb_det_user_hobby ;
create table tb_det_user_hobby
(
    user_hobby_code    integer        ,#�û��Ը����ͱ���
    user_hobby_desc    varchar(32)     #�û��Ը���������
) ;

/********��������********/
drop table if exists tb_det_survey_type ;
create table tb_det_survey_type
(
    survey_type_code    integer        ,#�������ͱ���
    survey_type_name    varchar(16)    ,#������������
    survey_type_desc    varchar(128)    #������������
) ;
create index tb_det_survey_type__survey_type_code on tb_det_survey_type(survey_type_code) ;

/********����������********/
drop table if exists tb_det_survey_type_sub ;
create table tb_det_survey_type_sub
(
    survey_type_code        integer        ,#����������
    survey_type_name        varchar(16)    ,#�����������
    survey_type_sub_code    integer        ,#����С�����
    survey_type_sub_name    varchar(16)     #����С������
) ;
create index tb_det_survey_type_sub__survey_type_code on tb_det_survey_type_sub(survey_type_code) ;

/********������ҵ����********/
drop table if exists tb_det_survey_trade ;
create table tb_det_survey_trade
(
    survey_trade_code    integer        ,#������ҵ�������
    survey_trade_name    varchar(16)    ,#������ҵ��������
    survey_type_desc     varchar(128)    #������ҵ��������
) ;
create index tb_det_survey_trade__survey_trade_code on tb_det_survey_trade(survey_trade_code) ;

/********�������********/
drop table if exists tb_det_survey_class ;
create table tb_det_survey_class
(
    survey_class_code    integer        ,#����������
    survey_class_desc    varchar(16)     #�����������
) ;
create index tb_det_survey_class__survey_class_code on tb_det_survey_class(survey_class_code) ;

/********����С��********/
drop table if exists tb_det_survey_class_sub ;
create table tb_det_survey_class_sub
(
    survey_class_sub_code    varchar(8)     ,#����С�����
    survey_class_sub_desc    varchar(16)    ,#����С������
    survey_class_code        varchar(8)      #��Ӧ������ͱ���
) ;
create index tb_det_survey_class_sub__survey_class_sub_code on tb_det_survey_class_sub(survey_class_sub_code) ;

/********����״̬********/
drop table if exists tb_det_survey_state ;
create table tb_det_survey_state
(
    survey_state_code     integer        ,#����״̬����
    survey_state_desc     varchar(16)    ,#����״̬����
    state_desc_sketch     varchar(8)      #����״̬����
) ;

/********�����Ƽ�����********/
drop table if exists tb_det_survey_recomm_type ;
create table tb_det_survey_recomm_type
(
    survey_type_code    integer        ,#�����Ƽ����ͱ���
    survey_type_desc    varchar(16)     #�����Ƽ���������
) ;

/********��������********/
drop table if exists tb_det_question_class ;
create table tb_det_question_class
(
    question_class_code    varchar(8)     ,#�������ͱ���
    question_class_desc    varchar(16)     #������������
) ;

/********��������********/
drop table if exists tb_det_question_prop ;
create table tb_det_question_prop
(
    question_prop_code    varchar(8)     ,#�������Ա���
    question_prop_desc    varchar(16)     #������������
) ;

/********��������********/
drop table if exists tb_det_reward_type ;
create table tb_det_reward_type
(
    reward_type_code    varchar(8)     ,#�������ͱ���
    reward_type_desc    varchar(16)     #������������
) ;

/********�����Ƽ��û�״̬********/
drop table if exists tb_det_recommend_user_state ;
create table tb_det_recommend_user_state
(
    user_state_code    integer        ,#�Ƽ��û�״̬����
    user_state_desc    varchar(16)     #�Ƽ��û�״̬����
) ;

/********�����Ƽ�����״̬********/
drop table if exists tb_det_survey_recommend_state ;
create table tb_det_survey_recommend_state
(
    recommend_state_code    integer        ,#�Ƽ�����״̬����
    recommend_state_desc    varchar(16)     #�Ƽ�����״̬����
) ;

/********�����Ƽ�����********/
drop table if exists tb_det_survey_recommend_type ;
create table tb_det_survey_recommend_type
(
    recommend_type_code    integer        ,#�Ƽ��������ͱ���
    recommend_type_desc    varchar(16)     #�Ƽ�������������
) ;

/********�������********/
drop table if exists tb_det_question_class_type ;
create table tb_det_question_class_type
(
    question_class_code   integer       ,#����������
    question_class_desc   varchar(16)   ,#�����������
    question_type_code    integer       ,#����С�����
    question_type_desc    varchar(16)    #����С������
) ;

/********��������********/
drop table if exists tb_det_question_type ;
create table tb_det_question_type
(
    question_type_code    varchar(8)     ,#�������ͱ���
    question_type_desc    varchar(16)     #������������
) ;

/********�û����ֵȼ���ϵ��********/
drop table if exists tb_det_user_level ;
create table tb_det_user_level
(
    user_level_value     integer        ,#�û��ȼ�ֵ
    user_level_desc      varchar(16)    ,#�û��ȼ�����
    score_lower_value    integer        ,#��ͻ��ַ�ֵ
    score_upper_value    integer         #��߻��ַ�ֵ
) ;

/********�û��ȼ�Ȩ�ޱ�********/
drop table if exists tb_det_user_level_right ;
create table tb_det_user_level_right
(
    user_level_right_value    integer        ,#�û��ȼ�ֵ
    user_level_right_desc     varchar(16)     #�û��ȼ�����
) ;

/********�û���ΪȨ�ޱ�********/
drop table if exists tb_det_user_action_right ;
create table tb_det_user_action_right
(
    user_level_value     integer        ,#�û��ȼ�ֵ
    answer_sv_num_day    integer        ,#ÿ�ղ����������
    comment_survey       integer        ,#���۵���Ȩ��
    can_reward           integer        ,#�һ���ƷȨ��
    advanced_task        integer         #����߼�����Ȩ��
) ;

/********�����ۼƹ����********/
drop table if exists tb_det_score_add_rule ;
create table tb_det_score_add_rule
(
    action_code    integer        ,#�û���Ϊ���루��λ���룩
    action_desc    varchar(32)    ,#�û���Ϊ˵��
    action_type    integer        ,#��Ϊ���ͣ�0:ʧЧ 1��ѭ���Ի 2:һ���Ի��
    score_num      integer         #���ӻ�������
) ;

/********���ʹ�ù����********/
drop table if exists tb_det_coins_action_rule ;
create table tb_det_coins_action_rule
(
    action_code    integer        ,#�û���Ϊ���루��λ���룩
    action_desc    varchar(32)    ,#�û���Ϊ˵��
    action_type    integer        ,#��Ϊ���ͣ�0:ʧЧ 1��ѭ���Ի 2:һ���Ի��
    coins_type     integer        ,#���ʹ�����ͣ�1:���ӽ�� -1:���Ľ�ң�
    coins_num      integer         #ʹ�ý������
) ;

/********���ֽ����Ϊ���ͱ�********/
drop table if exists tb_det_user_action_type ;
create table tb_det_user_action_type
(
    action_type_code    integer        ,#��Ϊ����
    action_type_desc    varchar(32)     #��Ϊ����˵��
) ;

/********�û���Ϊ���ñ�������********/
drop table if exists tb_det_user_action_config_bak ;
create table tb_det_user_action_config
(
    action_code      integer        ,#�û���Ϊ����
    action_desc      varchar(64)    ,#�û���Ϊ˵��
    action_type      integer        ,#��Ϊ���ͣ�0:ʧЧ 1��ѭ���Ի 2:һ���Ի��
    action_table     varchar(64)    ,#��Ӧ����
    action_column    varchar(32)    ,#�����ֶ���
    action_target    varchar(32)    ,#Ŀ���ֶ���
    score_logic      integer        ,#����ʹ���߼���0:�޹أ�1:���ӣ�-1:���٣�
    score_value      integer        ,#����ʹ��ֵ  ��ֵΪnull˵��Ҫ�������������Զ���ʵ��ֵ��
    coins_logic      integer        ,#���ʹ���߼���0:�޹أ�1:���ӣ�-1:���٣�
    coins_value      integer        ,#���ʹ��ֵ  ��ֵΪnull˵��Ҫ�������������Զ���ʵ��ֵ��
    write_log        integer         #�Ƿ��¼��־��0:����¼��־��1����¼��־��
) ;

/********�û���Ϊ���ñ�********/
drop table if exists tb_det_user_action_config ;
create table tb_det_user_action_config
(
    action_code      integer        ,#��Ϊ����
    action_desc      varchar(64)    ,#��Ϊ˵��
    action_state     integer        ,#��Ϊ״̬��0:ʧЧ��1:��Ч��
    action_cycle     integer        ,#��Ϊ���ڣ�0:ʧЧ 1:ѭ���Ի 2:һ���Ի��
    update_logic     integer        ,#�����߼���0:�޹أ�1:���ӣ�-1:���٣�
    update_value     integer        ,#����ֵ  ��ֵΪnull˵��Ҫ�������������Զ���ʵ��ֵ��
    update_type      varchar(16)    ,#�������ͣ��˻��ֶ�����
    table_name       varchar(64)    ,#��Ϊ��Ӧ����
    code_column      varchar(32)    ,#�����Ӧ�ֶ���
    desc_column      varchar(32)    ,#������Ӧ�ֶ���
    value_column     varchar(32)    ,#ȡֵ��Ӧ�ֶ���
    write_log        integer         #�Ƿ��¼��־��0:����¼��־��1:��¼��־��
) ;

/********�û������봴�������Ƽ��ȼ���ϵ��********/
drop table if exists tb_det_user_type_survey_recomm_relation ;
create table tb_det_user_type_survey_recomm_relation
(
    user_type        integer        ,#�û����ͱ���
    recomm_level     integer         #�����Ƽ����ȼ�
    relation_desc    varchar(32)     #��ϵ����
) ;





