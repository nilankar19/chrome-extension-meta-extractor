import createTable from '../script/getallproductmeta.js'
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
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("createtable").disabled = true;
const metadataList = document.getElementById('metasettingList');

let truth_value_metasettings = []
let user_truth_value = [];
chrome.storage.sync.get(['key'], function(result) {
  // 'key' is the key you used to store the data
  if (result.key) {
    // Do something with the retrieved data
    user_truth_value = result.key
    // alert('exist');
    // console.log('Retrieved data:',user_truth_value);
    renderMetaSettings(user_truth_value)
  } else {
     for (let i = 0; i < table_head.length; i++) {user_truth_value.push(1);}
   
    // console.log('No data found.');
    // alert('key not exist');
    
    // Set default value in sync storage
    chrome.storage.sync.set({ key: user_truth_value }).then(() => {
      // console.log("Value is set", user_truth_value);
    });
    renderMetaSettings(user_truth_value)
  }
});

 function filter_Truth_tHead(truth_arr,table_head) {
  const filteredData = [];
    for (let i = 0; i < truth_arr.length; i++) {
        if (truth_arr[i] === 1) {
            filteredData.push(table_head[i]);
        }
    }
    return filteredData;
 }
 function renderMetaSettings(user_truth_value) {
  table_head.forEach((element,index) => {
    const listItem = document.createElement('li');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');

    checkbox.type = 'checkbox';
    checkbox.name = element;
    checkbox.id = element;
    checkbox.checked = user_truth_value[index]
    checkbox.addEventListener("change",function(){
        if (this.checked) {
            user_truth_value[index] = 1;
            chrome.storage.sync.remove("key", function() {
              console.log('Key "key" is removed from sync storage.');
              
            });
            chrome.storage.sync.set({ key: user_truth_value }).then(() => {
                console.log("Value is set",user_truth_value);
                let table_head_final = filter_Truth_tHead(user_truth_value,table_head)
                createTable(table_head_final)
              });
        } else {
          chrome.storage.sync.remove("key", function() {
            console.log('Key "key" is removed from sync storage.');
          });
            user_truth_value[index] = 0;
            chrome.storage.sync.set({ key: user_truth_value }).then(() => {
                console.log("Value is set",user_truth_value);
                let table_head_final = filter_Truth_tHead(user_truth_value,table_head)
                createTable(table_head_final)
              });
        }
    })
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${element}`));
    listItem.appendChild(label);

    metadataList.appendChild(listItem);
});
}


// Add storage change event listener outside the if-else block
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
  }
  // let [key, { oldValue, newValue }] = Object.entries(changes)[0];
  // console.log(key,oldValue,newValue);
});

document.getElementById("createtable").addEventListener("click",function(){
  let table_head_final = filter_Truth_tHead(user_truth_value,table_head)
  createTable(table_head_final);
  document.getElementById("exportxlxs").addEventListener("click",function () {
    createWorksheet()
  })
})

const url_input = document.getElementById("collectionurl");

url_input.addEventListener("",function (params) {
  
})

});
async function createWorksheet(rows) {
  //     const worksheet = XLSX.utils.json_to_sheet(rows);
  //     const workbook = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet2",true );
  // XLSX.writeFile(workbook, "Presidents.xlsx", { compression: true });
  var tbl = document.getElementById('sheetjs');
  var wb = XLSX.utils.table_to_book(tbl);
  XLSX.writeFile(wb, "SheetJSTable.xlsx");
  }