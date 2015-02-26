
/********用户基本信息********/
drop table if exists tb_bas_user_info ;
create table tb_bas_user_info
(
    user_code          integer       ,#用户编码
    user_name          varchar(16)   ,#用户名称
    user_nick          varchar(32)   ,#用户昵称
    user_pwd           varchar(32)   ,#用户密码
    user_email         varchar(64)   ,#用户电邮
    user_type          integer       ,#用户类型
    user_photo         integer       ,#用户头像（0:无头像；1:有头像）
    image_href         varchar(128)  ,#头像地址
    create_time        datetime      ,#注册时间
    create_ip          varchar(16)   ,#注册IP
    area_province      integer       ,#省级地域
    area_city          integer       ,#市级地域
    user_birthday      date          ,#用户生日
    birth_year         integer       ,#出生年份
    birth_month        integer       ,#出生月份
    birth_day          integer       ,#出生日期
    user_age           integer       ,#用户年龄
    user_age_section   integer       ,#用户年龄所属区间
    user_sex           integer       ,#用户性别
    user_career        integer       ,#用户职业
    industry_class     integer       ,#从事行业大类
    industry_sub       integer       ,#从事行业小类
    income_class       integer       ,#用户收入
    income_section     integer       ,#用户收入区间
    user_edu           integer       ,#用户学历
    user_desc          varchar(256)  ,#用户简介
    identity_card      varchar(18)   ,#身份证
    sure_name          varchar(16)   ,#用户姓名
    user_address       varchar(256)  ,#用户住址
    mobile_phone       varchar(32)   ,#手机号码
    fix_phone          varchar(32)   ,#固定电话
    web_site           varchar(128)  ,#用户网站
    weibo_href         varchar(128)  ,#微博地址
    weibo_type         varchar(16)   ,#微博类型
    user_qq            integer       ,#腾讯QQ
    user_ww            varchar(64)   ,#阿里旺旺
    user_msn           varchar(64)   ,#MSN
	  user_character     varchar(64)   ,#个人性格
    user_affection     varchar(64)   ,#感情情况
    user_stature       varchar(64)   ,#个人身材
    user_hobby         varchar(64)   ,#个人爱好
    user_desc          varchar(256)  ,#用户简介
    interest_survey    varchar(32)   ,#感兴趣调查类型
    interest_reward    varchar(32)   ,#感兴趣奖励类型
    interest_prize     varchar(32)   ,#感兴趣奖品类型
    primary key(user_code)
) ;
create index idx_bas_user_info__user_code        on tb_bas_user_info(user_code) ;
create index idx_bas_user_info__user_name        on tb_bas_user_info(user_name) ;
create index idx_bas_user_info__user_sex         on tb_bas_user_info(user_sex) ;
create index idx_bas_user_info__user_age         on tb_bas_user_info(user_age) ;
create index idx_bas_user_info__user_age_section on tb_bas_user_info(user_age_section) ;
create index idx_bas_user_info__area_province    on tb_bas_user_info(area_province) ;
create index idx_bas_user_info__area_city        on tb_bas_user_info(area_city) ;
create index idx_bas_user_info__user_edu         on tb_bas_user_info(user_edu) ;
create index idx_bas_user_info__user_career      on tb_bas_user_info(user_career) ;

/********用户扩展信息********/
drop table if exists tb_bas_user_extend_info ;
create table tb_bas_user_extend_info
(
    user_code         integer         ,#用户编码
	  user_character    varchar(64)     ,#个人性格
    user_affection    varchar(64)     ,#感情情况
    user_stature      varchar(64)     ,#个人身材
    user_hobby        varchar(64)     ,#个人爱好
    user_desc         varchar(256)    ,#用户简介
    primary key(user_code)
) ;
create index idx_bas_user_extend_info__user_code on tb_bas_user_extend_info(user_code) ;

