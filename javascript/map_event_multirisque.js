const wrapper = document.querySelector('.search-wrapper');
const toggle = document.querySelector('.search-toggle');

if (toggle && wrapper) {
  toggle.addEventListener('click', () => {
    wrapper.classList.toggle('active');
  });
}

const arrow = document.querySelector(".scroll-arrow");

let t = 0;

function animate() {
  if (!arrow) return;
  t += 0.07;
  const y = Math.sin(t) * 6;
  const opacity = 0.75 + Math.sin(t) * 0.15;
  arrow.style.transform = `translateY(${y}px)`;
  arrow.style.opacity = opacity;
  requestAnimationFrame(animate);
}

animate();

if (arrow) {
  arrow.addEventListener("click", () => {
    const target = document.querySelector("#multirisque");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
}

function openNav() {
  const panel = document.getElementById("mySidepanel");
  if (panel) panel.style.width = "320px";
}

function closeNav() {
  const sidepanel = document.getElementById("mySidepanel");
  if (sidepanel) {
    sidepanel.style.width = "0";
  }
  document.querySelectorAll(".group").forEach(group => {
    group.classList.remove("open");
    const content = group.querySelector(".group-content");
    if (content) {
      content.style.maxHeight = null;
    }
  });
}

document.querySelectorAll(".group-header").forEach(header => {
  header.addEventListener("click", () => {

    const group = header.parentElement;

    document.querySelectorAll(".group").forEach(otherGroup => {
      if (otherGroup !== group) {
        otherGroup.classList.remove("open");

        const content = otherGroup.querySelector(".group-content");
        if (content) {
          content.style.maxHeight = null;
        }
      }
    });

    group.classList.toggle("open");

    const content = group.querySelector(".group-content");

    if (group.classList.contains("open")) {
      content.style.maxHeight = content.scrollHeight + "px";
    } else {
      content.style.maxHeight = null;
    }

  });
});

// Carte

// Fond MapTiler

var bglayer_osm = new ol.layer.Tile({
  source: new ol.source.OSM(),
  title: "OpenStreetMap",
  type: "base",
  visible: false
});

var bglayer_esri = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  }),
  title: "ESRI Satellite",
  type: "base",
  visible: true
});

function pinStyle() {
  return new ol.style.Style({
    image: new ol.style.Icon({
      src: "../img/pins.png",
      scale: 0.05,
      anchor: [0.5, 1]
    })
  });
}

var deptSource = new ol.source.Vector({
  url: "../donnees/carte_multirisque/france_dpt.geojson",
  format: new ol.format.GeoJSON()
});

var deptLayer = new ol.layer.Vector({
  source: deptSource,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "rgba(255,255,255,0.8)",
      width: 1
    }),
    fill: new ol.style.Fill({
      color: "rgba(0,0,0,0)"
    })
  })
});

var aleaSource = new ol.source.Vector({
  url: "../donnees/carte_multirisque/events_multirisque.geojson",
  format: new ol.format.GeoJSON()
});

const pin = new ol.style.Style({
  image: new ol.style.Icon({
    src: "../img/pins.png",
    scale: 0.05,
    anchor: [0.5, 1]
  })
});

function pinStyle() {
  return pin;
}

var aleaLayer = new ol.layer.Vector({
  source: aleaSource,
  style: function () {
    return pinStyle();
  }
});

const filters = document.querySelectorAll(".alea-filter");
const btnValid = document.querySelector(".btn-valid");
const btnReset = document.querySelector(".btn-reset");

function filterAleas() {

  let selected = [];

  filters.forEach(function (check) {
    if (check.checked) {
      selected.push(check.value);
    }
  });


  aleaLayer.setStyle(function (feature) {

    if (selected.length === 0) {
      return pinStyle();
    }


    let aleas = feature.get("risque");


    if (!aleas) {
      return null;
    }

    let listeAleas = aleas.split(";");

    let visible = selected.every(function (a) {
      return listeAleas.includes(a);
    });


    if (visible) {
      return pinStyle();
    }
    else {
      return null;
    }

  });

}

btnValid.addEventListener("click", function () {
  closePopup();
  filterAleas();

});

