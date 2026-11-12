try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t;var m=location.pathname.match(/\/(en|ar)\//);if(m)localStorage.setItem('lang',m[1]);}catch(e){}
