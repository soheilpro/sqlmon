function padLeft(nr, n, str){
  return Array(n - String(nr).length + 1).join(str || ' ') + nr;
}

module.exports = {
  padLeft,
};
