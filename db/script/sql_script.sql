
insert into tb_bas_survey_info
(
    survey_code         ,#integer         ,#问卷编码
    survey_name         ,#varchar(64)     ,#问卷名称
    survey_type         ,#varchar(16)     ,#问卷类型
    issue_nick          ,#varchar(32)     ,#发布者昵称
    question_num         #integer         ,#问题数量
)
values
(
    1000001            ,#integer         ,#问卷编码
    '问卷展现测试'     ,#varchar(64)     ,#问卷名称
    '通用类型'         ,#varchar(16)     ,#问卷类型
    '草上飞'           ,#varchar(32)     ,#发布者昵称
    8                   #integer         ,#问题数量
) ;

insert into tb_bas_question_info
(
    question_code       ,#integer       ,#问题编码
    question_name       ,#varchar(80)   ,#问题名称
    question_prop       ,#varchar(8)    ,#问题属性(1 单选题；2 多选题；3 主观题)
    question_type       ,#varchar(8)    ,#问题分类
    is_bank             ,#integer       ,#是否属于题库(1：是；0：否)
    create_time          #datetime       #问题创建时间
)
values
(
    100003       ,#integer       ,#问题编码
    '【主观】您今天活得潇洒不？'       ,#varchar(80)   ,#问题名称
    '3'       ,#varchar(8)    ,#问题属性(1 单选题；2 多选题；3 主观题)
    '8888'       ,#varchar(8)    ,#问题分类
    1             ,#integer       ,#是否属于题库(1：是；0：否)
    current_timestamp()          #datetime       #问题创建时间
) ;

insert into tb_bas_survey_question
(
    survey_code           ,#integer       ,#问卷编码
    question_serial       ,#integer       ,#问题序号
    question_code            #integer       ,#问题编码
)
values
(
    1000001           ,#integer       ,#问卷编码
    3      ,#integer       ,#问题序号
    100003            #integer       ,#问题编码
) ;

insert into tb_bas_question_option values('主观选项',100003,'0') ;

select
    a.survey_name ,
    c.question_name ,
    c.question_prop ,
    d.option_name ,
    d.order_id
from tb_bas_survey_info a , tb_bas_survey_question b ,
     tb_bas_question_info c , tb_bas_question_option d
where a.survey_code=b.survey_code
and b.question_code=c.question_code
and c.question_code=d.question_code
order by b.question_serial , d.order_id ;