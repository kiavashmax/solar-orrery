// @kiavashmax
(function(){
    if (typeof Astronomy === "undefined") {
        document.body.innerHTML = '<div style="color:#ff5e5b;padding:40px;font-family:monospace">Could not load astronomy-engine. Check your network.</div>';
        return;
    }

    var NS = "http://www.w3.org/2000/svg";

    var PLANETS = [
        { name:"Mercury", body:Astronomy.Body.Mercury, color:"#a8a29e", hi:"#d4d0c8", r:3.5, orbit:40 },
        { name:"Venus",   body:Astronomy.Body.Venus,   color:"#e8c99b", hi:"#f5e0bb", r:4.5, orbit:62 },
        { name:"Earth",   body:Astronomy.Body.Earth,   color:"#4f8fdb", hi:"#7cb0e8", r:5.0, orbit:84 },
        { name:"Mars",    body:Astronomy.Body.Mars,    color:"#c1552b", hi:"#e07a4f", r:4.0, orbit:106 },
        { name:"Jupiter", body:Astronomy.Body.Jupiter, color:"#d4a574", hi:"#e8c69b", r:9.0, orbit:128 },
        { name:"Saturn",  body:Astronomy.Body.Saturn,  color:"#e0c78a", hi:"#f0dba8", r:7.5, orbit:150, ring:true },
        { name:"Uranus",  body:Astronomy.Body.Uranus,  color:"#9de0e8", hi:"#c0ecf2", r:5.5, orbit:172 },
        { name:"Neptune", body:Astronomy.Body.Neptune, color:"#4a6fd4", hi:"#6d8fe8", r:5.5, orbit:194 }
    ];

    var BASE = new Date("2000-01-01T12:00:00Z").getTime();
    var DAY = 86400000;
    var MIN_DAYS = 0;
    var MAX_DAYS = 18262;

    var svg = document.getElementById("orrery");
    var orbitsG = svg.querySelector(".orbits");
    var planetsG = svg.querySelector(".planets");
    var defs = svg.querySelector("defs");
    var datePicker = document.getElementById("datePicker");
    var todayBtn = document.getElementById("todayBtn");
    var randBtn = document.getElementById("randBtn");
    var slider = document.getElementById("slider");
    var legend = document.getElementById("legend");

    slider.min = MIN_DAYS;
    slider.max = MAX_DAYS;

    function pad(n){ return n < 10 ? "0" + n : "" + n; }

    function todayStr(){
        var d = new Date();
        return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }

    function dateToDays(s){
        return Math.round((new Date(s + "T12:00:00Z").getTime() - BASE) / DAY);
    }

    function daysToDate(d){
        return new Date(BASE + d * DAY).toISOString().slice(0, 10);
    }

    // build orbits
    PLANETS.forEach(function(p){
        var c = document.createElementNS(NS, "circle");
        c.setAttribute("r", p.orbit);
        c.setAttribute("class", "orbit");
        orbitsG.appendChild(c);
    });

    // build planets
    var state = PLANETS.map(function(p){
        var gradId = "g-" + p.name.toLowerCase();
        var grad = document.createElementNS(NS, "radialGradient");
        grad.setAttribute("id", gradId);
        grad.setAttribute("cx", "35%");
        grad.setAttribute("cy", "35%");
        grad.setAttribute("r", "65%");
        var s1 = document.createElementNS(NS, "stop");
        s1.setAttribute("offset", "0%");
        s1.setAttribute("stop-color", p.hi);
        var s2 = document.createElementNS(NS, "stop");
        s2.setAttribute("offset", "100%");
        s2.setAttribute("stop-color", p.color);
        grad.appendChild(s1);
        grad.appendChild(s2);
        defs.appendChild(grad);

        var g = document.createElementNS(NS, "g");
        g.setAttribute("class", "planet");

        if (p.ring) {
            var ring = document.createElementNS(NS, "ellipse");
            ring.setAttribute("rx", p.r * 1.65);
            ring.setAttribute("ry", p.r * 0.45);
            ring.setAttribute("fill", "none");
            ring.setAttribute("stroke", "rgba(224,199,138,0.7)");
            ring.setAttribute("stroke-width", "1");
            ring.setAttribute("transform", "rotate(22)");
            g.appendChild(ring);
        }

        var circle = document.createElementNS(NS, "circle");
        circle.setAttribute("r", p.r);
        circle.setAttribute("fill", "url(#" + gradId + ")");
        g.appendChild(circle);

        var title = document.createElementNS(NS, "title");
        title.textContent = p.name;
        g.appendChild(title);

        planetsG.appendChild(g);

        return { def: p, el: g, current: 0, target: 0 };
    });

    // build legend rows
    PLANETS.forEach(function(p, i){
        var row = document.createElement("div");
        row.className = "legend-item";
        row.innerHTML =
            '<span class="dot" style="background:' + p.color + '"></span>' +
            '<span class="legend-name">' + p.name + '</span>' +
            '<span class="legend-dist" id="dist-' + i + '">--</span>';
        legend.appendChild(row);
    });

    // compute positions for a date
    function setDate(dateStr){
        var parts = dateStr.split("-").map(Number);
        var date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
        var time = Astronomy.MakeTime(date);

        for (var i = 0; i < PLANETS.length; i++) {
            var p = PLANETS[i];
            var v = Astronomy.HelioVector(p.body, time);
            var angle = Math.atan2(v.y, v.x);
            var dist = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

            state[i].target = angle;

            var distEl = document.getElementById("dist-" + i);
            if (distEl) distEl.textContent = dist.toFixed(2) + " AU";
        }

        datePicker.value = dateStr;
        slider.value = dateToDays(dateStr);

        var url = new URL(window.location.href);
        url.searchParams.set("date", dateStr);
        window.history.replaceState({}, "", url.toString());
    }

    // shortest angular path between two angles
    function shortest(from, to){
        var d = to - from;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        return d;
    }

    // rAF animation loop
    var lastT = 0;
    function tick(t){
        var dt = Math.min(0.05, (t - lastT) / 1000);
        lastT = t;

        var k = 1 - Math.exp(-20 * dt); // ~50ms settle

        for (var i = 0; i < state.length; i++) {
            var s = state[i];
            var d = shortest(s.current, s.target);
            s.current += d * k;
            if (Math.abs(d) < 0.001) s.current = s.target;

            var x = Math.cos(s.current) * s.def.orbit;
            var y = -Math.sin(s.current) * s.def.orbit; // flip y: SVG y goes down
            s.el.setAttribute("transform", "translate(" + x.toFixed(2) + "," + y.toFixed(2) + ")");
        }

        requestAnimationFrame(tick);
    }

    // events
    datePicker.addEventListener("change", function(){
        if (datePicker.value) setDate(datePicker.value);
    });

    todayBtn.addEventListener("click", function(){ setDate(todayStr()); });

    randBtn.addEventListener("click", function(){
        var d = MIN_DAYS + Math.floor(Math.random() * (MAX_DAYS - MIN_DAYS + 1));
        setDate(daysToDate(d));
    });

    slider.addEventListener("input", function(){
        setDate(daysToDate(parseInt(slider.value, 10)));
    });

    window.addEventListener("keydown", function(e){
        if (e.key === "r" || e.key === "R") randBtn.click();
        if (e.key === "t" || e.key === "T") todayBtn.click();
    });

    // init
    document.getElementById("lblStart").textContent = daysToDate(MIN_DAYS).slice(0, 4);
    document.getElementById("lblEnd").textContent = daysToDate(MAX_DAYS).slice(0, 4);
    document.getElementById("lblMid").textContent = daysToDate(Math.floor((MIN_DAYS + MAX_DAYS) / 2)).slice(0, 4);

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("date") || todayStr();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(initial)) initial = todayStr();

    setDate(initial);

    // snap current to target on first load (no startup animation)
    for (var i = 0; i < state.length; i++) state[i].current = state[i].target;

    requestAnimationFrame(tick);
})();