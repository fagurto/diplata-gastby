var Crawler = require("simplecrawler");
const cheerio = require("cheerio");
const Router = require("routes");
const router = Router();
const scrapeIt = require("scrape-it");
const fs = require("fs");
const TextDecoder = require("util").TextDecoder;
let writeStream = fs.createWriteStream(
  "C:/Users/fagurto/Documents/diplata/diplata-gastby/dataset.json"
);
var noop = function() {};
const blackListed = [
  "index.php",
  "inicio.php",
  "quienes_somos.php",
  "catalogo.php",
  "como_ser_cliente.php",
  "club_de_puntos.php",
  "sucursales.php",
  "medidas_y_cuidados.php",
  "contacto.php"
];
router.addRoute(
  "/catalogo/joyas-de-plata-925-37/:category/:name.:format",
  noop
);
const isFile = (() => {
  const FILE_REGEX = /\.(css|js|jpg|jpeg|pdf|xml|csv|xls|xlsx|txt|doc|docx|ppt|pptx|png|rar|zip|tar|mp3|wav|epub)$/i;
  return url => FILE_REGEX.test(url);
})();

let dataResults = [];

var crawler = Crawler("https://www.diplata.cl/").on("fetchcomplete", function(
  queueItem,
  responseBuffer,
  response
) {
	
	
  const match = router.match(queueItem.path);
  if (match) {
    if (
      !blackListed.some(u => {
        return queueItem.url.indexOf(u) !== -1;
      })
    ) {
      const { params:{ category , name } } = match;
	  
      let data = {
        url: queueItem.url,
        ...scrapeIt.scrapeHTML(responseBuffer.toString("latin1"), {
          title: "#product #page-title.text-center span",
          imgUrl: { selector: "#idx_mainimg", attr: "src" },
          prices: {
            selector: ".detail-price span",
            convert: text => {
              const results = text.split("\n");

              return results.length == 2
                ? {
                    wholeSale: parseInt(results[0]
                      .trim()
                      .replace("$ ", "")
                      .replace(".", "")),
                    retail:parseInt(results[1]
                      .trim()
                      .replace("$ ", "")
                      .replace(".", ""))
                  }
                : {};
            }
          },
		  attrs:{
			  listItem:'#product-info-left ul.list-unstyled li',
			  data:{
				  name:'label',
				  value:'span'
			  }
		  },
          sizes: {
            listItem: "select > option",
            data: {
              value: {
                attr: "value"
              },
              code: {
                how: "text"
              }
            }
          }
        })
      };

      if (data.title) {
      const aggregate =  {
			category,
          ...data,
		  title:data.title.split('-')[0].trim(),
          code: data.title
            .split("-")
            .pop()
            .trim()
			
        };
		
		 dataResults.push(aggregate)
      }
    }

    
  }
});
crawler.respectRobotsTxt = false;

crawler.addFetchCondition(function(queueItem, referrerQueueItem, callback) {
  callback(null, !isFile(queueItem.path));
});

crawler.interval = 0;
crawler.maxConcurrency = 10;
crawler.discoverRegex = [];

crawler.discoverResources = function(buffer, queueItem) {
  var $ = cheerio.load(buffer.toString("utf8"));

  const links = $("a[href]")
    .map(function() {
      return $(this).attr("href");
    })
    .get();

  const buttons = $(
    "#col-main > :first-child ul+ul.list-inline.text-left.hidden-xs input:not(:nth-child(1)):not(:last-child)"
  )
    .map(function() {
      return new RegExp(/href='([^']+)/g)
        .exec($(this).attr("onclick"))[1]
        .replace(/&amp;/g, "&");
    })
    .get()
    .map(function(path) {
      return new URL(path, "https://www.diplata.cl/").href;
    });

  return links.concat(buttons);
};

crawler.on("complete", function() {
	let dataOutResults={};
	
	for(const obj of dataResults){
		
		const { category } = obj;
		(dataOutResults[category]=dataOutResults[category]||[]).push(obj);
		
		
	}
      writeStream.write(JSON.stringify(dataOutResults,undefined, 2));
	  writeStream.end();
});
crawler.start();
