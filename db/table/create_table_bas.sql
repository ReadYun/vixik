
/********�û�������Ϣ********/
drop table if exists tb_bas_user_info ;
create table tb_bas_user_info
(
    user_code          integer       ,#�û�����
    user_name          varchar(16)   ,#�û�����
    user_nick          varchar(32)   ,#�û��ǳ�
    user_pwd           varchar(32)   ,#�û�����
    user_email         varchar(64)   ,#�û�����
    user_type          integer       ,#�û�����
    user_photo         integer       ,#�û�ͷ��0:��ͷ��1:��ͷ��
    image_href         varchar(128)  ,#ͷ���ַ
    create_time        datetime      ,#ע��ʱ��
    create_ip          varchar(16)   ,#ע��IP
    area_province      integer       ,#ʡ������
    area_city          integer       ,#�м�����
    user_birthday      date          ,#�û�����
    birth_year         integer       ,#�������
    birth_month        integer       ,#�����·�
    birth_day          integer       ,#��������
    user_age           integer       ,#�û�����
    user_sex           integer       ,#�û��Ա�
    user_career        integer       ,#�û�ְҵ
    industry_class     integer       ,#������ҵ����
    industry_sub       integer       ,#������ҵС��
    income_class       integer       ,#�û�����
    income_section     integer       ,#�û���������
    user_edu           integer       ,#�û�ѧ��
    user_desc          varchar(256)  ,#�û����
    identity_card      varchar(18)   ,#����֤
    sure_name          varchar(16)   ,#�û�����
    user_address       varchar(256)  ,#�û�סַ
    mobile_phone       varchar(32)   ,#�ֻ�����
    fix_phone          varchar(32)   ,#�̶��绰
    web_site           varchar(128)  ,#�û���վ
    weibo_href         varchar(128)  ,#΢����ַ
    weibo_type         varchar(16)   ,#΢������
    user_qq            integer       ,#��ѶQQ
    user_ww            varchar(64)   ,#��������
    user_msn           varchar(64)   ,#MSN
	  user_character     varchar(64)   ,#�����Ը�
    user_affection     varchar(64)   ,#�������
    user_stature       varchar(64)   ,#��������
    user_hobby         varchar(64)   ,#���˰���
    user_desc          varchar(256)  ,#�û����
    interest_survey    varchar(32)   ,#����Ȥ��������
    interest_reward    varchar(32)   ,#����Ȥ��������
    interest_prize     varchar(32)   ,#����Ȥ��Ʒ����
    primary key(user_code)
) ;
create index idx_bas_user_info__user_code     on tb_bas_user_info(user_code) ;
create index idx_bas_user_info__user_name     on tb_bas_user_info(user_name) ;
create index idx_bas_user_info__user_age      on tb_bas_user_info(user_age) ;
create index idx_bas_user_info__area_province on tb_bas_user_info(area_province) ;
create index idx_bas_user_info__area_city     on tb_bas_user_info(area_city) ;
create index idx_bas_user_info__user_edu      on tb_bas_user_info(user_edu) ;
create index idx_bas_user_info__user_career   on tb_bas_user_info(user_career) ;

/********�û���չ��Ϣ********/
drop table if exists tb_bas_user_extend_info ;
create table tb_bas_user_extend_info
(
    user_code         integer         ,#�û�����
	  user_character    varchar(64)     ,#�����Ը�
    user_affection    varchar(64)     ,#�������
    user_stature      varchar(64)     ,#��������
    user_hobby        varchar(64)     ,#���˰���
    user_desc         varchar(256)    ,#�û����
    primary key(user_code)
) ;
create index idx_bas_user_extend_info_user_code on tb_bas_user_extend_info(user_code) ;

/********�û��˻���Ϣ********/
drop table if exists tb_bas_user_accout ;
create table tb_bas_user_accout
(
    user_code       integer    ,#�û�����
    user_score      integer    ,#�û�����
    user_level      integer    ,#�û�����
    user_coins      integer    ,#�û����
    login_time      datetime   ,#�ϴε�¼ʱ��
    publish_times   integer    ,#�����������
    answer_times    integer     #����������
) ;
create index idx_bas_user_accout_code on tb_bas_user_accout(user_code) ;

/********�û���Ȥ��Ϣ********/
drop table if exists tb_bas_user_interest ;
create table tb_bas_user_interest
(
    user_code      integer        ,#�û�����
    survey_type    varchar(32)    ,#����Ȥ��������
    reward_type    varchar(32)    ,#����Ȥ��������
    prize_type     varchar(32)     #����Ȥ��Ʒ����
) ;

