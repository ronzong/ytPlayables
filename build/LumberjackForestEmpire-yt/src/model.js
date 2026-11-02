// Минимальный загрузчик GLB для статичных low-poly моделей из model kit.
// Нам нужны только POSITION, NORMAL и COLOR_0: текстур и сторонней glTF-библиотеки
// нет, поэтому модель остаётся лёгкой и использует родной vertex color рендерер.

const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

function accessorData(doc, binary, index) {
  const acc = doc.accessors[index];
  const view = doc.bufferViews[acc.bufferView];
  if (!acc || !view || acc.componentType !== 5126) throw new Error('glb-accessor-format');
  const size = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[acc.type];
  if (!size || view.byteStride) throw new Error('glb-accessor-layout');
  const offset = (view.byteOffset || 0) + (acc.byteOffset || 0);
  return new Float32Array(binary, offset, acc.count * size).slice();
}

function accessorIndices(doc, binary, index) {
  const acc = doc.accessors[index];
  const view = doc.bufferViews[acc.bufferView];
  if (!acc || !view || acc.type !== 'SCALAR' || view.byteStride) throw new Error('glb-index-layout');
  const offset = (view.byteOffset || 0) + (acc.byteOffset || 0);
  const Type = acc.componentType === 5121 ? Uint8Array
    : acc.componentType === 5123 ? Uint16Array
      : acc.componentType === 5125 ? Uint32Array : null;
  if (!Type) throw new Error('glb-index-format');
  return new Type(binary, offset, acc.count).slice();
}

async function loadStaticModel(assetName) {
  const embedded = globalThis.__MODEL_GLB_DATA_URLS__?.[assetName];
  // Путь считаем от страницы, а не от import.meta.url: в однофайловой
  // сборке плейтеста модулей нет, и import.meta там просто не существует.
  const url = embedded || new URL('assets/' + assetName, document.baseURI);
  const response = await fetch(url);
  if (!response.ok) throw new Error(assetName + '-http-' + response.status);
  const buffer = await response.arrayBuffer();
  const dv = new DataView(buffer);
  if (dv.getUint32(0, true) !== GLB_MAGIC || dv.getUint32(4, true) !== 2) throw new Error(assetName + '-glb');

  let offset = 12, doc = null, binary = null;
  while (offset + 8 <= buffer.byteLength) {
    const length = dv.getUint32(offset, true);
    const type = dv.getUint32(offset + 4, true);
    const start = offset + 8;
    if (type === JSON_CHUNK) {
      const text = new TextDecoder().decode(new Uint8Array(buffer, start, length)).replace(/\0+$/g, '');
      doc = JSON.parse(text);
    } else if (type === BIN_CHUNK) {
      binary = buffer.slice(start, start + length);
    }
    offset = start + length;
  }

  const primitive = doc && doc.meshes && doc.meshes[0] && doc.meshes[0].primitives[0];
  if (!primitive || primitive.mode !== undefined && primitive.mode !== 4) {
    throw new Error(assetName + '-mesh-layout');
  }
  const a = primitive.attributes || {};
  if (a.POSITION === undefined || a.NORMAL === undefined || a.COLOR_0 === undefined || !binary) {
    throw new Error(assetName + '-vertex-data');
  }
  const sourcePos = accessorData(doc, binary, a.POSITION);
  const sourceNor = accessorData(doc, binary, a.NORMAL);
  const sourceCol = accessorData(doc, binary, a.COLOR_0);
  if (sourcePos.length !== sourceNor.length || sourcePos.length !== sourceCol.length) {
    throw new Error(assetName + '-array-length');
  }
  if (primitive.indices === undefined) {
    if (sourcePos.length % 9) throw new Error(assetName + '-triangles');
    return { pos: sourcePos, nor: sourceNor, col: sourceCol };
  }

  // Blender экспортирует общие вершины через индексный буфер. Игровой
  // рендерер использует плоский массив треугольников, поэтому разворачиваем
  // индексы один раз при загрузке модели.
  const indices = accessorIndices(doc, binary, primitive.indices);
  if (indices.length % 3) throw new Error(assetName + '-index-triangles');
  const pos = new Float32Array(indices.length * 3);
  const nor = new Float32Array(indices.length * 3);
  const col = new Float32Array(indices.length * 3);
  for (let i = 0; i < indices.length; i++) {
    const from = indices[i] * 3, to = i * 3;
    pos[to] = sourcePos[from]; pos[to + 1] = sourcePos[from + 1]; pos[to + 2] = sourcePos[from + 2];
    nor[to] = sourceNor[from]; nor[to + 1] = sourceNor[from + 1]; nor[to + 2] = sourceNor[from + 2];
    col[to] = sourceCol[from]; col[to + 1] = sourceCol[from + 1]; col[to + 2] = sourceCol[from + 2];
  }
  return { pos, nor, col };
}

export function loadSawmillModel() {
  return loadStaticModel('prop_sawmill.glb');
}

// Ошибка одного класса техники не должна ломать запуск игры: для него
// автоматически останется прежняя процедурная модель.
export async function loadMachineModels() {
  const result = {};
  await Promise.all([
    [2, 'machine_mini.glb'],
    [3, 'machine_full.glb'],
    [4, 'machine_mega.glb'],
  ].map(async ([tier, assetName]) => {
    try {
      result[tier] = await loadStaticModel(assetName);
    } catch (e) {
      console.warn('Модель техники не загрузилась, используется резервная:', assetName, e);
    }
  }));
  return result;
}
