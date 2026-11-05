"""El visor CAD y LBMS comparten espacio y componente, sin generar producción."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
BASE=os.environ.get('PITOCUNA_TEST_URL','http://127.0.0.1:8767/')
OUT=Path(__file__).resolve().parents[1]/'test-results';OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/chromium')
    page=b.new_page(viewport={'width':1440,'height':1000});errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'#planos')
    expect(page.locator('h1')).to_have_text('Visualización de obra')
    page.locator('#component-scope').select_option('ubs-inicial')
    page.wait_for_function('document.querySelector("#cad-image")?.naturalWidth>0')
    snapshot=page.evaluate('localStorage.getItem("pitocuna.production.v3")')
    page.locator('.visual-tabs a[href="#flujo"]').click()
    expect(page.locator('h1')).to_have_text('Visualización de obra')
    expect(page.locator('#component-scope')).to_have_value('ubs-inicial')
    expect(page.locator('nav [data-view="planos"]')).to_have_attribute('aria-current','page')
    expect(page.locator('#main')).to_contain_text('El flujo necesita ubicaciones definidas')
    assert page.locator('.svg-wrap svg').count()==0
    page.locator('.visual-tabs a[href="#planos"]').click()
    expect(page.locator('#component-scope')).to_have_value('ubs-inicial')
    page.wait_for_function('document.querySelector("#cad-image")?.naturalWidth>0')
    assert page.evaluate('localStorage.getItem("pitocuna.production.v3")')==snapshot
    page.screenshot(path=str(OUT/'visualizacion-cad.png'))
    page.set_viewport_size({'width':390,'height':844})
    page.locator('.visual-tabs a[href="#flujo"]').click()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.screenshot(path=str(OUT/'visualizacion-movil.png'),full_page=True)
    demo=b.new_context();tab=demo.new_page()
    tab.on('pageerror',lambda e:errors.append(str(e)))
    tab.goto(BASE+'?demo=1#lbms')
    expect(tab.locator('h1')).to_have_text('Visualización de obra')
    expect(tab.locator('.visual-tabs a[href="#flujo"]')).to_have_attribute('aria-current','page')
    expect(tab.locator('.svg-wrap svg')).to_be_visible()
    tab.locator('nav [data-view="avance"]').click()
    expect(tab.locator('h1')).to_have_text('Avance por ubicación')
    assert tab.locator('.svg-wrap svg').count()==0
    assert tab.locator('[data-action="progress"]').count()>0
    tab.locator('a[href="#flujo"]').click()
    expect(tab.locator('.svg-wrap svg')).to_be_visible()
    tab.screenshot(path=str(OUT/'visualizacion-lbms-demo.png'))
    assert not errors,errors
    b.close()
print('PASS: pestañas CAD/LBMS, componente compartido, ruta antigua, registro de avance y navegación móvil sin alterar datos.')
