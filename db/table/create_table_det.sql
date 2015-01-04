
/********基础表属性和维表关系对应表********/
drop table if exists tb_sys_page_cfg ;
create table tb_sys_page_cfg
(
    page_path      varchar(16)    ,#页面路径
    page_name      varchar(16)    ,#页面名称
    nav_type       varchar(8)     ,#导航类型（main/sub）
    need_logo      integer        ,#是否需要LOGO
    need_search    integer         #是否需要搜索框
) ;

/********基础表属性和维表关系对应表********/
drop table if exists tb_bas_prop_det_relation ;
create table tb_bas_prop_det_relation
(
    prop_name         varchar(32)    ,#属性名称
    bas_table_name    varchar(64)    ,#基础表名
    bas_prop_name     varchar(32)    ,#基础表字段名
    det_table_name    varchar(64)    ,#维表表名
    det_prop_name     varchar(32)    ,#基础表字段名
    det_prop_desc     varchar(32)     #基础表字段描述名
) ;

/********用户属性配置表********/
drop table if exists tb_det_user_prop ;
create table tb_det_user_prop
(
    user_prop_name    varchar(32)    ,#用户属性字段名
    user_prop_desc    varchar(32)    ,#用户属性字段描述
    prop_bas_table    varchar(32)    ,#属性对应基础表
    prop_det_table    varchar(32)    ,#属性对应维表
    prop_det_code     varchar(32)    ,#属性对应维表字段编码
    prop_det_desc     varchar(32)     #属性对应维表字段描述
) ;

/********行业大类维表********/
drop table if exists tb_det_industry_class ;
create table tb_det_industry_class
(
    industry_class_code    integer        ,#行业大类编码
    industry_class_desc    varchar(32)     #行业大类描述
) ;
create index tb_det_industry_class__industry_class_code on tb_det_industry_class(industry_class_code) ;

/********行业小类维表********/
drop table if exists tb_det_industry_class_sub ;
create table tb_det_industry_class_sub
(
    industry_class_sub_code    integer        ,#行业小类编码
    industry_class_sub_desc    varchar(32)    ,#行业小类描述
    industry_class_code        integer        ,#行业大类编码
    industry_class_desc        varchar(32)     #行业大类描述
) ;
create index tb_det_industry_class_sub__industry_class_sub_code on tb_det_industry_class_sub(industry_class_sub_code) ;

/********用户类型维表********/
drop table if exists tb_det_user_type ;
create table tb_det_user_type
(
    user_type_code    integer        ,#用户类型编码
    user_type_desc    varchar(16)     #用户类型描述
) ;
create index tb_det_user_type__user_type_code on tb_det_user_type(user_type_code) ;

/********用户性别维表********/
drop table if exists tb_det_user_sex ;
create table tb_det_user_sex
(
    user_sex_code    integer        ,#用户性别编码
    user_sex_desc    varchar(16)     #用户性别描述
) ;
create index idx_tb_det_user_sex__user_sex_code on tb_det_user_sex(user_sex_code) ;

/********用户职业维表********/
drop table if exists tb_det_user_career ;
create table tb_det_user_career
(
    user_career_code    integer        ,#用户职业编码
    user_career_desc    varchar(32)     #用户职业描述
) ;
create index idx_tb_det_user_career__user_career_code on tb_det_user_career(user_career_code) ;


/********用户学历维表********/
drop table if exists tb_det_user_edu ;
create table tb_det_user_edu
(
    user_edu_code    integer        ,#用户学历编码
    user_edu_desc    varchar(16)     #用户学历描述
) ;
create index idx_tb_det_user_edu__user_edu_code on tb_det_user_edu(user_edu_code) ;

/********用户收入分类维表********/
drop table if exists tb_det_user_income ;
create table tb_det_user_income
(
    user_income_code    integer        ,#收入分类编码
    user_income_desc    varchar(32)     #收入分类描述
) ;

