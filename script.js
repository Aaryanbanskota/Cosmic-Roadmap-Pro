const universe = document.getElementById('universe');
const orbitsContainer = document.getElementById('orbits-container');
const addFeatureBtn = document.getElementById('add-feature-btn');
const editProjectBtn = document.getElementById('edit-project-btn');
const searchBtn = document.getElementById('search-btn');
const toggleThemeBtn = document.getElementById('toggle-theme-btn');
const randomizeBtn = document.getElementById('randomize-btn');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const resetZoomBtn = document.getElementById('reset-zoom-btn');
const exportBtn = document.getElementById('export-btn');
const featureModal = document.getElementById('feature-modal');
const projectModal = document.getElementById('project-modal');
const detailModal = document.getElementById('detail-modal');
const dataModal = document.getElementById('data-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const closeProjectModalBtn = document.getElementById('close-project-modal-btn');
const closeDetailModalBtn = document.getElementById('close-detail-modal-btn');
const closeDataModalBtn = document.getElementById('close-data-modal-btn');
const cancelFeatureBtn = document.getElementById('cancel-feature-btn');
const cancelProjectBtn = document.getElementById('cancel-project-btn');
const featureForm = document.getElementById('feature-form');
const projectForm = document.getElementById('project-form');
const modalTitle = document.getElementById('modal-title');
const detailModalTitle = document.getElementById('detail-modal-title');
const detailModalBody = document.getElementById('detail-modal-body');
const tooltip = document.getElementById('tooltip');
const mainProject = document.getElementById('main-project');
const sunStats = document.getElementById('sun-stats');
const comet = document.getElementById('comet');
const searchPanel = document.getElementById('search-panel');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const zoomLevel = document.getElementById('zoom-level');
const totalFeaturesEl = document.getElementById('total-features');
const completedFeaturesEl = document.getElementById('completed-features');
const inProgressEl = document.getElementById('in-progress');
const criticalFeaturesEl = document.getElementById('critical-features');
const featureIdInput = document.getElementById('feature-id');
const featureTitleInput = document.getElementById('feature-title');
const featureDescInput = document.getElementById('feature-description');
const featurePriorityInput = document.getElementById('feature-priority');
const featureStatusInput = document.getElementById('feature-status');
const featureDifficultyInput = document.getElementById('feature-difficulty');
const featureDueDateInput = document.getElementById('feature-due-date');
const featureTagsInput = document.getElementById('feature-tags');
const featureProgressInput = document.getElementById('feature-progress');
const projectTitleInput = document.getElementById('project-title');
const projectDescInput = document.getElementById('project-description');
const exportDataTextarea = document.getElementById('export-data');
const importDataTextarea = document.getElementById('import-data');
const copyDataBtn = document.getElementById('copy-data-btn');
const downloadDataBtn = document.getElementById('download-data-btn');
const importDataBtn = document.getElementById('import-data-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const editFeatureBtn = document.getElementById('edit-feature-btn');
const deleteFeatureBtn = document.getElementById('delete-feature-btn');
const closeDetailBtn = document.getElementById('close-detail-btn');

let features = [];
let orbitAngles = {};
let currentZoom = 1;
let currentFeatureId = null;
let isEditing = false;
let cometInterval = null;
let draggedFeatureId = null;
let filteredFeatures = [];

function init() {
    try {
        loadData();
        renderFeatures();
        setupEventListeners();
        updateStatusPanel();
        updateSunStats();
        startCometAnimation();
        
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.body.classList.add('light-mode');
            toggleThemeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize the application. Please check the console for details.');
    }
}

function setupEventListeners() {
    try {
        addFeatureBtn?.addEventListener('click', openAddFeatureModal);
        editProjectBtn?.addEventListener('click', openProjectModal);
        searchBtn?.addEventListener('click', toggleSearchPanel);
        toggleThemeBtn?.addEventListener('click', toggleTheme);
        randomizeBtn?.addEventListener('click', randomizeOrbits);
        zoomInBtn?.addEventListener('click', zoomIn);
        zoomOutBtn?.addEventListener('click', zoomOut);
        resetZoomBtn?.addEventListener('click', resetZoom);
        exportBtn?.addEventListener('click', openDataModal);
        closeModalBtn?.addEventListener('click', closeFeatureModal);
        closeProjectModalBtn?.addEventListener('click', closeProjectModal);
        closeDetailModalBtn?.addEventListener('click', closeDetailModal);
        closeDataModalBtn?.addEventListener('click', closeDataModal);
        cancelFeatureBtn?.addEventListener('click', closeFeatureModal);
        cancelProjectBtn?.addEventListener('click', closeProjectModal);
        featureForm?.addEventListener('submit', handleFeatureSubmit);
        projectForm?.addEventListener('submit', handleProjectSubmit);
        closeDetailBtn?.addEventListener('click', closeDetailModal);
        editFeatureBtn?.addEventListener('click', editCurrentFeature);
        deleteFeatureBtn?.addEventListener('click', deleteCurrentFeature);
        searchInput?.addEventListener('input', debounce(handleSearch, 300));
        clearSearchBtn?.addEventListener('click', clearSearch);
        
        tabBtns.forEach(btn => {
            btn?.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                switchTab(tabId);
            });
        });
        
        copyDataBtn?.addEventListener('click', copyDataToClipboard);
        downloadDataBtn?.addEventListener('click', downloadData);
        importDataBtn?.addEventListener('click', importData);
        
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                if (e.key === '+' || e.key === '=') {
                    e.preventDefault();
                    zoomIn();
                } else if (e.key === '-') {
                    e.preventDefault();
                    zoomOut();
                } else if (e.key === '0') {
                    e.preventDefault();
                    resetZoom();
                }
            }
            if (e.key === 'Escape') {
                if (featureModal?.style.display === 'flex') closeFeatureModal();
                if (projectModal?.style.display === 'flex') closeProjectModal();
                if (detailModal?.style.display === 'flex') closeDetailModal();
                if (dataModal?.style.display === 'flex') closeDataModal();
                if (searchPanel?.style.display === 'flex') toggleSearchPanel();
            }
        });
        
        universe?.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY < 0) zoomIn();
                else zoomOut();
            }
        }, { passive: false });
        
        mainProject?.addEventListener('click', showProjectOverview);
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function loadData() {
    try {
        const savedData = localStorage.getItem('cosmicRoadmap');
        if (savedData) {
            const data = JSON.parse(savedData);
            features = Array.isArray(data.features) ? data.features : [];
            document.querySelector('.sun-title').textContent = data.project?.title || 'My Awesome Project';
            document.querySelector('.sun-description').textContent = data.project?.description || 'The ultimate solution for cosmic productivity';
        }
        features.forEach(feature => {
            if (!orbitAngles[feature.id]) {
                orbitAngles[feature.id] = Math.random() * 360;
            }
        });
        filteredFeatures = [...features];
    } catch (error) {
        console.error('Error loading data:', error);
        features = [];
        filteredFeatures = [];
    }
}

