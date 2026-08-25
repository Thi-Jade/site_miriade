// MULTIRISQUE SCENARIO CONTEXT

let graphData;
let currentVisible = [];
let scenarioMarkers = [];
let communeLayersVisible = false;
let scenarioStarted = false;
let hoveredFeature = null; let pulsingIds = new Set();
let rootPulseId = null;
let scenarioReady = false;
let branchesVisited = new Map();
let lastVisitedId = null;

const scenarioIcons = {
    'inondation': '../img/logos_enjeux/inondation.png',
    'bati': '../img/logos_enjeux/bati.png',
    'canaux de communication': '../img/logos_enjeux/communication.png',
    'faune et flore': '../img/logos_enjeux/faune_flore.png',
    'milieu agricole': '../img/logos_enjeux/milieu_agricole.png',
    'milieu naturel et forestier': '../img/logos_enjeux/milieu_naturel.png',
    'postes électriques': '../img/logos_enjeux/poste_elec.png',
    'routes': '../img/logos_enjeux/route.png',
    'services de secours': '../img/logos_enjeux/services_secours.png',
    'site SEVESO': '../img/logos_enjeux/site_SEVESO.png',
    'site touristique': '../img/logos_enjeux/site_touristique.png',
    'station d\'épuration': '../img/logos_enjeux/station_epur.png',
    'habitants': '../img/logos_enjeux/habitants.png'
};

const descriptionIcons = {
    'inondation': '../img/img_description/inondation.jpg',
    'bati': '../img/img_description/bati.png',
    'canaux de communication': '../img/img_description/canaux.jpg',
    'faune et flore': '../img/img_description/faune.jpg',
    'milieu agricole': '../img/img_description/milieu_agricole.jpg',
    'milieu naturel et forestier': '../img/img_description/milieu_naturel.jpg',
    'postes électriques': '../img/img_description/electricite.jpg',
    'routes': '../img/img_description/routes.jpeg',
    'services de secours': '../img/img_description/secours.png',
    'site SEVESO': '../img/img_description/seveso.jpg',
    'site touristique': '../img/img_description/site_touristique.jpg',
    'station d\'épuration': '../img/img_description/station_epur.png',
    'habitants': '../img/img_description/habitants.jpg'
};

const communesZoom = {
    'sim-miriade-sur-terre': {
        center: [-3.644471326990426, 47.96679356747665],
        zoom: 10.9,
        bounds: [
            [-3.90, 47.72],
            [-3.30, 48.18]
        ]
    },

    'sim-miriade-sur-mer': {
        center: [-3.74, 47.820],
        zoom: 11,
        bounds: [
            [-3.90, 47.68],
            [-3.38, 47.98]
        ]

    }
};


// DOM
const wrapper = document.querySelector('.search-wrapper');
const toggle = document.querySelector('.search-toggle');
const legendPanel = document.getElementById('legend-panel');
const descriptionPanel = document.getElementById('description-panel');
const mediaPanel = document.getElementById('media-panel');

const impactBatiLegend = [
    {
        color: "#FFD700",
        label: "Impact faible"
    },
    {
        color: "#F38521",
        label: "Impact modéré"
    },
    {
        color: "#B00E0F",
        label: "Impact élevé"
    }
];

