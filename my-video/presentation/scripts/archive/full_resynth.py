import json, subprocess, os, time

with open(r'd:\数据大屏\ai-algorithm-dashboard\my-video\presentation\audio-segments.json', 'r', encoding='utf-8') as f:
    segments = json.load(f)

out_dir = r'd:\数据大屏\ai-algorithm-dashboard\my-video\presentation\public\audio'
voice = 'zh-CN-YunxiNeural'
DELAY = 10  # seconds between calls to avoid rate limiting

ok = 0
fail_list = []

for i, seg in enumerate(segments):
    ch = seg['chapter']
    st = seg['step']
    text = seg['text']
    out = os.path.join(out_dir, ch, f'{st}.mp3')
    os.makedirs(os.path.dirname(out), exist_ok=True)

    label = f'[{i+1}/{len(segments)}] {ch}/{st}.mp3'
    print(f'{label} ({len(text)} chars)', end=' ', flush=True)

    r = subprocess.run(
        ['py', '-m', 'edge_tts', '--text', text, '--voice', voice, '--write-media', out],
        capture_output=True, text=True
    )
    sz = os.path.getsize(out) if os.path.exists(out) else 0
    if r.returncode == 0 and sz > 100:
        print(f'OK ({sz//1024}KB)')
        ok += 1
    else:
        print(f'FAILED')
        fail_list.append((ch, st, text))

    if i < len(segments) - 1:
        time.sleep(DELAY)

# Retry failures with longer delay
if fail_list:
    print(f'\nRetrying {len(fail_list)} failures with 30s delay...')
    for ch, st, text in fail_list:
        out = os.path.join(out_dir, ch, f'{st}.mp3')
        print(f'  {ch}/{st}.mp3 ({len(text)} chars)...', end=' ', flush=True)
        time.sleep(30)
        r = subprocess.run(
            ['py', '-m', 'edge_tts', '--text', text, '--voice', voice, '--write-media', out],
            capture_output=True, text=True
        )
        sz = os.path.getsize(out) if os.path.exists(out) else 0
        if r.returncode == 0 and sz > 100:
            print(f'OK ({sz//1024}KB)')
            ok += 1
        else:
            print(f'STILL FAILED')

print(f'\nDone: {ok}/{len(segments)} succeeded')
