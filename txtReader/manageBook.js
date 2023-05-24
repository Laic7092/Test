import library from "./indexDb.js";
//console.log(library)

let bookEle = document.querySelector('#book');
let rules = "text/plain";
let currentBookName = '';
bookEle.addEventListener('change',handleBookChange);
// document.oncontextmenu = function () {
//   console.log('gg');
//   return false;
// }

let books = new Map();
library.openOrCreatIDB().then((db) => {
  console.log('gg',db);
  library.readAll().then((res) => {
    console.log("hh",res)
  })
})
function renderBookshelf(allBooks) {
  allBooks.forEach(element => {
    books.set(element.id,element.bookData)
  })
  //console.log('确实是回调函数',allBooks,books);
  let ul = document.createElement('ul');
  ul.addEventListener('click',e => {
    // console.log(e);
    let id = e.target.id;//需要注意的一点就是,从这里拿到的id已经是string了
    //console.log(id,books.get(id))
    let bookData = books.get(id);
    let {chapterArr,paraArr} = bookData;
    if(Array.isArray(chapterArr) && chapterArr.length > 0){
      renderCatelog(chapterArr);
      renderContentByChapters(chapterArr,paraArr)
    }
    else{
      renderContentByLines(paraArr)
    }
  })
  let fragment = document.createDocumentFragment();
  allBooks.forEach(element => {
    let li = document.createElement('li');
    li.innerText = element.bookData.bookName;
    li.setAttribute('id',element.id);
    fragment.appendChild(li);
  })
  ul.appendChild(fragment);
  let bookshelf = document.body.querySelector('#bookshelf');
  bookshelf.appendChild(ul)
}

function handleBookChange(event) {
  //console.log(event.cancelable)//false
  let bookEle = event.target;
  //console.log(event);
  console.log(bookEle.files);
  if(bookEle.files.length <= 0)
    return;
  let addedBook = bookEle.files[0];
  currentBookName = addedBook.name;
  if(validBookType(bookEle.accept,addedBook.type)){
    getAddedBook(addedBook);
  }
}

function validBookType(rules = rules,type) {
  if(typeof rules === "string")
    return rules.indexOf(type) !== -1;
}

function getAddedBook(addedBook,encode) {
  let fileReader = new FileReader();
  fileReader.onload = function (event) {
    let result = event.target.result;
    //console.log(result)
    if(typeof result !== "string")
      return;
    if(result.indexOf("�") === -1){
      divideTxtContent(result);
    }
    else{
      getAddedBook(addedBook,'gb2312');
    }
  };
  //fileReader.readAsArrayBuffer(addedBook)
  //fileReader.readAsBinaryString(addedBook)
  //fileReader.readAsDataURL(addedBook)
  fileReader.readAsText(addedBook,encode);
}

function divideTxtContent(txtContent) {
  if(typeof txtContent !== "string")
    return;
  let paraArr = txtContent.split('\n');
  paraArr = paraArr.filter(element => {
    return element !== "" && element !== '\r'
  })
  let chapterArr = []
  if(paraArr.length>0){
    //renderContentByLines(paraArr);
    chapterArr = divideByChapter(paraArr);
    addToLibrary({chapterArr,paraArr,bookName:currentBookName})
  }
  //console.log(paraArr)
}

function divideByChapter(paraArr) {
  const patt = /第.{1,6}章/;
  //debugger
  let chapterArr = [];
  let inChapter = false;
  let startLine = 0,endLine = 0;
  paraArr.forEach((element,idx) => {
    let match = patt.exec(element)
    if(match && !inChapter){
      inChapter = true;
      startLine = idx;
      chapterArr.push({chapterName:element,startLine,endLine,match});
    }
    else if(match){
      inChapter = false;
      endLine = idx;
      chapterArr[chapterArr.length-1].endLine = endLine;
    }
    // else{
    //   console.log('gg');
    // }
      //console.log(element);
  });
  //console.log(chapterArr)
  return chapterArr
}

function renderContentByLines(paraArr) {
  //debugger
  let fragment = document.createDocumentFragment()
  // if(paraArr.length>100){
    for (let index = 0; index < paraArr.length; index++) {
      const element = paraArr[index];
      let p = document.createElement('p');
      p.innerText = element;
      fragment.appendChild(p)
    }
  // }

  let main = document.querySelector('#main')
  main.appendChild(fragment)
}

function renderContentByChapters(chapterArr,paraArr) {
  //console.log(chapterArr,paraArr);
  let fragment = document.createDocumentFragment()
  chapterArr.forEach((element,idx) => {
    let {startLine,endLine,chapterName,match} = element
    let h2 = document.createElement('h2');
    //h2.setAttribute('class',"chapterHead");
    h2.setAttribute('id',`${match[0]}`)
    h2.innerText = chapterName;
    fragment.appendChild(h2);
    for (let index = startLine+1; index < endLine; index++) {
      const element = paraArr[index];
      let p = document.createElement('p');
      p.innerText = element;
      fragment.appendChild(p)
    }
  })
  let main = document.querySelector('#main')
  main.appendChild(fragment)
}

function renderCatelog(chapterArr) {
 let ul =  document.createElement('ul');
 chapterArr.forEach((element,idx) => {
  let li = document.createElement('li');
  let a = document.createElement('a');
  a.setAttribute('href',`#${element.match[0]}`);
  a.setAttribute('class',"catelogEle")
  a.innerText = element.chapterName;
  li.appendChild(a)
  ul.appendChild(li)
 })
 let main = document.querySelector('#main');
 document.body.insertBefore(ul,main);
}

function addToLibrary(bookData) {
  library.add(bookData)
}