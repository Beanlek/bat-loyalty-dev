let Password = {};

Password.score = function(pass) {
  var score = 0;
  
  if (!pass) return score;
  if(pass.length >= 8) score++;
  
  var complexities = {
    digits: /\d/.test(pass),
    lower: /[a-z]/.test(pass),
    upper: /[A-Z]/.test(pass),
    nonWords: /\W/.test(pass),
  }

  for (var check in complexities) {
    score += (complexities[check] == true) ? 1 : 0;
  }

  return parseInt(score);
}

module.exports = Password;