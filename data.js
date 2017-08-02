var Data = {

    //подгрузка данных
    getDataFor: function (start, duration, f) {
        if (Data.Cache.containsInterval(start, duration)) {
            Data.Cache.getInterval(start, duration);
        } else {
            Data.Request.getData('data.csv').then(function (response) {
                Data.processData(response, start, duration, f);
                //console.log(Data.Cache.Data);
            });
        }
    },

    processData: function (data, start, duration, f) {
        //console.log(data);

        var arrayX = [],
            arrayY = [],
            end = start + duration,
            l = data.x.length;

        for (var i = 0; i < l; i++) {
            if (data.x[i] >= start && data.x[i] <= end) {
                arrayX.push(data.x[i] - start);
                arrayY.push(data.y[i]);
            }
        }

        var x = new Int32Array(arrayX),
            y = new Int32Array(arrayY);

        arrayX = arrayX.map(function (e) {
            return e + start;
        });
        Data.Cache.save(arrayX, arrayY);

        f({
            x: x,
            y: y
        }, start);

    },

    Request: {
        get: function (url) {
            return new Promise(function (resolve, reject) {

                var req = new XMLHttpRequest();
                req.open('GET', url);

                req.onload = function () {

                    if (req.status === 200) {
                        resolve(req.response);
                    } else {
                        reject(Error(req.statusText));
                    }
                };

                req.onerror = function () {
                    reject(Error("Network Error"));
                };

                req.send();
            });
        },

        //после отправки url получает просто текст из файла и отдаёт на обработку в следующую функцию
        getData: function (url) {
            return Data.Request.get(url).then(Data.Request.parseData);
        },

        //разбирает на два массива
        parseData: function (data) {
            //console.log(data);
            var arr = data.split('\n');
            var l = arr.length - 1;
            var arrayX = [],
                arrayY = [],
                tmp = null;
            for (var i = 1; i < l; i++) {
                tmp = arr[i].split(', ');
                arrayX.push(Number(tmp[0]));
                arrayY.push(Number(tmp[1]));
            }
            //console.log(arrayY);
            //console.log(arrayX);

            return {
                x: arrayX,
                y: arrayY
            };
        }
    },

    //перевод метки времени в формат ГГГГ-ММ-ДД
    tsToData: function (ts) {
        var fullData = new Date(ts),
            year = fullData.getFullYear(),
            month = fullData.getMonth() + 1,
            day = fullData.getDate();

        if (month < 10) month = '0' + month;
        if (day < 10) day = '0' + day;

        return year + '-' + month + '-' + day;
    },

    //перевод метки времени в формат ЧЧ:ММ:СС
    tsToTime: function (ts) {
        var fullData = new Date(ts),
            hours = fullData.getHours(),
            minutes = fullData.getMinutes(),
            seconds = fullData.getSeconds();

        if (hours < 10) hours = '0' + hours;
        if (minutes < 10) minutes = '0' + minutes;
        if (seconds < 10) seconds = '0' + seconds;

        return hours + ':' + minutes + ':' + seconds;
    },

    Cache: {
        containsInterval: function (start, duration) {
            return; //true/false
        },

        getInterval: function (start, duration) {

            //получаем
        },

        save: function (X, Y) {
            //  console.log('L start = ' + Data.Cache.Data.x.length);
            var cond = 0;
            var lstart = Data.Cache.Data.x.length;

            // X - массив иксовых координат точек, которые нужно сохранить
            // Y - соответствующие иксам значения по оси игрек

            // Мы хотим вставить X и Y в кеш, не разрушая упорядоченность точек.

            var seed = 1498000000000;
            console.log((X[0] - seed) + " ..(" + X.length + ").. " + (X[X.length - 1] - seed));
            console.log((this.Data.x[0] - seed) + " ..(" + this.Data.x.length + ").. " + (this.Data.x[this.Data.x.length - 1] - seed));


            if (window.conds) window.conds = [];
            if (this.Data.x.length === 0) {
                //если данных нет в кэше
                console.log(1);
                cond = 1;
                this.Data.x = X;
                this.Data.y = Y;
            }

            else {
                //console.log(2);
                cond = 2;
                var x_start = this.findPoint(X[0]).first,
                    x_end = this.findPoint(X[X.length - 1]).second,
                    tmp = {
                        x: [],
                        y: []
                    };



                if (x_start === -1 && x_end === -1) {
                    // если записываемые данные содержат в себе отрезок, который уже существует
                    console.log(3);
                    cond = 3;
                    tmp.x = X;
                    tmp.y = Y;
                    console.log(Data.Cache.Data);
                }
                else if (x_start === -1) {
                    //если записываемый отрезок строго правее данных в кэше
                    console.log(4);
                    cond = 4;
                    tmp.x = X;
                    tmp.y = Y;
                    tmp.x = tmp.x.concat(this.Data.x.slice(x_end, this.Data.x.length));
                    tmp.y = tmp.y.concat(this.Data.y.slice(x_end, this.Data.y.length));
                }
                else if (x_end === -1) {
                    //если записываемый отрезок строго левее данных в кэше
                    console.log(5);
                    cond = 5;
                    tmp.x = this.Data.x.slice(0, x_start + 1);
                    tmp.y = this.Data.y.slice(0, x_start + 1);
                    tmp.x = tmp.x.concat(X);
                    tmp.y = tmp.y.concat(Y);
                }
                else {
                    //записываемые данные пересекаются, но не содержат данные в кэше
                    console.log(6);
                    console.log(x_start, x_end);


                    cond = 6;

                    tmp.x = this.Data.x.slice(0, x_start + 1);

                    console.log('x_start = ' + x_start + ' element in cache less than element = ' + this.Data.x[x_start] + ' element = ' + X[0]);
                    console.log('last element in tmp = ' + tmp.x[tmp.x.length - 1]);

                    tmp.y = this.Data.y.slice(0, x_start + 1);
                    tmp.x = tmp.x.concat(X);
                    tmp.y = tmp.y.concat(Y);
                    tmp.x = tmp.x.concat(this.Data.x.slice(x_end, Data.Cache.Data.x.length));
                    tmp.y = tmp.y.concat(this.Data.y.slice(x_end, Data.Cache.Data.y.length));
                    //console.log(x_start, Data.Cache.Data.x.length, tmp.x.length);
                    //console.log(tmp.x[x_start+1], tmp.x[x_start+2]);
                }

                this.Data.x = tmp.x;
                this.Data.y = tmp.y;

            }
            if (lstart > this.Data.x.length) {


                console.log("L final = " + this.Data.x.length + " Condition: " + cond);
            }
        },
        //возвращает индекс элемента в кэшированном массиве, который является минимальным из всех, что строго больше переданного первым аргументом
        // (максимальным среди всех, что строго меньше)
        //бинарный поиск
        findPoint: function (point, flag) {
            //point - точка для которой мы ищем индекса, flag - флаг для отслеживания индекса(левое или правое)

            //левый конец (индекс) рассматриваемого на текущей итерации отрезка
            var start = 0,
                //положение конца (правый конец)
                end = Data.Cache.Data.x.length - 1,
                //первое среднее значение (индекс)
                midF = Math.floor((start + end) / 2),
                //второе среднее значение (индекс)
                midS = Math.ceil((start + end) / 2);

            //итератор для незацикливания
            var i = 0;
            var X = Data.Cache.Data.x;

            if (point <= X[0]) {
                if (point < X[0]) {
                    return {first: -1, second: 0};
                }
                return {first: -1, second: 1};
            }
            else if (point >= X[X.length - 1]) {
                if (point > X[X.length - 1]) {
                    return {first: X.length - 1, second: -1};
                }
                else {
                    return {first: X.length - 2, second: -1};
                }
            }
            else {
                while (start < end) {
                    i++;
                    if (i > 200) {
                        //console.log('fh');
                        return -1;
                    }
                    if (midF === midS) {
                        //console.log(midF, midS)
                        midS += 1;
                    }
                    if (point < X[midF]) {
                        //console.log(1)
                        end = midF;
                    }
                    else if (point > X[midS]) {
                        start = midS;
                        //console.log(2);
                    }
                    else {
                        if(point === X[midF]) {
                            return {first: midF-1, second: midS};
                        }
                        else if (point === X[midS]){
                            return {first: midF, second: midS+1};
                        }
                        else  return {first: midF, second: midS};
                    }
                    midF = Math.floor((start + end) / 2);
                    midS = Math.ceil((start + end) / 2);
                }
                return -1;
            }
        },

        Data: {
            x: [],
            y: []
        }
    }
};