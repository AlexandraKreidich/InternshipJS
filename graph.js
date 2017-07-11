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
        Graph.getDimensions();
        Graph.ctx = Graph.canvas.getContext('2d');
        Graph.render();
        window.addEventListener('resize', Graph.resize);
    },

    //функция получающая данные о размере экрана, и назначает размер холста
    getDimensions : function () {
        Graph.HEIGHT = document.body.clientHeight;
        Graph.WIDTH = document.body.clientWidth;
        Graph.canvas.height = Graph.HEIGHT;
        Graph.canvas.width = Graph.WIDTH;
    },

    //функция для отслеживания изменения размров экрана
    resize : function () {
        timerResize = setTimeout(function(){
            Graph.getDimensions();
            Graph.render();
        },20)
    },

    //рендеровка графика(очистка всего поля и отрисовка заного)
    render : function(){
        Graph.resetCanvas();
        Graph.drawAxes();
        Graph.drawMarks();
        Graph.drawGrid();
        Data.getDataFor(this.START_MS, this.WIDTH*this.MS_PER_PIXEL, Graph.buildLine);
    },

    //заливает весь холст черным
    resetCanvas : function () {
        Graph.ctx.fillStyle = '#000000';
        Graph.ctx.fillRect(0, 0, Graph.WIDTH, Graph.HEIGHT);
        //console.log("clear");
    },

    //построение диаграммы
    buildLine : function (d, start) {
        //console.log(d);
        Graph.ctx.strokeStyle = '#FFFFFF';
        Graph.ctx.lineWidth = 2;
        Graph.ctx.beginPath();
        //console.log("start");
        Graph.ctx.moveTo(Graph.realX(0), Graph.realY(0));
        for(var i = 0; i < d.length; i++){
            //console.log("11111");
            Graph.ctx.lineTo(Graph.tsToX(d[i].x), Graph.unitsToY(d[i].y));
        }
        //console.log("cancel");
        Graph.ctx.stroke();
    },

    //отрисовка меток на осях
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
        cur_pos = Graph.UNITS_PER_PIXEL;
        Graph.ctx.beginPath();
        while (cur_pos < Graph.HEIGHT - 106){
            Graph.ctx.moveTo(Graph.realX(-3), Graph.realY(cur_pos));
            Graph.ctx.lineTo(Graph.realX(3), Graph.realY(cur_pos));
            cur_pos += Graph.UNITS_PER_PIXEL;
        }
        Graph.ctx.stroke();

        //кружочек в (0,0)
        Graph.ctx.beginPath();
        Graph.ctx.moveTo(Graph.realX(0), Graph.realY(0));
        Graph.ctx.arc(Graph.realX(0), Graph.realY(0), 4, 0, 2*Math.PI);
        Graph.ctx.fill();
    },

    //отрисовка стрелочек
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
        cur_pos = Graph.UNITS_PER_PIXEL;
        Graph.ctx.beginPath();
        while (cur_pos < Graph.HEIGHT - 100){
            Graph.ctx.moveTo(Graph.realX(0), Graph.realY(cur_pos));
            Graph.ctx.lineTo(Graph.WIDTH - 50, Graph.realY(cur_pos));
            cur_pos += Graph.UNITS_PER_PIXEL;
        }
        Graph.ctx.stroke();
    },

    //отрисовка координатных прямых
    drawAxes : function () {
        var realX0 = Graph.realX(0), realY0 = Graph.realY(0);
        Graph.ctx.strokeStyle = '#FFFFFF';
        Graph.ctx.fillStyle = '#FFFFFF';
        Graph.ctx.lineWidth = 2;
        Graph.ctx.beginPath();

        //отрисовка OX и OY
        Graph.ctx.moveTo(Graph.WIDTH - 50, realY0);
        Graph.ctx.lineTo(realX0, realY0);
        Graph.ctx.lineTo(realX0, 50);
        Graph.ctx.moveTo(realX0, 50);

        //отрисовка стрелочки на OX
        Graph.ctx.moveTo(realX0, 50);
        Graph.ctx.lineTo(Graph.realX(3), 56);
        Graph.ctx.lineTo(Graph.realX(-3), 56);
        Graph.ctx.lineTo(realX0, 50);

        //отрисовка стрелочки на OY
        Graph.ctx.moveTo(Graph.WIDTH - 50, realY0);
        Graph.ctx.lineTo(Graph.WIDTH - 56, Graph.realY(-3));
        Graph.ctx.lineTo(Graph.WIDTH - 56, Graph.realY(3));
        Graph.ctx.lineTo(Graph.WIDTH - 50, realY0);
        Graph.ctx.stroke();
    },

    //возращает позицию пикселей в координатаъ canvas
    realX : function (x) {
        return x + 50;
    },

    //возращает позицию пикселей в координатаъ canvas
    realY : function (y) {
        return Graph.HEIGHT - 50 - y;
    },

    //переводит метку времени в координату по X
    tsToX : function (ts) {
        return Graph.realX(ts/1000);
    },

    //переводит значение по OY в координаты на Y
    unitsToY : function (units) {
        return Graph.realY(units/10);
    }
};