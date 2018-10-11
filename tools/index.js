const LineByLineReader = require("line-by-line");
const jsonfile = require("jsonfile");
const lineReader = new LineByLineReader("../data/diplata-products.jsonlp");
const makeDir = require("make-dir");
const del = require("del");


del(["../data/dataset/**/*.json"], { force: true }).then(paths => {
   lineReader.on("line", line => {

      const jsonObject = JSON.parse(line);

      const { category, hash } = jsonObject;

      const dir = "../data/dataset/" + category + "/";

      makeDir(dir).then(path => {
      
         const fileName = path + "/" + hash + ".json";
         jsonfile.writeFile(fileName, jsonObject, function(err) {
            if (err) console.error(err);
         });
      });
   });
});


