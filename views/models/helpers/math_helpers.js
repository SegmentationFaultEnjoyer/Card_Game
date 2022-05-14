function get_defl_coords(x1, y1, x2, y2, n) {
    return {
        x: x2 - n * (x2 - x1) / (y2 - y1),
        y: y2 - n
    };
}

export {
    get_defl_coords
};