function saveData() {
    try {
        const data = {
            project: {
                title: document.querySelector('.sun-title')?.textContent || 'My Awesome Project',
                description: document.querySelector('.sun-description')?.textContent || 'The ultimate solution for cosmic productivity'
            },
            features: features
        };
        localStorage.setItem('cosmicRoadmap', JSON.stringify(data));
        updateStatusPanel();
        updateSunStats();
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Failed to save data. Please check the console.');
    }
}

function addFeature(feature) {
    try {
        if (!feature.title?.trim()) {
            alert('Feature name is required');
            return;
        }
        feature.id = Date.now().toString();
        feature.createdAt = new Date().toISOString();
        feature.tags = feature.tags ? feature.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        feature.progress = parseInt(feature.progress) || 0;
        feature.orbitIndex = features.length;
        orbitAngles[feature.id] = Math.random() * 360;
        features.push(feature);
        filteredFeatures = [...features];
        saveData();
        renderFeatures();
        if (feature.priority === 'high' || feature.priority === 'critical') {
            showComet(feature);
        }
    } catch (error) {
        console.error('Error adding feature:', error);
        alert('Failed to add feature. Please check the console.');
    }
}

function updateFeature(updatedFeature) {
    try {
        if (!updatedFeature.title?.trim()) {
            alert('Feature name is required');
            return;
        }
        updatedFeature.tags = updatedFeature.tags ? 
            (Array.isArray(updatedFeature.tags) ? updatedFeature.tags : updatedFeature.tags.split(',').map(tag => tag.trim()).filter(tag => tag)) : 
            [];
        updatedFeature.progress = parseInt(updatedFeature.progress) || 0;
        features = features.map(feature => 
            feature.id === updatedFeature.id ? { ...feature, ...updatedFeature } : feature
        );
        filteredFeatures = [...features];
        saveData();
        renderFeatures();
    } catch (error) {
        console.error('Error updating feature:', error);
        alert('Failed to update feature. Please check the console.');
    }
}

