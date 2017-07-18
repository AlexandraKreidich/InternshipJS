var Graph = {

    WIDTH : 0, //ширина экрана пользователя

    HEIGHT : 0, //высота экрана пользователя

    ctx : null, //контекст холста

    canvas : null, //холст

    MARGIN : 50, //отступ по краям графика

    OX_MS : 0, //ось ОХ в миллисекундах

    PX_PER_POINT : 40, //расстояние между двумя соседними точками на осях

    MS_PER_PIXEL : 1000, //масштаб оси ОХ

    UNITS_PER_PIXEL : 10, //масштаб по OY

    START_MS : 1498000070000, //значение в точке 0 по ОХ

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
        Graph.OX_MS = (Graph.WIDTH - 2*Graph.MARGIN)*Graph.MS_PER_PIXEL;
    },

    //функция для отслеживания изменения размров экрана
    resize : function () {
        timerResize = setTimeout(function(){
            Graph.getDimensions();
            Graph.render();
        }, 20)
    },

    //рендеровка графика(очистка всего поля и отрисовка заного)
    render : function(){
        Graph.resetCanvas();
        Graph.drawAxes();
        Graph.drawMarks();
        Graph.drawGrid();
        Graph.test();
    },

    // NE PONYATNO (вызов функций отрисовки графика и меток)
    test : function () {
        //this.START_MS 1498000000000
        //console.log((this.WIDTH-156)*this.MS_PER_PIXEL);
        Data.getDataFor(this.START_MS, Graph.OX_MS, Graph.buildLine);
        Data.getDataFor(this.START_MS, Graph.OX_MS, Graph.drawData);
    },

    //заливает верхнюю часть холста что бы график не вылазил за границы????
    fillTop : function (){
        //console.log('start');
        Graph.ctx.fillStyle = '#000000';
        Graph.ctx.fillRect(0, 0, Graph.WIDTH, Graph.MARGIN - 1);
        //console.log('end');
        //console.log('_________');
    },

    //заливает весь холст черным
    resetCanvas : function () {
        Graph.ctx.fillStyle = '#000000';
        Graph.ctx.fillRect(0, 0, Graph.WIDTH, Graph.HEIGHT);
        //console.log("clear");
    },

    //построение диаграммы
    buildLine : function (d, start) {
        //console.log(d, start);
        var l = d.x.length, ctx = Graph.ctx;
        ctx.strokeStyle = '#ffae7a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        //console.log("start");
        //Graph.ctx.moveTo(Graph.realX(0), Graph.realY(0));
        ctx.moveTo(Graph.tsToX(d.x[0]), Graph.unitsToY(d.y[0]));
        for(var i = 1; i < l; i++){
            //console.log("go");
            ctx.lineTo(Graph.tsToX(d.x[i]), Graph.unitsToY(d.y[i]));
        }
        //console.log("cancel");
        ctx.stroke();
        Graph.fillTop();
    },

    //отрисовка меток на осях
    drawMarks : function () {
        //метки на оси ОХ
        var cur_pos = Graph.calculateSections(),
            ctx = Graph.ctx,
            width = Graph.WIDTH - Graph.MARGIN + 6,
            realY3 = Graph.realY(3),
            realYm3 = Graph.realY(-3);
        ctx.beginPath();
        while (Graph.realX(cur_pos) < width){
            ctx.moveTo(Graph.realX(cur_pos), realY3);
            ctx.lineTo(Graph.realX(cur_pos), realYm3);
            cur_pos += Graph.PX_PER_POINT;
        }
        ctx.stroke();

        //метки на оси OY
        var height = Graph.HEIGHT - 2*Graph.MARGIN + 6,
            realX3 = Graph.realX(3),
            realXm3 = Graph.realX(-3);
        cur_pos = Graph.PX_PER_POINT;
        ctx.beginPath();
        while (cur_pos < height){
            ctx.moveTo(realXm3, Graph.realY(cur_pos));
            ctx.lineTo(realX3, Graph.realY(cur_pos));
            cur_pos += Graph.PX_PER_POINT;
        }
        ctx.stroke();

        //кружочек в (0,0)
        ctx.beginPath();
        ctx.moveTo(Graph.realX(0), Graph.realY(0));
        ctx.arc(Graph.realX(0), Graph.realY(0), 4, 0, 2*Math.PI);
        ctx.fill();
    },

    //отрисовка сетки
    drawGrid : function () {
        var cur_pos = Graph.calculateSections(),
            ctx = Graph.ctx,
            margin = Graph.MARGIN,
            height = Graph.HEIGHT - 2*margin,
            width = Graph.WIDTH - margin,
            realY0 = Graph.realY(0),
            realX0 = Graph.realX(0);
        ctx.lineWidth = 0.5;

        //отрисовка по ОХ
        ctx.beginPath();
        while (Graph.realX(cur_pos) < width){
            ctx.moveTo(Graph.realX(cur_pos), realY0);
            ctx.lineTo(Graph.realX(cur_pos), margin);
            cur_pos += Graph.PX_PER_POINT;
        }
        ctx.stroke();

        //отрисовка по OY
        cur_pos = Graph.PX_PER_POINT;
        ctx.beginPath();
        while (cur_pos < height){
            ctx.moveTo(realX0, Graph.realY(cur_pos));
            ctx.lineTo(width, Graph.realY(cur_pos));
            cur_pos += Graph.PX_PER_POINT;
        }
        ctx.stroke();
    },

    //вычисление первого отступа метки
    calculateSections : function () {
        return (Graph.START_MS%(Graph.MS_PER_PIXEL*Graph.PX_PER_POINT))/Graph.MS_PER_PIXEL;
    },

    //отрисовка координатных прямых
    drawAxes : function () {
        var realX0 = Graph.realX(0), realY0 = Graph.realY(0),
            ctx = Graph.ctx,
            margin = Graph.MARGIN;
        ctx.strokeStyle = '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();

        //отрисовка OX и OY
        ctx.moveTo(Graph.WIDTH - margin, realY0);
        ctx.lineTo(realX0, realY0);
        ctx.lineTo(realX0, margin);
        ctx.moveTo(realX0, margin);

        //отрисовка стрелочки на OY
        ctx.moveTo(realX0, margin);
        ctx.lineTo(Graph.realX(3), margin + 6);
        ctx.lineTo(Graph.realX(-3), margin + 6);
        ctx.lineTo(realX0, margin);

        //отрисовка стрелочки на OX
        ctx.moveTo(Graph.WIDTH - margin, realY0);
        ctx.lineTo(Graph.WIDTH - margin - 6, Graph.realY(-3));
        ctx.lineTo(Graph.WIDTH - margin - 6, Graph.realY(3));
        ctx.lineTo(Graph.WIDTH - margin, realY0);
        ctx.stroke();
    },

    //отрисовка меток времени и значений
    drawData : function (d, start) {
        var ctx = Graph.ctx,
            stepX = 5 * Graph.PX_PER_POINT,
            stepY = 2 * Graph.PX_PER_POINT,
            cur_pos = 0,
            width = Graph.WIDTH - Graph.MARGIN + 6,
            height = Graph.HEIGHT - 2*Graph.MARGIN + 6,
            realYm18 = Graph.realY(-18),
            realYm36 = Graph.realY(-36),
            realXm8 = Graph.realX(-8),
            unY = Graph.UNITS_PER_PIXEL;
        ctx.font = '13px Arial';
        ctx.fillStyle = '#FFFFFF';

        //отрисовка меток времени
        ctx.textAlign = 'center';
        while (Graph.realX(cur_pos) < width) {
            ctx.fillText(Data.tsToData(Graph.MS_PER_PIXEL * cur_pos + start), Graph.realX(cur_pos), realYm18);
            ctx.fillText(Data.tsToTime(Graph.MS_PER_PIXEL * cur_pos + start), Graph.realX(cur_pos), realYm36);
            cur_pos += stepX;
        }

        //отрисовка значений
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        cur_pos = stepY;
        while (Graph.realX(cur_pos) < height) {
            ctx.fillText(cur_pos * unY, realXm8, Graph.realY(cur_pos));
            cur_pos += stepY;
        }
    },

    //возращает позицию пикселей в координатаъ canvas
    realX : function (x) {
        return x + Graph.MARGIN;
    },

    //возращает позицию пикселей в координатаъ canvas
    realY : function (y) {
        return Graph.HEIGHT - Graph.MARGIN - y;
    },

    //переводит метку времени в координату по X
    tsToX : function (ts) {
        return Graph.realX(ts/Graph.MS_PER_PIXEL);
    },

    //переводит значение по OY в координаты на Y
    unitsToY : function (units) {
        return Graph.realY(units/10);
    }
};