/********用户账户信息********/
drop table if exists tb_bas_user_accout ;
create table tb_bas_user_accout
(
    user_code       integer              ,#用户编码
    user_score      integer   default 0  ,#用户积分
    user_level      integer   default 0  ,#用户级别
    user_coins      integer   default 0  ,#用户金币
    publish_times   integer   default 0  ,#发布调查次数
    answer_times    integer   default 0  ,#参与调查次数
    login_time      datetime              #上次登录时间
) ;
create index idx_bas_user_accout__user_code  on tb_bas_user_accout(user_code) ;
create index idx_bas_user_accout__user_level on tb_bas_user_accout(user_level) ;

/********用户兴趣信息********/
drop table if exists tb_bas_user_interest ;
create table tb_bas_user_interest
(
    user_code      integer        ,#用户编码
    survey_type    varchar(32)    ,#感兴趣调查类型
    reward_type    varchar(32)    ,#感兴趣奖励类型
    prize_type     varchar(32)     #感兴趣奖品类型
) ;

/********用户关注用户信息********/
drop table if exists tb_bas_user_follow_user ;
create table tb_bas_user_follow_user
(
    user_code       integer     ,#主用户编码
    follow_code     integer     ,#关注用户编码
    follow_time     datetime    ,#关注时间
    follow_state    integer      #关注状态(0:无效；1:有效)
) ;
create index idx_tb_bas_user_follow_user__user_code   on tb_bas_user_follow_user(user_code) ;
create index idx_tb_bas_user_follow_user__follow_code on tb_bas_user_follow_user(follow_code) ;

/********用户关注调查信息********/
drop table if exists tb_bas_user_follow_survey ;
create table tb_bas_user_follow_survey
(
    user_code       integer     ,#主用户编码
    follow_code     integer     ,#关注用户编码
    follow_time     datetime    ,#关注时间
    follow_state    integer      #关注状态(0:无效；1:有效)
) ;
create index idx_tb_bas_user_follow_survey__user_code   on tb_bas_user_follow_survey(user_code) ;
create index idx_tb_bas_user_follow_survey__follow_code on tb_bas_user_follow_survey(follow_code) ;

/********用户关注调查属性信息表********/
drop table if exists tb_bas_user_follow_svprop ;
create table tb_bas_user_follow_svprop
(
    user_code       integer      ,#用户编码
    svprop_type     varchar(16)  ,#关注调查属性类型（survey_type/survey_type_sub/survey_trade）
    svprop_value    integer      ,#关注调查属性值
    follow_time     datetime      #关注时间
) ;
create index idx_tb_bas_user_follow_svprop__user_code  on tb_bas_user_follow_svprop(user_code) ;

/********用户分享调查信息********/
drop table if exists tb_bas_user_share_survey ;
create table tb_bas_user_share_survey
(
    user_code      integer       ,#主用户编码
    share_type     integer       ,#分享方式
    share_code     integer       ,#分享调查编码
    share_desc     varchar(512)  ,#分享描述
    follow_time    datetime       #分享时间
) ;

