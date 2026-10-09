"use client";

import { useMemo, useState } from "react";
import {
  Building2, Factory, BriefcaseBusiness, Search, Sparkles, Map,
  MessageSquare, Home as HomeIcon, SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import seed from "@/data/listings.json";
import { sitePath } from "@/lib/site-path";

type Listing = {
  id: string; category: string; park: string; unit: string; floor: string;
  area: number; price: number; fee: number; facing: string; layout: string;
  decoration: string; image: string; source: string;
};
const data = seed as Listing[];
const categories = ["全部", "写字楼", "厂房", "研发办公", "仓储"];
const quickSearches = ["光大We谷", "松湖智谷", "整层", "精装修", "带家具精装", "100-200㎡"];
function facingLabel(value: string) { return !value || value === "-" ? "" : value.includes("向") ? value : `${value}向`; }

export default function Home() {
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");
  const [park, setPark] = useState("全部园区");
  const [sort, setSort] = useState("默认排序");
  const [area, setArea] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [smartOpen, setSmartOpen] = useState(false);
  const [smartText, setSmartText] = useState("");
  const parks = useMemo(() => ["全部园区", ...Array.from(new Set(data.map(x => x.park)))], []);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = data.filter(x =>
      (category === "全部" || x.category === category) &&
      (park === "全部园区" || x.park === park) &&
      (!q || [x.park, x.unit, x.category, x.layout, x.decoration, x.facing].join(" ").toLowerCase().includes(q)) &&
      (area !== "100-200" || (x.area >= 100 && x.area <= 200)) &&
      (maxPrice === null || x.price <= maxPrice)
    );
    if (sort === "租金从低到高") result.sort((a,b) => a.price - b.price);
    if (sort === "面积从大到小") result.sort((a,b) => b.area - a.area);
    return result;
  }, [category, query, park, sort, area, maxPrice]);

  function quickSearch(value: string) {
    if (value === "100-200㎡") { setArea("100-200"); setQuery(""); return; }
    setArea("");
    if (parks.includes(value)) { setPark(value); setQuery(""); return; }
    setQuery(value);
  }
  function applySmart() {
    const text = smartText.trim();
    const foundPark = parks.find(x => x !== "全部园区" && text.includes(x));
    const foundCategory = categories.find(x => x !== "全部" && text.includes(x));
    const price = text.match(/(\d+)\s*元/);
    const term = ["整层", "带家具精装", "精装修", "简装", "毛坯"].find(x => text.includes(x));
    setPark(foundPark || "全部园区");
    setCategory(foundCategory || "全部");
    setMaxPrice(price ? Number(price[1]) : null);
    setArea(/100\s*[-到至]\s*200\s*(?:㎡|平)/.test(text) ? "100-200" : "");
    setQuery(term || "");
    setSmartOpen(false);
    document.getElementById("listings")?.scrollIntoView({behavior:"smooth"});
  }
  function reset() { setCategory("全部"); setQuery(""); setPark("全部园区"); setSort("默认排序"); setArea(""); setMaxPrice(null); }

  return <div className="site-shell">
    <div className="blue-stage">
      <header className="site-header"><a className="brand" href={sitePath("/")}><span className="brand-mark"><Building2 size={23}/></span><strong>松山湖产业招商</strong></a><nav aria-label="主导航"><a href="#listings">房源</a><a href={sitePath("/parks")}>园区</a><a href="#site-note">关于</a></nav><span className="review-badge">网站评审版</span></header>
      <section className="home-hero" aria-label="产业空间分类">
        <div className="hero-topline">园区直租 · 免佣看房 · 产业空间信息</div>
        <h1>松山湖产业招商</h1>
        <div className="hero-entries">
          <button onClick={() => setCategory("写字楼")} className="hero-entry"><Building2 size={27}/><strong>写字楼</strong><span>{data.filter(x=>x.category==="写字楼").length} 条演示房源</span></button>
          <button onClick={() => setCategory("厂房")} className="hero-entry"><Factory size={27}/><strong>厂房</strong><span>{data.filter(x=>x.category==="厂房").length} 条演示房源</span></button>
          <button onClick={() => setCategory("研发办公")} className="hero-entry"><BriefcaseBusiness size={27}/><strong>产业资源</strong><span>研发办公 · 仓储</span></button>
        </div>
        <div className="hero-stats"><div><strong>{data.length}</strong><span>演示房源</span></div><div><strong>{parks.length - 1}</strong><span>覆盖园区</span></div><div><strong>4</strong><span>空间业态</span></div></div>
      </section>
    </div>

    <main>
      <section className="searchbar" aria-label="搜索房源"><div className="search-row"><div className="search-input"><Search size={20}/><Input aria-label="搜索园区、楼栋、格局" placeholder="搜索园区 / 楼栋 / 格局" value={query} onChange={e=>setQuery(e.target.value)}/></div><Button className="ai-btn" onClick={()=>setSmartOpen(true)}><Sparkles size={17}/>AI找房</Button></div><div className="search-hot">{quickSearches.map(x=><button key={x} onClick={()=>quickSearch(x)}>{x}</button>)}</div></section>
      <section className="listing-area" id="listings"><div className="filter-bar"><span className="filter-label"><SlidersHorizontal size={17}/>筛选</span><select aria-label="业态" value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(x=><option key={x} value={x}>{x==="全部"?"业态不限":x}</option>)}</select><select aria-label="园区" value={park} onChange={e=>setPark(e.target.value)}>{parks.map(x=><option key={x} value={x}>{x==="全部园区"?"园区不限":x}</option>)}</select><select aria-label="排序" value={sort} onChange={e=>setSort(e.target.value)}>{["默认排序","租金从低到高","面积从大到小"].map(x=><option key={x}>{x}</option>)}</select><button className="reset-filter" onClick={reset}>重置</button></div>
        <div className="section-title"><h2>精选房源</h2><span>共 {shown.length} 条 · 演示资料</span></div>
        <div className="listing-list">{shown.map(x=><a href={sitePath('/listing/'+encodeURIComponent(x.id))} className="lcard" key={x.id}><div className="lcard-image"><img src={sitePath(x.image)} alt={`${x.park}房源占位图`}/><span className="new-tag">演示</span></div><div className="lcard-body"><span className="lcard-park">{x.park}</span><h3>{x.park} · {x.unit}</h3><p>{x.floor} · {x.area.toLocaleString("zh-CN")}㎡{facingLabel(x.facing) ? ` · ${facingLabel(x.facing)}` : ""}</p><div className="lcard-tags">{x.layout !== "-" && <span>{x.layout}</span>}<span>{x.decoration}</span></div><div className="lcard-bottom"><div className="lcard-price"><strong>{x.price}</strong><span> 元/㎡·月</span></div><small>物业 {x.fee} 元</small></div></div></a>)}</div>
        {shown.length===0 && <div className="empty-results">没有符合条件的演示房源，请调整筛选。</div>}
      </section>
    </main>
    <footer id="site-note">网站评审版 · 房源资料与图片均为演示内容，正式上线前需要核实更新。</footer>
    <div className="mobile-nav" aria-label="移动端导航"><a href={sitePath("/")} className="selected"><HomeIcon size={21}/>首页</a><a href={sitePath("/parks")}><Map size={21}/>园区</a><a href="#listings"><Search size={21}/>房源</a><a href="#site-note"><MessageSquare size={21}/>说明</a></div>
    <Dialog open={smartOpen} onOpenChange={setSmartOpen}><DialogContent className="smart-dialog"><DialogHeader><DialogTitle>AI 找房助手</DialogTitle><DialogDescription>评审版按园区、业态、租金和装修条件匹配演示房源；正式 AI 服务尚待接入。</DialogDescription></DialogHeader><Input value={smartText} onChange={e=>setSmartText(e.target.value)} placeholder="例如：光大We谷，50元以内，精装修" onKeyDown={e=>{if(e.key==="Enter") applySmart()}}/><DialogFooter><Button onClick={applySmart}>查看匹配房源</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
