"use client";

import { useEffect, useRef, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { GitHubContributions, GitHubContributionDay } from "@/lib/github-core";

const levels = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

export function relativeTime(date: string, now: number) {
  const seconds = Math.round((new Date(date).getTime()-now)/1000);
  const formatter = new Intl.RelativeTimeFormat("en",{numeric:"auto"});
  if(Math.abs(seconds)<60)return formatter.format(seconds,"second");
  if(Math.abs(seconds)<3600)return formatter.format(Math.round(seconds/60),"minute");
  if(Math.abs(seconds)<86400)return formatter.format(Math.round(seconds/3600),"hour");
  if(Math.abs(seconds)<2592000)return formatter.format(Math.round(seconds/86400),"day");
  if(Math.abs(seconds)<31536000)return formatter.format(Math.round(seconds/2592000),"month");
  return formatter.format(Math.round(seconds/31536000),"year");
}

export function RelativeTime({ date, initial }: {date:string;initial:string}) {
  const [label,setLabel]=useState(initial);
  useEffect(()=>{const update=()=>setLabel(relativeTime(date,Date.now()));update();const timer=setInterval(update,60000);return()=>clearInterval(timer);},[date]);
  return <time dateTime={date} title={new Date(date).toUTCString()}>{label}</time>;
}

export function ContributionGraph({ data }: {data:GitHubContributions}) {
  const ref=useRef<HTMLDivElement>(null);
  const [activeDate,setActiveDate]=useState<string>();
  const activeDay=data.days.find(day=>day.date===activeDate);
  const startDay=data.days[0] ? new Date(`${data.days[0].date}T00:00:00Z`).getUTCDay() : 0;
  const cells:(GitHubContributionDay|null)[]=[...Array.from({length:startDay},()=>null),...data.days];
  const columns=Math.ceil(cells.length/7);
  while(cells.length%7)cells.push(null);
  const months=Array.from({length:columns},(_,index)=>{
    const day=cells.slice(index*7,index*7+7).find(Boolean);
    const previous=cells.slice((index-1)*7,index*7).find(Boolean);
    return day&&(!previous||day.date.slice(0,7)!==previous.date.slice(0,7)) ? new Date(`${day.date}T00:00:00Z`).toLocaleDateString("en",{month:"short",timeZone:"UTC"}) : "";
  });
  const template=`repeat(${Math.max(columns,1)},minmax(0,1fr))`;
  const formatter=new Intl.DateTimeFormat("en",{dateStyle:"long",timeZone:"UTC"});
  return <div className="contribution-card"><div className="contribution-summary"><strong>{data.total.toLocaleString("en")} contributions in the last 12 months</strong><span className="eyebrow">COMMIT BY COMMIT</span></div>{!data.days.length?<p className="github-unavailable">No contribution dates returned by GitHub.</p>:<Tooltip.Provider delayDuration={100}><div className="contribution-scroll" tabIndex={0} aria-label="12-month contribution calendar. Scroll horizontally on small screens."><div className="contribution-months" style={{gridTemplateColumns:template}} aria-hidden="true">{months.map((month,i)=><span key={i}>{month}</span>)}</div><div ref={ref} className="contribution-grid" style={{gridTemplateColumns:template}} role="group" aria-label={`${data.total} contributions from ${data.from.slice(0,10)} to ${data.to.slice(0,10)}. Arrow keys move between dates.`}>{cells.map((day,i)=>{
    if(!day)return <span key={`blank-${i}`} className="contribution-cell empty" aria-hidden="true"/>;
    const label=`${formatter.format(new Date(`${day.date}T00:00:00Z`))}: ${day.count} ${day.count===1?"contribution":"contributions"}`;
    return <Tooltip.Root key={day.date}><Tooltip.Trigger asChild><button type="button" className="contribution-cell" data-level={levels[day.level]} data-date={day.date} aria-label={label} onClick={()=>setActiveDate(day.date)} onFocus={()=>setActiveDate(day.date)} onKeyDown={event=>{
      const direction=event.key==="ArrowRight"?7:event.key==="ArrowLeft"?-7:event.key==="ArrowDown"?1:event.key==="ArrowUp"?-1:0;
      if(!direction)return;event.preventDefault();const target=cells[i+direction];if(target)ref.current?.querySelector<HTMLButtonElement>(`[data-date="${target.date}"]`)?.focus();
    }}/></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="graph-tooltip" sideOffset={7}>{label}<Tooltip.Arrow/></Tooltip.Content></Tooltip.Portal></Tooltip.Root>;
  })}</div></div></Tooltip.Provider>}<div className="contribution-legend"><span aria-live="polite">{activeDay?`${activeDay.date}: ${activeDay.count} ${activeDay.count===1?"contribution":"contributions"}`:"Every square is a real day. Focus to explore."}</span><span className="legend-scale">Less {[0,1,2,3,4].map(i=><i key={i} style={{background:`var(--heat-${i})`}}/>)} More</span></div></div>;
}
