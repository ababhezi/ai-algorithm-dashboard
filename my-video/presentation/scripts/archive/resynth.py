import json, subprocess, os, time

with open(r'd:\数据大屏\ai-algorithm-dashboard\my-video\presentation\audio-segments.json', 'r', encoding='utf-8') as f:
    segments = json.load(f)

out_dir = r'd:\数据大屏\ai-algorithm-dashboard\my-video\presentation\public\audio'
voice = 'zh-CN-YunxiNeural'
ok = 0
fail = 0

for i, seg in enumerate(segments):
    ch = seg['chapter']
    st = seg['step']
    text = seg['text']
    out = os.path.join(out_dir, ch, f'{st}.mp3')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    
    label = f'[{i+1}/{len(segments)}] {ch}/{st}.mp3'
    print(f'{label} (len={len(text)})', end=' ', flush=True)
    
    r = subprocess.run(
        ['py', '-m', 'edge_tts', '--text', text, '--voice', voice, '--write-media', out],
        capture_output=True, text=True
    )
    if r.returncode == 0:
        print('OK')
        ok += 1
    else:
        err = r.stderr.strip().split('\n')[-2:]
        print(f'FAILED: {err}')
        fail += 1
    
    time.sleep(2)

print(f'\ndone: {ok} OK, {fail} FAILED')
