
insert into tb_bas_survey_info
(
    survey_code         ,#integer         ,#�ʾ����
    survey_name         ,#varchar(64)     ,#�ʾ�����
    survey_type         ,#varchar(16)     ,#�ʾ�����
    issue_nick          ,#varchar(32)     ,#�������ǳ�
    question_num         #integer         ,#��������
)
values
(
    1000001            ,#integer         ,#�ʾ����
    '�ʾ�չ�ֲ���'     ,#varchar(64)     ,#�ʾ�����
    'ͨ������'         ,#varchar(16)     ,#�ʾ�����
    '���Ϸ�'           ,#varchar(32)     ,#�������ǳ�
    8                   #integer         ,#��������
) ;

insert into tb_bas_question_info
(
    question_code       ,#integer       ,#�������
    question_name       ,#varchar(80)   ,#��������
    question_prop       ,#varchar(8)    ,#��������(1 ��ѡ�⣻2 ��ѡ�⣻3 ������)
    question_type       ,#varchar(8)    ,#�������
    is_bank             ,#integer       ,#�Ƿ��������(1���ǣ�0����)
    create_time          #datetime       #���ⴴ��ʱ��
)
values
(
    100003       ,#integer       ,#�������
    '�����ۡ�����������������'       ,#varchar(80)   ,#��������
    '3'       ,#varchar(8)    ,#��������(1 ��ѡ�⣻2 ��ѡ�⣻3 ������)
    '8888'       ,#varchar(8)    ,#�������
    1             ,#integer       ,#�Ƿ��������(1���ǣ�0����)
    current_timestamp()          #datetime       #���ⴴ��ʱ��
) ;

insert into tb_bas_survey_question
(
    survey_code           ,#integer       ,#�ʾ����
    question_serial       ,#integer       ,#�������
    question_code            #integer       ,#�������
)
values
(
    1000001           ,#integer       ,#�ʾ����
    3      ,#integer       ,#�������
    100003            #integer       ,#�������
) ;

insert into tb_bas_question_option values('����ѡ��',100003,'0') ;

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