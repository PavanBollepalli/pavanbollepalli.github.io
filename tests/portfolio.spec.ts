import { test, expect } from "@playwright/test";
import { build } from "esbuild";
import { readFile } from "node:fs/promises";
import path from "node:path";

const origin = process.env.PORTFOLIO_TEST_URL ?? "http://localhost:3000";

test.use({ channel: "msedge", viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });

test("home renders real content without overflow at desktop, phone and landscape widths", async ({ page }) => {
  const errors:string[]=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto(origin);
  await expect(page.getByRole("heading",{name:/Intelligent systems\.\s*Engineered to last\./})).toBeVisible();
  await expect(page.locator("#github")).toContainText("Recent public pushes");
  for(const width of [1440,1024,768,640,375,320,812]) {
    await page.setViewportSize({width,height:width===812?375:1000});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
    expect(overflow,`page overflow at ${width}px`).toBe(false);
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:"test-results/home-desktop.png"});
  await page.setViewportSize({width:375,height:812});
  await page.screenshot({path:"test-results/home-mobile.png"});
  expect(errors).toEqual([]);
});

test("navigation, searchable command palette and empty search state", async ({ page }) => {
  await page.goto(origin);
  await page.getByRole("button",{name:"Search portfolio (Control or Command K)"}).click();
  const dialog=page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.getByRole("textbox",{name:"Search pages and projects"}).fill("nothing-will-match-this");
  await expect(dialog).toContainText("No matches");
  await page.getByRole("textbox").fill("SkillVector");
  await dialog.getByRole("link",{name:"PROJECT SkillVector"}).click();
  await expect(page).toHaveURL(/\/work\/skillvector$/);
  await expect(dialog).not.toBeVisible();
  await page.keyboard.press("Control+k");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page.getByRole("navigation",{name:"Primary navigation"}).getByRole("link",{name:"About"}).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator("#experience")).toContainText("Wikimedia Foundation");
  await expect(page.locator("#github")).toContainText("Pinned on GitHub");
});

test("case study labs expose supported, unsupported, warm, cold and duplicate paths", async ({ page }) => {
  await page.goto(`${origin}/work/skillvector`);
  await page.getByRole("button",{name:"Cold query",exact:true}).click();
  await expect(page.locator(".lab-explanation")).toContainText("cold miss");
  await expect(page.locator(".pipeline-node.active")).toHaveCount(4);
  await page.getByRole("button",{name:"Duplicate request",exact:true}).click();
  await expect(page.locator(".pipeline-node.active")).toHaveCount(1);
  await expect(page.locator(".lab-explanation")).toContainText("duplicate");
  await page.goto(`${origin}/work/flash-resume`);
  await page.getByRole("button",{name:"Unsupported claim",exact:true}).click();
  await expect(page.locator(".evidence-path")).toContainText("Excluded from claims");
  await page.getByRole("button",{name:"Documented skill",exact:true}).click();
  await expect(page.locator(".evidence-path")).toContainText("Eligible for tailoring");
  await page.setViewportSize({width:375,height:812});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
});

test("stack filters and theme preferences are accessible and persist", async ({ page }) => {
  await page.goto(origin);
  await page.getByRole("button",{name:"AI",exact:true}).click();
  await expect(page.locator(".tech-tag")).toHaveCount(6);
  await expect(page.locator(".tech-tag")).not.toContainText(["Docker"]);
  for(const [group,count] of [["Frontend",4],["Backend",5],["Tools",7]] as const) {
    await page.getByRole("button",{name:group,exact:true}).click();
    await expect(page.locator(".tech-tag")).toHaveCount(count);
  }
  await page.getByRole("button",{name:"All",exact:true}).click();
  await expect(page.locator(".tech-tag")).toHaveCount(22);
  await page.locator(".bento-section").screenshot({path:"test-results/bento-desktop.png"});
  await page.setViewportSize({width:375,height:812});
  const row=page.locator(".stack-row").first();
  await row.focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(()=>row.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
  await page.locator(".bento-section").screenshot({path:"test-results/bento-mobile.png"});
  await page.setViewportSize({width:1440,height:1000});
  await page.getByRole("button",{name:"Switch to light theme"}).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme","light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme","light");
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:"test-results/home-light.png"});
  await page.getByRole("button",{name:"Switch to dark theme"}).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
});

