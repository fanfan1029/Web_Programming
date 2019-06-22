### *Web Programming-Final Project*

*To-Do List*

*1552756* 曾凡沥

1.功能

1.1 基本功能

1.1.1 包含新增、删除、展现列表、全部完成/取消、删除已完成

1.1.2 保存页面状态，刷新页面后可恢复

1.2 高级功能

1.2.1 在手机上长按，可编辑单条todo
1.2.2 左滑单条todo，出现删除按钮
1.2.3 左滑单条to-do，出现置顶按钮

2.长按编辑

首先只有当长按0.5s后，执行setTimeout函数，则将label移除，新建一个输入框加进去。若时间不足0.5s停止触摸，就当做点击事件。或在触摸过程中touchmove移动了，不会进入编辑过程。在
对输入框的编辑过程中，如果光标blur，则不会存储; 编辑完成后，将前端数据
存储。

```javascript
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

```

3.滑动删除,置顶

首先设置一个item的宽度超过他父级元素的宽度（140%），超出的部分就是放置两个按钮的区域。在为其父级元素添加属性overflow=hidden，则在正常情况下按钮区域是不可见的，只能显示左侧的label的部分。

然后我们监听左侧的label的部分，监听滑动事件。当我们监听到左滑事件时，添加属性，把元素沿着横向(x轴)移动自身宽度的30%，让按钮显示出来，同时左侧label超出的部分会被遮挡。当我们监听到右滑事件时，移除属性，还原。

监听滑动事件：首先记录最初触点相对页面的位置，即其x,y坐标，然后记录触点最后相对页面的位置；通过差值判断左滑还是右滑；左滑展开，记录变量swiped为ture,右滑收回，记录变量swiped为false，滑动之前判断swiped值，判断是否需要收回。

```javascript
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
```

```css
.swipeLeft{
    transform:translateX(-30%);/*把元素沿着横向(x轴)移动自身宽度的30%*/
    -webkit-transform:translateX(-30%);
}
```

```javascript
//delete
item.querySelector('.view .des').addEventListener('click', function(){
  data.items.splice(index, 1);
  update();
});
//top
item.querySelector('.view .top').addEventListener('click', function () {
   let tmp = data.items.splice(index, 1);//删除并返回
   data.items.push(tmp[0]);//将刚刚删除的放到最上面
   update();
   },false)；
```