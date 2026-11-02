"""保留 Unity 数据归档全部条目，仅去掉内层 UnityFS 重复压缩。"""
import argparse,struct
from pathlib import Path
import UnityPy
from UnityPy.export.Texture2DConverter import parse_image_data
p=argparse.ArgumentParser();p.add_argument('--input',required=True);p.add_argument('--output',required=True);p.add_argument('--decode-dxt',action='store_true');p.add_argument('--rgba4444',action='store_true');a=p.parse_args()
out=Path(a.output).resolve();root=Path(__file__).resolve().parent/'state'
if not out.is_relative_to(root):raise RuntimeError('输出必须在 tools/state')
b=Path(a.input).read_bytes();assert b[:16]==b'UnityWebData1.0\0'
end=struct.unpack_from('<I',b,16)[0];pos=20;entries=[]
while pos<end:
 offset,size,n=struct.unpack_from('<III',b,pos);name=b[pos+12:pos+12+n].decode();pos+=12+n;data=b[offset:offset+size]
 if name=='data.unity3d':
  env=UnityPy.load(data)
  if a.decode_dxt or a.rgba4444:
   # 逐层解码已有 BC1/BC3，保留全部像素、尺寸与 mip；只是改变无损传输表示。
   for obj in env.objects:
    if obj.type.name!='Texture2D':continue
    t=obj.read()
    if t.m_TextureFormat not in ((4,10,12) if a.rgba4444 else (10,12)) or len(t.image_data)<65536:continue
    original=bytes(t.image_data);w=t.m_Width;h=t.m_Height;offset=0;levels=[]
    for mip in range(t.m_MipCount or 1):
     size=w*h*4 if t.m_TextureFormat==4 else max(1,(w+3)//4)*max(1,(h+3)//4)*(8 if t.m_TextureFormat==10 else 16)
     im=parse_image_data(original[offset:offset+size],w,h,t.m_TextureFormat,obj.assets_file.unity_version,obj.platform,flip=False).convert('RGBA')
     if a.rgba4444:
      # 用户已允许的画质压缩：四通道各 4 位，尺寸与 mip 不变。
      import numpy as np
      pix=np.asarray(im,dtype=np.uint16);packed=((pix[:,:,0]>>4)<<12)|((pix[:,:,1]>>4)<<8)|((pix[:,:,2]>>4)<<4)|(pix[:,:,3]>>4)
      levels.append(packed.astype('<u2').tobytes())
     else:levels.append(im.tobytes())
     offset+=size;w=max(1,w//2);h=max(1,h//2)
    t.image_data=b''.join(levels);t.m_TextureFormat=13 if a.rgba4444 else 4;t.m_CompleteImageSize=len(t.image_data);t.save()
  data=env.file.save(packer='none')
 entries.append((name,data))
offset=20+sum(12+len(name.encode()) for name,data in entries);result=bytearray(b[:16]+struct.pack('<I',offset))
for name,data in entries:
 en=name.encode();result+=struct.pack('<III',offset,len(data),len(en))+en;offset+=len(data)
result+=b''.join(data for name,data in entries);out.write_bytes(result)
