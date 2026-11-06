/** Run setup() once as the owner before deploying. No credentials belong here. */
function setup() {
 const props=PropertiesService.getScriptProperties();
 let id=props.getProperty('SHEET_ID');
 if(!id){id=SpreadsheetApp.create('ZOCS Lifestyle Pre-orders').getId();props.setProperty('SHEET_ID',id);}
 const book=SpreadsheetApp.openById(id);
 let sheet=book.getSheetByName('Orders');if(!sheet)sheet=book.insertSheet('Orders');
 if(!sheet.getLastRow())sheet.appendRow(['Timestamp','Customer Name','Phone Number','Delivery Address','Selected Products','Order Status']);
 sheet.setFrozenRows(1);
 console.log(book.getUrl());return book.getUrl();
}
function validate_(p){
 const name=String(p.name||'').trim(),address=String(p.address||'').trim();
 const phone=String(p.phone||'').replace(/[০-৯]/g,function(c){return '০১২৩৪৫৬৭৮৯'.indexOf(c);}).replace(/[\s-]/g,'').replace(/^(?:\+88|88)/,'');
 let products;try{products=JSON.parse(p.products);}catch(e){throw Error('INVALID_PRODUCTS');}
 if(p.website)throw Error('SPAM');
 if(name.length<2||name.length>100||address.length<10||address.length>500||!/^01[3-9]\d{8}$/.test(phone))throw Error('INVALID_FIELDS');
 if(!Array.isArray(products)||products.length<1||products.length>2||products.some(function(x){return ['ZOCS Micro','ZOCS Nano'].indexOf(x)<0;})||new Set(products).size!==products.length)throw Error('INVALID_PRODUCTS');
 const id=String(p.submissionId||'');if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id))throw Error('INVALID_ID');
 return {name:name,address:address,phone:phone,products:products,id:id};
}
function safe_(s){return /^[=+\-@\t\r\n]/.test(s)?"'"+s:s;}
function doPost(e){
 let lock;let result={ok:false};
 try{
  if(!e||!e.postData||e.postData.contents.length>12000)throw Error('INVALID_REQUEST');
  const v=validate_(e.parameter);result.submissionId=v.id;
  lock=LockService.getScriptLock();lock.waitLock(20000);
  const id=PropertiesService.getScriptProperties().getProperty('SHEET_ID');if(!id)throw Error('NOT_CONFIGURED');
  const book=SpreadsheetApp.openById(id),sheet=book.getSheetByName('Orders');
  // The UUID is stored as a note on column A of the order itself: one durable write.
  // No separate dedup write can fail after appending an order.
  const count=sheet.getLastRow();
  const notes=count>1?sheet.getRange(2,1,count-1,1).getNotes():[];
  const existing=notes.some(function(row){return row[0]===v.id;});
  if(!existing){
   const row=sheet.getLastRow()+1;
   // Sheets API batchUpdate writes the values and the dedup note atomically.
   const values=[new Date().toISOString(),safe_(v.name),v.phone,safe_(v.address),v.products.join(', '),'Pending'];
   const cells=values.map(function(value,i){const cell={userEnteredValue:{stringValue:value}};if(i===0)cell.note=v.id;return cell;});
   Sheets.Spreadsheets.batchUpdate({requests:[{updateCells:{range:{sheetId:sheet.getSheetId(),startRowIndex:row-1,endRowIndex:row,startColumnIndex:0,endColumnIndex:6},rows:[{values:cells}],fields:'userEnteredValue,note'}}]},id);
  }
  result.ok=true;
 }catch(err){result.error='ORDER_NOT_SAVED';console.error(String(err));}
 finally{if(lock&&lock.hasLock())lock.releaseLock();}
 return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