/********调查基本信息********/
drop table if exists tb_bas_survey_info ;
create table tb_bas_survey_info
(
    survey_code        integer not null         ,#调查编码
    survey_name        varchar(64)              ,#调查名称
    survey_desc        text                     ,#调查说明
	  survey_tag         varchar(128)             ,#调查标签
    survey_type        integer                  ,#调查归属大类
    survey_type_sub    integer                  ,#调查归属小类
    survey_class       integer                  ,#调查分类（功能待定）
    survey_trade       integer                  ,#调查行业
    survey_state       integer                  ,#调查状态
    answer_end_desc    text                     ,#参与结束说明
    user_code          integer                  ,#用户编码
    answer_flow        integer                  ,#答题流程(1:清单展示所有题目，2:按回答进度展示题目)
    is_template        integer                  ,#是否设为模板(1:是，0:否)
    recomm_type        integer                  ,#推荐标志(0:不推荐，1:系统推荐，2:自定义推荐)
    recomm_grade       integer                  ,#调查推荐级别
  	end_type           integer                  ,#结束方式
  	end_value          integer                  ,#结束方式对应值	
    create_time        datetime                 ,#调查创建时间
    state_time         datetime                 ,#调查状态更新时间
    start_time         datetime                 ,#调查活动开始时间
    end_time           datetime                 ,#调查活动结束时间
    target_range       integer                  ,#目标对象范围(1:只允许登录用户参与，2:允许所有用户参与)
    target_type        integer                  ,#目标对象类型
    target_num         integer                  ,#目标对象人数
    reward_type        integer                  ,#奖励类型
    reward_ref         varchar(128)             ,#奖励链接
    question_count     integer       default 0  ,#调查题目数量
    qt_count_xz        integer       default 0  ,#选择题数量
    qt_count_zg        integer       default 0  ,#主观题数量
    qt_count_pf        integer       default 0  ,#评分题数量
    create_coins       integer       default 0  ,#创建调查使用金币
    answer_coins       integer       default 0  ,#回答调查奖励金币
    answer_num         integer       default 0  ,#参与答题人数
    primary key(survey_code)
) ;
create index idx_bas_survey_info__survey_code     on tb_bas_survey_info(survey_code)     ;
create index idx_bas_survey_info__survey_name     on tb_bas_survey_info(survey_name)     ;
create index idx_bas_survey_info__survey_type     on tb_bas_survey_info(survey_type)     ;
create index idx_bas_survey_info__survey_type_sub on tb_bas_survey_info(survey_type_sub) ;
create index idx_bas_survey_info__survey_class    on tb_bas_survey_info(survey_class)    ;
create index idx_bas_survey_info__survey_state    on tb_bas_survey_info(survey_state)    ;
create index idx_bas_survey_info__user_code       on tb_bas_survey_info(user_code)       ;

/********调查标签标签********/
drop table if exists tb_bas_tag_info ;
create table tb_bas_tag_info
(
	  tag_name           varchar(32)    ,#调查标签
    survey_code        integer        ,#调查编码
    survey_type        integer        ,#调查类型
    survey_type_sub    integer        ,#调查小类
    survey_trade       integer         #调查大类
) ;
create index idx_tb_bas_tag_info__survey_code     on tb_bas_tag_info(survey_code)     ;
create index idx_tb_bas_tag_info__survey_tag      on tb_bas_tag_info(tag_name)        ;
create index idx_tb_bas_tag_info__survey_type     on tb_bas_tag_info(survey_type)     ;
create index idx_tb_bas_tag_info__survey_trade    on tb_bas_tag_info(survey_trade)    ;
create index idx_tb_bas_tag_info__survey_type_sub on tb_bas_tag_info(survey_type_sub) ;

/********调查推荐信息********/
drop table if exists tb_bas_survey_recommend ;
create table tb_bas_survey_recommend
(
    survey_code         integer     ,#调查编码
    recommend_grade     integer     ,#推荐级别
    recommend_state     integer     ,#推荐状态
    recommend_number    integer     ,#推荐用户数量
    state_time          datetime     #状态时间
) ;

/********调查推荐规则********/
drop table if exists tb_bas_survey_recommend_rule ;
create table tb_bas_survey_recommend_rule
(
    survey_code       integer          ,#调查编码
    rule_key          varchar(64)      ,#推荐规则字段
    rule_logic        varchar(16)      ,#推荐规则逻辑
    rule_value        varchar(1024)    ,#推荐规则对应值
    rule_sql          varchar(1024)    ,#推荐规则对应SQL语句
    state_time        datetime          #状态时间
) ;

/********调查推荐用户清单********/
drop table if exists tb_bas_survey_recommend_user ;
create table tb_bas_survey_recommend_user
(
    survey_code        integer       ,#调查编码
    user_code          integer       ,#用户编码
    recommend_grade    integer       ,#推荐级别(由低到高)
    state_code         integer       ,#状态编码(0:失效，1:用户生成，2:已主动推荐，3:已参与)
    state_time         datetime       #状态更新时间
) ;
create index idx_sv_rec_survey_code on tb_bas_survey_recommend_user(survey_code) ;
create index idx_sv_rec_user_code   on tb_bas_survey_recommend_user(user_code) ;

