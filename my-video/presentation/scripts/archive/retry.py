import json, subprocess, os, time

with open(r'd:\数据大屏\ai-algorithm-dashboard\my-video\presentation\audio-segments.json', 'r', encoding='utf-8') as f:
    segments = json.load(f)

out_dir = r'd:\数据大屏\ai-algorithm-dashboard\my-video\presentation\public\audio'
voice = 'zh-CN-YunxiNeural'

# Failed segments from previous run
failed_ids = [
    ('coldopen', 2),
    ('background', 1),
    ('background', 3),
    ('dashboard-intro', 1),
    ('forecast', 4),
    ('conclusions', 1),
    ('conclusions', 2),
    ('conclusions', 3),
    ('conclusions', 4),
    ('conclusions', 5),
]
# The script was stopped before it finished recommendations, so let me also check which recommendation segments need synthesis

# Check which segments need synthesis
to_retry = []
for seg in segments:
    ch = seg['chapter']
    st = seg['step']
    out = os.path.join(out_dir, ch, f'{st}.mp3')
    if not os.path.exists(out):
        to_retry.append(seg)
        print(f'  NEED: {ch}/{st}.mp3 ({len(seg["text"])} chars)')
    else:
        # Check file size
        sz = os.path.getsize(out)
        if sz < 100:
            to_retry.append(seg)
            print(f'  TOO SMALL ({sz}B): {ch}/{st}.mp3 ({len(seg["text"])} chars)')
        else:
            print(f'  OK: {ch}/{st}.mp3 ({sz//1024}KB)')

if not to_retry:
    print('All segments OK!')
else:
    print(f'\nRetrying {len(to_retry)} failed segments with 12s delay...')
    ok = 0
    for i, seg in enumerate(to_retry):
        ch = seg['chapter']
        st = seg['step']
        text = seg['text']
        out = os.path.join(out_dir, ch, f'{st}.mp3')
        os.makedirs(os.path.dirname(out), exist_ok=True)
        
        print(f'[{i+1}/{len(to_retry)}] {ch}/{st}.mp3 ({len(text)} chars)...', end=' ', flush=True)
        
        r = subprocess.run(
            ['py', '-m', 'edge_tts', '--text', text, '--voice', voice, '--write-media', out],
            capture_output=True, text=True
        )
        if r.returncode == 0 and os.path.exists(out) and os.path.getsize(out) > 100:
            print(f'OK ({os.path.getsize(out)//1024}KB)')
            ok += 1
        else:
            print(f'FAILED')
        
        time.sleep(12)
    
    print(f'\nDone: {ok}/{len(to_retry)} succeeded')
