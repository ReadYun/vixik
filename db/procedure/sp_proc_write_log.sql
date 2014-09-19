drop procedure if exists sp_proc_write_log ;
create procedure sp_proc_write_log
(
    in     proc_name    varchar(100),
    in     step_desc    varchar(100),
    in     main_para    varchar(32),
    out    erro_code    integer
)

/** head
    * @name       sp_proc_write_log
    * @caption    日志过程记录
    * @describe   过程日志处理过程（注：本过程不写日志）
    *----------------------------------------- Param In
    * @param_in   proc_name    处理过程名称
    * @param_in   step_desc    步骤描述信息
    * @param_in   main_para    主参数
    *----------------------------------------- Param Out
    * @param_out  erro_code    过程日志
    *----------------------------------------- Table Name
    * @tar_table  tb_sys_proc_write_log   过程日志日志表
    *----------------------------------------- Other Info
    * @version      1.0.000
    * @create-date  2012-2-1
    * @author       曹志赟
    * @copyright    vixik
    */

begin
	declare sqlcode integer default 0; 						     #程序状态
	declare exit handler for sqlexception ,sqlwarning,not found  #异常处理申明
	set erro_code=sqlcode;

  /**
    * description 目标表说明
    *
    #存储过程日志信息
    create table tb_sys_proc_write_log
    (
        proc_name    varchar(100)    ,#日志名称
        step_desc    varchar(100)    ,#步骤描述
        main_para    varchar(32)     ,#主要参数
        curr_time    timestamp        #当前时间
    ) ;
  **/

    insert into tb_sys_proc_write_log
    (
        proc_name    ,#日志名称
        step_desc    ,#步骤描述
        main_para    ,#主参数
        curr_time     #当前时间
    )
    values
    (
        proc_name             ,#过程名
        step_desc             ,#步骤描述
        main_para             ,#主参数
        current_timestamp()    #当前时间
    );

    set erro_code=sqlcode;

    commit;

end ;
