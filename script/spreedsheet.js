function convertMetaToJson(meta) {

   let meta_json_arr = [];
    for (let metadataArray of meta){
        const resultObject = {};
        for (const item of metadataArray) {
        if (item.name !== null || item.value !== null) {
            resultObject[item.name] = item.value;
        }
        }
        meta_json_arr.push(resultObject)
    }

    console.log("meta_json_arr",meta_json_arr);
    createWorksheet(meta_json_arr)

    return meta_json_arr;
}

async function createWorksheet(rows) {
//     const worksheet = XLSX.utils.json_to_sheet(rows);
//     const workbook = XLSX.utils.book_new();
// XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet2",true );
// XLSX.writeFile(workbook, "Presidents.xlsx", { compression: true });
var tbl = document.getElementById('sheetjs');
var wb = XLSX.utils.table_to_book(tbl);
XLSX.writeFile(wb, "SheetJSTable.xlsx");
}