btnReset.addEventListener("click", function () {

  closePopup();

  filters.forEach(function (check) {
    check.checked = false;
  });

  aleaLayer.setStyle(function () {
    return pinStyle();
  });

});

aleaLayer.setStyle(function () {
  return pinStyle();
});

var map = new ol.Map({
  target: "map",
  layers: [
    bglayer_osm,
    bglayer_esri,
    deptLayer,
    aleaLayer
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([1.8883, 46.5]),
    zoom: 5.4
  })
});

map.getInteractions().forEach(function (interaction) {
    interaction.setActive(false);
});

window.addEventListener("resize", function () {
  map.updateSize();
});

setTimeout(function () {
  map.updateSize();
}, 500);

var popup = document.getElementById("popup");

const closeInfo = document.getElementById("closeInfo");
const mapInfo = document.getElementById("mapInfo");
const mapOverlay = document.getElementById("mapOverlay");

if (closeInfo) {
  closeInfo.addEventListener("click", function () {

    mapInfo.style.display = "none";

    if (mapOverlay) {
      mapOverlay.style.display = "none";
    }

    map.getInteractions().forEach(function (interaction) {
      interaction.setActive(true);
    });

  });
}

popup.addEventListener("mousedown", function(e) {

  if (!e.target.closest("a")) {
    e.stopPropagation();
  }

});

var overlay = new ol.Overlay({
  element: popup,
  positioning: "bottom-center",
  stopEvent: false,
  offset: [0, 0]
});

map.addOverlay(overlay);

function closePopup() {
  popup.style.display = "none";
  overlay.setPosition(undefined);
}

var layerSwitcher = new LayerSwitcher({
  activationMode: 'click',
  startActive: false,
  tipLabel: 'Couches'
});

map.on('singleclick', function (evt) {

  let feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });

  if (feature && feature.get("event")) {

    let nom = feature.get("event");
    let lieu = feature.get("loc");
    let pays = feature.get("pays");
    let date = feature.get("date");
    let aleas = feature.get("aleas_descr");
    let listeAleas = aleas.split(";");
    let multialeas = "<ul>";
    let pdf = feature.get("fiche");
    let image = feature.get("image");

    let imageHTML = "";

    if (image && image.trim() !== "") {
      imageHTML = `
    <img src="${image}" class="popup-image" alt="${nom}">
  `;
    }

    listeAleas.forEach(function (alea) {
      multialeas += `<li>${alea}</li>`;
    });

    multialeas += "</ul>";

    popup.innerHTML = `
<div class="popup-content">

  <div class="popup-header">
    <h3>${nom}</h3>
  </div>

  <div class="popup-body">

    <p class="popup-meta">
      <span class="label">Date :</span>
      <span>${date}</span>
    </p>

    <p class="popup-meta">
      <span class="label">Lieu :</span>
      <span class="popup-lieu">${lieu}</span>
    </p>

    <p class="popup-meta">
  <span class="label">Pays :</span>
  <span class="popup-pays">${pays}</span>
</p>

    <div class="popup-aléas">
      <span class="label">Aléas</span>
      <ul>
        ${listeAleas.map(a => `<li>${a}</li>`).join("")}
      </ul>
    </div>

    <a href="${pdf}" target="_blank" class="pdf-link">
      Consulter la fiche
    </a>

    ${imageHTML}

  </div>
</div>
`;


    popup.style.display = "block";

    overlay.setPosition(evt.coordinate);

    map.getView().animate({
      center: overlay.getPosition(),
      duration: 500
    });

  } else {

    popup.style.display = "none";

  }

});

map.addControl(layerSwitcher);

function fullScreenView() {

  const mapEl = document.getElementById("map");

  if (!document.fullscreenElement) {

    if (mapEl.requestFullscreen) {
      mapEl.requestFullscreen();
    } else if (mapEl.webkitRequestFullscreen) {
      mapEl.webkitRequestFullscreen();
    } else if (mapEl.msRequestFullscreen) {
      mapEl.msRequestFullscreen();
    }

  } else {

    if (document.exitFullscreen) {
      document.exitFullscreen();
    }

  }
}
