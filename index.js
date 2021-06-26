var bool_select = false;
var bool_draw = false;
var bool_cursor_select = false;
var cursor_pts = [];
var colour_select = 0;
var mask_select = [];

var img_address = "http://128.2.204.42:8000/"
var req_address = "http://128.2.204.42:5050/"

var slider_slic = document.getElementById("slic_range");
var output_slic = document.getElementById("slic_val");
output_slic.innerHTML = slider_slic.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider_slic.oninput = function() {
  output_slic.innerHTML = this.value;
}

var slider_felzen = document.getElementById("felzen_range");
var output_felzen = document.getElementById("felzen_val");
output_felzen.innerHTML = slider_felzen.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider_felzen.oninput = function() {
  output_felzen.innerHTML = this.value;
}

var slider_prior = document.getElementById("prior_range");
var output_prior = document.getElementById("prior_val");
output_prior.innerHTML = slider_prior.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider_prior.oninput = function() {
  output_prior.innerHTML = this.value;
}


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


async function segment(segtype){
  var canvas_1 = document.getElementById("canvas_board");
  var ctx_1 = canvas_1.getContext('2d');
  var img_data = canvas_1.toDataURL(); //has some stuff in the starting the root of all problem
  var url = req_address+segtype
  const formData = new FormData()
  formData.append('data', img_data)
  if(segtype=="slic"){
    formData.append('val',slider_slic.value);
  }else{
    formData.append('val',slider_felzen.value);
  }
  fetch(url, {
    method: 'POST',
    body: formData
  }).then((response) => {
    // var img = new Image();
    var img = document.getElementById("output_img");
    img.src = img_address + "segment.jpg?" + new Date().getTime();;
    var back_img = document.getElementById("back");
    back_img.src = img_address + "masks/back.png?" + new Date().getTime();;
    img.onload= function(){
      // var hRatio = canvas_1.width/img.width;
      // var vRatio = canvas_1.height/img.height;
      // var ratio  = Math.min(hRatio, vRatio);
      // ctx_1.clearRect(0,0,1500,700);
      // ctx_1.drawImage(img, 0,0, img.width, img.height, 0,0,img.width*hRatio, img.height*vRatio);
      img.style.display = "block";
      console.log("Segmented");
    }
    back_img.onload = function(){
      back_img.style.display = "block";
    }
  })
}

function set_selector(evt){
  var image = document.getElementById("output_img");
  image.addEventListener("mousemove",selector);
}

function remove_selector(evt){
  var image = document.getElementById("output_img");
  image.removeEventListener("mousemove",selector);
}


function selector(evt){
  if(bool_select==true){
    var image = document.getElementById("output_img");
    var canvas_coords = image.getBoundingClientRect();
    var x = evt.clientX - canvas_coords.left;
    var y = evt.clientY - canvas_coords.top;
    var url = req_address + "select";
    const formData = new FormData();
    formData.append('data', [x,y,colour_select]);
    console.log([x,y,selector]);

    fetch(url, {
      method: 'POST',
      body: formData
    }).then((response) => {
      // var img_1 = new Image();
      // img_1.src = "./segment.jpg"
      var img_1 = document.getElementById("output_img");
      img_1.src = img_address + "segment.jpg?" + new Date().getTime();
      img_1.onload= function(){
        // var hRatio = canvas_2.width/img_1.width;
        // var vRatio = canvas_2.height/img_1.height;
        // var ratio  = Math.min(hRatio, vRatio);
        // ctx_2.clearRect(0, 0, 1500, 700);
        // ctx_2.drawImage(img_1, 0,0, img_1.width, img_1.height, 0,0,img_1.width*hRatio, img_1.height*vRatio);
        console.log("Updated");
      }
      var img_2 = document.getElementById("col_"+colour_select)
      img_2.src = img_src + "masks/col_"+colour_select+".png?" + new Date().getTime();
      img_2.onload = function(){
        img_2.style.display = "block";
        console.log("Mask Updated.")
      }
      var back_img = document.getElementById("back");
      back_img.src = img_address + "masks/back.png?" + new Date().getTime();;  
      back_img.onload = function(){
        back_img.style.display = "block";
      }  
    })
  }
}

function Mask_Selector(evt){
  var target = evt.currentTarget;
  var name = target.id;
  if(mask_select.includes(name)){
    target.style.border= "0px";
    var pos = mask_select.indexOf(name);
    mask_select.splice(pos,1);
  }else{
    target.style.border= "5px solid #BF00FF";
    mask_select.push(name);
  }
  console.log(name);
}

function inpaint_img(evt){
  var url = req_address + "prior";
  const formData = new FormData();
  formData.append('data', mask_select);
  formData.append("Iter",slider_prior.value);
  console.log(mask_select);
  var img_1 = document.getElementById("output_img");
  img_1.src = img_src + "Loading.gif";
  img_1.onload= function(){
    console.log("Loading");
  }
  fetch(url, {
    method: 'POST',
    body: formData
  }).then((response) => {
    // var img_1 = new Image();
    // img_1.src = "./segment.jpg"
    var img_1 = document.getElementById("output_img");
    img_1.src = img_address +"inpaint.png?" + new Date().getTime();
    img_1.onload= function(){
      console.log("Painted");
    }
  })
}

