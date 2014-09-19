drop function if exists date_relative_now ;
create function date_relative_now
(
  date varchar(32)
)
returns varchar(32)
/**** ---------------------------------------- Header
    * @name       date_relative_now
    * @caption    �����뵱ǰ��ֵ
    * @describe   �Ա�����ʽ��ʶĿ�������뵱ǰ���ڵĲ�ֵ
    *
    * ---------------------------------------- Params
    * @param_in   date   Ŀ������ʱ��
    *
    * ---------------------------------------- Tables
    * @tar_table  tb_target_xxx  Ŀ�����
    * @src_table  tb_source_xxx  Դ����
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
        then return '1��ǰ' ;
    elseif timestampdiff(month, date, now()) > 0
        then return concat(timestampdiff(month, date, now()), '��ǰ') ;
    elseif timestampdiff(week, date, now()) > 0
        then return concat(timestampdiff(week, date, now()), '��ǰ') ;
    elseif timestampdiff(day, date, now()) > 0
        then return concat(timestampdiff(day, date, now()), '��ǰ') ;
    elseif timestampdiff(hour, date, now()) > 0
        then return concat(timestampdiff(hour, date, now()), 'Сʱǰ') ;
    elseif timestampdiff(minute, date, now()) > 0
        then return concat(timestampdiff(minute, date, now()), '����ǰ') ;
    elseif timestampdiff(second, date, now()) > 0
        then return concat(timestampdiff(second, date, now()), '��ǰ') ;
    else return '�ո�' ;
    end if ;

end ;