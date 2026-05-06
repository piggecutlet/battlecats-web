"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import Slider from "@mui/material/Slider";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useMemo, useState } from "react";

/** u000 系の見た目に寄せたダークパレット */
const palette = {
  bgDeep: "#07080c",
  bgMain: "#0d1018",
  bgPanel: "#121620",
  bgStatLabel: "#2c323f",
  bgStatValue: "#1a1f2c",
  borderSubtle: "#2a3142",
  pinkThumb: "#ff6699",
  textMuted: "#9aa4b5",
};

const theme = createTheme({
  palette: {
    background: {
      default: palette.bgDeep,
      paper: palette.bgPanel,
    },
    divider: palette.borderSubtle,
    mode: "dark",
    primary: { main: palette.pinkThumb },
    text: {
      primary: "#f0f3f8",
      secondary: palette.textMuted,
    },
  },
  typography: {
    fontFamily: '"Segoe UI","Hiragino Sans","Hiragino Kaku Gothic ProN",Meiryo,sans-serif',
  },
});

type FormBlock = {
  comment?: string;
  formIndex: number;
  values: number[];
};

type Props = {
  csvFileName: string;
  formBlocks: FormBlock[];
  statRows: Array<{
    cells: string[];
    id: number;
    label: string;
  }>;
  unitFileKey: string;
};

const formatSecondsFromFrames = (frames: number): string => {
  if (!Number.isFinite(frames)) {
    return "—";
  }
  return `${(frames / 30).toFixed(2)}秒`;
};

/** ID5 は frame*2、秒に換算 */
const formatSecondsFromFramesTimes2 = (raw: number): string => {
  if (!Number.isFinite(raw)) {
    return "—";
  }
  return `${((raw * 2) / 30).toFixed(2)}秒`;
};

const deriveCombatTiming = (v: number[]) => {
  const moveEndF2 = v[4] ?? 0;
  const windupF = v[13] ?? 0;
  const cycleFrames = Math.max(1, moveEndF2 * 2 + windupF);
  const atk = v[3] ?? 0;
  const dps = Math.round((atk * 30) / cycleFrames);
  const periodSec = cycleFrames / 30;
  return { cycleFrames, dps, periodSec };
};

const StatCellPair = ({ label, value }: { label: string; value: string }) => (
  <Box
    sx={{
      display: "flex",
      flex: "1 1 0",
      minHeight: 36,
      minWidth: 0,
    }}
  >
    <Box
      component="span"
      sx={{
        alignItems: "center",
        bgcolor: palette.bgStatLabel,
        border: `1px solid ${palette.borderSubtle}`,
        display: "flex",
        flex: "0 0 44%",
        fontSize: "0.75rem",
        justifyContent: "center",
        px: 0.5,
        py: 0.5,
      }}
    >
      {label}
    </Box>
    <Box
      component="span"
      sx={{
        alignItems: "center",
        bgcolor: palette.bgStatValue,
        border: `1px solid ${palette.borderSubtle}`,
        borderLeft: "none",
        display: "flex",
        flex: "1 1 auto",
        fontSize: "0.8125rem",
        fontVariantNumeric: "tabular-nums",
        justifyContent: "flex-end",
        px: 1,
        py: 0.5,
      }}
    >
      {value}
    </Box>
  </Box>
);

type FormSectionProps = {
  form: FormBlock;
  unitIndex0: number;
};

