/* Confere os dados dos mini games sem abrir navegador: rimas, opostos, letra que falta, silabas, cores, corpo, filhotes */
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','src','p5.js'),'utf8');
const head=src.slice(0,src.indexOf('const GAMES=['));
const D=new Function(head+';return {RIMAS,OPOSTOS,CONFUSOS,FALTA,ALFA,LEXCOL,SILABAS,MISTURAS,CORPO,FILHOTES,WORDS,FORME};')();
const falhas=[];const ok=(c,m)=>{if(!c)falhas.push(m);};
const sem=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();

/* rimas: mesmo final dentro do grupo, finais diferentes entre grupos (senao duas alternativas rimam) */
const fim=w=>sem(w).slice(-2);
const finais=D.RIMAS.map(g=>{const f=new Set(g.map(fim));ok(f.size===1,`rima: grupo sem final unico ${g}`);ok(g.length>=3,`rima: grupo curto ${g}`);return [...f][0];});
ok(new Set(finais).size===finais.length,`rima: dois grupos terminam igual ${finais}`);

/* letra que falta: sempre sobram ao menos 2 alternativas que nao formam outra palavra */
for(const w of D.FALTA)for(let i=0;i<w.length;i++){const c=w[i];
 const seguras=D.ALFA.split('').filter(x=>x!==c&&!D.LEXCOL.has(w.slice(0,i)+x+w.slice(i+1)));
 ok(seguras.length>=2,`letra que falta: ${w} posicao ${i} so tem ${seguras.length} alternativas seguras`);}
ok(new Set(D.FALTA).size===D.FALTA.length,'letra que falta: palavra repetida');
for(const k of ['BOCA','BOLA','GALO','MEIA','MEDO','CEDO','MACA','CAMA','CARA','SONO','RUA','SUA','LUZ'.replace('LUZ','TUA')])ok(D.LEXCOL.has(k),`letra que falta: colisao conhecida ${k} sumiu da lista`);

/* opostos: cada resposta e unica e sobram 2 alternativas depois de tirar os pares que se confundem */
const grp=x=>D.CONFUSOS.findIndex(g=>g.includes(x));
ok(new Set(D.OPOSTOS.map(p=>p[1])).size===D.OPOSTOS.length,'opostos: resposta repetida');
for(const [w,a] of D.OPOSTOS){const n=D.OPOSTOS.filter(x=>x[1]!==a&&!(grp(w)>=0&&grp(x[0])===grp(w))).length;ok(n>=2,`opostos: ${w} so tem ${n} alternativas`);}

/* silabas: tabela conferida a mao (a heuristica de vogais erra em hiato, ex. avi-ao) */
const esperado={bola:2,casa:2,cachorro:3,banana:3,'pé':1,flor:1,borboleta:4,'avião':3,gato:2,elefante:4,sol:1,porta:2,escola:3,'maçã':2,tartaruga:4};
for(const [w,n] of D.SILABAS)ok(esperado[w]===n,`silabas: ${w} deveria ter ${esperado[w]} e tem ${n}`);
ok(D.SILABAS.length===Object.keys(esperado).length,'silabas: lista mudou, atualize o teste');

/* misturas de cores */
ok(new Set(D.MISTURAS.map(m=>m[2])).size===D.MISTURAS.length,'cores: resultado repetido');
ok(new Set(D.MISTURAS.map(m=>m[0]+m[1])).size===D.MISTURAS.length,'cores: mistura repetida');

/* partes do corpo: dica nao contem a resposta e nao cai na ambiguidade mao/pe */
ok(new Set(D.CORPO.map(c=>c[0])).size===D.CORPO.length,'corpo: parte repetida');
for(const [p,d] of D.CORPO){ok(!sem(d).includes(sem(p)),`corpo: dica de ${p} entrega a resposta`);ok(!/dedos?/.test(sem(d)),`corpo: dica de ${p} fala de dedos (mao e pe tem)`);}

/* filhotes: nomes unicos e nada generico como 'filhotinho' */
ok(new Set(D.FILHOTES.map(f=>f[1])).size===D.FILHOTES.length,'filhotes: filhote repetido');
for(const [a,f] of D.FILHOTES)ok(!/^filhot(e|inho)$/.test(f),`filhotes: ${a} tem resposta generica '${f}'`);

/* palavra que comeca com: cada palavra comeca com a letra da lista */
for(const l in D.WORDS)for(const w of D.WORDS[l])ok(sem(w)[0]===l.toLowerCase(),`comeca com: ${w} nao comeca com ${l}`);

/* forme a palavra: palavras unicas por nivel */
for(const n of [1,2])ok(new Set(D.FORME[n]).size===D.FORME[n].length,`forme: repetida no nivel ${n}`);

/* contagem de jogos */
const nj=(src.match(/^\{name:'/gm)||[]).length;ok(nj===27,`esperava 27 mini games, achei ${nj}`);

console.log(falhas.length?'FALHAS:\n - '+falhas.join('\n - '):`conteudo ok (${nj} jogos, ${D.RIMAS.length} grupos de rima, ${D.FALTA.length} palavras, ${D.OPOSTOS.length} opostos)`);
process.exitCode=falhas.length?1:0;