/********调查统计（已废弃）********/
drop table if exists tb_bas_survey_statist ;
create table tb_bas_survey_statist
(
    survey_code     integer    ,#调查编码
    question_num    integer    ,#调查题目数量
    radio_num       integer    ,#单选题数量
    checkbox_num    integer    ,#多选题数量
    textarea_num    integer    ,#主观题数量
    create_coins    integer    ,#创建调查使用金币
    answer_coins    integer    ,#回答调查奖励金币
    answer_num      integer     #参与调查人数
) ;

/********题目详情********/
drop table if exists tb_bas_question_info ;
create table tb_bas_question_info
(
    question_code      integer       ,#题目编码
    question_name      varchar(80)   ,#题目名称	
    question_seq       integer       ,#题目序号
    survey_code        integer       ,#调查编码
    question_class     varchar(8)    ,#题目分类
    question_type      varchar(8)    ,#题目类型
    answer_must        bool          ,#是否必答题
    question_option    varchar(512)  ,#题目选项
    pf_low_value       integer       ,#评分最低分值
    pf_high_value      integer       ,#评分最高分值
    pf_low_desc        varchar(32)   ,#评分最低分描述
    pf_high_desc       varchar(32)   ,#评分最低分描述
    custom_option      integer       ,#自定义题目类型（-1:无自定义功能；>-1:有自定义功能，根据值不同限定对应的用户等级下限；0:允许所有用户）
    is_bank            integer       ,#是否属于题库(1:是；0:否)
    create_time        datetime      ,#题目创建时间
    answer_num         integer        #参与答题人数
) ;
create index idx_bas_question_info_question_code on tb_bas_question_info(question_code) ;
create index idx_bas_question_info_question_name on tb_bas_question_info(question_name) ;

/********题目选项清单********/
drop table if exists tb_bas_question_option ;
create table tb_bas_question_option	
(
    survey_code      integer      ,#调查编码
    question_code    integer      ,#题目编码
    question_class   varchar(8)   ,#题目大类
    question_type    varchar(8)   ,#题目小类
    option_code      bigint       ,#选项编码
    option_name      varchar(32)  ,#选项名称
    option_seq       integer      ,#选项序号
    option_value     integer      ,#选项值
    option_type      integer      ,#选项类型（1:普通选项；2:自定义选项）
    option_state     integer      ,#选项状态（0:无效；1:有效）
    create_user      integer      ,#选项创建用户
    create_time      datetime     ,#选项创建时间
    custom_spare     integer       #自定义选项对应备用选项编码
) ;
create index idx_bas_question_option_question_code on tb_bas_question_option(question_code) ;
create index idx_bas_question_option_survey_code on tb_bas_question_option(survey_code) ;
create index idx_bas_question_option_option_code on tb_bas_question_option(option_code) ;
create index idx_bas_question_option_option_name on tb_bas_question_option(option_name) ;


/********调查参与详情********/
drop table if exists tb_bas_survey_action ;
create table tb_bas_survey_action
(
    survey_code         integer       ,#调查编码
    user_code           integer       ,#参与用户编码
    start_time          datetime      ,#答卷开始时间
    end_time            datetime      ,#答卷结束时间
    use_times           integer       ,#答题花费时间（秒）
    get_coins           integer       ,#得到金币
    get_score           integer       ,#得到积分
    reward_type_code    varchar(8)    ,#奖励类型
    reward_is_use       integer        #奖励是否使用（0:未使用，1:已使用）
) ;
create index idx_tb_bas_survey_action__user_code   on tb_bas_survey_action(user_code) ;
create index idx_tb_bas_survey_action__survey_code on tb_bas_survey_action(survey_code) ;

