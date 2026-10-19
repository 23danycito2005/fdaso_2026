"""Recorrido del expediente real: filtros, fichas, correspondencias y restricciones."""
import os, csv
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
BASE=os.environ.get('PITOCUNA_TEST_URL','http://127.0.0.1:8767/')
OUT=ROOT/'test-results'; OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium')
    context=browser.new_context(viewport={'width':1440,'height':1000})
    page=context.new_page(); errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.goto(BASE)
    expect(page.locator('h1')).to_have_text('Del cronograma al trabajo preparado')
    expect(page.locator('.stat').first).to_contain_text('443 / 716')
    page.screenshot(path=str(OUT/'proyecto-conectado.png'),full_page=True)
    page.locator('nav [data-view="actividades"]').click()
    page.locator('#component-scope').select_option('ubs-viviendas')
    expect(page.locator('.data-table tbody tr')).to_have_count(30)
    page.locator('[name="query"]').fill('CONCRETO')
    page.locator('[data-form="search-activities"] [type="submit"]').click()
    assert 0<page.locator('.data-table tbody tr').count()<30
    page.locator('nav [data-view="lookahead"]').click()
    expect(page.locator('#component-scope')).to_have_value('ubs-viviendas')
    page.locator('nav [data-view="planos"]').click()
    expect(page.locator('#component-scope')).to_have_value('ubs-viviendas')
    page.wait_for_function('document.querySelector("#cad-image")?.naturalWidth>0')
    page.locator('[data-action="activity"]').first.click()
    expect(page.locator('#modal-body')).to_contain_text('Expediente de esta actividad')
    expect(page.locator('#modal-body')).to_contain_text('Cantidad del expediente')
    activity_id=page.locator('#modal-title').inner_text().split(' · ')[0]
    page.screenshot(path=str(OUT/'ficha-correlacionada.png'))
    page.locator('#modal [data-action="restriction"]').click()
    page.locator('[name="title"]').fill('Verificar entrega del material · prueba')
    page.locator('[name="owner"]').fill('Responsable de prueba')
    page.locator('[name="estimated"]').fill('2026-05-15')
    page.locator('[data-link-date]').fill('2026-05-16')
    page.locator('[data-action="add-restriction-link"]').click()
    last=page.locator('.restriction-link-row').last
    options=last.locator('option').evaluate_all('(els)=>els.map(e=>e.value).filter(Boolean)')
    last.locator('select').select_option(next(x for x in options if x!=activity_id))
    last.locator('input').fill('2026-05-17')
    page.locator('#modal [type="submit"]').click()
    expect(page.locator('#modal')).not_to_be_visible()
    page.locator('nav [data-view="restricciones"]').click()
    expect(page.locator('.ticket')).to_have_count(1)
    expect(page.locator('.ticket [data-action="activity"]')).to_have_count(2)
    page.locator('#component-scope').select_option('captacion')
    expect(page.locator('.ticket')).to_have_count(0)
    page.locator('#component-scope').select_option('ubs-viviendas')
    page.locator('.ticket [data-action="activity"]').first.click()
    expect(page.locator('#modal-body')).to_contain_text('Verificar entrega del material · prueba')
    page.locator('#close-modal').click()
    page.locator('nav [data-view="actividades"]').click()
    page.locator('#component-scope').select_option('provisionales')
    page.locator('[name="query"]').fill('MSP-3')
    page.locator('[data-form="search-activities"] [type="submit"]').click()
    page.locator('[data-action="activity"]').first.click()
    expect(page.locator('#modal-body')).to_contain_text('la descripción difiere')
    page.locator('[data-action="review-link"]').click()
    page.locator('[name="reviewer"]').fill('Revisor de prueba')
    page.locator('[name="note"]').fill('Validación ficticia de correspondencia para comprobar persistencia; no es aprobación técnica.')
    page.locator('[data-form="document-link"] [type="checkbox"]').check()
    page.locator('[data-form="document-link"] [type="submit"]').click()
    expect(page.locator('#modal-body')).to_contain_text('Correspondencia revisada')
    saved=page.evaluate('JSON.parse(localStorage.getItem("pitocuna.production.v3"))')
    assert len(saved['documentLinks'])==1 and len(saved['restrictions'][0]['links'])==2
    assert saved['progress']==[] and saved['plans']==[]
    assert all(a['location']=='' for a in saved['activities'])
    page.reload()
    page.locator('#component-scope').select_option('provisionales')
    page.locator('[data-action="activity"][data-id="MSP-3"]').first.click()
    expect(page.locator('#modal-body')).to_contain_text('Revisor de prueba')
    page.locator('#close-modal').click()
    with page.expect_download() as event:
        page.locator('[data-action="export-trace"]').click()
    event.value.save_as(OUT/'trazabilidad-prueba.csv')
    with (OUT/'trazabilidad-prueba.csv').open(encoding='utf-8-sig',newline='') as f:
        records=list(csv.reader(f,delimiter=';'))
    assert len(records)==3 and records[1][5]=='01.01.01'
    assert records[1][-2]=='Revisor de prueba'
    page.set_viewport_size({'width':390,'height':844})
    for view in ['inicio','actividades','lookahead','restricciones','semanal','avance','indicadores','datos','planos']:
        page.locator(f'nav [data-view="{view}"]').click()
        expect(page.locator('h1')).to_be_visible()
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),view
    page.locator('nav [data-view="actividades"]').click()
    page.screenshot(path=str(OUT/'actividades-movil.png'),full_page=True)
    assert not errors,errors
    browser.close()
print('PASS: expediente conectado, búsqueda, componente compartido, CAD, ficha, restricciones con varios vínculos, revisión persistente y nueve vistas móviles.')
