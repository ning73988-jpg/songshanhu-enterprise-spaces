import { notFound } from "next/navigation";
import { Building2, ChevronLeft, MapPin } from "lucide-react";
import data from "@/data/listings.json";
import { sitePath } from "@/lib/site-path";

export function generateStaticParams() {
  return data.map(item => ({ id: item.id }));
}

export default async function ListingDetail({params}:{params:Promise<{id:string}>}) {
  const {id} = await params;
  const item = data.find(x=>x.id===id);
  if (!item) notFound();
  return <div className="site-shell"><header className="site-header"><a className="brand" href={sitePath("/")}><span className="brand-mark"><Building2 size={23}/></span><span><strong>松山湖企业选址</strong><small>园区与产业空间</small></span></a><span className="preview-pill">评审版 · 演示房源</span></header><main className="detail-main"><a href={sitePath("/")} className="back-link"><ChevronLeft size={18}/>返回房源列表</a><div className="detail-layout"><div><div className="detail-image"><img src={sitePath(item.image)} alt="演示房源占位图"/></div><div className="detail-note">此图为项目原有占位素材，并非该房源实拍。</div><section className="detail-section"><h2>房源信息</h2><div className="facts"><div><span>业态</span><strong>{item.category}</strong></div><div><span>所在园区</span><strong>{item.park}</strong></div><div><span>房号</span><strong>{item.unit}</strong></div><div><span>楼层</span><strong>{item.floor}</strong></div><div><span>面积</span><strong>{item.area.toLocaleString("zh-CN")}㎡</strong></div><div><span>装修</span><strong>{item.decoration}</strong></div><div><span>朝向</span><strong>{item.facing}</strong></div><div><span>格局</span><strong>{item.layout}</strong></div></div></section></div><aside className="detail-summary"><span className="eyebrow">演示房源 · {item.category}</span><h1>{item.park} · {item.unit}</h1><p className="park-name"><MapPin size={16}/>{item.park}</p><div className="detail-price"><strong>¥{item.price}</strong><span> /㎡·月</span></div><p>物业费 ¥{item.fee}/㎡·月</p><div className="detail-alert">该条信息来自 {item.source}，尚未核实真实在租状态与价格。正式上线前将替换为真实房源资料。</div></aside></div></main><footer>松山湖企业选址 · 网站评审版</footer></div>;
}
