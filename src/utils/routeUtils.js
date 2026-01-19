// src/utils/routeUtils.js

/**
 * Interpolates points along a straight line from start to end.
 * Uses simple linear interpolation for demonstration.
 * For production, consider integrating with a routing service (e.g., OSRM, Google Maps Directions).
 *
 * @param {Object} start - { lat: number, lng: number }
 * @param {Object} end - { lat: number, lng: number }
 * @param {number} numPoints - Number of points to generate (default: 10)
 * @returns {Array<{lat: number, lng: number}>}
 */
function interpolateRoute(start, end, numPoints = 10) {
    const points = [];
    const deltaLat = (end.lat - start.lat) / numPoints;
    const deltaLng = (end.lng - start.lng) / numPoints;

    for (let i = 0; i <= numPoints; i++) {
        points.push({
            lat: start.lat + deltaLat * i,
            lng: start.lng + deltaLng * i,
        });
    }

    return points;
}

module.exports = {
    interpolateRoute,
};