const impactRouteLegend = [
    {
        color: "#FFD700",
        label: "Impact faible"
    },
    {
        color: "#F08A24",
        label: "Impact modéré"
    },
    {
        color: "#B2182B",
        label: "Impact élevé"
    }
];
const layerGroups = {

    "Aléas": {
        layers: [
            {
                id: "arc-inondation-hauteur",
                label: "Inondation par crue (hauteur d'eau)",
                legend: [
                    { color: "#BDD0EA", label: "0–0.5 m" },
                    { color: "#8FB3E2", label: "0.5–1 m" },
                    { color: "#31487A", label: "> 1 m" }
                ]
            },
            {
                id: "barrage-inondation-hauteur",
                label: "Inondation par rupture de barrage (hauteur d'eau)",
                legend: [
                    { color: "#BDD0EA", label: "< 1 m" },
                    { color: "#8FB3E2", label: "1–2 m" },
                    { color: "#31487A", label: "2–5 m" }
                ]
            },
            {
                id: "alea-natech-fill",
                label: "risque Natech",
                legend: [
                    { color: "#411073", label: "Zone d’aléa" }
                ]
            }
        ]
    },

    "Réseaux": {
        layers: [
            {
                id: "base-rs-hydro-line",
                label: "Réseau hydrographique",
                legend: [
                    { color: "#1E2E4F", label: "Cours d'eau" }
                ]
            },
            {
                id: "arc-routes-impact-line",
                label: "Routes impactées (crue)",
                legend: impactRouteLegend
            },

            {
                id: "barrage-routes-impact-line",
                label: "Routes impactées (rupture de barrage)",
                legend: impactRouteLegend
            }
        ]
    },

    "Aménagement": {
        layers: [
            {
                id: "arc-batiments-impact-fill",
                label: "Bâtiments impactés (crue)",
                legend: impactBatiLegend
            },

            {
                id: "barrage-batiments-impact-fill",
                label: "Bâtiments impactés (rupture de barrage)",
                legend: impactBatiLegend
            },
        ]
    },
};

// UI 

// OUVRIR / FERMER BARRE DE RECHERCHE
toggle?.addEventListener('click', () => {
    wrapper?.classList.toggle('active');
});

// MENU LATÉRAL
function openNav() {
    document.getElementById('mySidepanel').style.width = '320px';
}

function closeNav() {
    document.getElementById('mySidepanel').style.width = '0';
    document.querySelectorAll('.group').forEach(group => {
        group.classList.remove('open');
        group.querySelector('.group-content').style.maxHeight = null;
    });
}

