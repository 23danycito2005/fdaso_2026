"""Verifica la carga del expediente real y sus enlaces CAD en un servidor HTTP local."""
from pathlib import Path
import json,os
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
BASE=os.environ.get('PITOCUNA_TEST_URL','http://127.0.0.1:8766/')
OUTPUT=ROOT/'test-results';OUTPUT.mkdir(exist_ok=True)
with sync_playwright()as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium');context=browser.new_context(viewport={'width':1600,'height':1100});page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE+'?expediente=20261018#planos');expect(page.locator('h1')).to_have_text('Planos vinculados al proyecto');page.wait_for_function('document.querySelector("#cad-image")?.complete && document.querySelector("#cad-image")?.naturalWidth > 0');state=page.evaluate("JSON.parse(localStorage.getItem('pitocuna.production.v3'))");assert len(state['drawings'])==15 and len(state['measures'])==705 and len(state['activities'])==718
 assert not state['progress'] and not state['plans']
 for d in state['drawings']:
  page.locator(f'[data-action="plan-component"][data-id="{d["componentId"]}"]').click();page.locator(f'[data-action="plan-drawing"][data-id="{d["id"]}"]').click();page.wait_for_function('document.querySelector("#cad-image")?.complete && document.querySelector("#cad-image")?.naturalWidth > 0');expect(page.locator('.cad-toolbar')).to_contain_text(d['fileName']);response=page.request.head(BASE+d['original']);assert response.ok,d['original']
  if d['id']in ['viv_arquitectura','pri_sanitaria','ini_disposicion']:
   page.screenshot(path=str(OUTPUT/(d['id']+'-vinculado.png')),full_page=False)
 print('PASS: 15 vistas CAD y originales DWG disponibles; componentes, tareas y metrados cargados')
 page.locator('[data-action="plan-component"][data-id="ubs-viviendas"]').click();page.locator('[data-action="plan-drawing"][data-id="viv_arquitectura"]').click();page.wait_for_function('document.querySelector("#cad-image")?.complete && document.querySelector("#cad-image")?.naturalWidth > 0');page.locator('[data-action="pin-measure"]').first.click();box=page.locator('#cad-sheet').bounding_box();page.mouse.click(box['x']+box['width']*.5,box['y']+box['height']*.5);expect(page.locator('.cad-pin')).to_have_count(1);page.reload();expect(page.locator('.cad-pin')).to_have_count(1);saved=page.evaluate("JSON.parse(localStorage.getItem('pitocuna.production.v3'))");assert len(saved['drawingPins'])==1 and not saved['progress'];page.locator('.cad-pin').click();expect(page.locator('#modal')).to_contain_text('Partida marcada');page.locator('[data-action="remove-pin"]').click();expect(page.locator('.cad-pin')).to_have_count(0)
 print('PASS: marca de partida en plano, persistencia y retiro sin crear avance ficticio')
 page.locator('[data-action="activity"]').first.click();expect(page.locator('#modal [data-action="go-plan"]')).to_have_count(1);page.locator('#modal [data-action="go-plan"]').click();expect(page.locator('#modal')).not_to_be_visible();expect(page.locator('.cad-toolbar')).to_contain_text('ARQUITECTURA')
 page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(OUTPUT/'planos-movil.png'),full_page=False);assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+1')
 page.set_viewport_size({'width':1600,'height':1100});page.locator('#cad-viewport').scroll_into_view_if_needed();page.screenshot(path=str(OUTPUT/'planos-resultado.png'),full_page=False)
 assert not errors,errors
 print('PASS: enlaces tarea → plano y navegación móvil sin errores JavaScript');browser.close()
