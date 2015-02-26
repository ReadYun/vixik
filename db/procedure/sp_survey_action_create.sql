drop procedure if exists sp_survey_action_create_random ;
create procedure sp_survey_action_create_random
(
  in   ii_survey_code  integer,
  in   ii_user_num     integer,
  out  oi_statuscode   integer
)
/**** ------------------------------ Header
    * @name       sp_survey_action_create_random
    * @caption    造数据：调查参与情况信息数据生成（随机数据）
    * @describe   输入调查编码生成一定数量的用户参与调查数据
    *
    * ------------------------------ Params
    * @param_in   ii_survey_code  integer  调查编码
    * @param_in   ii_user_num     integer  要生成的用户数量
    * @param_out  oi_statuscode   integer  输出状态
    *
    * ------------------------------ Tables
    * @tar_table  tb_bas_survey_action             目标表：调查参与详情
    * @tar_table  tb_bas_question_action           目标表：调查答题详情
    * @src_table  tb_bas_survey_action_build_user    源表：调查参与造数据用户清单
    * @src_table  tb_bas_question_option             源表：调查题目选项详情
    * @src_table  tb_bas_survey_info                 源表：调查基本信息
    *
    * ------------------------------ Info
    * @version      1.0.000
    * @author       cao.zhiyun
    * @create-date  2015-1-22
    * @copyright    VixiK
    */