test("notes, résumé, project pages and 404 are navigable", async ({ page, request }) => {
  for(const route of ["/work","/work/codeatlas","/notes","/notes/retrieval-before-generation","/notes/evidence-not-confidence","/notes/indexes-and-open-source"]) {
    await page.goto(`${origin}${route}`);
    await expect(page.locator("h1")).toBeVisible();
    await page.setViewportSize({width:375,height:812});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),`overflow in ${route}`).toBe(false);
  }
  const resume=await request.get(`${origin}/assets/Pavan-Bollepalli-Resume.pdf`);
  expect(resume.ok()).toBe(true);
  expect(resume.headers()["content-type"]).toContain("application/pdf");
  await page.goto(`${origin}/this-route-does-not-exist`);
  await expect(page.getByRole("heading",{name:"This path ends here."})).toBeVisible();
  await page.getByRole("link",{name:"Back to home"}).click();
  await expect(page).toHaveURL(`${origin}/`);
});

test("isolated contribution graph uses exact fixture counts, keyboard tooltips and reduced motion", async ({ page }) => {
  const component=path.resolve("components/contribution-graph.tsx").replaceAll("\\","/");
  const result=await build({stdin:{contents:`import React from 'react'; import {createRoot} from 'react-dom/client'; import {ContributionGraph} from '${component}'; createRoot(document.getElementById('root')).render(React.createElement(ContributionGraph,{data:{from:'2026-10-18T00:00:00Z',to:'2026-10-20T00:00:00Z',total:3,days:[{date:'2026-10-18',count:0,level:'NONE'},{date:'2026-10-19',count:1,level:'FIRST_QUARTILE'},{date:'2026-10-20',count:2,level:'SECOND_QUARTILE'}]}}));`,resolveDir:process.cwd(),loader:"tsx"},bundle:true,write:false,format:"iife",platform:"browser",jsx:"automatic",define:{"process.env.NODE_ENV":"'production'"}});
  await page.goto("about:blank");
  await page.setContent('<html><body><div id="root" style="max-width:320px"></div></body></html>');
  const css=(await readFile("app/globals.css","utf8")).replace(/^@import[^;]+;\s*/gm,"");
  await page.addStyleTag({content:css});
  await page.addScriptTag({content:result.outputFiles[0].text});
  const cells=page.getByRole("button");
  await expect(cells).toHaveCount(3);
  await expect(cells.first()).toHaveAttribute("aria-label","October 18, 2026: 0 contributions");
  await cells.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(cells.nth(1)).toBeFocused();
  await expect(page.getByRole("tooltip")).toContainText("October 19, 2026: 1 contribution");
  await expect(page.locator(".contribution-legend")).toContainText("2026-10-19: 1 contribution");
  const background=await cells.nth(1).evaluate(element=>getComputedStyle(element).backgroundColor);
  expect(background).toBe("rgb(39, 56, 99)");
  expect(await page.evaluate(()=>matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
});

test("animation responds to motion preferences and email copying reports success and failure", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read","clipboard-write"],{origin});
  await page.emulateMedia({reducedMotion:"no-preference"});
  await page.goto(origin);
  const wire=page.locator(".data-wire").first();
  await expect(wire).toHaveCSS("animation-name","data-flow");
  const portrait=page.locator(".tilt.portrait-artifact");
  await expect.poll(async()=>{
    await page.mouse.move(0,0);
    await portrait.hover({position:{x:20,y:20}});
    return portrait.evaluate(element=>element.style.getPropertyValue("--rx"));
  }).not.toBe("");
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(wire).toHaveCSS("animation-name","none");
  await expect(portrait).toHaveCSS("transform","none");
  await page.getByRole("button",{name:"Copy email address"}).first().click();
  await expect(page.locator(".copy-feedback").first()).toHaveText("Copied!");
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe("pavanvenkatanagamanoj@gmail.com");
  await page.evaluate(()=>Object.defineProperty(navigator.clipboard,"writeText",{value:async()=>{throw new Error("Permission denied");}}));
  await page.getByRole("button",{name:"Copy email address"}).first().click();
  await expect(page.locator(".copy-feedback").first()).toHaveText("Please copy the email manually.");
});

test("core content and navigation remain usable without JavaScript", async ({ browser }) => {
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:812}});
  const page=await context.newPage();
  await page.goto(origin);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByRole("link",{name:"Explore my work"})).toBeVisible();
  await page.getByRole("link",{name:"Explore my work"}).click();
  await expect(page).toHaveURL(/\/work$/);
  await expect(page.getByRole("heading",{name:"SkillVector",exact:true})).toBeVisible();
  await context.close();
});

