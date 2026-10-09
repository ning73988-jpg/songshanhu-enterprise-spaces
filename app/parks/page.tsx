import { Building2, MapPin } from "lucide-react";
import data from "@/data/listings.json";
import { sitePath } from "@/lib/site-path";

export default function Parks() {
  const parks = Array.from(new Set(data.map(x=>x.park))).map(name=>({name,count:data.filter(x=>x.park===name).length,categories:Array.from(new Set(data.filter(x=>x.park===name).map(x=>x.category)))}));
  return <div className="site-shell"><header className="site-header"><a className="brand" href={sitePath("/")}><span className="brand-mark"><Building2 size={23}/></span><span><strong>松山湖企业选址</strong><small>园区与产业空间</small></span></a><span className="preview-pill">评审版 · 演示房源</span></header><main className="parks-main"><span className="eyebrow">园区目录</span><h1>覆盖园区</h1><p>根据两版演示内容汇总。具体地址与可租面积有待核实。</p><div className="parks-grid">{parks.map(p=><article className="park-card" key={p.name}><MapPin size={21}/><h2>{p.name}</h2><p>{p.categories.join(" · ")}</p><strong>{p.count} 条演示房源</strong></article>)}</div></main><footer>松山湖企业选址 · 网站评审版</footer></div>;
}
