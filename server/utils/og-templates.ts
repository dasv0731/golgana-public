import { html as satoriHtml } from 'satori-html';

const BG_GRADIENT = 'linear-gradient(135deg, #000 0%, #0a3d20 50%, #067a4a 100%)';

export function ogTorneoTemplate(data: { title: string; subtitle: string }) {
  return satoriHtml(`
    <div style="display:flex;flex-direction:column;width:1200px;height:630px;background:${BG_GRADIENT};color:#fff;padding:64px;font-family:Montserrat">
      <div style="font-size:24px;text-transform:uppercase;letter-spacing:0.2em;color:#02CC74">Golgana</div>
      <div style="margin-top:auto;display:flex;flex-direction:column">
        <div style="font-family:'Bebas Neue';font-size:160px;line-height:0.9;text-transform:uppercase">${data.title}</div>
        <div style="font-size:32px;color:rgba(255,255,255,0.7);margin-top:16px">${data.subtitle}</div>
      </div>
    </div>
  `);
}

export function ogSeleccionTemplate(data: { name: string; subtitle: string; flag: string }) {
  return satoriHtml(`
    <div style="display:flex;width:1200px;height:630px;background:${BG_GRADIENT};color:#fff;padding:64px;font-family:Montserrat">
      <div style="font-size:240px;display:flex;align-items:center">${data.flag}</div>
      <div style="margin-left:64px;display:flex;flex-direction:column;justify-content:center">
        <div style="font-family:'Bebas Neue';font-size:120px;line-height:0.9">${data.name}</div>
        <div style="font-size:28px;color:rgba(255,255,255,0.7);margin-top:16px">${data.subtitle}</div>
      </div>
    </div>
  `);
}

export function ogPartidoTemplate(data: { local: string; visitante: string; fecha: string }) {
  return satoriHtml(`
    <div style="display:flex;flex-direction:column;width:1200px;height:630px;background:${BG_GRADIENT};color:#fff;padding:64px;font-family:Montserrat">
      <div style="font-size:24px;text-transform:uppercase;letter-spacing:0.2em;color:#02CC74">Mundial 2026 · Golgana</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:48px;margin:auto 0">
        <div style="font-family:'Bebas Neue';font-size:96px">${data.local}</div>
        <div style="font-family:'Bebas Neue';font-size:144px;color:#02CC74">VS</div>
        <div style="font-family:'Bebas Neue';font-size:96px">${data.visitante}</div>
      </div>
      <div style="font-size:32px;color:rgba(255,255,255,0.7);text-align:center">${data.fecha}</div>
    </div>
  `);
}

export function ogArticuloTemplate(data: { titulo: string; kicker: string }) {
  return satoriHtml(`
    <div style="display:flex;flex-direction:column;width:1200px;height:630px;background:${BG_GRADIENT};color:#fff;padding:64px;font-family:Montserrat">
      <div style="font-size:24px;text-transform:uppercase;letter-spacing:0.2em;color:#02CC74">${data.kicker} · Golgana</div>
      <div style="margin-top:auto;font-family:'Bebas Neue';font-size:96px;line-height:1">${data.titulo}</div>
    </div>
  `);
}
