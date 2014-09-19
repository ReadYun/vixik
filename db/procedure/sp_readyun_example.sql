drop procedure if exists sp_readyun_example ;
create procedure sp_readyun_example
(
  in  ii_para       integer,
  out oi_statuscode integer
)
/**** ---------------------------------------- Header
    * @name       sp_readyun_example
    * @caption    过程标题
    * @describe   过程描述
    *
    * ---------------------------------------- Params
    * @param_in   ii_para        输入参数
    * @param_out  oi_statuscode  输出参数
    *
    * ---------------------------------------- Tables
    * @tar_table  tb_target_xxx  目标表名
    * @src_table  tb_source_xxx  源表名
    *
    * ---------------------------------------- Info
    * @version      1.0.000
    * @author       cao.zhiyun
    * @create-date  2012-2-1
    * @copyright    VixiK
    */

begin
  /**
    * description 定义变量*/
    declare vc_log_proc    varchar(100)         ;#过程名称
    declare vc_log_desc    varchar(100)         ;#过程日志描述
    declare vc_log_para    varchar(32)          ;#过程主参数
    declare sqlcode        integer default 0    ;#程序状态
    declare vi_flag        integer default 0    ;#调用写日志过程返回值
    declare vi_day         integer              ;#数据统计日期
    declare vi_month       integer              ;#数据统计月份
    declare vs_sql_str     varchar(500)         ;#sql字符串
    declare vs_pre_str     varchar(500)         ;#变量：预处理语句字符串
    declare vs_exe_str     varchar(500)         ;#变量：执行语句字符串
    
    /** 异常处理 **/
    declare continue handler for not found set sqlcode=0         ;#无表删除不退出
	declare exit handler for sqlexception,sqlwarning   #异常处理申明

    set oi_statuscode = sqlcode ;
    set vc_log_proc   = 'sp_readyun_example' ;
    set vc_log_para   = ii_para ;

  /**
    * description 目标表说明
    *
    ********商品类目对应关系表********
    create table tb_mid_itemcat_relation
    (
        top_cat_code     varchar(32)    ,#淘宝顶级类目编码
        low_cat_code     varchar(32)    ,#淘宝低级类目编码
        low_cat_level    integer         #淘宝低级类目级别
    ) ;
    **/

    /**记录执行日志**/
    set  vc_log_desc = '----- 0.0.开始 -----' ;
    call sp_proc_write_log(vc_log_proc, vc_log_desc, vc_log_para, vi_flag) ;
    if vi_flag != 0 then set oi_statuscode = vi_flag ;
    end if;

	loop_label: loop
	
	end loop ;

    /**记录执行日志**/
    set  vc_log_desc = '----- 结束 -----' ;
    call sp_proc_write_log(vc_log_proc, vc_log_desc, vc_log_para, vi_flag) ;
    if vi_flag != 0 then set oi_statuscode = vi_flag ;
    end if;

end ;