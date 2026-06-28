document.addEventListener('DOMContentLoaded', function() {
    const MAP_IMAGE_URL = '../images/map/map.png';
    const MAP_WIDTH = 3072;
    const MAP_HEIGHT = 3072;

    const mapContainer = document.getElementById('mapContainer');
    const mapElement = document.getElementById('map');

    let polygonLayer = null;
    let institutionLayer = null;
    let jobLayer = null;
    let dealershipLayer = null;
    let fishingLayer = null;
    let otherLayer = null;
    let currentHighlighted = null;
    let isRendering = false;
    let dragRedrawInterval = null;

    let filters = {
        showCities: true,
        showInstitutions: true,
        showJobs: true,
        showDealerships: true,
        showFishing: true,
        showOthers: true
    };

    const map = L.map('map', {
        crs: L.CRS.Simple,
        center: [0, 0],
        zoom: 0,
        minZoom: -2,
        maxZoom: 3,
        zoomSnap: 0.1,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 120,
        zoomControl: false,
        fadeAnimation: false,
        zoomAnimation: false,
        markerZoomAnimation: false,
        inertia: false,
        inertiaDeceleration: 0,
        inertiaMaxSpeed: 0,
        easeLinearity: 0,
        trackResize: false
    });
    
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);
    
    map.dragging.disable();
    map.dragging.enable();
    
    const halfWidth = MAP_WIDTH / 2;
    const halfHeight = MAP_HEIGHT / 2;
    const bounds = [
        [-halfHeight, -halfWidth],
        [halfHeight, halfWidth]
    ];
    
    const imageOverlay = L.imageOverlay(MAP_IMAGE_URL, bounds, {
        interactive: false,
        bubblingMouseEvents: false,
        className: 'map-image'
    }).addTo(map);
    
    map.setMaxBounds(bounds);
    map.setMinZoom(-2);

    function createMarker(item, color, icon, popupClass, zIndexOffset = 1000) {
        const latLng = pixelToLatLng(item.coords[0], item.coords[1], MAP_WIDTH, MAP_HEIGHT);
        
        const iconHtml = `
            <div class="custom-marker" style="
                width: 24px;
                height: 24px;
                background: ${color};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid rgba(255,255,255,0.25);
                box-shadow: 0 3px 12px rgba(0,0,0,0.5);
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                font-size: 11px;
                color: #fff;
            ">
                <i class="fas ${icon}"></i>
            </div>
        `;
        
        const divIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-div-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -14]
        });
        
        const marker = L.marker(latLng, {
            icon: divIcon,
            interactive: true,
            bubblingMouseEvents: true,
            zIndexOffset: zIndexOffset
        });
        
        marker._itemData = item;

        let popupContent = `
            <div class="${popupClass}">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                    <div style="
                        width:28px;height:28px;
                        background:${color};
                        border-radius:50%;
                        display:flex;align-items:center;justify-content:center;
                        font-size:12px;color:#fff;
                        flex-shrink:0;
                    ">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div>
                        <div style="font-weight:600;font-size:13px;color:var(--text);">${item.name}</div>
                        <div style="font-size:10px;color:var(--text-secondary);">${item.description || ''}</div>
                    </div>
                </div>
                ${item.address ? `<div style="font-size:11px;color:var(--text-secondary);margin-top:4px;"><i class="fas fa-location-dot" style="width:14px;"></i> ${item.address}</div>` : ''}
            </div>
        `;
        
        marker.bindPopup(popupContent, {
            className: `${popupClass}-wrapper`,
            maxWidth: 260,
            minWidth: 180
        });

        marker.on('mouseover', function(e) {
            const el = this.getElement();
            if (el) {
                const markerDiv = el.querySelector('.custom-marker');
                if (markerDiv) {
                    markerDiv.style.transform = 'scale(1.25)';
                    markerDiv.style.boxShadow = '0 6px 25px rgba(0,0,0,0.7)';
                }
            }
        });
        
        marker.on('mouseout', function(e) {
            const el = this.getElement();
            if (el) {
                const markerDiv = el.querySelector('.custom-marker');
                if (markerDiv) {
                    markerDiv.style.transform = 'scale(1)';
                    markerDiv.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
                }
            }
        });
        
        return marker;
    }

    function createInstitutionMarkers() {
        if (institutionLayer) {
            map.removeLayer(institutionLayer);
        }
        
        institutionLayer = L.layerGroup();
        
        if (filters.showInstitutions) {
            GOVERNMENT_INSTITUTIONS.forEach(inst => {
                const marker = createMarker(inst, INSTITUTION_COLOR, inst.icon, 'institution-popup', 1000);
                institutionLayer.addLayer(marker);
            });
        }
        
        map.addLayer(institutionLayer);
    }

    function createJobMarkers() {
        if (jobLayer) {
            map.removeLayer(jobLayer);
        }
        
        jobLayer = L.layerGroup();
        
        if (filters.showJobs) {
            JOBS.forEach(job => {
                const marker = createMarker(job, JOB_COLOR, job.icon, 'job-popup', 900);
                jobLayer.addLayer(marker);
            });
        }
        
        map.addLayer(jobLayer);
    }

    function createDealershipMarkers() {
        if (dealershipLayer) {
            map.removeLayer(dealershipLayer);
        }
        
        dealershipLayer = L.layerGroup();
        
        if (filters.showDealerships) {
            CAR_DEALERSHIPS.forEach(item => {
                const marker = createMarker(item, DEALERSHIP_COLOR, item.icon, 'dealership-popup', 950);
                dealershipLayer.addLayer(marker);
            });
        }
        
        map.addLayer(dealershipLayer);
    }

    function createFishingMarkers() {
        if (fishingLayer) {
            map.removeLayer(fishingLayer);
        }
        
        fishingLayer = L.layerGroup();
        
        if (filters.showFishing) {
            FISHING_SPOTS.forEach(item => {
                const marker = createMarker(item, FISHING_COLOR, item.icon, 'fishing-popup', 800);
                fishingLayer.addLayer(marker);
            });
        }
        
        map.addLayer(fishingLayer);
    }

    function createOtherMarkers() {
        if (otherLayer) {
            map.removeLayer(otherLayer);
        }
        
        otherLayer = L.layerGroup();
        
        if (filters.showOthers) {
            OTHER_PLACES.forEach(item => {
                const marker = createMarker(item, OTHER_COLOR, item.icon, 'other-popup', 850);
                otherLayer.addLayer(marker);
            });
        }
        
        map.addLayer(otherLayer);
    }

    function updatePolygonsDuringDrag() {
        if (!polygonLayer) return;
        
        polygonLayer.eachLayer(function(layer) {
            if (layer._renderer && layer._renderer._update) {
                layer._renderer._update();
            }

            if (layer._path) {
                const points = layer._originalPoints;
                if (points && layer._renderer) {
                    const renderer = layer._renderer;
                    if (renderer._updatePath) {
                        renderer._updatePath(layer);
                    }
                }
            }
        });
    }
    
    function createPolygons() {
        if (isRendering) return;
        isRendering = true;
        
        if (polygonLayer) {
            map.removeLayer(polygonLayer);
        }
        
        polygonLayer = L.layerGroup();
        
        requestAnimationFrame(() => {
            if (filters.showCities) {
                CITIES_POLYGONS.forEach(cityData => {
                    const latLngPoints = cityData.points.map(point => {
                        return pixelToLatLng(point[0], point[1], MAP_WIDTH, MAP_HEIGHT);
                    });
                    
                    const polygon = L.polygon(latLngPoints, {
                        color: cityData.color,
                        weight: 1.5,
                        opacity: 0.8,
                        fillColor: cityData.color,
                        fillOpacity: 0.1,
                        className: 'city-polygon',
                        smoothFactor: 0,
                        noClip: false,
                        interactive: true,
                        bubblingMouseEvents: true,
                        pane: 'overlayPane'
                    });
                    
                    polygon._cityData = cityData;
                    polygon._originalPoints = latLngPoints;
                    
                    if (polygon._path) {
                        polygon._path.setAttribute('tabindex', '-1');
                        polygon._path.style.outline = 'none';
                        polygon._path.style.webkitTapHighlightColor = 'transparent';
                    }
                    
                    polygon.on('mouseover', function(e) {
                        const data = this._cityData;
                        const typeName = getTypeName(data.type);
                        
                        if (currentHighlighted && currentHighlighted !== this) {
                            currentHighlighted.setStyle({
                                fillOpacity: 0.1,
                                weight: 1.5
                            });
                        }
                        
                        this.setStyle({
                            fillOpacity: 0.25,
                            weight: 3
                        });
                        currentHighlighted = this;
                        
                        const tooltipContent = `
                            <div style="text-align: center; line-height: 1.4;">
                                <div style="font-weight: 700; font-size: 14px; color: #e8edf5;">${data.name}</div>
                                <div style="font-weight: 400; font-size: 10px; color: #8892a8;">${typeName}</div>
                            </div>
                        `;
                        
                        this.bindTooltip(tooltipContent, {
                            permanent: false,
                            direction: 'top',
                            offset: [0, -8],
                            className: 'polygon-tooltip',
                            interactive: false,
                            sticky: false,
                            minWidth: 30,
                            maxWidth: 200
                        }).openTooltip();
                    });
                    
                    polygon.on('mouseout', function(e) {
                        this.setStyle({
                            fillOpacity: 0.1,
                            weight: 1.5
                        });
                        currentHighlighted = null;
                        this.closeTooltip();
                        this.unbindTooltip();
                    });
                    
                    polygon.on('click', function(e) {
                        if (this._path) {
                            this._path.blur();
                        }
                    });
                    
                    polygonLayer.addLayer(polygon);
                });
            }
            
            map.addLayer(polygonLayer);
            isRendering = false;
        });
    }
    
    function fitMapToWidth() {
        const containerWidth = mapContainer.clientWidth;
        const targetZoom = Math.log2(containerWidth / MAP_WIDTH);
        map.setView([0, 0], targetZoom, { animate: false });
    }
    
    function updateContainerHeight() {
        const containerWidth = mapContainer.clientWidth;
        const viewHeight = window.innerHeight;
        let containerHeight = containerWidth * (MAP_HEIGHT / MAP_WIDTH);
        const maxHeight = viewHeight * 0.8;
        if (containerHeight > maxHeight) {
            containerHeight = maxHeight;
        }
        mapContainer.style.height = containerHeight + 'px';
    }
    
    function fullResize() {
        updateContainerHeight();
        map.invalidateSize({ animate: false });
        fitMapToWidth();
    }
    
    function updateAllLayers() {
        createPolygons();
        createInstitutionMarkers();
        createJobMarkers();
        createDealershipMarkers();
        createFishingMarkers();
        createOtherMarkers();
        updateFilterButtons();
    }
    
    function updateFilterButtons() {
        document.querySelectorAll('.filter-toggle').forEach(btn => {
            const filter = btn.dataset.filter;
            btn.classList.remove('active', 'active-city', 'active-institution', 'active-job', 'active-dealership', 'active-fishing', 'active-other');
            
            if (filter === 'cities' && filters.showCities) {
                btn.classList.add('active', 'active-city');
            } else if (filter === 'institutions' && filters.showInstitutions) {
                btn.classList.add('active', 'active-institution');
            } else if (filter === 'jobs' && filters.showJobs) {
                btn.classList.add('active', 'active-job');
            } else if (filter === 'dealerships' && filters.showDealerships) {
                btn.classList.add('active', 'active-dealership');
            } else if (filter === 'fishing' && filters.showFishing) {
                btn.classList.add('active', 'active-fishing');
            } else if (filter === 'others' && filters.showOthers) {
                btn.classList.add('active', 'active-other');
            }
        });
    }

    function setupFilters() {
        document.querySelectorAll('.filter-toggle').forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.dataset.filter;

                if (filter === 'cities') {
                    filters.showCities = !filters.showCities;
                } else if (filter === 'institutions') {
                    filters.showInstitutions = !filters.showInstitutions;
                } else if (filter === 'jobs') {
                    filters.showJobs = !filters.showJobs;
                } else if (filter === 'dealerships') {
                    filters.showDealerships = !filters.showDealerships;
                } else if (filter === 'fishing') {
                    filters.showFishing = !filters.showFishing;
                } else if (filter === 'others') {
                    filters.showOthers = !filters.showOthers;
                }

                updateAllLayers();
            });
        });
    }
    
    map.on('dragstart', function() {
        if (dragRedrawInterval) {
            clearInterval(dragRedrawInterval);
        }
        dragRedrawInterval = setInterval(function() {
            const overlayPane = document.querySelector('.leaflet-overlay-pane');
            if (overlayPane) {
                if (polygonLayer) {
                    polygonLayer.eachLayer(function(layer) {
                        if (layer._renderer && layer._renderer._update) {
                            layer._renderer._update();
                        }
                    });
                }
            }
        }, 16);
    });
    
    map.on('drag', function() {
        if (polygonLayer) {
            polygonLayer.eachLayer(function(layer) {
                if (layer._renderer && layer._renderer._update) {
                    layer._renderer._update();
                }
            });
        }
    });
    
    map.on('dragend', function() {
        if (dragRedrawInterval) {
            clearInterval(dragRedrawInterval);
            dragRedrawInterval = null;
        }

        setTimeout(function() {
            if (polygonLayer) {
                polygonLayer.eachLayer(function(layer) {
                    if (layer._renderer && layer._renderer._update) {
                        layer._renderer._update();
                    }
                });
            }
        }, 50);
    });
    
    const originalSetView = map.setView;
    const originalZoomIn = map.zoomIn;
    const originalZoomOut = map.zoomOut;
    
    map.setView = function(center, zoom, options) {
        return originalSetView.call(this, center, zoom, { animate: false });
    };
    
    map.zoomIn = function(delta, options) {
        return originalZoomIn.call(this, delta, { animate: false });
    };
    
    map.zoomOut = function(delta, options) {
        return originalZoomOut.call(this, delta, { animate: false });
    };
    
    map.on('zoomstart', function() {
        if (polygonLayer) {
            polygonLayer.eachLayer(function(layer) {
                if (layer._path) {
                    layer._path.style.transition = 'none';
                }
            });
        }
    });
    
    map.on('zoomend', function() {
        setTimeout(() => {
            if (polygonLayer) {
                polygonLayer.eachLayer(function(layer) {
                    if (layer._path) {
                        layer._path.style.transition = '';
                    }
                });
            }
        }, 50);
    });
    
    createPolygons();
    createInstitutionMarkers();
    createJobMarkers();
    createDealershipMarkers();
    createFishingMarkers();
    createOtherMarkers();
    setupFilters();
    setTimeout(fullResize, 50);
    
    let resizeTimeout = null;
    window.addEventListener('resize', function() {
        if (resizeTimeout) {
            cancelAnimationFrame(resizeTimeout);
        }
        resizeTimeout = requestAnimationFrame(() => {
            fullResize();
            resizeTimeout = null;
        });
    });
    
    window.addEventListener('orientationchange', () => {
        setTimeout(fullResize, 100);
    });
    
    window.addEventListener('load', () => {
        setTimeout(fullResize, 100);
    });
    
    document.getElementById('resetViewBtn').addEventListener('click', function() {
        fitMapToWidth();
    });

    const style = document.createElement('style');
    style.textContent = `
        .leaflet-overlay-pane svg {
            transition: none !important;
        }
        .leaflet-overlay-pane svg * {
            transition: none !important;
        }
        .leaflet-zoom-animated {
            transition: none !important;
        }
        .city-polygon {
            transition: none !important;
        }
        
        .city-polygon,
        .city-polygon:focus,
        .city-polygon:active,
        .city-polygon:focus-visible {
            outline: none !important;
            box-shadow: none !important;
        }
        
        .leaflet-overlay-pane svg,
        .leaflet-overlay-pane svg *,
        .leaflet-interactive,
        .leaflet-interactive:focus,
        .leaflet-interactive:active,
        .leaflet-interactive:focus-visible {
            outline: none !important;
            box-shadow: none !important;
        }
        
        * {
            -webkit-tap-highlight-color: transparent !important;
        }
        
        .polygon-tooltip {
            background: var(--card-bg, #1e2229) !important;
            border: 1px solid var(--border, #2a2f3a) !important;
            border-radius: 6px !important;
            padding: 4px 10px !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5) !important;
            pointer-events: none !important;
        }
        
        .polygon-tooltip .leaflet-popup-content-wrapper {
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
        }
        
        .polygon-tooltip .leaflet-tooltip-text {
            margin: 0 !important;
            padding: 0 !important;
        }
        
        .leaflet-tooltip-pane .leaflet-tooltip:before {
            display: none !important;
        }

        .custom-div-icon {
            background: none !important;
            border: none !important;
        }

        /* Стили для всех попапов */
        .institution-popup-wrapper,
        .job-popup-wrapper,
        .dealership-popup-wrapper,
        .fishing-popup-wrapper,
        .other-popup-wrapper {
            background: var(--card-bg, #1e2229) !important;
            border: 1px solid var(--border, #2a2f3a) !important;
            border-radius: 10px !important;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6) !important;
        }
        
        .institution-popup-wrapper .leaflet-popup-content-wrapper,
        .job-popup-wrapper .leaflet-popup-content-wrapper,
        .dealership-popup-wrapper .leaflet-popup-content-wrapper,
        .fishing-popup-wrapper .leaflet-popup-content-wrapper,
        .other-popup-wrapper .leaflet-popup-content-wrapper {
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 10px !important;
            padding: 0 !important;
        }
        
        .institution-popup-wrapper .leaflet-popup-content,
        .job-popup-wrapper .leaflet-popup-content,
        .dealership-popup-wrapper .leaflet-popup-content,
        .fishing-popup-wrapper .leaflet-popup-content,
        .other-popup-wrapper .leaflet-popup-content {
            margin: 12px 16px !important;
            font-family: system-ui, -apple-system, sans-serif;
            color: var(--text, #e8edf5);
        }
        
        .institution-popup-wrapper .leaflet-popup-tip,
        .job-popup-wrapper .leaflet-popup-tip,
        .dealership-popup-wrapper .leaflet-popup-tip,
        .fishing-popup-wrapper .leaflet-popup-tip,
        .other-popup-wrapper .leaflet-popup-tip {
            background: var(--card-bg, #1e2229) !important;
            border: 1px solid var(--border, #2a2f3a) !important;
            border-top: none !important;
            border-left: none !important;
        }
        
        .institution-popup-wrapper .leaflet-popup-close-button,
        .job-popup-wrapper .leaflet-popup-close-button,
        .dealership-popup-wrapper .leaflet-popup-close-button,
        .fishing-popup-wrapper .leaflet-popup-close-button,
        .other-popup-wrapper .leaflet-popup-close-button {
            color: var(--text-secondary, #8892a8) !important;
            font-size: 18px !important;
            padding: 6px 8px !important;
            transition: color 0.2s;
        }
        
        .institution-popup-wrapper .leaflet-popup-close-button:hover,
        .job-popup-wrapper .leaflet-popup-close-button:hover,
        .dealership-popup-wrapper .leaflet-popup-close-button:hover,
        .fishing-popup-wrapper .leaflet-popup-close-button:hover,
        .other-popup-wrapper .leaflet-popup-close-button:hover {
            color: var(--text, #e8edf5) !important;
        }

        .map-controls-wrapper {
            position: absolute;
            top: 12px;
            right: 12px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 6px;
            max-width: 200px;
        }
        
        .settings-toggle {
            background: var(--card-bg, #1e2229);
            border: 1px solid var(--border, #2a2f3a);
            border-radius: 8px;
            color: var(--text, #e8edf5);
            padding: 8px 14px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 6px;
            font-family: inherit;
            width: 100%;
            justify-content: center;
        }

        .settings-toggle:hover {
            background: #2a2f3a !important;
            border-color: var(--border, #2a2f3a);
            color: var(--text, #e8edf5);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .settings-toggle.active {
            background: var(--accent, #4a7cf7) !important;
            color: #fff !important;
            border-color: var(--accent, #4a7cf7) !important;
        }
        
        .map-controls {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .map-controls .control-group {
            background: var(--card-bg, #1e2229);
            border: 1px solid var(--border, #2a2f3a);
            border-radius: 8px;
            padding: 8px 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            min-width: 140px;
        }
        
        .map-controls .control-group .group-title {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-secondary, #8892a8);
            margin-bottom: 4px;
            padding-bottom: 4px;
            border-bottom: 1px solid var(--border, #2a2f3a);
        }
        
        .map-controls .control-group .btn-group {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }
        
        .map-controls button.filter-toggle {
            background: var(--bg-secondary, #13171c);
            border: 1px solid var(--border, #2a2f3a);
            border-radius: 4px;
            color: var(--text-secondary, #8892a8);
            padding: 4px 10px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .map-controls button.filter-toggle i {
            font-size: 11px;
        }
        
        .map-controls button.filter-toggle:hover {
            background: var(--border, #2a2f3a);
        }
        
        .map-controls button.filter-toggle.active {
            color: #fff;
        }
        
        .map-controls button.filter-toggle.active-city {
            background: rgba(46, 204, 113, 0.25);
            border-color: #2ecc71;
            color: #2ecc71;
        }
        
        .map-controls button.filter-toggle.active-institution {
            background: rgba(231, 76, 60, 0.25);
            border-color: #e74c3c;
            color: #e74c3c;
        }
        
        .map-controls button.filter-toggle.active-job {
            background: rgba(52, 152, 219, 0.25);
            border-color: #3498db;
            color: #3498db;
        }
        
        .map-controls button.filter-toggle.active-dealership {
            background: rgba(243, 156, 18, 0.25);
            border-color: #f39c12;
            color: #f39c12;
        }
        
        .map-controls button.filter-toggle.active-fishing {
            background: rgba(26, 188, 156, 0.25);
            border-color: #1abc9c;
            color: #1abc9c;
        }
        
        .map-controls button.filter-toggle.active-other {
            background: rgba(155, 89, 182, 0.25);
            border-color: #9b59b6;
            color: #9b59b6;
        }
        
        @media (max-width: 600px) {
            .map-controls-wrapper {
                top: 8px;
                right: 8px;
                max-width: 160px;
            }
            .map-controls .control-group {
                min-width: 100px;
                padding: 6px 8px;
            }
            .map-controls button.filter-toggle {
                font-size: 10px;
                padding: 3px 8px;
            }
            .settings-toggle {
                padding: 6px 10px;
                font-size: 12px;
            }
            .settings-toggle span {
                display: none;
            }
        }
    `;
    document.head.appendChild(style);
        
    let clickMode = false;
    map.on('click', function(e) {
        if (clickMode) {
            const pixelX = e.latlng.lng + MAP_WIDTH / 2;
            const pixelY = MAP_HEIGHT / 2 - e.latlng.lat;
            alert(`Пиксельные координаты: x=${Math.round(pixelX)}, y=${Math.round(pixelY)}`);
        }
    });
});