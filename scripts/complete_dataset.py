from __future__ import annotations

import csv
import statistics
from collections import Counter, defaultdict
from pathlib import Path


WORKSPACE = Path(__file__).resolve().parents[1]
SOURCE_CANDIDATES = [
    "2-算法备案数据_可视化课程数据集_已自动回填部分注册资本(2).csv",
    "2-算法备案数据_可视化课程数据集_已自动回填部分注册资本.csv",
]

OUTPUT_CSV = "2-算法备案数据_可视化课程数据集_补全版.csv"
OUTPUT_SUMMARY = "2-算法备案数据_可视化课程数据集_补全说明.md"
OUTPUT_STATS = "2-算法备案数据_可视化课程数据集_补全统计.csv"

MISSING_MARKERS = {"", "-", "--", "—", "\\N", "未知", "未回填", "null", "NULL", "None"}
LOCATION_MISSING_MARKERS = MISSING_MARKERS | {"国家"}

FIELDS = {
    "id": "id",
    "batch": "批次",
    "month": "备案月份",
    "algorithm": "算法名称",
    "algo_raw": "算法类别_原始",
    "algo_llm": "算法类别_LLM",
    "company_role": "企业角色",
    "company": "企业名称",
    "product": "应用产品",
    "usage": "主要用途",
    "capital": "注册资本_万元",
    "province": "省份",
    "city": "城市",
    "district": "县区",
    "industry1": "行业一级",
    "industry2": "行业二级",
    "industry3": "行业三级",
    "lng": "经度",
    "lat": "纬度",
    "tech": "技术代际",
}

PLACEHOLDERS = {
    FIELDS["province"]: "未回填",
    FIELDS["city"]: "未回填",
    FIELDS["district"]: "未回填",
    FIELDS["industry1"]: "未回填",
    FIELDS["industry2"]: "未回填",
    FIELDS["industry3"]: "未回填",
    FIELDS["algo_llm"]: "未回填",
    FIELDS["tech"]: "未回填",
    FIELDS["product"]: "未回填",
    FIELDS["capital"]: "未回填",
    FIELDS["lng"]: "未回填",
    FIELDS["lat"]: "未回填",
}

MUNICIPALITIES = {
    "北京市": "北京市",
    "上海市": "上海市",
    "天津市": "天津市",
    "重庆市": "重庆市",
}

PROVINCE_NORMALIZATION = {
    "北京": "北京市",
    "北京市": "北京市",
    "上海": "上海市",
    "上海市": "上海市",
    "天津": "天津市",
    "天津市": "天津市",
    "重庆": "重庆市",
    "重庆市": "重庆市",
    "广东": "广东省",
    "广东省": "广东省",
    "浙江": "浙江省",
    "浙江省": "浙江省",
    "江苏": "江苏省",
    "江苏省": "江苏省",
    "四川": "四川省",
    "四川省": "四川省",
    "福建": "福建省",
    "福建省": "福建省",
    "山东": "山东省",
    "山东省": "山东省",
    "湖北": "湖北省",
    "湖北省": "湖北省",
    "安徽": "安徽省",
    "安徽省": "安徽省",
    "湖南": "湖南省",
    "湖南省": "湖南省",
    "河北": "河北省",
    "河北省": "河北省",
    "河南": "河南省",
    "河南省": "河南省",
    "江西": "江西省",
    "江西省": "江西省",
    "辽宁": "辽宁省",
    "辽宁省": "辽宁省",
    "吉林": "吉林省",
    "吉林省": "吉林省",
    "黑龙江": "黑龙江省",
    "黑龙江省": "黑龙江省",
    "山西": "山西省",
    "山西省": "山西省",
    "陕西": "陕西省",
    "陕西省": "陕西省",
    "云南": "云南省",
    "云南省": "云南省",
    "贵州": "贵州省",
    "贵州省": "贵州省",
    "海南": "海南省",
    "海南省": "海南省",
    "广西": "广西壮族自治区",
    "广西壮族自治区": "广西壮族自治区",
    "内蒙古": "内蒙古自治区",
    "内蒙古自治区": "内蒙古自治区",
    "宁夏": "宁夏回族自治区",
    "宁夏回族自治区": "宁夏回族自治区",
    "新疆": "新疆维吾尔自治区",
    "新疆维吾尔自治区": "新疆维吾尔自治区",
    "西藏": "西藏自治区",
    "西藏自治区": "西藏自治区",
    "香港": "香港特别行政区",
    "香港特别行政区": "香港特别行政区",
    "澳门": "澳门特别行政区",
    "澳门特别行政区": "澳门特别行政区",
    "台湾": "台湾省",
    "台湾省": "台湾省",
}


