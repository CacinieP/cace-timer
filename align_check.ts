import { CACE_SMALL, CACE_HAPPY, CACE_SLEEPY, CACE_FOCUSED, CACE_CELEBRATING } from './src/mascot';

const DIRS: Record<string, string[]> = {
  '│': ['U','D'], '─': ['L','R'],
  '╭': ['D','R'], '╮': ['D','L'], '╰': ['U','R'], '╯': ['U','L'],
  '┬': ['L','R','D'], '┴': ['L','R','U'],
  '├': ['U','D','R'], '┤': ['U','D','L'], '┼': ['U','D','L','R'],
  '┘': ['U','L'], '└': ['U','R'],
  '╔': ['D','R'], '╗': ['D','L'], '╚': ['U','R'], '╝': ['U','L'],
  '║': ['U','D'], '═': ['L','R'],
  '╱': ['UR','DL'], '╲': ['UL','DR'],
};
const accU = new Set('│┴├┤┼╰╯╚╝║┘└'.split(''));
const accD = new Set('│┬├┤┼╭╮╔╗║'.split(''));
const accL = new Set('─┬┴┤┼╮╯╝╗═┘'.split(''));
const accR = new Set('─┬┴├┼╭╰╔╚═└'.split(''));
const MIRROR: Record<string,string> = {'╭':'╮','╮':'╭','╰':'╯','╯':'╰','╱':'╲','╲':'╱','╔':'╗','╗':'╔','╚':'╝','╝':'╚','┬':'┬','┴':'┴','┼':'┼','│':'│','─':'─','║':'║','═':'═','├':'┤','┤':'├','┘':'└','└':'┘'};
const isBox = (ch: string) => DIRS[ch] !== undefined;
const FACE = /[●★◆◉▽◡～▬△♪]/;

function check(name: string, art: string): void {
  const lines = art.split('\n');
  const probs: string[] = [];
  const rowType = (r: number): { face: boolean; neck: boolean; bangs: boolean; chin: boolean; faceWall: boolean } => {
    const t = lines[r] ?? '';
    const faceWall = t[6] === '│' && t[21] === '│' && !t.includes('╔') && !t.includes('╰') && !t.includes('┴');
    return { face: FACE.test(t), neck: /^\s*││\s*$/.test(t), bangs: t.includes('╭╮╭╮'), chin: t.includes('╰──╯'), faceWall };
  };
  for (let r = 0; r < lines.length; r++) {
    const rt = rowType(r);
    for (let c = 0; c < lines[r].length; c++) {
      const ch = lines[r][c];
      if (!isBox(ch)) continue;
      for (const d of DIRS[ch]) {
        // 合法悬垂: 刘海尖朝下 / 下巴卷尖朝上 / 脖子顶端 / 嘴两端
        if (rt.bangs && (d === 'D') && (ch === '╭' || ch === '╮')) continue;
        if (rt.chin && d === 'U' && (ch === '╯' || ch === '╰')) continue;
        if (rt.neck && d === 'U') continue;
        if ((rt.face || rt.faceWall) && ch === '─' && (d === 'L' || d === 'R')) continue;
        let nr = r, nc = c, ok: boolean;
        if (d === 'U') { ok = accD.has(lines[r-1]?.[c] ?? ''); }
        else if (d === 'D') { ok = accU.has(lines[r+1]?.[c] ?? ''); }
        else if (d === 'L') { ok = accR.has(lines[r][c-1] ?? ''); }
        else if (d === 'R') { ok = accL.has(lines[r][c+1] ?? ''); }
        else if (d === 'UR') { ok = isBox(lines[r-1]?.[c+1] ?? ''); }
        else if (d === 'DL') { ok = isBox(lines[r+1]?.[c-1] ?? ''); }
        else if (d === 'UL') { ok = isBox(lines[r-1]?.[c-1] ?? ''); }
        else { ok = isBox(lines[r+1]?.[c+1] ?? ''); }
        if (!ok) probs.push(`${name} r${r} c${c} '${ch}' ${d}断开 (邻:${(d==='U'?lines[r-1]?.[c]:d==='D'?lines[r+1]?.[c]:d==='L'?lines[r][c-1]:lines[r][c+1]) ?? '∅'})`);
      }
      if (!rt.face && !rt.faceWall) { // 脸部行不参与镜像检查(眼睛嘴等无法整列对称)
        const mc = 27 - c;
        if (MIRROR[ch] !== lines[r][mc]) probs.push(`${name} r${r} c${c} '${ch}' 镜像位(${mc})是'${lines[r][mc] ?? '∅'}' 期望'${MIRROR[ch]}'`);
      }
    }
  }
  console.log(probs.length ? `✗ ${name}: ${probs.length} 处` : `✓ ${name}`);
  probs.forEach(p => console.log('   ' + p));
}

check('SMALL', CACE_SMALL);
check('HAPPY', CACE_HAPPY);
check('SLEEPY', CACE_SLEEPY);
check('FOCUSED', CACE_FOCUSED);
check('CELEBRATING', CACE_CELEBRATING);
