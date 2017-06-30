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
        Graph.render(); //инициализация отрисовки графика
    },


    render : function(){ //рендеровка графика(очистка всего поля и отрисовка заного)
        Graph.ctx.strokeStyle = '#FFFFFF';
        Graph.ctx.fillStyle = '#FFFFFF';
        Graph.ctx.lineWidth = 2;

        Graph.ctx.beginPath();
        Graph.ctx.moveTo(Graph.WIDTH - 50, Graph.HEIGHT - 50);
        Graph.ctx.lineTo(50, Graph.HEIGHT - 50);
        Graph.ctx.lineTo(50, 50);
        Graph.ctx.moveTo(50, 50);
        Graph.ctx.closePath();
        Graph.ctx.stroke();

        Graph.ctx.beginPath();
        Graph.ctx.moveTo(50, 50);
        Graph.ctx.lineTo(53, 56);
        Graph.ctx.lineTo(47, 56);
        Graph.ctx.lineTo(50, 50);
        Graph.ctx.closePath();
        Graph.ctx.stroke();
        Graph.ctx.fill();

        Graph.ctx.beginPath();
        Graph.ctx.moveTo(Graph.WIDTH - 50, Graph.HEIGHT - 50);
        Graph.ctx.lineTo(Graph.WIDTH - 56, Graph.HEIGHT - 53);
        Graph.ctx.lineTo(Graph.WIDTH - 56, Graph.HEIGHT - 47);
        Graph.ctx.lineTo(Graph.WIDTH - 50, Graph.HEIGHT - 50);
        Graph.ctx.closePath();
        Graph.ctx.stroke();
        Graph.ctx.fill();

        var cur_pos = 0;
        Graph.ctx.beginPath();
        Graph.ctx.moveTo(50, Graph.HEIGHT - 53);
        while (cur_pos < Graph.WIDTH - 50){
            cur_pos += Graph.PX_PER_POINT;
            Graph.ctx.moveTo(cur_pos)


        }
        Graph.ctx.closePath();
        Graph.ctx.stroke();

    },

    realX : function (x) {
        return Graph.WIDTH - x;
    },

    realY : function (y) {
        return Graph.HEIGHT - y;
    },

    tsToX : function (ts) { //переводит метку времени в координату по X
        return Graph.realX((ts-Graph.START_MS)/1000);
    },

    unitsToY : function (units) { //переводит значение по OY в координаты на Y
        return Graph.realY(units/10);
    },

    PX_PER_POINT : 40, //расстояние между двумя соседними точками на осях

    MS_PER_PIXEL : 1000, //масштаб оси ОХ

    UNITS_PER_PIXEL : 10, //масштаб по OY

    START_MS : 1498000000000, //значение в точке 0 по ОХ

    START_UNITS : 0 //значение в точке 0 по OY
};