import fs from 'node:fs/promises';
import path from 'node:path';
import Papa from 'papaparse';

const SOURCE = path.resolve('public/data/algorithm_filing.csv');
const OUTPUT_PUBLIC_CSV = path.resolve('public/data/algorithm_filing.csv');
const OUTPUT_METRICS = path.resolve('dashboard_metrics.json');
const OUTPUT_QUALITY = path.resolve('data_quality_summary.csv');

const PROVINCE_MAP = new Map([
  ['北京', '北京市'],
  ['北京市', '北京市'],
  ['上海', '上海市'],
  ['上海市', '上海市'],
  ['天津', '天津市'],
  ['天津市', '天津市'],
  ['重庆', '重庆市'],
  ['重庆市', '重庆市'],
  ['广东', '广东省'],
  ['广东省', '广东省'],
  ['浙江', '浙江省'],
  ['浙江省', '浙江省'],
  ['江苏', '江苏省'],
  ['江苏省', '江苏省'],
  ['四川', '四川省'],
  ['四川省', '四川省'],
  ['湖北', '湖北省'],
  ['湖北省', '湖北省']
]);

const INVALID = new Set([
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

function cleanText(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text || INVALID.has(text)) return null;
  return text;
}

function normalizeProvince(value) {
  const text = cleanText(value);
  if (!text) return null;
  return PROVINCE_MAP.get(text) ?? text;
}

function normalizeCity(value) {
  const text = cleanText(value);
  if (!text) return null;
  return text.replace(/市$/, '');
}

function parseNumber(value) {
  const text = cleanText(value);
  if (!text) return null;
  const parsed = Number(text.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRows(csvText) {
  const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });

  return data
    .map((row) => {
      const month = cleanText(row['备案月份']);
      if (!month) return null;

      return {
        month,
        company: cleanText(row['企业名称']) ?? '未知企业',
        province: normalizeProvince(row['省份']),
        city: normalizeCity(row['城市']),
        category: cleanText(row['算法类别_LLM']),
        industry1: cleanText(row['行业一级']),
        capital: parseNumber(row['注册资本_万元']),
        longitude: parseNumber(row['经度']),
        latitude: parseNumber(row['纬度'])
      };
    })
    .filter(Boolean);
}

function toCsv(rows) {
  return Papa.unparse(rows);
}

async function main() {
  const csvText = await fs.readFile(SOURCE, 'utf8');
  await fs.writeFile(OUTPUT_PUBLIC_CSV, csvText, 'utf8');

  const rows = parseRows(csvText);
  const total = rows.length;
  const companies = new Set(rows.map((row) => row.company)).size;
  const cities = new Set(rows.map((row) => row.city).filter(Boolean)).size;
  const provinceCounts = rows.reduce((acc, row) => {
    if (!row.province) return acc;
    acc[row.province] = (acc[row.province] ?? 0) + 1;
    return acc;
  }, {});
  const top4 = Object.values(provinceCounts)
    .sort((a, b) => b - a)
    .slice(0, 4)
    .reduce((sum, value) => sum + value, 0) / Math.max(total, 1);
  const contentGenShare = rows.filter((row) => row.category === '内容生成').length / Math.max(total, 1);

  await fs.writeFile(
    OUTPUT_METRICS,
    JSON.stringify(
      {
        totalFilings: total,
        totalCompanies: companies,
        coveredCities: cities,
        top4Share: Number(top4.toFixed(4)),
        contentGenShare: Number(contentGenShare.toFixed(4))
      },
      null,
      2
    ),
    'utf8'
  );

  const qualityRows = [
    { field: '省份', missing: rows.filter((row) => !row.province).length, note: '“未回填”与其他未知值统一记入未知，不参与省级热力和排行。' },
    { field: '城市', missing: rows.filter((row) => !row.city).length, note: '城市排行和地图星点仅统计有效城市字段。' },
    {
      field: '经纬度',
      missing: rows.filter((row) => row.longitude === null || row.latitude === null).length,
      note: '无坐标记录不会参与地图星点渲染。'
    },
    { field: '算法类别', missing: rows.filter((row) => !row.category).length, note: '未知类别单独计数，不参与主类别排序。' },
    { field: '行业一级', missing: rows.filter((row) => !row.industry1).length, note: '行业分析仅基于有效行业字段。' }
  ];
  await fs.writeFile(OUTPUT_QUALITY, toCsv(qualityRows), 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
