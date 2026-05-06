import { existsSync, readFileSync } from "fs";
import { notFound } from "next/navigation";
import path from "path";

import { UnitPresentation } from "./Presentation";

/** `_personal/unit001.md` の ID と項目名（DataLocal CSV の列順） */
const UNIT_COLUMN_LABELS: readonly string[] = [
  "体力",
  "KB",
  "速度",
  "攻撃力",
  "攻撃終了～移動(frame=*2)",
  "射程",
  "お金",
  "再生産(frame=*2)",
  "当たり判定の位置",
  "当たり判定の幅",
  "赤い敵",
  "?",
  "範囲攻撃",
  "攻撃感知～攻撃発生(f)",
  "最小レイヤー(手前50 奥0)",
  "最大レイヤー(手前50 奥0)",
  "浮いている敵",
  "黒い敵",
  "メタルな敵",
  "無属性",
  "天使",
  "エイリアン",
  "ゾンビ",
  "めっぽう強い",
  "ふっとばす",
  "動きを止める 発動確率(%)",
  "動きを止める 効果時間(f)",
  "動きを遅くする 発動確率(%)",
  "動きを遅くする 効果時間(f)",
  "打たれ強い",
  "超ダメージ",
  "クリティカル 発動確率(%)",
  "ターゲット限定",
  "撃破時お金アップ",
  "城破壊が得意",
  "波動攻撃 発動確率(%)",
  "波動Lv",
  "攻撃力ダウン 発動確率(%)",
  "攻撃力ダウン 発動時間(f)",
  "攻撃力ダウン ダウン割合(%)",
  "攻撃力アップ 体力割合(%)",
  "攻撃力アップ 増加割合(%)",
  "生き残る 発動確率(%)",
  "メタル",
  "遠方攻撃 最短射程",
  "遠方攻撃 最短射程～最長射程の距離",
  "波動ダメージ無効",
  "波動ストッパー",
  "ふっとばす無効",
  "動きを止める無効",
  "動きを遅くする無効",
  "攻撃力ダウン無効",
  "ゾンビキラー",
  "魔女キラー",
  "魔女",
  "攻撃回数",
  "衝撃波無効",
  "自殺遅延",
  "自殺",
  "攻撃力 二撃目",
  "攻撃力 三撃目",
  "攻撃感知～攻撃発生 二撃目(f)",
  "攻撃感知～攻撃発生 三撃目(f)",
  "効果,能力 一撃目",
  "効果,能力 二撃目",
  "効果,能力 三撃目",
  "生産アニメーション (-1:unit 0:モンハン)",
  "昇天エフェクト",
  "生産アニメーション",
  "昇天エフェクト (1:無効 2:有効)",
  "バリアブレイカー 発動確率(%)",
  "ワープ 発動確率(%)",
  "ワープ 発動時間(f)",
  "ワープ 最短射程",
  "ワープ 最短射程～最長射程の距離",
  "ワープ無効",
  "使徒",
  "使徒キラー",
  "古代種",
  "古代の呪い無効",
  "超打たれ強い",
  "極ダメージ",
  "渾身の一撃 発動確率(%)",
  "渾身の一撃 増加割合(%)",
  "攻撃無効 発動確率(%)",
  "攻撃無効 発動時間(f)",
  "烈波攻撃 発動確率(%)",
  "烈波攻撃 最短射程",
  "烈波攻撃 最短射程～最長射程の距離",
  "烈波Lv",
  "毒劇ダメージ無効",
  "烈波ダメージ無効",
  "呪い",
  "呪い 発動時間(f)",
  "小波動",
  "シールドブレイカー 発動確率(%)",
  "悪魔",
  "超生命体特攻",
  "魂攻撃",
  "遠方攻撃 二撃目",
  "遠方攻撃 二撃目 最短射程",
  "遠方攻撃 二撃目 最短射程～最長射程の距離",
  "遠方攻撃 三撃目",
  "遠方攻撃 三撃目 最短距離",
  "遠方攻撃 三撃目 最短射程～最長射程の距離",
  "超獣特攻",
  "超獣特攻 発動確率(%)",
  "超獣特攻 攻撃無効(f)",
  "小烈波",
  "烈波カウンター",
  "召喚unit番号",
  "超賢者特攻",
  "メタルキラー",
  "爆波攻撃(%)",
  "爆波攻撃(最長射程)",
  "爆波攻撃(最短射程)",
  "爆波ダメージ無効",
];

type ParsedCsvLine = {
  comment?: string;
  values: number[];
};

const parseUnitCsvLine = (line: string): ParsedCsvLine => {
  let working = line.trim();
  let comment: string | undefined;
  const slashIdx = working.indexOf("//");
  if (slashIdx >= 0) {
    comment = working.slice(slashIdx + 2).trim();
    working = working.slice(0, slashIdx).trim();
  }
  const rawParts = working.split(",").map((s) => s.trim());
  const values = rawParts
    .filter((p) => p.length > 0)
    .map((p) => {
      const n = Number(p);
      return Number.isFinite(n) ? n : Number.NaN;
    })
    .filter((n) => !Number.isNaN(n));
  return { comment, values };
};

const resolveUnitFileKey = (rawId: string): null | string => {
  const trimmed = rawId.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || n < 0) {
    return null;
  }
  return String(n).padStart(3, "0");
};

const UnitPage = async (props: PageProps<"/unit/[id]">) => {
  const { id } = await props.params;
  const fileKey = resolveUnitFileKey(id);
  if (!fileKey) {
    notFound();
  }

  const fileName = `unit${fileKey}.csv`;
  const absolutePath = path.join(process.cwd(), "public", "DataLocal", fileName);

  if (!existsSync(absolutePath)) {
    notFound();
  }

  const text = readFileSync(absolutePath, "utf8");
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));

  const forms = lines.map((line, index) => {
    const parsed = parseUnitCsvLine(line);
    return {
      comment: parsed.comment,
      formIndex: index,
      values: parsed.values,
    };
  });

  const maxDataCols = forms.reduce((max, f) => Math.max(max, f.values.length), 0);
  const rowCount = Math.min(Math.max(maxDataCols, UNIT_COLUMN_LABELS.length), 117);

  const statRows = Array.from({ length: rowCount }, (_, colIdx) => {
    const statId = colIdx + 1;
    const label = UNIT_COLUMN_LABELS[colIdx] ?? `列 ${String(statId)}`;
    const cells = forms.map((form) => {
      const v = form.values[colIdx];
      return v === undefined ? "—" : String(v);
    });
    return { cells, id: statId, label };
  });

  return (
    <UnitPresentation
      csvFileName={fileName}
      formBlocks={forms}
      statRows={statRows}
      unitFileKey={fileKey}
    />
  );
};

export default UnitPage;
