function parseBRL(s){return parseFloat(String(s).replace(/\./g,'').replace(',','.'))}
function parseReceipt(text){
  const t=(text||'').replace(/\r/g,'');
  const lines=t.split('\n').map(l=>l.trim()).filter(Boolean);
  const out={value:null,date:null,client:'',type:'Outro'};
  const vm=t.match(/valor[^\d\n]{0,20}(?:R[$S]\s?)?(\d{1,3}(?:\.\d{3})*,\d{2})/i)||t.match(/R[$S]\s?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2})/i);
  if(vm) out.value=parseBRL(vm[1]);
  const meses={jan:1,fev:2,mar:3,abr:4,mai:5,jun:6,jul:7,ago:8,set:9,out:10,nov:11,dez:12};
  let d=t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/),y,m,dd;
  if(d){dd=+d[1];m=+d[2];y=+d[3]}
  else{d=t.match(/(\d{1,2})\s*(?:de\s*)?(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)[a-z]*\.?\s*(?:de\s*)?(\d{4})/i);if(d){dd=+d[1];m=meses[d[2].toLowerCase()];y=+d[3]}}
  if(y&&m>=1&&m<=12&&dd>=1&&dd<=31) out.date=`${y}-${String(m).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
  if(/pix/i.test(t)) out.type='PIX'; else if(/boleto|c[oó]digo de barras/i.test(t)) out.type='Boleto';
  const looksName=s=>/^[A-Za-zÀ-ÿ'. ]{3,}$/.test(s)&&s.trim().split(/\s+/).length>=2&&!/banco|pix|valor|comprovante|conta|ag[eê]ncia|cpf|cnpj/i.test(s);
  const clean=s=>s.replace(/^[:\-\s]+/,'').replace(/\s+/g,' ').trim();
  const lab=/^(quem pagou|pagador|origem|remetente|enviado por|dados de quem pagou|de)\b\s*:?/i;
  for(let i=0;i<lines.length&&!out.client;i++){
    const m1=lines[i].match(lab);
    if(!m1) continue;
    const rest=clean(lines[i].slice(m1[0].length));
    if(rest&&looksName(rest)){out.client=rest;break}
    for(let j=i+1;j<Math.min(lines.length,i+4);j++){
      const n=lines[j].match(/^nome\s*:?\s*(.+)$/i);
      const cand=n?clean(n[1]):clean(lines[j]);
      if(cand&&looksName(cand)){out.client=cand;break}
    }
  }
  if(!out.client){for(const l of lines){const n=l.match(/^nome\s*:?\s*(.+)$/i);if(n&&looksName(clean(n[1]))){out.client=clean(n[1]);break}}}
  out.client=out.client.toLowerCase().replace(/(^|\s)\S/g,c=>c.toUpperCase());
  return out;
}
if(typeof module!=='undefined')module.exports={parseReceipt,parseBRL};