function runner(){
  var shape_init = false;
  var shape = 1;
  var p1 = null;
  var canvas = document.getElementById("canvas_board");
  var ctx = canvas.getContext('2d');
  var image = document.getElementById("output_img");

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
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);  
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
      shape_init = true;
    },
    addCanvasEvents: function() {
      this.canvas.addEventListener('mousedown', this.start.bind(this));
      this.canvas.addEventListener('mousemove', this.stroke.bind(this));
      this.canvas.addEventListener('mouseup', this.stop.bind(this));
      this.canvas.addEventListener('mouseout', this.out.bind(this));
    },
    removeCanvasEvents: function() {
      this.canvas.removeEventListener('mousedown', this.start.bind(this));
      this.canvas.removeEventListener('mousemove', this.stroke.bind(this));
      this.canvas.removeEventListener('mouseup', this.stop.bind(this));
      this.canvas.removeEventListener('mouseout', this.out.bind(this));
    },
    start: function(evt) {
      var x = evt.clientX - this.canvas_coords.left;
      var y = evt.clientY - this.canvas_coords.top;
      if(shape==1){
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.drawing = true;
      }else{
        if(p1!=null){
          ctx.fillRect(p1[0],p1[1], x - p1[0], y - p1[1]);
          p1=null;
          canvas.style.cursor = "default";
        }else{
          p1 = [x,y];
          canvas.style.cursor = "crosshair";
        }
      }
      history.saveState(this.canvas);
    },
    stroke: function(evt) {
      if(shape==1){
        if(this.drawing) {
          var x = evt.clientX - this.canvas_coords.left;
          var y = evt.clientY - this.canvas_coords.top;
          this.ctx.lineTo(x, y);
          this.ctx.stroke();
        }
      }
    },
    stop: function(evt) {
      if(shape==1){
        if(this.drawing){
          this.drawing = false;
        }
      }
    },
    out: function(evt) {
      if(shape==1){
        if(this.drawing){
          this.drawing = false;
        }
      }else{
        p1=null;
        canvas.style.cursor = "default";      
      }
    }
  };
  
  var lasso = {
    on : function(evt){
      canvas.addEventListener("mousemove",lasso.select);
      console.log("Lasso On");
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = "#000000";
      ctx.globalAlpha = 0.01;
      var canvas_coords = canvas.getBoundingClientRect();
      var x = evt.clientX - canvas_coords.left;
      var y = evt.clientY - canvas_coords.top;
      cursor_pts.push([x,y]);
      history.saveState(canvas);
    },
    
    off : function(evt){
      canvas.removeEventListener("mousemove",lasso.select);
      history.undo(canvas,ctx);
      ctx.globalAlpha = 1;
      setTimeout(function(){
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cursor_pts[0][0],cursor_pts[0][1]);
        for (let i = 1; i < cursor_pts.length; i++) {
          ctx.lineTo(cursor_pts[i][0],cursor_pts[i][1]);
        }
        ctx.lineTo(cursor_pts[0][0],cursor_pts[0][1]);
        ctx.closePath();
        ctx.clip();
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.restore();
        cursor_pts = [];
        console.log("Lasso Off");
      }, 125);
    },
    
    select : function(evt){
      var canvas_coords = canvas.getBoundingClientRect();
      var x = evt.clientX - canvas_coords.left;
      var y = evt.clientY - canvas_coords.top;
      cursor_pts.push([x,y]);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cursor_pts[0][0],cursor_pts[0][1]);
      for (let i = 1; i < cursor_pts.length; i++) {
        ctx.lineTo(cursor_pts[i][0],cursor_pts[i][1]);
      }
      ctx.lineTo(cursor_pts[0][0],cursor_pts[0][1]);
      ctx.closePath();
      ctx.clip();
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.restore();
    }    
  };

  document.getElementById('Line').addEventListener('click', function() {
    shape = 1; 
    if(shape_init!=true){
    pencil.init(canvas, ctx);
    }
    if(bool_cursor_select==true){
      canvas.removeEventListener("mousedown",lasso.on);
      canvas.removeEventListener("mouseup",lasso.off);
    }
    bool_cursor_select = false;
  });

  document.getElementById("Rectangle").addEventListener("click",function(){
    shape = 2;
    if(shape_init!=true){
      pencil.init(canvas, ctx);
    }
    if(bool_cursor_select==true){
      canvas.removeEventListener("mousedown",lasso.on);
      canvas.removeEventListener("mouseup",lasso.off);
    }
    bool_cursor_select = false;
  })

  // document.getElementById("Ellipse").addEventListener("click",function(){
  //   shape = 3;
  //   if(shape_init!=true){
  //     pencil.init(canvas, ctx);
  //   }
  // })
  
  document.getElementById('Undo').addEventListener('click', function() {
    history.undo(canvas, ctx);
  });
  
  document.getElementById('Redo').addEventListener('click', function() {
    history.redo(canvas, ctx);
  });
  
  document.getElementById("Clear").addEventListener("click",function(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  })

  document.getElementById("SLIC").addEventListener("click",function(){
    segment("slic");
    history.saveState(canvas);
    // if(shape_init!=true){
    //   pencil.removeCanvasEvents(canvas, ctx);
    // }
    shape_init = false;
    bool_select = true;
    if(bool_cursor_select==true){
      canvas.removeEventListener("mousedown",lasso.on);
      canvas.removeEventListener("mousedown",lasso.off);
    }
    bool_cursor_select = false;
    image.addEventListener("click",selector);
    image.addEventListener("mousedown",set_selector);
    image.addEventListener("mouseup",remove_selector);
  })

  document.getElementById("Felzen").addEventListener("click",function(){
    segment("felzen");
    history.saveState(canvas);
    shape_init = false;
    bool_select = true;
    if(bool_cursor_select==true){
      canvas.removeEventListener("mousedown",lasso.on);
      canvas.removeEventListener("mousedown",lasso.off);
    }
    bool_cursor_select = false;
    bool_select = true;
    image.addEventListener("click",selector);
    image.addEventListener("mousedown",set_selector);
    image.addEventListener("mouseup",remove_selector);
  })

  document.getElementById("Lasso").addEventListener("click",function(){
    bool_cursor_select = true;
    shape = 1; 
    if(shape_init!=true){
    pencil.init(canvas, ctx);
    }
    canvas.addEventListener("mousedown",lasso.on);
    canvas.addEventListener("mouseup",lasso.off);
    history.saveState(canvas);
  })

  document.getElementById("priors").addEventListener("click",inpaint_img);

  document.getElementById("col_0").addEventListener("click",Mask_Selector);

  document.getElementById("col_1").addEventListener("click",Mask_Selector);

  document.getElementById("col_2").addEventListener("click",Mask_Selector);

  document.getElementById("col_3").addEventListener("click",Mask_Selector);

  document.getElementById("col_4").addEventListener("click",Mask_Selector);

  document.getElementById("col_5").addEventListener("click",Mask_Selector);

  document.getElementById("red").addEventListener('click',function(){
    ctx.strokeStyle = "#FF0000";
    ctx.fillStyle = "#FF0000";
    colour_select = 0;
  });
  
  document.getElementById("blue").addEventListener('click',function(){
    ctx.strokeStyle = "#0000FF";
    ctx.fillStyle = "#0000FF";
    colour_select = 1;
  });
  
  document.getElementById("green").addEventListener('click',function(){
    ctx.strokeStyle = "#00FF00";
    ctx.fillStyle = "#00FF00";  
    colour_select = 2;
  });
  
  document.getElementById("black").addEventListener('click',function(){
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    colour_select = 3;
  });
  
  document.getElementById("white").addEventListener('click',function(){
    ctx.strokeStyle = "#FFFFFF";
    ctx.fillStyle = "#FFFFFF";
    colour_select = 4;
  });
  
  document.getElementById("purple").addEventListener('click',function(){
    ctx.strokeStyle = "#4169E1";
    ctx.fillStyle = "#4169E1";
    colour_select = 5;
  });
  
  document.getElementById("size_1").addEventListener('click',function(){
    ctx.lineWidth = 2*2;
  });
  
  document.getElementById("size_2").addEventListener('click',function(){
    ctx.lineWidth = 3*2;
  });
  
  document.getElementById("size_3").addEventListener('click',function(){
    ctx.lineWidth = 4*2;
  });

  document.getElementById("size_4").addEventListener('click',function(){
    ctx.lineWidth = 5*2;
  });

  document.getElementById("size_5").addEventListener('click',function(){
    ctx.lineWidth = 6*2;
  });

  document.getElementById("size_6").addEventListener('click',function(){
    ctx.lineWidth = 7*2;
  });

  document.getElementById("Colour_Btn").addEventListener("click",function(){
    var new_div = document.getElementById("Colour_Div");
    if(new_div.style.display == "block"){
      new_div.style.display = "none";
    }else{
      new_div.style.display = "block";
    }
  });

  document.getElementById("Pen_Btn").addEventListener("click",function(){
    var new_div = document.getElementById("Pen_Div");
    if(new_div.style.display == "block"){
      new_div.style.display = "none";
    }else{
      new_div.style.display = "block";
    }
  });

  document.getElementById("Shape_Btn").addEventListener("click",function(){
    var new_div = document.getElementById("Shape_Div");
    if(new_div.style.display == "block"){
      new_div.style.display = "none";
    }else{
      new_div.style.display = "block";
    }
  });

  document.getElementById("Segment_Btn").addEventListener("click",function(){
    var new_div = document.getElementById("Segment_Div");
    if(new_div.style.display == "block"){
      new_div.style.display = "none";
    }else{
      new_div.style.display = "block";
    }
  });

  document.getElementById("Inpaint_Btn").addEventListener("click",function(){
    var new_div = document.getElementById("Inpaint_Div");
    if(new_div.style.display == "block"){
      new_div.style.display = "none";
    }else{
      new_div.style.display = "block";
    }
  });

}

runner()