function deleteFeature(featureId) {
    try {
        if (confirm('Are you sure you want to delete this feature?')) {
            features = features.filter(feature => feature.id !== featureId);
            filteredFeatures = [...features];
            delete orbitAngles[featureId];
            saveData();
            renderFeatures();
            closeDetailModal();
        }
    } catch (error) {
        console.error('Error deleting feature:', error);
        alert('Failed to delete feature. Please check the console.');
    }
}

function toggleFeatureStatus(featureId) {
    try {
        features = features.map(feature => {
            if (feature.id === featureId) {
                const newStatus = feature.status === 'completed' ? 'planned' : 
                                feature.status === 'planned' ? 'in-progress' : 
                                feature.status === 'in-progress' ? 'blocked' : 'completed';
                return { ...feature, status: newStatus, progress: newStatus === 'completed' ? 100 : feature.progress };
            }
            return feature;
        });
        filteredFeatures = [...features];
        saveData();
        renderFeatures();
    } catch (error) {
        console.error('Error toggling feature status:', error);
    }
}

function openAddFeatureModal() {
    try {
        isEditing = false;
        currentFeatureId = null;
        modalTitle.textContent = 'Add New Feature';
        featureForm?.reset();
        featureIdInput.value = '';
        featureStatusInput.value = 'planned';
        featureDueDateInput.value = '';
        featureTagsInput.value = '';
        featureProgressInput.value = '0';
        featureModal.style.display = 'flex';
    } catch (error) {
        console.error('Error opening add feature modal:', error);
    }
}

function openProjectModal() {
    try {
        projectTitleInput.value = document.querySelector('.sun-title')?.textContent || '';
        projectDescInput.value = document.querySelector('.sun-description')?.textContent || '';
        projectModal.style.display = 'flex';
    } catch (error) {
        console.error('Error opening project modal:', error);
    }
}

function closeFeatureModal() {
    try {
        featureModal.style.display = 'none';
    } catch (error) {
        console.error('Error closing feature modal:', error);
    }
}

function closeProjectModal() {
    try {
        projectModal.style.display = 'none';
    } catch (error) {
        console.error('Error closing project modal:', error);
    }
}

function closeDetailModal() {
    try {
        detailModal.style.display = 'none';
    } catch (error) {
        console.error('Error closing detail modal:', error);
    }
}

