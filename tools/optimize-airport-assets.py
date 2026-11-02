"""Airport 资源压缩：保留全部素材；大段音乐转单声道 AAC，UnityFS 改外层统一压缩。"""
import argparse, hashlib, json, struct, subprocess
from pathlib import Path
import UnityPy

p=argparse.ArgumentParser();p.add_argument('--src',required=True);p.add_argument('--out',required=True);a=p.parse_args()
src=Path(a.src).resolve();out=Path(a.out).resolve()
workspace=Path(__file__).resolve().parent.parent
if not out.is_relative_to(workspace/'tools'/'state'):raise RuntimeError('缓存输出超出 tools/state')
out.mkdir(parents=True,exist_ok=True)
data_file=next((src/'Build').glob('*.data.br'));raw=data_file.read_bytes()
assert raw[:16]==b'UnityWebData1.0\0'
end=struct.unpack_from('<I',raw,16)[0];pos=20;entries=[]
while pos<end:
 offset,size,n=struct.unpack_from('<III',raw,pos);name=raw[pos+12:pos+12+n].decode();pos+=12+n
 entries.append([name,raw[offset:offset+size]])
contents=dict(entries);env=UnityPy.load(contents['data.unity3d']);resource=contents['sharedassets1.resource'];new_resource=bytearray();report=[]
for obj in env.objects:
 if obj.type.name!='AudioClip':continue
 clip=obj.read();r=clip.m_Resource
 if r.m_Source!='sharedassets1.resource':continue
 audio=resource[r.m_Offset:r.m_Offset+r.m_Size];old_size=len(audio)
 if old_size>1_000_000:
  input_file=out/(str(obj.path_id)+'-source.m4a');output_file=out/(str(obj.path_id)+'-mono.m4a');input_file.write_bytes(audio)
  subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(input_file),'-vn','-ac','1','-ar','22050','-c:a','aac','-b:a','32k','-movflags','+faststart',str(output_file)],check=True)
  audio=output_file.read_bytes();clip.m_Channels=1;clip.m_Frequency=22050
  report.append({'name':clip.m_Name,'before':old_size,'after':len(audio),'seconds':clip.m_Length})
 while len(new_resource)%16:new_resource.append(0)
 r.m_Offset=len(new_resource);r.m_Size=len(audio);new_resource.extend(audio);clip.save()
# 避免内部 LZ4 再套 Brotli，直接外层压缩能利用纹理/网格/元数据的共同重复。
contents['data.unity3d']=env.file.save(packer='none');contents['sharedassets1.resource']=bytes(new_resource)
header=20+sum(12+len(name.encode()) for name,_ in entries);offset=header
result=bytearray(b'UnityWebData1.0\0'+struct.pack('<I',header));body=[]
for name,_ in entries:
 b=contents[name];n=name.encode();result.extend(struct.pack('<III',offset,len(b),len(n)));result.extend(n);offset+=len(b);body.append(b)
result.extend(b''.join(body));(out/'Airport.data.raw').write_bytes(result)
(out/'optimization.json').write_text(json.dumps({'sourceSha256':hashlib.sha256(raw).hexdigest(),'sourceBytes':len(raw),'optimizedRawBytes':len(result),'audio':report,'textureChanges':0,'objectCount':len(env.objects)},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