/********�û���ע�û���Ϣ********/
drop table if exists tb_bas_user_follow_user ;
create table tb_bas_user_follow_user
(
    user_code       integer     ,#���û�����
    follow_code     integer     ,#��ע�û�����
    follow_time     datetime    ,#��עʱ��
    follow_state    integer      #��ע״̬(0:��Ч��1:��Ч)
) ;
create index idx_tb_bas_user_follow_user__user_code   on tb_bas_user_follow_user(user_code) ;
create index idx_tb_bas_user_follow_user__follow_code on tb_bas_user_follow_user(follow_code) ;

/********�û���ע������Ϣ********/
drop table if exists tb_bas_user_follow_survey ;
create table tb_bas_user_follow_survey
(
    user_code       integer     ,#���û�����
    follow_code     integer     ,#��ע�û�����
    follow_time     datetime    ,#��עʱ��
    follow_state    integer      #��ע״̬(0:��Ч��1:��Ч)
) ;
create index idx_tb_bas_user_follow_survey__user_code   on tb_bas_user_follow_survey(user_code) ;
create index idx_tb_bas_user_follow_survey__follow_code on tb_bas_user_follow_survey(follow_code) ;

/********�û���ע��������********/
drop table if exists tb_bas_user_follow_svtype ;
create table tb_bas_user_follow_svtype
(
    user_code       integer     ,#���û�����
    svtype_sub      integer     ,#��ע����������
    svtype_main     integer     ,#��ע����С�����
    follow_time     datetime     #��עʱ��
) ;
create index idx_tb_bas_user_follow_svtype__user_code  on tb_bas_user_follow_svtype(user_code) ;
create index idx_tb_bas_user_follow_svtype__svtype_sub on tb_bas_user_follow_svtype(svtype_sub) ;

/********�û�����������Ϣ********/
drop table if exists tb_bas_user_share_survey ;
create table tb_bas_user_share_survey
(
    user_code      integer       ,#���û�����
    share_type     integer       ,#������ʽ
    share_code     integer       ,#�����������
    share_desc     varchar(512)  ,#��������
    follow_time    datetime       #����ʱ��
) ;

/********���������Ϣ********/
drop table if exists tb_bas_survey_info ;
create table tb_bas_survey_info
(
    survey_code        integer not null  ,#�������
    survey_name        varchar(64)       ,#��������
    survey_desc        varchar(256)      ,#����˵��
    survey_type        integer           ,#��������
    survey_type_sub    integer           ,#����С��
    survey_class       integer           ,#�������
    survey_state       integer           ,#����״̬
    create_step        integer           ,#�����׶�(0:��ɣ�1:�׶�һ��2:�׶ζ���....)
    user_code          integer           ,#�û�����
    user_nick          varchar(32)       ,#�û��ǳ�
    answer_flow        integer           ,#��������(1:�嵥չʾ������Ŀ��2:���ش����չʾ��Ŀ)
    is_template        integer           ,#�Ƿ���Ϊģ��(1:�ǣ�0:��)
    recomm_type        integer           ,#�Ƽ���־(0:���Ƽ���1:ϵͳ�Ƽ���2:�Զ����Ƽ�)
    recomm_grade       integer           ,#�����Ƽ�����
    create_time        datetime          ,#���鴴��ʱ��
    state_time         datetime          ,#����״̬����ʱ��
    start_time         datetime          ,#������ʼʱ��
    end_time           datetime          ,#��������ʱ��
    target_range       integer           ,#Ŀ�����Χ(1:ֻ������¼�û����룬2:���������û�����)
    target_type        integer           ,#Ŀ���������
    target_num         integer           ,#Ŀ���������
    reward_type        integer           ,#��������
    reward_ref         varchar(128)      ,#��������
    question_num       integer           ,#������Ŀ����
    radio_num          integer           ,#��ѡ������
    checkbox_num       integer           ,#��ѡ������
    textarea_num       integer           ,#����������
    create_coins       integer           ,#��������ʹ�ý��
    answer_coins       integer           ,#�ش���齱�����
    answer_num         integer           ,#�����������
    primary key(survey_code)
) ;
create index idx_bas_survey_info_survey_code  on tb_bas_survey_info(survey_code) ;
create index idx_bas_survey_info_survey_name  on tb_bas_survey_info(survey_name) ;
create index idx_bas_survey_info_survey_type  on tb_bas_survey_info(survey_type) ;
create index idx_bas_survey_info_survey_class on tb_bas_survey_info(survey_class) ;
create index idx_bas_survey_info_survey_state on tb_bas_survey_info(survey_state) ;

