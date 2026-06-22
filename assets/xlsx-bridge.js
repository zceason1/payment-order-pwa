(function () {
  var candidates = [
    window.XLSX,
    typeof XLSX !== 'undefined' ? XLSX : null,
    typeof exports !== 'undefined' ? exports : null,
    typeof module !== 'undefined' && module && module.exports ? module.exports : null,
    window.exports,
    window.module && window.module.exports,
    window.globalThis && window.globalThis.XLSX,
    window.self && window.self.XLSX
  ];

  for (var i = 0; i < candidates.length; i += 1) {
    if (candidates[i] && candidates[i].utils && candidates[i].write) {
      window.XLSX = candidates[i];
      return;
    }
  }
}());
