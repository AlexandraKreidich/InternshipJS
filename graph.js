var Graph = {

    WIDTH : 0,

    HEIGHT : 0,

    ctx : null,

    canvas : null,

    PX_PER_POINT : 40, //расстояние между двумя соседними точками на осях

    MS_PER_PIXEL : 1000, //масштаб оси ОХ

    UNITS_PER_PIXEL : 10, //масштаб по OY

    START_MS : 1498000000000, //значение в точке 0 по ОХ

    START_UNITS : 0, //значение в точке 0 по OY

    init : function(){
        Graph.canvas = document.getElementsByTagName('canvas')[0];
        Graph.HEIGHT = document.body.clientHeight;
        Graph.WIDTH = document.body.clientWidth;
        Graph.canvas.height = Graph.HEIGHT;
        Graph.canvas.width = Graph.WIDTH;
        Graph.ctx = Graph.canvas.getContext("2d");
        Graph.render(); //инициализация отрисовки графика
        Graph.resize(); //функция для отслеживания изменения размров экрана
    },

    resize : function () {
        setTimeout(function(){
            var timerResize = "first";
            window.onresize = function(){
                if(timerResize !== "first") clearTimeout(timerResize);

                timerResize = setTimeout(function(){
                    Graph.init();
                },20)
            }
        },200);
    },

    createCanvas : function () {
        Graph.ctx.fillStyle = '#000000';
        Graph.ctx.fillRect(0, 0, Graph.WIDTH, Graph.HEIGHT);
    },

    render : function(){ //рендеровка графика(очистка всего поля и отрисовка заного)
        Graph.createCanvas();
        Graph.drawAxes();
        Graph.drawMarks();
        Graph.drawGrid();
    },

    drawMarks : function () {
        //метки на оси ОХ
        var cur_pos = Graph.PX_PER_POINT;
        Graph.ctx.beginPath();
        while (Graph.realX(cur_pos) < Graph.WIDTH - 56){
            Graph.ctx.moveTo(Graph.realX(cur_pos), Graph.realY(3));
            Graph.ctx.lineTo(Graph.realX(cur_pos), Graph.realY(-3));
            cur_pos += Graph.PX_PER_POINT;
        }
        Graph.ctx.stroke();

        //метки на оси OY
        cur_pos = Graph.PX_PER_POINT;
        Graph.ctx.beginPath();
        while (cur_pos < Graph.HEIGHT - 106){
            Graph.ctx.moveTo(Graph.realX(-3), Graph.realY(cur_pos));
            Graph.ctx.lineTo(Graph.realX(3), Graph.realY(cur_pos));
            cur_pos += Graph.PX_PER_POINT;
        }
        Graph.ctx.stroke();

        //кружочек в (0,0)
        Graph.ctx.beginPath();
        Graph.ctx.moveTo(Graph.realX(0), Graph.realY(0));
        Graph.ctx.arc(Graph.realX(0), Graph.realY(0), 4, 0, 2*Math.PI);
        Graph.ctx.fill();
    },

    drawGrid : function () {
        var cur_pos = Graph.PX_PER_POINT;
        Graph.ctx.lineWidth = 0.5;

        //отрисовка по ОХ
        Graph.ctx.beginPath();
        while (Graph.realX(cur_pos) < Graph.WIDTH - 50){
            Graph.ctx.moveTo(Graph.realX(cur_pos), Graph.realY(0));
            Graph.ctx.lineTo(Graph.realX(cur_pos), 50);
            cur_pos += Graph.PX_PER_POINT;
        }
        Graph.ctx.stroke();

        //отрисовка по OY
        cur_pos = Graph.PX_PER_POINT;
        Graph.ctx.beginPath();
        while (cur_pos < Graph.HEIGHT - 100){
            Graph.ctx.moveTo(Graph.realX(0), Graph.realY(cur_pos));
            Graph.ctx.lineTo(Graph.WIDTH - 50, Graph.realY(cur_pos));
            cur_pos += Graph.PX_PER_POINT;
        }
        Graph.ctx.stroke();
    },

    drawAxes : function () {
        Graph.ctx.strokeStyle = '#FFFFFF';
        Graph.ctx.fillStyle = '#FFFFFF';
        Graph.ctx.lineWidth = 2;

        //отрисовка OX и OY
        Graph.ctx.beginPath();
        Graph.ctx.moveTo(Graph.WIDTH - 50, Graph.realY(0));
        Graph.ctx.lineTo(Graph.realX(0), Graph.realY(0));
        Graph.ctx.lineTo(Graph.realX(0), 50);
        Graph.ctx.moveTo(Graph.realX(0), 50);
        Graph.ctx.stroke();

        //отрисовка стрелочки на OX
        Graph.ctx.beginPath();
        Graph.ctx.moveTo(Graph.realX(0), 50);
        Graph.ctx.lineTo(Graph.realX(3), 56);
        Graph.ctx.lineTo(Graph.realX(-3), 56);
        Graph.ctx.lineTo(Graph.realX(0), 50);
        Graph.ctx.stroke();
        Graph.ctx.fill();

        //отрисовка стрелочки на OY
        Graph.ctx.beginPath();
        Graph.ctx.moveTo(Graph.WIDTH - 50, Graph.realY(0));
        Graph.ctx.lineTo(Graph.WIDTH - 56, Graph.realY(-3));
        Graph.ctx.lineTo(Graph.WIDTH - 56, Graph.realY(3));
        Graph.ctx.lineTo(Graph.WIDTH - 50, Graph.realY(0));
        Graph.ctx.stroke();
        Graph.ctx.fill();
    },

    realX : function (x) { //возращает позицию пикселей в координатаъ canvas
        return x + 50;
    },

    realY : function (y) { //возращает позицию пикселей в координатаъ canvas
        return Graph.HEIGHT - 50 - y;
    },

    tsToX : function (ts) { //переводит метку времени в координату по X
        return Graph.realX((ts-Graph.START_MS)/1000);
    },

    unitsToY : function (units) { //переводит значение по OY в координаты на Y
        return Graph.realY(units/10);
    }
};