/********�����Ƽ���Ϣ********/
drop table if exists tb_bas_survey_recommend ;
create table tb_bas_survey_recommend
(
    survey_code         integer     ,#�������
    recommend_grade     integer     ,#�Ƽ�����
    recommend_state     integer     ,#�Ƽ�״̬
    recommend_number    integer     ,#�Ƽ��û�����
    state_time          datetime     #״̬ʱ��
) ;

/********�����Ƽ�����********/
drop table if exists tb_bas_survey_recommend_rule ;
create table tb_bas_survey_recommend_rule
(
    survey_code       integer          ,#�������
    rule_key          varchar(64)      ,#�Ƽ������ֶ�
    rule_logic        varchar(16)      ,#�Ƽ������߼�
    rule_value        varchar(1024)    ,#�Ƽ������Ӧֵ
    rule_sql          varchar(1024)    ,#�Ƽ������ӦSQL���
    state_time        datetime          #״̬ʱ��
) ;

/********�����Ƽ��û��嵥********/
drop table if exists tb_bas_survey_recommend_user ;
create table tb_bas_survey_recommend_user
(
    survey_code        integer       ,#�������
    user_code          integer       ,#�û�����
    recommend_grade    integer       ,#�Ƽ�����(�ɵ͵���)
    state_code         integer       ,#״̬����(0:ʧЧ��1:�û����ɣ�2:�������Ƽ���3:�Ѳ���)
    state_time         datetime       #״̬����ʱ��
) ;
create index idx_sv_rec_survey_code on tb_bas_survey_recommend_user(survey_code) ;
create index idx_sv_rec_user_code   on tb_bas_survey_recommend_user(user_code) ;

/********����ͳ��********/
drop table if exists tb_bas_survey_statist ;
create table tb_bas_survey_statist
(
    survey_code     integer    ,#�������
    question_num    integer    ,#������Ŀ����
    radio_num       integer    ,#��ѡ������
    checkbox_num    integer    ,#��ѡ������
    textarea_num    integer    ,#����������
    create_coins    integer    ,#��������ʹ�ý��
    answer_coins    integer    ,#�ش���齱�����
    answer_num      integer     #�����������
) ;

/********��Ŀ����********/
drop table if exists tb_bas_question_info ;
create table tb_bas_question_info
(
    question_code      integer       ,#��Ŀ����
    question_name      varchar(80)   ,#��Ŀ����
    question_seq       integer       ,#��Ŀ���
    survey_code        integer       ,#�������
    question_type      varchar(8)    ,#��Ŀ����
    question_class     varchar(8)    ,#��Ŀ����
    question_option    varchar(512)  ,#��Ŀѡ��
    custom_option      integer       ,#�Զ�����Ŀ���ͣ�-1:���Զ��幦�ܣ�>-1:���Զ��幦�ܣ�����ֵ��ͬ�޶���Ӧ���û��ȼ����ޣ�0:���������û���
    is_bank            integer       ,#�Ƿ��������(1:�ǣ�0:��)
    create_time        datetime       #��Ŀ����ʱ��
) ;
create index idx_bas_question_info_question_code on tb_bas_question_info(question_code) ;
create index idx_bas_question_info_question_name on tb_bas_question_info(question_name) ;

/********��Ŀѡ���嵥********/
drop table if exists tb_bas_question_option ;
create table tb_bas_question_option	
(
    survey_code      integer      ,#�������
    question_code    integer      ,#��Ŀ����
    question_type    varchar(8)   ,#��Ŀ����
    option_code      integer      ,#ѡ�����
    option_name      varchar(32)  ,#ѡ������
    option_seq       integer      ,#ѡ�����
    option_type      integer      ,#ѡ�����ͣ�1:��ͨѡ�2:�Զ���ѡ�
    option_state     integer      ,#ѡ��״̬��0:��Ч��1:��Ч��
    create_user      integer      ,#ѡ����û�
    create_time      datetime     ,#ѡ���ʱ��
    custom_spare     integer       #�Զ���ѡ���Ӧ����ѡ�����
) ;
create index idx_bas_question_option_question_code on tb_bas_question_option(question_code) ;
create index idx_bas_question_option_survey_code on tb_bas_question_option(survey_code) ;
create index idx_bas_question_option_option_name on tb_bas_question_option(option_name) ;


