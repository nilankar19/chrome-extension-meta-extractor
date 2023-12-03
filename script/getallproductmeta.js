let productUrl_arr_length_data;
let all_meta_collection_global;
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m'
}
const logArray = []; // Create an array to store log data
document.addEventListener("DOMContentLoaded", function () {
async function fetchHtml(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      return html;
    } catch (error) {
      console.error(`Error fetchUrlHtml: ${error.message}`);
      return '';  
    }
  }
  async function extractUrlsFromHTML(html,querySelector) {
    const uniqueUrls = new Set();
    // const { document } = (new JSDOM(html)).window
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    let anchorTags = doc.querySelectorAll(querySelector);
    anchorTags.forEach((tag) => {
  
      const href = tag.getAttribute('href');
      if (href) {
       
        uniqueUrls.add(href);
      }
  });
  
  return uniqueUrls;
  }
  async function extractMetaFromHTML(html){
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const uniqueUrls = new Set();
    // const { document } = (new JSDOM(html)).window
    const metaProperties = [];
    const metaTags = doc.querySelectorAll('meta');
    metaTags.forEach(metaTag => {
        const name = metaTag.getAttribute('name');
        const property = metaTag.getAttribute('property');
        const content = metaTag.getAttribute('content');
  
        name ? 
        metaProperties.push({ name: name, value: content }) 
        : metaProperties.push({ name: property, value: content });
     
    });
    return metaProperties;
  }
  
  async function collectionCrawler(origin_url,targetClass,noOfpage) {
    let baseUrl = `${origin_url}`;
    let allPageUrl_arr = [];
    let no_of_page = noOfpage ? noOfpage : 1;
    for (let i = 1; i <= no_of_page; i++) {
      const html = await fetchHtml(baseUrl)
      if(html){
        const collections_url = await extractUrlsFromHTML(html,targetClass ? targetClass:'.collection-list a');
        
        if((collections_url.size) < 1){
          console.log("noOfpage crawled:- ",i);
          break;
        }
        
        allPageUrl_arr.push(...collections_url)
      }
    }
    return allPageUrl_arr;
  }
  async function subPageCrawler(origin_url,collection,noOfpage,targetClass) {
    let baseUrl = `${origin_url + collection}`;
    let allPageUrl_arr = [];
    let no_of_page = noOfpage ? noOfpage : 1;
    for (let i = 1; i <= no_of_page;  i++) {
        let pageUrl = `${baseUrl}/?page=${i}`;
        console.log(pageUrl);
        const html = await fetchHtml(pageUrl);
        
        if(html){
          const product_anchorHrefList = await extractUrlsFromHTML(html,(targetClass ? targetClass: '.product-grid a'));
          // console.log(pageUrl);
          if ((product_anchorHrefList.size) < 1) {
            console.log("noOfpage crawled:- ",i,pageUrl);
             break;
          }
          allPageUrl_arr.push(...product_anchorHrefList)
          
        } 
    }
    // console.log("final= ",allPageUrl_arr.toString());
    return allPageUrl_arr
  }
  let table_head = [
    "viewport",
    "format-detection",
    "google-site-verification",
    'title',
    'description',
    'Keywords',
    'author',
    "og:site_name",
    "og:url",
    "og:title",
    "og:type",
    "og:description",
    "og:image",
    "og:image:secure_url",
    "og:image:width",
    "og:image:height",
    "twitter:site",
    "twitter:card",
    "twitter:title",
    "twitter:description",
    "facebook-domain-verification"
  ]
  



// ---------------------Main function---------------------------------
async function getIndividualCollection(origin_url,collection) {
    let path = collection;
    logArray.push({ type: 'info', message: `Calling getIndividualCollection with origin_url: ${origin_url}, collection: ${collection}` });
    
    const productUrl_arr = await subPageCrawler(origin_url, path, 6, ".product-grid a");
    logArray.push({ type: 'info', message: `Received ${productUrl_arr.length} product URLs:`, data: productUrl_arr });
    console.log(productUrl_arr.length);
    
    productUrl_arr_length_data = productUrl_arr.length
    // let {table,tbody,table_head_length} = createTable(table_head);
    // createTableBody(tbody,(productUrl_arr.length),table_head_length)
    // document.body.appendChild(table);
    let all_meta_collection = [];
    await Promise.all(productUrl_arr.map(async (path, index) => {  
      progressMessage.innerText = `Processing product ${index + 1} with path: ${path}`;
      logArray.push({ type: 'info', message: `Processing product ${index + 1} with path: ${path}` });

            let html = await fetchHtml((origin_url + path));
            progressMessage.innerText = `Fetched HTML for product ${index + 1}`;
            logArray.push({ type: 'info', message: `Fetched HTML for product ${index + 1}` });

            let meta = await extractMetaFromHTML(html);
            progressMessage.innerText = `Extracted meta for product ${index + 1}: ${path}`;
            logArray.push({ type: 'info', message: `Extracted meta for product ${index + 1}:`, data: meta }); 
            all_meta_collection.push(meta)
    }));
    progressMessage.innerText ='All meta data collected:';
    logArray.push({ type: 'info', message: 'All meta data collected:'});
    return {all_meta_collection, productUrl_arr_length_data}
    // await renderCellData(table,table_head,meta,(index + 2))
    //         document.body.appendChild(table);
  
  
  }

//-----------------------------------------calling function--------

    const shopifyMetaBtn = document.getElementById("fetchmeta");
    const progressMessage = document.getElementById("progressMessage")
    async function extractTabUrl() {
        return new Promise((resolve) => {
           chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
           const activeTab = tabs[0];
           progressMessage.innerText = 'extracting tab url...';
           const tabUrl = activeTab ? activeTab.url : "";
           resolve(tabUrl);
         });
       });
      }
      

      
      shopifyMetaBtn.addEventListener("click",async function () {
        document.getElementById("createtable").disabled = true;
        const custom_input_url = document.getElementById('collectionurl');
        let inputUrl = custom_input_url.value;

        const urlpath = extractOriginAndPath(inputUrl);

        if(urlpath){
          console.log("origin_url",`extracting tab url completed ,${urlpath.origin},,${urlpath.path}`);
          progressMessage.innerText = `extracting tab url completed ,${urlpath.origin},,${urlpath.path}`;
          logArray.push({type: "info",message: "extracted tabUrl",data: urlpath})
          let {all_meta_collection, productUrl_arr_length} = await getIndividualCollection((urlpath.origin),(urlpath.path ))
         
         all_meta_collection_global = all_meta_collection;
         document.getElementById("createtable").disabled = false;
        }else{
          progressMessage.innerText = 'No Url';
        }

        // let tabUrl = await extractTabUrl();

        // let origin_url = new URL(`${tabUrl}`);
         
      })
})
// --------------------
// let {table,tbody,table_head_length} = createTable(table_head);
export default async function createTable(table_head) {
  var tables = document.getElementsByTagName('table');
  var tableToRemove = tables[0];
  if (tableToRemove) {
    tableToRemove.parentNode.removeChild(tableToRemove);
}
  if(table_head){

    let table = document.createElement('table');
    var theader = table.createTHead();
    let tbody = document.createElement("tbody");
    table.appendChild(theader);
    table.appendChild(tbody);
    table.classList.add("meta-table")
    const headerRow = theader.insertRow();

    //create default thead with data
    for(let i=0;i<table_head.length;i++){
        const nameHeader = headerRow.insertCell(i);
        nameHeader.textContent = table_head[i];
      }
      document.body.appendChild(table);
      // callback(table,tbody,(table_head.length))
    let table_head_length = table_head.length;



    if((productUrl_arr_length_data >= 1) && (all_meta_collection_global.length >= 1)){
      // create table head with data
      createTableBody(tbody,productUrl_arr_length_data,table_head_length);
      all_meta_collection_global.forEach(async (meta,index) => {
        await renderCellData(table,table_head,meta,(index + 2)).then(()=>{
          document.body.appendChild(table);
          console.log("meta-row added in table");
        })
        
      });
    }else{
      console.log("%call_meta_collection_global error",'color: red');
    }
    
  }{
    
  }
   return {table,tbody,table_head_length}
}
export  function extractOriginAndPath(url) {
  try {
    const parsedUrl = new URL(url);

    // Extract origin and path
    const origin = parsedUrl.origin;
    const path = parsedUrl.pathname;

    return { origin, path };
  } catch (error) {
    // Handle invalid URL
    console.error('Invalid URL:', error.message);
    return null;
  }
}
async function createTableBody(tbody,noOfRow,noOfCOl) {
  for (var i = -1; i <= noOfRow; i++) {
      // Insert a new row into the tbody
      var newRow = tbody.insertRow();

      // Loop to create cells in each row
      for (var j = 0; j < noOfCOl; j++) {
          // Insert a cell into the new row
          var newCell = newRow.insertCell();
          
          // Set the content of the cell based on the current value of i
          var cellContent = " ";
          newCell.textContent = cellContent;
      }
  }

}
async function renderCellData(table,table_head,metaProperties,rowIndexToUpdate) {
  const tableHeadSet = new Set(table_head);
  // var rowIndexToUpdate = 1;
  metaProperties.forEach((metaProperty, index) => {

    if (tableHeadSet.has(metaProperty.name)) {
      const tableHeadIndex = table_head.findIndex(name => name === metaProperty.name);
      console.log("tableheadindex", tableHeadIndex,"rowIndexToUpdate",rowIndexToUpdate,metaProperty.value);

      table.rows[rowIndexToUpdate].cells[tableHeadIndex].textContent = metaProperty.value;
    }
  });
}