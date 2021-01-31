var setBackImage = function(event){
  var img = new Image();
  img.src = URL.createObjectURL(event.target.files[0]);
  var canvas = document.getElementById("canvas_board");
  var ctx = canvas.getContext('2d');
  img.onload= function(){
    var hRatio = canvas.width/img.width;
    var vRatio = canvas.height/img.height;
    var ratio  = Math.min(hRatio, vRatio);
    ctx.drawImage(img, 0,0, img.width, img.height, 0,0,img.width*hRatio, img.height*vRatio);
  }
};

function runner(){
  var shape = 1;
  var canvas = document.getElementById("canvas_board");
  var ctx = canvas.getContext('2d');
  
  var history = {
    redo_list: [],
    undo_list: [],
    saveState: function(canvas, list, keep_redo) {
      keep_redo = keep_redo || false;
      if(!keep_redo) {
        this.redo_list = [];
      }
      
      (list || this.undo_list).push(canvas.toDataURL());   
    },
    undo: function(canvas, ctx) {
      this.restoreState(canvas, ctx, this.undo_list, this.redo_list);
    },
    redo: function(canvas, ctx) {
      this.restoreState(canvas, ctx, this.redo_list, this.undo_list);
    },
    restoreState: function(canvas, ctx,  pop, push) {
      if(pop.length) {
        this.saveState(canvas, push, true);
        var restore_state = pop.pop();
        let img = document.createElement('img');
        img.src = restore_state;
        img.onload = function() {
          ctx.clearRect(0, 0, 1500, 700);
          ctx.drawImage(img, 0, 0, 1500, 700, 0, 0, 1500, 700);  
        }
      }
    }
  }
  
  var pencil = {
    options: {
      stroke_color: ['00', '00', '00'],
      dim: 4
    },
    init: function(canvas, ctx) {
      this.canvas = canvas;
      this.canvas_coords = this.canvas.getBoundingClientRect();
      this.ctx = ctx;
      this.ctx.strokeColor = this.options.stroke_color;
      this.ctx.lineWidth = 4;
      this.drawing = false;
      this.addCanvasEvents();
    },
    addCanvasEvents: function() {
      this.canvas.addEventListener('mousedown', this.start.bind(this));
      this.canvas.addEventListener('mousemove', this.stroke.bind(this));
      this.canvas.addEventListener('mouseup', this.stop.bind(this));
      this.canvas.addEventListener('mouseout', this.stop.bind(this));
    },
    start: function(evt) {
      var x = evt.clientX - this.canvas_coords.left;
      var y = evt.clientY - this.canvas_coords.top;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      history.saveState(this.canvas);
      this.drawing = true;
    },
    stroke: function(evt) {
      if(this.drawing) {
        var x = evt.clientX - this.canvas_coords.left;
        var y = evt.clientY - this.canvas_coords.top;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
      }
    },
    stop: function(evt) {
      if(this.drawing) this.drawing = false;
    }
  };
  
  document.getElementById('Line').addEventListener('click', function() {
    shape = 1; 
    pencil.init(canvas, ctx);
  });
  
  document.getElementById('Undo').addEventListener('click', function() {
    history.undo(canvas, ctx);
  });
  
  document.getElementById('Redo').addEventListener('click', function() {
    history.redo(canvas, ctx);
  });
  
  document.getElementById("Clear").addEventListener("click",function(){
    ctx.clearRect(0, 0, 1500, 700);
  })

  document.getElementById("Rectangle").addEventListener("click",function(){
    shape = 2;
  })

  document.getElementById("Ellipse").addEventListener("click",function(){
    shape = 3;
  })

  document.getElementById("red").addEventListener('click',function(){
    ctx.strokeStyle = "#FF0000";
  });
  
  document.getElementById("blue").addEventListener('click',function(){
    ctx.strokeStyle = "#0000FF";
  });
  
  document.getElementById("green").addEventListener('click',function(){
    ctx.strokeStyle = "#00FF00";  
  });
  
  document.getElementById("black").addEventListener('click',function(){
    ctx.strokeStyle = "#000000";  
  });
  
  document.getElementById("white").addEventListener('click',function(){
    ctx.strokeStyle = "#FFFFFF";  
  });
  
  document.getElementById("purple").addEventListener('click',function(){
    ctx.strokeStyle = "#4169E1";  
  });
  
  document.getElementById("size_1").addEventListener('click',function(){
    ctx.lineWidth = 2;
  });
  
  document.getElementById("size_2").addEventListener('click',function(){
    ctx.lineWidth = 3;
  });
  
  document.getElementById("size_3").addEventListener('click',function(){
    ctx.lineWidth = 4;
  });

  document.getElementById("size_4").addEventListener('click',function(){
    ctx.lineWidth = 5;
  });

  document.getElementById("size_5").addEventListener('click',function(){
    ctx.lineWidth = 6;
  });

  document.getElementById("size_6").addEventListener('click',function(){
    ctx.lineWidth = 7;
  });

}

runner()