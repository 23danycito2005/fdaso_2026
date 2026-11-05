"""Aislamiento y recuperación exacta de los datos al probar ejemplos ficticios."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
BASE=os.environ.get('PITOCUNA_TEST_URL','http://127.0.0.1:8767/')
OUT=Path(__file__).resolve().parents[1]/'test-results';OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/chromium')
    page=b.new_page(viewport={'width':1440,'height':1000});errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('dialog',lambda d:d.accept())
    page.goto(BASE)
    expect(page.locator('h1')).to_be_visible()
    # A user edit must survive entry, reload, reset and exit of the practice session.
    page.locator('#cut-date').fill('2026-05-02');page.locator('#cut-date').dispatch_event('change')
    original=page.evaluate('localStorage.getItem("pitocuna.production.v3")')
    archive=page.evaluate('localStorage.getItem("pitocuna.previous.v3")')
    page.locator('[data-action="practice-start"]').click()
    expect(page.locator('#practice-bar')).to_contain_text('Modo de prueba')
    expect(page.locator('.ticket')).to_have_count(4)
    assert page.evaluate('JSON.parse(localStorage.getItem("pitocuna.practice.v1")).plans[0].members.length')==2
    assert page.evaluate('localStorage.getItem("pitocuna.production.v3")')==original
    page.screenshot(path=str(OUT/'prueba-restricciones.png'))
    page.locator('[data-action="restriction"][data-id=""]').click()
    page.locator('[name="title"]').fill('Idea de prueba · bloqueo adicional')
    page.locator('[name="owner"]').fill('Responsable ficticio adicional')
    page.locator('[data-link-activity]').select_option('RV-01')
    page.locator('#modal [type="submit"]').click()
    expect(page.locator('.ticket')).to_have_count(5)
    page.reload()
    expect(page.locator('.ticket')).to_have_count(5)
    expect(page.locator('#practice-bar')).to_contain_text('Modo de prueba')
    assert page.evaluate('localStorage.getItem("pitocuna.production.v3")')==original
    assert page.evaluate('localStorage.getItem("pitocuna.previous.v3")')==archive
    page.locator('nav [data-view="semanal"]').click()
    expect(page.locator('#main')).to_contain_text('Plan congelado')
    page.locator('nav [data-view="planos"]').click()
    page.locator('.visual-tabs [href="#flujo"]').click()
    expect(page.locator('.svg-wrap svg')).to_be_visible()
    page.locator('[data-action="practice-reset"]').click()
    expect(page.locator('.ticket')).to_have_count(4)
    page.set_viewport_size({'width':390,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    expect(page.locator('[data-action="practice-exit"]')).to_be_visible()
    page.locator('[data-action="practice-exit"]').click()
    assert page.evaluate('localStorage.getItem("pitocuna.production.v3")')==original
    assert page.evaluate('localStorage.getItem("pitocuna.previous.v3")')==archive
    expect(page.locator('#cut-date')).to_have_value('2026-05-02')
    page.reload()
    expect(page.locator('[data-action="practice-start"]')).to_be_visible()
    assert page.evaluate('localStorage.getItem("pitocuna.production.v3")')==original
    # Failed storage cannot put the application into a trial without a recoverable original.
    page.evaluate('()=>{window.realSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==="pitocuna.practice.active")throw Error("Escritura bloqueada para la prueba");return window.realSetItem.call(this,k,v)}}')
    page.locator('[data-action="practice-start"]').click()
    expect(page.locator('#toast')).to_contain_text('Escritura bloqueada')
    expect(page.locator('[data-action="practice-start"]')).to_be_visible()
    assert page.evaluate('localStorage.getItem("pitocuna.production.v3")')==original
    assert not errors,errors
    b.close()
print('PASS: ejemplo, restricciones nuevas, plan y LBMS, recarga, reinicio, móvil, recuperación exacta y fallo de almacenamiento sin perder el original.')
