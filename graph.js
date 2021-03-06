var Graph = {

    WIDTH: 0, //ширина экрана пользователя

    HEIGHT: 0, //высота экрана пользователя

    ctx: null, //контекст холста

    canvas: null, //холст(невидимый)

    tempCanvas: null, //второй холст

    tempCtx: null, //контекст второго холста

    imageData: null, //изображение холста

    MARGIN: 50, //отступ по краям графика

    OX_MS: 0, //ось ОХ в миллисекундах

    OY_MS: 0, //ось OY в значениях

    PX_PER_POINT: 100, //расстояние между двумя соседними точками на осях

    MS_PER_PIXEL: 1000, //масштаб оси ОХ

    UNITS_PER_PIXEL: 10, //масштаб по OY

    START_UNITS: 0,//9000, //значение в точке 0 по OY

    START_MS: 0,//1498049833680,//1498029923327,//1500379393330, //значение в точке 0 по OX

    LAST_MS: 0, // крайняя точка графика

    threshold: 0.2, // процент границы крайней точки графика

    INIT_MS_PER_PIXEL: 1000, //фиксированный масштаб по ОХ

    INIT_UNIT_PER_PIXEL: 10, //фиксированный масштаб по OY

    CurrentZoom: 0, //текущий масштаб [-20, 20]

    SPEED: 4, //скорость скроллинга

    mouseFlag: false, //индикатор нажатия ЛКМ

    cursorPositionX: 0, //положение курсора по X

    cursorPositionY: 0, //положение курсора по Y

    shiftX: 0, //сдвиг по ОХ

    shiftY: 0, //сдвиг по OY

    init: function () {
        Graph.tempCanvas = document.createElement('canvas');
        Graph.canvas = document.getElementsByTagName('canvas')[0];
        Graph.getDimensions();
        Graph.START_MS = 1498049960000 - Graph.OX_MS + Graph.threshold * Graph.OX_MS;
        Graph.tempCtx = Graph.tempCanvas.getContext('2d');
        Graph.ctx = Graph.canvas.getContext('2d');
        Graph.render();
        window.addEventListener('resize', Graph.resize); //ctrl+'+'/'-'
        window.addEventListener('keydown', Graph.move); //нажатие клавиши
        window.addEventListener('keydown', Graph.zoom); //нажатие клавиши
        window.addEventListener('mousedown', Graph.onDown); //нажатие кнопки мыши
        window.addEventListener('mouseup', Graph.onUp); //отпускание кнопки мыши
        window.addEventListener('mousemove', Graph.onMove); //движение мыши
        window.addEventListener('wheel', Graph.zoom); //колесико мыши
        window.addEventListener('dblclick', Graph.zoom); //даблклик мыши
        window.addEventListener('touchstart', Graph.onDown); //тык пальцем по экрану
        window.addEventListener('touchend', Graph.onUp); //отрыв пальчика от экрана
        window.addEventListener('touchmove', Graph.onMove); //движение пальчиком по экрану
    },

    //функция получающая данные о размере экрана, и назначает размер холста
    getDimensions: function () {
        Graph.HEIGHT = document.body.clientHeight;
        Graph.WIDTH = document.body.clientWidth;
        Graph.tempCanvas.height = Graph.HEIGHT;
        Graph.tempCanvas.width = Graph.WIDTH;
        Graph.canvas.height = Graph.HEIGHT;
        Graph.canvas.width = Graph.WIDTH;
        Graph.OX_MS = (Graph.WIDTH - 2 * Graph.MARGIN) * Graph.MS_PER_PIXEL;
        Graph.OY_MS = (Graph.HEIGHT - 2 * Graph.MARGIN) * Graph.UNITS_PER_PIXEL;
    },

    //рендеровка графика(очистка всего поля и отрисовка заного)
    render: function () {
        Graph.resetCanvas();
        Graph.buildData();
    },

    //функция для отслеживания изменения размров экрана
    resize: function () {
        timerResize = setTimeout(function () {
            Graph.getDimensions();
            Graph.render();
        }, 20)
    },

    //перемещение графика
    move: function (e) {
        var left = 37,
            up = 38,
            right = 39,
            down = 40,
            speed = Graph.SPEED,
            tmpX = 0;
        switch (e.keyCode) {
            case left :
                tmpX = (Graph.LAST_MS - Graph.START_MS) / Graph.MS_PER_PIXEL;
                Graph.START_MS -= speed * Graph.MS_PER_PIXEL;
                Graph.render();
                break;
            case right :
                tmpX = (Graph.LAST_MS - Graph.START_MS) / Graph.MS_PER_PIXEL;
                if (tmpX < (Graph.OX_MS - Graph.threshold * Graph.OX_MS) / Graph.MS_PER_PIXEL) {
                    break;
                }
                Graph.START_MS += speed * Graph.MS_PER_PIXEL;
                Graph.render();
                break;
            case up :
                Graph.START_UNITS += speed * Graph.UNITS_PER_PIXEL;
                Graph.render();
                break;
            case down :
                Graph.START_UNITS -= speed * Graph.UNITS_PER_PIXEL;
                Graph.render();
                break;
        }
    },

    //масштабирование по OX и OY
    zoom: function (e) {
        var plus = 107, //клавиша + на нумпаде
            plusS = 187, //клавиша =
            minus = 109, //клавиша - на нумпаде
            minusS = 189, //клавиша -
            power = 1.1, //степень зума
            PPP = 100, //PIXEL_PER_POINT
            stepPPP = 10, //шаг приращения к PIXEL_PER_POINT
            key = (e.deltaY) ? e.type : e.keyCode;
        key = (!key) ? e.type : key;

        switch (key) {
            case plus :
            case plusS :
                Graph.zoomIn(e, power, PPP, stepPPP);
                break;
            case minus :
            case minusS :
                Graph.zoomOut(e, power, PPP, stepPPP);
                break;
            case 'wheel' :
                if (e.deltaY < 0 && (e.clientX - Graph.MARGIN) > 0 && (e.clientX - Graph.MARGIN) < Graph.WIDTH - 2 * Graph.MARGIN && Graph.realY(e.clientY) > 0 && Graph.realY(e.clientY) < Graph.HEIGHT - 2 * Graph.MARGIN)
                    Graph.zoomIn(e, power, PPP, stepPPP, true);
                else if (e.deltaY > 0 && (e.clientX - Graph.MARGIN) > 0 && (e.clientX - Graph.MARGIN) < Graph.WIDTH - 2 * Graph.MARGIN && Graph.realY(e.clientY) > 0 && Graph.realY(e.clientY) < Graph.HEIGHT - 2 * Graph.MARGIN)
                    Graph.zoomOut(e, power, PPP, stepPPP, true);
                break;
            case 'dblclick' :
                Graph.zoomIn(e, power, PPP, stepPPP, true);
                break;
        }
    },

    //функция увеличения масштаба графика
    zoomIn: function (e, power, PPP, stepPPP, flag) {
        var maxZoom = 20, //максимальный зум
            maxPPP = 150, //максимальная величина PIXEL_PER_POINT
            tmpX = (Graph.LAST_MS - Graph.START_MS);
        if (flag) {
            Graph.CurrentZoom = (Graph.CurrentZoom < maxZoom) ? Graph.CurrentZoom + 1 : Graph.CurrentZoom;
            var aX = e.clientX - Graph.MARGIN, //длинна от нуля до курсора по ОХ
                aY = Graph.realY(e.clientY), //длинна от нуля до курсора по OY
                cX = Graph.START_MS + aX * Graph.MS_PER_PIXEL, //координата курсора по ОХ
                cY = Graph.START_UNITS + aY * Graph.UNITS_PER_PIXEL; //координата курсора по OY
            // if (tmpX < (Graph.OX_MS - 0.01 * Graph.OX_MS)) {
            //     aX = tmpX/Graph.MS_PER_PIXEL;
            //     cX = tmpX;
            // }
            var ratioX = aX / (Graph.WIDTH - 2 * Graph.MARGIN), //отношение аХ к длинне оси ОХ
                ratioY = aY / (Graph.HEIGHT - 2 * Graph.MARGIN); //отношение аY к длинне OY
            Graph.MS_PER_PIXEL = Graph.INIT_MS_PER_PIXEL * Math.pow(power, -Graph.CurrentZoom);
            Graph.UNITS_PER_PIXEL = Math.floor(Graph.INIT_UNIT_PER_PIXEL * Math.pow(power, -Graph.CurrentZoom));
            Graph.OX_MS = (Graph.WIDTH - 2 * Graph.MARGIN) * Graph.MS_PER_PIXEL;
            Graph.OY_MS = (Graph.HEIGHT - 2 * Graph.MARGIN) * Graph.UNITS_PER_PIXEL;
            Graph.START_MS = cX - Graph.OX_MS * ratioX;
            Graph.START_UNITS = cY - Graph.OY_MS * ratioY;
            Graph.PX_PER_POINT = (Graph.PX_PER_POINT === maxPPP || Graph.CurrentZoom === maxZoom) ? PPP : Graph.PX_PER_POINT + stepPPP;
            Graph.SPEED += 0.1;
            Graph.render();
        }
        else {
            Graph.CurrentZoom = (Graph.CurrentZoom < maxZoom) ? Graph.CurrentZoom + 1 : Graph.CurrentZoom;
            Graph.MS_PER_PIXEL = Graph.INIT_MS_PER_PIXEL * Math.pow(power, -Graph.CurrentZoom);
            Graph.UNITS_PER_PIXEL = Math.floor(Graph.INIT_UNIT_PER_PIXEL * Math.pow(power, -Graph.CurrentZoom));
            Graph.OX_MS = (Graph.WIDTH - 2 * Graph.MARGIN) * Graph.MS_PER_PIXEL;
            Graph.PX_PER_POINT = (Graph.PX_PER_POINT === maxPPP || Graph.CurrentZoom === maxZoom) ? PPP : Graph.PX_PER_POINT + stepPPP;
            Graph.SPEED += 0.1;
            Graph.render();
        }
    },

    //функция уменьшения масштаба графика
    zoomOut: function (e, power, PPP, stepPPP, flag) {
        var minZoom = -20, //минимальный зум
            minPPP = 80; //минимальная величина PIXEL_PER_POINT
        if (flag) {
            Graph.CurrentZoom = (Graph.CurrentZoom > minZoom) ? Graph.CurrentZoom - 1 : Graph.CurrentZoom;

            var aX = e.clientX - Graph.MARGIN, //длинна от нуля до курсора по ОХ
                aY = Graph.realY(e.clientY), //длинна от нуля до курсора по OY
                cX = Graph.START_MS + aX * Graph.MS_PER_PIXEL, //координата курсора по ОХ
                cY = Graph.START_UNITS + aY * Graph.UNITS_PER_PIXEL, //координата курсора по OY
                ratioX = aX / (Graph.WIDTH - 2 * Graph.MARGIN), //отношение аХ к длинне оси ОХ
                ratioY = aY / (Graph.HEIGHT - 2 * Graph.MARGIN); //отношение аY к длинне OY

            Graph.MS_PER_PIXEL = Graph.INIT_MS_PER_PIXEL * Math.pow(power, -Graph.CurrentZoom);
            Graph.UNITS_PER_PIXEL = Math.floor(Graph.INIT_UNIT_PER_PIXEL * Math.pow(power, -Graph.CurrentZoom));
            Graph.OX_MS = (Graph.WIDTH - 2 * Graph.MARGIN) * Graph.MS_PER_PIXEL;
            Graph.OY_MS = (Graph.HEIGHT - 2 * Graph.MARGIN) * Graph.UNITS_PER_PIXEL;
            Graph.START_MS = cX - Graph.OX_MS * ratioX;
            Graph.START_UNITS = cY - Graph.OY_MS * ratioY;
            Graph.PX_PER_POINT = (Graph.PX_PER_POINT === minPPP || Graph.CurrentZoom === minZoom) ? PPP : Graph.PX_PER_POINT - stepPPP;
            Graph.SPEED -= 0.1;
            Graph.render();
        }
        else {
            Graph.CurrentZoom = (Graph.CurrentZoom > minZoom) ? Graph.CurrentZoom - 1 : Graph.CurrentZoom;
            Graph.MS_PER_PIXEL = Graph.INIT_MS_PER_PIXEL * Math.pow(power, -Graph.CurrentZoom);
            Graph.UNITS_PER_PIXEL = Math.floor(Graph.INIT_UNIT_PER_PIXEL * Math.pow(power, -Graph.CurrentZoom));
            Graph.OX_MS = (Graph.WIDTH - 2 * Graph.MARGIN) * Graph.MS_PER_PIXEL;
            Graph.PX_PER_POINT = (Graph.PX_PER_POINT === minPPP || Graph.CurrentZoom === minZoom) ? PPP : Graph.PX_PER_POINT - stepPPP;
            Graph.SPEED -= 0.1;
            Graph.render();
        }
    },

    //функция для обрабочика событий при нажатии на ЛКМ
    onDown: function (e) {
        if (e.type === 'mousedown') {
            if ((e.clientX - Graph.MARGIN) > 0 && (e.clientX - Graph.MARGIN) < Graph.WIDTH - 2 * Graph.MARGIN && Graph.realY(e.clientY) > 0 && Graph.realY(e.clientY) < Graph.HEIGHT - 2 * Graph.MARGIN) {
                Graph.mouseFlag = true;
                //console.log('туда');
                Graph.cursorPositionX = e.clientX - Graph.MARGIN;
                Graph.cursorPositionY = Graph.realY(e.clientY);
            }
        }
        else if (e.type === 'touchstart') {
            if ((e.touches[0].clientX - Graph.MARGIN) > 0 && (e.touches[0].clientX - Graph.MARGIN) < Graph.WIDTH - 2 * Graph.MARGIN && Graph.realY(e.touches[0].clientY) > 0 && Graph.realY(e.touches[0].clientY) < Graph.HEIGHT - 2 * Graph.MARGIN) {
                Graph.mouseFlag = true;
                //console.log('туда');
                Graph.cursorPositionX = e.touches[0].clientX - Graph.MARGIN;
                Graph.cursorPositionY = Graph.realY(e.touches[0].clientY);
            }
        }
    },

    //функция для обработчика событий при отпускании ЛКМ
    onUp: function (e) {
        if (e.type === 'mouseup') {
            Graph.mouseFlag = false;
            Graph.cursorPositionX = e.clientX - Graph.MARGIN;
            Graph.cursorPositionY = Graph.realY(e.clientY);
        }
        else if (e.type === 'touchend') {
            Graph.mouseFlag = false;
        }
    },

    //функция для обработчика событий при движении мыши
    onMove: function (e) {
        var xMS = 0,
            yUN = 0;
        if (e.type === 'mousemove') {
            if (Graph.mouseFlag) {
                //console.log('x: ' + (e.clientX - Graph.MARGIN) + 'y: ' + Graph.realY(e.clientY));
                xMS = (e.clientX - Graph.MARGIN);
                yUN = Graph.realY(e.clientY);
                //console.log(x,y);
                Graph.dragGraph(xMS, yUN);
            }
        }
        else if (e.type === 'touchmove') {
            if (Graph.mouseFlag) {
                //console.log('x: ' + (e.clientX - Graph.MARGIN) + 'y: ' + Graph.realY(e.clientY));
                xMS = (e.touches[0].clientX - Graph.MARGIN);
                yUN = Graph.realY(e.touches[0].clientY);
                //console.log(x,y);
                Graph.dragGraph(xMS, yUN);
            }
        }
    },

    //передвижение графика
    dragGraph: function (x, y) {
        ///console.log(Graph.cursorPositionX - x, Graph.cursorPositionY - y, x, y);
        var tmpX = (Graph.LAST_MS - Graph.START_MS) / Graph.MS_PER_PIXEL;
        if (tmpX < (Graph.OX_MS - Graph.threshold * Graph.OX_MS) / Graph.MS_PER_PIXEL && Graph.cursorPositionX - x > 0) {
            //console.log('xui');
        }
        else {
            Graph.shiftX += Math.abs(Graph.cursorPositionX - x);
            Graph.shiftY += Math.abs(Graph.cursorPositionY - y);
            //console.log(Graph.shiftX,Graph.shiftY);
            if (Graph.shiftX > 10 && Graph.shiftY > 10) {
                Graph.START_MS += (Graph.cursorPositionX - x) * Graph.MS_PER_PIXEL;
                Graph.START_UNITS += (Graph.cursorPositionY - y) * Graph.UNITS_PER_PIXEL;
                Graph.cursorPositionX = x;
                Graph.cursorPositionY = y;
                Graph.render();
                Graph.shiftX = 0;
                Graph.shiftY = 0;
            }
        }
    },

    //заливает весь холст черным
    resetCanvas: function () {
        Graph.tempCtx.fillStyle = '#000000';
        Graph.tempCtx.fillRect(0, 0, Graph.WIDTH, Graph.HEIGHT);
        //console.log("clear");
    },

    // NE PONYATNO (вызов функций отрисовки графика и меток)
    nowBuilding: false,
    buildData: function () {
        if (Graph.nowBuilding) {
            return;
        }
        Graph.nowBuilding = true;
        Data.getDataFor(this.START_MS, Graph.OX_MS, function (d, start) {
            Graph.START_MS = start;
            Graph.buildLine(d);
            Graph.drawData(d, start);
            Graph.transferImageData();
            Graph.nowBuilding = false;
        });
    },

    //построение диаграммы
    buildLine: function (d) {
        Graph.nowBuilding = true;
        //console.log(d/*, start*/);
        var l = d.x.length,
            ctx = Graph.tempCtx;
        ctx.strokeStyle = '#ff0efc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        //console.log("start", d.x[0], Graph.tsToX(d.x[0]));
        ctx.moveTo(Graph.tsToX(d.x[0]), Graph.unitsToY(d.y[0] - Graph.START_UNITS));
        for (var i = 1; i < l; i++) {
            //console.log("go");
            ctx.lineTo(Graph.tsToX(d.x[i]), Graph.unitsToY(d.y[i] - Graph.START_UNITS));
        }
        //console.log("cancel");
        ctx.stroke();

        Graph.fillMargin();
        Graph.drawAxes();
        Graph.drawGrid();
        Graph.drawMarks();
    },

    //отрисовка меток времени и значений
    drawData: function (d, start) {
        var ctx = Graph.tempCtx,
            stepX = Graph.PX_PER_POINT,
            stepY = Graph.PX_PER_POINT,
            cur_pos = Graph.calculateSectionsOnX(),
            cur_pos_Y = Graph.START_UNITS - Graph.START_UNITS % (Graph.UNITS_PER_PIXEL * Graph.PX_PER_POINT),
            width = Graph.WIDTH - Graph.MARGIN + 6,
            height = Graph.HEIGHT - 2 * Graph.MARGIN + 6,
            realYm18 = Graph.realY(-18),
            realYm36 = Graph.realY(-36),
            realXm8 = Graph.realX(-8),
            unY = Graph.UNITS_PER_PIXEL,
            msX = Graph.MS_PER_PIXEL;
        ctx.font = '13px Arial';
        ctx.fillStyle = '#FFFFFF';

        //отрисовка меток времени
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        while (Graph.realX(cur_pos) < width) {
            ctx.fillText(Data.tsToData(msX * cur_pos + start), Graph.realX(cur_pos), realYm18);
            ctx.fillText(Data.tsToTime(msX * cur_pos + start), Graph.realX(cur_pos), realYm36);
            cur_pos += stepX;
        }

        //отрисовка значений
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        cur_pos = Graph.calculateSectionsOnY();
        if (Graph.START_UNITS > 0)
            cur_pos_Y += (Graph.UNITS_PER_PIXEL * Graph.PX_PER_POINT);
        //console.log(cur_pos_Y+"="+Graph.START_UNITS+"+"+cur_pos+"*"+Graph.UNITS_PER_PIXEL, Graph.START_UNITS);
        while (cur_pos < height) {
            ctx.fillText(cur_pos_Y, realXm8, Graph.realY(cur_pos));
            cur_pos += stepY;
            cur_pos_Y += stepY * unY;
        }

    },

    //заливает верхнюю часть холста что бы график не вылазил за границы????
    fillMargin: function () {
        Graph.tempCtx.fillStyle = '#000000';
        Graph.tempCtx.fillRect(0, 0, Graph.WIDTH, Graph.MARGIN - 1);
        Graph.tempCtx.fillRect(Graph.realX(-1), Graph.realY(-1), Graph.WIDTH, Graph.MARGIN - 1);
    },

    //отрисовка координатных прямых
    drawAxes: function () {
        var realX0 = Graph.realX(0), realY0 = Graph.realY(0),
            ctx = Graph.tempCtx,
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

    //отрисовка сетки
    drawGrid: function () {
        var cur_pos = Graph.calculateSectionsOnX(),
            ctx = Graph.tempCtx,
            margin = Graph.MARGIN,
            height = Graph.HEIGHT - 2 * margin,
            width = Graph.WIDTH - margin,
            realY0 = Graph.realY(0),
            realX0 = Graph.realX(0),
            step = Graph.PX_PER_POINT;
        ctx.lineWidth = 0.5;

        //отрисовка по ОХ
        ctx.beginPath();
        while (Graph.realX(cur_pos) < width) {
            ctx.moveTo(Graph.realX(cur_pos), realY0);
            ctx.lineTo(Graph.realX(cur_pos), margin);
            cur_pos += step;
        }
        ctx.stroke();

        //отрисовка по OY
        cur_pos = Graph.calculateSectionsOnY();
        ctx.beginPath();
        while (cur_pos < height) {
            ctx.moveTo(realX0, Graph.realY(cur_pos));
            ctx.lineTo(width, Graph.realY(cur_pos));
            cur_pos += step;
        }
        ctx.stroke();
    },

    //отрисовка меток на осях
    drawMarks: function () {
        var cur_pos = Graph.calculateSectionsOnX(),
            ctx = Graph.tempCtx,
            width = Graph.WIDTH - Graph.MARGIN - 6,
            realY3 = Graph.realY(3),
            realYm3 = Graph.realY(-3),
            height = Graph.HEIGHT - 2 * Graph.MARGIN - 6,
            realX3 = Graph.realX(3),
            realXm3 = Graph.realX(-3);
        step = Graph.PX_PER_POINT;
        ctx.lineWidth = 2;

        //метки на оси ОХ
        ctx.beginPath();
        while (Graph.realX(cur_pos) < width) {
            ctx.moveTo(Graph.realX(cur_pos), realY3);
            ctx.lineTo(Graph.realX(cur_pos), realYm3);
            cur_pos += step;
        }
        ctx.stroke();

        //метки на оси OY
        cur_pos = Graph.calculateSectionsOnY();
        ctx.beginPath();
        while (cur_pos < height) {
            ctx.moveTo(realXm3, Graph.realY(cur_pos));
            ctx.lineTo(realX3, Graph.realY(cur_pos));
            cur_pos += step;
        }
        ctx.stroke();

        //кружочек в (0,0)
        ctx.beginPath();
        ctx.moveTo(Graph.realX(0), Graph.realY(0));
        ctx.arc(Graph.realX(0), Graph.realY(0), 4, 0, 2 * Math.PI);
        ctx.fill();
    },

    //отрисовывает на главном холсте график
    transferImageData: function () {
        Graph.imageData = Graph.tempCtx.getImageData(0, 0, Graph.WIDTH, Graph.HEIGHT);
        Graph.ctx.putImageData(Graph.imageData, 0, 0);
    },


    //переводит метку времени в координату по X
    tsToX: function (ts) {
        return Graph.realX(ts / Graph.MS_PER_PIXEL);
    },

    //переводит значение по OY в координаты на Y
    unitsToY: function (units) {
        return Graph.realY(units / Graph.UNITS_PER_PIXEL);
    },

    //возращает позицию пикселей в координатаъ canvas
    realX: function (x) {
        return x + Graph.MARGIN;
    },

    //возращает позицию пикселей в координатаъ canvas
    realY: function (y) {
        return Graph.HEIGHT - Graph.MARGIN - y;
    },

    //вычисление первого отступа метки по ОX
    calculateSectionsOnX: function () {
        return Graph.PX_PER_POINT - (Graph.START_MS % (Graph.MS_PER_PIXEL * Graph.PX_PER_POINT)) / Graph.MS_PER_PIXEL;
    },

    //вычисление первого отступа метки по OY
    calculateSectionsOnY: function () {
        var s = Math.abs((Graph.START_UNITS % (Graph.UNITS_PER_PIXEL * Graph.PX_PER_POINT)) / Graph.UNITS_PER_PIXEL);
        if (Graph.START_UNITS > 0) {
            s = Graph.PX_PER_POINT - s;
        }
        return s;
    }
};