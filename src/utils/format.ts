import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export function formatUTC(
  utcString: string,
  format: string = 'YYYY/MM/DD HH:mm:ss',
) {
  const resultTime = dayjs
    .utc(utcString) // 将输入字符串解析为UTC时间
    .utcOffset(8) // 设置时区偏移为+8小时（北京时间）
    .format(format) // 按照指定格式格式化时间
  return resultTime
}
