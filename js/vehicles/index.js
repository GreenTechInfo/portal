import { renderVehicleList } from './vehicle-list.js';
import { renderTuningPage } from './tuning.js';
import { renderPaintJobPage } from './paintjob.js';
import { renderWheelsPage } from './wheels.js';

document.addEventListener('DOMContentLoaded', () => {
    const vehiclesContainer = document.getElementById('vehiclesContent');
    const tuningContainer = document.getElementById('tuningContent');
    const paintjobContainer = document.getElementById('paintjobContent');
    const wheelsContainer = document.getElementById('wheelsContent');

    if (vehiclesContainer && typeof VEHICLES_DATA !== 'undefined') {
        renderVehicleList(vehiclesContainer);
    }
    if (tuningContainer && typeof VEHICLES_DATA !== 'undefined') {
        renderTuningPage(tuningContainer);
    }
    if (paintjobContainer && typeof VEHICLES_DATA !== 'undefined') {
        renderPaintJobPage(paintjobContainer);
    }
    if (wheelsContainer && typeof VEHICLES_DATA !== 'undefined') {
        renderWheelsPage(wheelsContainer);
    }
});