begin
    /** 
      * 变量声明：
      * 过程总变量：pi_pc_  过程内部变量：vi_vc_
      */    
    declare pc_log_proc         varchar(100)         ;#过程名称
    declare pc_log_desc         varchar(100)         ;#过程日志描述
    declare pc_log_para         varchar(32)          ;#过程主参数
    declare pi_flag             integer default 0    ;#过程调用返回值
    declare pi_sqlcode          integer default 0    ;#过程状态编码
    declare vi_cur_option       integer default 0    ;#变量：游标cur_option标志位
    declare vi_question_code    integer              ;#变量：题目编码
    declare vc_question_class   varchar(8)           ;#变量：题目大类
    declare vc_question_type    varchar(8)           ;#变量：题目小类
    declare vi_option_code      integer              ;#变量：选项编码
    declare vc_option_name      varchar(32)          ;#变量：选项名称
    declare vi_option_seq       integer              ;#变量：选项序号
    declare vi_option_type      integer              ;#变量：选项类型
    declare vi_option_value     integer              ;#变量：选项值
    declare vi_limit_a          integer              ;#变量：limit_a
    declare vi_limit_b          integer              ;#变量：limit_b
    declare vi_option_cnt       integer              ;#变量：选项计数器
    declare vi_user_rate        integer              ;#变量：选项计数器
    
    /** 
      * 游标定义：
      * 从单选题和单项评分题开始，选择选项最多的一道题目，以其下对应的选项作为游标目标
      */    
    declare cur_option cursor for 
    select 
        question_code   ,#题目编码
        question_class  ,#题目大类
        question_type   ,#题目小类
        option_code     ,#选项编码
        option_name     ,#选项名称
        option_seq      ,#选项序号
        option_type     ,#选项类型
        option_value     #选项值
    from tb_bas_question_option x1 where exists(
        select question_code from (
            select question_code, count(1) count 
            from tb_bas_question_option
            where survey_code = ii_survey_code 
            and option_state = 1 and question_type in('11', '31')
            group by question_code 
            order by count desc limit 1) x2
        where x1.question_code = x2.question_code) 
    order by rand() ;
    
    /** 游标完成后标志位处理声明 **/
    declare continue handler for not found set vi_cur_option = 1 ;
    
    /** 其他异常处理声明 **/
    declare exit handler for sqlexception,sqlwarning
    
    /** 变量初始化 **/
    set oi_statuscode = pi_sqlcode                       ;#状态返回值
    set pc_log_para   = ii_survey_code                   ;#过程主要参数（用于写日志）
    set vi_limit_a    = ii_user_num                      ;#limit参数	
    set pc_log_proc   = 'sp_survey_action_create_random' ;#过程名称

    /**
      * description 目标表说明
      *
    ##调查参与详情
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
      
    ##调查题目参与详情
	  create table tb_bas_question_action
	  (
  	  	user_code        integer         ,#参与用户编码
  	  	survey_code      integer         ,#调查编码
  	  	question_code    integer         ,#题目编码
  	  	question_type    varchar(8)      ,#题目类型（同调查类型）
  	  	question_seq     integer         ,#题目序号
        option_code      integer         ,#选项编码
  	  	option_name      varchar(256)    ,#选择选项内容
  	  	option_seq       integer         ,#选项序号
  	  	option_type      integer         ,#选项类型（0:非选项；1:普通选项；2:自定义选项）
  	  	option_value     integer          #选项值
	  ) ;
    **/
      
    ##临时表：做多选题目参与内容临时中转
	  drop table if exists tb_tmp_question_action ;
	  create temporary table tb_tmp_question_action
	  (
        user_code        integer         ,#参与用户编码
        survey_code      integer         ,#调查编码
        question_code    integer         ,#题目编码
        question_class   varchar(8)      ,#题目大类
        question_type    varchar(8)      ,#题目小类
        question_seq     integer         ,#题目序号
        option_code      integer         ,#选项编码
        option_name      varchar(256)    ,#选择选项内容
        option_seq       integer         ,#选项序号
        option_type      integer         ,#选项类型
        option_value     integer          #选项值
	  ) ;
	  create index idx_tb_tmp_question_action__user_code on tb_tmp_question_action(user_code) ;
	  
    ##临时表：临时存储user_code
	  drop table if exists tb_tmp_user_list ;
	  create temporary table tb_tmp_user_list
	  (
        user_code        integer         #参与用户编码
	  ) ;
	  create index idx_tb_tmp_user_list__user_code on tb_tmp_user_list(user_code) ;

    set  pc_log_desc = '0.0. 开始' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;

    set  pc_log_desc = '0.1. 重跑处理' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;

    ##删除调查参与详情表数据
    if exists (
        select * from tb_bas_survey_action where survey_code = ii_survey_code limit 1)
    then
        delete from tb_bas_survey_action where survey_code = ii_survey_code ;
    end if;
    
    ##删除题目参与详情表数据
    if exists (
        select * from tb_bas_question_action where survey_code = ii_survey_code limit 1)
    then
        delete from tb_bas_question_action where survey_code = ii_survey_code ;
    end if;

    set  pc_log_desc = '1.0. 单选题参与数据生成' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;
        
    set  pc_log_desc = '1.1. 单选：打开游标' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;

    open cur_option ;
    
    loop_cur: loop
    
        /** 取游标当前数据给变量 **/
        fetch cur_option into
            vi_question_code    ,#变量：题目编码
            vc_question_class   ,#变量：题目大类
            vc_question_type    ,#变量：题目小类
            vi_option_code      ,#变量：选项编码
            vc_option_name      ,#变量：选项名称
            vi_option_seq       ,#变量：选项序号
            vi_option_type      ,#变量：选项小类
            vi_option_value      #变量：选项值
		    ;
		
        /** 
          * 抽取目标用户数定义
          * 从剩余用户数中按随机比例取一个数作为要抽取的用户数，如果游标已经到底，把剩余的用户数全部给最后一次的选项
          *
          */
        if vi_cur_option 
        then 
            set vi_limit_b = vi_limit_a ;
        else 
            select ceil(rand()*vi_limit_a) into vi_limit_b ;
        end if ;
    
        /** 游标指定的选项和之前定义好的用户数量做笛卡尔积匹配生成数据插入目标表（题目参与详情表） **/
        insert into tb_bas_question_action
        (
            user_code        ,#参与用户编码
            survey_code      ,#调查编码
            question_code    ,#题目编码
            question_class   ,#题目大类
            question_type    ,#题目小类
            option_code      ,#选项编码
            option_name      ,#选项内容
            option_seq       ,#选项序号
            option_type      ,#选项类型
            option_value      #选项值
        )
        select 
            user_code          ,#参与用户编码
            ii_survey_code     ,#调查编码
            vi_question_code   ,#题目编码
            vc_question_class  ,#题目大类
            vc_question_type   ,#题目小类
            vi_option_code     ,#选项编码
            vc_option_name     ,#选项内容
            vi_option_seq      ,#选项序号
            vi_option_type     ,#选项类型
            vi_option_value     #选项值
        from tb_bas_survey_action_build_user 
        where user_code not in (
            select user_code from tb_bas_question_action where survey_code = ii_survey_code)
        order by rand() limit vi_limit_b ;
        
        /** 重新计算剩余的目标用户数 **/ 
        select ii_user_num - count(distinct user_code) into vi_limit_a
        from tb_bas_question_action where survey_code = ii_survey_code ;
        
        /** 对当前匹配余下的单选题目选项 **/
        insert into tb_bas_question_action
        (
            user_code        ,#参与用户编码
            survey_code      ,#调查编码
            question_code    ,#题目编码
            question_class   ,#题目大类
            question_type    ,#题目小类
            option_code      ,#选项编码
            option_name      ,#选项内容
            option_seq       ,#选项序号
            option_type      ,#选项类型
            option_value      #选项值
        )
        select 
            x1.user_code       ,#参与用户编码
            x2.survey_code     ,#调查编码
            x2.question_code   ,#题目编码
            x2.question_class  ,#题目大类
            x2.question_type   ,#题目小类
            x2.option_code     ,#选项编码
            x2.option_name     ,#选项内容
            x2.option_seq      ,#选项序号
            x2.option_type     ,#选项类型
            x2.option_value     #选项值
        from (
            select user_code from tb_bas_question_action where option_code = vi_option_code) x1, (
            select * from (
               select * from tb_bas_question_option
               where survey_code = ii_survey_code
               and option_state = 1 and question_type in('11', '31') and question_code <> vi_question_code 
               order by rand()) a 
            group by question_code) x2 ;
		
		    /** 循环是否结束判定（标志位有效说明已触发no found，游标已到底） **/
        if vi_cur_option then leave loop_cur ;
        end if ;
    
    end loop ;

    set  pc_log_desc = '1.2. 单选：关闭游标' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;

    close cur_option ;
    
    set  pc_log_desc = '2.0. 多选题参与数据生成' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;
        
    select count(1)*2 into vi_option_cnt
    from tb_bas_question_option where question_code in (
        select question_code from (
            select question_code, count(1) count from tb_bas_question_option 
            where survey_code = ii_survey_code and question_type = '12'
            group by question_code order by count desc limit 1) a) ;
            
    loop_checkbox: loop
    	
    	select ceil(count(1)/vi_option_cnt) into vi_user_rate
    	from tb_bas_survey_action_build_user where survey_code = ii_survey_code ;
    	
        if vi_option_cnt
        then
            /** 
              * 从题目选项表中按题目分组随机选一选项与用户列表做笛卡尔积匹配生成数据插入目标表（题目参与详情表）
              * 因为不能对临时表查询的同时做更新操作（ERROR 1137 (HY000): Can't reopen table: 'tb_tmp_question_action'）
              * 所以分步处理
              * 一步搞定语句保留等未来版本支持此类操作再满血复活
              insert into tb_tmp_question_action
              (
                  user_code        ,#参与用户编码
                  survey_code      ,#调查编码
                  question_code    ,#题目编码
                  question_type    ,#题目类型
                  option_code      ,#选项编码
                  option_name      ,#选项内容
                  option_seq       ,#选项序号
                  option_type       #选项类型
              )
              select 
                  x1.user_code       ,#参与用户编码
                  x2.survey_code     ,#调查编码
                  x2.question_code   ,#题目编码
                  x2.question_type   ,#题目类型
                  x2.option_code     ,#选项编码
                  x2.option_name     ,#选项内容
                  x2.option_seq      ,#选项序号
                  x2.option_type      #选项类型
              from (
                  select user_code from tb_bas_survey_action_build_user a1
                  where survey_code = ii_survey_code and not exists(
                      select user_code from tb_tmp_question_action a2 
                      where a1.user_code = a2.user_code)
                  limit vi_user_rate) x1, (
                  select * from (
                      select * from tb_bas_question_option 
                      where survey_code = ii_survey_code and question_type = 'checkbox' and option_state = 1 
                      order by rand()) b1 group by question_code ) x2 ;
              *************************************************************/          
                    
            /** 先取目标用户放到临时表中 **/
            delete from tb_tmp_user_list ;
            insert into tb_tmp_user_list
            select user_code from tb_bas_survey_action_build_user a
            where survey_code = ii_survey_code and not exists(
                select user_code from tb_tmp_question_action b
                where a.user_code = b.user_code)
            limit vi_user_rate ;
            
            /** 再汇总数据插入到目标表中 **/
            insert into tb_tmp_question_action
            (
                user_code        ,#参与用户编码
                survey_code      ,#调查编码
                question_code    ,#题目编码
                question_class   ,#题目大类
                question_type    ,#题目小类
                option_code      ,#选项编码
                option_name      ,#选项内容
                option_seq       ,#选项序号
                option_type      ,#选项类型
                option_value      #选项值
            )
            select 
                x1.user_code       ,#参与用户编码
                x2.survey_code     ,#调查编码
                x2.question_code   ,#题目编码
                x2.question_class  ,#题目大类
                x2.question_type   ,#题目小类
                x2.option_code     ,#选项编码
                x2.option_name     ,#选项内容
                x2.option_seq      ,#选项序号
                x2.option_type     ,#选项类型
                x2.option_value     #选项值
            from (
                select user_code from tb_tmp_user_list) x1, (
                select * from (
                    select * from tb_bas_question_option 
                    where survey_code = ii_survey_code and question_type = '12' and option_state = 1 
                    order by rand()) a group by question_code ) x2 ;
            
            /** 标志位倒计数 **/ 
            set vi_option_cnt = vi_option_cnt - 1 ;
        else
            insert into tb_bas_question_action
            (
                user_code        ,#参与用户编码
                survey_code      ,#调查编码
                question_code    ,#题目编码
                question_class   ,#题目大类
                question_type    ,#题目小类
                option_code      ,#选项编码
                option_name      ,#选项内容
                option_seq       ,#选项序号
                option_type      ,#选项类型
                option_value      #选项值
            )
            select distinct 
                user_code        ,#参与用户编码
                survey_code      ,#调查编码
                question_code    ,#题目编码
                question_class   ,#题目大类
                question_type    ,#题目小类
                option_code      ,#选项编码
                option_name      ,#选项内容
                option_seq       ,#选项序号
                option_type      ,#选项类型
                option_value      #选项值
            from tb_tmp_question_action ;
            
            leave loop_checkbox ;
        end if ;        
        
    end loop ;
    
    set  pc_log_desc = '3.0. 多项评分题参与数据生成' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;
    
    /** 汇总数据插入到目标表中 **/
    insert into tb_bas_question_action
    (
        user_code        ,#参与用户编码
        survey_code      ,#调查编码
        question_code    ,#题目编码
        question_class   ,#题目大类
        question_type    ,#题目小类
        option_code      ,#选项编码
        option_name      ,#选项内容
        option_seq       ,#选项序号
        option_type      ,#选项类型
        option_value      #选项值
    )
		select 
		    t1.user_code      ,#参与用户编码
		    t2.survey_code    ,#调查编码    
		    t2.question_code  ,#题目编码
		    t2.question_class ,#题目大类
		    t2.question_type  ,#题目小类
		    t2.option_code    ,#选项编码    
		    t2.option_name    ,#选项内容    
		    t2.option_seq     ,#选项序号    
		    t2.option_type    ,#选项类型    
		    pf_low_value+round(rand()*(pf_high_value-pf_low_value)) abc #选项值      
		from (
		    select user_code from tb_bas_survey_action_build_user where survey_code = ii_survey_code) t1, (
		    select a.pf_low_value, a.pf_high_value, a.survey_code, a.question_code, a.question_class,
               a.question_type, b.option_code, b.option_name, b.option_seq, b.option_type
		    from tb_bas_question_info a
		    left outer join tb_bas_question_option b on a.question_code = b.question_code 
		    where a.survey_code = ii_survey_code and a.question_type = 32) t2 ;
      
    set  pc_log_desc = '4.0. 调查参与信息生成' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;
    
    set  pc_log_desc = '4.1. 调查参与基本信息生成' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;
    
	  insert into tb_bas_survey_action
	  (
	      survey_code    ,#调查编码
	      user_code      ,#参与用户编码
	      start_time     ,#答卷开始时间
	      use_times       #答题花费时间（秒）
	  )
	  select 
	      a.survey_code               ,#调查编码
	      a.user_code                 ,#参与用户编码
	      date_add(b.start_time, interval ceil(20*rand()) day) ,#答卷开始时间
	      ceil(200 + 300*rand())       #答题花费时间（秒）
    from tb_bas_survey_action_build_user a, (
        select * from tb_bas_survey_info where survey_code = ii_survey_code) b ;

    set  pc_log_desc = '4.2. 更新参与结束时间' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;
    
    update tb_bas_survey_action
    set end_time = date_add(start_time, interval use_times second)
    where survey_code = ii_survey_code ;
    
    set  pc_log_desc = '5. 结束' ;
    call sp_proc_write_log(pc_log_proc, pc_log_desc, pc_log_para, pi_flag) ;
    if pi_flag != 0 then set oi_statuscode = pi_flag ;
    end if;
    
    set oi_statuscode = pi_sqlcode ;
end ;

/** 过程调用 数据检查 **/
call sp_survey_action_create_random(10000031, 1234, @res) ;
select @res ;

select * from tb_sys_proc_write_log where proc_name = 'sp_survey_action_create_random' and main_para = 10000031 ;
delete from tb_sys_proc_write_log   where proc_name = 'sp_survey_action_create_random' and main_para = 10000031 ;

select * from tb_bas_survey_action   where survey_code = 10000031 ;
select * from tb_bas_question_action where survey_code = 10000031 ;

select question_code, option_code, count(distinct user_code) from tb_bas_question_action 
where survey_code = 10000031 group by question_code, option_code ;

select question_code, count(distinct user_code) from tb_bas_question_action 
where survey_code = 10000031 group by question_code ;
