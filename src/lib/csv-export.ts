/**
 * CSV 导出工具函数
 * 用于将数据导出为 CSV 格式文件
 */

/**
 * 转义 CSV 字段值
 * 处理包含逗号、引号或换行符的值
 */
function escapeCSVField(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // 如果包含逗号、引号或换行符，需要用引号包裹并转义内部引号
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * 将数据数组转换为 CSV 格式字符串
 * @param data 数据数组
 * @param headers CSV 表头数组
 * @param getRowData 获取每行数据的函数，接收数据项和索引，返回字段值数组
 * @returns CSV 格式字符串
 */
export function convertToCSV<T>(
  data: T[],
  headers: string[],
  getRowData: (item: T, index: number) => (string | number | null | undefined)[]
): string {
  // 构建 CSV 内容
  const rows: string[] = [];

  // 添加表头
  rows.push(headers.map(escapeCSVField).join(','));

  // 添加数据行
  data.forEach((item, index) => {
    const rowData = getRowData(item, index);
    const row = rowData.map(escapeCSVField).join(',');
    rows.push(row);
  });

  return rows.join('\n');
}

/**
 * 下载 CSV 文件
 * @param csvContent CSV 内容字符串
 * @param filename 文件名（不包含扩展名）
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // 添加 BOM 以支持 Excel 正确显示中文
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  // 创建下载链接
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  // 触发下载
  document.body.appendChild(link);
  link.click();

  // 清理
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 导出数据为 CSV 文件
 * @param data 数据数组
 * @param headers CSV 表头数组
 * @param getRowData 获取每行数据的函数
 * @param filename 文件名（不包含扩展名）
 */
export function exportToCSV<T>(
  data: T[],
  headers: string[],
  getRowData: (
    item: T,
    index: number
  ) => (string | number | null | undefined)[],
  filename: string
): void {
  const csvContent = convertToCSV(data, headers, getRowData);
  downloadCSV(csvContent, filename);
}

/**
 * CSV 导出配置接口
 */
export interface CSVExportConfig<T> {
  /** 数据数组 */
  data: T[];
  /** CSV 表头数组 */
  headers: string[];
  /** 获取每行数据的函数 */
  getRowData: (
    item: T,
    index: number
  ) => (string | number | null | undefined)[];
  /** 文件名（不包含扩展名） */
  filename: string;
}

/**
 * 使用配置对象导出 CSV
 * @param config CSV 导出配置
 */
export function exportCSV<T>(config: CSVExportConfig<T>): void {
  exportToCSV(config.data, config.headers, config.getRowData, config.filename);
}
