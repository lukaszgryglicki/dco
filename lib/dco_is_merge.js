module.exports = commits => {
  len = commits.length;
  parents = [];
  singles = [];
  for (var i=0;i<len;i++) {
    lenParents = commits[i].parents.length;
    shas = [];
    for (var j=0;j<lenParents;j++) {
      shas.push(commits[i].parents[j].sha);
    }
    parents.push(shas);
    if (lenParents == 1) {
      singles.push(commits[i].sha);
    }
  }
  hasMultiple = singles.length < len;
  if (!hasMultiple) return false;
  lenSingles = singles.length;
  lenParents = parents.length;
  for (var i=0;i<lenSingles;i++) {
    single = singles[i];
    found = false;
    for (var j=0;j<lenParents;j++) {
      if (parents[j].indexOf(singles[i]) >= 0) {
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }
  }
  return true;
};
