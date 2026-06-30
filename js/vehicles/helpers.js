export function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

export function getValue(value) {
    return value && value !== "" ? value : "н/д";
}

export function getDealerDisplay(vehicle) {
    if (vehicle.saleType === "Эксклюзив") return "Эксклюзив";
    if (vehicle.saleType === "Донат") return "Донат";
    if (vehicle.saleType === "Нет в продаже") return "Нет в продаже";
    if (vehicle.saleType === "Правительство") return "Правительство";
    if (vehicle.dealer === "south") return "г. Южный";
    if (vehicle.dealer === "arzamas") return "г. Арзамас";
    if (vehicle.dealer === "boats") return "Лодочный";
	if (vehicle.dealer == "batyrevo") return "пгт. Батырево";
    return "н/д";
}

export function getNumericValue(vehicle, field) {
    if (field === 'price') {
        return vehicle.price || Infinity;
    } else if (field === 'maxSpeed') {
        const speed = parseFloat(vehicle.maxSpeed);
        return isNaN(speed) ? -Infinity : speed;
    }
    return 0;
}