test("complete desktop hero fits the viewport with readable supporting copy", async ({ page }) => {
  await page.goto(origin);
  for (const viewport of [{width:1920,height:1080},{width:1440,height:900},{width:1366,height:768},{width:1024,height:768},{width:1280,height:720}]) {
    await page.setViewportSize(viewport);
    await page.evaluate(()=>scrollTo(0,0));
    const layout=await page.evaluate(()=>{
      const hero=document.querySelector(".hero")!.getBoundingClientRect();
      const actions=document.querySelector(".hero-actions")!.getBoundingClientRect();
      const artifacts=document.querySelector(".hero-artifacts")!.getBoundingClientRect();
      const cards=[...document.querySelectorAll(".portrait-artifact,.code-artifact")].map(el=>el.getBoundingClientRect());
      const strip=document.querySelector(".hero-strip")!.getBoundingClientRect();
      return {bottom:hero.bottom,actionsBottom:actions.bottom,artifactsTop:artifacts.top,cardsTop:Math.min(...cards.map(box=>box.top)),cardsBottom:Math.max(...cards.map(box=>box.bottom)),stripTop:strip.top,font:parseFloat(getComputedStyle(document.querySelector(".hero-description")!).fontSize),overflow:document.documentElement.scrollWidth>innerWidth+1};
    });
    expect(layout.bottom,`hero bottom at ${viewport.width}×${viewport.height}`).toBeLessThanOrEqual(viewport.height+1);
    expect(layout.actionsBottom,`hero rows overlap at ${viewport.width}px`).toBeLessThanOrEqual(layout.artifactsTop+8);
    expect(layout.cardsTop,`cards overlap CTA at ${viewport.width}px`).toBeGreaterThanOrEqual(layout.actionsBottom);
    expect(layout.cardsBottom,`cards overlap strip at ${viewport.width}px`).toBeLessThanOrEqual(layout.stripTop);
    expect(layout.font).toBeGreaterThanOrEqual(16);
    expect(layout.overflow).toBe(false);
    await page.screenshot({path:`test-results/hero-${viewport.width}-${viewport.height}.png`});
  }
});

test("greeting follows local time and gives way to usable navigation", async ({ browser }) => {
  const context=await browser.newContext({timezoneId:"Asia/Kolkata",viewport:{width:1440,height:900}});
  const page=await context.newPage();
  await page.clock.install({time:new Date("2026-10-26T03:30:00Z")});
  for(const [time,label] of [["03:30","Good morning"],["08:30","Good afternoon"],["14:30","Good evening"]]) {
    await page.clock.setFixedTime(new Date(`2026-10-26T${time}:00Z`));
    await page.goto(origin);
    const greeting=page.getByRole("button",{name:`${label}. Show navigation`});
    await expect(greeting).toBeVisible();
    await expect(page.locator("nav[aria-label='Primary navigation']")).toHaveAttribute("inert","");
    await page.clock.fastForward(2500);
    await expect(greeting).not.toBeVisible();
    await expect(page.getByRole("navigation").getByRole("link",{name:"Home",exact:true})).toBeVisible();
  }
  await page.reload();
  await expect(page.locator(".welcome-greeting")).toBeVisible();
  await page.getByRole("button",{name:"Search portfolio (Control or Command K)"}).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".welcome-greeting")).toHaveCount(0);
  await context.close();
});

