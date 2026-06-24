# ────────────────────────────────────────────────────────────────────
# edge-tts provider — free Microsoft Edge TTS, no API key needed.
#
# Install:  pip install edge-tts
# Voices:   edge-tts --list-voices
#   zh-CN-YunxiNeural     (male, recommended for presentations)
#   zh-CN-XiaoxiaoNeural  (female, bright)
#   zh-CN-YunjianNeural   (male, news-broadcast style)
# ────────────────────────────────────────────────────────────────────

_EDGE_TTS_BIN=""

_find_edge_tts() {
  if [[ -n "$_EDGE_TTS_BIN" ]]; then return 0; fi
  if command -v edge-tts >/dev/null 2>&1; then
    _EDGE_TTS_BIN="edge-tts"
  elif [[ -n "${APPDATA:-}" && -x "$APPDATA/Python/Python312/Scripts/edge-tts.exe" ]]; then
    _EDGE_TTS_BIN="$APPDATA/Python/Python312/Scripts/edge-tts.exe"
  elif command -v edge-tts.exe >/dev/null 2>&1; then
    _EDGE_TTS_BIN="edge-tts.exe"
  else
    # search common locations
    for p in "$HOME/.local/bin/edge-tts" "/usr/local/bin/edge-tts"; do
      if [[ -x "$p" ]]; then _EDGE_TTS_BIN="$p"; break; fi
    done
  fi
  [[ -n "$_EDGE_TTS_BIN" ]]
}

tts_check() {
  if ! _find_edge_tts; then
    echo "✗ edge-tts not found. Run: pip install edge-tts" >&2
    return 1
  fi
}

tts_install_help() {
  cat <<'EOF' >&2
Install edge-tts (free, uses Microsoft Edge's TTS backend, no API key):
  pip install edge-tts

Recommended Chinese voices:
  zh-CN-YunxiNeural     (male — recommended for presentations)
  zh-CN-XiaoxiaoNeural  (female — bright and clear)
  zh-CN-YunjianNeural   (male — news-broadcast style)

List all available voices:
  edge-tts --list-voices | grep zh-CN
EOF
}

tts_synthesize() {
  local text="$1" out="$2" voice="${3:-zh-CN-YunxiNeural}"

  _find_edge_tts || { echo "✗ edge-tts binary not found" >&2; return 1; }

  # edge-tts writes the output file directly
  "$_EDGE_TTS_BIN" --text "$text" --voice "$voice" --write-media "$out" >/dev/null 2>&1
}