/********�����������********/
drop table if exists tb_bas_survey_action ;
create table tb_bas_survey_action
(
    survey_code         integer       ,#�������
    user_code           integer       ,#�����û�����
    start_time          datetime      ,#�����ʼʱ��
    end_time            datetime      ,#�������ʱ��
    use_times           integer       ,#���⻨��ʱ�䣨�룩
    get_coins           integer       ,#�õ����
    get_score           integer       ,#�õ�����
    reward_type_code    varchar(8)    ,#��������
    reward_is_use       integer        #�����Ƿ�ʹ�ã�0:δʹ�ã�1:��ʹ�ã�
) ;
create index idx_tb_bas_survey_action__user_code   on tb_bas_survey_action(user_code) ;
create index idx_tb_bas_survey_action__survey_code on tb_bas_survey_action(survey_code) ;

/********�����������********/
drop table if exists tb_bas_question_action ;
create table tb_bas_question_action
(
    user_code        integer         ,#�����û�����
    survey_code      integer         ,#�������
    question_code    integer         ,#��Ŀ����
    question_type    varchar(8)      ,#��Ŀ����(radio:��ѡ�⣻checkbox:��ѡ�⣻textarea:������)
    question_seq     integer         ,#��Ŀ���
    option_code      integer         ,#ѡ�����
    option_name      varchar(256)    ,#ѡ������
    option_seq       integer         ,#ѡ�����
    option_type      integer          #ѡ�����ͣ�1:��ͨѡ�2:�Զ���ѡ�
) ;
create index tb_bas_question_action__user_code   on tb_bas_question_action(user_code) ;
create index tb_bas_question_action__survey_code on tb_bas_question_action(survey_code) ;

drop idx_bsqa_user on tb_bas_question_action ;
drop idx_bsqa_survey on tb_bas_question_action ;

/********��������������û��嵥�������ĵ���********/
drop table if exists tb_bas_survey_action_build_user ;
create table tb_bas_survey_action_build_user
(
    user_code      integer    ,#�û�����
    survey_code    integer     #�������
) ;
create index tb_bas_survey_action_build_user__user_code   on tb_bas_survey_action_build_user(user_code) ;
create index tb_bas_survey_action_build_user__survey_code on tb_bas_survey_action_build_user(survey_code) ;


/********������Ϣ********/
drop table if exists tb_bas_reward ;
create table tb_bas_reward
(
    gain_user_code      integer       ,#��ý����û�����
    grant_user_code     integer       ,#���Ž����û�����
    survey_code         integer       ,#�������
    reward_type_code    varchar(8)    ,#��������
    survey_code         integer        #�������
) ;

/********�û���Ϊ��־��Ϣ********/
drop table if exists tb_bas_user_action_log ;
create table tb_bas_user_action_log
(
    user_code       integer        ,#�û�����
    action_time     datetime       ,#��Ϊ����ʱ��
    action_code     integer        ,#��Ϊ����
    action_value    integer        ,#��Ϊֵ
    action_type     varchar(32)    ,#��Ϊ����
    action_name     varchar(64)    ,#��Ϊ����
    change_value    integer         #�����仯ֵ
) ;
create index idx_bas_user_action_log__user_code    on tb_bas_user_action_log(user_code) ;
create index idx_bas_user_action_log__action_type  on tb_bas_user_action_log(action_type) ;
create index idx_bas_user_action_log__action_value on tb_bas_user_action_log(action_value) ;


/********�û�������־�������������ܺϲ���user_action_log���У�********/
drop table if exists tb_bas_score_action_log ;
create table tb_bas_score_action_log
(
    user_code       integer        ,#�û�����
    action_time     datetime       ,#��Ϊ����ʱ��
    action_code     integer        ,#��Ϊ����
    action_value    integer        ,#��Ϊֵ
    action_name     varchar(64)    ,#��Ϊ����
    score_value     integer        ,#����ֵ
    score_logic     integer         #���ֱ仯���ͣ�1:���ӣ�-1:���٣�
) ;

/********�û������־�������������ܺϲ���user_action_log���У�********/
drop table if exists tb_bas_coins_action_log ;
create table tb_bas_coins_action_log
(
    user_code       integer        ,#�û�����
    action_time     datetime       ,#��Ϊ����ʱ��
    action_code     integer        ,#��Ϊ����
    action_value    integer        ,#��Ϊֵ
    action_name     varchar(64)    ,#��Ϊ����
    coins_value     integer        ,#���ֵ
    coins_logic     integer         #��ұ仯���ͣ�1:���ӣ�-1:���٣�
) ;

/********�Զ������********/


/********�Զ���ģ��********/









