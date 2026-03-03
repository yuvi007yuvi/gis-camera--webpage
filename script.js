/**
 * GIS CCTV Camera Monitoring - Nagar Parishad Sultanganj
 * Main Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Map
    // Default center for Sultanganj, Bihar
    const sultanganjCenter = [25.2427, 86.7352];
    const initialZoom = 14;

    // Style Layers
    const streetLabel = 'Street View';
    const satelliteLabel = 'Satellite View';

    const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    });

    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    });

    const satelliteLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google'
    });

    const map = L.map('camera-map', {
        center: sultanganjCenter,
        zoom: initialZoom,
        layers: [streetLayer],
        zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const baseMaps = {
        "Street": streetLayer,
        "Dark": darkLayer,
        "Satellite": satelliteLayer
    };

    L.control.layers(baseMaps, null, { position: 'bottomright' }).addTo(map);

    // Initialize Marker Cluster Group with Professional Theming
    const markerCluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 40,
        iconCreateFunction: function (cluster) {
            return L.divIcon({
                html: `<div><span>${cluster.getChildCount()}</span></div>`,
                className: 'marker-cluster',
                iconSize: L.point(40, 40)
            });
        }
    });
    map.addLayer(markerCluster);

    // 2. Global State
    let currentMarkers = [];
    let filteredData = [...cameraData];
    let statusChart = null;

    // 3. UI Elements
    const searchInput = document.getElementById('search-location');
    const wardFilter = document.getElementById('filter-ward');
    const statusFilter = document.getElementById('filter-status');
    const cameraListContainer = document.getElementById('camera-items-list');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');

    // 4. Populate Ward Filter
    const populateWards = () => {
        const wards = [...new Set(cameraData.map(c => c.ward))].filter(w => w !== 'N/A').sort((a, b) => parseInt(a) - parseInt(b));
        wards.forEach(ward => {
            const option = document.createElement('option');
            option.value = ward;
            option.textContent = `Ward ${ward}`;
            wardFilter.appendChild(option);
        });
    };

    // 5. Marker Icons (Professional Pin Style)
    const getMarkerIcon = (status) => {
        let statusClass = 'active';
        if (status === 'Inactive') statusClass = 'inactive';
        if (status === 'Maintenance') statusClass = 'maintenance';

        const html = `
            <div class="marker-wrapper">
                <div class="camera-marker-pin ${statusClass}">
                    <i class="fas fa-video"></i>
                </div>
            </div>
        `;

        return L.divIcon({
            html: html,
            className: 'custom-pin-icon',
            iconSize: [32, 42],
            iconAnchor: [16, 42],
            popupAnchor: [0, -40]
        });
    };

    // 6. Plot Markers
    const plotMarkers = (data) => {
        // Clear existing markers from cluster
        markerCluster.clearLayers();
        currentMarkers = [];

        // Plot new markers
        data.forEach((camera, index) => {
            const marker = L.marker([camera.lat, camera.lng], {
                icon: getMarkerIcon(camera.status)
            });

            // Create Popup Content
            const popupContent = `
                <div class="camera-popup-header text-white fw-bold">
                    <i class="fas fa-video me-2"></i> ${camera.name}
                </div>
                <div class="camera-popup-body">
                    <div class="popup-live-feed">
                        <div class="cam-label">CAM-${index + 101} | 1080p | 60FPS</div>
                        <div class="live-indicator"><i class="fas fa-circle"></i> LIVE</div>
                        <img src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=300&q=80" style="width:100%; height:100%; object-fit:cover; opacity: 0.6;">
                    </div>
                    <div class="mb-2 d-flex justify-content-between align-items-center">
                        <span class="badge" style="background: ${getBadgeColor(camera.status)}">${camera.status}</span>
                        <span class="text-muted small fw-bold">Ward ${camera.ward}</span>
                    </div>
                    <div class="mb-3">
                        <small class="text-muted d-block mb-1">Landmark</small>
                        <div class="fw-semibold text-dark" style="font-size: 0.85rem;">${camera.landmark}</div>
                    </div>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${camera.lat},${camera.lng}" target="_blank" class="btn btn-nav-google btn-sm rounded-pill mb-2">
                        <i class="fab fa-google"></i> Navigate to Field
                    </a>
                    <div class="p-1 border-top mt-1 small text-center text-muted font-monospace" style="font-size: 10px;">
                        ${camera.lat.toFixed(6)}, ${camera.lng.toFixed(6)}
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            markerCluster.addLayer(marker);

            // Link marker to data index for sidebar interaction
            marker.cameraId = index;
            currentMarkers.push(marker);
        });

        renderCameraList(data);

        // Fit map bounds if markers exist
        if (currentMarkers.length > 0) {
            map.fitBounds(markerCluster.getBounds().pad(0.1));
        } else {
            map.setView(sultanganjCenter, initialZoom);
        }
    };

    // Helper for popup badge color
    const getBadgeColor = (status) => {
        if (status === 'Active') return 'var(--success)';
        if (status === 'Inactive') return 'var(--danger)';
        return 'var(--warning)';
    };

    // 7. Update Dashboard Counters & Analytics
    const updateDashboard = (data) => {
        const counts = {
            total: data.length,
            active: data.filter(c => c.status === 'Active').length,
            inactive: data.filter(c => c.status === 'Inactive').length,
            maintenance: data.filter(c => c.status === 'Maintenance').length
        };

        document.getElementById('total-cameras-count').textContent = counts.total;
        document.getElementById('active-cameras-count').textContent = counts.active;
        document.getElementById('inactive-cameras-count').textContent = counts.inactive;
        document.getElementById('maintenance-cameras-count').textContent = counts.maintenance;

        updateChart(counts);
    };

    // 7.1 Chart.js Logic
    const updateChart = (counts) => {
        const ctx = document.getElementById('statusChart').getContext('2d');

        if (statusChart) {
            statusChart.destroy();
        }

        statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Offline', 'Fixing'],
                datasets: [{
                    data: [counts.active, counts.inactive, counts.maintenance],
                    backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                    borderWidth: 0,
                    hoverOffset: 4,
                    cutout: '80%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: 0 },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        padding: 10,
                        titleFont: { size: 12 },
                        bodyFont: { size: 12 }
                    }
                },
                animation: { animateRotate: true, duration: 800 }
            }
        });
    };

    // 8. Render Camera List (Sidebar)
    const renderCameraList = (data) => {
        cameraListContainer.innerHTML = '';
        data.forEach((camera, idx) => {
            const wardText = camera.ward && camera.ward !== 'N/A' ? `Ward ${camera.ward}` : 'General Area';
            const item = document.createElement('div');
            item.className = 'camera-item d-flex align-items-center';
            item.innerHTML = `
                <div class="me-3">
                    <div class="rounded-circle" style="width: 10px; height: 10px; background: ${getBadgeColor(camera.status)}"></div>
                </div>
                <div class="flex-grow-1 overflow-hidden">
                    <div class="fw-bold small text-truncate">${camera.name}</div>
                    <div class="text-muted text-truncate" style="font-size: 11px;">
                        ${wardText} • ${camera.landmark.replace(/Near /i, '')}
                    </div>
                </div>
                <div class="ms-2">
                    <i class="fas fa-chevron-right text-muted" style="font-size: 10px;"></i>
                </div>
            `;
            item.addEventListener('click', () => {
                // Find and trigger the marker
                const targetMarker = currentMarkers.find(m => m.cameraId === cameraData.indexOf(camera));
                if (targetMarker) {
                    map.setView(targetMarker.getLatLng(), 18);
                    targetMarker.openPopup();
                }
            });
            cameraListContainer.appendChild(item);
        });
    };

    // 9. Filtering Logic
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const wardValue = wardFilter.value;
        const statusValue = statusFilter.value;

        filteredData = cameraData.filter(camera => {
            const matchesSearch = camera.name.toLowerCase().includes(searchTerm) ||
                camera.landmark.toLowerCase().includes(searchTerm);
            const matchesWard = !wardValue || camera.ward === wardValue;
            const matchesStatus = !statusValue || camera.status === statusValue;

            return matchesSearch && matchesWard && matchesStatus;
        });

        plotMarkers(filteredData);
        updateDashboard(filteredData);
    };

    // 10. Event Listeners
    searchInput.addEventListener('input', applyFilters);
    wardFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);

    // Theme Toggle Handler
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            darkModeToggle.click();
        });
    }

    darkModeToggle.addEventListener('change', (e) => {
        const isDark = e.target.checked;
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            // Auto-switch map to dark if currently on street
            if (map.hasLayer(streetLayer)) {
                map.removeLayer(streetLayer);
                map.addLayer(darkLayer);
            }
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            // Auto-switch map to street if currently on dark
            if (map.hasLayer(darkLayer)) {
                map.removeLayer(darkLayer);
                map.addLayer(streetLayer);
            }
        }

        // Refresh chart with theme-aware tooltips
        updateDashboard(filteredData);
    });

    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            searchInput.value = '';
            wardFilter.value = '';
            statusFilter.value = '';
            applyFilters();
        });
    }

    // Check saved theme and initialize
    if (localStorage.getItem('theme') === 'dark') {
        darkModeToggle.checked = true;
        document.documentElement.setAttribute('data-theme', 'dark');
        // Initialize map with dark layer
        if (map.hasLayer(streetLayer)) {
            map.removeLayer(streetLayer);
            map.addLayer(darkLayer);
        }
    }

    // 10. Initial Load
    populateWards();
    updateDashboard(cameraData);
    plotMarkers(cameraData);

    // Initial map resize to ensure Leaflet renders correctly
    setTimeout(() => {
        map.invalidateSize();
    }, 400);
});
