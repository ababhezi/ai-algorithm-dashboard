import Papa from 'papaparse';
import type { CleanedRecord } from './types';

const PROVINCE_MAP: Record<string, string> = {
  北京: '北京市',
  北京市: '北京市',
  上海: '上海市',
  上海市: '上海市',
  天津: '天津市',
  天津市: '天津市',
  重庆: '重庆市',
  重庆市: '重庆市',
  广东: '广东省',
  广东省: '广东省',
  浙江: '浙江省',
  浙江省: '浙江省',
  江苏: '江苏省',
  江苏省: '江苏省',
  四川: '四川省',
  四川省: '四川省',
  湖北: '湖北省',
  湖北省: '湖北省',
  湖南: '湖南省',
  湖南省: '湖南省',
  福建: '福建省',
  福建省: '福建省',
  安徽: '安徽省',
  安徽省: '安徽省',
  山东: '山东省',
  山东省: '山东省'
};

const CITY_MAP: Record<string, string> = {
  北京: '北京',
  北京市: '北京',
  上海: '上海',
  上海市: '上海',
  天津: '天津',
  天津市: '天津',
  重庆: '重庆',
  重庆市: '重庆',
  广州: '广州',
  广州市: '广州',
  深圳: '深圳',
  深圳市: '深圳',
  杭州: '杭州',
  杭州市: '杭州',
  成都: '成都',
  成都市: '成都',
  武汉: '武汉',
  武汉市: '武汉',
  南京: '南京',
  南京市: '南京',
  苏州: '苏州',
  苏州市: '苏州',
  厦门: '厦门',
  厦门市: '厦门',
  西安: '西安',
  西安市: '西安',
  佛山: '佛山',
  佛山市: '佛山',
  东莞: '东莞',
  东莞市: '东莞',
  宁波: '宁波',
  宁波市: '宁波',
  合肥: '合肥',
  合肥市: '合肥',
  济南: '济南',
  济南市: '济南'
};

const INVALID_TEXT = new Set([
  '',
  '-',
  '--',
  '\\N',
  'nan',
  'null',
  'NULL',
  'undefined',
  'None',
  '国家',
  '未知',
  '未知省份',
  '未知城市',
  '未回填'
]);

function cleanText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text || INVALID_TEXT.has(text)) return null;
  return text;
}

function normalizeProvince(value: unknown): string | null {
  const text = cleanText(value);
  if (!text) return null;
  return PROVINCE_MAP[text] ?? text;
}

function normalizeCity(value: unknown): string | null {
  const text = cleanText(value);
  if (!text) return null;
  return CITY_MAP[text] ?? text.replace(/市$/, '');
}

function parseNumber(value: unknown): number | null {
  const text = cleanText(value);
  if (!text) return null;
  const normalized = text.replace(/,/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseMonth(value: unknown): { month: string; year: number; quarter: string } | null {
  const text = cleanText(value);
  if (!text || !/^\d{4}-\d{2}$/.test(text)) return null;
  const year = Number(text.slice(0, 4));
  const monthNum = Number(text.slice(5, 7));

  return {
    month: text,
    year,
    quarter: `${year}-Q${Math.ceil(monthNum / 3)}`
  };
}

export async function loadAndCleanCsv(url: string): Promise<CleanedRecord[]> {
  const parsed = await new Promise<Papa.ParseResult<Record<string, string>>>((resolve, reject) => {
    Papa.parse<Record<string, string>>(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: resolve,
      error: reject
    });
  });

  return parsed.data
    .map((row) => {
      const monthInfo = parseMonth(row['备案月份']);
      if (!monthInfo) return null;

      return {
        month: monthInfo.month,
        year: monthInfo.year,
        quarter: monthInfo.quarter,
        company: cleanText(row['企业名称']) ?? '未知企业',
        province: normalizeProvince(row['省份']),
        city: normalizeCity(row['城市']),
        category: cleanText(row['算法类别_LLM']),
        industry1: cleanText(row['行业一级']),
        capital: parseNumber(row['注册资本_万元']),
        longitude: parseNumber(row['经度']),
        latitude: parseNumber(row['纬度']),
        generation: cleanText(row['技术代际'])
      } satisfies CleanedRecord;
    })
    .filter((record): record is CleanedRecord => Boolean(record));
}
