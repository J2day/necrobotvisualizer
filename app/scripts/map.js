
var Map = function(parentDiv) {
    var leafmap = L.map(parentDiv);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { }).addTo(leafmap);
    this.map = leafmap;
    this.path = null;

    this.steps = [];
    this.catches = [];
    this.pokestops = [];
};

Map.prototype.saveContext = function() {
    sessionStorage.setItem("available", true);
    sessionStorage.setItem("steps", JSON.stringify(this.steps));
    sessionStorage.setItem("catches", JSON.stringify(this.catches));
    sessionStorage.setItem("pokestops", JSON.stringify(this.pokestops));
}

Map.prototype.loadContext = function() {
    if (sessionStorage.getItem("available")) {
        try {
            console.log("Load data from storage to restore session");

            this.steps = JSON.parse(sessionStorage.getItem("steps")) || [];
            this.catches = JSON.parse(sessionStorage.getItem("catches")) || [];
            this.pokestops = JSON.parse(sessionStorage.getItem("pokestops")) || [];

            console.log(this.steps);
            console.log(this.catches);
            console.log(this.pokestops);

            this.initPath();

            for (var i = 0; i < this.catches.length; i++) {
                var pt = this.catches[i];
                var icon = L.icon({ iconUrl: `./assets/icons/${pt.id}.png`, iconSize: [45, 45]});
                L.marker([pt.lat, pt.lng], {icon: icon}).addTo(this.map).bindPopup(`${pt.name} (lvl ${pt.lvl})`);
            }
            for (var i = 0; i < this.pokestop.length; i++) {
                var pt = this.pokestop[i];
                var icon = L.icon({ iconUrl: `./assets/img/stop.png`, iconSize: [30, 50]});
                L.marker([pt.lat, pt.lng], {icon: icon}).addTo(this.map);
            }
        } catch(err) {}
    }
}

Map.prototype.initPath = function() {
    if (this.path != null) return true;
    if (this.steps.length < 2) return false;

    console.log("Init path and markers.");

    this.map.setView([this.steps[0].lat, this.steps[0].lng], 16);

    var pts = Array.from(this.steps, pt => L.latLng(pt.lat, pt.lng));
    this.path = L.polyline(pts, { color: 'red' }).addTo(this.map);

    var last = this.steps.pop();
    this.me = L.marker([last.lat, last.lng]).addTo(this.map);

    return true;
}

Map.prototype.addToPath = function(pt) {
    console.log(`Walk to (${pt.lat},${pt.lng})`);

    if (this.initPath()) {
        var latLng = L.latLng(pt.lat, pt.lng);
        this.path.addLatLng(latLng);
        this.me.setLatLng(L.latLng(pt.lat, pt.lng));
    }
    this.steps.push(pt);
}

Map.prototype.addCatch = function(pt) {
    if (!pt.lat) {
        if (this.steps.length > 0) {
            var pos = this.steps.pop();
            pt.lat = pos.lat;
            pt.lng = pos.lng;
        } else {
            // no position to pin to, abord
            return;
        }
    }

    var pkm = `${pt.name} (lvl ${pt.lvl})`;
    console.log("Catch " + pkm);

    this.catches.push(pt);

    var icon = L.icon({ iconUrl: `./assets/icons/${pt.id}.png`, iconSize: [45, 45]});
    L.marker([pt.lat, pt.lng], {icon: icon}).addTo(this.map).bindPopup(pkm);
}

Map.prototype.addPokestop = function(pt) {
    if (!pt.lat) return;

    console.log("Pokestop.");

    this.addToPath(pt);
    this.pokestops.push(pt);

    var icon = L.icon({ iconUrl: `./assets/img/stop.png`, iconSize: [30, 50]});
    L.marker([pt.lat, pt.lng], {icon: icon}).addTo(this.map);
}