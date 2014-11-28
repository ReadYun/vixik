
/********�洢������־��Ϣ********/
drop table if exists tb_sys_proc_write_log ;
create table tb_sys_proc_write_log
(
    proc_name    varchar(100)    ,#��־����
    step_desc    varchar(100)    ,#��������
    main_para    varchar(32)     ,#��������
  	curr_time    timestamp        #��ǰʱ��
) ;

/********���ֵ���ɱ�********/
drop table if exists tb_sys_random_value ;
create table tb_sys_random_value
(
    random_str    varchar(10)     ,#����ַ���
    random_num    integer         ,#����ַ���
  	random_time   timestamp        #���ʱ��
) ;

/********DATA_ADD����type�����б�********/
drop table if exists tb_sys_date_add_type ;
create table tb_sys_date_add_type
(
    type_seq     integer        ,#�������
    type_val     varchar(20)     #����ֵ
) ;

/********�ӿڲ���У�����********/
drop table if exists tb_api_param_check_config ;
create table tb_api_param_check_config
(
    api_name     varchar(128)  ,#�ӿ�����
    param_name   varchar(64)   ,#�ӿڲ�������
    param_type   varchar(16)   ,#�ӿڲ�������
    param_must   integer        #�ӿڲ����Ƿ����
) ;

/********ҳ��·����Ϣ����********/
drop table if exists tb_sys_page_path_config ;
create table tb_sys_page_path_config
(
    path_code     integer        ,#·������
    path_name     varchar(32)    ,#·������
    path_value    varchar(32)    ,#·��ֵ
    path_parent   integer        ,#·���ϼ�����
    url_param     varchar(32)    ,#·��URL��������
    table_name    varchar(32)    ,#·����Ӧ������
    key_input     varchar(32)    ,#·�������ֶ���
    key_output    varchar(32)     #·������ֶ���
) ;





