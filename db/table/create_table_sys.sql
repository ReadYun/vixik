
/********存储过程日志信息********/
drop table if exists tb_sys_proc_write_log ;
create table tb_sys_proc_write_log
(
    proc_name    varchar(100)    ,#日志名称
    step_desc    varchar(100)    ,#步骤描述
    main_para    varchar(32)     ,#基础参数
  	curr_time    timestamp        #当前时间
) ;

/********随机值生成表********/
drop table if exists tb_sys_random_value ;
create table tb_sys_random_value
(
    random_str    varchar(10)     ,#随机字符串
    random_num    integer         ,#随机字符串
  	random_time   timestamp        #随机时间
) ;

/********DATA_ADD函数type参数列表********/
drop table if exists tb_sys_date_add_type ;
create table tb_sys_date_add_type
(
    type_seq     integer        ,#参数序号
    type_val     varchar(20)     #参数值
) ;

/********接口参数校验规则********/
drop table if exists tb_api_param_check_config ;
create table tb_api_param_check_config
(
    api_name     varchar(128)  ,#接口名称
    param_name   varchar(64)   ,#接口参数名称
    param_type   varchar(16)   ,#接口参数类型
    param_must   integer        #接口参数是否必须
) ;