function openDetailModal(feature) {
    try {
        currentFeatureId = feature.id;
        detailModalTitle.textContent = feature.title || 'Feature';
        
        let dueDate = 'Not set';
        if (feature.dueDate) {
            const dateObj = new Date(feature.dueDate);
            dueDate = dateObj.toLocaleDateString();
            const today = new Date();
            if (dateObj < today && feature.status !== 'completed') {
                dueDate += ' (Overdue!)';
            }
        }
        
        detailModalBody.innerHTML = `
            <div class="feature-detail-item">
                <div class="feature-detail-label">Description</div>
                <div class="feature-detail-value">${feature.description || 'No description'}</div>
            </div>
            <div class="feature-detail-item">
                <div class="feature-detail-label">Priority</div>
                <div class="feature-detail-value">${feature.priority || 'Unknown'}</div>
            </div>
            <div class="feature-detail-item">
                <div class="feature-detail-label">Status</div>
                <div class="feature-detail-value">${(feature.status || 'unknown').replace('-', ' ')}</div>
            </div>
            <div class="feature-detail-item">
                <div class="feature-detail-label">Difficulty</div>
                <div class="feature-detail-value">${feature.difficulty || 'Unknown'}</div>
            </div>
            <div class="feature-detail-item">
                <div class="feature-detail-label">Progress</div>
                <div class="feature-detail-value">${feature.progress || 0}%</div>
            </div>
            <div class="feature-detail-item">
                <div class="feature-detail-label">Due Date</div>
                <div class="feature-detail-value">${dueDate}</div>
            </div>
            <div class="feature-detail-item">
                <div class="feature-detail-label">Created</div>
                <div class="feature-detail-value">${feature.createdAt ? new Date(feature.createdAt).toLocaleDateString() : 'Unknown'}</div>
            </div>
            <div class="feature-detail-item">
                <div class="feature-detail-label">Tags</div>
                <div class="feature-detail-value">${feature.tags && feature.tags.length ? feature.tags.join(', ') : 'No tags'}</div>
            </div>
        `;
        
        detailModal.style.display = 'flex';
    } catch (error) {
        console.error('Error opening detail modal:', error);
    }
}

function editCurrentFeature() {
    try {
        const feature = features.find(f => f.id === currentFeatureId);
        if (feature) {
            closeDetailModal();
            openEditFeatureModal(feature);
        }
    } catch (error) {
        console.error('Error editing feature:', error);
    }
}

function deleteCurrentFeature() {
    try {
        deleteFeature(currentFeatureId);
    } catch (error) {
        console.error('Error deleting current feature:', error);
    }
}

function handleFeatureSubmit(e) {
    try {
        e.preventDefault();
        
        const featureData = {
            id: featureIdInput.value || Date.now().toString(),
            title: featureTitleInput.value?.trim(),
            description: featureDescInput.value?.trim(),
            priority: featurePriorityInput.value,
            status: featureStatusInput.value,
            difficulty: featureDifficultyInput.value,
            dueDate: featureDueDateInput.value,
            tags: featureTagsInput.value,
            progress: featureProgressInput.value,
            createdAt: featureIdInput.value ? 
                features.find(f => f.id === featureIdInput.value)?.createdAt : 
                new Date().toISOString(),
            orbitIndex: isEditing ? features.find(f => f.id === featureIdInput.value)?.orbitIndex : features.length
        };
        
        if (isEditing) {
            updateFeature(featureData);
        } else {
            addFeature(featureData);
        }
        
        closeFeatureModal();
    } catch (error) {
        console.error('Error handling feature submit:', error);
        alert('Failed to save feature. Please check the console.');
    }
}

function handleProjectSubmit(e) {
    try {
        e.preventDefault();
        const projectTitle = projectTitleInput.value?.trim();
        if (!projectTitle) {
            alert('Project name is required');
            return;
        }
        document.querySelector('.sun-title').textContent = projectTitle;
        document.querySelector('.sun-description').textContent = projectDescInput.value?.trim() || '';
        saveData();
        closeProjectModal();
    } catch (error) {
        console.error('Error handling project submit:', error);
        alert('Failed to save project. Please check the console.');
    }
}

function openDataModal() {
    try {
        dataModal.style.display = 'flex';
        switchTab('export');
        exportDataTextarea.value = JSON.stringify({
            project: {
                title: document.querySelector('.sun-title')?.textContent || 'My Awesome Project',
                description: document.querySelector('.sun-description')?.textContent || 'The ultimate solution for cosmic productivity'
            },
            features: features
        }, null, 2);
    } catch (error) {
        console.error('Error opening data modal:', error);
    }
}

function closeDataModal() {
    try {
        dataModal.style.display = 'none';
        importDataTextarea.value = '';
    } catch (error) {
        console.error('Error closing data modal:', error);
    }
}