/********用户收入区间维表********/
drop table if exists tb_det_user_income_section ;
create table tb_det_user_income_section
(
    income_section_code    integer        ,#收入区间编码
    income_section_desc    varchar(32)    ,#收入区间说明
    income_lower           integer        ,#收入下限
    income_upper           integer        ,#收入上限
    section_class_desc     varchar(32)    ,#收入区间大类描述
    section_class_code     integer         #收入区间大类编码
) ;
create index idx_tb_det_user_income_section__income_section_code on tb_det_user_income_section(income_section_code) ;
create index idx_tb_det_user_income_section__section_class_code on tb_det_user_income_section(section_class_code) ;

/********用户年龄维表********/
drop table if exists tb_det_user_age ;
create table tb_det_user_age
(
    user_age_code    integer        ,#年龄编码
    user_age_desc    varchar(32)    ,#年龄说明
    user_age_lower   integer        ,#年龄下限
    user_age_upper   integer         #年龄上限
) ;
create index idx_tb_det_user_age__user_age_code on tb_det_user_age(user_age_code) ;

/********省级地域维表********/
drop table if exists tb_det_area_province ;
create table tb_det_area_province
(
    area_province_code     integer        ,#省级地域编码
    area_province_name     varchar(32)    ,#省级地域名称
    area_class_code        integer        ,#省级大区编码
    area_class_name        varchar(32)    ,#省级大区名称
    area_province_sname    varchar(16)     #省级地域简称
) ;

/********城市地域维表********/
drop table if exists tb_det_area_city ;
create table tb_det_area_city
(
    area_city_seq         integer        ,#城市地域编码序列
    area_city_code        integer        ,#城市地域编码
    area_city_name        varchar(32)    ,#城市地域名称
    area_province_code    integer         #省级地域编码
) ;

/********地域总维表********/
drop table if exists tb_det_area_map ;
create table tb_det_area_map
(
    area_city_seq          integer        ,#城市地域编码序列
    area_city_code         integer        ,#城市地域编码
    area_city_name         varchar(32)    ,#城市地域名称
    area_city_sname        varchar(32)    ,#城市地域简称
    area_province_code     integer        ,#省级地域编码
    area_province_name     varchar(32)    ,#省级地域名称
    area_province_sname    varchar(32)    ,#省级地域简称
    area_class_code        integer        ,#省级大区编码
    area_class_name        varchar(32)    ,#省级大区名称
) ;
create index tb_det_area_map__area_city_seq      on tb_det_area_map(area_city_seq) ;
create index tb_det_area_map__area_city_code     on tb_det_area_map(area_city_code) ;
create index tb_det_area_map__area_province_code on tb_det_area_map(area_province_code) ;

/********用户性格类型维表********/
drop table if exists tb_det_user_character ;
create table tb_det_user_character
(
    user_character_code    integer        ,#用户性格类型编码
    user_character_desc    varchar(32)     #用户性格类型描述
) ;

/********用户感情状态维表********/
drop table if exists tb_det_user_affection ;
create table tb_det_user_affection
(
    user_affection_code    integer        ,#用户感情状态编码
    user_affection_desc    varchar(32)     #用户感情状态描述
) ;

/********用户身材类型维表********/
drop table if exists tb_det_user_stature ;
create table tb_det_user_stature
(
    user_stature_code    integer        ,#用户身材类型编码
    user_stature_desc    varchar(32)     #用户身材类型描述
) ;

/********用户性格类型维表********/
drop table if exists tb_det_user_hobby ;
create table tb_det_user_hobby
(
    user_hobby_code    integer        ,#用户性格类型编码
    user_hobby_desc    varchar(32)     #用户性格类型描述
) ;

/********调查类型********/
drop table if exists tb_det_survey_type ;
create table tb_det_survey_type
(
    survey_type_code    integer        ,#调查类型编码
    survey_type_name    varchar(16)    ,#调查类型名称
    survey_type_desc    varchar(128)    #调查类型描述
) ;
create index tb_det_survey_type__survey_type_code on tb_det_survey_type(survey_type_code) ;

/********调查子类型********/
drop table if exists tb_det_survey_type_sub ;
create table tb_det_survey_type_sub
(
    survey_type_code        integer        ,#调查大类编码
    survey_type_name        varchar(16)    ,#调查大类描述
    survey_type_sub_code    integer        ,#调查小类编码
    survey_type_sub_name    varchar(16)     #调查小类描述
) ;
create index tb_det_survey_type_sub__survey_type_code on tb_det_survey_type_sub(survey_type_code) ;