test("project discovery, STAR summaries and ID card work with keyboard and mouse", async ({ page }) => {
  await page.goto(origin);
  const project=page.locator(".project-row").first();
  await expect(project.locator(".project-star dt")).toHaveText(["situation","task","action","Response / result"]);
  await expect(project.locator(".star-result")).toContainText("9.6s → 0.48s");
  const discover=project.locator(".discover-link");
  await discover.focus();
  await expect(discover.locator(".discover-cursor")).toHaveCSS("opacity","1");
  await page.screenshot({path:"test-results/project-discovery.png"});
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/skillvector$/);
  await expect(page.locator(".case-star dt")).toHaveCount(4);
  await expect(page.locator(".case-sections")).toContainText("02 / THE TASK");
  await page.goto(origin);
  const card=page.getByRole("button",{name:"Flip Pavan’s ID card"});
  await card.focus();
  await page.keyboard.press("Space");
  await expect(card).toHaveAttribute("data-side","back");
  await expect(card.locator(".id-back")).toHaveAttribute("aria-hidden","false");
  await page.getByRole("button",{name:"Flip card",exact:true}).click();
  await expect(card).toHaveAttribute("data-side","front");
  await page.emulateMedia({reducedMotion:"no-preference"});
  await expect(page.locator(".lanyard-scene")).toHaveAttribute("data-reduced-motion","false");
  const hoverLink=page.locator(".discover-link").first();
  await hoverLink.hover({position:{x:120,y:130}});
  await expect(hoverLink).toHaveAttribute("data-discover-active","true");
  await card.scrollIntoViewIfNeeded();
  const box=await card.boundingBox();
  await page.mouse.move(box!.x+100,box!.y+150);
  await page.mouse.down();
  await page.mouse.move(box!.x+145,box!.y+170,{steps:8});
  await expect.poll(()=>page.locator(".lanyard-rig").evaluate(el=>el.style.transform)).not.toBe("none");
  await page.mouse.up();
  await expect(card).toHaveAttribute("data-side","front");
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.screenshot({path:"test-results/about-id.png"});
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(page.locator(".contact-particle")).toHaveCount(120);
  await expect(page.locator(".contact-particle").first()).toHaveCSS("animation-name","none");
  await expect(page.locator(".lanyard-scene")).toHaveAttribute("data-reduced-motion","true");
  await expect(page.locator(".lanyard-rig")).toHaveCSS("transform","none");
  await page.screenshot({path:"test-results/contact-scene.png"});
});

test("canonical routes, social previews and identity schema are present", async ({ page, request }) => {
  for(const route of ["/","/about","/work","/work/skillvector","/work/flash-resume","/work/codeatlas","/notes","/notes/retrieval-before-generation"]) {
    await page.goto(`${origin}${route}`);
    const canonical=route==="/"?"https://pavanbollepalli.me":`https://pavanbollepalli.me${route}`;
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href",canonical);
    await expect(page.locator("meta[property='og:url']")).toHaveAttribute("content",canonical);
    await expect(page.locator("meta[name='twitter:card']")).toHaveAttribute("content","summary_large_image");
    expect(await page.locator("h1").count()).toBe(1);
    const identity=await page.locator("script[type='application/ld+json']").evaluate(el=>JSON.parse(el.textContent!));
    expect(identity["@graph"][0].name).toBe("Pavan Bollepalli");
  }
  const image=await request.get(`${origin}/opengraph-image`);
  expect(image.ok()).toBe(true);
  expect(image.headers()["content-type"]).toContain("image/png");
  await page.goto(origin);
  await page.locator(".footer-name").scrollIntoViewIfNeeded();
  const alignment=await page.locator(".footer-name").evaluate(el=>({align:getComputedStyle(el).textAlign,overflow:el.scrollWidth>el.clientWidth+1}));
  expect(alignment).toEqual({align:"center",overflow:false});
});

test("phone touch controls expose discovery and flip the ID without hover", async ({ browser }) => {
  const context=await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:375,height:812},reducedMotion:"reduce"});
  const page=await context.newPage();
  const errors:string[]=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto(origin);
  const discover=page.locator(".discover-link").first();
  await discover.scrollIntoViewIfNeeded();
  await expect(discover.locator(".discover-cursor")).toHaveCSS("opacity","1");
  await discover.tap();
  await expect(page).toHaveURL(/\/work\/skillvector$/);
  await page.goto(origin);
  const card=page.getByRole("button",{name:"Flip Pavan’s ID card"});
  await card.tap();
  await expect(card).toHaveAttribute("data-side","back");
  await page.locator(".about-teaser").screenshot({path:"test-results/about-mobile.png"});
  await card.tap();
  await expect(card).toHaveAttribute("data-side","front");
  await page.locator("#contact").screenshot({path:"test-results/contact-mobile.png"});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)).toBe(false);
  expect(errors).toEqual([]);
  await context.close();
});
