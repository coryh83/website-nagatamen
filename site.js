const CALENDAR_FEED = "https://script.google.com/macros/s/AKfycbzAbv9V2sOCztKziGlSFVFz7oQauEe6Vq1L-KiAwYVKHoHZmo6TzI0hvQfUa3vDRNsI/exec";
const TIME_ZONE = "America/New_York";

const posts=[{tag:"CHAPTER NEWS",title:"Welcome to the New Nagatamen Drumbeat",text:"This new chapter site will make it easier to keep Arrowmen connected with events, service opportunities and chapter news.",date:"September 25, 2026"},{tag:"SERVICE",title:"Eagle Project Perpetual Care",text:"Our chapter continues its commitment to maintaining Eagle Scout projects throughout the district.",date:"September 2026"},{tag:"EVENTS",title:"See What's Coming Up",text:"Chapter meetings, service projects and lodge events will appear here automatically from our calendar.",date:"September 2026"}];

const eventGrid=document.querySelector("#event-grid");
const filters=document.querySelector("#event-filters");
let calendarEvents=[];

const cleanDescription=value=>{
  if(!value) return "";
  const div=document.createElement("div");
  div.innerHTML=value;
  return (div.textContent||div.innerText||"").replace(/\s+/g," ").trim();
};

const formatEvent=e=>{
  const start=new Date(e.start);
  const end=new Date(e.end);
  const day=new Intl.DateTimeFormat("en-US",{day:"2-digit",timeZone:TIME_ZONE}).format(start);
  const month=new Intl.DateTimeFormat("en-US",{month:"short",timeZone:TIME_ZONE}).format(start).toUpperCase();
  let meta;
  if(e.allDay){
    const startDate=new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",timeZone:TIME_ZONE}).format(start);
    const inclusiveEnd=new Date(end.getTime()-1);
    const endDate=new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",timeZone:TIME_ZONE}).format(inclusiveEnd);
    meta=startDate===endDate?"All Day":`${startDate} – ${endDate}`;
  }else{
    const timeFmt=new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit",timeZone:TIME_ZONE});
    meta=`${timeFmt.format(start)} – ${timeFmt.format(end)}`;
  }
  if(e.location) meta+=` · ${e.location}`;
  return {day,month,meta};
};

function renderEvents(source="all"){
  if(!eventGrid) return;
  const visible=calendarEvents.filter(e=>source==="all"||e.source===source);
  if(!visible.length){
    eventGrid.innerHTML='<p class="event-status">No upcoming events found for this filter.</p>';
    return;
  }
  eventGrid.replaceChildren(...visible.map(e=>{
    const f=formatEvent(e);
    const article=document.createElement("article");
    article.className=`event-card ${e.source==="lodge"?"lodge-event":"chapter-event"}`;
    const date=document.createElement("div"); date.className="event-date";
    const strong=document.createElement("strong"); strong.textContent=f.day;
    const span=document.createElement("span"); span.textContent=f.month;
    date.append(strong,span);
    const badge=document.createElement("span"); badge.className="event-source"; badge.textContent=e.source==="lodge"?"LODGE":"NAGATAMEN";
    const h3=document.createElement("h3"); h3.textContent=e.title;
    const meta=document.createElement("p"); const b=document.createElement("b"); b.textContent=f.meta; meta.appendChild(b);
    article.append(date,badge,h3,meta);
    const desc=cleanDescription(e.description);
    if(desc){const p=document.createElement("p");p.textContent=desc;article.appendChild(p);}
    return article;
  }));
}

async function loadEvents(){
  if(!eventGrid) return;
  eventGrid.innerHTML='<p class="event-status">Loading upcoming events…</p>';
  try{
    const response=await fetch(CALENDAR_FEED,{cache:"no-store"});
    if(!response.ok) throw new Error(`Calendar feed returned ${response.status}`);
    const data=await response.json();
    calendarEvents=Array.isArray(data)?data.sort((a,b)=>new Date(a.start)-new Date(b.start)):[];
    renderEvents("all");
  }catch(error){
    console.error(error);
    eventGrid.innerHTML='<p class="event-status">Upcoming events could not be loaded right now. Please try again shortly.</p>';
  }
}

if(filters){
  filters.addEventListener("click",event=>{
    const button=event.target.closest("button[data-source]");
    if(!button) return;
    filters.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b===button));
    renderEvents(button.dataset.source);
  });
}

if(eventGrid) loadEvents();

const postsGrid=document.querySelector("#posts");
if(postsGrid) postsGrid.innerHTML=posts.map(p=>`<article class="post"><span class="tag">${p.tag}</span><h3>${p.title}</h3><p>${p.text}</p><time>${p.date}</time></article>`).join("");

const menu=document.querySelector(".menu");
if(menu) menu.addEventListener("click",()=>document.querySelector(".site-header nav")?.classList.toggle("open"));


const slideshow=document.querySelector("#home-slideshow");
if(slideshow){
  const slides=[...slideshow.querySelectorAll(".slide")];
  const dots=[...slideshow.querySelectorAll(".slide-dots button")];
  let current=0;
  let timer;
  const show=index=>{
    current=(index+slides.length)%slides.length;
    slides.forEach((slide,i)=>slide.classList.toggle("active",i===current));
    dots.forEach((dot,i)=>dot.classList.toggle("active",i===current));
  };
  const restart=()=>{clearInterval(timer);timer=setInterval(()=>show(current+1),5500);};
  slideshow.querySelector(".prev").addEventListener("click",()=>{show(current-1);restart();});
  slideshow.querySelector(".next").addEventListener("click",()=>{show(current+1);restart();});
  dots.forEach((dot,i)=>dot.addEventListener("click",()=>{show(i);restart();}));
  slideshow.addEventListener("mouseenter",()=>clearInterval(timer));
  slideshow.addEventListener("mouseleave",restart);
  restart();
}