function switchTab(tabId) {
    try {
        tabBtns.forEach(btn => {
            btn?.classList.toggle('active', btn.dataset.tab === tabId);
        });
        tabContents.forEach(content => {
            content?.classList.toggle('active', content.id === `${tabId}-tab`);
        });
    } catch (error) {
        console.error('Error switching tab:', error);
    }
}

function copyDataToClipboard() {
    try {
        exportDataTextarea.select();
        document.execCommand('copy');
        alert('Data copied to clipboard!');
    } catch (error) {
        console.error('Error copying data:', error);
        alert('Failed to copy data. Please check the console.');
    }
}

function downloadData() {
    try {
        const dataStr = exportDataTextarea.value;
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `cosmic-roadmap-${new Date().toISOString().split('T')[0]}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    } catch (error) {
        console.error('Error downloading data:', error);
        alert('Failed to download data. Please check the console.');
    }
}

function importData() {
    try {
        const data = JSON.parse(importDataTextarea.value);
        if (!data.project || !Array.isArray(data.features)) {
            throw new Error('Invalid data format');
        }
        document.querySelector('.sun-title').textContent = data.project.title || 'My Awesome Project';
        document.querySelector('.sun-description').textContent = data.project.description || 'The ultimate solution for cosmic productivity';
        features = data.features.map(feature => ({
            ...feature,
            id: feature.id || Date.now().toString(),
            createdAt: feature.createdAt || new Date().toISOString(),
            progress: parseInt(feature.progress) || 0,
            orbitIndex: feature.orbitIndex || 0
        }));
        orbitAngles = {};
        features.forEach(feature => {
            orbitAngles[feature.id] = Math.random() * 360;
        });
        filteredFeatures = [...features];
        saveData();
        renderFeatures();
        alert('Data imported successfully!');
        closeDataModal();
    } catch (error) {
        console.error('Error importing data:', error);
        alert('Error importing data: ' + error.message);
    }
}

function toggleSearchPanel() {
    try {
        searchPanel.style.display = searchPanel.style.display === 'flex' ? 'none' : 'flex';
        if (searchPanel.style.display === 'flex') {
            searchInput?.focus();
        } else {
            clearSearch();
        }
    } catch (error) {
        console.error('Error toggling search panel:', error);
    }
}

function handleSearch() {
    try {
        const searchTerm = searchInput.value.toLowerCase();
        filteredFeatures = features.filter(feature => 
            feature.title?.toLowerCase().includes(searchTerm) ||
            feature.description?.toLowerCase().includes(searchTerm) ||
            feature.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        renderFeatures();
    } catch (error) {
        console.error('Error handling search:', error);
    }
}

function clearSearch() {
    try {
        searchInput.value = '';
        filteredFeatures = [...features];
        renderFeatures();
    } catch (error) {
        console.error('Error clearing search:', error);
    }
}

function renderFeatures() {
    try {
        orbitsContainer.innerHTML = '';
        
        const orbitCounts = {};
        filteredFeatures.forEach((feature, index) => {
            const orbitIndex = feature.orbitIndex || index;
            orbitCounts[orbitIndex] = (orbitCounts[orbitIndex] || 0) + 1;
            
            const orbitRadius = 120 + (orbitIndex * 80);
            const orbitSize = orbitRadius * 2;
            
            const orbit = document.createElement('div');
            orbit.className = 'orbit';
            orbit.dataset.orbitIndex = orbitIndex;
            orbit.style.width = `${orbitSize}px`;
            orbit.style.height = `${orbitSize}px`;
            orbit.style.left = `calc(50% - ${orbitSize / 2}px)`;
            orbit.style.top = `calc(50% - ${orbitSize / 2}px)`;
            
            const planetContainer = document.createElement('div');
            planetContainer.className = 'planet-container';
            planetContainer.style.width = `${orbitSize}px`;
            planetContainer.style.height = `${orbitSize}px`;
            planetContainer.style.left = `calc(50% - ${orbitSize / 2}px)`;
            planetContainer.style.top = `calc(50% - ${orbitSize / 2}px)`;
            planetContainer.style.transform = `rotate(${orbitAngles[feature.id] || 0}deg)`;
            planetContainer.style.animation = `orbit var(--animation-duration, 20s) linear infinite`;
            
            const planet = document.createElement('div');
            planet.className = `planet priority-${feature.priority} status-${feature.status} difficulty-${feature.difficulty}`;
            planet.dataset.featureId = feature.id;
            planet.draggable = true;
            planet.style.transform = `translateX(${orbitRadius}px)`;
            
            if (feature.progress > 0) {
                const progressRing = document.createElement('svg');
                progressRing.className = 'progress-ring';
                progressRing.setAttribute('width', '100%');
                progressRing.setAttribute('height', '100%');
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                const radius = feature.difficulty === 'easy' ? 15 : 
                              feature.difficulty === 'medium' ? 22.5 : 
                              feature.difficulty === 'hard' ? 30 : 40;
                circle.setAttribute('cx', '50%');
                circle.setAttribute('cy', '50%');
                circle.setAttribute('r', radius - 2);
                circle.setAttribute('fill', 'none');
                circle.setAttribute('stroke', '#ffeb3b');
                circle.setAttribute('stroke-width', '2');
                const circumference = 2 * Math.PI * (radius - 2);
                circle.setAttribute('stroke-dasharray', `${circumference} ${circumference}`);
                circle.setAttribute('stroke-dashoffset', circumference * (1 - feature.progress / 100));
                progressRing.appendChild(circle);
                planet.appendChild(progressRing);
            }
            
            const icon = document.createElement('i');
            icon.className = feature.status === 'completed' ? 'fas fa-check' :
                            feature.status === 'in-progress' ? 'fas fa-spinner fa-spin' :
                            feature.status === 'blocked' ? 'fas fa-ban' : 'fas fa-star';
            planet.appendChild(icon);
            
            planet.addEventListener('click', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    toggleFeatureStatus(feature.id);
                } else {
                    openDetailModal(feature);
                }
            });
            
            planet.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                openEditFeatureModal(feature);
            });
            
            planet.addEventListener('mouseenter', (e) => showTooltip(e, feature));
            planet.addEventListener('mouseleave', hideTooltip);
            
            planet.addEventListener('dragstart', (e) => {
                draggedFeatureId = feature.id;
                planet.classList.add('dragging');
                e.dataTransfer.setData('text/plain', feature.id);
            });
            
            planet.addEventListener('dragend', () => {
                planet.classList.remove('dragging');
                draggedFeatureId = null;
            });
            
            orbit.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            
            orbit.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedFeatureId) {
                    const newOrbitIndex = parseInt(orbit.dataset.orbitIndex);
                    features = features.map(f => 
                        f.id === draggedFeatureId ? { ...f, orbitIndex: newOrbitIndex } : f
                    );
                    filteredFeatures = [...features];
                    saveData();
                    renderFeatures();
                }
            });
            
            planetContainer.appendChild(planet);
            orbitsContainer.appendChild(orbit);
            orbitsContainer.appendChild(planetContainer);
        });
        
        updateOrbitVisibility();
    } catch (error) {
        console.error('Error rendering features:', error);
        alert('Failed to render features. Please check the console.');
    }
}

function updateOrbitVisibility() {
    try {
        const orbits = document.querySelectorAll('.orbit');
        orbits.forEach(orbit => {
            const orbitIndex = parseInt(orbit.dataset.orbitIndex);
            orbit.style.display = filteredFeatures.some(f => (f.orbitIndex || 0) === orbitIndex) ? 'block' : 'none';
        });
    } catch (error) {
        console.error('Error updating orbit visibility:', error);
    }
}

function showTooltip(e, feature) {
    try {
        const planet = e.target.closest('.planet');
        const rect = planet.getBoundingClientRect();
        
        let tooltipContent = `
            <strong>${feature.title || 'Unknown'}</strong><br>
            <em>Priority:</em> ${feature.priority || 'Unknown'}<br>
            <em>Status:</em> ${(feature.status || 'unknown').replace('-', ' ')}<br>
            <em>Difficulty:</em> ${feature.difficulty || 'Unknown'}<br>
            <em>Progress:</em> ${feature.progress || 0}%
        `;
        
        if (feature.description) {
            tooltipContent += `<br><br>${feature.description}`;
        }
        
        tooltip.innerHTML = tooltipContent;
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        tooltip.style.opacity = '1';
    } catch (error) {
        console.error('Error showing tooltip:', error);
    }
}

function hideTooltip() {
    try {
        tooltip.style.opacity = '0';
    } catch (error) {
        console.error('Error hiding tooltip:', error);
    }
}

function updateStatusPanel() {
    try {
        totalFeaturesEl.textContent = features.length;
        completedFeaturesEl.textContent = features.filter(f => f.status === 'completed').length;
        inProgressEl.textContent = features.filter(f => f.status === 'in-progress').length;
        criticalFeaturesEl.textContent = features.filter(f => f.priority === 'critical').length;
    } catch (error) {
        console.error('Error updating status panel:', error);
    }
}

function updateSunStats() {
    try {
        const completedPercent = features.length > 0 ? 
            Math.round((features.filter(f => f.status === 'completed').length / features.length) * 100) : 0;
        
        sunStats.innerHTML = `
            ${features.length} total features<br>
            ${completedPercent}% completed
        `;
        
        const sun = document.querySelector('.sun');
        if (sun) {
            sun.style.boxShadow = `0 0 60px #ff8c00, 0 0 ${120 + completedPercent}px #ff8c00aa`;
        }
    } catch (error) {
        console.error('Error updating sun stats:', error);
    }
}