const FormSection = ({ form, unitIndex0 }: FormSectionProps) => {
  const v = form.values;
  const [lv, setLv] = useState(50);

  const name = form.comment ?? `形態 ${String(form.formIndex)}`;
  const displayId = `${String(unitIndex0)}-${String(form.formIndex + 1)}`;

  const hp = v[0];
  const kb = v[1];
  const speed = v[2];
  const atk = v[3];
  const range = v[5];
  const cost = v[6];
  const saiseisanF = v[7];
  const { dps, periodSec } = deriveCombatTiming(v);

  const saiseisanSec =
    Number.isFinite(saiseisanF) && saiseisanF >= 0 ? `${(saiseisanF / 30).toFixed(2)}秒` : "—";

  const scopeChip =
    (v[12] ?? 0) !== 0 ? (
      <Chip label="範囲" size="small" sx={{ height: 22, ml: 0.5 }} />
    ) : (
      <Chip label="単体" size="small" sx={{ height: 22, ml: 0.5 }} />
    );

  return (
    <Box
      sx={{
        bgcolor: palette.bgMain,
        border: `1px solid ${palette.borderSubtle}`,
        borderRadius: 1,
        mb: 2,
        overflow: "hidden",
      }}
    >
      {/* Lv スライダー行 */}
      <Box
        sx={{
          alignItems: "center",
          borderBottom: `1px solid ${palette.borderSubtle}`,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "center",
          pb: 1,
          pt: 1.5,
          px: 2,
        }}
      >
        <Box sx={{ flex: "1 1 240px", maxWidth: 520, position: "relative", px: 1 }}>
          <Typography
            sx={{
              color: palette.textMuted,
              fontSize: "0.6rem",
              left: "50%",
              position: "absolute",
              top: -10,
              transform: "translateX(-50%)",
            }}
          >
            [装飾・上]
          </Typography>
          <Slider
            max={60}
            min={1}
            onChange={(_, n) => setLv(n as number)}
            sx={{
              "& .MuiSlider-thumb": {
                bgcolor: palette.pinkThumb,
                height: 18,
                width: 18,
              },
              "& .MuiSlider-track": { border: "none" },
              color: palette.pinkThumb,
              height: 6,
            }}
            value={lv}
            valueLabelDisplay="auto"
          />
          <Typography
            sx={{
              bottom: -8,
              color: palette.textMuted,
              fontSize: "0.6rem",
              left: "50%",
              position: "absolute",
              transform: "translateX(-50%)",
            }}
          >
            [装飾・下]
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "0.875rem", minWidth: 72 }}>Lv {lv}</Typography>
        <Typography
          sx={{
            color: palette.textMuted,
            fontSize: "0.75rem",
          }}
        >
          [MAXLv （仮）]
        </Typography>
        <Button
          aria-label="画像ダウンロード（仮）"
          color="inherit"
          size="small"
          sx={{ flexShrink: 0, minWidth: "auto", ml: "auto", px: 1 }}
          variant="text"
        >
          [DL]
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { md: "row", xs: "column" },
          gap: 0,
        }}
      >
        {/* 左サイドバー */}
        <Box
          sx={{
            bgcolor: palette.bgPanel,
            borderBottom: { md: "none", xs: `1px solid ${palette.borderSubtle}` },
            borderRight: { md: `1px solid ${palette.borderSubtle}`, xs: "none" },
            flex: "0 0 112px",
            px: 1.25,
            py: 1.5,
          }}
        >
          <Typography sx={{ fontWeight: 700, mb: 1.5 }} variant="body2">
            {displayId}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "0.7rem" }}>
            コスト
          </Typography>
          <Typography sx={{ mb: 1.5 }} variant="body2">
            {cost ?? "—"}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "0.7rem" }}>
            再生産
          </Typography>
          <Typography sx={{ mb: 1.5 }} variant="body2">
            {saiseisanSec}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "0.7rem", mt: "auto" }}>
            特性
          </Typography>
        </Box>

        {/* メイン */}
        <Box sx={{ flex: "1 1 auto", minWidth: 0, p: 1.5 }}>
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mb: 1.5,
            }}
          >
            <Typography component="span" sx={{ fontSize: "1.35rem", fontWeight: 700 }}>
              {name}
            </Typography>
            <Chip label="基本" size="small" sx={{ height: 22 }} />
            {scopeChip}
          </Box>

          <Box
            sx={{
              alignItems: "stretch",
              display: "flex",
              flexDirection: { sm: "row", xs: "column" },
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                alignItems: "center",
                bgcolor: palette.bgStatValue,
                border: `1px solid ${palette.borderSubtle}`,
                display: "flex",
                flex: "0 0 88px",
                height: 88,
                justifyContent: "center",
                overflow: "hidden",
                width: { sm: 88, xs: "100%" },
              }}
            >
              <Typography
                color="text.secondary"
                sx={{ lineHeight: 1.35, px: 0.5, textAlign: "center" }}
                variant="caption"
              >
                [ユニット画像]
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flex: "1 1 auto", flexDirection: "column", gap: 0.5 }}>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <StatCellPair label="体力" value={String(hp ?? "—")} />
                <StatCellPair label="KB" value={String(kb ?? "—")} />
                <StatCellPair label="攻頻度" value={`${periodSec.toFixed(2)}秒`} />
              </Box>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <StatCellPair label="攻撃力" value={String(atk ?? "—")} />
                <StatCellPair label="速度" value={String(speed ?? "—")} />
                <StatCellPair label="wait" value="—" />
              </Box>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <StatCellPair label="DPS" value={String(dps)} />
                <StatCellPair label="射程" value={String(range ?? "—")} />
                <StatCellPair label="攻発生" value={formatSecondsFromFrames(v[13] ?? Number.NaN)} />
              </Box>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Box sx={{ flex: "1 1 0", minWidth: 0 }} />
                <Box sx={{ flex: "1 1 0", minWidth: 0 }} />
                <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
                  <StatCellPair
                    label="BSwing"
                    value={formatSecondsFromFramesTimes2(v[4] ?? Number.NaN)}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              bgcolor: palette.bgPanel,
              border: `1px dashed ${palette.borderSubtle}`,
              borderRadius: 0.5,
              color: "text.secondary",
              fontSize: "0.75rem",
              minHeight: 40,
              mt: 1.5,
              px: 1,
              py: 0.75,
            }}
          >
            （特性テキストは未連携）
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export const UnitPresentation = ({ csvFileName, formBlocks, statRows, unitFileKey }: Props) => {
  const [detailMode, setDetailMode] = useState(false);

  const unitIndex0 = useMemo(
    () => Math.max(0, Number.parseInt(unitFileKey, 10) - 1),
    [unitFileKey],
  );

  const formsForUi = useMemo(() => [...formBlocks].reverse(), [formBlocks]);

  const wikiHref = "https://seesaawiki.jp/battlecatswiki/d/";
  const dbHref = `https://battlecats-db.com/unit/${unitFileKey}.html`;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: palette.bgDeep, minHeight: "100vh", pb: 4, pt: 2 }}>
        <Container maxWidth="md">
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography component="h1" sx={{ fontWeight: 700 }} variant="h6">
              ユニット詳細
            </Typography>

            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Link
                component={NextLink}
                href="/"
                sx={{
                  alignItems: "center",
                  display: "inline-flex",
                  gap: 0.5,
                  textDecoration: "none",
                }}
                underline="hover"
              >
                <Typography color="text.secondary" component="span" variant="caption">
                  [ICON]
                </Typography>
                一覧へ
              </Link>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={detailMode}
                    onChange={(_, c) => setDetailMode(c)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">詳細モード</Typography>}
              />

              <Link href={wikiHref} rel="noopener noreferrer" target="_blank" variant="body2">
                wiki
              </Link>
              <Link href={dbHref} rel="noopener noreferrer" target="_blank" variant="body2">
                db
              </Link>
            </Box>
          </Box>

          <Typography color="text.secondary" sx={{ mb: 2 }} variant="caption">
            DataLocal / {csvFileName}
          </Typography>

          {formsForUi.map((form) => (
            <FormSection form={form} key={form.formIndex} unitIndex0={unitIndex0} />
          ))}

          {detailMode ? (
            <TableContainer
              sx={{
                bgcolor: palette.bgPanel,
                border: `1px solid ${palette.borderSubtle}`,
                borderRadius: 1,
                maxHeight: "70vh",
                mt: 2,
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: palette.bgStatLabel }}>ID</TableCell>
                    <TableCell sx={{ bgcolor: palette.bgStatLabel }}>項目</TableCell>
                    {formBlocks.map((_, headerIdx) => (
                      <TableCell align="right" key={`hdr-${headerIdx}`}>
                        形態{headerIdx}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statRows.map((row, idx) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        bgcolor: idx % 2 === 0 ? palette.bgMain : "rgba(255,255,255,0.03)",
                      }}
                    >
                      <TableCell>{row.id}</TableCell>
                      <TableCell sx={{ wordBreak: "break-word" }}>{row.label}</TableCell>
                      {row.cells.map((cell, cellIdx) => (
                        <TableCell align="right" key={`${row.id}-${cellIdx}`}>
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
        </Container>
      </Box>
    </ThemeProvider>
  );
};
