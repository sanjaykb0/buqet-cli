//modified.log

var fs = require("fs");

fs.readFile("deleted.log", "utf8", function (err, data) {
  if (err) throw err;
  var inString = data;
  //console.log(inString);
  var array = inString.split("\n");

  //console.log(array);
  for (let i = 0; i < array.length; i++) {
    if (array[i].includes("st...")) {
      changed = array[i];
      final = changed.replace(">fcst...... ", "");
      //console.log(changed);
      console.log(final);
    }
  }
});