def clean(value: str | None) -> str:
    return (value or "").strip()


def is_missing(value: str | None, *, location: bool = False) -> bool:
    value = clean(value)
    markers = LOCATION_MISSING_MARKERS if location else MISSING_MARKERS
    return value in markers


def normalize_province(value: str | None) -> str:
    value = clean(value)
    return PROVINCE_NORMALIZATION.get(value, value)


def source_path() -> Path:
    for candidate in SOURCE_CANDIDATES:
        path = WORKSPACE / candidate
        if path.exists():
            return path
    raise FileNotFoundError("未找到源 CSV 文件。")


def read_rows(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        fieldnames = reader.fieldnames or []
        rows = [dict(row) for row in reader]
    return fieldnames, rows


def write_rows(path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def count_missing(rows: list[dict[str, str]], field: str, *, location: bool = False) -> int:
    return sum(1 for row in rows if is_missing(row.get(field), location=location))


def build_unique_value_lookup(
    rows: list[dict[str, str]],
    key_field: str,
    value_field: str,
    *,
    location: bool = False,
) -> dict[str, str]:
    buckets: dict[str, set[str]] = defaultdict(set)
    for row in rows:
        key = clean(row.get(key_field))
        value = clean(row.get(value_field))
        if not key or is_missing(value, location=location):
            continue
        if value_field == FIELDS["province"]:
            value = normalize_province(value)
        buckets[key].add(value)
    return {key: next(iter(values)) for key, values in buckets.items() if len(values) == 1}


def apply_lookup_fill(
    rows: list[dict[str, str]],
    key_field: str,
    value_field: str,
    lookup: dict[str, str],
    reason: str,
    fill_log: Counter[str],
    *,
    location: bool = False,
) -> None:
    for row in rows:
        if not is_missing(row.get(value_field), location=location):
            continue
        key = clean(row.get(key_field))
        value = lookup.get(key)
        if not value:
            continue
        row[value_field] = value
        fill_log[f"{value_field}:{reason}"] += 1


def build_location_tokens(
    rows: list[dict[str, str]],
) -> tuple[list[tuple[str, str, str]], list[tuple[str, str]]]:
    city_to_provinces: dict[str, set[str]] = defaultdict(set)
    province_counter: Counter[str] = Counter()

    for row in rows:
        province = normalize_province(row.get(FIELDS["province"]))
        city = clean(row.get(FIELDS["city"]))
        if not is_missing(province, location=True):
            province_counter[province] += 1
        if not is_missing(province, location=True) and not is_missing(city, location=True):
            city_to_provinces[city].add(province)

    unique_city_province = {
        city: next(iter(provinces))
        for city, provinces in city_to_provinces.items()
        if len(provinces) == 1
    }

    city_tokens: set[tuple[str, str, str]] = set()
    for city, province in unique_city_province.items():
        variants = {city}
        if city.endswith("市"):
            variants.add(city[:-1])
        for token in variants:
            if token:
                city_tokens.add((token, city, province))

    province_tokens: set[tuple[str, str]] = set()
    for province in province_counter:
        variants = {province}
        if province.endswith("省") or province.endswith("市"):
            variants.add(province[:-1])
        for suffix in ("壮族自治区", "回族自治区", "维吾尔自治区", "自治区", "特别行政区"):
            if province.endswith(suffix):
                variants.add(province[: -len(suffix)])
        for token in variants:
            if token and token not in LOCATION_MISSING_MARKERS:
                province_tokens.add((token, province))

    city_token_list = sorted(city_tokens, key=lambda item: len(item[0]), reverse=True)
    province_token_list = sorted(province_tokens, key=lambda item: len(item[0]), reverse=True)
    return city_token_list, province_token_list


def apply_company_name_location_fill(
    rows: list[dict[str, str]],
    fill_log: Counter[str],
) -> None:
    city_tokens, province_tokens = build_location_tokens(rows)

    for row in rows:
        company = clean(row.get(FIELDS["company"]))
        if not company:
            continue

        city_hit = next(
            ((city, province) for token, city, province in city_tokens if token in company),
            None,
        )
        province_hit = next(
            (province for token, province in province_tokens if token in company),
            None,
        )

        if is_missing(row.get(FIELDS["city"]), location=True) and city_hit:
            row[FIELDS["city"]] = city_hit[0]
            fill_log[f"{FIELDS['city']}:企业名称匹配"] += 1

        if is_missing(row.get(FIELDS["province"]), location=True):
            if city_hit:
                row[FIELDS["province"]] = city_hit[1]
                fill_log[f"{FIELDS['province']}:企业名称匹配"] += 1
            elif province_hit:
                row[FIELDS["province"]] = province_hit
                fill_log[f"{FIELDS['province']}:企业名称匹配"] += 1
                if province_hit in MUNICIPALITIES and is_missing(
                    row.get(FIELDS["city"]), location=True
                ):
                    row[FIELDS["city"]] = MUNICIPALITIES[province_hit]
                    fill_log[f"{FIELDS['city']}:直辖市映射"] += 1


def safe_float(value: str | None) -> float | None:
    try:
        return float(clean(value))
    except (TypeError, ValueError):
        return None


def build_coordinate_lookup(
    rows: list[dict[str, str]],
) -> tuple[
    dict[tuple[str, str, str], tuple[float, float]],
    dict[tuple[str, str], tuple[float, float]],
    dict[str, tuple[float, float]],
]:
    by_district: dict[tuple[str, str, str], list[list[float]]] = defaultdict(lambda: [[], []])
    by_city: dict[tuple[str, str], list[list[float]]] = defaultdict(lambda: [[], []])
    by_province: dict[str, list[list[float]]] = defaultdict(lambda: [[], []])

    for row in rows:
        lng = safe_float(row.get(FIELDS["lng"]))
        lat = safe_float(row.get(FIELDS["lat"]))
        if lng is None or lat is None:
            continue

        province = normalize_province(row.get(FIELDS["province"]))
        city = clean(row.get(FIELDS["city"]))
        district = clean(row.get(FIELDS["district"]))

        if not is_missing(province, location=True):
            by_province[province][0].append(lng)
            by_province[province][1].append(lat)

        if not is_missing(province, location=True) and not is_missing(city, location=True):
            by_city[(province, city)][0].append(lng)
            by_city[(province, city)][1].append(lat)

        if (
            not is_missing(province, location=True)
            and not is_missing(city, location=True)
            and not is_missing(district, location=True)
        ):
            by_district[(province, city, district)][0].append(lng)
            by_district[(province, city, district)][1].append(lat)

    def mean_pair(bucket: list[list[float]]) -> tuple[float, float]:
        return statistics.mean(bucket[0]), statistics.mean(bucket[1])

    return (
        {key: mean_pair(bucket) for key, bucket in by_district.items()},
        {key: mean_pair(bucket) for key, bucket in by_city.items()},
        {key: mean_pair(bucket) for key, bucket in by_province.items()},
    )


def apply_coordinate_fill(rows: list[dict[str, str]], fill_log: Counter[str]) -> None:
    by_district, by_city, by_province = build_coordinate_lookup(rows)

    for row in rows:
        lng_missing = is_missing(row.get(FIELDS["lng"]))
        lat_missing = is_missing(row.get(FIELDS["lat"]))
        if not (lng_missing or lat_missing):
            continue

        province = normalize_province(row.get(FIELDS["province"]))
        city = clean(row.get(FIELDS["city"]))
        district = clean(row.get(FIELDS["district"]))

        coord: tuple[float, float] | None = None
        reason = ""
        if (province, city, district) in by_district:
            coord = by_district[(province, city, district)]
            reason = "区县质心"
        elif (province, city) in by_city:
            coord = by_city[(province, city)]
            reason = "城市质心"
        elif province in by_province:
            coord = by_province[province]
            reason = "省份质心"

        if coord is None:
            continue

        if lng_missing:
            row[FIELDS["lng"]] = f"{coord[0]:.6f}"
            fill_log[f"{FIELDS['lng']}:{reason}"] += 1
        if lat_missing:
            row[FIELDS["lat"]] = f"{coord[1]:.6f}"
            fill_log[f"{FIELDS['lat']}:{reason}"] += 1


def normalize_existing_values(rows: list[dict[str, str]]) -> None:
    for row in rows:
        province = normalize_province(row.get(FIELDS["province"]))
        if province and province != clean(row.get(FIELDS["province"])):
            row[FIELDS["province"]] = province


def apply_placeholders(rows: list[dict[str, str]], fill_log: Counter[str]) -> None:
    for field, placeholder in PLACEHOLDERS.items():
        location = field in {FIELDS["province"], FIELDS["city"], FIELDS["district"]}
        for row in rows:
            if is_missing(row.get(field), location=location):
                row[field] = placeholder
                fill_log[f"{field}:占位补全"] += 1


def make_stats_rows(
    before_counts: dict[str, int],
    after_counts: dict[str, int],
    fill_log: Counter[str],
) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for field, before in before_counts.items():
        after = after_counts[field]
        rows.append(
            {
                "field": field,
                "before_missing": str(before),
                "after_missing": str(after),
                "filled_count": str(before - after),
            }
        )

    rows.append({"field": "", "before_missing": "", "after_missing": "", "filled_count": ""})
    rows.append({"field": "fill_reason", "before_missing": "count", "after_missing": "", "filled_count": ""})
    for reason, count in sorted(fill_log.items()):
        rows.append(
            {
                "field": reason,
                "before_missing": str(count),
                "after_missing": "",
                "filled_count": "",
            }
        )
    return rows


def write_summary(
    path: Path,
    source_name: str,
    total_rows: int,
    before_counts: dict[str, int],
    after_counts: dict[str, int],
    fill_log: Counter[str],
) -> None:
    lines = [
        f"# 数据集补全说明",
        "",
        f"- 源文件：`{source_name}`",
        f"- 总记录数：`{total_rows}`",
        f"- 输出文件：`{OUTPUT_CSV}`",
        "",
        "## 补全规则",
        "",
        "1. 同企业唯一值回填：对省份、城市、县区、行业、技术代际、算法类别、应用产品等字段，若同一企业在其他记录中仅出现一个有效值，则直接回填。",
        "2. 同算法唯一值回填：对少量重复算法名称记录，若同一算法仅出现一个有效值，则辅助回填。",
        "3. 企业名称地域匹配：从企业名称中识别省份/城市关键词，例如“杭州”“深圳”“北京”等，推断省市字段。",
        "4. 经纬度质心回填：优先使用“省份+城市+县区”已有坐标的均值，其次使用城市质心，再其次使用省份质心。",
        "5. 占位补全：对仍无法可靠推断的字段，统一填为“未回填”，保证结构完整，但不伪造事实值。",
        "",
        "## 补全前后缺失情况",
        "",
        "| 字段 | 补全前缺失 | 补全后缺失 | 实际补入 |",
        "| --- | ---: | ---: | ---: |",
    ]

    for field, before in before_counts.items():
        after = after_counts[field]
        lines.append(f"| {field} | {before} | {after} | {before - after} |")

    lines.extend(
        [
            "",
            "## 补全方式明细",
            "",
            "| 补全方式 | 填充次数 |",
            "| --- | ---: |",
        ]
    )
    for reason, count in sorted(fill_log.items()):
        lines.append(f"| {reason} | {count} |")

    lines.extend(
        [
            "",
            "## 使用建议",
            "",
            "- 若用于可视化大屏：建议将“未回填”视作未知值，不参与省市排名和坐标绘制。",
            "- 若用于分析报告：可把“同企业回填”“企业名称匹配”“质心回填”说明为规则补全，不建议将其表述为人工权威核验结果。",
        ]
    )

    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    source = source_path()
    fieldnames, rows = read_rows(source)
    total_rows = len(rows)

    normalize_existing_values(rows)

    tracked_fields = [
        FIELDS["province"],
        FIELDS["city"],
        FIELDS["district"],
        FIELDS["industry1"],
        FIELDS["industry2"],
        FIELDS["industry3"],
        FIELDS["lng"],
        FIELDS["lat"],
        FIELDS["tech"],
        FIELDS["algo_llm"],
        FIELDS["product"],
        FIELDS["capital"],
    ]

    before_counts = {
        field: count_missing(
            rows,
            field,
            location=field in {FIELDS["province"], FIELDS["city"], FIELDS["district"]},
        )
        for field in tracked_fields
    }

    fill_log: Counter[str] = Counter()

    company_field = FIELDS["company"]
    algorithm_field = FIELDS["algorithm"]

    for field in [
        FIELDS["province"],
        FIELDS["city"],
        FIELDS["district"],
        FIELDS["industry1"],
        FIELDS["industry2"],
        FIELDS["industry3"],
        FIELDS["tech"],
        FIELDS["algo_llm"],
        FIELDS["product"],
        FIELDS["capital"],
        FIELDS["lng"],
        FIELDS["lat"],
    ]:
        location = field in {FIELDS["province"], FIELDS["city"], FIELDS["district"]}
        company_lookup = build_unique_value_lookup(rows, company_field, field, location=location)
        apply_lookup_fill(
            rows,
            company_field,
            field,
            company_lookup,
            "同企业唯一值",
            fill_log,
            location=location,
        )

    for field in [
        FIELDS["province"],
        FIELDS["city"],
        FIELDS["district"],
        FIELDS["industry1"],
        FIELDS["industry2"],
        FIELDS["industry3"],
        FIELDS["lng"],
        FIELDS["lat"],
    ]:
        location = field in {FIELDS["province"], FIELDS["city"], FIELDS["district"]}
        algorithm_lookup = build_unique_value_lookup(rows, algorithm_field, field, location=location)
        apply_lookup_fill(
            rows,
            algorithm_field,
            field,
            algorithm_lookup,
            "同算法唯一值",
            fill_log,
            location=location,
        )

    apply_company_name_location_fill(rows, fill_log)
    apply_coordinate_fill(rows, fill_log)
    apply_placeholders(rows, fill_log)

    after_counts = {
        field: count_missing(
            rows,
            field,
            location=field in {FIELDS["province"], FIELDS["city"], FIELDS["district"]},
        )
        for field in tracked_fields
    }

    write_rows(WORKSPACE / OUTPUT_CSV, fieldnames, rows)
    write_rows(
        WORKSPACE / OUTPUT_STATS,
        ["field", "before_missing", "after_missing", "filled_count"],
        make_stats_rows(before_counts, after_counts, fill_log),
    )
    write_summary(
        WORKSPACE / OUTPUT_SUMMARY,
        source.name,
        total_rows,
        before_counts,
        after_counts,
        fill_log,
    )

    print(f"completed: {OUTPUT_CSV}")
    for field in tracked_fields:
        print(field, before_counts[field], "->", after_counts[field])


if __name__ == "__main__":
    main()