document.querySelectorAll(".group-header").forEach(header => {

    header.addEventListener("click", () => {

        const group = header.parentElement;

        document.querySelectorAll(".group").forEach(otherGroup => {

            if (otherGroup !== group) {

                otherGroup.classList.remove("open");

                const otherContent = otherGroup.querySelector(".group-content");

                if (otherContent) {
                    otherContent.style.maxHeight = null;
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

// PANELS DYNAMIQUES
function showPanels() {
    legendPanel?.classList.add('visible');
    descriptionPanel?.classList.add('open');
    mediaPanel?.classList.add('visible');
}
function hidePanels() {
    legendPanel?.classList.remove('visible');
    descriptionPanel?.classList.remove('open');
    mediaPanel?.classList.remove('visible');
}

function closeDescription() {
    descriptionPanel?.classList.remove('open');

}

// LEGENDE

function toggleLayer(layerId, visible) {
    if (!map.getLayer(layerId)) return;

    map.setLayoutProperty(
        layerId,
        "visibility",
        visible ? "visible" : "none"
    );
}

function renderLayerPanel(commune) {

    const container = document.getElementById("legend-content");
    if (!container) return;

    container.innerHTML = "";

    Object.entries(layerGroups).forEach(([groupName, group]) => {

        const groupEl = document.createElement("div");
        groupEl.className = "layer-group";

        const header = document.createElement("div");
        header.className = "layer-group-header";

        header.innerHTML = `<span>${groupName}</span><span class="arrow">›</span>`;

        const content = document.createElement("div");
        content.className = "layer-group-content";

        header.addEventListener("click", () => {

            document.querySelectorAll(".layer-group").forEach(otherGroup => {

                if (otherGroup !== groupEl) {

                    otherGroup.classList.remove("open");

                    const otherContent = otherGroup.querySelector(".layer-group-content");

                    if (otherContent) {
                        otherContent.style.maxHeight = null;
                    }

                }

            });

            groupEl.classList.toggle("open");

            if (groupEl.classList.contains("open")) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }

        });

        group.layers.forEach(layer => {

            const row = document.createElement("div");
            row.className = "layer-row";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = map.getLayoutProperty(layer.id, "visibility") === "visible";

            checkbox.addEventListener("change", () => {
                toggleLayer(layer.id, checkbox.checked);
            });

            const label = document.createElement("span");
            label.textContent = layer.label;

            row.appendChild(checkbox);
            row.appendChild(label);
            content.appendChild(row);

            if (layer.legend) {

                const legendBox = document.createElement("div");
                legendBox.className = "legend-box";

                layer.legend.forEach(l => {

                    const item = document.createElement("div");
                    item.className = "legend-item";

                    item.innerHTML = `
                        <span class="legend-color" style="background:${l.color}"></span>
                        <span>${l.label}</span>
                    `;

                    legendBox.appendChild(item);
                });

                content.appendChild(legendBox);
            }
        });

        groupEl.appendChild(header);
        groupEl.appendChild(content);

        container.appendChild(groupEl);
    });
}

// MAP INIT
const map = new maplibregl.Map({
    container: 'map',
    attributionControl: false,
    minZoom: 3,
    maxZoom: 15,
    dragRotate: false,
    touchZoomRotate: false,
    center: [-3.604471326990426, 47.96679356747665],
    zoom: 8,
    renderWorldCopies: false,
    style: {
        version: 8,
        sources: {
            satellite: {
                type: 'raster',
                tiles: [
                    'https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=nZ3G0fXXfpmfuPsYypQE'
                ],
                tileSize: 256,
                attribution:
                    '© MapTiler © OpenStreetMap contributors'
            }
        },
        layers: [
            {
                id: 'base-satellite',
                type: 'raster',
                source: 'satellite'
            }
        ]
    }
});


// SOURCES

const sourceConfigs = [

    // COMMUN
    { id: 'base-mir-terre', data: '../donnees/mir_terre/geojson/contours_mir_terre.geojson' },
    { id: 'base-rs-hydro', data: '../donnees/mir_terre/geojson/rs_hydro_sim.geojson' },
    { id: 'arc-inondation', data: '../donnees/mir_terre/geojson/inond_crue_arc_sim.geojson' },
    { id: 'arc-batiments-impact', data: '../donnees/mir_terre/geojson/bat_impact_arc.geojson' },
    { id: 'arc-routes-impact', data: '../donnees/mir_terre/geojson/routes_inond_arc_sim.geojson' },
    { id: 'barrage-inondation', data: '../donnees/mir_terre/geojson/inond_rupt_barrage_sim.geojson' },
    { id: 'barrage-batiments-impact', data: '../donnees/mir_terre/geojson/bat_impact_barrage.geojson' },
    { id: 'barrage-routes-impact', data: '../donnees/mir_terre/geojson/routes_inond_barrage_sim.geojson' },
    { id: 'alea-natech', data: '../donnees/mir_terre/geojson/perim_alea_tech.geojson' },

    // MIRIADE-SUR-MER

    { id: 'base-mir-mer', data: '../donnees/mir_mer/geojson/contours_mir_mer.geojson' }

];


// FONCTIONS COMPLÉMENT D'AFFICHAGE DONNÉES

function initSources() {
    sourceConfigs.forEach(source => {
        map.addSource(source.id, {
            type: 'geojson',
            data: source.data
        });
    });
}

function initLayers() {

    function addFillLayer(config) {

        map.addLayer({
            id: config.id,
            type: 'fill',
            source: config.source,

            layout: {
                visibility: 'none'
            },

            paint: {
                'fill-color': config.color,
                'fill-opacity': config.opacity ?? 1
            }
        });
    }

    function addLineLayer(config) {

        const paint = {
            'line-color': config.color,
            'line-width': config.width ?? 1
        };

        if (config.dasharray) {
            paint['line-dasharray'] = config.dasharray;
        }

        map.addLayer({
            id: config.id,
            type: 'line',
            source: config.source,
            layout: {
                visibility: 'none',
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint
        });
    }

    // LAYERS

    // MIRIADE-SUR-TERRE

    addFillLayer({
        id: 'barrage-inondation-hauteur',
        source: 'barrage-inondation',

        color: [
            'match',
            ['get', 'HAUTEUR'],
            'h<1m', '#BDD0EA',
            '1m>h>2m', '#8FB3E2',
            '2m>h>5m', '#31487A',
            '5m>h>10m', '#1E2E4F',
            '10m>h>20m', '#192338',
            'rgba(0,0,0,0)'
        ]
    });

    addFillLayer({
        id: 'arc-inondation-hauteur',
        source: 'arc-inondation',

        color: [
            'match',
            ['get', 'Hauteur'],
            '0<H<0.5 m', '#BDD0EA',
            '0.5<H<1 m', '#8FB3E2',
            'H>1 m', '#31487A',
            'rgba(0,0,0,0)'
        ],

        opacity: 1
    });

    addFillLayer({
        id: 'barrage-batiments-impact-fill',
        source: 'barrage-batiments-impact',

        color: [
            'match',
            ['get', 'impact'],
            'Impact faible', '#FFD700',
            'Impact modéré', '#F38521',
            'Impact élevé', '#B00E0F',
            'rgba(0,0,0,0)'
        ]
    });

    addFillLayer({
        id: 'arc-batiments-impact-fill',
        source: 'arc-batiments-impact',

        color: [
            'match',
            ['get', 'impact'],
            'Impact faible', '#FFD700',
            'Impact modéré', '#F38521',
            'Impact élevé', '#B00E0F',
            'rgba(0,0,0,0)'
        ]
    });

    addLineLayer({
        id: 'barrage-routes-impact-line',
        source: 'barrage-routes-impact',

        color: [
            'match',
            ['get', 'impact'],
            'Impact modéré', '#F08A24',
            'Impact élevé', '#B2182B',
            'rgba(0,0,0,0)'
        ],

        width: 1
    });

    addLineLayer({
        id: 'arc-routes-impact-line',
        source: 'arc-routes-impact',

        color: [
            'match',
            ['get', 'Impact'],
            'Impact faible', '#FFD700',
            'Impact modéré', '#F08A24',
            'Impact élevé', '#B2182B',
            'rgba(0,0,0,0)'
        ],

        width: 1.5
    });

    addFillLayer({
        id: 'alea-natech-fill',
        source: 'alea-natech',
        color: '#411073',
        opacity: 0.35
    });

    addLineLayer({
        id: 'alea-natech-line',
        source: 'alea-natech',
        color: '#2C0C59',
        width: 1,
        dasharray: [7, 4]
    });

    addLineLayer({
        id: 'base-rs-hydro-line',
        source: 'base-rs-hydro',
        color: '#1E2E4F',
        width: 3
    });

    addLineLayer({
        id: 'base-mir-terre_line',
        source: 'base-mir-terre',
        color: '#ffffff',
        width: 1
    });


    // MIRIADE-SUR-MER

    addLineLayer({
        id: 'base-mir-mer-line',
        source: 'base-mir-mer',
        color: '#ffffff',
        width: 1
    });

}



// SCÉNARIO DYNAMIQUE

function initScenario() {

    let rootId = null;

    function updateScenario() {

        if (!graphData) return;

        scenarioMarkers.forEach(marker => marker.remove());
        scenarioMarkers = [];
        currentVisible.forEach(feature => {

            if (feature.geometry.type !== 'Point') return;

            const coords = feature.geometry.coordinates;
            const featureId = Number(feature.properties.id); 

            const el = document.createElement('div');
            el.classList.add('scenario-marker');

            const cat = feature.properties.categ_enj;
            const iconUrl = scenarioIcons[cat] || scenarioIcons[1];

            const icon = document.createElement('div');
            icon.classList.add('scenario-icon');
            icon.style.backgroundImage = `url('${iconUrl}')`;

            el.appendChild(icon);

            el.classList.remove('child-pulse');

            const isRoot = rootId === featureId;

            if (!isRoot && pulsingIds.has(featureId)) {
                el.classList.add('child-pulse');
            }

            // Comptage boucles de rétroaction
            const key = getEnjeuKey(feature);
            const branchCount = branchesVisited.get(key)?.size || 0;
            const visits = Math.max(0, branchCount - 1);

            if (visits > 0) {
                const badge = document.createElement('div');
                badge.classList.add('scenario-badge');
                badge.textContent = visits;
                el.appendChild(badge);
            }
            el.addEventListener('click', () => {
                showPanels();
                lockedFeature = feature;
                const id = Number(feature.properties.id);

                const key = getEnjeuKey(feature);
                const signature = getPathSignature(id);

                if (!branchesVisited.has(key)) branchesVisited.set(key, new Set());
                branchesVisited.get(key).add(signature); 
                if (id === rootPulseId) {
                    pulsingIds.delete(rootPulseId);
                    rootPulseId = null;
                }

                revealChildren(id);
                renderDescription();
            });

            const marker = new maplibregl.Marker({
                element: el,
                anchor: 'center'
            })
                .setLngLat(coords)
                .addTo(map);

            scenarioMarkers.push(marker);
        });
    }

    window.updateScenario = () => {
        if (!scenarioReady) return;
        updateScenario();
    };

    function renderDescription() {

        const panel = document.getElementById('description-content');
        if (!panel) return;

        const feature = hoveredFeature || lockedFeature;

        if (!feature) {
            panel.innerHTML = "";
            return;
        }

        const text = feature.properties?.descrip?.trim()?.replace(/\n/g, "<br><br>");
        const levier = feature.properties?.levier?.trim()?.replace(/\n/g, "<br>");
        const isRoot = Number(feature.properties?.prec_lien) === 0;

        const category = feature.properties?.categ_enj || "Non défini";
        const iconUrl = descriptionIcons[category];

        const hasText = text && text.length > 0;
        const hasLevier = levier && levier.length > 0;

        panel.innerHTML = `
    
    <div class="scenario-description-wrapper">

        <div class="scenario-description-image">
            <img src="${iconUrl}" alt="${category}">
        </div>
        
        <div class="scenario-description-title">
        ${isRoot ? "Contexte :" : `Enjeux : ${category}`}
        </div>

        ${(hasText || hasLevier) ? `
        <div class="scenario-description-grid">

            ${hasText ? `
            <div class="scenario-description-text">
                <h4>Description</h4>
                ${text}
            </div>
            ` : ""}

            ${hasLevier ? `
            <div class="scenario-description-levier">
                <h4>Levier</h4>
                ${levier}
            </div>
            ` : ""}

        </div>
        ` : ""}

    </div>
    `;
    }

    function loadScenarioData() {

        fetch('../donnees/mir_terre/geojson/scen_mir_terre.geojson')
            .then(res => res.json())
            .then(data => {

                graphData = data;

                const root = graphData.features.find(
                    f => Number(f.properties.prec_lien) === 0
                );

                if (root) {
                    rootPulseId = Number(root.properties.id);
                    pulsingIds.clear();
                    pulsingIds.add(rootPulseId);
                }
            });
    }


    // FONCTIONS SCÉNARIO

    // INDEX SOUS-ENSEMBLE
    function getChildren(nodeId) {
        return graphData.features.filter(
            f => Number(f.properties.prec_lien) === Number(nodeId)
        );
    }


    // RECHERCHE BRANCHE COMPLÈTE
    function getBranchFrom(nodeId) {
        const result = [];

        function recurse(id) {
            const children = getChildren(id);

            children.forEach(child => {
                result.push(child);
                recurse(child.properties.id);
            });
        }

        recurse(nodeId);
        return result;
    }

    function getEnjeuKey(feature) {
        const coords = feature.geometry.coordinates;
        const cat = feature.properties.categ_enj || 'racine';
        return `${cat}_${coords[0].toFixed(5)}_${coords[1].toFixed(5)}`;
    }

    function getPathSignature(nodeId) {
        const path = [];
        let current = graphData.features.find(f => Number(f.properties.id) === Number(nodeId));
        while (current) {
            path.unshift(Number(current.properties.id));
            const parentId = Number(current.properties.prec_lien);
            if (!parentId) break;
            current = graphData.features.find(f => Number(f.properties.id) === parentId);
        }
        return path.join('>');
    }


    // ZOOM POINTS
    function flyToFeature(feature) {
        const coords = feature?.geometry?.coordinates;

        if (!coords || feature.geometry.type !== "Point") return;

        map.flyTo({
            center: coords,
            zoom: 13,
            speed: 0.7,
            curve: 1.6,
            essential: true
        });
    }


    // FIT BOUNDS
    function fitToFeatures(features) {
        const bounds = new maplibregl.LngLatBounds();

        features.forEach(f => {
            if (f.geometry?.type === "Point") {
                bounds.extend(f.geometry.coordinates);
            }
        });

        if (bounds.isEmpty()) return;

        map.fitBounds(bounds, {
            padding: 80,
            duration: 900,
            maxZoom: 14
        });
    }


    // INIT SCÉNARIO
    function startScenario() {
        if (!graphData?.features) return;

        const root = graphData.features.find(
            f => Number(f.properties.prec_lien) === 0
        );

        if (!root) return;

        currentVisible = [root];

        window.updateScenario();
    }

    window.startScenario = startScenario;


    // DÉPLOIEMENT RONDS

    function revealChildren(parentId) {

        if (!graphData?.features) return;

        const root = graphData.features.find(
            f => Number(f.properties.prec_lien) === 0
        );

        const clickedFeature = graphData.features.find(
            f => Number(f.properties.id) === Number(parentId)
        );

        const children = getChildren(parentId);

        if (Number(parentId) === Number(root.properties.id)) {
            currentVisible = [root, ...children];
        } else {
            currentVisible = [root, clickedFeature, ...children];
        }

        children.forEach(child => {
            pulsingIds.add(Number(child.properties.id));
        });

        window.updateScenario();

        if (children.length === 1) {
            flyToFeature(children[0]);
        } else if (children.length > 1) {
            fitToFeatures(children);
        }
    }

    loadScenarioData();
}

function clearScenarioMarkers() {
    scenarioMarkers.forEach(marker => marker.remove());
    scenarioMarkers = [];
    currentVisible = [];
    hoveredFeature = null;
    lockedFeature = null;
}

document.getElementById('reset-visits-btn')?.addEventListener('click', () => {
    branchesVisited.clear();
    window.updateScenario();
});

// GROUPES DONNÉES

const communesLayers = {

    'sim-miriade-sur-terre': [
        'arc-inondation-hauteur',
        'barrage-inondation-hauteur',
        'arc-batiments-impact-fill',
        'barrage-batiments-impact-fill',
        'arc-routes-impact-line',
        'barrage-routes-impact-line',
        'alea-natech-fill',
        'alea-natech-line',
        'base-rs-hydro-line',
        'base-mir-terre_line'
    ],
    'sim-miriade-sur-mer': [
        'base-mir-mer-line'
    ]
};


// CACHE / VISIBILITÉ

function hideAllLayers() {

    Object.values(communesLayers)
        .flat()
        .forEach(layerId => {
            if (!map.getLayer(layerId)) return;
            map.setLayoutProperty(layerId, 'visibility', 'none');

        });

}


// SÉLECTION COMMUNE

function loadCommune(commune) {

    const config = communesZoom[commune];

    hidePanels();
    hideAllLayers();
    clearScenarioMarkers();

    if (!config) return;
    if (config.bounds) {
        map.setMaxBounds(config.bounds);
    }

    map.flyTo({
        center: config.center,
        zoom: config.zoom,
        speed: 1.2,
        curve: 1.5,
        essential: true
    });

    if (!config) return;

    map.setMaxBounds(null);


    map.once('moveend', () => {
        map.setMaxBounds(config.bounds);
        const layers = communesLayers[commune];

        if (layers) {
            layers.forEach(layerId => {
                if (map.getLayer(layerId)) {
                    map.setLayoutProperty(layerId, 'visibility', 'visible');
                }
            });
        }

        map.once('idle', () => {

            renderLayerPanel(commune);
            if (commune === 'sim-miriade-sur-terre') {

                scenarioReady = true;
                window.startScenario();
                window.updateScenario();

            } else {

                scenarioReady = false;
                clearScenarioMarkers();
            }

        });
    });

}

const items = document.querySelectorAll(".commune-item");

items.forEach(item => {

    item.addEventListener("click", () => {

        items.forEach(i => {
            i.classList.remove("active");

            const line = i.querySelector(".line");
            if (line) line.style.width = "0px";
        });

        item.classList.add("active");

        const line = item.querySelector(".line");
        const rect = item.getBoundingClientRect();
        const width = window.innerWidth - rect.right;

        if (line) {
            line.style.width = `${width}px`;
        }

        loadCommune(item.dataset.value);

    });

});

// INIT MAP

map.on('load', () => {

    initSources();
    initLayers();
    initScenario();

    const defaultItem = document.querySelector(
        '.commune-item[data-value="sim-miriade-sur-terre"]'
    );

    if (defaultItem) {

        defaultItem.classList.add("active");

        const line = defaultItem.querySelector(".line");

        if (line) {

            const rect = defaultItem.getBoundingClientRect();

            line.style.width =
                `${window.innerWidth - rect.right}px`;
        }
    }

    loadCommune('sim-miriade-sur-terre');
});