function zoomIn() {
    try {
        if (currentZoom < 2) {
            currentZoom = Math.min(2, currentZoom + 0.1);
            updateZoom();
        }
    } catch (error) {
        console.error('Error zooming in:', error);
    }
}

function zoomOut() {
    try {
        if (currentZoom > 0.5) {
            currentZoom = Math.max(0.5, currentZoom - 0.1);
            updateZoom();
        }
    } catch (error) {
        console.error('Error zooming out:', error);
    }
}

function resetZoom() {
    try {
        currentZoom = 1;
        updateZoom();
    } catch (error) {
        console.error('Error resetting zoom:', error);
    }
}

function updateZoom() {
    try {
        universe.style.transform = `scale(${currentZoom})`;
        zoomLevel.textContent = `${Math.round(currentZoom * 100)}%`;
    } catch (error) {
        console.error('Error updating zoom:', error);
    }
}

function showProjectOverview() {
    try {
        const completedCount = features.filter(f => f.status === 'completed').length;
        const inProgressCount = features.filter(f => f.status === 'in-progress').length;
        const blockedCount = features.filter(f => f.status === 'blocked').length;
        const criticalCount = features.filter(f => f.priority === 'critical').length;
        
        detailModalTitle.textContent = 'Project Overview';
        detailModalBody.innerHTML = `
            <div class="feature-detail-item">
                <div class="feature-detail-label">Project Name</div>
                <div class="feature-detail-value">${document.querySelector('.sun-title')?.textContent || 'My Awesome Project'}</div>
            </div>
            <div class="feature-detail-item">
                <div class="feature-detail-label">Description</div>
                <div class="feature-detail-value">${document.querySelector('.sun-description')?.textContent || 'The ultimate solution for cosmic productivity'}</div>
            </div>
            <div class="feature-detail-item">
                <div class="feature-detail-label">Features Summary</div>
                <div class="feature-detail-value">
                    <div>Total: ${features.length}</div>
                    <div>Completed: ${completedCount} (${Math.round((completedCount / features.length) * 100) || 0}%)</div>
                    <div>In Progress: ${inProgressCount}</div>
                    <div>Blocked: ${blockedCount}</div>
                    <div>Critical: ${criticalCount}</div>
                </div>
            </div>
            <div class="feature-detail-item">
                <div class="feature-detail-label">Upcoming Deadlines</div>
                <div class="feature-detail-value">
                    ${getUpcomingDeadlines()}
                </div>
            </div>
        `;
        
        detailModal.style.display = 'flex';
    } catch (error) {
        console.error('Error showing project overview:', error);
    }
}

