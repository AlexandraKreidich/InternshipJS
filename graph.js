var Graph = {
    WIDTH : 0,
    HEIGHT : 0,
    ctx : null,
    canvas : null,
    init : function(){
        Graph.canvas = document.getElementsByTagName('canvas')[0];
        Graph.HEIGHT = document.body.clientHeight;
        Graph.WIDTH = document.body.clientWidth;
        Graph.canvas.height = Graph.HEIGHT;
        Graph.canvas.width = Graph.WIDTH;
        Graph.ctx = Graph.canvas.getContext("2d");
        Graph.ctx.fillStyle = '#000000';
        Graph.ctx.fillRect(0, 0, Graph.WIDTH, Graph.HEIGHT);
    }
}