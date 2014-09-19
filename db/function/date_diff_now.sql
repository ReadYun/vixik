drop function if exists date_relative_now ;
create function date_relative_now
(
  date varchar(32)
)
returns varchar(32)
/**** ---------------------------------------- Header
    * @name       date_relative_now
    * @caption    日期与当前差值
    * @describe   以表述形式标识目标日期与当前日期的差值
    *
    * ---------------------------------------- Params
    * @param_in   date   目标日期时间
    *
    * ---------------------------------------- Tables
    * @tar_table  tb_target_xxx  目标表名
    * @src_table  tb_source_xxx  源表名
    *
    * ---------------------------------------- Info
    * @version      1.0.000
    * @author       cao.zhiyun
    * @create-date  2014-8-1
    * @copyright    VixiK
    */

begin
    
    if timestampdiff(year, date, now()) > 1
        then return date_format(date, '%Y-%m-%d') ;
    elseif timestampdiff(year, date, now()) = 1
        then return '1年前' ;
    elseif timestampdiff(month, date, now()) > 0
        then return concat(timestampdiff(month, date, now()), '月前') ;
    elseif timestampdiff(week, date, now()) > 0
        then return concat(timestampdiff(week, date, now()), '周前') ;
    elseif timestampdiff(day, date, now()) > 0
        then return concat(timestampdiff(day, date, now()), '天前') ;
    elseif timestampdiff(hour, date, now()) > 0
        then return concat(timestampdiff(hour, date, now()), '小时前') ;
    elseif timestampdiff(minute, date, now()) > 0
        then return concat(timestampdiff(minute, date, now()), '分钟前') ;
    elseif timestampdiff(second, date, now()) > 0
        then return concat(timestampdiff(second, date, now()), '秒前') ;
    else return '刚刚' ;
    end if ;

end ;