function getUpcomingDeadlines() {
    try {
        const upcomingFeatures = features
            .filter(f => f.dueDate && f.status !== 'completed')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);
        
        if (upcomingFeatures.length === 0) {
            return 'No upcoming deadlines';
        }
        
        return upcomingFeatures.map(f => {
            const date = new Date(f.dueDate);
            const today = new Date();
            const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
            const warning = diffDays < 0 ? ' (Overdue!)' : diffDays < 7 ? ' (Soon!)' : '';
            return `${f.title}: ${date.toLocaleDateString()}${warning}`;
        }).join('<br>');
    } catch (error) {
        console.error('Error getting upcoming deadlines:', error);
        return 'Error loading deadlines';
    }
}

function startCometAnimation() {
    try {
        if (cometInterval) clearInterval(cometInterval);
        cometInterval = setInterval(() => {
            const criticalFeatures = features.filter(f => 
                f.priority === 'critical' && 
                f.dueDate && 
                f.status !== 'completed' && 
                new Date(f.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            );
            if (criticalFeatures.length > 0 && Math.random() > 0.5) {
                showComet(criticalFeatures[Math.floor(Math.random() * criticalFeatures.length)]);
            }
        }, 30000);
    } catch (error) {
        console.error('Error starting comet animation:', error);
    }
}

function showComet(feature) {
    try {
        const startX = -100;
        const startY = Math.random() * window.innerHeight;
        comet.style.left = `${startX}px`;
        comet.style.top = `${startY}px`;
        
        const cometTail = comet.querySelector('.comet-tail');
        if (cometTail) {
            cometTail.style.width = feature?.priority === 'critical' ? '150px' : '100px';
        }
        
        comet.style.opacity = '1';
        comet.style.transition = 'none';
        comet.style.transform = 'translate(0, 0)';
        
        comet.offsetHeight;
        
        comet.style.transition = 'transform 3s linear, opacity 3s linear';
        comet.style.transform = `translate(${window.innerWidth + 100}px, -${window.innerHeight}px)`;
        comet.style.opacity = '0';
        
        setTimeout(() => {
            comet.style.transition = 'none';
            comet.style.opacity = '0';
        }, 3000);
    } catch (error) {
        console.error('Error showing comet:', error);
    }
}

function openEditFeatureModal(feature) {
    try {
        isEditing = true;
        currentFeatureId = feature.id;
        modalTitle.textContent = 'Edit Feature';
        featureIdInput.value = feature.id;
        featureTitleInput.value = feature.title || '';
        featureDescInput.value = feature.description || '';
        featurePriorityInput.value = feature.priority || 'low';
        featureStatusInput.value = feature.status || 'planned';
        featureDifficultyInput.value = feature.difficulty || 'easy';
        featureDueDateInput.value = feature.dueDate || '';
        featureTagsInput.value = feature.tags ? feature.tags.join(', ') : '';
        featureProgressInput.value = feature.progress || 0;
        featureModal.style.display = 'flex';
    } catch (error) {
        console.error('Error opening edit feature modal:', error);
    }
}

function randomizeOrbits() {
    try {
        orbitAngles = {};
        features.forEach(feature => {
            orbitAngles[feature.id] = Math.random() * 360;
        });
        renderFeatures();
    } catch (error) {
        console.error('Error randomizing orbits:', error);
    }
}

function toggleTheme() {
    try {
        document.body.classList.toggle('light-mode');
        toggleThemeBtn.innerHTML = document.body.classList.contains('light-mode') ? 
            '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    } catch (error) {
        console.error('Error toggling theme:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        init();
    } catch (error) {
        console.error('DOMContentLoaded error:', error);
        alert('Failed to load the application. Please check the console for details.');
    }
});