/********调查答题详情********/
drop table if exists tb_bas_question_action ;
create table tb_bas_question_action
(
    user_code        integer         ,#参与用户编码
    survey_code      integer         ,#调查编码
    question_code    integer         ,#题目编码
    question_class   varchar(8)      ,#题目分类
    question_type    varchar(8)      ,#题目类型
    question_seq     integer         ,#题目序号
    option_code      bigint          ,#选项编码
    option_name      varchar(256)    ,#选项内容
    option_seq       integer         ,#选项序号
    option_type      integer         ,#选项类型（0:非选项；1:普通选项；2:自定义选项）
    option_value     integer          #选项值
) ;
create index tb_bas_question_action__user_code     on tb_bas_question_action(user_code) ;
create index tb_bas_question_action__survey_code   on tb_bas_question_action(survey_code) ;
create index tb_bas_question_action__question_code on tb_bas_question_action(question_code) ;
create index tb_bas_question_action__option_code   on tb_bas_question_action(option_code) ;

/********调查评论详情********/
drop table if exists tb_bas_survey_comment ;
create table tb_bas_survey_comment
(
    survey_code     integer     ,#调查编码
    user_code       integer     ,#评论用户编码
    comment_txt     text        ,#评论内容
    comment_time    datetime     #评论时间
) ;
create index idx_tb_bas_survey_comment__user_code   on tb_bas_survey_comment(user_code) ;
create index idx_tb_bas_survey_comment__survey_code on tb_bas_survey_comment(survey_code) ;

/********调查参与造数据用户清单（不入文档）********/
drop table if exists tb_bas_survey_action_build_user ;
create table tb_bas_survey_action_build_user
(
    user_code      integer    ,#用户编码
    survey_code    integer     #调查编码
) ;
create index tb_bas_survey_action_build_user__user_code   on tb_bas_survey_action_build_user(user_code) ;
create index tb_bas_survey_action_build_user__survey_code on tb_bas_survey_action_build_user(survey_code) ;


/********奖励信息********/
drop table if exists tb_bas_reward ;
create table tb_bas_reward
(
    gain_user_code      integer       ,#获得奖励用户编码
    grant_user_code     integer       ,#发放奖励用户编码
    survey_code         integer       ,#调查编码
    reward_type_code    varchar(8)    ,#奖励类型
    survey_code         integer        #调查编码
) ;

/********用户行为日志信息********/
drop table if exists tb_bas_user_action_log ;
create table tb_bas_user_action_log
(
    user_code       integer        ,#用户编码
    action_time     datetime       ,#行为发生时间
    action_code     integer        ,#行为编码
    action_value    integer        ,#行为值
    action_type     varchar(32)    ,#行为类型
    action_name     varchar(64)    ,#行为名称
    change_value    integer         #发生变化值
) ;
create index idx_bas_user_action_log__user_code    on tb_bas_user_action_log(user_code) ;
create index idx_bas_user_action_log__action_type  on tb_bas_user_action_log(action_type) ;
create index idx_bas_user_action_log__action_value on tb_bas_user_action_log(action_value) ;


/********用户积分日志（即将废弃功能合并到user_action_log表中）********/
drop table if exists tb_bas_score_action_log ;
create table tb_bas_score_action_log
(
    user_code       integer        ,#用户编码
    action_time     datetime       ,#行为发生时间
    action_code     integer        ,#行为编码
    action_value    integer        ,#行为值
    action_name     varchar(64)    ,#行为名称
    score_value     integer        ,#积分值
    score_logic     integer         #积分变化类型（1:增加；-1:减少）
) ;

/********用户金币日志（即将废弃功能合并到user_action_log表中）********/
drop table if exists tb_bas_coins_action_log ;
create table tb_bas_coins_action_log
(
    user_code       integer        ,#用户编码
    action_time     datetime       ,#行为发生时间
    action_code     integer        ,#行为编码
    action_value    integer        ,#行为值
    action_name     varchar(64)    ,#行为名称
    coins_value     integer        ,#金币值
    coins_logic     integer         #金币变化类型（1:增加；-1:减少）
) ;

/********自定义题库********/


/********自定义模板********/