/********调查行业分类********/
drop table if exists tb_det_survey_trade ;
create table tb_det_survey_trade
(
    survey_trade_code    integer        ,#调查行业分类编码
    survey_trade_name    varchar(16)    ,#调查行业分类名称
    survey_type_desc     varchar(128)    #调查行业分类描述
) ;
create index tb_det_survey_trade__survey_trade_code on tb_det_survey_trade(survey_trade_code) ;

/********调查大类********/
drop table if exists tb_det_survey_class ;
create table tb_det_survey_class
(
    survey_class_code    integer        ,#调查大类编码
    survey_class_desc    varchar(16)     #调查大类描述
) ;
create index tb_det_survey_class__survey_class_code on tb_det_survey_class(survey_class_code) ;

/********调查小类********/
drop table if exists tb_det_survey_class_sub ;
create table tb_det_survey_class_sub
(
    survey_class_sub_code    varchar(8)     ,#调查小类编码
    survey_class_sub_desc    varchar(16)    ,#调查小类描述
    survey_class_code        varchar(8)      #对应调查大型编码
) ;
create index tb_det_survey_class_sub__survey_class_sub_code on tb_det_survey_class_sub(survey_class_sub_code) ;

/********调查状态********/
drop table if exists tb_det_survey_state ;
create table tb_det_survey_state
(
    survey_state_code     integer        ,#调查状态编码
    survey_state_desc     varchar(16)    ,#调查状态描述
    state_desc_sketch     varchar(8)      #调查状态简述
) ;

/********调查推荐类型********/
drop table if exists tb_det_survey_recomm_type ;
create table tb_det_survey_recomm_type
(
    survey_type_code    integer        ,#调查推荐类型编码
    survey_type_desc    varchar(16)     #调查推荐类型描述
) ;

/********问题类型********/
drop table if exists tb_det_question_class ;
create table tb_det_question_class
(
    question_class_code    varchar(8)     ,#问题类型编码
    question_class_desc    varchar(16)     #问题类型描述
) ;

/********问题属性********/
drop table if exists tb_det_question_prop ;
create table tb_det_question_prop
(
    question_prop_code    varchar(8)     ,#问题属性编码
    question_prop_desc    varchar(16)     #问题属性描述
) ;

/********奖励类型********/
drop table if exists tb_det_reward_type ;
create table tb_det_reward_type
(
    reward_type_code    varchar(8)     ,#奖励类型编码
    reward_type_desc    varchar(16)     #奖励类型描述
) ;

/********调查推荐用户状态********/
drop table if exists tb_det_recommend_user_state ;
create table tb_det_recommend_user_state
(
    user_state_code    integer        ,#推荐用户状态编码
    user_state_desc    varchar(16)     #推荐用户状态描述
) ;

/********调查推荐规则状态********/
drop table if exists tb_det_survey_recommend_state ;
create table tb_det_survey_recommend_state
(
    recommend_state_code    integer        ,#推荐规则状态编码
    recommend_state_desc    varchar(16)     #推荐规则状态描述
) ;

/********调查推荐类型********/
drop table if exists tb_det_survey_recommend_type ;
create table tb_det_survey_recommend_type
(
    recommend_type_code    integer        ,#推荐规则类型编码
    recommend_type_desc    varchar(16)     #推荐规则类型描述
) ;

/********调查分类********/
drop table if exists tb_det_question_class_type ;
create table tb_det_question_class_type
(
    question_class_code   integer       ,#问题大类编码
    question_class_desc   varchar(16)   ,#问题大类描述
    question_type_code    integer       ,#问题小类编码
    question_type_desc    varchar(16)    #问题小类描述
) ;

/********调查类型********/
drop table if exists tb_det_question_type ;
create table tb_det_question_type
(
    question_type_code    varchar(8)     ,#问题类型编码
    question_type_desc    varchar(16)     #问题类型描述
) ;

