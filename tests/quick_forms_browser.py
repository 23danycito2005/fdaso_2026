"""Registro rápido sin aprobar condiciones técnicas ni perder datos importados."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
BASE=os.environ.get('PITOCUNA_TEST_URL','http://127.0.0.1:8767/')
OUT=ROOT/'test-results';OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/chromium')
    page=b.new_page(viewport={'width':1280,'height':900});errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'#actividades')
    expect(page.locator('h1')).to_contain_text('Actividades')
    before=page.evaluate('JSON.parse(localStorage.getItem("pitocuna.production.v3"))')
    original=next(a for a in before['activities'] if a['id']=='MSP-4')
    page.locator('[data-action="activity"][data-id="MSP-4"]').first.click()
    page.locator('#modal [data-action="restriction"]').click()
    expect(page.locator('[data-link-activity]')).to_have_value('MSP-4')
    expect(page.locator('[data-link-date]')).to_have_value(original['start'])
    assert not page.locator('[name="category"]').is_visible()
    assert page.locator('[name="reopen"]').count()==0
    page.locator('[name="title"]').fill('Material pendiente · prueba')
    page.locator('[name="owner"]').fill('Responsable de prueba')
    page.screenshot(path=str(OUT/'restriccion-rapida.png'))
    page.locator('#modal [type="submit"]').click()
    saved=page.evaluate('JSON.parse(localStorage.getItem("pitocuna.production.v3"))')
    r=saved['restrictions'][0]
    assert r['category']=='Sin clasificar' and r['estimated'] is None and not r['evidence']
    def edit_restriction():
        page.locator('[data-action="activity"][data-id="MSP-4"]').first.click()
        page.locator('#modal [data-action="edit-restriction"]').click()
    edit_restriction()
    page.locator('[data-form="restriction"] summary').click()
    page.locator('[name="category"]').select_option('Seguridad')
    page.locator('[name="estimated"]').fill('2026-05-02')
    page.locator('#modal [type="submit"]').click()
    edit_restriction()
    page.locator('[name="title"]').fill('Pendiente de seguridad · prueba')
    page.locator('#modal [type="submit"]').click()
    saved=page.evaluate('JSON.parse(localStorage.getItem("pitocuna.production.v3"))')
    assert saved['restrictions'][0]['category']=='Seguridad'
    assert saved['restrictions'][0]['estimated']=='2026-05-02'
    page.locator('[data-action="activity"][data-id="MSP-4"]').first.click()
    page.locator('#modal [data-action="edit-activity"]').click()
    assert not page.locator('[name="predecessors"]').is_visible()
    page.locator('[name="location"]').fill('Ubicación de prueba')
    page.locator('[name="crew"]').fill('Cuadrilla de prueba')
    page.locator('#modal [type="submit"]').click()
    expect(page.locator('#modal')).not_to_be_visible()
    saved=page.evaluate('JSON.parse(localStorage.getItem("pitocuna.production.v3"))')
    edited=next(a for a in saved['activities'] if a['id']=='MSP-4')
    for key in ['code','source','sourceWBS','predecessors','predecessorLinks','importedPredecessorLinks','importIssues']:
        assert edited[key]==original[key],key
    assert edited['location']=='Ubicación de prueba' and not edited.get('preparation')
    page.locator('nav [data-view="datos"]').click()
    page.locator('[data-action="edit-activity"]').click()
    page.locator('[name="name"]').fill('Nueva actividad de prueba')
    page.set_viewport_size({'width':390,'height':844})
    assert page.locator('#modal').evaluate('(e)=>e.scrollWidth<=e.clientWidth')
    page.screenshot(path=str(OUT/'actividad-rapida-movil.png'))
    page.locator('#modal [type="submit"]').click()
    expect(page.locator('#modal')).not_to_be_visible()
    saved=page.evaluate('JSON.parse(localStorage.getItem("pitocuna.production.v3"))')
    a=saved['activities'][-1]
    assert a['id'].startswith('ACT-') and a['code']==a['id']
    assert a['name']=='Nueva actividad de prueba' and not a['location'] and not a['crew']
    assert not a['flowGroup'] and a['order'] is None and not a.get('preparation')
    assert not saved['progress'] and not saved['plans']
    assert not errors,errors
    b.close()
print('PASS: restricción con contexto, fecha sugerida, actividad rápida y conservación de restricciones técnicas de Project; móvil sin desbordamiento.')
