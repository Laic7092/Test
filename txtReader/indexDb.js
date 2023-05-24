const databaseName = 'library';
let db;
function openOrCreatIDB() {
  return new Promise((resolve,reject) => {
    const request = window.indexedDB.open(databaseName);
    request.onerror = function (event) {
      console.log('数据库打开报错');
      reject();
    };
    request.onsuccess = function (event) {
      db = request.result;
      //通过request对象的result属性拿到数据库对象。
      console.log('数据库打开成功');
      resolve(db);
    };
    request.onupgradeneeded = function (event) {
      //新建数据库也会触发,因为版本从无到有,而且是先触发升级版本,再触发打开成功
      console.log("升级咯")
      //如果要修改数据库结构（新增或删除表、索引或者主键），只能通过升级数据库版本完成。
      db = event.target.result;
      //这时通过事件对象的target.result属性，拿到数据库实例。
      let objectStore;
      if (!db.objectStoreNames.contains('books')) {
        objectStore = db.createObjectStore('books', { keyPath: 'id' });
        //主键也可以指定为下一层对象的属性{id:1,foo:{bar:1}} foo.bar
        // let objectStore = db.createObjectStore(
        //   'books',
        //   { autoIncrement: true }
        // );自动生成主键,递增数

        // objectStore.createIndex('name', 'name', { unique: false });
        // objectStore.createIndex('email', 'email', { unique: true });
        //三个参数分别为索引名称、索引所在的属性、配置对象（说明该属性是否包含重复的值）
      }
    }
  })

}


function add(bookData) {
  let id = getRandomBookId()
  let request = db.transaction(['books'], 'readwrite')//新建事务,指定表名,以及操作readonly/readwrite
    .objectStore('books')//上面的操作会创建一个IDBtransaction对象,通过这个对象的objectstore方法拿到IDBObjectstore对象
    .add({id,bookData});//最后通过表格对象的(add)方法,写入记录

  request.onsuccess = function (event) {
    console.log('数据写入成功');
  };

  request.onerror = function (event) {
    console.log('数据写入失败');
  }
}

function read(id) {
  let transaction = db.transaction(['books']);
  let objectStore = transaction.objectStore('books');
  let request = objectStore.get(id);//参数是主键的值

  request.onerror = function(event) {
    console.log('事务失败');
  };

  request.onsuccess = function( event) {
     if (request.result) {
       console.log('bookData' + request.result.bookData)
     } else {
       console.log('未获得数据记录');
     }
  };
}

function readAll() {
  let objectStore = db.transaction('books').objectStore('books');
  let allBooks =  [];
  return new Promise((resolve,reject) => {
    const openCursor = objectStore.openCursor();
    openCursor.onsuccess = function (event) {//新建指针对象的openCursor()方法是一个异步操作
      let cursor = event.target.result;
      if (cursor) {
      //console.log(cursor);
      //  console.log('Id: ' + cursor.key);
      //  console.log('bookData',cursor.value.bookData)
        allBooks.push(cursor.value)
        cursor.continue();
      } else {
        console.log('没有更多数据了！');
        resolve(allBooks)
      }
    };
    openCursor.onerror = function(event) {
      console.log('迭代失败');
      reject()
    };
  })

}

function update(id,bookData) {
  let request = db.transaction(['books'], 'readwrite')
    .objectStore('books')
    .put({id,bookData});
    //put()方法自动更新了主键为1的记录

  request.onsuccess = function (event) {
    console.log('数据更新成功');
  };

  request.onerror = function (event) {
    console.log('数据更新失败');
  }
}

function remove(id) {
  let request = db.transaction(['books'], 'readwrite')
    .objectStore('books')
    .delete(id);//同样是传入主键

  request.onsuccess = function (event) {
    console.log('数据删除成功');
  };
}

function getRandomBookId(){
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  //console.log(array[0]);
  return array[0] + '' //因为是随机数字,所以直接换成string,避免后续不方便
}

//存?主键:随机生成?存

export default {add,read,remove,update,readAll,openOrCreatIDB}