/********用户积分等级关系表********/
drop table if exists tb_det_user_level ;
create table tb_det_user_level
(
    user_level_value     integer        ,#用户等级值
    user_level_desc      varchar(16)    ,#用户等级描述
    score_lower_value    integer        ,#最低积分阀值
    score_upper_value    integer         #最高积分阀值
) ;

/********用户等级权限表********/
drop table if exists tb_det_user_level_right ;
create table tb_det_user_level_right
(
    user_level_right_value    integer        ,#用户等级值
    user_level_right_desc     varchar(16)     #用户等级描述
) ;

/********用户行为权限表********/
drop table if exists tb_det_user_action_right ;
create table tb_det_user_action_right
(
    user_level_value     integer        ,#用户等级值
    answer_sv_num_day    integer        ,#每日参与调查数量
    comment_survey       integer        ,#评论调查权限
    can_reward           integer        ,#兑换奖品权限
    advanced_task        integer         #参与高级任务权限
) ;

/********积分累计规则表********/
drop table if exists tb_det_score_add_rule ;
create table tb_det_score_add_rule
(
    action_code    integer        ,#用户行为编码（四位编码）
    action_desc    varchar(32)    ,#用户行为说明
    action_type    integer        ,#行为类型（0:失效 1：循环性活动 2:一次性活动）
    score_num      integer         #增加积分数量
) ;

/********金币使用规则表********/
drop table if exists tb_det_coins_action_rule ;
create table tb_det_coins_action_rule
(
    action_code    integer        ,#用户行为编码（四位编码）
    action_desc    varchar(32)    ,#用户行为说明
    action_type    integer        ,#行为类型（0:失效 1：循环性活动 2:一次性活动）
    coins_type     integer        ,#金币使用类型（1:增加金币 -1:消耗金币）
    coins_num      integer         #使用金币数量
) ;

/********积分金币行为类型表********/
drop table if exists tb_det_user_action_type ;
create table tb_det_user_action_type
(
    action_type_code    integer        ,#行为类型
    action_type_desc    varchar(32)     #行为类型说明
) ;

/********用户行为配置表（废弃）********/
drop table if exists tb_det_user_action_config_bak ;
create table tb_det_user_action_config
(
    action_code      integer        ,#用户行为编码
    action_desc      varchar(64)    ,#用户行为说明
    action_type      integer        ,#行为类型（0:失效 1：循环性活动 2:一次性活动）
    action_table     varchar(64)    ,#对应表名
    action_column    varchar(32)    ,#条件字段名
    action_target    varchar(32)    ,#目标字段名
    score_logic      integer        ,#积分使用逻辑（0:无关；1:增加；-1:减少）
    score_value      integer        ,#积分使用值  （值为null说明要根据其他因素自定义实际值）
    coins_logic      integer        ,#金币使用逻辑（0:无关；1:增加；-1:减少）
    coins_value      integer        ,#金币使用值  （值为null说明要根据其他因素自定义实际值）
    write_log        integer         #是否记录日志（0:不记录日志；1：记录日志）
) ;

/********用户行为配置表********/
drop table if exists tb_det_user_action_config ;
create table tb_det_user_action_config
(
    action_code      integer        ,#行为编码
    action_desc      varchar(64)    ,#行为说明
    action_state     integer        ,#行为状态（0:失效；1:有效）
    action_cycle     integer        ,#行为周期（0:失效 1:循环性活动 2:一次性活动）
    update_logic     integer        ,#更新逻辑（0:无关；1:增加；-1:减少）
    update_value     integer        ,#更新值  （值为null说明要根据其他因素自定义实际值）
    update_type      varchar(16)    ,#更新类型（账户字段名）
    table_name       varchar(64)    ,#行为对应表名
    code_column      varchar(32)    ,#编码对应字段名
    desc_column      varchar(32)    ,#描述对应字段名
    value_column     varchar(32)    ,#取值对应字段名
    write_log        integer         #是否记录日志（0:不记录日志；1:记录日志）
) ;

/********用户类型与创建调查推荐等级关系表********/
drop table if exists tb_det_user_type_survey_recomm_relation ;
create table tb_det_user_type_survey_recomm_relation
(
    user_type        integer        ,#用户类型编码
    recomm_level     integer         #调查推荐优先级
    relation_desc    varchar(32)     #关系描述
) ;





