var $ = function(sel) {
  return document.querySelector(sel);
};
var $All = function(sel) {
  return document.querySelectorAll(sel);
};
var makeArray = function(likeArray) {
  var array = [];
  for (var i = 0; i < likeArray.length; ++i) {
    array.push(likeArray[i]);
  }
  return array;
};

function update() {
  model.flush();
  //获取全局变量model中的数据
  var data = model.data;
  var activeCount = 0;
  var todoList = $('.todo-list');
  todoList.innerHTML = '';

  //items: [{msg:'', completed: false}]
  data.items.forEach(function(itemValue, index) {
    
    if (itemValue.completed === false ){
      activeCount++;
    } 

    //filters to show
    if (
      data.filter === 'All'
      || (itemValue.completed === true) === (data.filter === "Completed")
    ) {
        var item = document.createElement('li');
        if (itemValue.completed) {
          item.classList.add('completed');
        }

        // list-item-view
        var view = document.createElement("div");
        view.classList.add("view");

        // checkbox
        var toggle = document.createElement("input");
        toggle.type = "checkbox";
        toggle.classList.add("toggle");
        toggle.checked = itemValue.completed;

        // message
        var label = document.createElement("label");
        label.classList.add("todo-label");
        label.innerHTML = itemValue.msg;

        // delete button
        var delbutton = document.createElement("button");
        delbutton.classList.add("des");
        delbutton.innerHTML = "X";

        // top button
        var topbutton = document.createElement("button");
        topbutton.classList.add("top");
        topbutton.innerHTML = "top";

        // append child
        todoList.insertBefore(item, todoList.firstChild);
        item.appendChild(view);
        view.appendChild(toggle);
        view.appendChild(label);
        view.appendChild(delbutton);
        view.appendChild(topbutton);

        var itemToggle = item.querySelector('.toggle');
        itemToggle.checked = itemValue.completed;
        itemToggle.addEventListener('change', function() {
        itemValue.completed = !itemValue.completed;
        update();
        }, false);

        //swipe to delete
        var swiped = null;
        var timer = 0;  //判断触摸时间
        var view = item.querySelector('.view');
        var x,y,X,Y,swipeX,swipeY;

        // add event
        view.addEventListener('touchstart', function(event){
        //pageX / pageY:触摸点相对于页面的位置
        x = event.changedTouches[0].pageX;
        y = event.changedTouches[0].pageY;
        swipeX = true;
        swipeY = true;
        if(swiped){  //当前被左滑的元素 初始null
          swiped.className = "";  //若之前有展开的元素，要收回
        }
        });
        view.addEventListener('touchmove', function(event) {
        X = event.changedTouches[0].pageX; //pageX / pageY:触摸点相对于页面的位置
        Y = event.changedTouches[0].pageY;

        if (swipeX && Math.abs(X - x) - Math.abs(Y - y) > 0) {
          if (X - x > 10) {   //swipeRight
            event.preventDefault();
            this.className = "";
          }
          if (x - X > 10) {   //swipeLeft
            event.preventDefault();
            this.className = "swipeLeft";
            swiped = this;
          }
          swipeY = false;
        }
      });

      //delete
      item.querySelector('.view .des').addEventListener('click', function(){
        data.items.splice(index, 1);
        update();
      });
      //top
      item.querySelector('.view .top').addEventListener('click', function () {
         let tmp = data.items.splice(index, 1);
         data.items.push(tmp[0]);
         update();
         },false);
      //edit
      function edit(){
        var finished = false;
        var edit = document.createElement('input');
        item.appendChild(edit);
        item.classList.add('editing');

        edit.type = "text";
        edit.classList.add("edit");
        edit.value = label.innerHTML;

        function finish() {
          if (finished) return;
          finished = true;
          item.removeChild(edit);
          item.classList.remove('editing');
        }

        edit.addEventListener('blur', function() {
          finish();
        }, false);

        edit.addEventListener('keyup', function(ev) {
          if (ev.keyCode === 27) { // Esc
            finish();
          }
          else if (ev.keyCode === 13) {// Enter
            label.innerHTML = this.value;
            itemValue.msg = this.value;
            update();
          }
        }, false);

        edit.focus();
      }

      //dblclick --edit
      item.querySelector('.todo-label').addEventListener("dblclick",edit,false);
      //longtouch --edit
      function long_touch(){
        //长按0.5s进入
        timer = setTimeout(edit,500);
        return false;
      }

      item.querySelector('.todo-label').addEventListener('touchstart', long_touch);

      //当手指从屏幕上离开的时候触发
      item.querySelector('.todo-label').addEventListener('touchend',function(event){
        clearTimeout(timer);  //clear time
        if(timer!=0){
          //当成点击事件
          itemValue.completed = !itemValue.completed;
          update();
        }
        return false;
      });
      //当手指从屏幕上移动的时候触发
      item.querySelector('.todo-label').addEventListener('touchmove',function(){
        clearTimeout(timer);
        timer = 0;
      });
      todoList.insertBefore(item, todoList.firstChild);
    }
  });

  //show newtodo
  var newTodo = $('.new-todo');
  newTodo.value = data.msg;

  //show lefts
  var completedCount = data.items.length - activeCount;
  var count = $('.todo-count');
  count.innerHTML = (activeCount || 'No') + (activeCount > 1 ? ' items' : ' item') + ' left';

  //show clearbutton
  $('.clear-completed').style.visibility = completedCount > 0 ? 'visible' : 'hidden';

  var toggleAll = $('.toggle-all');
  toggleAll.style.visibility = data.items.length > 0 ? 'visible' : 'hidden';
  toggleAll.checked = data.items.length === completedCount;

  //filters
  var filters = makeArray($All('.filters li a'));
  filters.forEach(function(filter) {
    if (data.filter === filter.innerHTML) {
      filter.classList.add('selected');
    }
    else {
      filter.classList.remove('selected');
    }
  });
}

window.onload = function() {
  //init传入了一个回调函数，先将数据在浏览器中准备好，再执行下面的回调函数
  model.init(function(){
    var data = model.data;
    var newTodo = $('.new-todo');

    newTodo.addEventListener('keyup', function() {
      //将输入到输入框中的编辑信息存到全局变量msg
      data.msg = newTodo.value;
    });
    newTodo.addEventListener('change', function() {
      //将浏览器数据同步到后端
      model.flush();
    });

      //enter的时候存到全局变量items
      newTodo.addEventListener('keyup', function(ev) {
        if (ev.keyCode !== 13) return; // Enter

      if (data.msg === '') {
        console.warn('input msg is empty');
        return;
      }
      data.items.push({msg: data.msg, completed: false});
      data.msg = '';
      update();
    }, false);

    // clear-completed button
    $('.clear-completed').addEventListener('touchstart', function() {

      var new_data = [];
      data.items.forEach(function(itemValue, index) {
        if (!itemValue.completed){
         new_data.push(data.items[index]);
        }
      });
      data.items=new_data;
      update();
    }, false);

    // toggle button
    $('.toggle-all').addEventListener('touchstart', function() {
      var completed = this.checked;
      data.items.forEach(function(itemValue) {
        itemValue.completed = completed;
      });
      update();
    }, false);

    //filters
    var filters = makeArray($All('.filters li a'));
    filters.forEach(function(filter) {
      filter.addEventListener('touchstart', function() {
        data.filter = filter.innerHTML;
        filters.forEach(function(filter) {
          filter.classList.remove('selected');
        });
        filter.classList.add('selected');
        update();
      }, false);
    });
    //前端的数据更新到服务器
    update();
  });
};
